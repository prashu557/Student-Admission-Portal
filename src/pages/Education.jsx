import { motion } from 'framer-motion';
import { Award, Plus, Trash2 } from 'lucide-react';

export default function Education() {
  const educations = [
    { id: 1, level: "10th Standard", school: "Delhi Public School", board: "CBSE", year: "2021", score: "92%" },
    { id: 2, level: "12th Standard", school: "Delhi Public School", board: "CBSE", year: "2023", score: "88%" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Education Background</h1>
          <p className="text-gray-500 mt-1">Provide your past academic records for eligibility checking.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Record
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educations.map((edu, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: index * 0.1 }}
            key={edu.id} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group"
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"><Trash2 size={18} /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{edu.level}</h3>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Institution</p>
                <p className="text-sm font-semibold text-gray-800">{edu.school}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Board / University</p>
                <p className="text-sm font-semibold text-gray-800">{edu.board}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Score / Percentage</p>
                <p className="text-sm font-bold text-indigo-600">{edu.score}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
