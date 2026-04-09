package mls.sho.dms.application.controller.inventory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateBidRequest;
import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.application.dto.inventory.VendorBidResponse;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.entity.inventory.RfqStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/rfqs")
@RequiredArgsConstructor
public class RFQController {

    private final RFQService rfqService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RFQResponse createRfq(@RequestBody @Valid CreateRFQRequest request) {
        return rfqService.createRfq(request);
    }

    @PostMapping("/bid")
    @ResponseStatus(HttpStatus.CREATED)
    public void createBid(@RequestBody @Valid CreateBidRequest request) {
        rfqService.createBid(request);
    }

    @GetMapping
    public List<RFQResponse> getAllRfqs(@RequestParam(required = false) RfqStatus status) {
        return rfqService.getAllRfqs(status);
    }

    @GetMapping("/{id}")
    public RFQResponse getRfqById(@PathVariable UUID id) {
        return rfqService.getRfqById(id);
    }

    @PostMapping("/{id}/bids")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void submitBid(@PathVariable UUID id, @RequestBody @Valid VendorBidRequest request) {
        rfqService.submitBid(id, request);
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable UUID id) {
        rfqService.cancelRfq(id);
    }

    @GetMapping("/{id}/bids")
    public List<VendorBidResponse> getBids(@PathVariable UUID id) {
        return rfqService.getBidsForRfq(id);
    }

    @PostMapping("/bids/{bidId}/award")
    public void awardBid(
            @PathVariable UUID bidId,
            @RequestParam(required = false) UUID staffId) {
        // Default to system actor when staffId is not provided (dev/demo mode)
        UUID actor = staffId != null ? staffId : UUID.fromString("00000000-0000-0000-0000-000000000000");
        rfqService.awardBid(bidId, actor);
    }
}
