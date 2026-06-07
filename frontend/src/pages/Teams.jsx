import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/Modal";
import Input from "../components/Input";

const fetchTeams = () => api.get("/teams").then((r) => r.data);

export default function Teams() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "" });
    setError("");
    setShowModal(true);
  };
  const openEdit = (team) => {
    setEditing(team);
    setForm({ name: team.name });
    setError("");
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing
        ? api.put(`/teams/${editing.id}`, data)
        : api.post("/teams", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      setShowModal(false);
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to save."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teams/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["teams"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    saveMutation.mutate(form);
  };

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Team Count : {teams.length}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-black hover:brightness-90 transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #ffffff, #ffffff)",
          }}
        >
          + Add Team
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16" style={{ color: "#6b7280" }}>
          Loading...
        </div>
      ) : teams.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: "#0f1013ff", border: "1px solid #1e2535" }}
        >
          <div className="mb-3 flex justify-center">
            <img src="/Team.png" alt="teams" className="w-[90px] h-[90px]" />
          </div>
          <p className="text-white font-medium">No teams yet</p>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Create your first team
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: "#0a0a0a", border: "1px solid #1e2535" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex items-center gap-3"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffffff, #ffffffff)",
                    }}
                  >
                    <img
                      src="/Team.png"
                      alt="team"
                      className="w-[30px] h-[30px]"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{team.name}</h3>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      {team.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(team)}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: "#000000ff", color: "#9ca3af" }}
                  >
                    <img src="/edit.png" alt="edit" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this team?"))
                        deleteMutation.mutate(team.id);
                    }}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: "#ef444420", color: "#ef4444" }}
                  >
                    <img src="/bin.jpg" alt="delete" />
                  </button>
                </div>
              </div>

              {/* Members preview */}
              <div
                className="flex flex-wrap gap-1"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                {team.members?.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffffff, #ffffffff)",
                    }}
                    title={m.name}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                ))}
                {team.members?.length > 4 && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#1e2535", color: "#6b7280" }}
                  >
                    +{team.members.length - 4}
                  </div>
                )}
                {team.members?.length === 0 && (
                  <span className="text-xs" style={{ color: "#4b5563" }}>
                    No members — click to assign
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? "Edit Team" : "Add Team"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ background: "#ef444420", color: "#ef4444" }}
              >
                {error}
              </div>
            )}
            <Input
              label="Team Name"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              required
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-500 hover:bg-white-500 transition-all duration-200"
                style={{ background: "#000000", color: "#efeff0ff" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black disabled:opacity-50 hover:brightness-80 transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #ffffff)",
                }}
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
