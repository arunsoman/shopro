package mls.sho.dms.entity.finance;

/**
 * Basic classification of accounts for the Chart of Accounts.
 */
public enum AccountType {
    ASSET,       // e.g. Cash, Inventory, Bank
    LIABILITY,   // e.g. Accounts Payable, Taxes
    EQUITY,      // e.g. Retained Earnings
    REVENUE,     // e.g. Sales, Service Charge
    EXPENSE      // e.g. COGS, Rent, Utilities
}
