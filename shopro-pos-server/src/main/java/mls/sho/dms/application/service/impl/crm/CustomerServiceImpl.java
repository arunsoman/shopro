package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreateCustomerRequest;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.application.mapper.CustomerMapper;
import mls.sho.dms.application.service.crm.CustomerService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.LoyaltyTier;
import mls.sho.dms.entity.crm.CustomerOccasion;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.LoyaltyTierRepository;
import mls.sho.dms.repository.crm.CustomerDietaryTagRepository;
import mls.sho.dms.repository.crm.CustomerOccasionRepository;
import mls.sho.dms.repository.crm.LoyaltyTransactionRepository;
import mls.sho.dms.repository.crm.GuestFeedbackRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.entity.crm.CustomerDietaryTag;
import mls.sho.dms.application.dto.crm.CustomerSearchResponse;
import mls.sho.dms.application.dto.crm.UpdateCustomerRequest;
import mls.sho.dms.application.dto.crm.AddDietaryTagRequest;
import mls.sho.dms.application.dto.crm.AddOccasionRequest;
import mls.sho.dms.application.dto.crm.MergeProfilesRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerProfileRepository customerRepository;
    private final LoyaltyTierRepository tierRepository;
    private final CustomerDietaryTagRepository dietaryTagRepository;
    private final CustomerOccasionRepository occasionRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final GuestFeedbackRepository feedbackRepository;
    private final OrderTicketRepository orderTicketRepository;
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

    @Override
    @Transactional
    public CustomerProfileResponse updateCustomer(UUID id, UpdateCustomerRequest request) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));

        if (!customer.getPhoneNumber().equals(request.phoneNumber()) &&
            customerRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
            throw new BusinessRuleException("Customer with this phone number already exists");
        }

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setEmail(request.email());
        customer.setPreferenceNotes(request.preferenceNotes());
        customer.setSmsOptIn(request.smsOptIn());
        customer.setEmailOptIn(request.emailOptIn());

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public Page<CustomerSearchResponse> searchCustomers(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return customerRepository.findAllWithTier(pageable).map(customerMapper::toSearchResponse);
        }
        return customerRepository.searchByQuery(query.trim(), pageable)
                .map(customerMapper::toSearchResponse);
    }

    @Override
    @Transactional
    public void addDietaryTag(UUID id, AddDietaryTagRequest request) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));

        boolean exists = customer.getDietaryTags().stream()
                .anyMatch(tag -> tag.getTagType() == request.tagType());

        if (exists) {
            throw new BusinessRuleException("Dietary tag already exists for this customer");
        }

        CustomerDietaryTag tag = new CustomerDietaryTag();
        tag.setCustomerProfile(customer);
        tag.setTagType(request.tagType());
        tag.setCustomDescription(request.customDescription());
        customer.getDietaryTags().add(tag);
        
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void removeDietaryTag(UUID id, UUID tagId) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));
        
        customer.getDietaryTags().removeIf(tag -> tag.getId().equals(tagId));
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void addOccasion(UUID id, AddOccasionRequest request) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));

        boolean exists = customer.getOccasions().stream()
                .anyMatch(occ -> occ.getOccasionType() == request.occasionType());

        if (exists) {
            throw new BusinessRuleException("Occasion type already exists for this customer");
        }

        CustomerOccasion occasion = new CustomerOccasion();
        occasion.setCustomerProfile(customer);
        occasion.setOccasionType(request.occasionType());
        occasion.setOccasionMonth(request.occasionMonth());
        occasion.setOccasionDay(request.occasionDay());
        occasion.setOccasionYear(request.occasionYear());
        customer.getOccasions().add(occasion);

        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void removeOccasion(UUID id, UUID occasionId) {
        CustomerProfile customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));
        
        customer.getOccasions().removeIf(occ -> occ.getId().equals(occasionId));
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void mergeProfiles(MergeProfilesRequest request) {
        if (request.sourceProfileId().equals(request.targetProfileId())) {
            throw new BusinessRuleException("Cannot merge a profile into itself");
        }

        CustomerProfile target = customerRepository.findById(request.targetProfileId())
                .orElseThrow(() -> new BusinessRuleException("Target customer not found"));
        CustomerProfile source = customerRepository.findById(request.sourceProfileId())
                .orElseThrow(() -> new BusinessRuleException("Source customer not found"));

        // 1. Transfer points & spend
        target.setAvailablePoints(target.getAvailablePoints() + source.getAvailablePoints());
        target.setLifetimeSpend(target.getLifetimeSpend().add(source.getLifetimeSpend()));
        target.setVisitCount(target.getVisitCount() + source.getVisitCount());

        if (target.getLastVisitAt() == null || (source.getLastVisitAt() != null && source.getLastVisitAt().isAfter(target.getLastVisitAt()))) {
            target.setLastVisitAt(source.getLastVisitAt());
        }

        // 2. Migrate related data
        transactionRepository.updateCustomerProfile(source, target);
        orderTicketRepository.updateCustomerProfile(source, target);
        feedbackRepository.updateCustomer(source, target);
        
        // 3. Delete source
        customerRepository.delete(source);
        customerRepository.save(target);
    }
}
