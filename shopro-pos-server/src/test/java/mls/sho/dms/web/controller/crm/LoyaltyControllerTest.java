package mls.sho.dms.web.controller.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import mls.sho.dms.application.dto.crm.RedeemPointsRequest;
import mls.sho.dms.application.dto.crm.RedeemPointsResponse;
import mls.sho.dms.application.service.crm.LoyaltyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoyaltyController.class)
class LoyaltyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LoyaltyService loyaltyService;

    @Test
    void redeemPoints_ValidRequest_Returns200() throws Exception {
        UUID customerId = UUID.randomUUID();
        RedeemPointsRequest request = new RedeemPointsRequest(200, null);
        RedeemPointsResponse response = new RedeemPointsResponse(true, 200, new BigDecimal("2.00"), 300);

        when(loyaltyService.redeemPoints(eq(customerId), any(RedeemPointsRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/loyalty/customers/{customerId}/redeem", customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.pointsRedeemed").value(200));
    }

    @Test
    void redeemPoints_NegativePoints_Returns422() throws Exception {
        UUID customerId = UUID.randomUUID();
        RedeemPointsRequest request = new RedeemPointsRequest(-50, null); // Invalid

        mockMvc.perform(post("/api/v1/loyalty/customers/{customerId}/redeem", customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }
}
