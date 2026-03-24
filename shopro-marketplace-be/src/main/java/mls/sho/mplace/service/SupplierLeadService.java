package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.BidInvitation;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.repository.BidInvitationRepository;
import mls.sho.mplace.repository.QuoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierLeadService {

    private final BidInvitationRepository bidInvitationRepository;
    private final QuoteRepository quoteRepository;

    public List<BidInvitation> getLeadsForSupplier(java.util.UUID supplierId) {
        // In a real scenario, we'd filter by supplier's categories and check if they already quoted
        // For now, return all OPEN bid invitations
        return bidInvitationRepository.findAll().stream()
                .filter(b -> b.getStatus() == BidInvitation.BidStatus.OPEN)
                .collect(Collectors.toList());
    }
}
