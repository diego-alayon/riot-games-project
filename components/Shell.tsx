import { Sidebar } from "@/components/Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden" style={{ height: "100vh" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#ffffff" }}>
        {children}
      </main>
    </div>
  );
}
