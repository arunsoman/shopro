package mls.sho.dms.entity.finance;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single account in the General Ledger (Chart of Accounts).
 */
@Entity
@Table(
    name = "finance_account",
    indexes = {
        @Index(name = "uq_account_code", columnList = "code", unique = true),
        @Index(name = "idx_account_type", columnList = "account_type")
    }
)
public class Account extends BaseEntity {

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @Column(name = "description", length = 500)
    private String description;

    /** Current balance of the account (Debit - Credit). */
    @Column(name = "balance", nullable = false, precision = 15, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
