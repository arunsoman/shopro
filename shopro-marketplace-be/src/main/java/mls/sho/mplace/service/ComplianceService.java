package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.ComplianceDocument;
import mls.sho.mplace.repository.ComplianceDocumentRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final ComplianceDocumentRepository documentRepository;
    private final SecurityUtils securityUtils;

    public List<ComplianceDocument> getMyDocuments() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();

        if (requester.isBuyer()) {
            return documentRepository.findAllByRestaurant_Id(requester.restaurantId());
        } else if (requester.isSupplier()) {
            return documentRepository.findAllBySupplier_Id(requester.supplierId());
        } else {
            return documentRepository.findAll();
        }
    }

    @Transactional
    public ComplianceDocument uploadDocument(ComplianceDocument document) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) throw new RuntimeException("Authentication Required");

        if (requester.isBuyer()) {
            document.setRestaurantId(requester.restaurantId());
        } else if (requester.isSupplier()) {
            document.setSupplierId(requester.supplierId());
        }
        document.setStatus(ComplianceDocument.DocumentStatus.PENDING_REVIEW);
        return documentRepository.save(document);
    }
}
