"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DockTabs } from "@/components/ui/dock-tabs";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { PrevisaoReceita } from "@/components/dashboard/PrevisaoReceita";
import { OrcamentoDashboard } from "@/components/dashboard/OrcamentoDashboard";
import { DespesasFixas } from "@/components/dashboard/DespesasFixas";
import { DocumentosViewer } from "@/components/dashboard/DocumentosViewer";
import { Configuracoes } from "@/components/dashboard/Configuracoes";
import { LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAED] relative overflow-x-hidden">
      
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top bar header */}
      <header className="w-full max-w-screen-2xl mx-auto px-6 pt-6 relative z-30">
        <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] px-6 py-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <span className="font-black text-lg">P</span>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">Pradópolis</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secretaria de Finanças</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/60 border border-white/80 py-1.5 px-3 rounded-2xl shadow-sm text-xs font-bold text-slate-700">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Olá, {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold py-2 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-rose-500/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="relative z-10 pt-2">
        {activeTab === "home" && <DashboardOverview onNavigate={setActiveTab} />}
        {activeTab === "receita" && <PrevisaoReceita />}
        {activeTab === "despesas" && <DespesasFixas />}
        {activeTab === "orcamento" && <OrcamentoDashboard />}
        {activeTab === "documentos" && <DocumentosViewer onBack={() => setActiveTab("home")} />}
        {activeTab === "settings" && <Configuracoes user={user} />}
        {activeTab !== "home" && activeTab !== "receita" && activeTab !== "despesas" && activeTab !== "orcamento" && activeTab !== "documentos" && activeTab !== "settings" && (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Módulo em Desenvolvimento</h2>
              <p className="text-slate-500">A tela "{activeTab}" será implementada em breve.</p>
            </div>
          </div>
        )}
      </div>

      {/* Dock Navigation */}
      <div className="fixed bottom-12 left-0 right-0 z-50">
        <DockTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
    </main>
  );
}
