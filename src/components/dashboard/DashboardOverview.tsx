"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
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
import { TrendingUp, Receipt, Wallet, AlertCircle, Calculator, X } from "lucide-react";
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

function AnimatedNumber({ value, type = "currency" }: { value: number; type?: "currency" | "percent" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  
  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          if (type === "currency") {
            ref.current.textContent = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(latest);
          } else {
            ref.current.textContent = new Intl.NumberFormat("pt-BR", {
              style: "decimal",
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }).format(latest) + "%";
          }
        }
      }
    });
    return () => controls.stop();
  }, [value, type, motionValue]);

  return <span ref={ref}>{type === "currency" ? "R$ 0,00" : "0,0%"}</span>;
}

function StatCard({ title, value, subtitle, icon: Icon, iconColorClass, valueColorClass, cardBorderClass, onClick }: any) {
  return (
    <motion.div 
      whileHover={onClick ? { y: -6, scale: 1.02 } : { y: -4, scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between transition-all duration-300 ${onClick ? "cursor-pointer hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5" : ""} ${cardBorderClass || ""}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div>
        <h4 className={`text-xl font-black tracking-tight ${valueColorClass || "text-slate-800"}`}>{value}</h4>
        <span className="text-xs font-semibold text-slate-400">{subtitle}</span>
      </div>
    </motion.div>
  );
}

export function DashboardOverview({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const activeYear = "2026";
  const [receitaAjuste, setReceitaAjuste] = useState(0); // em percentual (0 a 15)
  const [despesaAjuste, setDespesaAjuste] = useState(0); // em percentual (0 a 15)
  const [showInadimplenciaModal, setShowInadimplenciaModal] = useState(false);

  const yearData = dbData.data[activeYear];
  const orcamentoConsolidado = dbData.data.orcamento_consolidado;

  const receitaBase = yearData?.resumo.receita_total || 0;
  const despesaBase = yearData?.resumo.despesa_total || 0;

  // Inadimplencia preview calc (apenas para 2026)
  const inadiTotal = activeYear === "2026" 
    ? (orcamentoConsolidado?.inadimplencia.reduce((sum: number, item: any) => sum + item.valor_inadimplente, 0) || 0)
    : 0;

  const valorAjusteReceita = receitaBase * (receitaAjuste / 100);
  const valorAjusteDespesa = despesaBase * (despesaAjuste / 100);

  const receitaAjustada = receitaBase + valorAjusteReceita;
  const despesaAjustada = despesaBase - valorAjusteDespesa;
  
  // Saldo deduz a perda projetada por inadimplência em 2026
  const saldoAjustado = receitaAjustada - despesaAjustada - inadiTotal;
  
  // Comprometimento medido em relação à receita líquida real
  const receitaLiquidaDisponivel = receitaAjustada - inadiTotal;
  const indiceVal = receitaLiquidaDisponivel > 0 
    ? (despesaAjustada / receitaLiquidaDisponivel) * 100 
    : 0;

  // Monthly Chart Data Prep
  const monthlyData = yearData?.mensal.map((d: any) => ({
    name: d.mes_nome.substring(0, 3),
    Arrecadacao: d.receita * (1 + receitaAjuste / 100),
    GastoFixo: d.despesa * (1 - despesaAjuste / 100),
    isEstimativa: activeYear === "2026" && d.mes_num >= 5,
  })) || [];

  // Composicao Chart Data Prep (Tesouro)
  const composicaoData = yearData?.receitas_por_categoria.map((d: any) => ({
    name: d.categoria,
    value: d.valor * (1 + receitaAjuste / 100),
  })) || [];

  let statusColorClass = "bg-emerald-500";
  let alertBgClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  let statusText = "Saúde Fiscal Excelente";
  let explanationText = "";

  if (activeYear === "2026") {
    if (indiceVal > 100) {
      statusColorClass = "bg-rose-500";
      alertBgClass = "bg-rose-100 text-rose-700 border border-rose-200";
      statusText = "Déficit Crítico no Tesouro";
      explanationText = `Atenção: O cálculo do saldo do Tesouro desconta a perda por inadimplência e reforma do IRRF (23%), totalizando ${formatBRL(inadiTotal)} em perdas. A receita líquida real de ${formatBRL(receitaLiquidaDisponivel)} não cobre as despesas fixas de ${formatBRL(despesaAjustada)}, resultando em um comprometimento de ${indiceVal.toFixed(1).replace(".", ",")}% e gerando um déficit real de ${formatBRL(Math.abs(saldoAjustado))}.`;
    } else if (indiceVal >= 85) {
      statusColorClass = "bg-rose-500";
      alertBgClass = "bg-rose-100 text-rose-700 border border-rose-200";
      statusText = "Alerta de Alto Comprometimento";
      explanationText = `Alerta: Subtraindo as perdas estimadas de ${formatBRL(inadiTotal)}, a receita líquida real é de ${formatBRL(receitaLiquidaDisponivel)}. As despesas fixas consomem ${indiceVal.toFixed(1).replace(".", ",")}% desse total, deixando o Tesouro sob forte pressão e com déficit de ${formatBRL(Math.abs(saldoAjustado))}.`;
    } else if (indiceVal >= 70) {
      statusColorClass = "bg-amber-500";
      alertBgClass = "bg-amber-100 text-amber-700 border border-amber-200";
      statusText = "Equilíbrio em Atenção";
      explanationText = `Atenção: Após deduzir as perdas por inadimplência e reforma do IRRF (${formatBRL(inadiTotal)}), as despesas fixas consomem ${indiceVal.toFixed(1).replace(".", ",")}% da receita líquida disponível (${formatBRL(receitaLiquidaDisponivel)}). ${saldoAjustado < 0 ? `Déficit residual de ${formatBRL(Math.abs(saldoAjustado))}` : `Superávit residual de ${formatBRL(saldoAjustado)}`}.`;
    } else {
      statusColorClass = "bg-emerald-500";
      alertBgClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
      statusText = "Saúde Fiscal Equilibrada";
      explanationText = `Equilíbrio atingido: Mesmo deduzindo as perdas por inadimplência e reforma do IRRF (${formatBRL(inadiTotal)}), as despesas fixas estão controladas em ${indiceVal.toFixed(1).replace(".", ",")}% da receita líquida disponível (${formatBRL(receitaLiquidaDisponivel)}). Superávit de ${formatBRL(saldoAjustado)}.`;
    }
  } else {
    explanationText = `Fonte de recurso 01-TESOURO. Excelente equilíbrio: de cada R$ 100 arrecadados, apenas R$ ${indiceVal.toFixed(0)} cobrem despesas fixas. Sobram R$ ${(100 - indiceVal).toFixed(0)} livres para investimentos.`;
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
      
      {/* Top Header / Year Selector (2025 removido) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Recursos Próprios (Tesouro)</h2>
          <p className="text-slate-500 text-sm">Visão geral da saúde fiscal e execução orçamentária do Tesouro em 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 2xl:gap-8">
        
        {/* Coluna Esquerda: Saúde Fiscal + Gráfico Evolução */}
        <div className="col-span-1 md:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Saúde Fiscal Card */}
          <div className={`rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col md:flex-row gap-8 justify-between items-center transition-all duration-500 ${
            indiceVal > 85 ? "border-l-8 border-l-rose-500" :
            indiceVal >= 70 ? "border-l-8 border-l-amber-500" :
            "border-l-8 border-l-emerald-500"
          }`}>
            {/* Left Info Column */}
            <div className="flex-1 flex flex-col justify-between h-full space-y-6 w-full">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">Saúde Fiscal do Tesouro</h4>
                  <div className={`inline-flex items-center gap-1.5 rounded-full py-1 px-3 text-xs font-bold shadow-sm ${alertBgClass}`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        indiceVal > 85 ? "bg-rose-400" : indiceVal >= 70 ? "bg-amber-400" : "bg-emerald-400"
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        indiceVal > 85 ? "bg-rose-500" : indiceVal >= 70 ? "bg-amber-500" : "bg-emerald-500"
                      }`}></span>
                    </span>
                    <span>{statusText}</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-400">Índice de comprometimento da Receita Própria (Tesouro)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Índice de Comprometimento</span>
                  <h3 className={`text-6xl font-black tracking-tighter bg-gradient-to-r ${
                    indiceVal > 85 ? "from-rose-500 to-red-600" : 
                    indiceVal >= 70 ? "from-amber-500 to-orange-600" : 
                    "from-emerald-500 to-teal-600"
                  } bg-clip-text text-transparent`}>
                    <AnimatedNumber value={indiceVal} type="percent" />
                  </h3>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  indiceVal > 85 ? "bg-rose-50/40 border-rose-100/60 text-rose-950" : 
                  indiceVal >= 70 ? "bg-amber-50/40 border-amber-100/60 text-amber-950" : 
                  "bg-emerald-50/40 border-emerald-100/60 text-emerald-950"
                }`}>
                  <p className="text-xs font-bold leading-relaxed">
                    {explanationText}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Gauge Column */}
            <div className="w-full md:w-[240px] flex flex-col items-center justify-center shrink-0 bg-slate-50/30 border border-slate-100/50 p-5 rounded-3xl shadow-inner w-full">
              <div className="relative w-full h-[120px] flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 120">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />       {/* Verde */}
                      <stop offset="58%" stopColor="#F59E0B" />      {/* Amarelo */}
                      <stop offset="70%" stopColor="#F59E0B" />      {/* Amarelo */}
                      <stop offset="85%" stopColor="#F43F5E" />      {/* Vermelho */}
                      <stop offset="100%" stopColor="#EF4444" />     {/* Vermelho Escuro */}
                    </linearGradient>
                  </defs>

                  {/* Track de Fundo */}
                  <path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Arco de Progresso Ativo Animado */}
                  <motion.path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 219.9 }}
                    animate={{ strokeDashoffset: 219.9 - (219.9 * Math.min(indiceVal / 120, 1)) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray="219.9"
                  />

                  {/* Indicador Dinâmico Rotativo (Bolinha na ponta do arco ativo) */}
                  <motion.circle
                    cx="30"
                    cy="100"
                    r="8"
                    fill={indiceVal > 85 ? "#EF4444" : indiceVal >= 70 ? "#F59E0B" : "#10B981"}
                    opacity="0.35"
                    style={{ transformOrigin: "100px 100px" }}
                    initial={{ rotate: 0, scale: 0.8 }}
                    animate={{ 
                      rotate: Math.min(indiceVal / 120, 1) * 180,
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      rotate: { duration: 1.5, ease: "easeOut" },
                      scale: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.5 }
                    }}
                  />
                  <motion.circle
                    cx="30"
                    cy="100"
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={indiceVal > 85 ? "#EF4444" : indiceVal >= 70 ? "#F59E0B" : "#10B981"}
                    strokeWidth="2"
                    style={{ transformOrigin: "100px 100px" }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: Math.min(indiceVal / 120, 1) * 180 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />

                  {/* Marcadores de Limite (Ticks) */}
                  {/* 70% marker */}
                  <circle
                    cx="118.1"
                    cy="32.4"
                    r="4.5"
                    fill={indiceVal >= 70 ? "#F59E0B" : "#CBD5E1"}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-colors duration-500"
                  />

                  {/* 85% marker */}
                  <circle
                    cx="142.6"
                    cy="44.5"
                    r="4.5"
                    fill={indiceVal >= 85 ? "#F43F5E" : "#CBD5E1"}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-colors duration-500"
                  />

                  {/* 100% marker */}
                  <circle
                    cx="160.6"
                    cy="65.0"
                    r="4.5"
                    fill={indiceVal >= 100 ? "#EF4444" : "#CBD5E1"}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-colors duration-500"
                  />

                  {/* Rótulos de Texto */}
                  <text x="30" y="115" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#94A3B8">0%</text>
                  <text x="170" y="115" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#94A3B8">120%</text>
                  
                  {/* Texto de Estado Central */}
                  <text x="100" y="95" textAnchor="middle" fontSize="10" fontWeight="black" fill="#475569" className="uppercase tracking-wider">
                    {indiceVal > 85 ? "Crítico" : indiceVal >= 70 ? "Alerta" : "Saudável"}
                  </text>
                </svg>
              </div>

              {/* Legenda de Limites */}
              <div className="flex justify-between w-full text-[9px] font-extrabold text-slate-400 mt-2 border-t border-slate-100/80 pt-2 px-1">
                <span className="text-emerald-500 font-bold">&lt; 70% Ideal</span>
                <span className="text-amber-500 font-bold">70%-85% Limite</span>
                <span className="text-rose-500 font-bold">&gt; 85% Risco</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
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
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 11 }} 
                    tickFormatter={(val) => val === 0 ? "R$ 0" : "R$ " + (val / 1000000).toFixed(1).replace(".0", "") + "M"}
                    width={80}
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
        </div>

        {/* Coluna Direita: Cards + Simulador + Composição */}
        <div className="col-span-1 md:col-span-5 xl:col-span-4 flex flex-col gap-6">
          {/* Container Lateral Direito: Cards + Simulador */}
          <div className="flex flex-col gap-6">
            {/* Deficit Flow Card Stack */}
            <div className="flex flex-col gap-3 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Cálculo do Déficit/Saldo do Tesouro</h4>
              
              {/* Card 1: Receita */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Receita do Tesouro</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Orçamento Líquido Anual</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-600 block">
                    + <AnimatedNumber value={receitaAjustada} />
                  </span>
                </div>
              </div>

              {/* Operator: Minus */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="h-6 w-6 rounded-full bg-white border border-slate-250 flex items-center justify-center text-slate-500 text-sm font-black shadow-sm select-none">
                  −
                </div>
              </div>

              {/* Card 2: Despesa */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Despesa do Tesouro</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Custo de Custeio e Pessoal</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-600 block">
                    − <AnimatedNumber value={despesaAjustada} />
                  </span>
                </div>
              </div>

              {/* Operator: Minus */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="h-6 w-6 rounded-full bg-white border border-slate-250 flex items-center justify-center text-slate-500 text-sm font-black shadow-sm select-none">
                  −
                </div>
              </div>

              {/* Card 3: Perda */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Perda (Inadimplência)</span>
                      {activeYear === "2026" && (
                        <button
                          onClick={() => setShowInadimplenciaModal(true)}
                          className="px-2 py-0.5 text-[9px] font-black rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer border-0 shadow-sm"
                        >
                          Saiba mais
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Inadimplência Projetada</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-600 block">
                    − {activeYear === "2026" ? <AnimatedNumber value={inadiTotal} /> : "N/A"}
                  </span>
                </div>
              </div>

              {/* Operator: Equals */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="h-6 w-6 rounded-full bg-white border border-slate-250 flex items-center justify-center text-slate-500 text-sm font-black shadow-sm select-none">
                  =
                </div>
              </div>

              {/* Card 4: Saldo / Déficit */}
              <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                saldoAjustado < 0 
                  ? "bg-rose-50 border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.06)]" 
                  : "bg-emerald-50 border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.06)]"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    saldoAjustado < 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-slate-800">
                      {saldoAjustado < 0 ? "Déficit do Tesouro" : "Saldo do Tesouro"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5 animate-pulse">
                      {activeYear === "2026"
                        ? `${saldoAjustado < 0 ? "Déficit" : "Superávit"} real deduzidas as perdas`
                        : "Saldo para investimentos"
                      }
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-black ${saldoAjustado < 0 ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}`}>
                    {saldoAjustado < 0 ? "-" : ""} {formatBRL(Math.abs(saldoAjustado))}
                  </span>
                </div>
              </div>
            </div>

            {/* Painel do Simulador de Ajuste */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Simulador de Equilíbrio
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Simule ajustes de arrecadação e despesas
                    </p>
                  </div>
                </div>

                <div className="space-y-5 mt-6">
                  {/* Slider 1: Receita */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Aumento de Receita</span>
                      <span className="text-blue-600">+{receitaAjuste}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={receitaAjuste}
                      onChange={(e) => setReceitaAjuste(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>0%</span>
                      <span>{formatBRL(valorAjusteReceita)} adicionais</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Slider 2: Despesa */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Redução de Despesa</span>
                      <span className="text-rose-600">-{despesaAjuste}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={despesaAjuste}
                      onChange={(e) => setDespesaAjuste(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>0%</span>
                      <span>{formatBRL(valorAjusteDespesa)} economizados</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Feedback */}
              <div className="mt-6 border-t border-slate-100/80 pt-4 font-sans">
                {saldoAjustado >= 0 ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-800">
                        Equilíbrio Alcançado!
                      </h5>
                      <p className="text-[10px] text-emerald-600 font-medium leading-relaxed mt-0.5">
                        O déficit foi zerado! Projeção de superávit de{" "}
                        <strong>{formatBRL(saldoAjustado)}</strong> e índice de{" "}
                        <strong>{indiceVal.toFixed(1).replace(".", ",")}%</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      !
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-800">
                        Ainda há déficit
                      </h5>
                      <p className="text-[10px] text-amber-600 font-medium leading-relaxed mt-0.5">
                        Ajuste os sliders para cobrir o déficit restante de{" "}
                        <strong>{formatBRL(Math.abs(saldoAjustado))}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {activeYear === "2026" && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 font-semibold leading-relaxed">
                    * O saldo projetado de 2026 já deduz <strong>{formatBRL(inadiTotal)}</strong> correspondentes às perdas por inadimplência e à reforma do IRRF (23%).
                  </div>
                )}

                {(receitaAjuste > 0 || despesaAjuste > 0) && (
                  <button
                    onClick={() => {
                      setReceitaAjuste(0);
                      setDespesaAjuste(0);
                    }}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all text-center cursor-pointer"
                  >
                    Resetar Simulação
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Side Component (Doughnut + Breakdown) */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col">
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
                  const adjustedVal = cat.valor * (1 - despesaAjuste / 100);
                  const percentage = despesaAjustada > 0 ? (adjustedVal / despesaAjustada) * 100 : 0;
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
                          {formatBRL(adjustedVal)}
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
      
      {/* Inadimplencia Detail Modal */}
      <AnimatePresence>
        {showInadimplenciaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInadimplenciaModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl rounded-3xl bg-[#FAFAED] border border-white/60 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowInadimplenciaModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest">
                  Detalhamento de Perdas
                </span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2">
                  Inadimplência Projetada (2026)
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Detalhamento das perdas previstas por tipo de receita para o ano de 2026.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/95 shadow-sm mb-6 max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Receita / Imposto</th>
                      <th className="py-3 px-4 text-right">Valor Orçado</th>
                      <th className="py-3 px-4 text-right">Inadimplência</th>
                      <th className="py-3 px-4 text-right">Perda Estimada</th>
                      <th className="py-3 px-4 text-right">Receita Líquida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                    {orcamentoConsolidado?.inadimplencia.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{item.imposto}</td>
                        <td className="py-3.5 px-4 text-right">{formatBRL(item.receita_bruta)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-500">
                          {item.percentual_inadimplencia.toFixed(1).replace(".", ",")}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-rose-600">{formatBRL(item.valor_inadimplente)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{formatBRL(item.receita_liquida)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 border-t-2 border-slate-200/80 font-bold text-slate-800 text-xs">
                      <td className="py-3 px-4">Total de Perdas</td>
                      <td className="py-3 px-4 text-right">
                        {formatBRL(orcamentoConsolidado?.inadimplencia.reduce((sum: number, item: any) => sum + item.receita_bruta, 0) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-500">
                        {((inadiTotal / (orcamentoConsolidado?.inadimplencia.reduce((sum: number, item: any) => sum + item.receita_bruta, 0) || 1)) * 100).toFixed(1).replace(".", ",")}%
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-extrabold">{formatBRL(inadiTotal)}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">
                        {formatBRL((orcamentoConsolidado?.inadimplencia.reduce((sum: number, item: any) => sum + item.receita_liquida, 0) || 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/60 text-xs text-amber-950 font-bold leading-relaxed">
                A inadimplência projetada estima a perda de receita com base em dados históricos e na perda de arrecadação esperada. Para o IRRF, é considerada uma perda estimada fixa de 23% de retenção na fonte sobre a folha bruta.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
