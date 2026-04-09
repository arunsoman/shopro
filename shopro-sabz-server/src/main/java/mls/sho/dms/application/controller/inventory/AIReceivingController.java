package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.service.inventory.ai.AIThreeWayMatchService;
import mls.sho.dms.application.service.inventory.ai.model.MatchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/inventory/ai-receiving")
@RequiredArgsConstructor
public class AIReceivingController {

    private final AIThreeWayMatchService aiMatchService;

    @PostMapping("/match-documents")
    public ResponseEntity<MatchResult> matchDocuments(
            @RequestParam("po") MultipartFile poFile,
            @RequestParam("invoice") MultipartFile invoiceFile,
            @RequestParam("grn") MultipartFile grnFile) throws IOException {

        Path tempDir = Files.createTempDirectory("ai-match-");
        File po = saveToTemp(poFile, tempDir, "po.pdf");
        File inv = saveToTemp(invoiceFile, tempDir, "invoice.pdf");
        File grn = saveToTemp(grnFile, tempDir, "grn.pdf");

        try {
            MatchResult result = aiMatchService.performMatch(po, inv, grn);
            return ResponseEntity.ok(result);
        } finally {
            // Cleanup
            Files.deleteIfExists(po.toPath());
            Files.deleteIfExists(inv.toPath());
            Files.deleteIfExists(grn.toPath());
            Files.deleteIfExists(tempDir);
        }
    }

    private File saveToTemp(MultipartFile file, Path dir, String name) throws IOException {
        Path path = dir.resolve(name);
        Files.copy(file.getInputStream(), path);
        return path.toFile();
    }
}
