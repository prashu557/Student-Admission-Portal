import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, FileText, Phone, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

function getStepIcon(step) {
  if (step.negative) return XCircle;
  if (step.complete) return CheckCircle;
  if (step.pending) return Clock;
  return Circle;
}

export default function Application() {
  const { student } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplication = useCallback(async () => {
    if (!student?.Legacy_ID) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        legacyId: student.Legacy_ID,
        email: student.Email || "",
      });
      const response = await fetch(apiUrl(`/application-status?${params.toString()}`));
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch application status");
      }

      setApplication(data.application);
    } catch (fetchError) {
      console.error("FETCH_APPLICATION_ERROR:", fetchError);
      setError(fetchError.message || "Failed to fetch application status");
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchApplication, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchApplication]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Application</h1>
        <p className="text-gray-500 mt-1">Track your admission application progress dynamically.</p>
      </motion.div>

      {loading && <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm">Loading application status...</div>}
      {error && <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>}

      {!loading && application && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2"
          >
            <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Progress Timeline</h2>
                <p className="mt-1 text-sm text-gray-500">Current status: {application.status}</p>
              </div>
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                ID: {application.legacyId}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {application.steps.map((step, index) => {
                const Icon = getStepIcon(step);
                const color = step.negative
                  ? "border-red-100 bg-red-50 text-red-700"
                  : step.complete
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : step.pending
                      ? "border-amber-100 bg-amber-50 text-amber-700"
                      : "border-gray-100 bg-gray-50 text-gray-500";

                return (
                  <div key={step.key} className={`rounded-xl border p-4 ${color}`}>
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide">Step {index + 1}</p>
                        <p className="font-bold">{step.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Application Details</h3>
                  <p className="text-sm text-gray-500">{application.course || "Course not selected"}</p>
                </div>
              </div>

              <InfoRow label="Submitted" value={application.submittedAt || "-"} />
              <InfoRow label="Last Update" value={application.updatedAt || "-"} />
              <InfoRow label="Status" value={application.status || "-"} />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-bold text-amber-800">Counselor Review</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-700">
                {application.remarks || "No counselor remarks yet."}
              </p>
              {application.counsellorName && (
                <div className="mt-4 text-sm font-semibold text-amber-700">
                  {application.counsellorName}
                  {application.counsellorPhone && (
                    <span className="mt-1 flex items-center gap-1">
                      <Phone size={13} />
                      {application.counsellorPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-3 text-sm">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
