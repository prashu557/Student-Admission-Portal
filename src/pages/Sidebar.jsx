import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  GraduationCap,
  CreditCard,
  HeadphonesIcon,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard" },
  { label: "Profile",     icon: User,             path: "/profile" },

  { label: "Documents",   icon: FolderOpen,       path: "/documents" },
  { label: "Education",   icon: GraduationCap,    path: "/education" },
  { label: "Payment",     icon: CreditCard,       path: "/payment" },
  { label: "Support",     icon: HeadphonesIcon,   path: "/support" },
  { label: "Settings",    icon: Settings,         path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear session/auth here if needed
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "260px",
        minWidth: "260px",
        background: "#312E81",
        color: "white",
        height: "100%",
        padding: "20px 16px",
        boxSizing: "border-box",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <img
          src="/logo.png"
          alt="Galgotias University"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            background: "white",
            padding: "5px",
            objectFit: "contain",
          }}
        />
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "white" }}>
            Galgotias University
          </h1>
          <p style={{ margin: 0, marginTop: "2px", fontSize: "13px", color: "#a5b4fc" }}>
            Admission Portal
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: isActive ? "#000000" : "transparent",
                color: isActive ? "white" : "#c7d2fe",
                border: "none",
                padding: "10px 14px",
                borderRadius: "10px",
                textAlign: "left",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: isActive ? "600" : "400",
                transition: "background 0.2s, color 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#c7d2fe";
                }
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "transparent",
          color: "#f87171",
          border: "none",
          padding: "10px 14px",
          borderRadius: "10px",
          textAlign: "left",
          fontSize: "16px",
          cursor: "pointer",
          fontWeight: "400",
          transition: "background 0.2s",
          width: "100%",
          marginTop: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(248,113,113,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}
