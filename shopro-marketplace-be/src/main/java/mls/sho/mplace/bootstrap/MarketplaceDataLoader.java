package mls.sho.mplace.bootstrap;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MarketplaceDataLoader implements CommandLineRunner {

    private final OperatorRepository operatorRepository;
    private final RestaurantRepository restaurantRepository;
    private final SupplierRepository supplierRepository;
    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierUserRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SubOrderRepository subOrderRepository;
    private final BidInvitationRepository bidInvitationRepository;
    private final QuoteRepository quoteRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final RestaurantInventoryRepository restaurantInventoryRepository;
    private final ComplianceDocumentRepository complianceDocumentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (operatorRepository.count() > 0) return;

        // 1. Create Operator
        Operator operator = new Operator();
        operator.setEmail("admin@shopro.com");
        operator.setPassword(passwordEncoder.encode("password123"));
        operator.setRole(mls.sho.mplace.entity.Operator.OperatorRole.SUPER_ADMIN);
        operatorRepository.save(operator);

        // 2. Create Categories
        Category produce = createCategory("Produce", "fruit-basket");
        Category dairy = createCategory("Dairy", "milk");
        Category meat = createCategory("Meat", "drumstick");
        Category beverages = createCategory("Beverages", "coffee");
        
        // 3. Create Restaurant & Buyer
        Restaurant rest = new Restaurant();
        rest.setName("The Gourmet Bistro");
        rest.setAddress("123 Food Street, Mumbai");
        rest.setVerificationStatus(Restaurant.VerificationStatus.ACTIVE);
        rest = restaurantRepository.save(rest);

        MarketplaceBuyer buyer = new MarketplaceBuyer();
        buyer.setEmail("buyer@bistro.com");
        buyer.setPassword(passwordEncoder.encode("password123"));
        buyer.setFullName("Arun Chef");
        buyer.setRestaurantId(rest.getId());
        buyerRepository.save(buyer);

        // 4. Create Supplier & User
        Supplier supplier = new Supplier();
        supplier.setName("Ooty Fresh Organics");
        supplier.setCategory(Supplier.Category.PRODUCE);
        supplier.setVerificationStatus(Supplier.VerificationStatus.VERIFIED);
        supplier.setRating(4.8);
        supplier.setOrganizationId("ORG-8821-X");
        supplier.setRegions("Mumbai,Pune,Bangalore");
        supplier = supplierRepository.save(supplier);

        MarketplaceSupplier supplierUser = new MarketplaceSupplier();
        supplierUser.setEmail("sales@ootyfresh.com");
        supplierUser.setPassword(passwordEncoder.encode("password123"));
        supplierUser.setFullName("Suresh Kumar");
        supplierUser.setSupplierId(supplier.getId());
        supplierUserRepository.save(supplierUser);

        // 5. Create Products
        createProduct("Premium Arabica Beans", produce, supplier, "45.0", "KG");
        createProduct("Organic Avocados", produce, supplier, "120.0", "KG");
        createProduct("Farm Fresh Whole Milk", dairy, supplier, "28.5", "CASE");

        // 6. Create Purchase Orders & Transactions
        PurchaseOrder po = new PurchaseOrder();
        po.setReferenceNumber("PO-2026-001");
        po.setRestaurant(rest);
        po.setStatus(PurchaseOrder.POStatus.IN_FULFILLMENT);
        po.setTotalAmount(new BigDecimal("12450.00"));
        po.setCreatedByPrincipalId(buyer.getId().toString());
        po = purchaseOrderRepository.save(po);

        SubOrder so1 = new SubOrder();
        so1.setPurchaseOrder(po);
        so1.setSupplier(supplier);
        so1.setStatus(SubOrder.SubOrderStatus.SHIPPED);
        so1.setTotalAmount(new BigDecimal("8500.00"));
        subOrderRepository.save(so1);

        SubOrder so2 = new SubOrder();
        so2.setPurchaseOrder(po);
        so2.setSupplier(supplier);
        so2.setStatus(SubOrder.SubOrderStatus.ACK_PENDING);
        so2.setTotalAmount(new BigDecimal("2100.00"));
        subOrderRepository.save(so2);

        SubOrder so3 = new SubOrder();
        so3.setPurchaseOrder(po);
        so3.setSupplier(supplier);
        so3.setStatus(SubOrder.SubOrderStatus.PREPARING);
        so3.setTotalAmount(new BigDecimal("1850.00"));
        subOrderRepository.save(so3);

        // Seed Transactions for Buyer
        createTransaction(rest, null, "PO-9921_PROCUREMENT", -12450.00, "COMPLETED");
        createTransaction(rest, null, "CREDIT_REFUND_ALPHA", 450.00, "COMPLETED");

        // Seed Transactions for Supplier
        createTransaction(null, supplier, "SO-5521_PAYOUT", 8500.00, "COMPLETED");
        createTransaction(null, supplier, "SERVICE_FEE_NODE", -150.00, "COMPLETED");

        // 7. Create Bids
        BidInvitation bidInv = new BidInvitation();
        bidInv.setTitle("Monthly Fresh Produce RFQ");
        bidInv.setRestaurantId(rest.getId());
        bidInv.setDeadline(java.time.LocalDateTime.now().plusDays(5));
        bidInv.setRestaurantId(rest.getId());
        bidInv.setStatus(BidInvitation.BidStatus.OPEN);
        bidInv = bidInvitationRepository.save(bidInv);

        Quote quote = new Quote();
        quote.setBidInvitation(bidInv);
        quote.setSupplier(supplier);
        quote.setTotalAmount(new BigDecimal("22000.00"));
        quote.setStatus(Quote.QuoteStatus.SUBMITTED);
        quoteRepository.save(quote);

        // 8. Support Tickets
        SupportTicket ticket = new SupportTicket();
        ticket.setSubject("Delay in Fresh Milk Trajectory");
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);
        ticket.setPriority(SupportTicket.TicketPriority.HIGH);
        ticket.setRestaurant(rest);
        supportTicketRepository.save(ticket);

        // 9. Seed Restaurant Inventory
        seedInventory(rest, produce, supplier);

        // 10. Seed Compliance Documents
        seedCompliance(rest, supplier);

        // 11. Seed More Leads (Bid Invitations)
        Category bev = beverages;
        seedLeads(bev, dairy);
    }

    private void seedCompliance(Restaurant rest, Supplier supplier) {
        ComplianceDocument d1 = new ComplianceDocument();
        d1.setRestaurant(rest);
        d1.setName("FSSAI License");
        d1.setType("LICENSE");
        d1.setStatus(ComplianceDocument.DocumentStatus.APPROVED);
        d1.setExpiryDate(java.time.LocalDate.now().plusYears(1));
        complianceDocumentRepository.save(d1);

        ComplianceDocument d2 = new ComplianceDocument();
        d2.setSupplier(supplier);
        d2.setName("GST Registration");
        d2.setType("TAX");
        d2.setStatus(ComplianceDocument.DocumentStatus.APPROVED);
        complianceDocumentRepository.save(d2);
    }

    private void seedLeads(Category beverages, Category dairy) {
        BidInvitation lead1 = new BidInvitation();
        lead1.setTitle("Weekly 500L Milk Requirement");
        lead1.setCategory(dairy);
        lead1.setDeadline(java.time.LocalDateTime.now().plusDays(5));
        lead1.setStatus(BidInvitation.BidStatus.OPEN);
        lead1.setUrgency("HIGH");
        bidInvitationRepository.save(lead1);

        BidInvitation lead2 = new BidInvitation();
        lead2.setTitle("Monthly Coffee Bean Bulk Supply");
        lead2.setCategory(beverages);
        lead2.setDeadline(java.time.LocalDateTime.now().plusDays(10));
        lead2.setStatus(BidInvitation.BidStatus.OPEN);
        bidInvitationRepository.save(lead2);
    }

    private void seedInventory(Restaurant rest, Category cat, Supplier supplier) {
        Product p1 = productRepository.findAllByCategory_Id(cat.getId()).get(0);
        
        RestaurantInventory inv1 = new RestaurantInventory();
        inv1.setRestaurantId(rest.getId());
        inv1.setProduct(p1);
        inv1.setCurrentQuantity(new BigDecimal("12.5"));
        inv1.setMinimumThreshold(new BigDecimal("5.0"));
        inv1.setLastUpdated(java.time.LocalDateTime.now());
        restaurantInventoryRepository.save(inv1);
    }

    private Category createCategory(String name, String icon) {
        Category cat = new Category();
        cat.setName(name);
        cat.setIcon(icon);
        return categoryRepository.save(cat);
    }

    private void createProduct(String name, Category cat, Supplier supplier, String price, String unit) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(cat);
        p.setSupplier(supplier);
        p.setBasePrice(new BigDecimal(price));
        p.setUnit(unit);
        productRepository.save(p);
    }

    private void createTransaction(Restaurant r, Supplier s, String desc, double amount, String status) {
        FinancialTransaction tx = new FinancialTransaction();
        tx.setRestaurant(r);
        tx.setSupplier(s);
        tx.setDescription(desc);
        tx.setAmount(new BigDecimal(String.valueOf(amount)));
        tx.setStatus(FinancialTransaction.TransactionStatus.valueOf(status));
        tx.setTransactionDate(java.time.LocalDateTime.now());
        transactionRepository.save(tx);
    }
}
