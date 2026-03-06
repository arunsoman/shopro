package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.StaffRole;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class POServiceImplTest {

    @Mock private PurchaseOrderRepository poRepository;
    @Mock private StaffMemberRepository staffRepository;
    @Mock private AlertService alertService;

    @InjectMocks
    private POServiceImpl poService;

    private PurchaseOrder autoApprovePo;
    private PurchaseOrder managerPo;
    private Supplier mockSupplier;
    private StaffMember manager;
    private StaffMember gm;
    private StaffMember owner;

    @BeforeEach
    void setUp() {
        mockSupplier = new Supplier();
        mockSupplier.setCompanyName("Test Supplier");
        mockSupplier.setContactEmail("test@supplier.com");

        StaffMember generatedBy = new StaffMember();
        generatedBy.setFullName("System");

        autoApprovePo = new PurchaseOrder();
        autoApprovePo.setId(UUID.randomUUID());
        autoApprovePo.setStatus(PurchaseOrderStatus.DRAFT);
        autoApprovePo.setTotalValue(new BigDecimal("450.00")); // < 500
        autoApprovePo.setSupplier(mockSupplier);
        autoApprovePo.setGeneratedBy(generatedBy);

        managerPo = new PurchaseOrder();
        managerPo.setId(UUID.randomUUID());
        managerPo.setStatus(PurchaseOrderStatus.DRAFT);
        managerPo.setTotalValue(new BigDecimal("1500.00")); // 500 - 3000
        managerPo.setSupplier(mockSupplier);
        managerPo.setGeneratedBy(generatedBy);

        manager = new StaffMember();
        manager.setRole(StaffRole.MANAGER);
        manager.setFullName("Manager Bob");

        owner = new StaffMember();
        owner.setRole(StaffRole.OWNER);
        owner.setFullName("Owner Alice");
    }

    @Test
    void submitForApproval_autoApprovesUnder500() {
        when(poRepository.findById(autoApprovePo.getId())).thenReturn(Optional.of(autoApprovePo));
        when(poRepository.save(autoApprovePo)).thenReturn(autoApprovePo);

        PurchaseOrder result = poService.submitForApproval(autoApprovePo.getId());

        assertEquals(PurchaseOrderStatus.SENT, result.getStatus());
        assertNotNull(result.getSentAt());
        assertNotNull(result.getApprovedAt());
        verify(alertService).dispatchEmail(eq("test@supplier.com"), contains("New Purchase Order"), anyString());
    }

    @Test
    void submitForApproval_routesToManagerUnder3000() {
        when(poRepository.findById(managerPo.getId())).thenReturn(Optional.of(managerPo));
        when(poRepository.save(managerPo)).thenReturn(managerPo);

        PurchaseOrder result = poService.submitForApproval(managerPo.getId());

        assertEquals(PurchaseOrderStatus.PENDING_APPROVAL, result.getStatus());
        verify(alertService).sendNotification(eq("ApprovalsTeam"), contains("PO Approval Required"), contains("Inventory Manager"));
    }

    @Test
    void approveOrder_managerApprovesTier2() {
        UUID approverId = UUID.randomUUID();
        managerPo.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);

        when(poRepository.findById(managerPo.getId())).thenReturn(Optional.of(managerPo));
        when(staffRepository.findById(approverId)).thenReturn(Optional.of(manager));
        when(poRepository.save(managerPo)).thenReturn(managerPo);

        PurchaseOrder result = poService.approveOrder(managerPo.getId(), approverId);

        assertEquals(PurchaseOrderStatus.SENT, result.getStatus());
        assertEquals(manager, result.getApprovedBy());
        verify(alertService).dispatchEmail(eq("test@supplier.com"), contains("New Purchase Order"), anyString());
    }

    @Test
    void approveOrder_throwsSecurityExceptionForInsufficientRole() {
        UUID approverId = UUID.randomUUID();
        PurchaseOrder largePo = new PurchaseOrder();
        largePo.setId(UUID.randomUUID());
        largePo.setTotalValue(new BigDecimal("50000.00")); // Requires Owner
        largePo.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);

        when(poRepository.findById(largePo.getId())).thenReturn(Optional.of(largePo));
        when(staffRepository.findById(approverId)).thenReturn(Optional.of(manager));

        assertThrows(SecurityException.class, () -> poService.approveOrder(largePo.getId(), approverId));
    }
}
