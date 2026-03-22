package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OperatorRepository extends JpaRepository<Operator, UUID> {
    Optional<Operator> findByEmail(String email);
}
