package mls.sho.dms.application.service.inventory.ai.parser;

import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.ai.model.DocumentType;
import mls.sho.dms.application.service.inventory.ai.model.LineItem;
import mls.sho.dms.application.service.inventory.ai.model.ParsedDocument;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Arrays;

/**
 * DocumentParser
 *
 * Converts raw OCR text into a structured ParsedDocument.
 */
@Component
@Slf4j
public class DocumentParser {

    private final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    // ── Regex patterns for header fields ─────────────────────────────────
    private static final Pattern P_PO_NUM = Pattern.compile(
            "(?i)(?:PO|purchase\\s*order)\\s*(?:number|no\\.?|#)?\\s*[:\\-]?\\s*([A-Z0-9\\-/]{5,30})",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern P_INV_NUM = Pattern.compile(
            "(?i)(?:invoice|inv)\\s*(?:number|no\\.?|#)?\\s*[:\\-]?\\s*([A-Z0-9\\-/]{5,30})");

    private static final Pattern P_GRN_NUM = Pattern.compile(
            "(?i)(?:GRN|goods\\s*received)\\s*(?:number|no\\.?|#)?\\s*[:\\-]?\\s*([A-Z0-9\\-/]{5,30})");

    private static final Pattern P_DATE = Pattern.compile(
            "(?i)(?:date|dated)\\s*[:\\-]?\\s*" +
            "(\\d{1,2}[\\s/\\-](?:[A-Za-z]+|\\d{1,2})[\\s/\\-]\\d{2,4})");

    private static final Pattern P_TOTAL = Pattern.compile(
            "(?i)(?:grand\\s*total|total\\s*amount|net\\s*payable|total)\\s*[:\\-]?\\s*" +
            "[₹$\\s]*([\\d,]+(?:\\.\\d{1,2})?)");

    private static final Pattern P_SUBTOTAL = Pattern.compile(
            "(?i)(?:subtotal|sub\\s*total)\\s*[:\\-]?\\s*[₹$\\s]*([\\d,]+(?:\\.\\d{1,2})?)");

    private static final Pattern P_TAX = Pattern.compile(
            "(?i)(?:gst|tax|cgst|sgst|igst|vat)\\s*(?:@[\\s\\d.%]+)?\\s*[:\\-]?\\s*" +
            "[₹$\\s]*([\\d,]+(?:\\.\\d{1,2})?)");

    private static final Pattern P_SUPPLIER = Pattern.compile(
            "(?i)(?:supplier|vendor|from|sold\\s*by)\\s*[:\\-]?\\s*(.{5,60})");

    private static final Pattern P_REF_PO = Pattern.compile(
            "(?i)(?:PO\\s*ref(?:erence)?|against\\s*PO|ref\\s*PO)\\s*[:\\-]?\\s*([A-Z0-9\\-/]{5,30})");

    private static final Pattern P_LINE_ITEM = Pattern.compile(
            "^\\s*(.{3,60})\\s+" +                             // description
            "(?:(kg|litre|ltr|pcs|bunch|piece|unit|box|pack|ea)\\s+)??" + // optional unit (lazy)
            "([\\d,]+(?:\\.\\d{1,3})?)\\s+" +               // qty
            "[₹$]?([\\d,]+(?:\\.\\d{1,2})?)\\s+" +          // unit price
            "[₹$]?([\\d,]+(?:\\.\\d{1,2})?)\\s*$",          // total amount
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    private static final List<String> BLACKLIST = List.of(
            "account", "bank", "gstin", "number", "invoice", "date",
            "total", "subtotal", "payable", "amount", "phone", "email",
            "address", "supplier", "vendor", "signed", "received", "page"
    );

    private static final LevenshteinDistance LEVENSHTEIN = new LevenshteinDistance(5);

    public ParsedDocument parse(String ocrText, List<Map<String, Object>> structured, DocumentType type) {
        ParsedDocument doc = new ParsedDocument();
        doc.setType(type);
        doc.setRawOcrText(ocrText);

        String text = normalise(ocrText);

        doc.setDocumentId(extractDocumentId(text, type));
        doc.setSupplierName(extractFirst(P_SUPPLIER, text));
        doc.setDocumentDate(extractFirst(P_DATE, text));
        doc.setReferencePoNumber(extractFirst(P_REF_PO, text));
        doc.setGrandTotal(parseAmount(extractFirst(P_TOTAL, text)));
        doc.setSubtotal(parseAmount(extractFirst(P_SUBTOTAL, text)));
        doc.setTaxAmount(parseAmount(extractFirst(P_TAX, text)));

        List<LineItem> items = new ArrayList<>();
        
        // Mode 1: Parse from Structured JSON (Highest Priority)
        if (structured != null && !structured.isEmpty()) {
            items = extractFromStructured(structured);
        }
        
        // Mode 2: Parse from HTML Tables in Markdown
        if (items.isEmpty()) {
            items = extractHtmlTableItems(text);
        }
        
        // Mode 3: Parse from Markdown Pipe Tables
        if (items.isEmpty()) {
            items = extractMarkdownTableItems(text);
        }
        
        // Mode 4: Regex Fallback
        if (items.isEmpty()) {
            items = extractLineItems(text);
        }
        
        if (items.isEmpty()) {
            log.info("{} extraction returned 0 items. Falling back to structured parse.", type);
            items = fallbackLineItemParse(text);
        }
        
        items = deduplicateItems(items);
        for (LineItem item : items) {
            doc.addLineItem(item);
        }

        log.debug("Parsed {} document with {} items and total {}", type, doc.getLineItems().size(), doc.getGrandTotal());
        return doc;
    }

    private List<LineItem> extractFromStructured(List<Map<String, Object>> structured) {
        List<LineItem> items = new ArrayList<>();
        int lineNo = 1;
        for (Map<String, Object> element : structured) {
            if ("table".equals(element.get("label"))) {
                String content = (String) element.get("content");
                if (content != null && content.contains("<table>")) {
                    items.addAll(parseHtmlTable(content, lineNo));
                    lineNo = items.size() + 1;
                } else if (content != null && content.contains("|")) {
                    items.addAll(parsePipeTable(content, lineNo));
                    lineNo = items.size() + 1;
                }
            }
        }
        return items;
    }

    private List<LineItem> extractHtmlTableItems(String text) {
        List<LineItem> items = new ArrayList<>();
        Pattern p = Pattern.compile("<table>.*?</table>", Pattern.DOTALL);
        Matcher m = p.matcher(text);
        int lineNo = 1;
        while (m.find()) {
            items.addAll(parseHtmlTable(m.group(), lineNo));
            lineNo = items.size() + 1;
        }
        return items;
    }

    private List<LineItem> parseHtmlTable(String html, int startLineNo) {
        List<LineItem> items = new ArrayList<>();
        // Simple heuristic parser for HTML tables since we don't have Jsoup
        String[] rows = html.split("</tr>");
        int lineNo = startLineNo;
        for (String row : rows) {
            if (row.toLowerCase().contains("<th>") || row.toLowerCase().contains("item description") || row.toLowerCase().contains("subtotal")) {
                continue;
            }
            
            String[] cells = row.split("</td>");
            List<String> cleanCells = Arrays.stream(cells)
                .map(c -> c.replaceAll("<[^>]*>", "").trim())
                .filter(c -> !c.isEmpty())
                .toList();
                
            if (cleanCells.size() >= 3) {
                LineItem item = createItemFromCells(cleanCells, lineNo++);
                if (item != null) items.add(item);
            }
        }
        return items;
    }

    private List<LineItem> parsePipeTable(String content, int startLineNo) {
        List<LineItem> items = new ArrayList<>();
        String[] lines = content.split("\n");
        int lineNo = startLineNo;
        for (String line : lines) {
            if (!line.contains("|") || line.contains("---") || line.toLowerCase().contains("description")) continue;
            String[] parts = line.split("\\|");
            List<String> cleanCells = Arrays.stream(parts)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
            if (cleanCells.size() >= 3) {
                LineItem item = createItemFromCells(cleanCells, lineNo++);
                if (item != null) items.add(item);
            }
        }
        return items;
    }

    private LineItem createItemFromCells(List<String> cells, int lineNo) {
        LineItem item = new LineItem();
        item.setDescription(cells.get(0));
        
        List<Double> numbers = new ArrayList<>();
        for (int i = 1; i < cells.size(); i++) {
            double val = parseAmount(cells.get(i));
            if (val > 0) numbers.add(val);
        }
        
        if (numbers.size() >= 2) {
            item.setQuantity(numbers.get(0));
            item.setUnitPrice(numbers.get(1));
            item.setTotalAmount(numbers.size() > 2 ? numbers.get(2) : numbers.get(0) * numbers.get(1));
            item.setUnit("unit");
            item.setLineNumber(lineNo);
            
            if (!isBlacklisted(item.getDescription())) {
                return item;
            }
        }
        return null;
    }

    public ParsedDocument parse(String ocrText, DocumentType type) {
        return parse(ocrText, null, type);
    }

    private String extractDocumentId(String text, DocumentType type) {
        Pattern p = switch (type) {
            case PURCHASE_ORDER -> P_PO_NUM;
            case INVOICE        -> P_INV_NUM;
            case GRN            -> P_GRN_NUM;
        };
        String id = extractFirst(p, text);
        if (id == null && type != DocumentType.PURCHASE_ORDER) {
            id = extractFirst(P_PO_NUM, text);
        }
        return id != null ? id.trim() : "UNKNOWN";
    }

    private String extractFirst(Pattern p, String text) {
        Matcher m = p.matcher(text);
        return m.find() ? m.group(1).trim() : null;
    }

    private double parseAmount(String raw) {
        if (raw == null || raw.isBlank()) return 0.0;
        try {
            return Double.parseDouble(raw.replaceAll("[,₹$\\s]", ""));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private List<LineItem> extractLineItems(String text) {
        List<LineItem> items = new ArrayList<>();
        Matcher m = P_LINE_ITEM.matcher(text);
        int lineNo = 1;
        while (m.find()) {
            LineItem item = new LineItem();
            item.setDescription(m.group(1).trim());
            item.setUnit(m.group(2) != null ? m.group(2).trim().toLowerCase() : "unit");
            item.setQuantity(parseAmount(m.group(3)));
            item.setUnitPrice(parseAmount(m.group(4)));
            item.setTotalAmount(parseAmount(m.group(5)));
            item.setLineNumber(lineNo++);

            if (item.getQuantity() > 0 && item.getUnitPrice() > 0 && !isBlacklisted(item.getDescription())) {
                items.add(item);
            }
        }
        return items;
    }

    private List<LineItem> extractMarkdownTableItems(String text) {
        List<LineItem> items = new ArrayList<>();
        // Look for markdown tables: | desc | unit | qty | price | total |
        String[] lines = text.split("\n");
        int lineNo = 1;
        for (String line : lines) {
            if (line.contains("|") && (line.split("\\|").length >= 4)) {
                String[] parts = line.split("\\|");
                // Skip header or separator rows (e.g. | --- | --- |)
                if (line.contains("---") || line.toLowerCase().contains("description") || line.toLowerCase().contains("item")) {
                    continue;
                }
                
                try {
                    // Try to find columns for Description, Qty, Unit Price, Total
                    // Often structured as: | Index | Description | Qty | Price | Total |
                    // We'll be flexible and look for numeric columns
                    List<String> cleanParts = Arrays.stream(parts)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
                        
                    if (cleanParts.size() >= 3) {
                        LineItem item = new LineItem();
                        item.setDescription(cleanParts.get(0));
                        
                        // Heuristic: identify numeric parts
                        List<Double> numbers = new ArrayList<>();
                        for (int i = 1; i < cleanParts.size(); i++) {
                            double val = parseAmount(cleanParts.get(i));
                            if (val > 0) numbers.add(val);
                        }
                        
                        if (numbers.size() >= 2) {
                            item.setQuantity(numbers.get(0));
                            item.setUnitPrice(numbers.get(1));
                            item.setTotalAmount(numbers.size() > 2 ? numbers.get(2) : numbers.get(0) * numbers.get(1));
                            item.setUnit("unit");
                            item.setLineNumber(lineNo++);
                            
                            if (!isBlacklisted(item.getDescription())) {
                                items.add(item);
                            }
                        }
                    }
                } catch (Exception e) {
                    // Skip malformed table rows
                }
            }
        }
        return items;
    }

    private boolean isBlacklisted(String desc) {
        if (desc == null) return true;
        String lower = desc.toLowerCase();
        return BLACKLIST.stream().anyMatch(lower::contains);
    }

    private List<LineItem> fallbackLineItemParse(String text) {
        List<LineItem> items = new ArrayList<>();
        String[] lines = text.split("\n");
        Pattern numLine = Pattern.compile(
                "([\\d,]+(?:\\.\\d{1,2})?)\\s+([\\d,]+(?:\\.\\d{1,2})?)\\s+([\\d,]+(?:\\.\\d{1,2})?)");

        int lineNo = 1;
        for (int i = 0; i < lines.length - 1; i++) {
            String desc = lines[i].trim();
            if (desc.length() < 4 || desc.length() > 60) continue;
            if (desc.matches(".*\\d{3,}.*")) continue;

            Matcher nm = numLine.matcher(lines[i + 1].trim());
            if (nm.find()) {
                LineItem item = new LineItem();
                item.setDescription(desc);
                item.setUnit("unit");
                item.setQuantity(parseAmount(nm.group(1)));
                item.setUnitPrice(parseAmount(nm.group(2)));
                item.setTotalAmount(parseAmount(nm.group(3)));
                item.setLineNumber(lineNo++);
                if (item.getQuantity() > 0 && item.getUnitPrice() > 0 && !isBlacklisted(item.getDescription())) {
                    items.add(item);
                }
                i++;
            }
        }
        return items;
    }

    private List<LineItem> deduplicateItems(List<LineItem> items) {
        List<LineItem> unique = new ArrayList<>();
        for (LineItem candidate : items) {
            boolean isDuplicate = false;
            for (LineItem existing : unique) {
                String a = candidate.getNormalizedDescription();
                String b = existing.getNormalizedDescription();
                Integer dist = LEVENSHTEIN.apply(a, b);
                if (dist != null && dist <= 3
                        && Math.abs(candidate.getQuantity() - existing.getQuantity()) < 0.01) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) unique.add(candidate);
        }
        return unique;
    }

    private String normalise(String raw) {
        if (raw == null) return "";
        return raw
                .replaceAll("(?<=\\d)[lI|](?=\\d)", "1")
                .replaceAll("(?<=\\d)[O](?=\\d)", "0")
                .replaceAll("(?im)^\\s*Page\\s+\\d+\\s+of\\s+\\d+\\s*$", "")
                .replaceAll("(?im)^\\s*-{3,}\\s*$", "")
                .replaceAll("[ \\t]+", " ")
                .replaceAll("\\r\\n?", "\n");
    }
}
