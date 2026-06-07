import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../api/axios";

export default function Layout() {
  const { org, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/employees",
      label: "Employees",
      icon: <img src="/employee.png" alt="Employees" className="w-8 h-8" />,
    },
    {
      to: "/teams",
      label: "Teams",
      icon: <img src="/Teams.png" alt="Teams" className="w-8 h-8" />,
    },
    {
      to: "/logs",
      label: "Audit Logs",
      icon: <img src="/audit.png" alt="Audit Logs" className="w-8 h-8" />,
    },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0f1117", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col"
        style={{ background: "#000000ff", borderRight: "1px solid #424242" }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "#1e2535" }}>
          <div className="flex items-center gap-3">
            <img src="/hrms.jpg" alt="HRMS" className="w-8 h-8" />
            <div>
              <div className="font-bold text-white text-sm">HRMS</div>
              <div
                className="text-xs truncate max-w-32"
                style={{ color: "#6b7280" }}
              >
                {org?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, #ffffffff, #fffcfcff)",
                    }
                  : {}
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: "#1e2535" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span>
              <img src="/logout.jpg" alt="Logout" className="w-10 h-10" />
            </span>{" "}
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "#000000ff", height: "100vh" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
