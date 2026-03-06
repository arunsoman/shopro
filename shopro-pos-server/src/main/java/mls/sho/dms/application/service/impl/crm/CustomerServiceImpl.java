package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreateCustomerRequest;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.application.mapper.CustomerMapper;
import mls.sho.dms.application.service.crm.CustomerService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.LoyaltyTier;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.LoyaltyTierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerProfileRepository customerRepository;
    private final LoyaltyTierRepository tierRepository;
    private final CustomerMapper customerMapper;

    @Override
    @Transactional
    public CustomerProfileResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new BusinessRuleException("Customer with this phone number already exists");
        }

        CustomerProfile customer = customerMapper.toEntity(request);
        
        // Assign default Bronze tier
        LoyaltyTier bronzeTier = tierRepository.findByName("BRONZE")
                .orElseThrow(() -> new BusinessRuleException("Default loyalty tier not found"));
        customer.setLoyaltyTier(bronzeTier);

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public Optional<CustomerProfileResponse> getCustomerByPhone(String phoneNumber) {
        return customerRepository.findByPhoneNumber(phoneNumber)
                .map(customerMapper::toResponse);
    }

    @Override
    public CustomerProfileResponse getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .map(customerMapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));
    }

    @Override
    @Transactional
    public void updateNotes(UUID id, String notes) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));
        customer.setPreferenceNotes(notes);
        customerRepository.save(customer);
    }
}
