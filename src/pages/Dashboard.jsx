import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

import {
  FileText, CreditCard, CheckCircle, FileCheck,
  User, Mail, Phone, MapPin, BookOpen, MessageSquare, HeadphonesIcon,
} from "lucide-react";

import StatusCard from "../components/StatusCard";
import ProgressTracker from "../components/ProgressTracker";
import NotificationPanel from "../components/NotificationPanel";

export default function Dashboard() {
  const { student } = useOutletContext();
  const [showAssistant, setShowAssistant] = useState(false);
  const navigate = useNavigate();

  if (!student) return null;

  const canStartApplication =
    Boolean(student.Password) &&
    student.CRM_Status !== "Application Submitted" &&
    !student.Interested_Course;


  const speakAssistant = () => {
    const message = new SpeechSynthesisUtterance(
      "Welcome to Galgotias University Admission Portal. Please complete your profile, upload documents, select department, pay fees and submit your application."
    );
    message.rate = 1;
    message.pitch = 1;
    message.volume = 1;
    window.speechSynthesis.speak(message);
  };

  const statusCards = [
    {
      title: "Application Status",
      value: student.CRM_Status,
      icon: FileText,
      color: { bg: "bg-blue-100", text: "text-blue-600" },
    },
    {
      title: "Fee Status",
      value: student.Old_Status === "Fee Pending" ? "Pending" : "Paid",
      icon: CreditCard,
      color: { bg: "bg-emerald-100", text: "text-emerald-600" },
    },
    {
      title: "Eligibility",
      value: "Verified",
      icon: CheckCircle,
      color: { bg: "bg-indigo-100", text: "text-indigo-600" },
    },
    {
      title: "Document Ver.",
      value: student.Data_Quality_Flag,
      icon: FileCheck,
      color: { bg: "bg-purple-100", text: "text-purple-600" },
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#f2f3f5]">

      {/* Main Content — fixed padding (was 100px, now 28px sides / 32px top) */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-4 sm:px-5 lg:px-6 lg:py-5">

        <div className="flex h-full min-h-0 w-full flex-col gap-4">

          {/* Header */}
          <div className="flex shrink-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Welcome back, {student.Student_Name?.split(" ")[0] || 'Student'}!
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Here is what's happening with your admission process today.
              </p>
            </motion.div>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                onClick={() => { setShowAssistant(true); speakAssistant(); }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md text-sm"
              >
                <HeadphonesIcon size={18} />
                Voice Assistant
              </motion.button>
            </div>

          </div>

          {/* Status Cards */}
          <div className="grid shrink-0 grid-cols-2 lg:grid-cols-4 gap-3">
            {statusCards.map((card, index) => (
              <StatusCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                colorClass={card.color}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-4 gap-4">

            {/* Left Column */}
            <div className="min-h-0 overflow-hidden xl:col-span-3 space-y-4">

              <ProgressTracker currentStep={student.Application_Progress} />

              {/* Student Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-800">Application Details</h3>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full">
                    ID: {student.Legacy_ID}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                  <InfoItem icon={User}         label="Full Name"       value={student.Student_Name} />
                  <InfoItem icon={Mail}         label="Email Address"   value={student.Email} />
                  <InfoItem icon={Phone}        label="Phone Number"    value={student.Phone} />
                  <InfoItem icon={MapPin}       label="Location"        value={`${student.City}, ${student.State}`} />
                  <InfoItem icon={BookOpen}     label="Interested Course" value={student.Interested_Course} highlight />
                  <InfoItem
                    icon={MessageSquare}
                    label="Counselor"
                    value={
                      student.Counsellor_Name
                        ? `${student.Counsellor_Name}${student.Counsellor_Phone ? ` (${student.Counsellor_Phone})` : ""}`
                        : "-"
                    }
                  />
                </div>
              </motion.div>

            </div>

            {/* Right Column */}
            <div className="hidden space-y-4 min-h-0 flex-col xl:flex">

              <div className="h-[260px] min-h-0 overflow-hidden">
                <NotificationPanel />
              </div>

              {/* Support Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden shrink-0"
              >
                <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl" />

                <h3 className="text-xl font-bold mb-1 relative z-10">Need Help?</h3>
                <p className="text-indigo-200 text-base mb-4 relative z-10">
                  Our support team is ready to assist you with your application.
                </p>

                <div className="space-y-2 relative z-10">
                  <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 text-base font-medium transition-colors" onClick={() => navigate("/support")}> 
                    Help Center
                  </button>
                  <button
                    className="w-full bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl py-2.5 text-base font-bold transition-colors shadow-sm"
                    onClick={() => {
                      // Opens counselor chat in a new window/tab
                      window.open("about:blank", "counselor-chat", "noopener,noreferrer");
                      // TODO: Replace URL with your real chat/counselor URL
                    }}
                  >
                    Contact Counselor
                  </button>
                </div>

              </motion.div>

            </div>

          </div>

        </div>
      </div>

      {/* Voice Assistant Modal */}
      {showAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[480px] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-800">Admission Voice Assistant</h2>
              <button
                onClick={() => setShowAssistant(false)}
                className="text-gray-400 hover:text-red-500 font-bold text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { emoji: "✅", text: "Step 1: Complete Your Profile" },
                { emoji: "📄", text: "Step 2: Upload Documents" },
                { emoji: "🎓", text: "Step 3: Select Department" },
                { emoji: "💳", text: "Step 4: Pay Admission Fees" },
                { emoji: "🚀", text: "Step 5: Submit Application" },
              ].map(({ emoji, text }) => (
                <div key={text} className="p-4 bg-indigo-50 rounded-xl text-base font-medium text-indigo-800">
                  {emoji} {text}
                </div>
              ))}
            </div>

            {canStartApplication && (
              <button
                onClick={() => { setShowAssistant(false); navigate("/application-form"); }}
                className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Start Admission Process
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function InfoItem({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg mt-0.5 ${highlight ? "bg-indigo-100 text-indigo-600" : "bg-gray-50 text-gray-400"}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className={`font-semibold text-sm ${highlight ? "text-indigo-700" : "text-gray-800"}`}>{value}</p>
      </div>
    </div>
  );
}
