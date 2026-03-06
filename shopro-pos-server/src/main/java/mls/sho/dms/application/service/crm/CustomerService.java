package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.CreateCustomerRequest;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;

import java.util.Optional;
import java.util.UUID;

public interface CustomerService {
    CustomerProfileResponse createCustomer(CreateCustomerRequest request);
    Optional<CustomerProfileResponse> getCustomerByPhone(String phoneNumber);
    CustomerProfileResponse getCustomerById(UUID id);
    void updateNotes(UUID id, String notes);
}
