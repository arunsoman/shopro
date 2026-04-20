package mls.sho.dms.application.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.analytics.repository.GuestExperimentAssignmentRepository;
import mls.sho.dms.application.pos.entity.TableSession;
import mls.sho.dms.application.engineering.entity.Experiment;
import mls.sho.dms.application.engineering.entity.ExperimentVariant;
import mls.sho.dms.application.engineering.entity.GuestExperimentAssignment;
import mls.sho.dms.entity.users.Guest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExperimentAttributionService {

    private final GuestExperimentAssignmentRepository assignmentRepo;

    @Transactional
    public ExperimentVariant getOrAssignVariant(Experiment experiment, TableSession session) {
        // 1. Resolve Identity (Hybrid Model)
        Guest guest = session.getGuest();
        Long sessionId = session.getId();

        Optional<GuestExperimentAssignment> existing;
        if (guest != null) {
            existing = assignmentRepo.findByGuestGuestIdAndExperimentId(guest.getGuestId(), experiment.getId());
        } else {
            existing = assignmentRepo.findByFallbackSessionIdAndExperimentId(sessionId, experiment.getId());
        }

        if (existing.isPresent()) {
            return existing.get().getVariant();
        }

        // 2. Deterministic Assignment (Hashing)
        ExperimentVariant assignedVariant = assignDeterministic(experiment, guest, sessionId);

        // 3. Persist Assignment
        GuestExperimentAssignment assignment = new GuestExperimentAssignment();
        assignment.setExperiment(experiment);
        assignment.setVariant(assignedVariant);
        assignment.setGuest(guest);
        assignment.setFallbackSessionId(sessionId);
        assignmentRepo.save(assignment);

        log.debug("Assigned {} to variant {} for experiment {}", 
                  guest != null ? "Guest:" + guest.getGuestId() : "Session:" + sessionId, 
                  assignedVariant.getName(), experiment.getExperimentKey());

        return assignedVariant;
    }

    private ExperimentVariant assignDeterministic(Experiment experiment, Guest guest, Long sessionId) {
        // Use a stable identifier for hashing
        String seed = (guest != null) ? guest.getGuestId().toString() : "SES-" + sessionId;
        String combined = experiment.getId().toString() + ":" + seed;
        
        // Simple hash to bucket the assignments
        int hash = Math.abs(combined.hashCode());
        List<ExperimentVariant> variants = experiment.getVariants();
        
        // Use allocation percentages if available, or simple mod if equal
        return variants.get(hash % variants.size());
    }
}
