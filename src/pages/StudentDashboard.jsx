import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, Alex!</h2>
        <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
          Application: In Review
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl hover-lift smooth-transition bg-white">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Application Form</h3>
          <p className="text-gray-500 text-sm mb-4">Your B.Tech Computer Science application is 100% complete.</p>
          <button className="text-indigo-600 font-medium text-sm hover:underline">View Form &rarr;</button>
        </div>

        <div className="glass-panel p-6 rounded-2xl hover-lift smooth-transition bg-white">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
          <p className="text-gray-500 text-sm mb-4">Pending review by the admission counselor.</p>
          <button className="text-amber-600 font-medium text-sm hover:underline">Upload Missing Docs &rarr;</button>
        </div>

        <div className="glass-panel p-6 rounded-2xl hover-lift smooth-transition bg-white opacity-75">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Fee Payment</h3>
          <p className="text-gray-500 text-sm mb-4">Locked. Available after application approval.</p>
        </div>
      </div>
    </div>
  );
}
