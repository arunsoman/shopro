package mls.sho.dms.application.controller.inventory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.entity.inventory.RfqStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/rfqs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development environment matching local dev setup
public class RFQController {

    private final RFQService rfqService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RFQResponse createRfq(@RequestBody @Valid CreateRFQRequest request) {
        return rfqService.createRfq(request);
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
}
