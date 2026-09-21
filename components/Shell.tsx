import { Sidebar } from "@/components/Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden" style={{ height: "100vh", backgroundColor: "#ffffff" }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#ffffff", padding: "6px 6px 6px 0" }}>
        <main
          className="min-h-full"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e8e8e8",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
