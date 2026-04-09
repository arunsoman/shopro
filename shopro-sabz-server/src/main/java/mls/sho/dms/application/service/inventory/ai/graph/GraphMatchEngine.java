package mls.sho.dms.application.service.inventory.ai.graph;

import mls.sho.dms.application.service.inventory.ai.model.*;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * GraphMatchEngine
 */
@Component
public class GraphMatchEngine {

    private static final double DISTANCE_THRESHOLD = 0.40;
    private static final double PRICE_VARIANCE_PCT = 2.0;
    private static final double QTY_TOLERANCE = 0.01;

    private static final LevenshteinDistance LEV = new LevenshteinDistance(8);

    public MatchResult align(DocumentGraph poGraph,
                             DocumentGraph invoiceGraph,
                             DocumentGraph grnGraph) {

        MatchResult result = new MatchResult();

        ParsedDocument po  = poGraph.getDocument();
        ParsedDocument inv = invoiceGraph.getDocument();
        ParsedDocument grn = grnGraph.getDocument();

        result.setPoNumber(po.getDocumentId());
        result.setInvoiceNumber(inv.getDocumentId());
        result.setGrnNumber(grn.getDocumentId());
        result.setPoTotal(po.getGrandTotal());
        result.setInvoiceTotal(inv.getGrandTotal());
        result.setGrnApprovedTotal(grn.getGrandTotal());

        String poRef = po.getDocumentId();
        result.setPoRefMatchesInvoice(refMatches(poRef, inv.getReferencePoNumber()));
        result.setPoRefMatchesGrn(refMatches(poRef, grn.getReferencePoNumber()));

        List<LineItem> poItems  = po.getLineItems();
        List<LineItem> invItems = inv.getLineItems();
        List<LineItem> grnItems = grn.getLineItems();

        Map<String, double[]> poEmbed  = poGraph.getEmbeddingsByPrefix("ITEM:");
        Map<String, double[]> invEmbed = invoiceGraph.getEmbeddingsByPrefix("ITEM:");
        Map<String, double[]> grnEmbed = grnGraph.getEmbeddingsByPrefix("ITEM:");

        int[][] poInvAssignment = hungarianAlign(poItems, invItems, poEmbed, invEmbed);
        int[][] poGrnAssignment = hungarianAlign(poItems, grnItems, poEmbed, grnEmbed);

        Set<Integer> matchedInvIdx = new HashSet<>();
        Set<Integer> matchedGrnIdx = new HashSet<>();

        for (int[] pair : poInvAssignment) {
            int pi = pair[0];
            int ii = pair[1];

            LineItem poItem  = pi >= 0 && pi < poItems.size()  ? poItems.get(pi)  : null;
            LineItem invItem = ii >= 0 && ii < invItems.size() ? invItems.get(ii) : null;

            int gi = -1;
            for (int[] gPair : poGrnAssignment) {
                if (gPair[0] == pi) { gi = gPair[1]; break; }
            }
            LineItem grnItem = gi >= 0 && gi < grnItems.size() ? grnItems.get(gi) : null;

            MatchPair mp = buildMatchPair(poItem, invItem, grnItem, poGraph, invoiceGraph, grnGraph);
            result.addMatchedPair(mp);

            if (ii >= 0) matchedInvIdx.add(ii);
            if (gi >= 0) matchedGrnIdx.add(gi);
        }

        for (int i = 0; i < invItems.size(); i++) {
            if (!matchedInvIdx.contains(i)) {
                MatchPair mp = new MatchPair();
                mp.setInvoiceItem(invItems.get(i));
                mp.setStatus(MatchStatus.EXTRA_IN_INV);
                mp.setRemark("Item present on invoice but not on PO — possible phantom charge");
                result.addMatchedPair(mp);
            }
        }

        result.setVarianceAmount(po.getGrandTotal() - inv.getGrandTotal());
        result.setOverallStatus(computeOverallStatus(result));

        return result;
    }

