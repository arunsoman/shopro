package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreateSegmentRequest;
import mls.sho.dms.application.dto.crm.SegmentResponse;
import mls.sho.dms.application.service.crm.SegmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/segments")
@RequiredArgsConstructor
public class SegmentController {

    private final SegmentService segmentService;

    @PostMapping
    public ResponseEntity<SegmentResponse> createSegment(@Valid @RequestBody CreateSegmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(segmentService.createSegment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SegmentResponse> getSegment(@PathVariable UUID id) {
        return ResponseEntity.ok(segmentService.getSegment(id));
    }

    @GetMapping
    public ResponseEntity<List<SegmentResponse>> getAllSegments() {
        return ResponseEntity.ok(segmentService.getAllSegments());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSegment(@PathVariable UUID id) {
        segmentService.deleteSegment(id);
        return ResponseEntity.noContent().build();
    }
}
