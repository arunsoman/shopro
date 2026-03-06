package mls.sho.dms.application.service.impl;

import jakarta.annotation.PostConstruct;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.service.PhotoStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalPhotoStorageServiceImpl implements PhotoStorageService {

    @Value("${app.upload.dir:uploads/menu-items}")
    private String uploadDir;

    @Value("${app.api.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String uploadPhoto(UUID entityId, MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = entityId + "_" + System.currentTimeMillis() + extension;
        Path filePath = Paths.get(uploadDir).resolve(filename);

        try {
            Files.copy(file.getInputStream(), filePath);
            // Return relative path (will be handled by client or proxied)
            return "/api/v1/media/menu-items/" + filename;
        } catch (IOException e) {
            throw new BusinessRuleException("Failed to store photo: " + e.getMessage());
        }
    }

    @Override
    public void deletePhoto(String url) {
        if (url == null || !url.contains("/media/menu-items/")) return;
        
        String filename = url.substring(url.lastIndexOf("/") + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log warning but don't fail business logic for deletion failure
            System.err.println("Failed to delete photo file: " + filePath);
        }
    }
}
