package mls.sho.dms.web.controller.kds;

import jakarta.validation.Valid;
import mls.sho.dms.application.dto.kds.KDSStationRequest;
import mls.sho.dms.application.dto.kds.KDSStationResponse;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.service.kds.KDSService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kds/stations")
public class KDSStationController {

    private final KDSService kdsService;

    public KDSStationController(KDSService kdsService) {
        this.kdsService = kdsService;
    }

    @GetMapping
    public List<KDSStationResponse> getAllStations() {
        return kdsService.getAllStations();
    }

    @GetMapping("/{id}")
    public KDSStationResponse getStation(@PathVariable UUID id) {
        return kdsService.getStationById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KDSStationResponse createStation(@Valid @RequestBody KDSStationRequest request) {
        return kdsService.createStation(request);
    }

    @PutMapping("/{id}")
    public KDSStationResponse updateStation(@PathVariable UUID id, @Valid @RequestBody KDSStationRequest request) {
        return kdsService.updateStation(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStation(@PathVariable UUID id) {
        kdsService.deleteStation(id);
    }

    @PatchMapping("/{id}/toggle-status")
    public KDSStationResponse toggleStatus(@PathVariable UUID id) {
        return kdsService.toggleStationStatus(id);
    }

    @GetMapping("/{id}/tickets")
    public List<mls.sho.dms.application.dto.kds.KDSTicketResponse> getActiveTickets(@PathVariable UUID id) {
        return kdsService.getActiveTicketsForStation(id);
    }
}
