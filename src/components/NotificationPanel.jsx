import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

export default function NotificationPanel() {
  const { student } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!student?.Legacy_ID) return;

    try {
      const params = new URLSearchParams({
        legacyId: student.Legacy_ID,
        email: student.Email || "",
      });
      const response = await fetch(apiUrl(`/notifications?${params.toString()}`));
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("NOTIFICATION_PANEL_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchNotifications, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    await fetch(apiUrl(`/notifications/${id}/read`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legacyId: student?.Legacy_ID,
        email: student?.Email || "",
      }),
    }).catch((error) => console.error("MARK_NOTIFICATION_ERROR:", error));
  };

  const markAllAsRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));

    await fetch(apiUrl("/notifications/read-all"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legacyId: student?.Legacy_ID,
        email: student?.Email || "",
      }),
    }).catch((error) => console.error("MARK_ALL_NOTIFICATIONS_ERROR:", error));
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexShrink: 0,
        }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>Notifications</h3>

        <button
          onClick={markAllAsRead}
          disabled={!notifications.length}
          style={{
            border: "none",
            background: "transparent",
            color: "#4f46e5",
            cursor: notifications.length ? "pointer" : "default",
            fontWeight: "600",
            fontSize: "15px",
            opacity: notifications.length ? 1 : 0.45,
          }}
        >
          Mark all read
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: 0,
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {loading && <p className="text-sm text-gray-500">Loading notifications...</p>}

        {!loading && notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No notifications yet.
          </div>
        )}

        {!loading &&
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              style={{
                padding: "14px",
                borderRadius: "12px",
                cursor: "pointer",
                background: item.read ? "#f3f4f6" : "#eef2ff",
                border: item.read ? "1px solid #e5e7eb" : "1px solid #6366f1",
                transition: "0.3s",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: "#111827",
                  fontSize: "16px",
                }}
              >
                {item.title}
              </p>
              <p className="mt-1 text-sm text-gray-600">{item.message}</p>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {item.source} - {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
