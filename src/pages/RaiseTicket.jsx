import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiUrl } from "../lib/api";

export default function RaiseTicket() {
  const { student } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: student?.Student_Name || "",
    email: student?.Email || "",
    phone: student?.Phone || "",
    subject: "Admission Support",
    message: "",
    priority: "Normal",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.message) {
      setError("Please enter Name, Email, and Message.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(apiUrl("/raise-ticket"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          priority: form.priority,
          legacyId: student?.Legacy_ID || "",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to raise ticket");
      }

      setSuccess("Ticket raised successfully. We'll get back to you soon.");
      setForm((prev) => ({ ...prev, message: "" }));

      setTimeout(() => {
        navigate("/support");
      }, 1200);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Raise a Support Ticket
        </h1>
        <p className="text-gray-500 mt-1">Describe your issue and our team will assist you.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm">{success}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (optional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 px-4 py-3"
              placeholder="Write your issue here..."
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/support")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

