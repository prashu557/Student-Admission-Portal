import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  ClipboardList,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Percent,
  Phone,
  Send,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

const MIN_ELIGIBILITY_PERCENTAGE = 65;

const courseCriteria = {
  "B.Tech CSE": "Minimum 65% in 12th percentage",
  BCA: "Minimum 65% in 12th percentage",
  "B.Com": "Minimum 65% in 12th percentage",
  MBA: "Minimum 65% in graduation percentage",
};

const initialFormData = {
  Legacy_ID: "",
  Student_Name: "",
  Phone: "",
  Email: "",
  Password: "",
  City: "",
  State: "",
  Interested_Course: "",
  Campus_Preference: "",
  Intake_Session: "",
  Mode_of_Study: "",
  Tenth_Percentage: "",
  Twelfth_Percentage: "",
  Graduation_Percentage: "",
  Father_Name: "",
  Mother_Name: "",
  Category: "",
  Nationality: "",
  Address: "",
  Pincode: "",
  Lead_Source: "",
  Priority: "",
  Remarks: "",
};

function getInitialFormData(student) {
  if (!student) return initialFormData;

  return {
    ...initialFormData,
    Legacy_ID: student.Legacy_ID || "",
    Student_Name: student.Student_Name || "",
    Phone: student.Phone || "",
    Email: student.Email || "",
    Password: student.Password || "",
    City: student.City || "",
    State: student.State || "",
    Interested_Course: student.Interested_Course || "",
    Lead_Source: student.Lead_Source || "",
    Priority: student.Priority || "",
    Remarks: student.Remarks || "",
  };
}

