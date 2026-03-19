package mls.sho.dms.web.controller.media;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.service.DocumentStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentStorageService documentStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, UUID>> uploadDocument(@RequestParam("file") MultipartFile file) {
        UUID fileId = documentStorageService.uploadDocument(file);
        return ResponseEntity.ok(Map.of("fileId", fileId));
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID fileId) {
        InputStream is = documentStorageService.downloadDocument(fileId);
        String filename = documentStorageService.getFilename(fileId);
        
        InputStreamResource resource = new InputStreamResource(is);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF) // Assuming PDF for invoices
                .body(resource);
    }
}
