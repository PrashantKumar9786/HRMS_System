import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

const fetchTeam = (id) => api.get(`/teams/${id}`).then((r) => r.data);
const fetchEmployees = () => api.get("/employees").then((r) => r.data);

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: () => fetchTeam(id),
  });
  const { data: allEmployees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const [selectedEmp, setSelectedEmp] = useState("");
  const [error, setError] = useState("");

  const memberIds = team?.members?.map((m) => m.id) || [];
  const unassigned = allEmployees.filter((e) => !memberIds.includes(e.id));

  const assignMutation = useMutation({
    mutationFn: (employeeId) => api.post(`/teams/${id}/assign`, { employeeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      queryClient.invalidateQueries(["employees"]);
      setSelectedEmp("");
      setError("");
    },
    onError: (err) =>
      setError(err.response?.data?.error || "Failed to assign."),
  });

  const removeMutation = useMutation({
    mutationFn: (employeeId) => api.delete(`/teams/${id}/assign/${employeeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      queryClient.invalidateQueries(["employees"]);
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center" style={{ color: "#6b7280" }}>
        Loading...
      </div>
    );
  if (!team)
    return (
      <div className="p-8 text-center" style={{ color: "#6b7280" }}>
        Team not found.
      </div>
    );

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/teams")}
          className="p-2 rounded-lg text-sm"
          style={{ background: "#ffffffff", color: "#000000ff" }}
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Members : {team.members?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members list */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Members</h2>
          {team.members?.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl"
              style={{ background: "#0f1013ff", border: "1px solid #1e2535" }}
            >
              <p className="text-white font-medium">No members yet</p>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                Assign employees from the panel
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: "#0f1013ff",
                    border: "1px solid #1e2535",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
                      style={{
                        background:
                          "linear-gradient(135deg, #ffffffff, #ffffffff)",
                      }}
                    >
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7280" }}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from team?`))
                        removeMutation.mutate(member.id);
                    }}
                    className="px-3 py-1 rounded text-xs font-medium hover:brightness-80 transition-all duration-200"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign panel */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#0f1013ff", border: "1px solid #1e2535" }}
        >
          <h2 className="text-white font-semibold mb-4">Assign Employee</h2>
          {error && (
            <div
              className="p-3 rounded-lg text-sm mb-4"
              style={{ background: "#ef444420", color: "#ef4444" }}
            >
              {error}
            </div>
          )}
          {unassigned.length === 0 ? (
            <p className="text-sm" style={{ color: "#c3c3c3ff" }}>
              All employees are already in this team.
            </p>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: "#0f1117", border: "1px solid #1e2535" }}
              >
                <option value="">Select employee...</option>
                {unassigned.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.role}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  selectedEmp && assignMutation.mutate(selectedEmp)
                }
                disabled={!selectedEmp || assignMutation.isPending}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-black"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #ffffff)",
                }}
              >
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