export default function ApplicationForm() {
  const { student, updateStudent, refreshStudent } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => getInitialFormData(student));
  const selectedCourseCriteria = courseCriteria[formData.Interested_Course];
  const requiredPercentage =
    formData.Interested_Course === "MBA"
      ? formData.Graduation_Percentage
      : formData.Twelfth_Percentage;
  const percentageNumber = Number(requiredPercentage);
  const hasRequiredPercentage = requiredPercentage !== "" && !Number.isNaN(percentageNumber);
  const isEligible = hasRequiredPercentage && percentageNumber >= MIN_ELIGIBILITY_PERCENTAGE;
  const canStartApplication =
    Boolean(student?.Password) &&
    student?.CRM_Status !== "Application Submitted" &&
    !student?.Interested_Course;

  if (!canStartApplication) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application already available</h1>
          <p className="mt-3 text-base text-gray-600">
            This student does not need to start a new application. You can update student details from the profile section.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEligible) {
      alert(`Student is not eligible. Minimum ${MIN_ELIGIBILITY_PERCENTAGE}% is required for ${formData.Interested_Course || "the selected course"}.`);
      return;
    }

    try {
      if (!formData.Email) {
        alert("Email is missing. Please login again.");
        return;
      }

      if (!formData.Legacy_ID) {
        alert("Application ID (Legacy_ID) is missing. Please update your profile and try again.");
        return;
      }

      const response = await fetch(apiUrl("/submit-application"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          Eligibility_Status: "Eligible",
          Eligibility_Criteria: selectedCourseCriteria,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Prefer backend-provided message
        alert(data?.message || "Application submission failed");
        return;
      }

      if (data.success) {
        alert("Application Submitted Successfully");
        updateStudent(data.student);
        // Ensure latest DB values (CRM_Status, Counsellor_Name/Phone, etc.) are reflected everywhere
        await refreshStudent(data.student);
        navigate("/dashboard");
      } else {
        alert(data?.message || "Application submission failed");
      }
    } catch (error) {
      console.error("APPLICATION SUBMIT FRONTEND ERROR:", error);
      alert(
        error?.message ||
          "Server error. Please check backend logs (terminal)."
      );
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
            New Student Application
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Student Application Form
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600">
            Capture the same student, program, background, and address details shown in the application section.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Application Type</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">Fresh Admission</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          icon={User}
          title="Student Details"
          description="Primary contact information for the applicant."
        >
          <TextField icon={User} name="Student_Name" label="Student Name" value={formData.Student_Name} onChange={handleChange} required />
          <TextField icon={Phone} name="Phone" label="Phone Number" value={formData.Phone} onChange={handleChange} required />
          <TextField icon={Mail} type="email" name="Email" label="Email Address" value={formData.Email} onChange={handleChange} required />
          <TextField icon={MapPin} name="City" label="City" value={formData.City} onChange={handleChange} />
          <TextField icon={MapPin} name="State" label="State" value={formData.State} onChange={handleChange} />
        </FormSection>

        <FormSection
          icon={Percent}
          title="Eligibility Criteria"
          description="A minimum of 65% is required. Undergraduate courses use 12th percentage; MBA uses graduation percentage."
        >
          <TextField
            icon={Percent}
            type="number"
            name="Tenth_Percentage"
            label="10th Percentage"
            value={formData.Tenth_Percentage}
            onChange={handleChange}
          />
          <TextField
            icon={Percent}
            type="number"
            name="Twelfth_Percentage"
            label="12th Percentage"
            value={formData.Twelfth_Percentage}
            onChange={handleChange}
            required={formData.Interested_Course !== "MBA"}
          />
          <TextField
            icon={Percent}
            type="number"
            name="Graduation_Percentage"
            label="Graduation Percentage"
            value={formData.Graduation_Percentage}
            onChange={handleChange}
            required={formData.Interested_Course === "MBA"}
          />

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(courseCriteria).map(([course, criteria]) => (
                <div key={course} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-gray-900">{course}</p>
                  <p className="mt-1 text-sm text-gray-500">{criteria}</p>
                </div>
              ))}
            </div>

            <div
              className={`mt-4 rounded-xl border p-4 ${
                isEligible
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <p className="text-base font-bold">
                {isEligible ? "Eligible for selected course" : "Eligibility pending"}
              </p>
              <p className="mt-1 text-sm">
                {formData.Interested_Course
                  ? selectedCourseCriteria
                  : "Select a course and enter the required marks to check eligibility."}
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={BookOpen}
          title="Program Selection"
          description="These fields match the program information shown inside Application Details."
        >
          <SelectField icon={BookOpen} name="Interested_Course" label="Course Applied For" value={formData.Interested_Course} onChange={handleChange} required>
            <option value="">Select Course</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="BCA">BCA</option>
            <option value="MBA">MBA</option>
            <option value="B.Com">B.Com</option>
          </SelectField>
          <SelectField icon={Building} name="Campus_Preference" label="Campus Preference" value={formData.Campus_Preference} onChange={handleChange}>
            <option value="">Select Campus</option>
            <option value="Main Campus, Greater Noida">Main Campus, Greater Noida</option>
            <option value="City Campus, New Delhi">City Campus, New Delhi</option>
          </SelectField>
          <SelectField icon={Calendar} name="Intake_Session" label="Intake Session" value={formData.Intake_Session} onChange={handleChange}>
            <option value="">Select Session</option>
            <option value="Fall 2026">Fall 2026</option>
            <option value="Spring 2027">Spring 2027</option>
          </SelectField>
          <SelectField icon={CheckCircle} name="Mode_of_Study" label="Mode of Study" value={formData.Mode_of_Study} onChange={handleChange}>
            <option value="">Select Mode</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Online">Online</option>
          </SelectField>
        </FormSection>

        <FormSection
          icon={Users}
          title="Personal Background"
          description="Family and identity details used for application verification."
        >
          <TextField icon={Users} name="Father_Name" label="Father's Name" value={formData.Father_Name} onChange={handleChange} />
          <TextField icon={Users} name="Mother_Name" label="Mother's Name" value={formData.Mother_Name} onChange={handleChange} />
          <SelectField icon={ClipboardList} name="Category" label="Category" value={formData.Category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </SelectField>
          <TextField icon={CheckCircle} name="Nationality" label="Nationality" value={formData.Nationality} onChange={handleChange} />
        </FormSection>

        <FormSection
          icon={Home}
          title="Permanent Address"
          description="Address details displayed in the student's application profile."
        >
          <TextArea icon={Home} name="Address" label="Address" value={formData.Address} onChange={handleChange} rows={4} wide />
          <TextField icon={MapPin} name="Pincode" label="Pincode" value={formData.Pincode} onChange={handleChange} />
        </FormSection>

        <FormSection
          icon={MessageSquare}
          title="Admission CRM Details"
          description="Internal lead information for counselor tracking."
        >
          <SelectField icon={ClipboardList} name="Lead_Source" label="Lead Source" value={formData.Lead_Source} onChange={handleChange}>
            <option value="">Select Lead Source</option>
            <option value="Website">Website</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Walk-in">Walk-in</option>
          </SelectField>
          <SelectField icon={CheckCircle} name="Priority" label="Priority" value={formData.Priority} onChange={handleChange}>
            <option value="">Select Priority</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </SelectField>
          <TextArea icon={MessageSquare} name="Remarks" label="Remarks" value={formData.Remarks} onChange={handleChange} rows={4} wide />
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-gray-900">Ready to submit?</p>
              <p className="text-sm text-gray-500">Review the information once before creating the application.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <Send size={18} />
              Submit Application
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </motion.section>
  );
}

function TextField({ icon: Icon, label, name, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
        <Icon size={18} className="text-gray-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </label>
  );
}

function SelectField({ icon: Icon, label, name, value, onChange, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
        <Icon size={18} className="text-gray-400" />
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent text-base font-medium text-gray-900 outline-none"
        >
          {children}
        </select>
      </div>
    </label>
  );
}

function TextArea({ icon: Icon, label, name, value, onChange, rows = 4, wide = false }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
        <Icon size={18} className="mt-1 text-gray-400" />
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full resize-none bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </label>
  );
}
