import { useState, useRef, useEffect } from 'react';

import {
  Bell,
  Menu,
  PlusCircle,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
  UserCircle,
  FileText
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../lib/api';

export default function Navbar({ toggleSidebar }) {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  // Append-only backend now marks applications via CRM_Status.
  // Only show Apply Now for students who are NOT already submitted/registered.
  const canStartApplication =
    Boolean(student?.Legacy_ID) &&
    student?.CRM_Status !== "Application Submitted" &&
    !student?.Interested_Course;


  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {

    function handleClickOutside(event) {

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotifMenu(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  useEffect(() => {
    if (!student?.Legacy_ID) return;

    let ignore = false;

    async function fetchNotifications() {
      setNotificationsLoading(true);

      try {
        const params = new URLSearchParams({
          legacyId: student.Legacy_ID,
          email: student.Email || "",
        });
        const response = await fetch(apiUrl(`/notifications?${params.toString()}`));
        const data = await response.json();

        if (!ignore && data.success) {
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("NAVBAR_NOTIFICATIONS_ERROR:", error);
      } finally {
        if (!ignore) setNotificationsLoading(false);
      }
    }

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [student?.Email, student?.Legacy_ID]);

  // Logout
  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  // Mark single notification read
  const markOneRead = (id) => {

    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    fetch(apiUrl(`/notifications/${id}/read`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legacyId: student?.Legacy_ID,
        email: student?.Email || "",
      }),
    }).catch((error) => console.error("MARK_NOTIFICATION_ERROR:", error));
  };

  // Mark all notifications read
  const markAllRead = () => {

    setNotifications((items) => items.map((item) => ({ ...item, read: true })));

    fetch(apiUrl("/notifications/read-all"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legacyId: student?.Legacy_ID,
        email: student?.Email || "",
      }),
    }).catch((error) => console.error("MARK_ALL_NOTIFICATIONS_ERROR:", error));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  return (

    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-sm">

      <div className="flex items-center justify-between">

        {/* Left Side */}
        <div className="flex items-center gap-4">

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {canStartApplication && (
            <button
              onClick={() => navigate('/application-form')}
              className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={17} />
              Apply Now
            </button>
          )}

          {/* Notifications */}
          <div
            className="relative"
            ref={notifRef}
          >

            <button
              onClick={() =>
                setShowNotifMenu(!showNotifMenu)
              }
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100"
            >

              <Bell size={20} />

              {unreadCount > 0 && (

                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>

              )}

            </button>

            <AnimatePresence>

              {showNotifMenu && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  transition={{
                    duration: 0.2
                  }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >

                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">

                    <h3 className="font-bold text-gray-800 text-sm">
                      Notifications
                    </h3>

                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>

                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">

                    {notificationsLoading && (
                      <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                    )}

                    {!notificationsLoading && notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                    )}

                    {!notificationsLoading && notifications.map((notif) => (

                      <div
                        key={notif.id}
                        onClick={() =>
                          markOneRead(notif.id)
                        }
                        className={`p-3 border-b border-gray-50 cursor-pointer transition-colors
                        ${
                          notif.read
                            ? 'bg-white'
                            : 'bg-indigo-50 hover:bg-indigo-100'
                        }`}
                      >

                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {notif.title}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-1">

                          <FileText size={10} />

                          {new Date(notif.createdAt).toLocaleString()}

                        </p>

                      </div>

                    ))}

                  </div>

                  {/* Footer */}
                  <div className="p-2 text-center border-t border-gray-100">

                    <button onClick={() => alert("All notifications opened")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1 w-full">
                      View all notifications
                    </button>

                  </div>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

          {/* Profile */}
          <div
            className="relative"
            ref={profileRef}
          >

            <div
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl"
            >

              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">

                <span className="font-bold text-sm">

                  {student?.Student_Name?.charAt(0) || (
                    <UserIcon size={18} />
                  )}

                </span>

              </div>

              <div className="hidden sm:block">

                <p className="text-sm font-semibold text-gray-800">

                  {student?.Student_Name || 'Student'}

                </p>

                <p className="text-xs text-gray-500">

                  {student?.Legacy_ID ? student.Legacy_ID : 'ID: N/A'}

                </p>

              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200
                ${
                  showProfileMenu
                    ? 'rotate-180'
                    : ''
                }`}
              />

            </div>

            <AnimatePresence>

              {showProfileMenu && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  transition={{
                    duration: 0.2
                  }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >

                  <div className="p-4 border-b border-gray-100">

                    <p className="text-sm font-bold text-gray-800">

                      {student?.Student_Name}

                    </p>

                    <p className="text-xs text-gray-500 truncate">

                      {student?.Email}

                    </p>

                  </div>

                  <div className="p-2 space-y-1">

                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-xl"
                    >

                      <UserCircle size={16} />

                      My Profile

                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-xl"
                    >

                      <Settings size={16} />

                      Account Settings

                    </button>

                  </div>

                  <div className="p-2 border-t border-gray-100">

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                    >

                      <LogOut size={16} />

                      Logout

                    </button>

                  </div>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

    </header>
  );
}
