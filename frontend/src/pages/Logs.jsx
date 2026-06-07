import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const fetchLogs = () => api.get("/logs").then((r) => r.data);

export default function Logs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    refetchInterval: 10000,
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const getActionColor = (action) => {
    if (action.includes("logged in"))
      return { bg: "#22c55e20", color: "#22c55e" };
    if (action.includes("logged out"))
      return { bg: "#6b728020", color: "#9ca3af" };
    if (action.includes("deleted"))
      return { bg: "#ef444420", color: "#ef4444" };
    if (action.includes("added") || action.includes("created"))
      return { bg: "#6366f120", color: "#818cf8" };
    if (action.includes("updated"))
      return { bg: "#f59e0b20", color: "#f59e0b" };
    if (action.includes("assigned") || action.includes("removed"))
      return { bg: "#8b5cf620", color: "#a78bfa" };
    return { bg: "#1e2535", color: "#9ca3af" };
  };

  const getActionLabel = (action) => {
    if (action.includes("logged in")) return "LOGIN";
    if (action.includes("logged out")) return "LOGOUT";
    if (action.includes("deleted")) return "DELETE";
    if (action.includes("added")) return "CREATE";
    if (action.includes("created")) return "CREATE";
    if (action.includes("updated")) return "UPDATE";
    if (action.includes("assigned")) return "ASSIGN";
    if (action.includes("removed")) return "REMOVE";
    return "ACTION";
  };

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm mt-1" style={{ color: "#c7c7c7ff" }}>
          All system activity — last 100 entries
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16" style={{ color: "#6b7280" }}>
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: "#161b27", border: "1px solid #1e2535" }}
        >
          <div className="text-4xl mb-3">📋</div>
          <p className="text-white font-medium">No logs yet</p>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Activity will appear here
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #4d4d4d" }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "#000000ff",
                  borderBottom: "1px solid #1e2535",
                }}
              >
                {["Timestamp", "Type", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#535353ff" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const { bg, color } = getActionColor(log.action);
                return (
                  <tr
                    key={log.id}
                    style={{
                      background: "#000000ff",
                      borderBottom: "1px solid #1e2535",
                    }}
                  >
                    <td
                      className="px-4 py-3 text-sm font-mono"
                      style={{ color: "#6b7280" }}
                    >
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ background: bg, color }}
                      >
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "#9ca3af" }}
                    >
                      {log.action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
