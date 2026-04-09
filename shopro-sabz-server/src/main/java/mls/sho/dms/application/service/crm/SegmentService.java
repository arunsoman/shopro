package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.CreateSegmentRequest;
import mls.sho.dms.application.dto.crm.SegmentResponse;
import mls.sho.dms.entity.crm.CustomerProfile;

import java.util.List;
import java.util.UUID;

public interface SegmentService {
    SegmentResponse createSegment(CreateSegmentRequest request);
    SegmentResponse getSegment(UUID id);
    List<SegmentResponse> getAllSegments();
    void deleteSegment(UUID id);
    boolean evaluateCustomerInSegment(CustomerProfile customer, UUID segmentId);
}
