package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.FeedbackResponse;
import mls.sho.dms.application.dto.crm.FeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.ServerFeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.SubmitFeedbackRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FeedbackService {
    FeedbackResponse submitFeedback(SubmitFeedbackRequest request);
    Page<FeedbackResponse> getCustomerFeedback(UUID customerId, Pageable pageable);
    FeedbackStatsResponse getOverallStats();
    List<ServerFeedbackStatsResponse> getServerStats();
}
