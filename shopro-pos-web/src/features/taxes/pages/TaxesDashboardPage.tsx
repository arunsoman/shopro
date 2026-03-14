import React, { useState } from 'react';
import { 
  useCountries, 
  useVenueTaxAssignment, 
  useAssignCountry, 
  useTaxRules,
  useSetTaxOverride 
} from '../api/taxes';
import { 
  ShieldCheck, 
  Globe, 
  Info, 
  AlertCircle, 
  Edit2, 
  Check, 
  X,
  Receipt
} from 'lucide-react';
import { BillSimulator } from '../components/BillSimulator';
import { toast } from 'sonner';

export const TaxesDashboardPage: React.FC = () => {
  // Mock venueId for now (would come from context in real app)
  const venueId = "00000000-0000-0000-0000-000000000000"; 
  
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const { data: assignment, isLoading: loadingAssignment } = useVenueTaxAssignment(venueId);
  const { mutate: assignCountry } = useAssignCountry();
  
  const selectedCountry = assignment?.country;
  const { data: rules, isLoading: loadingRules } = useTaxRules(selectedCountry?.isoCode);

  const [isChangingCountry, setIsChangingCountry] = useState(false);

  const handleAssignCountry = (isoCode: string) => {
    assignCountry({ venueId, isoCode }, {
      onSuccess: () => {
        setIsChangingCountry(false);
        toast.success("Tax jurisdiction updated successfully");
      },
      onError: () => {
        toast.error("Failed to update tax jurisdiction");
      }
    });
  };

  if (loadingCountries || loadingAssignment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Receipt className="h-8 w-8 text-amber-500" />
            Taxes & Compliance
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage regional tax models, rule overrides, and billing compliance.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-2xl border border-border shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Globe className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Jurisdiction</p>
            {isChangingCountry ? (
              <select 
                className="mt-1 block w-48 rounded-lg border-input bg-background text-sm focus:ring-amber-500"
                onChange={(e) => handleAssignCountry(e.target.value)}
                defaultValue={selectedCountry?.isoCode || ""}
              >
                <option value="" disabled>Select Country</option>
                {Array.isArray(countries) && countries.map(c => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  {selectedCountry ? `${selectedCountry.name} (${selectedCountry.isoCode})` : "Not Assigned"}
                </span>
                <button 
                  onClick={() => setIsChangingCountry(true)}
                  className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Rules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl font-bold">Active Tax Rules</h2>
              </div>
              {selectedCountry && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 uppercase">
                  {selectedCountry.taxModel.replace('_', ' ')}
                </span>
              )}
            </div>
            
            <div className="divide-y divide-border">
              {loadingRules ? (
                <div className="p-12 text-center text-muted-foreground italic">Loading rules...</div>
              ) : rules?.length ? (
                rules.map((rule) => (
                  <TaxRuleRow key={rule.id} rule={rule} venueId={venueId} />
                ))
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Receipt className="h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground">No rules found for this jurisdiction.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Compliance Note
            </h3>
            <p className="text-amber-50 text-sm leading-relaxed mb-4">
              Taxes are automatically applied based on the item category, temperature (hot/cold), and order type (dine-in/takeaway).
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-amber-200"></div>
                <span>VAT Inclusive: <strong>{selectedCountry?.taxIncluded ? 'YES' : 'NO'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-amber-200"></div>
                <span>Auto-tagging: <strong>Active</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Legal Bounds
            </h3>
            <p className="text-sm text-muted-foreground">
              Manual rate overrides must remain within the legal upper and lower bounds defined by regional authorities.
            </p>
            <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
              <div className="text-xs font-semibold text-muted-foreground uppercase opacity-70 mb-2">Override Protection</div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4"></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-bold text-muted-foreground">
                <span>0%</span>
                <span>SAFE ZONE (5% - 25%)</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Simulator Section */}
      <BillSimulator venueId={venueId} />
    </div>
  );
};

const TaxRuleRow: React.FC<{ rule: any, venueId: string }> = ({ rule, venueId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRate, setNewRate] = useState(rule.defaultRate * 100);
  const { mutate: setOverride } = useSetTaxOverride();

  const handleUpdate = () => {
    setOverride({
      venueId,
      ruleId: rule.id,
      rate: newRate / 100,
      reason: "Manual administrative override"
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Rate override applied");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to update rate");
      }
    });
  };

  return (
    <div className="p-6 hover:bg-muted/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
      <div className="flex gap-4">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
          rule.ruleCode.includes('ALCOHOL') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground text-lg">{rule.ruleName}</h4>
            <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded border border-border uppercase tracking-widest text-muted-foreground">
              {rule.ruleCode}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {rule.appliesToDineIn && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">DINE-IN</span>
            )}
            {rule.appliesToTakeaway && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold border border-blue-500/20">TAKEAWAY</span>
            )}
            {rule.appliesToHot && (
              <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 text-[10px] font-bold border border-orange-500/20">HOT</span>
            )}
            {rule.appliesToCold && (
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 text-[10px] font-bold border border-sky-500/20">COLD</span>
            )}
            {rule.isAppliesToAlcohol && (
              <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-bold border border-red-500/20">ALCOHOL</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 justify-between md:justify-end min-w-[200px]">
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Tax Rate</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                className="w-20 rounded-lg border-input bg-background p-1 text-right text-lg font-bold"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                step="0.01"
              />
              <span className="font-bold text-lg">%</span>
            </div>
          ) : (
            <div className="text-3xl font-black text-foreground">
              {(rule.defaultRate * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleUpdate}
                className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
              >
                <Check className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-3 bg-secondary/50 text-muted-foreground rounded-2xl hover:bg-secondary hover:text-foreground transition-all border border-border/50 opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
