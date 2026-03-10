package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreateCustomerRequest;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.application.dto.crm.CustomerSearchResponse;
import mls.sho.dms.application.dto.crm.UpdateCustomerRequest;
import mls.sho.dms.application.dto.crm.AddDietaryTagRequest;
import mls.sho.dms.application.dto.crm.AddOccasionRequest;
import mls.sho.dms.application.dto.crm.MergeProfilesRequest;
import mls.sho.dms.application.service.crm.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerProfileResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    // Keeping original phone search for backwards compatibility with early frontend
    @GetMapping("/phone")
    public ResponseEntity<CustomerProfileResponse> getCustomerByPhone(@RequestParam String phone) {
        return customerService.getCustomerByPhone(phone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Page<CustomerSearchResponse> searchCustomers(
            @RequestParam(required = false, defaultValue = "") String query,
            Pageable pageable) {
        return customerService.searchCustomers(query, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerProfileResponse> getCustomerById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerProfileResponse> updateCustomer(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<Void> updateNotes(@PathVariable UUID id, @RequestBody String notes) {
        customerService.updateNotes(id, notes);
        return ResponseEntity.noContent().build();
    }

    // --- Dietary Tags ---
    @PostMapping("/{id}/dietary-tags")
    @ResponseStatus(HttpStatus.CREATED)
    public void addDietaryTag(@PathVariable UUID id, @Valid @RequestBody AddDietaryTagRequest request) {
        customerService.addDietaryTag(id, request);
    }

    @DeleteMapping("/{id}/dietary-tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeDietaryTag(@PathVariable UUID id, @PathVariable UUID tagId) {
        customerService.removeDietaryTag(id, tagId);
    }

    // --- Occasions ---
    @PostMapping("/{id}/occasions")
    @ResponseStatus(HttpStatus.CREATED)
    public void addOccasion(@PathVariable UUID id, @Valid @RequestBody AddOccasionRequest request) {
        customerService.addOccasion(id, request);
    }

    @DeleteMapping("/{id}/occasions/{occasionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeOccasion(@PathVariable UUID id, @PathVariable UUID occasionId) {
        customerService.removeOccasion(id, occasionId);
    }

    // --- Merge ---
    @PostMapping("/merge")
    @ResponseStatus(HttpStatus.OK)
    public void mergeProfiles(@Valid @RequestBody MergeProfilesRequest request) {
        customerService.mergeProfiles(request);
    }
}
