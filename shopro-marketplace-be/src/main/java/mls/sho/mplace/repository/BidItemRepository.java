package mls.sho.mplace.repository;

import mls.sho.mplace.entity.BidItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BidItemRepository extends JpaRepository<BidItem, UUID> {
}
