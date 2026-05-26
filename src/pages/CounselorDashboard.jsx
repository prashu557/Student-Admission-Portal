import { Search, Filter, MoreVertical } from 'lucide-react';

const applicants = [
  { id: 'APP001', name: 'Alex Johnson', program: 'B.Tech CS', status: 'Pending Review', date: '2026-05-20' },
  { id: 'APP002', name: 'Samantha Lee', program: 'MBA', status: 'Approved', date: '2026-05-21' },
  { id: 'APP003', name: 'Michael Chen', program: 'B.Sc Physics', status: 'Missing Docs', date: '2026-05-22' },
];

export default function CounselorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search applicants..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">App ID</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">Applicant Name</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">Program</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">Date Applied</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{app.id}</td>
                <td className="py-4 px-6 text-sm text-gray-700">{app.name}</td>
                <td className="py-4 px-6 text-sm text-gray-700">{app.program}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'Missing Docs' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">{app.date}</td>
                <td className="py-4 px-6 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <MoreVertical className="w-5 h-5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
