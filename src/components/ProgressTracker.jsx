import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  "Profile Completed",
  "Documents Uploaded",
  "Eligibility Checked",
  "Fee Paid",
  "Under Review",
  "Accepted"
];

export default function ProgressTracker({ currentStep = 1 }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-5">Application Progress</h3>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-100 rounded-full -z-10"></div>
        
        {/* Progress bar fill */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-4 left-4 h-1 bg-indigo-600 rounded-full -z-10"
        ></motion.div>
        
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center relative z-0 w-1/6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors duration-300
                    ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                    ${isCurrent ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-4 ring-indigo-50' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-white border-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? <Check size={20} strokeWidth={3} /> : index + 1}
                </motion.div>
                <div className={`
                  mt-2 text-xs md:text-sm font-medium text-center px-1
                  ${isCurrent ? 'text-indigo-700' : ''}
                  ${isCompleted ? 'text-gray-800' : ''}
                  ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                `}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
