package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface CustomerService {
    CustomerProfileResponse createCustomer(CreateCustomerRequest request);
    Optional<CustomerProfileResponse> getCustomerByPhone(String phoneNumber);
    CustomerProfileResponse getCustomerById(UUID id);
    void updateNotes(UUID id, String notes);

    // Phase 1 enhancements
    CustomerProfileResponse updateCustomer(UUID id, UpdateCustomerRequest request);
    Page<CustomerSearchResponse> searchCustomers(String query, Pageable pageable);
    void addDietaryTag(UUID id, AddDietaryTagRequest request);
    void removeDietaryTag(UUID id, UUID tagId);
    void addOccasion(UUID id, AddOccasionRequest request);
    void removeOccasion(UUID id, UUID occasionId);
    void mergeProfiles(MergeProfilesRequest request);
}
