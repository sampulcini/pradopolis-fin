"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  Search,
  Building2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  DollarSign,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  PieChart as PieIcon,
  HelpCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import orcamentoDataRaw from "@/data/orcamento_data.json";

// Type assertions for TypeScript
const orcamentoData = orcamentoDataRaw as {
  resumo_geral: {
    dotacao_total: number;
    empenhado_total: number;
    liquidado_total: number;
    pago_total: number;
    apagar_total: number;
    saldo_total: number;
    percentual_consumido: number;
  };
  categorias: Array<{
    categoria: string;
    dotacao: number;
    empenhado: number;
    liquidado: number;
    pago: number;
    apagar: number;
    saldo: number;
    percentual_consumido: number;
  }>;
  setores: Array<{
    setor: string;
    dotacao: number;
    empenhado: number;
    liquidado: number;
    pago: number;
    apagar: number;
    saldo: number;
    percentual_consumido: number;
  }>;
  fichas: Array<{
    ficha: string;
    categoria: string;
    setor: string;
    funcao: string;
    subfuncao: string;
    catecficha: string;
    especificacao: string;
    dotacao: number;
    empenhado: number;
    liquidado: number;
    pago: number;
    apagar: number;
    saldo: number;
    percentual_consumido: number;
    status: "normal" | "warning" | "critical";
  }>;
};

// Curated colors for Bento dashboard
const COLORS = {
  primary: "#3B82F6",    // Blue
  success: "#10B981",    // Emerald
  warning: "#F59E0B",    // Amber
  danger: "#F43F5E",     // Rose
  info: "#8B5CF6",       // Violet
  neutral: "#64748B",    // Slate
  pieColors: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E"]
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + "%";
}

function StatCard({ title, value, subtitle, icon: Icon, bgClass, iconColorClass }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex flex-col justify-between"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgClass} ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        <span className="text-xs font-semibold text-slate-400">{subtitle}</span>
      </div>
    </motion.div>
  );
}

