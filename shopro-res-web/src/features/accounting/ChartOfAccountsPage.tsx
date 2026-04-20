import React, { useState, useEffect } from 'react';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { accountingApi, ChartOfAccount } from '@/api/accounting.api';

const ChartOfAccountsPage: React.FC = () => {
  const restaurantId = useRestaurantId();

  const [accounts, setAccounts] = useState<Record<string, ChartOfAccount[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE']));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccounts();
  }, [restaurantId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.getAccounts(restaurantId);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filterAccounts = (accountList: ChartOfAccount[]) => {
    if (!searchTerm) return accountList;
    return accountList.filter(a => 
      a.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ASSET: 'bg-blue-100 text-blue-800',
      LIABILITY: 'bg-red-100 text-red-800',
      EQUITY: 'bg-purple-100 text-purple-800',
      REVENUE: 'bg-green-100 text-green-800',
      EXPENSE: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSubtotal = (accountList: ChartOfAccount[]) => {
    return accountList.reduce((sum, a) => sum + a.balance, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const accountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">View and manage all accounting accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search accounts by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 border rounded-lg px-4 py-2 pl-10"
        />
        <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {accountTypes.map(type => {
          const accountList = accounts[type] || [];
          const total = getSubtotal(accountList);
          return (
            <div key={type} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">{type}</p>
              <p className="text-xl font-bold">{accountList.length}</p>
              <p className={`text-sm font-medium ${total >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                {formatCurrency(total)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Account List by Type */}
      <div className="space-y-4">
        {accountTypes.map(type => {
          const accountList = accounts[type] || [];
          const filteredList = filterAccounts(accountList);
          
          if (filteredList.length === 0) return null;

          return (
            <div key={type} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Type Header */}
              <button
                onClick={() => toggleType(type)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
                    {type}
                  </span>
                  <span className="font-semibold text-gray-900">{filteredList.length} accounts</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Total: {formatCurrency(getSubtotal(filteredList))}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedTypes.has(type) ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Accounts Table */}
              {expandedTypes.has(type) && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sub-type</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredList.map((account) => (
                      <tr key={account.accountId} className="hover:bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap font-mono text-sm">{account.accountCode}</td>
                        <td className="px-6 py-3 whitespace-nowrap font-medium">{account.accountName}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{account.accountSubType}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{account.description}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-right font-mono">
                          <span className={account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}>
                            {formatCurrency(account.balance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartOfAccountsPage;
