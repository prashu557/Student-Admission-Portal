import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Monitor, Cpu, Database, Network } from 'lucide-react';

export default function Department() {
  const { student } = useOutletContext();
  
  const departments = [
    { id: "cs", name: "Computer Science", icon: Monitor, seats: 120, status: "Available", desc: "Software, AI/ML, Data Science" },
    { id: "ece", name: "Electronics & Comm.", icon: Cpu, seats: 60, status: "Filling Fast", desc: "VLSI, IoT, Embedded Systems" },
    { id: "it", name: "Information Tech.", icon: Database, seats: 90, status: "Available", desc: "Web Dev, Cloud, Cybersecurity" },
    { id: "mech", name: "Mechanical Engg.", icon: Network, seats: 30, status: "Few Seats Left", desc: "Automobile, Robotics, Design" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Department Selection</h1>
        <p className="text-gray-500 mt-1">Select your preferred major/department for admission.</p>
      </motion.div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-indigo-900">Your Current Preference</h3>
          <p className="text-indigo-700">{student?.Interested_Course}</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Confirm Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: index * 0.1 }}
            key={dept.id} 
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md
              ${dept.name.includes("Computer") ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-gray-100'}
            `}
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <dept.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{dept.name}</h3>
            <p className="text-xs text-gray-500 mb-4 h-8">{dept.desc}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Seats</p>
                <p className="text-sm font-semibold text-gray-700">{dept.seats}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md
                ${dept.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
              `}>
                {dept.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
