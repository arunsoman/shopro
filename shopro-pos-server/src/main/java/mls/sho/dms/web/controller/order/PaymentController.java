package mls.sho.dms.web.controller.order;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.order.MiPayRequest;
import mls.sho.dms.application.dto.order.OrderResponse;
import mls.sho.dms.application.service.order.OrderService;
import mls.sho.dms.entity.order.Payment;
import mls.sho.dms.entity.order.PaymentMethod;
import mls.sho.dms.entity.order.PaymentStatus;
import mls.sho.dms.repository.order.PaymentRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Endpoints for processing payments")
@lombok.extern.slf4j.Slf4j
public class PaymentController {

    private final OrderService orderService;
    private final PaymentRepository paymentRepository;
    private final OrderTicketRepository orderTicketRepository;

    @PostMapping("/mipay/initiate")
    public OrderResponse initiateMiPay(@Valid @RequestBody MiPayRequest request) {
        log.info("Initiating MiPay for order: {} and phone: {}", request.orderId(), request.phoneNumber());

        OrderTicket ticket = orderTicketRepository.findById(request.orderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.orderId()));

        // Create a dummy payment record
        Payment payment = new Payment();
        payment.setTicket(ticket);
        payment.setMethod(PaymentMethod.MIPAY);
        payment.setAmount(ticket.getTotalAmount());
        payment.setStatus(PaymentStatus.APPROVED); // Assuming success for now
        payment.setProcessorReference("MIPAY-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        
        paymentRepository.save(payment);

        log.debug("MiPay payment approved for order: {}. Finalizing order.", request.orderId());
        
        // Mark the order as paid
        return orderService.finalizeOrder(request.orderId());
    }
}
