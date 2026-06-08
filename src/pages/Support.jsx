import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, HelpCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

export default function Support() {
  const { student } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    subject: "Application Query",
    message: "",
    priority: "Normal",
  });

  const fetchQueries = useCallback(async () => {
    if (!student?.Legacy_ID) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        legacyId: student.Legacy_ID,
        email: student.Email || "",
      });
      const response = await fetch(apiUrl(`/queries?${params.toString()}`));
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch queries");
      }

      setQueries(data.queries || []);
    } catch (fetchError) {
      console.error("FETCH_QUERIES_ERROR:", fetchError);
      setError(fetchError.message || "Failed to fetch queries");
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchQueries, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchQueries]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(apiUrl("/queries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legacyId: student?.Legacy_ID,
          email: student?.Email || "",
          subject: form.subject,
          message: form.message,
          priority: form.priority,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to submit query");
      }

      setSuccess("Your application query was submitted.");
      setForm((current) => ({ ...current, message: "" }));
      await fetchQueries();
    } catch (submitError) {
      console.error("SUBMIT_QUERY_ERROR:", submitError);
      setError(submitError.message || "Failed to submit query");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Support & Help Center</h1>
        <p className="text-gray-500 mt-1">Raise application queries and track responses.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ContactCard
            icon={MessageCircle}
            title="Chat with Counselor"
            desc="Available 9 AM to 6 PM"
            action="Start Chat"
            color="indigo"
            onClick={() => {
              const demoWhatsAppNumber = "10000000000";
              const waUrl = `https://wa.me/${demoWhatsAppNumber}?text=${encodeURIComponent(
                "Hi, I need admission support."
              )}`;
              window.open(waUrl, "_blank", "noopener,noreferrer");
            }}
          />
          <ContactCard
            icon={Phone}
            title="Call Helpline"
            desc="Toll Free: 1800-123-4567"
            action="Call Now"
            color="emerald"
            onClick={() => {
              window.location.href = "tel:1800-123-4567";
            }}
          />
          <ContactCard
            icon={Mail}
            title="Email Us"
            desc="admissions@university.edu"
            action="Send Email"
            color="purple"
            onClick={() => {
              window.open(
                "https://mail.google.com/mail/?view=cm&fs=1&to=admissions%40university.edu&su=Admission%20Support",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Raise Application Query</h2>
            </div>

            {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  rows={5}
                  placeholder="Write your application doubt or issue..."
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={17} />
                {submitting ? "Submitting..." : "Submit Query"}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-5">Previous Queries</h2>

            {loading && <p className="text-sm text-gray-500">Loading queries...</p>}

            {!loading && queries.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                No application queries raised yet.
              </div>
            )}

            <div className="space-y-3">
              {!loading &&
                queries.map((query) => (
                  <div key={query.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-bold text-gray-900">{query.subject}</h3>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusStyles[query.status] || statusStyles.Pending}`}>
                        {query.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{query.message}</p>
                    {query.response ? (
                      <div className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-700">
                        <span className="font-semibold">Response:</span> {query.response}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">Awaiting counselor/admin response.</p>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(query.createdAt).toLocaleString()} - Priority: {query.priority}
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, desc, action, color, onClick }) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick?.();
      }}
      className={`border p-5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-colors ${colors[color]}`}
    >
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 mb-4">{desc}</p>
      <span className="text-sm font-semibold underline underline-offset-2">{action}</span>
    </motion.div>
  );
}
