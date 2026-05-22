"use client";

import { useState } from "react";
import { DockTabs } from "@/components/ui/dock-tabs";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { PrevisaoReceita } from "@/components/dashboard/PrevisaoReceita";
import { OrcamentoDashboard } from "@/components/dashboard/OrcamentoDashboard";
import { DespesasFixas } from "@/components/dashboard/DespesasFixas";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <main className="min-h-screen bg-[#FAFAED] relative overflow-x-hidden">
      
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Dashboard Content */}
      <div className="relative z-10">
        {activeTab === "home" && <DashboardOverview />}
        {activeTab === "receita" && <PrevisaoReceita />}
        {activeTab === "despesas" && <DespesasFixas />}
        {activeTab === "orcamento" && <OrcamentoDashboard />}
        {activeTab !== "home" && activeTab !== "receita" && activeTab !== "despesas" && activeTab !== "orcamento" && (
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
