import React, { useState } from "react";
import PaymentHub from "./PaymentHub";
import ProviderOnboarding from "./components/ProviderOnboarding";
import PaymentFlow from "./components/PaymentFlow";
import SupplierPaySuccess from "./components/SupplierPaySuccess";
import { type PaymentProvider, type PaymentTransaction } from "../../types/payment.types";

type PaymentScreen = 'HUB' | 'ONBOARD' | 'PAY' | 'SUCCESS_ONBOARD' | 'SUCCESS_PAY';

const INITIAL_PROVIDERS: PaymentProvider[] = [
  { id: 'p1', type: 'ach', label: 'ACH / Bank transfer', bank: 'JPMorgan Chase', account: '4832', icon: '🏦', status: 'active' },
  { id: 'p2', type: 'vcard', label: 'Virtual card', bank: 'American Express', account: '7712', icon: '💳', status: 'active' },
];

export default function PaymentFeature() {
  const [activeScreen, setActiveScreen] = useState<PaymentScreen>('HUB');
  const [providers, setProviders] = useState<PaymentProvider[]>(INITIAL_PROVIDERS);
  const [lastProvider, setLastProvider] = useState<PaymentProvider | null>(null);
  const [lastTx, setLastTx] = useState<PaymentTransaction | null>(null);

  const handleAddProviderSuccess = (p: PaymentProvider) => {
    setProviders([...providers, p]);
    setLastProvider(p);
    setActiveScreen('SUCCESS_ONBOARD');
  };

  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    setLastTx(tx);
    setActiveScreen('SUCCESS_PAY');
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {activeScreen === 'HUB' && (
        <PaymentHub 
          onAddProvider={() => setActiveScreen('ONBOARD')} 
          onMakePayment={() => setActiveScreen('PAY')} 
        />
      )}

      {activeScreen === 'ONBOARD' && (
        <ProviderOnboarding 
          onCancel={() => setActiveScreen('HUB')} 
          onSuccess={handleAddProviderSuccess} 
        />
      )}

      {activeScreen === 'PAY' && (
        <PaymentFlow 
          providers={providers}
          onCancel={() => setActiveScreen('HUB')}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {activeScreen === 'SUCCESS_ONBOARD' && lastProvider && (
        <SupplierPaySuccess 
          title="Provider connected!"
          subtitle="You can now use this provider to pay suppliers immediately."
          details={[
            { label: "Type", value: lastProvider.label },
            { label: "Account", value: `${lastProvider.bank} (••••${lastProvider.account})` },
            { label: "Status", value: "Active" }
          ]}
          primaryAction={{ label: "Make a payment now", onClick: () => setActiveScreen('PAY') }}
          secondaryAction={{ label: "Back to home", onClick: () => setActiveScreen('HUB') }}
        />
      )}

      {activeScreen === 'SUCCESS_PAY' && lastTx && (
        <SupplierPaySuccess 
          title="Payment sent!"
          subtitle="Your supplier will receive the funds shortly. A confirmation email has been sent."
          details={[
            { label: "Reference", value: lastTx.ref },
            { label: "Supplier", value: lastTx.supplierName },
            { label: "Method", value: lastTx.method },
            { label: "Amount", value: `$${lastTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
            { label: "Status", value: "Sent" }
          ]}
          primaryAction={{ label: "Make another payment", onClick: () => setActiveScreen('PAY') }}
          secondaryAction={{ label: "Back to home", onClick: () => setActiveScreen('HUB') }}
        />
      )}
    </div>
  );
}
