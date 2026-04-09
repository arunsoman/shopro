package mls.sho.dms.application.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface PhotoStorageService {
    String uploadPhoto(UUID entityId, MultipartFile file);
    void deletePhoto(String url);
}
