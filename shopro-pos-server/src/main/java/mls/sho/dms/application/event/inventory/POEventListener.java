package mls.sho.dms.application.event.inventory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Component
@RequiredArgsConstructor
public class POEventListener {

    private final AlertService alertService;

    @EventListener
    public void onPOStateChanged(POStateChangedEvent event) {
        PurchaseOrder po = event.getPurchaseOrder();
        PurchaseOrderStatus toStatus = event.getToStatus();
        PurchaseOrderStatus fromStatus = event.getFromStatus();

        log.info("PO Event: PO #{} moved from {} to {} (By: {})", po.getId(), fromStatus, toStatus, event.getActorId());

        switch (toStatus) {
            case PENDING_APPROVAL:
                notifyApprovers(po);
                break;
            case APPROVED:
                // US-14.2 Auto Dispatch
                dispatchPoToVendor(po);
                break;
            case REJECTED:
                notifyStaff(po, "PO Rejected", String.format("PO #%s was rejected. Reason: %s", po.getId(), event.getReason()));
                break;
            case SENT:
                dispatchPoToVendor(po);
                break;
            case ACKNOWLEDGED:
                notifyStaff(po, "PO Acknowledged", String.format("Supplier acknowledged PO #%s.", po.getId()));
                break;
            case COUNTER_OFFERED:
                notifyStaff(po, "PO Counter-Offer Received", 
                    String.format("Supplier for PO #%s has sent a counter-offer. Reason: %s", po.getId(), event.getReason()));
                break;
            case SHIPPED:
                notifyStaff(po, "PO Shipped", String.format("PO #%s has been marked as SHIPPED by the supplier.", po.getId()));
                break;
            case CANCELLED:
                notifyStaff(po, "PO Cancelled", String.format("PO #%s was cancelled. Reason: %s", po.getId(), event.getReason()));
                break;
            case GRN_FLAGGED:
                notifyStaff(po, "GRN Discrepancy", String.format("PO #%s has a receipt discrepancy and requires review.", po.getId()));
                break;
            default:
                break;
        }
    }

    private void notifyApprovers(PurchaseOrder po) {
        String requiredRole = "Inventory Manager";
        BigDecimal total = po.getTotalValue();
        if (total.compareTo(new BigDecimal("3000.00")) >= 0 && total.compareTo(new BigDecimal("10000.00")) < 0) {
            requiredRole = "General Manager";
        } else if (total.compareTo(new BigDecimal("10000.00")) >= 0) {
            requiredRole = "Owner";
        }

        alertService.sendNotification(
            "ApprovalsTeam", 
            "PO Approval Required: #" + po.getId(), 
            String.format("PO #%s for $%s requires %s approval.", po.getId(), total.setScale(2, RoundingMode.HALF_UP).toString(), requiredRole)
        );
    }

    private void dispatchPoToVendor(PurchaseOrder po) {
        String vendorEmail = po.getSupplier().getContactEmail();
        if (vendorEmail != null) {
            String ackLink = "http://localhost:3000/vendor/po/" + po.getId() + "/acknowledge";
            alertService.dispatchEmail(
                vendorEmail, 
                "New Purchase Order: #" + po.getId(), 
                "Please find attached Purchase Order #" + po.getId() + ". Please acknowledge receipt using this link: " + ackLink
            );
            log.info("PO Email Dispatched: #{}", po.getId());
        }
    }

    private void notifyStaff(PurchaseOrder po, String subject, String body) {
        if (po.getGeneratedBy() != null) {
            alertService.sendNotification(po.getGeneratedBy().getFullName(), subject, body);
        }
    }
}
