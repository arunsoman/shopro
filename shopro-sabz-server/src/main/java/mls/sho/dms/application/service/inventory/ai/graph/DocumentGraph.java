package mls.sho.dms.application.service.inventory.ai.graph;

import mls.sho.dms.application.service.inventory.ai.model.ParsedDocument;
import java.util.HashMap;
import java.util.Map;

/**
 * Placeholder for DocumentGraph.
 * In a full implementation, this would build a JGraphT graph and generate embeddings.
 * For now, we provide a basic structure to satisfy GraphMatchEngine.
 */
public class DocumentGraph {
    private final ParsedDocument document;
    private final Map<String, double[]> embeddings = new HashMap<>();

    public DocumentGraph(ParsedDocument document) {
        this.document = document;
        // Basic heuristic: generate a simple hash-based vector if embeddings are missing
        document.getLineItems().forEach(item -> {
            String key = "ITEM:" + normalise(item.getDescription());
            embeddings.put(key, generateDummyEmbedding(item.getDescription()));
        });
    }

    public ParsedDocument getDocument() {
        return document;
    }

    public Map<String, double[]> getEmbeddingsByPrefix(String prefix) {
        Map<String, double[]> filtered = new HashMap<>();
        embeddings.forEach((k, v) -> {
            if (k.startsWith(prefix)) filtered.put(k, v);
        });
        return filtered;
    }

    private double[] generateDummyEmbedding(String text) {
        double[] vec = new double[16];
        int hash = text.hashCode();
        RandomSource rs = new RandomSource(hash);
        for (int i = 0; i < 16; i++) {
            vec[i] = rs.next();
        }
        return vec;
    }

    private String normalise(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }

    private static class RandomSource {
        private long state;
        public RandomSource(int seed) { this.state = seed; }
        public double next() {
            state ^= (state << 13);
            state ^= (state >>> 17);
            state ^= (state << 5);
            return (double) (state % 1000) / 1000.0;
        }
    }
}
