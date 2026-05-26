import { Database, UserCheck } from 'lucide-react';

export default function ERPDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ERP Admin Portal</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl bg-white space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Enrollment Synchronization</h3>
          </div>
          <p className="text-sm text-gray-600">
            Sync financially cleared students into the main ERP system, generating official roll numbers and institutional email addresses.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 smooth-transition">
            Run Sync (0 Pending)
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-white space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Batch & Section Allocation</h3>
          </div>
          <p className="text-sm text-gray-600">
            Automatically assign sections to new enrollees based on program capacity and elective preferences.
          </p>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 smooth-transition">
            Manage Batches
          </button>
        </div>
      </div>
    </div>
  );
}
