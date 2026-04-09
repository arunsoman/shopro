package mls.sho.dms.entity.inventory.procurement;

public enum POType {
    INTERNAL_PROCUREMENT, // Shopro -> Supplier (Standard POS behavior)
    CUSTOMER_SALES       // Restaurant -> Shopro (Marketplace behavior)
}
