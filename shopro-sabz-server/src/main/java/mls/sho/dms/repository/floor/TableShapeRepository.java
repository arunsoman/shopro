package mls.sho.dms.repository.floor;

import mls.sho.dms.entity.floor.Section;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.floor.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TableShapeRepository extends JpaRepository<TableShape, UUID> {

    @Query("SELECT t FROM TableShape t JOIN FETCH t.section")
    List<TableShape> findAllWithSection();

    List<TableShape> findBySectionOrderByNameAsc(Section section);

    boolean existsBySectionAndNameIgnoreCase(Section section, String name);

    Optional<TableShape> findByIdAndStatus(UUID id, TableStatus status);

    Optional<TableShape> findByNameIgnoreCase(String name);

    @Query("SELECT COUNT(t) FROM TableShape t WHERE t.section = :section")
    long countBySection(@Param("section") Section section);
}
