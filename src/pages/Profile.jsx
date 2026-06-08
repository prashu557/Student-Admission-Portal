import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DocumentUploadManager from "../components/DocumentUploadManager";
import { apiUrl } from "../lib/api";

const editableFields = [
  ["Student_Name", "Full Name"],
  ["Email", "Email Address"],
  ["Phone", "Phone Number"],
  ["City", "City"],
  ["State", "State"],
  ["Address", "Address"],
  ["Pincode", "Pincode"],
  ["Father_Name", "Father Name"],
  ["Mother_Name", "Mother Name"],
  ["Category", "Category"],
  ["Nationality", "Nationality"],
  ["Interested_Course", "Course Preference"],
  ["Campus_Preference", "Campus Preference"],
  ["Intake_Session", "Intake Session"],
  ["Mode_of_Study", "Mode of Study"],
];

function buildForm(student) {
  const next = {};
  editableFields.forEach(([key]) => {
    next[key] = student?.[key] || "";
  });
  return next;
}

export default function Profile() {
  const { student, updateStudent, refreshStudent } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => buildForm(student));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setForm(buildForm(student)), 0);
    return () => window.clearTimeout(timeout);
  }, [student]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    setMessage("");
    setError("");

    if (!form.Student_Name.trim() || !form.Email.trim()) {
      setError("Student name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(apiUrl("/student/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legacyId: student?.Legacy_ID,
          updates: form,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Profile update failed");
      }

      updateStudent(data.student);
      await refreshStudent(data.student);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      console.error("SAVE_PROFILE_ERROR:", saveError);
      setError(saveError.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Student Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and contact details.</p>
      </motion.div>

      {message && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center lg:col-span-1"
        >
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
                <span className="text-4xl font-bold text-indigo-200">
                  {student?.Student_Name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{student?.Student_Name || "Unknown Student"}</h2>
          <p className="text-sm text-indigo-600 font-medium mb-4">{student?.Legacy_ID || "ID: Pending"}</p>

          <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3 text-left">
            <ProfileLine icon={Mail} value={student?.Email} />
            <ProfileLine icon={Phone} value={student?.Phone || "Phone not set"} />
            <ProfileLine icon={MapPin} value={`${student?.City || "-"}, ${student?.State || "-"}`} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
            <button
              type="button"
              onClick={() => {
                setIsEditing((current) => !current);
                setForm(buildForm(student));
                setError("");
                setMessage("");
              }}
              className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Details"}
            </button>
          </div>

          <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableFields.map(([key, label]) => (
                <InputField
                  key={key}
                  label={label}
                  value={form[key]}
                  disabled={!isEditing}
                  type={key === "Email" ? "email" : "text"}
                  onChange={(value) => handleChange(key, value)}
                  wide={key === "Address"}
                />
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>

      {student?.CRM_Status === "Application Submitted" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
        >
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Admission Documents</h3>
            <p className="mt-1 text-sm text-gray-500">Upload or update documents required for your submitted application.</p>
          </div>
          <DocumentUploadManager />
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
          Document upload unlocks after the admission application is submitted.
        </div>
      )}
    </div>
  );
}

function ProfileLine({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <Icon size={16} className="text-gray-400" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function InputField({ label, type = "text", value, disabled, onChange, wide }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`px-4 py-2.5 rounded-xl border border-gray-200 outline-none transition-all
          ${disabled ? "bg-gray-50 text-gray-500" : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}
        `}
      />
    </div>
  );
}
