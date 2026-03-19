package mls.sho.dms.application.service.inventory.ai.anomaly;

import mls.sho.dms.application.service.inventory.ai.model.*;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * IsolationForestDetector
 *
 * Pure-Java implementation of Isolation Forest for anomaly detection.
 */
@Component
public class IsolationForestDetector {

    private static final int    TREE_COUNT         = 100;
    private static final int    SUBSAMPLE_SIZE     = 256;
    private static final int    MAX_DEPTH          = 8;    // log2(256) ≈ 8
    private static final double ANOMALY_THRESHOLD  = 0.60;
    private static final long   SEED               = 42L;

    // Feature indices
    private static final int F_QTY_DELTA_INV  = 0;
    private static final int F_QTY_DELTA_GRN  = 1;
    private static final int F_PRICE_PCT       = 2;
    private static final int F_EMBED_DIST_INV  = 3;
    private static final int F_EMBED_DIST_GRN  = 4;
    private static final int F_ABS_QTY         = 5;
    private static final int F_ABS_PRICE       = 6;
    private static final int FEATURE_COUNT     = 7;

    public List<AnomalyRecord> detect(MatchResult result) {
        List<MatchPair> pairs = result.getMatchedPairs();
        if (pairs.isEmpty()) return Collections.emptyList();

        // Build feature matrix
        double[][] X = buildFeatureMatrix(pairs);

        // Train forest
        Random rng = new Random(SEED);
        List<IsolationTree> forest = new ArrayList<>();
        for (int t = 0; t < TREE_COUNT; t++) {
            double[][] subsample = subsample(X, SUBSAMPLE_SIZE, rng);
            forest.add(new IsolationTree(subsample, MAX_DEPTH, rng));
        }

        // Score each item
        List<AnomalyRecord> anomalies = new ArrayList<>();
        for (int i = 0; i < pairs.size(); i++) {
            double score = anomalyScore(X[i], forest, X.length);
            if (score >= ANOMALY_THRESHOLD) {
                AnomalyRecord rec = buildRecord(pairs.get(i), score, X[i]);
                anomalies.add(rec);
                pairs.get(i).setStatus(MatchStatus.ANOMALY);
            }
        }

        anomalies.sort((a, b) -> Double.compare(b.getAnomalyScore(), a.getAnomalyScore()));
        return anomalies;
    }

    private double[][] buildFeatureMatrix(List<MatchPair> pairs) {
        double[][] X = new double[pairs.size()][FEATURE_COUNT];
        for (int i = 0; i < pairs.size(); i++) {
            MatchPair p = pairs.get(i);
            X[i][F_QTY_DELTA_INV]  = p.getQtyDeltaPoInv();
            X[i][F_QTY_DELTA_GRN]  = p.getQtyDeltaPoGrn();
            X[i][F_PRICE_PCT]      = p.getPriceDeltaPct();
            X[i][F_EMBED_DIST_INV] = p.getPoInvoiceDistance();
            X[i][F_EMBED_DIST_GRN] = p.getPoGrnDistance();
            X[i][F_ABS_QTY]        = Math.abs(p.getQtyDeltaPoInv());
            X[i][F_ABS_PRICE]      = Math.abs(p.getPriceDeltaPct());
        }
        return X;
    }

    private double anomalyScore(double[] x, List<IsolationTree> forest, int n) {
        double sumPaths = 0;
        for (IsolationTree tree : forest) {
            sumPaths += tree.pathLength(x, 0);
        }
        double avgPath = sumPaths / forest.size();
        double cn      = averagePathLength(n);
        if (cn <= 0) return 0.5;
        return Math.pow(2.0, -avgPath / cn);
    }

    private double averagePathLength(int n) {
        if (n <= 1) return 0;
        if (n == 2) return 1;
        double H = Math.log(n - 1) + 0.5772156649;
        return 2.0 * H - 2.0 * (n - 1.0) / n;
    }

    private double[][] subsample(double[][] X, int size, Random rng) {
        int n = Math.min(size, X.length);
        double[][] sample = new double[n][FEATURE_COUNT];
        int[] indices = rng.ints(0, X.length).distinct().limit(n).toArray();
        for (int i = 0; i < n; i++) {
            System.arraycopy(X[indices[i]], 0, sample[i], 0, FEATURE_COUNT);
        }
        return sample;
    }

