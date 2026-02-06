const STATUS_META = {
    COMPLETED: { label: "Completed", dot: "#3bb54a" },
    IN_PROGRESS: { label: "In progress", dot: "#f0b429" },
    UNDER_REVIEW: { label: "Under review", dot: "#3b82f6" },
    NOT_STARTED: { label: "Not started", dot: "#9ca3af" },
};

export default function StatusPill({ value, onChange, onKeyDown, selectRef, disabled = false }) {
    const meta = STATUS_META[value] ?? STATUS_META.NOT_STARTED;

    return (
        <span className="jl-pill">
      <span className="jl-dot" style={{ background: meta.dot }} />
      <select
          ref={selectRef}
          className="form-select form-select-sm"
          style={{ border: 0, background: "transparent", fontWeight: 900 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
      >
        {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>
                {v.label}
            </option>
        ))}
      </select>
    </span>
    );
}
