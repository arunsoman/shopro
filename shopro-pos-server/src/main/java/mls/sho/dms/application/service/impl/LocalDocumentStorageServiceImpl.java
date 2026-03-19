package mls.sho.dms.application.service.impl;

import jakarta.annotation.PostConstruct;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.service.DocumentStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalDocumentStorageServiceImpl implements DocumentStorageService {

    @Value("${app.upload.invoices:uploads/invoices}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize invoice storage directory", e);
        }
    }

    @Override
    public UUID uploadDocument(MultipartFile file) {
        UUID fileId = UUID.randomUUID();
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // We store the file as UUID.extension
        String filename = fileId + extension;
        Path filePath = Paths.get(uploadDir).resolve(filename);

        try {
            Files.copy(file.getInputStream(), filePath);
            return fileId;
        } catch (IOException e) {
            throw new BusinessRuleException("Failed to store document: " + e.getMessage());
        }
    }

    @Override
    public InputStream downloadDocument(UUID fileId) {
        // Since we don't know the extension easily without metadata, 
        // we'll search for the file starting with the UUID in the directory
        try {
            Path file = Files.list(Paths.get(uploadDir))
                    .filter(path -> path.getFileName().toString().startsWith(fileId.toString()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessRuleException("Document not found: " + fileId));
            
            return new FileInputStream(file.toFile());
        } catch (IOException e) {
            throw new BusinessRuleException("Failed to retrieve document: " + e.getMessage());
        }
    }

    @Override
    public void deleteDocument(UUID fileId) {
        try {
            Files.list(Paths.get(uploadDir))
                    .filter(path -> path.getFileName().toString().startsWith(fileId.toString()))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            // Log and continue
                        }
                    });
        } catch (IOException e) {
            // Log warning
        }
    }

    @Override
    public String getFilename(UUID fileId) {
        try {
            return Files.list(Paths.get(uploadDir))
                    .filter(path -> path.getFileName().toString().startsWith(fileId.toString()))
                    .map(path -> path.getFileName().toString())
                    .findFirst()
                    .orElse(fileId.toString());
        } catch (IOException e) {
            return fileId.toString();
        }
    }
}