    private int[][] hungarianAlign(List<LineItem> poItems, List<LineItem> targetItems,
                                   Map<String, double[]> poEmbed,
                                   Map<String, double[]> targetEmbed) {

        int n = poItems.size();
        int m = targetItems.size();
        if (n == 0) return new int[0][2];

        int size = Math.max(n, m);
        double[][] cost = new double[size][size];
        double INF = 1e9;

        for (int i = 0; i < size; i++) Arrays.fill(cost[i], INF);

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                double embeddingDist = embeddingCost(poItems.get(i), targetItems.get(j), poEmbed, targetEmbed);
                double levenshteinDist = levenshteinCost(poItems.get(i), targetItems.get(j));
                cost[i][j] = 0.7 * embeddingDist + 0.3 * levenshteinDist;
            }
            for (int j = m; j < size; j++) cost[i][j] = DISTANCE_THRESHOLD + 0.1;
        }
        for (int i = n; i < size; i++) Arrays.fill(cost[i], DISTANCE_THRESHOLD + 0.1);

        int[] assignment = runHungarian(cost, size);

        List<int[]> pairs = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int j = assignment[i];
            if (j < m && cost[i][j] <= DISTANCE_THRESHOLD) {
                pairs.add(new int[]{i, j});
            } else {
                pairs.add(new int[]{i, -1});
            }
        }
        return pairs.toArray(new int[0][2]);
    }

    private int[] runHungarian(double[][] cost, int n) {
        double[] u = new double[n + 1];
        double[] v = new double[n + 1];
        int[] p = new int[n + 1];
        int[] way = new int[n + 1];

        for (int i = 1; i <= n; i++) {
            p[0] = i;
            int j0 = 0;
            double[] minVal = new double[n + 1];
            boolean[] used = new boolean[n + 1];
            Arrays.fill(minVal, Double.MAX_VALUE);

            do {
                used[j0] = true;
                int i0 = p[j0];
                double delta = Double.MAX_VALUE;
                int j1 = -1;

                for (int j = 1; j <= n; j++) {
                    if (!used[j]) {
                        double cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
                        if (cur < minVal[j]) {
                            minVal[j] = cur;
                            way[j] = j0;
                        }
                        if (minVal[j] < delta) {
                            delta = minVal[j];
                            j1 = j;
                        }
                    }
                }

                for (int j = 0; j <= n; j++) {
                    if (used[j]) {
                        u[p[j]] += delta;
                        v[j] -= delta;
                    } else {
                        minVal[j] -= delta;
                    }
                }
                j0 = j1;
            } while (p[j0] != 0);

            do {
                int j1 = way[j0];
                p[j0] = p[j1];
                j0 = j1;
            } while (j0 != 0);
        }

        int[] result = new int[n];
        for (int j = 1; j <= n; j++) {
            if (p[j] != 0) result[p[j] - 1] = j - 1;
        }
        return result;
    }

    private double embeddingCost(LineItem a, LineItem b,
                                 Map<String, double[]> embedA,
                                 Map<String, double[]> embedB) {
        double[] vecA = findEmbedding(a, embedA);
        double[] vecB = findEmbedding(b, embedB);
        if (vecA == null || vecB == null) return 0.5;
        return cosineDistance(vecA, vecB);
    }

    private double[] findEmbedding(LineItem item, Map<String, double[]> embeddings) {
        String key = "ITEM:" + normalise(item.getDescription());
        if (embeddings.containsKey(key)) return embeddings.get(key);
        for (Map.Entry<String, double[]> e : embeddings.entrySet()) {
            if (e.getKey().startsWith("ITEM:")) {
                String candidate = e.getKey().substring(5);
                String target = normalise(item.getDescription());
                if (candidate.contains(target) || target.contains(candidate)) {
                    return e.getValue();
                }
            }
        }
        return null;
    }

    private double levenshteinCost(LineItem a, LineItem b) {
        String na = a.getNormalizedDescription();
        String nb = b.getNormalizedDescription();
        int maxLen = Math.max(na.length(), nb.length());
        if (maxLen == 0) return 0;
        Integer dist = LEV.apply(na, nb);
        return dist == null ? 1.0 : Math.min(1.0, (double) dist / maxLen);
    }

    private double cosineDistance(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        int len = Math.min(a.length, b.length);
        for (int i = 0; i < len; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA < 1e-10 || normB < 1e-10) return 1.0;
        double similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
        return 1.0 - Math.max(-1.0, Math.min(1.0, similarity));
    }

    private MatchPair buildMatchPair(LineItem po, LineItem inv, LineItem grn,
                                     DocumentGraph poG, DocumentGraph invG, DocumentGraph grnG) {
        MatchPair mp = new MatchPair();
        mp.setPoItem(po);
        mp.setInvoiceItem(inv);
        mp.setGrnItem(grn);

        if (po != null && inv != null) {
            double[] vPo = findEmbedding(po, poG.getEmbeddingsByPrefix("ITEM:"));
            double[] vInv = findEmbedding(inv, invG.getEmbeddingsByPrefix("ITEM:"));
            mp.setPoInvoiceDistance(vPo != null && vInv != null ? cosineDistance(vPo, vInv) : 0.5);
        }
        if (po != null && grn != null) {
            double[] vPo = findEmbedding(po, poG.getEmbeddingsByPrefix("ITEM:"));
            double[] vGrn = findEmbedding(grn, grnG.getEmbeddingsByPrefix("ITEM:"));
            mp.setPoGrnDistance(vPo != null && vGrn != null ? cosineDistance(vPo, vGrn) : 0.5);
        }

        if (po != null && inv != null) mp.setQtyDeltaPoInv(inv.getQuantity() - po.getQuantity());
        if (po != null && grn != null) mp.setQtyDeltaPoGrn(grn.getQuantity() - po.getQuantity());

        if (po != null && inv != null && po.getUnitPrice() > 0) {
            double pct = ((inv.getUnitPrice() - po.getUnitPrice()) / po.getUnitPrice()) * 100.0;
            mp.setPriceDeltaPct(pct);
        }

        assignStatus(mp);
        return mp;
    }

    private void assignStatus(MatchPair mp) {
        StringBuilder remarks = new StringBuilder();

        if (mp.getPoItem() == null) {
            mp.setStatus(MatchStatus.MISSING_IN_GRN);
            mp.setRemark("Item not found on PO");
            return;
        }

        boolean hasQtyMismatch = Math.abs(mp.getQtyDeltaPoInv()) > QTY_TOLERANCE
                || Math.abs(mp.getQtyDeltaPoGrn()) > QTY_TOLERANCE;
        boolean hasPriceVariance = Math.abs(mp.getPriceDeltaPct()) > PRICE_VARIANCE_PCT;
        boolean missingInGrn = mp.getGrnItem() == null;
        boolean missingInInv = mp.getInvoiceItem() == null;

        if (missingInGrn) remarks.append("Not recorded in GRN. ");
        if (missingInInv) remarks.append("Not invoiced. ");
        if (hasQtyMismatch) {
            if (mp.getQtyDeltaPoInv() != 0) remarks.append(String.format("Inv qty %+.2f vs PO. ", mp.getQtyDeltaPoInv()));
            if (mp.getQtyDeltaPoGrn() != 0) remarks.append(String.format("GRN qty %+.2f vs PO. ", mp.getQtyDeltaPoGrn()));
        }
        if (hasPriceVariance) remarks.append(String.format("Price %+.1f%% vs PO. ", mp.getPriceDeltaPct()));

        if (missingInGrn) mp.setStatus(MatchStatus.MISSING_IN_GRN);
        else if (missingInInv) mp.setStatus(MatchStatus.MISSING_IN_INV);
        else if (hasPriceVariance) mp.setStatus(MatchStatus.PRICE_VARIANCE);
        else if (hasQtyMismatch) mp.setStatus(MatchStatus.QTY_MISMATCH);
        else mp.setStatus(MatchStatus.MATCHED);

        mp.setRemark(remarks.length() > 0 ? remarks.toString().trim() : "All values match.");
    }

    private String computeOverallStatus(MatchResult result) {
        long anomalyCount = result.getAnomalies().stream()
                .filter(a -> a.getAnomalyScore() >= 0.7).count();
        long mismatchCount = result.getMatchedPairs().stream()
                .filter(p -> p.getStatus() != MatchStatus.MATCHED).count();

        if (anomalyCount > 0) return "FRAUD_RISK";
        if (mismatchCount > 0) return "EXCEPTION";
        return "APPROVED";
    }

    private boolean refMatches(String poId, String ref) {
        if (poId == null || ref == null) return false;
        return poId.equalsIgnoreCase(ref.trim())
                || poId.contains(ref.trim())
                || ref.trim().contains(poId);
    }

    private String normalise(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }
}
