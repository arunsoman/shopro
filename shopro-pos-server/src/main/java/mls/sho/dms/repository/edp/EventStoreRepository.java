package mls.sho.dms.repository.edp;

import mls.sho.dms.entity.edp.EventStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventStoreRepository extends JpaRepository<EventStore, Long> {

    @Query("SELECT e FROM EventStore e WHERE e.id > :lastId ORDER BY e.id ASC")
    List<EventStore> findEventsAfter(@Param("lastId") Long lastId);

    @Query("SELECT MAX(e.id) FROM EventStore e")
    Long findMaxId();

    List<EventStore> findByIdGreaterThanOrderByIdAsc(Long id);

    EventStore findByEventId(UUID eventId);
}
