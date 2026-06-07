export default function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: "#d2d4d7" }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
        style={{
          background: "#000000",
          border: `1px solid ${error ? "#ef4444" : "#424242"}`,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#bdbdbfff")}
        onBlur={(e) =>
          (e.target.style.borderColor = error ? "#ef4444" : "#1e2535")
        }
      />
      {error && (
        <p className="text-xs" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}
