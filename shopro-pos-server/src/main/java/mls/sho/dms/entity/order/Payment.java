package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single payment transaction against an OrderTicket.
 * One ticket can have multiple payments (e.g., split bill via different methods).
 *
 * processorReference stores the external payment gateway transaction ID (e.g., Stripe charge ID).
 * It is indexed to support dispute lookups. Never log or expose this in client-facing responses.
 */
@Entity
@Table(
    name = "payment",
    indexes = {
        @Index(name = "idx_payment_ticket",    columnList = "ticket_id"),
        @Index(name = "idx_payment_processor", columnList = "processor_reference")
    }
)
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private OrderTicket ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 20)
    private PaymentMethod method;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    /** External gateway transaction ID. Nullable for cash payments. */
    @Column(name = "processor_reference", length = 128)
    private String processorReference;

    /** Human-readable decline reason returned by the payment processor. Nullable on success. */
    @Column(name = "decline_reason", length = 256)
    private String declineReason;

    public OrderTicket getTicket() { return ticket; }
    public void setTicket(OrderTicket ticket) { this.ticket = ticket; }
    public PaymentMethod getMethod() { return method; }
    public void setMethod(PaymentMethod method) { this.method = method; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public String getProcessorReference() { return processorReference; }
    public void setProcessorReference(String processorReference) { this.processorReference = processorReference; }
    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }
}
