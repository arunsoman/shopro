package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreateSegmentRequest;
import mls.sho.dms.application.dto.crm.SegmentResponse;
import mls.sho.dms.application.dto.crm.SegmentRuleDto;
import mls.sho.dms.application.service.crm.SegmentService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.CustomerSegment;
import mls.sho.dms.entity.crm.SegmentRule;
import mls.sho.dms.repository.crm.CustomerSegmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SegmentServiceImpl implements SegmentService {

    private final CustomerSegmentRepository segmentRepository;

    @Override
    @Transactional
    public SegmentResponse createSegment(CreateSegmentRequest request) {
        if (segmentRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Segment with name " + request.name() + " already exists");
        }

        CustomerSegment segment = new CustomerSegment();
        segment.setName(request.name());
        segment.setDescription(request.description());

        for (SegmentRuleDto ruleDto : request.rules()) {
            SegmentRule rule = new SegmentRule();
            rule.setField(ruleDto.field());
            rule.setOperator(ruleDto.operator());
            rule.setRuleValue(ruleDto.ruleValue());
            segment.addRule(rule);
        }

        CustomerSegment saved = segmentRepository.save(segment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SegmentResponse getSegment(UUID id) {
        return segmentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Segment not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SegmentResponse> getAllSegments() {
        return segmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSegment(UUID id) {
        segmentRepository.deleteById(id);
    }

    @Override
    public boolean evaluateCustomerInSegment(CustomerProfile customer, UUID segmentId) {
        CustomerSegment segment = segmentRepository.findById(segmentId)
                .orElseThrow(() -> new IllegalArgumentException("Segment not found"));
        
        if (!segment.isActive() || segment.getRules().isEmpty()) {
            return false;
        }

        // Basic AND logic evaluator
        for (SegmentRule rule : segment.getRules()) {
            if (!evaluateRule(customer, rule)) {
                return false;
            }
        }
        return true;
    }

    private boolean evaluateRule(CustomerProfile customer, SegmentRule rule) {
        return switch (rule.getField()) {
            case LTV -> {
                BigDecimal value = new BigDecimal(rule.getRuleValue());
                yield switch (rule.getOperator()) {
                    case GREATER_THAN -> customer.getLifetimeSpend().compareTo(value) > 0;
                    case LESS_THAN -> customer.getLifetimeSpend().compareTo(value) < 0;
                    default -> false;
                };
            }
            case TIER -> {
                if (customer.getLoyaltyTier() == null) yield false;
                String tierName = customer.getLoyaltyTier().getName();
                yield switch (rule.getOperator()) {
                    case EQUALS -> tierName.equalsIgnoreCase(rule.getRuleValue());
                    case NOT_EQUALS -> !tierName.equalsIgnoreCase(rule.getRuleValue());
                    default -> false;
                };
            }
            case VISIT_COUNT -> {
                int value = Integer.parseInt(rule.getRuleValue());
                yield switch (rule.getOperator()) {
                    case GREATER_THAN -> customer.getVisitCount() > value;
                    case LESS_THAN -> customer.getVisitCount() < value;
                    case EQUALS -> customer.getVisitCount() == value;
                    default -> false;
                };
            }
            case TAG -> {
                if (customer.getDietaryTags() == null) yield false;
                yield customer.getDietaryTags().stream()
                        .anyMatch(tag -> tag.getTagType().name().equalsIgnoreCase(rule.getRuleValue()));
            }
            default -> false;
        };
    }

    private SegmentResponse mapToResponse(CustomerSegment segment) {
        List<SegmentRuleDto> rules = segment.getRules().stream()
                .map(r -> new SegmentRuleDto(r.getId(), r.getField(), r.getOperator(), r.getRuleValue()))
                .collect(Collectors.toList());
        
        return new SegmentResponse(
                segment.getId(),
                segment.getName(),
                segment.getDescription(),
                segment.isActive(),
                rules,
                segment.getCreatedAt(),
                segment.getUpdatedAt()
        );
    }
}
