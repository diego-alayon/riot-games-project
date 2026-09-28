export default function GraphPage() {
  return (
    <div className="px-8 py-6">
      <div style={{ maxWidth: 720 }}>
        <span
          className="block mb-2"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase", color: "#9b9b9b" }}
        >
          Product / Knowledge Graph
        </span>
        <h1
          className="mb-6"
          style={{ fontSize: 20, fontWeight: 510, color: "#0f0f0f", letterSpacing: "-0.24px", lineHeight: 1.3 }}
        >
          Knowledge Graph
        </h1>

        <div
          className="flex items-center justify-center py-12"
          style={{ border: "1px solid #ebebeb", borderRadius: 8 }}
        >
          <p style={{ fontSize: 14, color: "#9b9b9b" }}>No content yet.</p>
        </div>
      </div>
    </div>
  );
}
