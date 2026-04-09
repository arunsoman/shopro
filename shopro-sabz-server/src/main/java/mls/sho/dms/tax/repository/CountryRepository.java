package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, java.util.UUID> {
    Optional<Country> findByIsoCode(String isoCode);
}
