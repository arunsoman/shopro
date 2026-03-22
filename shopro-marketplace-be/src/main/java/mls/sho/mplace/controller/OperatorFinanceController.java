package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.FinanceService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/operator/finance")
@RequiredArgsConstructor
public class OperatorFinanceController {

    private final FinanceService financeService;

    public record Dispute(String id, String orderId, String restaurant, String supplier, String reason, String status, LocalDateTime openedAt) {}
    public record Reconciliation(String id, String period, String totalAmount, String status, int itemsCount) {}
    public record Statement(String id, String entityName, String entityType, String balance, String lastActivity) {}

    @GetMapping("/disputes")
    public List<Dispute> getDisputes() {
        return List.of(
            new Dispute("DISP-101", "PO-9002", "Green Bites Cafe", "Fresh Farms Ltd", "Damaged goods on arrival", "Open", LocalDateTime.now().minusDays(2)),
            new Dispute("DISP-102", "PO-8841", "Urban Kitchen", "Ocean Catch", "Incorrect quantity delivered", "Resolved", LocalDateTime.now().minusDays(5)),
            new Dispute("DISP-103", "PO-9105", "The Steakhouse", "Premium Meats", "Quality mismatch - Grade B vs A", "Pending Review", LocalDateTime.now().minusHours(4))
        );
    }

    @GetMapping("/reconciliations")
    public List<Reconciliation> getReconciliations() {
        return List.of(
            new Reconciliation("REC-MAR-W3", "Mar 15 - Mar 21", "₹42.4L", "Completed", 145),
            new Reconciliation("REC-MAR-W4", "Mar 22 - Mar 28", "₹18.2L", "In Progress", 82),
            new Reconciliation("REC-FEB-W4", "Feb 22 - Feb 28", "₹56.1L", "Completed", 210)
        );
    }

    @GetMapping("/statements")
    public List<Statement> getStatements() {
        return financeService.getAllTransactions().stream()
                .map(tx -> new Statement(
                        "STMT-" + tx.getId().toString().substring(0, 5).toUpperCase(),
                        tx.getRestaurant() != null ? tx.getRestaurant().getName() : "SUPPLIER_" + tx.getSupplier().getName(),
                        tx.getRestaurant() != null ? "Buyer" : "Supplier",
                        "₹" + tx.getAmount(),
                        tx.getCreatedAt().toString()
                )).toList();
    }

    @GetMapping("/audit-summary")
    public List<String> getAuditSummary() {
        return List.of(
            "System wide reconciliation trigger by ADMIN at 08:00 UTC",
            "Tax rule update applied to Region North",
            "Dispute DISP-102 resolved - Credit note CN-405 issued",
            "New operator role 'Finance_Auditor' created"
        );
    }
}
