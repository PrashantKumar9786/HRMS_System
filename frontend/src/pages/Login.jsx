import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Input from "../components/Input";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAuth(data.token, data.org);
      navigate("/employees");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#000000", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/hrms.jpg"
            alt="HRMS System"
            className="w-15 h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Sign in to your organisation
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl p-6"
          style={{ background: "#000000", border: "1px solid #424242" }}
        >
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: "#ef444420",
                color: "#ef4444",
                border: "1px solid #ef444440",
              }}
            >
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="admin@evallo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #ffffff, #ffffff)",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: "#6b7280" }}>
          No account?{" "}
          <Link
            to="/register"
            className="font-medium"
            style={{ color: "#ffffffff" }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
