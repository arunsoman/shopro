package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.repository.MenuCostGroupRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.application.purchasing.repository.SupplierRepository;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.primecost.repository.*;
import mls.sho.dms.application.primecost.entity.*;
import mls.sho.dms.entity.*;
import mls.sho.dms.common.enums.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DashboardDataSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final DiningTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuCostGroupRepository groupRepository;
    private final IngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;
    private final mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository goodsReceiptRepository;
    private final PurchaseInvoiceRepository invoiceRepository;
    private final InventoryIntelligenceService inventoryService;
    
    private final EmployeeRepository employeeRepository;
    private final EmployeeLaborRecordRepository laborRecordRepository;
    private final WeeklyBudgetRepository budgetRepository;
    private final PrimeCostReportRepository reportRepository;
    private final DailySalesEntryRepository salesEntryRepository;
    private final ExperimentDataSeeder experimentDataSeeder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Restaurant res = restaurantRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                     Restaurant newRes = new Restaurant();
                     newRes.setName("The Gourmet Kitchen");
                     newRes.setTimezone("Asia/Kolkata");
                     return restaurantRepository.save(newRes);
                });

        // Seed/Refresh Experiments (Handles its own cleanup)
        experimentDataSeeder.seed(res, UUID.fromString("00000000-0000-0000-0000-000000000000"));

        if (tableRepository.count() > 0) return;

        // 2. Groups & Menu Items
        MenuCostGroup mains = new MenuCostGroup();
        mains.setRestaurant(res);
        mains.setName("Main Courses");
        mains = groupRepository.save(mains);

        MenuItem steak = new MenuItem();
        steak.setRestaurant(res);
        steak.setGroup(mains);
        steak.setName("Grilled Ribeye Steak");
        steak.setPosId("STEAK01");
        steak.setSellPriceBuffer(new BigDecimal("45.00"));
        steak = menuItemRepository.save(steak);

        MenuItem burger = new MenuItem();
        burger.setRestaurant(res);
        burger.setGroup(mains);
        burger.setName("House Burger");
        burger.setPosId("BURGER01");
        burger.setSellPriceBuffer(new BigDecimal("18.50"));
        burger = menuItemRepository.save(burger);

        // 3. Tables
        for (int i = 1; i <= 20; i++) {
            DiningTable table = new DiningTable();
            table.setRestaurant(res);
            table.setTableNumber(String.valueOf(i));
            table.setCapacity(4);
            table.setStatus(i <= 5 ? DiningTable.TableStatus.OCCUPIED : DiningTable.TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

      

        // 5. Suppliers & Invoices
        Supplier s = new Supplier();
        s.setRestaurant(res);
        s.setName("Global Foods Inc");
        s = supplierRepository.save(s);

        for (int i = 0; i < 5; i++) {
            PurchaseInvoice inv = new PurchaseInvoice();
            inv.setRestaurant(res);
            inv.setSupplier(s);
            inv.setInvoiceDate(LocalDate.now());
            inv.setInvoiceNumber("INV-00" + i);
            inv.setInvoiceAmount(new BigDecimal("1500.00"));
            inv.setStatus(PurchaseInvoice.InvoiceStatus.DRAFT);
            invoiceRepository.save(inv);
        }

        // 6. Active Sessions
        List<DiningTable> occupied = tableRepository.findAll().stream()
                .filter(t -> t.getStatus() == DiningTable.TableStatus.OCCUPIED)
                .toList();

        for (DiningTable t : occupied) {
            TableSession ts = new TableSession();
            ts.setTable(t);
            ts.setRestaurant(res);
            ts.setGuestCount(random.nextInt(4) + 1);
            ts.setOpenedAt(LocalDateTime.now().minusMinutes(30));
            sessionRepository.save(ts);
        }

        // 7. Orders (50 for today)
        for (int i = 0; i < 50; i++) {
            TableSession ts = new TableSession();
            ts.setTable(occupied.get(0));
            ts.setRestaurant(res);
            ts.setGuestCount(2);
            ts.setOpenedAt(LocalDateTime.now().minusHours(2));
            ts.setClosedAt(LocalDateTime.now().minusHours(1));
            ts = sessionRepository.save(ts);

            Order order = new Order();
            order.setRestaurant(res);
            order.setSession(ts);
            order.setOrderNumber("ORD-" + System.currentTimeMillis() + "-" + i);
            order.setTotalAmount(new BigDecimal("85.50"));
            order.setStatus(Order.OrderStatus.PAID);
            order.setCreatedAt(LocalDateTime.now().minusMinutes(random.nextInt(600)));
            order = orderRepository.save(order);

            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setMenuItem(steak);
            line.setQuantity(2);
            line.setUnitPrice(steak.getSellPriceBuffer());
            line.setSubtotal(steak.getSellPriceBuffer().multiply(new BigDecimal("2")));
            order.getLines().add(line);
            orderRepository.save(order);
        }

        // 8. Seed Initial Inventory Ledger (Shipments & Depletion)
        mls.sho.dms.entity.Supplier defaultSupplier = supplierRepository.findAll().stream().findFirst().orElseGet(() -> {
            mls.sho.dms.entity.Supplier sup = new mls.sho.dms.entity.Supplier();
            sup.setRestaurant(res);
            sup.setName("Default Primary Supplier");
            sup.setContactName("Logistics Manager");
            sup.setEmail("fulfillment@default.com");
            return supplierRepository.save(sup);
        });

        GoodsReceipt initialGrn = new GoodsReceipt();
        initialGrn.setRestaurant(res);
        initialGrn.setSupplier(defaultSupplier);
        initialGrn.setReceivedDate(LocalDateTime.now().minusDays(7));
        initialGrn.setStatus(GoodsReceiptStatus.RECEIVED);
        initialGrn.setNotes("Initial System Stock Seeding");
        final GoodsReceipt lockedGrn = goodsReceiptRepository.save(initialGrn);

        List<Ingredient> ingredientsList = ingredientRepository.findAllByRestaurantId(res.getId());
        for (int i = 0; i < ingredientsList.size(); i++) {
            Ingredient ing = ingredientsList.get(i);
            
            // a. Receive initial bulk stock via official GRN to ensure FIFO lots are created
            inventoryService.receiveShipment(lockedGrn, ing, new BigDecimal("200.00"), 
                    ing.getPurchaseUnitPrice(), BigDecimal.ZERO, LocalDateTime.now().minusDays(7));
            
            // b. Record some random historical depletion (simulating sales)
            if (i % 2 == 0) {
                inventoryService.recordDiscard(res, ing, new BigDecimal("5.00"), "INITIAL_WASTE", null);
            }
        }

        seedPrimeCostData(res);
    }

    private void seedPrimeCostData(Restaurant res) {
        // 1. Employees
        Employee mgmt = new Employee();
        mgmt.setRestaurant(res);
        mgmt.setName("Marco Pierre White");
        mgmt.setEmployeeType(Employee.EmployeeType.MANAGEMENT);
        mgmt.setAnnualSalary(new BigDecimal("85000"));
        mgmt = employeeRepository.save(mgmt);

        Employee hourly1 = new Employee();
        hourly1.setRestaurant(res);
        hourly1.setName("Gordon Ramsay");
        hourly1.setEmployeeType(Employee.EmployeeType.HOURLY);
        hourly1.setHourlyRate(new BigDecimal("22.50"));
        hourly1 = employeeRepository.save(hourly1);

        Employee hourly2 = new Employee();
        hourly2.setRestaurant(res);
        hourly2.setName("Thomas Keller");
        hourly2.setEmployeeType(Employee.EmployeeType.HOURLY);
        hourly2.setHourlyRate(new BigDecimal("19.00"));
        hourly2 = employeeRepository.save(hourly2);

        // 2. Budget
        WeeklyBudget budget = new WeeklyBudget();
        budget.setRestaurant(res);
        budget.setWeekStartDate(LocalDate.now().with(java.time.DayOfWeek.MONDAY));
        budget.setTotalSalesForecast(new BigDecimal("25000.00"));
        budget.setFoodSalesPct(new BigDecimal("0.80"));
        budget.setSoftBevSalesPct(new BigDecimal("0.05"));
        budget.setLiquorSalesPct(new BigDecimal("0.15"));
        budget.setFoodCosPctTarget(new BigDecimal("0.28"));
        budget.setBevCosPctTarget(new BigDecimal("0.18"));
        budget.setMgmtLaborPctTarget(new BigDecimal("0.10"));
        budget.setHourlyLaborPctTarget(new BigDecimal("0.18"));
        budget.setBenefitsRate(new BigDecimal("0.20"));
        budgetRepository.save(budget);

        // 3. Historical Reports (8 weeks)
        LocalDate monday = LocalDate.now().minusWeeks(8).with(java.time.DayOfWeek.MONDAY);
        for (int i = 0; i < 8; i++) {
            PrimeCostReport report = new PrimeCostReport();
            report.setRestaurant(res);
            report.setWeekStartDate(monday.plusWeeks(i));
            
            BigDecimal sales = new BigDecimal(20000 + random.nextInt(10000));
            BigDecimal foodCos = sales.multiply(new BigDecimal(0.25 + (random.nextDouble() * 0.08)));
            BigDecimal labor = sales.multiply(new BigDecimal(0.28 + (random.nextDouble() * 0.05)));
            
            report.setGrossSales(sales);
            report.setNetSales(sales.multiply(new BigDecimal("0.95")));
            report.setActualFoodCos(foodCos);
            report.setActualBevCos(sales.multiply(new BigDecimal("0.02")));
            report.setTotalActualCos(report.getActualFoodCos().add(report.getActualBevCos()));
            report.setTotalActualCosPct(report.getTotalActualCos().divide(sales, 4, BigDecimal.ROUND_HALF_UP));
            
            report.setMgmtLabor(new BigDecimal("1600.00"));
            report.setHourlyLabor(labor.subtract(new BigDecimal("1600.00")));
            report.setTotalLabor(labor);
            report.setTotalLaborPct(report.getTotalLabor().divide(sales, 4, BigDecimal.ROUND_HALF_UP));
            
            report.setPrimeCostGross(report.getTotalActualCos().add(report.getTotalLabor()));
            report.setPrimeCostGrossPct(report.getPrimeCostGross().divide(sales, 4, BigDecimal.ROUND_HALF_UP));
            
            report.setTheoreticalCos(report.getTotalActualCos().multiply(new BigDecimal("0.98")));
            report.setTheoreticalCosPct(report.getTheoreticalCos().divide(sales, 4, BigDecimal.ROUND_HALF_UP));
            report.setShrinkageVariance(report.getTotalActualCos().subtract(report.getTheoreticalCos()));
            
            report.setTotalCovers(400 + random.nextInt(200));
            report.setCheckAverage(sales.divide(new BigDecimal(report.getTotalCovers()), 2, BigDecimal.ROUND_HALF_UP));
            report.setLaborCostPerCover(labor.divide(new BigDecimal(report.getTotalCovers()), 2, BigDecimal.ROUND_HALF_UP));
            report.setSalesPerLaborHour(new BigDecimal(45 + random.nextInt(20)));
            
            report.setStatus(PrimeCostReport.ReportStatus.FINALISED);
            reportRepository.save(report);
        }

        // 4. Current Week Labor Records
        LocalDate today = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        for (Employee e : List.of(hourly1, hourly2)) {
            EmployeeLaborRecord rec = new EmployeeLaborRecord();
            rec.setEmployee(e);
            rec.setRestaurant(res);
            rec.setWeekStartDate(today);
            rec.setRateSnapshot(e.getHourlyRate());
            rec.setHoursMon(new BigDecimal(6 + random.nextInt(3)));
            rec.setHoursTue(new BigDecimal(6 + random.nextInt(3)));
            rec.setHoursWed(new BigDecimal(6 + random.nextInt(3)));
            laborRecordRepository.save(rec);
        }
    }
}
