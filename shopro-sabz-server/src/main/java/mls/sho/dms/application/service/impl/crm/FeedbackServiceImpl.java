package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.FeedbackResponse;
import mls.sho.dms.application.dto.crm.FeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.ServerFeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.SubmitFeedbackRequest;
import mls.sho.dms.application.service.crm.FeedbackService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.GuestFeedback;
import mls.sho.dms.entity.crm.Sentiment;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.GuestFeedbackRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final GuestFeedbackRepository feedbackRepository;
    private final CustomerProfileRepository customerRepository;

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(SubmitFeedbackRequest request) {
        CustomerProfile customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Sentiment sentiment = analyzeSentiment(request.rating());

        GuestFeedback feedback = GuestFeedback.builder()
                .customer(customer)
                .orderId(request.orderId())
                .rating(request.rating())
                .comments(request.comments())
                .sentiment(sentiment)
                .source(request.source())
                .build();

        GuestFeedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getCustomerFeedback(UUID customerId, Pageable pageable) {
        return feedbackRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackStatsResponse getOverallStats() {
        Double avgRating = feedbackRepository.getAverageRating();
        Long total = feedbackRepository.count();
        Long positive = feedbackRepository.countPositiveFeedback();
        Long neutral = feedbackRepository.countNeutralFeedback();
        Long negative = feedbackRepository.countNegativeFeedback();

        Page<GuestFeedback> recentPage = feedbackRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        List<FeedbackResponse> recent = recentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new FeedbackStatsResponse(
                avgRating != null ? avgRating : 0.0,
                total,
                positive,
                neutral,
                negative,
                recent
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServerFeedbackStatsResponse> getServerStats() {
        return feedbackRepository.getServerStats();
    }

    private Sentiment analyzeSentiment(int rating) {
        if (rating >= 4) return Sentiment.POSITIVE;
        if (rating == 3) return Sentiment.NEUTRAL;
        return Sentiment.NEGATIVE;
    }

    private FeedbackResponse mapToResponse(GuestFeedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getCustomer().getId(),
                feedback.getCustomer().getFirstName() + " " + feedback.getCustomer().getLastName(),
                feedback.getOrderId(),
                feedback.getRating(),
                feedback.getComments(),
                feedback.getSentiment(),
                feedback.getSource(),
                feedback.getCreatedAt()
        );
    }
}
