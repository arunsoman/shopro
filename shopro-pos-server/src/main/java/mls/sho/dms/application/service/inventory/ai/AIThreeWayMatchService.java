package mls.sho.dms.application.service.inventory.ai;

import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.ai.anomaly.IsolationForestDetector;
import mls.sho.dms.application.service.inventory.ai.graph.DocumentGraph;
import mls.sho.dms.application.service.inventory.ai.graph.GraphMatchEngine;
import mls.sho.dms.application.service.inventory.ai.model.DocumentType;
import mls.sho.dms.application.service.inventory.ai.model.MatchResult;
import mls.sho.dms.application.service.inventory.ai.model.ParsedDocument;
import mls.sho.dms.application.service.inventory.ai.ocr.PdfOcrExtractor;
import mls.sho.dms.application.service.inventory.ai.parser.DocumentParser;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * AIThreeWayMatchService
 *
 * High-level service to orchestrate the 3-way matching process using AI/OCR.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIThreeWayMatchService {

    private final PdfOcrExtractor localOcrExtractor;
    private final DocumentParser documentParser;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GraphMatchEngine matchEngine;
    private final IsolationForestDetector anomalyDetector;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String AI_SERVICE_URL = "http://localhost:8000/analyze";

    public MatchResult performMatch(File poFile, File invoiceFile, File grnFile) throws IOException {
        // 1. OCR Extraction (using Python Sidecar)
        Map<String, Object> poResponse = extractWithSidecar(poFile);
        Map<String, Object> invoiceResponse = extractWithSidecar(invoiceFile);
        Map<String, Object> grnResponse = extractWithSidecar(grnFile);

        String poText = (String) poResponse.getOrDefault("full_text", "");
        String invoiceText = (String) invoiceResponse.getOrDefault("full_text", "");
        String grnText = (String) grnResponse.getOrDefault("full_text", "");

        log.info("RAW PO OCR TEXT (GLM): \n{}", poText);
        log.info("RAW INVOICE OCR TEXT (GLM): \n{}", invoiceText);
        log.info("RAW GRN OCR TEXT (GLM): \n{}", grnText);

        // 2. Parsing (Passing structured JSON if available)
        ParsedDocument poDoc = documentParser.parse(poText, (java.util.List<Map<String, Object>>) poResponse.get("structured"), DocumentType.PURCHASE_ORDER);
        ParsedDocument invoiceDoc = documentParser.parse(invoiceText, (java.util.List<Map<String, Object>>) invoiceResponse.get("structured"), DocumentType.INVOICE);
        ParsedDocument grnDoc = documentParser.parse(grnText, (java.util.List<Map<String, Object>>) grnResponse.get("structured"), DocumentType.GRN);

        // 3. Graph Construction & Alignment
        DocumentGraph poGraph = new DocumentGraph(poDoc);
        DocumentGraph invoiceGraph = new DocumentGraph(invoiceDoc);
        DocumentGraph grnGraph = new DocumentGraph(grnDoc);

        MatchResult result = matchEngine.align(poGraph, invoiceGraph, grnGraph);

        // 4. Anomaly Detection
        result.setAnomalies(anomalyDetector.detect(result));

        return result;
    }

    private Map<String, Object> extractWithSidecar(File file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(file));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(AI_SERVICE_URL, requestEntity, Map.class);
            
            if (response != null) {
                if (response.containsKey("structured")) {
                    try {
                        String jsonPretty = objectMapper.writerWithDefaultPrettyPrinter()
                            .writeValueAsString(response.get("structured"));
                        log.info("RAW GLM STRUCTURAL JSON FOR {}: \n{}", file.getName(), jsonPretty);
                    } catch (Exception e) {
                        log.info("RAW GLM STRUCTURAL JSON FOR {}: {}", file.getName(), response.get("structured"));
                    }
                }
                return response;
            }
        } catch (Exception e) {
            log.error("AI Sidecar extraction failed for file {}: {}. Falling back to local OCR.", file.getName(), e.getMessage());
            try {
                String text = localOcrExtractor.extract(file);
                return Map.of("full_text", text);
            } catch (IOException ioException) {
                log.error("Local OCR fallback also failed: {}", ioException.getMessage());
            }
        }
        return Map.of("full_text", "");
    }
}
