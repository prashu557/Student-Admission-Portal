import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Finance & Fee Collection</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Collected</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">$124,500</p>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-2 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Dues</h3>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">$32,000</p>
          <div className="flex items-center gap-1 text-sm text-red-600 mt-2 font-medium">
            <ArrowDownRight className="w-4 h-4" />
            <span>52 students pending</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Scholarships Issued</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">$15,000</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">12 students awarded</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden bg-white mt-8 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
        <p className="text-gray-500 text-sm">Transaction list will be populated from the database.</p>
      </div>
    </div>
  );
}
