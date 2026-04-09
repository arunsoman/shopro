package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.POStatusHistoryRepository;
import mls.sho.dms.repository.inventory.SupplierUserRepository;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.repository.staff.StaffRepository;
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
    @Mock private StaffRepository staffRepository;
    @Mock private AlertService alertService;
    @Mock private POStateMachineService stateMachineService;
    @Mock private POGeneratorService poGeneratorService;
    @Mock private POStatusHistoryRepository historyRepository;
    @Mock private SupplierUserRepository supplierUserRepository;

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

        mls.sho.dms.entity.staff.Role managerRole = new mls.sho.dms.entity.staff.Role();
        managerRole.setName("MANAGER");
        manager = new StaffMember();
        manager.setRole(managerRole);
        manager.setFullName("Manager Bob");

        mls.sho.dms.entity.staff.Role ownerRole = new mls.sho.dms.entity.staff.Role();
        ownerRole.setName("OWNER");
        owner = new StaffMember();
        owner.setRole(ownerRole);
        owner.setFullName("Owner Alice");
    }

    @Test
    void submitForApproval_autoApprovesUnder500() {
        when(poRepository.findById(autoApprovePo.getId())).thenReturn(Optional.of(autoApprovePo));

        PurchaseOrder result = poService.submitForApproval(autoApprovePo.getId());

        verify(stateMachineService).transition(any(), any(), any(), any());
    }

    @Test
    void submitForApproval_routesToManagerUnder3000() {
        when(poRepository.findById(managerPo.getId())).thenReturn(Optional.of(managerPo));

        PurchaseOrder result = poService.submitForApproval(managerPo.getId());

        verify(stateMachineService).transition(any(), any(), any(), any());
    }

    @Test
    void approveOrder_managerApprovesTier2() {
        UUID approverId = UUID.randomUUID();
        managerPo.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);

        when(poRepository.findById(managerPo.getId())).thenReturn(Optional.of(managerPo));
        when(staffRepository.findById(approverId)).thenReturn(Optional.of(manager));

        PurchaseOrder result = poService.approveOrder(managerPo.getId(), approverId);

        verify(stateMachineService).transition(any(), any(), any(), any());
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
