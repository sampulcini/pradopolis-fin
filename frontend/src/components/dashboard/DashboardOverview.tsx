"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Receipt, Wallet, AlertCircle } from "lucide-react";
import dbDataRaw from "@/data/dashboard_data.json";

// Type assertions for imported JSON to ensure TypeScript is happy
const dbData = dbDataRaw as any;

const chartColors = {
  primary: "#3B82F6",
  success: "#10B981",
  danger: "#F43F5E",
  warning: "#F59E0B",
  pieColors: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#F472B6"],
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function StatCard({ title, value, subtitle, icon: Icon, colorClass, iconColorClass }: any) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div>
        <h4 className="text-xl font-bold text-slate-800 tracking-tight">{value}</h4>
        <span className="text-xs font-medium text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const [activeYear, setActiveYear] = useState<"2025" | "2026">("2026");

  const yearData = dbData.data[activeYear];
  const orcamentoConsolidado = dbData.data.orcamento_consolidado;

  // Monthly Chart Data Prep
  const monthlyData = yearData?.mensal.map((d: any) => ({
    name: d.mes_nome.substring(0, 3),
    Arrecadacao: d.receita,
    GastoFixo: d.despesa,
    isEstimativa: activeYear === "2026" && d.mes_num >= 5,
  })) || [];

  // Composicao Chart Data Prep (Tesouro)
  const composicaoData = yearData?.receitas_por_categoria.map((d: any) => ({
    name: d.categoria,
    value: d.valor,
  })) || [];

  // Inadimplencia preview calc
  const inadiTotal = orcamentoConsolidado?.inadimplencia.reduce((sum: number, item: any) => sum + item.valor_inadimplente, 0) || 0;

  // Health indicator styling
  const indiceVal = yearData?.resumo.indice_medio || 0;
  let statusColorClass = "bg-emerald-500";
  let alertBgClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  let statusText = "Saúde Fiscal Excelente";
  let explanationText = `Fonte de recurso 01-TESOURO. Excelente equilíbrio: de cada R$ 100 arrecadados, apenas R$ ${indiceVal.toFixed(0)} cobrem despesas fixas. Sobram R$ ${(100 - indiceVal).toFixed(0)} livres para investimentos.`;

  if (indiceVal >= 70 && indiceVal <= 85) {
    statusColorClass = "bg-amber-500";
    alertBgClass = "bg-amber-100 text-amber-700 border border-amber-200";
    statusText = "Atenção Orçamentária";
    explanationText = `Margem de segurança apertada. A máquina pública consome R$ ${indiceVal.toFixed(0)} de cada R$ 100 arrecadados. A gestão municipal deve conter novos gastos recorrentes.`;
  } else if (indiceVal > 85) {
    statusColorClass = "bg-rose-500";
    alertBgClass = "bg-rose-100 text-rose-700 border border-rose-200";
    statusText = "Alerta Crítico";
    explanationText = `Mais de R$ ${indiceVal.toFixed(0)} de cada R$ 100 estão engessados em despesas obrigatórias. Risco severo de descumprimento de obrigações e impossibilidade de novos investimentos.`;
  }

  // Categories colors map
  const catColors = [
    "bg-rose-100 text-rose-600",
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
  ];

  if (!yearData) return null;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      
      {/* Top Header / Year Selector */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Recursos Próprios (Tesouro)</h2>
          <p className="text-slate-500 text-sm">Visão geral da saúde fiscal e execução orçamentária do Tesouro em {activeYear}</p>
        </div>
        <div className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-sm">
          <button
            onClick={() => setActiveYear("2025")}
            className={`px-4 py-1.5 rounded-xl text-sm transition-all ${
              activeYear === "2025" ? "font-bold bg-white text-blue-500 shadow-sm" : "font-semibold text-slate-500 hover:text-slate-700"
            }`}
          >
            2025
          </button>
          <button
            onClick={() => setActiveYear("2026")}
            className={`px-4 py-1.5 rounded-xl text-sm transition-all ${
              activeYear === "2026" ? "font-bold bg-white text-blue-500 shadow-sm" : "font-semibold text-slate-500 hover:text-slate-700"
            }`}
          >
            2026
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12 2xl:gap-8">
        {/* Saúde Fiscal Card */}
        <div className="col-span-1 xl:col-span-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
            <div>
              <h4 className="text-2xl font-bold text-slate-800 tracking-tight">Saúde Fiscal do Tesouro</h4>
              <span className="text-sm font-medium text-slate-500">Índice de comprometimento da Receita Própria</span>
            </div>
            <div className={`inline-flex rounded-2xl py-1.5 px-4 text-sm font-semibold shadow-sm ${alertBgClass}`}>
              <span>{statusText}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
            <div>
              <h3 className="text-6xl font-extrabold text-slate-800 tracking-tighter">
                {indiceVal.toFixed(1).replace(".", ",")}%
              </h3>
              <p className="mt-4 text-sm font-medium text-slate-500 max-w-md leading-relaxed">
                {explanationText}
              </p>
            </div>

            <div className="w-full sm:w-1/3">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                <span>Equilíbrio</span>
                <span>Risco Máximo</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${statusColorClass}`}
                  style={{ width: `${Math.min(indiceVal, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Mini Cards */}
        <div className="col-span-1 xl:col-span-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="Receita do Tesouro"
            value={formatBRL(yearData.resumo.receita_total)}
            subtitle="Orçamento Líquido Anual"
            icon={TrendingUp}
            iconColorClass="bg-blue-100 text-blue-500"
          />
          <StatCard
            title="Despesa do Tesouro"
            value={formatBRL(yearData.resumo.despesa_total)}
            subtitle="Custo de Custeio e Pessoal"
            icon={Receipt}
            iconColorClass="bg-rose-100 text-rose-500"
          />
          <StatCard
            title="Saldo do Tesouro"
            value={formatBRL(yearData.resumo.saldo_total)}
            subtitle="Disponibilidade para Investimentos"
            icon={Wallet}
            iconColorClass="bg-emerald-100 text-emerald-500"
          />
          <StatCard
            title="Perda"
            value={formatBRL(inadiTotal)}
            subtitle="Inadimplência Projetada"
            icon={AlertCircle}
            iconColorClass="bg-amber-100 text-amber-500"
          />
        </div>

        {/* Bar Chart */}
        <div className="col-span-1 xl:col-span-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h4 className="text-xl font-bold text-slate-800 tracking-tight">Evolução Mensal</h4>
              <span className="text-sm font-medium text-slate-500">Fluxo de Caixa Mensal (Recursos do Tesouro)</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-white/50 px-4 py-2 rounded-2xl border border-white/60">
              <div className="flex items-center gap-1.5">
                <span className="block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-semibold text-slate-600">Arrecadação Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="block h-2.5 w-2.5 rounded-full bg-blue-500/40 border border-dashed border-blue-500/70"></span>
                <span className="text-xs font-semibold text-slate-500">Estimada (Projeção)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="block h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold text-slate-600">Gasto Fixo Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="block h-2.5 w-2.5 rounded-full bg-rose-500/40 border border-dashed border-rose-500/70"></span>
                <span className="text-xs font-semibold text-slate-500">Despesa Projetada</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12 }} 
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.6)", 
                    backgroundColor: "rgba(255,255,255,0.85)", 
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)" 
                  }}
                  formatter={(value: any, name: any, item: any) => {
                    const isEstimativa = item.payload?.isEstimativa;
                    const label = name === "Arrecadacao" ? "Receita (Tesouro)" : "Gasto Fixo";
                    const suffix = isEstimativa ? " (Projeção)" : " (Real)";
                    return [formatBRL(Number(value)) + suffix, label];
                  }}
                />
                <Bar dataKey="Arrecadacao" radius={[4, 4, 0, 0]} barSize={20}>
                  {monthlyData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-arrec-${index}`} 
                      fill={chartColors.primary} 
                      opacity={entry.isEstimativa ? 0.45 : 1}
                      stroke={entry.isEstimativa ? chartColors.primary : "none"}
                      strokeWidth={entry.isEstimativa ? 1 : 0}
                      strokeDasharray={entry.isEstimativa ? "3 3" : "0"}
                    />
                  ))}
                </Bar>
                <Bar dataKey="GastoFixo" radius={[4, 4, 0, 0]} barSize={20}>
                  {monthlyData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-gasto-${index}`} 
                      fill={chartColors.danger} 
                      opacity={entry.isEstimativa ? 0.45 : 1}
                      stroke={entry.isEstimativa ? chartColors.danger : "none"}
                      strokeWidth={entry.isEstimativa ? 1 : 0}
                      strokeDasharray={entry.isEstimativa ? "3 3" : "0"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Component (Doughnut + Breakdown) */}
        <div className="col-span-1 xl:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-slate-800 tracking-tight">Composição da Receita (Tesouro)</h4>
          </div>
          <div className="h-[200px] w-full mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={composicaoData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {composicaoData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors.pieColors[index % chartColors.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.6)", 
                    backgroundColor: "rgba(255,255,255,0.85)", 
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)" 
                  }}
                  formatter={(value: any) => formatBRL(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Principais Despesas Fixas
            </h5>
            <div className="flex flex-col gap-5">
              {yearData.despesas_por_categoria.map((cat: any, index: number) => {
                const percentage = (cat.valor / yearData.resumo.despesa_total) * 100;
                return (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${catColors[index % catColors.length]}`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-800 group-hover:text-blue-500 transition-colors">
                          {cat.categoria}
                        </h5>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          {percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right bg-white/50 border border-white/60 px-3 py-1.5 rounded-xl shadow-sm">
                      <span className="block text-sm font-bold text-slate-800 tracking-tight">
                        {formatBRL(cat.valor)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
