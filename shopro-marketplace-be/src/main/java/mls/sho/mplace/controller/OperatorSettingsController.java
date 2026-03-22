package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operator/system")
@RequiredArgsConstructor
public class OperatorSettingsController {

    @GetMapping("/health")
    public Map<String, Object> getSystemHealth() {
        return Map.of(
            "slo", "99.98",
            "metrics", List.of(
                Map.of("label", "Core Load", "value", "12%", "icon", "cpu"),
                Map.of("label", "DB Latency", "value", "2.1ms", "icon", "database"),
                Map.of("label", "Traffic", "value", "4.2k/s", "icon", "network"),
                Map.of("label", "Error Rate", "value", "0.01%", "icon", "waves")
            ),
            "services", List.of(
                Map.of("name", "API Gateway", "status", "Healthy", "latency", "14ms", "uptime", "99.99%", "color", "emerald"),
                Map.of("name", "PostgreSQL Master", "status", "Healthy", "latency", "2ms", "uptime", "100%", "color", "emerald"),
                Map.of("name", "Redis Cache", "status", "Healthy", "latency", "1ms", "uptime", "99.98%", "color", "emerald"),
                Map.of("name", "Image Processor", "status", "Degraded", "latency", "450ms", "uptime", "98.5%", "color", "amber"),
                Map.of("name", "Auth Service", "status", "Healthy", "latency", "22ms", "uptime", "99.99%", "color", "emerald"),
                Map.of("name", "Payment Engine", "status", "Healthy", "latency", "85ms", "uptime", "99.95%", "color", "emerald")
            )
        );
    }

    @GetMapping("/keys")
    public List<Map<String, String>> getApiKeys() {
        return List.of(
            Map.of("id", "AK-992", "name", "Shopro Flutter App", "key", "sp_live_••••••••39ac", "scope", "Universal", "created", "Oct 12, 2025", "lastUsed", "4m ago", "status", "Active"),
            Map.of("id", "AK-104", "name", "Elite Inventory Sync", "key", "sp_live_••••••••128d", "scope", "Catalog-Write", "created", "Nov 01, 2025", "lastUsed", "1h ago", "status", "Active"),
            Map.of("id", "AK-082", "name", "Zendesk Integration", "key", "sp_live_••••••••90fe", "scope", "Support-Read", "created", "Dec 15, 2025", "lastUsed", "2d ago", "status", "Active")
        );
    }

    @GetMapping("/settings")
    public Map<String, Object> getMarketplaceSettings() {
        return Map.of(
            "general", Map.of(
                "marketplaceName", "Shopro Marketplace",
                "supportEmail", "ops@shopro.ae",
                "maintenanceMode", false
            ),
            "fees", Map.of(
                "baseCommission", "5.5%",
                "logisticsFee", "2.0%",
                "paymentProcessingFee", "1.5%"
            )
        );
    }

    @GetMapping("/webhooks")
    public List<Map<String, Object>> getWebhooks() {
        return List.of(
            Map.of("id", "WH-221", "url", "https://oms.fleet.ae/webhooks/shopro", "events", List.of("order.created", "order.shipment_ready"), "status", "Healthy", "success", "99.8%", "lastSent", "12s ago"),
            Map.of("id", "WH-504", "url", "https://erp.wholesale.ae/api/v2/hooks", "events", List.of("catalog.sku_updated", "catalog.stock_low"), "status", "Failing", "success", "12.4%", "lastSent", "2m ago"),
            Map.of("id", "WH-102", "url", "https://hooks.slack.com/services/...", "events", List.of("dispute.opened", "payout.initiated"), "status", "Healthy", "success", "100%", "lastSent", "1h ago")
        );
    }

    @GetMapping("/roles")
    public List<Map<String, Object>> getRoles() {
        return List.of(
            Map.of("id", "ROL-01", "name", "Super Admin", "users", 3, "permissions", "All Access", "level", "L4", "color", "rose"),
            Map.of("id", "ROL-02", "name", "Regional Manager", "users", 12, "permissions", "Operations, CRM, Disputes", "level", "L3", "color", "violet"),
            Map.of("id", "ROL-03", "name", "Financial Auditor", "users", 5, "permissions", "Ledger, Payouts, Tax", "level", "L3", "color", "emerald"),
            Map.of("id", "ROL-04", "name", "Support Agent", "users", 45, "permissions", "Disputes (Read/Edit), PO Views", "level", "L1", "color", "blue")
        );
    }
}
