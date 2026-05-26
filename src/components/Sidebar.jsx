import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ClipboardList,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Application", icon: ClipboardList, path: "/application" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Documents", icon: FolderOpen, path: "/documents" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);

    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] min-w-[260px] shrink-0 flex-col bg-[#312E81] px-4 py-5 text-white lg:static ${
          isOpen ? "block" : "hidden lg:flex"
        }`}
      >
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Galgotias University"
            className="h-12 w-12 rounded-[10px] bg-white object-contain p-1.5"
          />

          <div className="min-w-0">
            <h1 className="text-[18px] font-bold leading-tight text-white">
              Galgotias University
            </h1>
            <p className="mt-0.5 text-[13px] text-indigo-200">
              Admission Portal
            </p>
          </div>

          <button
            onClick={toggleSidebar}
            className="ml-auto text-white/70 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;

            return (
              <button
                key={label}
                onClick={() => handleNavigate(path)}
                className={`flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[15px] transition-colors ${
                  isActive
                    ? "bg-black font-semibold text-white"
                    : "font-normal text-indigo-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[16px] text-red-400 transition-colors hover:bg-red-400/15"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>
    </>
  );
}
