package mls.sho.dms.entity.inventory;

public enum POType {
    INTERNAL_PROCUREMENT, // Shopro -> Supplier (Standard POS behavior)
    CUSTOMER_SALES       // Restaurant -> Shopro (Marketplace behavior)
}