export function OrcamentoDashboard() {
  const { resumo_geral, categorias, setores, fichas } = orcamentoData;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSetor, setSelectedSetor] = useState("all");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: "",
    direction: null
  });
  const itemsPerPage = 10;

  // Memoized unique selectors for dropdowns
  const sectorList = useMemo(() => {
    const list = setores.map(s => s.setor).filter(Boolean);
    return sortedUnique(list);
  }, [setores]);

  const categoryList = useMemo(() => {
    const list = categorias.map(c => c.categoria).filter(Boolean);
    return sortedUnique(list);
  }, [categorias]);

  function sortedUnique(arr: string[]) {
    return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  // Filtered Fichas list
  const filteredFichas = useMemo(() => {
    return fichas.filter(f => {
      const matchesSearch = 
        f.ficha.includes(searchTerm) || 
        f.especificacao.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.catecficha.includes(searchTerm);
      
      const matchesSetor = selectedSetor === "all" || f.setor === selectedSetor;
      const matchesCategoria = selectedCategoria === "all" || f.categoria === selectedCategoria;
      const matchesStatus = selectedStatus === "all" || f.status === selectedStatus;

      return matchesSearch && matchesSetor && matchesCategoria && matchesStatus;
    });
  }, [fichas, searchTerm, selectedSetor, selectedCategoria, selectedStatus]);

  // Totals of filtered items
  const filteredTotals = useMemo(() => {
    return filteredFichas.reduce((acc, curr) => {
      acc.dotacao += curr.dotacao;
      acc.empenhado += curr.empenhado;
      acc.saldo += curr.saldo;
      return acc;
    }, { dotacao: 0, empenhado: 0, saldo: 0 });
  }, [filteredFichas]);

  const filteredPercent = useMemo(() => {
    return filteredTotals.dotacao > 0 ? (filteredTotals.empenhado / filteredTotals.dotacao) * 100 : 0;
  }, [filteredTotals]);

  // Sorting logic
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      } else {
        direction = 'asc';
      }
    }
    setSortConfig({ key: direction ? key : "", direction });
  };

  const sortedFichas = useMemo(() => {
    const items = [...filteredFichas];
    if (sortConfig.key && sortConfig.direction) {
      items.sort((a, b) => {
        let valA = a[sortConfig.key as keyof typeof a];
        let valB = b[sortConfig.key as keyof typeof b];

        // Status order map if sorting by status
        if (sortConfig.key === 'status') {
          const statusOrder = { critical: 3, warning: 2, normal: 1 };
          const orderA = statusOrder[valA as keyof typeof statusOrder] || 0;
          const orderB = statusOrder[valB as keyof typeof statusOrder] || 0;
          return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          const numA = Number(valA);
          const numB = Number(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
          }
          return sortConfig.direction === 'asc' 
            ? valA.localeCompare(valB, "pt-BR") 
            : valB.localeCompare(valA, "pt-BR");
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return items;
  }, [filteredFichas, sortConfig]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSetor, selectedCategoria, selectedStatus]);

  // Pagination details
  const totalPages = Math.ceil(filteredFichas.length / itemsPerPage) || 1;
  const paginatedFichas = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedFichas.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedFichas, currentPage]);

  // Helper to render sortable headers
  const renderSortableHeader = (label: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = sortConfig.key === sortKey;
    const justifyClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
    const textAlignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    
    return (
      <th 
        onClick={() => handleSort(sortKey)} 
        className={`py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none group ${textAlignClass}`}
      >
        <div className={`flex items-center gap-1.5 ${justifyClass}`}>
          {align === 'right' && (
            <span className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
              {!isSorted ? (
                <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
              ) : sortConfig.direction === 'asc' ? (
                <ChevronUp className="w-3 h-3 text-blue-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-blue-500" />
              )}
            </span>
          )}
          <span>{label}</span>
          {align !== 'right' && (
            <span className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
              {!isSorted ? (
                <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
              ) : sortConfig.direction === 'asc' ? (
                <ChevronUp className="w-3 h-3 text-blue-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-blue-500" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Chart data 1: Donut chart of categories
  const pieChartData = useMemo(() => {
    return categorias.map(c => ({
      name: c.categoria,
      value: c.dotacao
    }));
  }, [categorias]);

  // Chart data 2: Top Sectors Bar Chart (Top 6)
  const barChartData = useMemo(() => {
    return setores.slice(0, 6).map(s => ({
      name: s.setor
        .replace("DEPARTAMENTO MUNICIPAL DE ", "DEP. ")
        .replace("DEPARTAMENTO DE ", "DEP. ")
        .replace("SECRETARIA MUNICIPAL DE ", "SEC. ")
        .replace("SECRETARIA DE ", "SEC. ")
        .replace(" E SERVIÇOS URBANOS", "")
        .replace(" E FINANÇAS", "")
        .substring(0, 20),
      "Dotação": s.dotacao,
      "Empenhado": s.empenhado,
      fullName: s.setor
    }));
  }, [setores]);

  // Custom tooltips
  const formatTooltipBRL = (value: any) => [formatBRL(Number(value)), "Valor"];

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dotação e Execução Orçamentária</h2>
          <p className="text-slate-500 text-sm font-medium">
            Monitoramento de dotações autorizadas e consumo orçamentário consolidado de prestação de serviços por ficha e setor
          </p>
        </div>
      </div>

      {/* Bento Grid: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Dotação Atual"
          value={formatBRL(resumo_geral.dotacao_total)}
          subtitle="Orçamento total autorizado"
          icon={Wallet}
          bgClass="bg-blue-50"
          iconColorClass="text-blue-500"
        />
        <StatCard
          title="Empenhado"
          value={formatBRL(resumo_geral.empenhado_total)}
          subtitle="Compromissado / Reservado"
          icon={TrendingUp}
          bgClass="bg-amber-50"
          iconColorClass="text-amber-500"
        />
        <StatCard
          title="Liquidado"
          value={formatBRL(resumo_geral.liquidado_total)}
          subtitle="Serviços prestados e atestados"
          icon={CheckCircle2}
          bgClass="bg-emerald-50"
          iconColorClass="text-emerald-500"
        />
        <StatCard
          title="Pago"
          value={formatBRL(resumo_geral.pago_total)}
          subtitle="Desembolso financeiro real"
          icon={DollarSign}
          bgClass="bg-indigo-50"
          iconColorClass="text-indigo-500"
        />
        <StatCard
          title="Saldo Disponível"
          value={formatBRL(resumo_geral.saldo_total)}
          subtitle="Recurso livre no orçamento"
          icon={resumo_geral.saldo_total < 0 ? AlertTriangle : Wallet}
          bgClass={resumo_geral.saldo_total < 0 ? "bg-rose-50" : "bg-teal-50"}
          iconColorClass={resumo_geral.saldo_total < 0 ? "text-rose-500" : "text-teal-500"}
        />
      </div>

      {/* Bento Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Radial Progress Box (Gauge) */}
        <div className="lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Consumo Global do Orçamento</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Percentual do orçamento já empenhado (comprometido)</p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-6 relative">
            {/* SVG Circle Progress */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  className="stroke-slate-100"
                  strokeWidth="16"
                  fill="transparent"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="76"
                  className="stroke-blue-500"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={477.5}
                  initial={{ strokeDashoffset: 477.5 }}
                  animate={{ strokeDashoffset: 477.5 - (477.5 * Math.min(resumo_geral.percentual_consumido, 100)) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                  {formatPercent(resumo_geral.percentual_consumido)}
                </span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Empenhado</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-center">
            <span className="text-xs font-medium text-slate-500 block">
              Foi empenhado um total de <strong>{formatBRL(resumo_geral.empenhado_total)}</strong> de uma dotação de <strong>{formatBRL(resumo_geral.dotacao_total)}</strong>.
            </span>
          </div>
        </div>

        {/* Pie Chart: Distribution by Category */}
        <div className="lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Divisão por Categoria de Gasto</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Proporção da dotação entre as 5 áreas de despesas</p>
          </div>

          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipBRL} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple Legend grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 bg-slate-50/30 p-3 rounded-2xl border border-slate-100/50">
            {categorias.slice(0, 4).map((c, i) => (
              <div key={c.categoria} className="flex items-center gap-1.5 truncate">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS.pieColors[i % COLORS.pieColors.length] }} 
                />
                <span className="truncate">{c.categoria} ({((c.dotacao / resumo_geral.dotacao_total) * 100).toFixed(0)}%)</span>
              </div>
            ))}
            {categorias.length > 4 && (
              <div className="flex items-center gap-1.5 col-span-2 justify-center border-t border-slate-100 pt-1.5 mt-0.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS.pieColors[4 % COLORS.pieColors.length] }} 
                />
                <span>{categorias[4].categoria} ({((categorias[4].dotacao / resumo_geral.dotacao_total) * 100).toFixed(0)}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Sectors */}
        <div className="lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Top Setores com Maior Dotação</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Comparativo entre Dotação Autorizada e Empenhada</p>
          </div>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: COLORS.neutral, fontSize: 8, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: COLORS.neutral, fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                  width={75}
                />
                <Tooltip 
                  formatter={(value: any) => [formatBRL(Number(value)), ""]}
                  contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "1px solid #f1f5f9" }}
                />
                <Legend 
                  iconSize={10} 
                  wrapperStyle={{ fontSize: "10px", fontWeight: 700, marginTop: "10px" }}
                />
                <Bar dataKey="Dotação" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Empenhado" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Interactive Bento Box: Search, Filters & Table */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6">
        
        {/* Filters Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200/50">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Detalhamento das Fichas</h4>
              <p className="text-xs font-semibold text-slate-400">Total de {filteredFichas.length} registros filtrados</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar Ficha, CATEC, especificação..."
                className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Setor Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedSetor}
                onChange={(e) => setSelectedSetor(e.target.value)}
                className="w-full sm:w-56 px-3.5 py-2 text-sm font-bold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              >
                <option value="all">Setor: Todos</option>
                {sectorList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Categoria Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full sm:w-48 px-3.5 py-2 text-sm font-bold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              >
                <option value="all">Categoria: Todas</option>
                {categoryList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-40 px-3.5 py-2 text-sm font-bold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              >
                <option value="all">Status: Todos</option>
                <option value="normal">Normal (&le; 70%)</option>
                <option value="warning">Atenção (70% - 85%)</option>
                <option value="critical">Crítico (&gt; 85%)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm !== "" || selectedSetor !== "all" || selectedCategoria !== "all" || selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSetor("all");
                  setSelectedCategoria("all");
                  setSelectedStatus("all");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all shadow-sm cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Fichas Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/95 shadow-sm mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60">
                {renderSortableHeader("Ficha", "ficha", "left")}
                {renderSortableHeader("CATEC", "catecficha", "left")}
                {renderSortableHeader("Especificação da Despesa", "especificacao", "left")}
                {renderSortableHeader("Setor / Departamento", "setor", "left")}
                {renderSortableHeader("Dotação", "dotacao", "right")}
                {renderSortableHeader("Empenhado", "empenhado", "right")}
                {renderSortableHeader("Saldo", "saldo", "right")}
                {renderSortableHeader("Consumo (%)", "percentual_consumido", "center")}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {paginatedFichas.length > 0 ? (
                  paginatedFichas.map((f) => {
                    const statusColor = 
                      f.status === "critical" ? "text-rose-600 bg-rose-50 border-rose-100" :
                      f.status === "warning" ? "text-amber-600 bg-amber-50 border-amber-100" :
                      "text-emerald-600 bg-emerald-50 border-emerald-100";
                    
                    const progressColor = 
                      f.status === "critical" ? "bg-rose-500" :
                      f.status === "warning" ? "bg-amber-500" :
                      "bg-emerald-500";

                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={`${f.categoria}-${f.ficha}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-800">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {f.ficha}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                          {f.catecficha}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-slate-800 line-clamp-1">{f.especificacao}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{f.categoria}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-slate-600 line-clamp-1 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {f.setor || "GABINETE DO PREFEITO"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-sm text-slate-800">
                          {formatBRL(f.dotacao)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-sm text-slate-700">
                          {formatBRL(f.empenhado)}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold text-sm ${f.saldo < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {formatBRL(f.saldo)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${statusColor}`}>
                              {formatPercent(f.percentual_consumido)}
                            </span>
                            
                            {/* Track bar */}
                            <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${progressColor}`}
                                style={{ width: `${Math.min(f.percentual_consumido, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-sm">
                      Nenhuma ficha encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
            {filteredFichas.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/80 border-t-2 border-slate-200/80 font-extrabold text-slate-800">
                  <td colSpan={4} className="py-3 px-4 text-xs font-black uppercase text-slate-500 tracking-wider">
                    Total Filtrado ({filteredFichas.length} Fichas)
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {formatBRL(filteredTotals.dotacao)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {formatBRL(filteredTotals.empenhado)}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm ${filteredTotals.saldo < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatBRL(filteredTotals.saldo)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                      filteredPercent > 85 ? "text-rose-600 bg-rose-50 border-rose-100" :
                      filteredPercent > 70 ? "text-amber-600 bg-amber-50 border-amber-100" :
                      "text-emerald-600 bg-emerald-50 border-emerald-100"
                    }`}>
                      {formatPercent(filteredPercent)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination controls */}
        {filteredFichas.length > 0 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-slate-600"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-slate-600"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
