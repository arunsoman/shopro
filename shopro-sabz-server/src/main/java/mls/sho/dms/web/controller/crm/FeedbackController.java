package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.FeedbackResponse;
import mls.sho.dms.application.dto.crm.FeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.ServerFeedbackStatsResponse;
import mls.sho.dms.application.dto.crm.SubmitFeedbackRequest;
import mls.sho.dms.application.service.crm.FeedbackService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody SubmitFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submitFeedback(request));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Page<FeedbackResponse>> getCustomerFeedback(
            @PathVariable UUID customerId,
            Pageable pageable) {
        return ResponseEntity.ok(feedbackService.getCustomerFeedback(customerId, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<FeedbackStatsResponse> getOverallStats() {
        return ResponseEntity.ok(feedbackService.getOverallStats());
    }

    @GetMapping("/server-stats")
    public ResponseEntity<List<ServerFeedbackStatsResponse>> getServerStats() {
        return ResponseEntity.ok(feedbackService.getServerStats());
    }
}
