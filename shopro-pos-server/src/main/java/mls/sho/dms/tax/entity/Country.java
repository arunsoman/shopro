package mls.sho.dms.tax.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a jurisdiction/country for taxation purposes.
 * Defines the tax model (VAT, GST, Sales Tax) and currency context.
 */
@Entity
@Table(name = "countries")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Country extends BaseEntity {

    @Column(name = "iso_code", nullable = false, length = 10, unique = true)
    private String isoCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(name = "currency_symbol", nullable = false, length = 5)
    private String currencySymbol;

    @Column(name = "tax_model", nullable = false, length = 30)
    private String taxModel;

    @Column(name = "tax_included", nullable = false)
    private boolean taxIncluded = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @JsonManagedReference
    private List<TaxRule> rules = new ArrayList<>();

    public String getIsoCode() { return isoCode; }
    public void setIsoCode(String isoCode) { this.isoCode = isoCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
    public String getTaxModel() { return taxModel; }
    public void setTaxModel(String taxModel) { this.taxModel = taxModel; }
    public boolean isTaxIncluded() { return taxIncluded; }
    public void setTaxIncluded(boolean taxIncluded) { this.taxIncluded = taxIncluded; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<TaxRule> getRules() { return rules; }
    public void setRules(List<TaxRule> rules) { this.rules = rules; }
}
