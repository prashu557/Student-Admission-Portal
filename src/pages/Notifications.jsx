import { motion } from "framer-motion";
import NotificationPanel from "../components/NotificationPanel";

export default function Notifications() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
        <p className="mt-1 text-gray-500">Latest admission, finance, document, and counselor updates.</p>
      </motion.div>

      <div className="h-[calc(100vh-190px)] min-h-[420px]">
        <NotificationPanel />
      </div>
    </div>
  );
}
