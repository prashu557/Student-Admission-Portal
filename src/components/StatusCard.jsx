import { motion } from 'framer-motion';

export default function StatusCard({ title, value, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover-lift smooth-transition relative overflow-hidden"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${colorClass.bg}`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-xl font-bold text-gray-800 md:text-2xl">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}
