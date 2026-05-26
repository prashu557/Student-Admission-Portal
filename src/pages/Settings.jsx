import { motion } from 'framer-motion';
import { Bell, UserX, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and security settings.</p>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Notifications */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Bell size={20} /></div>
            <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            <ToggleOption label="Email Notifications" desc="Receive updates about your application status." defaultChecked />
            <ToggleOption label="SMS Alerts" desc="Get urgent alerts on your registered mobile number." defaultChecked />
            <ToggleOption label="Promotional Emails" desc="Receive news about campus events and webinars." />
          </div>
        </div>

        {/* Security */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Shield size={20} /></div>
            <h2 className="text-xl font-bold text-gray-800">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <div>
                <p className="font-semibold text-gray-800">Password</p>
                <p className="text-xs text-gray-500">Last changed 3 months ago</p>
              </div>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Update</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <div>
                <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Enable</button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><UserX size={20} /></div>
            <h2 className="text-xl font-bold text-gray-800">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/30">
            <div>
              <p className="font-semibold text-gray-800">Withdraw Application</p>
              <p className="text-xs text-gray-500 max-w-sm">Permanently withdraw your admission application. This action cannot be undone.</p>
            </div>
            <button className="text-sm font-semibold text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Withdraw
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function ToggleOption({ label, desc, defaultChecked = false }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );
}
