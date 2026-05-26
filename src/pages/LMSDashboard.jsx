import { BookOpen, Key, Users } from 'lucide-react';

export default function LMSDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">LMS Provisioning Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl bg-white border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active Courses</p>
              <h3 className="text-2xl font-bold text-gray-900">45</h3>
            </div>
            <BookOpen className="w-6 h-6 text-indigo-500" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-white border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Provisioned Students</p>
              <h3 className="text-2xl font-bold text-gray-900">1,250</h3>
            </div>
            <Users className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-white border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending Access</p>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
            </div>
            <Key className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Course Assignment</h3>
        <p className="text-gray-600 text-sm mb-4">
          Once students are fully enrolled via ERP, they automatically appear here for LMS credential generation and course material access.
        </p>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 smooth-transition">
          Provision Pending Students
        </button>
      </div>
    </div>
  );
}
