package mls.sho.dms.application.service.marketplace;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.marketplace.MaskedIdentity;
import mls.sho.dms.repository.marketplace.MaskedIdentityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IdentityMaskingService {

    private final MaskedIdentityRepository repository;
    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public String mask(UUID internalId, MaskedIdentity.IdentityCategory category) {
        return repository.findByInternalId(internalId)
                .map(MaskedIdentity::getMaskedId)
                .orElseGet(() -> {
                    String maskedId = generateUniqueMaskedId();
                    MaskedIdentity identity = new MaskedIdentity();
                    identity.setInternalId(internalId);
                    identity.setMaskedId(maskedId);
                    identity.setCategory(category);
                    repository.save(identity);
                    return maskedId;
                });
    }

    @Transactional(readOnly = true)
    public UUID unmask(String maskedId) {
        return repository.findByMaskedId(maskedId)
                .map(MaskedIdentity::getInternalId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid masked ID: " + maskedId));
    }

    private String generateUniqueMaskedId() {
        String maskedId;
        do {
            maskedId = generateRandomString(8);
        } while (repository.findByMaskedId(maskedId).isPresent());
        return maskedId;
    }

    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