    private AnomalyRecord buildRecord(MatchPair pair, double score, double[] features) {
        String desc  = pair.getCanonicalDescription();
        String type  = classifyAnomalyType(features);
        String detail = buildDetail(pair, features, score);
        return new AnomalyRecord(desc, score, type, detail);
    }

    private String classifyAnomalyType(double[] f) {
        double absPrice = Math.abs(f[F_PRICE_PCT]);
        double absQty   = Math.abs(f[F_QTY_DELTA_INV]);
        double dist     = f[F_EMBED_DIST_INV];

        if (absPrice > 5.0)  return "PRICE_SPIKE";
        if (absQty > 0)      return "QTY_MISMATCH";
        if (dist > 0.35)     return "ITEM_MISMATCH";
        return "STATISTICAL_OUTLIER";
    }

    private String buildDetail(MatchPair p, double[] f, double score) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Score: %.3f | ", score));
        if (p.getPoItem() != null && p.getInvoiceItem() != null) {
            if (Math.abs(f[F_QTY_DELTA_INV]) > 0.01)
                sb.append(String.format("Qty delta: %+.2f | ", f[F_QTY_DELTA_INV]));
            if (Math.abs(f[F_PRICE_PCT]) > 0.1)
                sb.append(String.format("Price delta: %+.1f%% | ", f[F_PRICE_PCT]));
        }
        sb.append(String.format("Embedding dist (PO-INV): %.3f", f[F_EMBED_DIST_INV]));
        return sb.toString();
    }

    private static class IsolationTree {
        private final Node root;

        IsolationTree(double[][] data, int maxDepth, Random rng) {
            this.root = buildTree(data, 0, maxDepth, rng);
        }

        double pathLength(double[] x, int depth) {
            return pathLength(root, x, depth);
        }

        private double pathLength(Node node, double[] x, int depth) {
            if (node.isLeaf) {
                return depth + averagePathLen(node.size);
            }
            if (x[node.splitFeature] < node.splitValue) {
                return pathLength(node.left, x, depth + 1);
            } else {
                return pathLength(node.right, x, depth + 1);
            }
        }

        private Node buildTree(double[][] data, int depth, int maxDepth, Random rng) {
            Node node = new Node();
            node.size = data.length;

            if (data.length <= 1 || depth >= maxDepth) {
                node.isLeaf = true;
                return node;
            }

            int featureCount = data[0].length;
            List<Integer> features = new ArrayList<>();
            for (int f = 0; f < featureCount; f++) features.add(f);
            Collections.shuffle(features, rng);

            int chosenFeature = -1;
            double min = 0, max = 0;
            for (int f : features) {
                double[] vals = getColumn(data, f);
                min = Arrays.stream(vals).min().orElse(0);
                max = Arrays.stream(vals).max().orElse(0);
                if (max > min) { chosenFeature = f; break; }
            }

            if (chosenFeature == -1) {
                node.isLeaf = true;
                return node;
            }

            double splitVal = min + rng.nextDouble() * (max - min);
            node.splitFeature = chosenFeature;
            node.splitValue   = splitVal;

            List<double[]> leftData  = new ArrayList<>();
            List<double[]> rightData = new ArrayList<>();
            for (double[] row : data) {
                if (row[chosenFeature] < splitVal) leftData.add(row);
                else                               rightData.add(row);
            }

            if (leftData.isEmpty() || rightData.isEmpty()) {
                node.isLeaf = true;
                return node;
            }

            node.left  = buildTree(leftData.toArray(new double[0][]),  depth + 1, maxDepth, rng);
            node.right = buildTree(rightData.toArray(new double[0][]), depth + 1, maxDepth, rng);
            return node;
        }

        private double[] getColumn(double[][] data, int col) {
            double[] vals = new double[data.length];
            for (int i = 0; i < data.length; i++) vals[i] = data[i][col];
            return vals;
        }

        private double averagePathLen(int n) {
            if (n <= 1) return 0;
            if (n == 2) return 1;
            return 2.0 * (Math.log(n - 1) + 0.5772156649) - 2.0 * (n - 1.0) / n;
        }

        private static class Node {
            boolean isLeaf      = false;
            int     splitFeature = 0;
            double  splitValue   = 0;
            int     size         = 0;
            Node    left, right;
        }
    }
}
