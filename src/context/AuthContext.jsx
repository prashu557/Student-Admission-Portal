import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiUrl } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [student, setStudent] = useState(() => {
    const savedStudent = localStorage.getItem("crm_logged_in_student");

    if (!savedStudent) return null;

    try {
      return JSON.parse(savedStudent);
    } catch (error) {
      console.error("Failed to parse saved student from localStorage:", error);
      localStorage.removeItem("crm_logged_in_student");
      return null;
    }
  });

  const updateStudent = useCallback((updatedStudent) => {

    setStudent(updatedStudent);

    localStorage.setItem(
      "crm_logged_in_student",
      JSON.stringify(updatedStudent)
    );

  }, []);

  const refreshStudent = useCallback(async (currentStudent) => {

    if (!currentStudent?.Email && !currentStudent?.Legacy_ID) return;

    try {

      const params = new URLSearchParams({
        email: currentStudent.Email || "",
        legacyId: currentStudent.Legacy_ID || "",
      });

      const response = await fetch(
        apiUrl(`/student?${params.toString()}`)
      );

      const data = await response.json();

      if (data.success) {
        updateStudent(data.student);
      }

    } catch (error) {

      console.error("REFRESH STUDENT ERROR:", error);

    }

  }, [updateStudent]);

  /* Check Login on Refresh */
  useEffect(() => {
    const savedStudent = localStorage.getItem("crm_logged_in_student");

    if (!savedStudent) return;

    try {
      const parsedStudent = JSON.parse(savedStudent);
      setTimeout(() => refreshStudent(parsedStudent), 0);
    } catch (error) {
      console.error("Failed to parse saved student from localStorage:", error);
      localStorage.removeItem("crm_logged_in_student");
    }
  }, [refreshStudent]);

  /* REAL Backend Login */
  const login = async (input, password) => {

  try {

    const response = await fetch(
      apiUrl("/login"),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          input: input.trim(),
          email: input.trim(),
          password,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    console.log("LOGIN RESPONSE:", data);

    if (response.ok && data.success) {

      updateStudent(data.student);
      console.log(data.student);

      return {
        success: true,
        student: data.student,
      };

    } else {

      return {
        success: false,
        message: data.message,
      };

    }

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return {
      success: false,
      message: "Server error",
    };

  }

};

  /* Logout */
  const logout = () => {

    setStudent(null);

    localStorage.removeItem(
      "crm_logged_in_student"
    );

  };

  return (

    <AuthContext.Provider
      value={{
        student,
        login,
        logout,
        updateStudent,
        refreshStudent,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
}

export const useAuth = () => useContext(AuthContext);
