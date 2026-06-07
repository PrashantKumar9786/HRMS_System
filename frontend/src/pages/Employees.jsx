import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import Modal from "../components/Modal";
import Input from "../components/Input";

const fetchEmployees = () => api.get("/employees").then((r) => r.data);

export default function Employees() {
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "" });
    setError("");
    setShowModal(true);
  };
  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, role: emp.role });
    setError("");
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing
        ? api.put(`/employees/${editing.id}`, data)
        : api.post("/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      setShowModal(false);
    },
    onError: (err) => setError(err.response?.data?.error || "Failed to save."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["employees"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    saveMutation.mutate(form);
  };

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Members : {employees.length}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-black hover:opacity-80 transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #ffffff, #ffffff)",
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-16" style={{ color: "#6b7280" }}>
          Loading...
        </div>
      ) : employees.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: "#0f1013ff", border: "1px solid #1e2535" }}
        >
          <div className="flex justify-center mb-3">
            <img
              src="/profile.png"
              alt="employees"
              className="w-[90px] h-[90px]"
            />
          </div>
          <p className="text-white font-medium">No employees yet</p>
          <p className="text-sm mt-1" style={{ color: "#888888ff" }}>
            Add your first employee to get started
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #9d9d9d" }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "#000000ff",
                  borderBottom: "1px solid #9d9d9d",
                }}
              >
                {["Name", "Email", "Role", "Teams", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#c5c5c5ff" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr
                  key={emp.id}
                  style={{
                    background: i % 2 === 0 ? "#000000ff" : "#000000ff",
                    borderBottom: "1px solid #9d9d9d    ",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffffffff, #ffffffff)",
                        }}
                      >
                        {emp.name[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">
                        {emp.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#9ca3af" }}
                  >
                    {emp.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-md text-sm font-medium"
                      style={{ background: "#ffffff20", color: "#ffffffff" }}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {emp.teams?.length > 0 ? (
                        emp.teams.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 rounded text-sm"
                            style={{
                              background: "#ffffff20",
                              color: "#ffffffff",
                            }}
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-sm"
                          style={{ color: "#ffffffff" }}
                        >
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="px-3 py-1 rounded text-sm font-medium text-white"
                        style={{ background: "#1e2535" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this employee?"))
                            deleteMutation.mutate(emp.id);
                        }}
                        className="px-3 py-1 rounded text-sm font-medium"
                        style={{ background: "#ffffff", color: "#000000ff" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          title={editing ? "Edit Employee" : "Add Employee"}
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
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-600 bg-black text-white hover:bg-gray-800 transition-all duration-200"
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
