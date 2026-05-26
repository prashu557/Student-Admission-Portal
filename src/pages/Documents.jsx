import { motion } from "framer-motion";
import { CheckCircle, Clock, FileText } from "lucide-react";
import DocumentUploadManager from "../components/DocumentUploadManager";

export default function Documents() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Document Center</h1>
        <p className="text-gray-500 mt-1">Upload and manage your admission documents.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 xl:col-span-1 h-fit"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Required Documents</h3>
              <p className="text-sm text-gray-500">PDF, JPG, or PNG up to 5MB.</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> 10th Marksheet</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> 12th Marksheet</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Graduation Certificate</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Transfer Certificate</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Migration Certificate</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Aadhaar Card</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Passport Photo</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Signature</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 xl:col-span-2 p-6"
        >
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Uploaded Files</h3>
            <p className="mt-1 text-sm text-gray-500">Upload new files or update existing submissions.</p>
          </div>
          <DocumentUploadManager compact />
        </motion.div>
      </div>
    </div>
  );
}
