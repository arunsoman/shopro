package mls.sho.dms.application.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
import java.io.InputStream;

public interface DocumentStorageService {
    /**
     * Uploads a document and returns a unique file ID.
     */
    UUID uploadDocument(MultipartFile file);

    /**
     * Retrieves the contents of a document.
     */
    InputStream downloadDocument(UUID fileId);

    /**
     * Deletes a document.
     */
    void deleteDocument(UUID fileId);

    /**
     * Gets the original filename of a document.
     */
    String getFilename(UUID fileId);
}
