import React, { useState, useEffect } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi, SalaryDisbursement, TaxSummary } from '@/api/accounting.api';
import { laborApi, StaffSummary } from '@/api/labor.api';

const SalaryDisbursementPage: React.FC = () => {
  const restaurantId = useRestaurantId();

  const [disbursements, setDisbursements] = useState<SalaryDisbursement[]>([]);
  const [pendingDisbursements, setPendingDisbursements] = useState<SalaryDisbursement[]>([]);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [payDate, setPayDate] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [disbursementsData, pendingData, taxData] = await Promise.all([
        accountingApi.getDisbursements(restaurantId),
        accountingApi.getPendingDisbursements(restaurantId),
        accountingApi.getPayrollTaxSummary(restaurantId, '2026-01-01', '2026-12-31')
      ]);
      setDisbursements(disbursementsData);
      setPendingDisbursements(pendingData);
      setTaxSummary(taxData);
    } catch (error) {
      console.error('Error loading salary disbursement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!payPeriodStart || !payPeriodEnd || !payDate) {
      alert('Please fill in all date fields');
      return;
    }

    try {
      setProcessing(true);
      await accountingApi.processPayroll(restaurantId, payPeriodStart, payPeriodEnd, payDate);
      await loadData();
      setShowProcessModal(false);
      alert('Payroll processed successfully! Journal entries created.');
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisburse = async (disbursementId: string) => {
    if (!confirm('Mark this salary as disbursed?')) return;

    try {
      setProcessing(true);
      await accountingApi.disburseSalary(restaurantId, disbursementId);
      await loadData();
      alert('Salary disbursed successfully!');
    } catch (error) {
      console.error('Error disbursing salary:', error);
      alert('Error disbursing salary');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      DISBURSED: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayDisbursements = activeTab === 'pending' ? pendingDisbursements : disbursements;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Disbursement</h1>
          <p className="text-gray-600">Process and track employee salary payments</p>
        </div>
        <button
          onClick={() => setShowProcessModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Process Payroll
        </button>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Gross Pay</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(taxSummary?.totalGrossPay || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Tax Withheld</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(taxSummary?.totalTax || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(taxSummary?.totalNetPay || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending Disbursements</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingDisbursements.length}</p>
        </div>
      </div>

      {/* Tax Breakdown */}
      {taxSummary && taxSummary.totalTax > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Tax Liability Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Federal Tax</p>
              <p className="font-semibold">{formatCurrency(taxSummary.federalTax)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State Tax</p>
              <p className="font-semibold">{formatCurrency(taxSummary.stateTax)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Social Security</p>
              <p className="font-semibold">{formatCurrency(taxSummary.socialSecurityTax)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Medicare</p>
              <p className="font-semibold">{formatCurrency(taxSummary.medicareTax)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Local Tax</p>
              <p className="font-semibold">{formatCurrency(taxSummary.localTax)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Disbursements ({pendingDisbursements.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Disbursements ({disbursements.length})
          </button>
        </nav>
      </div>

      {/* Disbursements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayDisbursements.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No salary disbursements found. Click "Process Payroll" to generate disbursements from clock-in data.
                </td>
              </tr>
            ) : (
              displayDisbursements.map((d) => (
                <tr key={d.disbursementId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{d.staffName}</div>
                    <div className="text-sm text-gray-500">{d.staffId.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(d.payPeriodStart)} - {formatDate(d.payPeriodEnd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {d.totalHours.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(d.hourlyRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(d.grossPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    -{formatCurrency(d.totalTax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(d.netPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(d.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {d.status === 'PENDING' && (
                      <button
                        onClick={() => handleDisburse(d.disbursementId)}
                        disabled={processing}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Mark Disbursed
                      </button>
                    )}
                    {d.status === 'APPROVED' && (
                      <button
                        onClick={() => handleDisburse(d.disbursementId)}
                        disabled={processing}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Disburse
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Process Payroll</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will automatically calculate salaries from clock-in/clock-out data for the pay period and create journal entries.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period Start</label>
                <input
                  type="date"
                  value={payPeriodStart}
                  onChange={(e) => setPayPeriodStart(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period End</label>
                <input
                  type="date"
                  value={payPeriodEnd}
                  onChange={(e) => setPayPeriodEnd(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayroll}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDisbursementPage;
