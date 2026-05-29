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
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import {
  Search,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  DollarSign,
  TrendingDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  X,
  UserCheck,
  Coffee,
  Activity,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import despesasFixasDataRaw from "@/data/despesas_fixas_data.json";

// Type definitions
interface Contract {
  empenho: string;
  contrato: string;
  fornecedor: string;
  historico: string;
  setor: string;
  categoria: string;
  ficha: string;
  valor_anual: number;
  valor_mensal: number;
  cronograma: number[];
}

const despesasFixasData = despesasFixasDataRaw as {
  resumo_geral: {
    total_despesas_fixas_anual: number;
    total_despesas_fixas_mensal: number;
    folha_anual: number;
    contratos_anual: number;
    auxilio_anual: number;
    ingesp_anual: number;
    num_contratos_ativos: number;
  };
  progressao_mensal: Array<{
    mes_num: number;
    mes_nome: string;
    folha: number;
    contratos: number;
    auxilio: number;
    ingesp: number;
    total: number;
  }>;
  contratos_por_setor: Array<{
    setor: string;
    valor: number;
  }>;
  contratos_por_categoria: Array<{
    categoria: string;
    valor: number;
  }>;
  contratos: Contract[];
};

const COLORS = {
  primary: "#3B82F6",    // Blue
  success: "#10B981",    // Emerald
  warning: "#F59E0B",    // Amber
  danger: "#F43F5E",     // Rose
  info: "#8B5CF6",       // Violet
  neutral: "#64748B",    // Slate
  pieColors: ["#8B5CF6", "#3B82F6", "#F59E0B", "#10B981"] // Violet (Folha), Blue (Contratos), Amber (Auxilio), Emerald (INGESP)
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

export function DespesasFixas() {
  const { resumo_geral, progressao_mensal, contratos_por_setor, contratos } = despesasFixasData;

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSetor, setSelectedSetor] = useState("all");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: "",
    direction: null
  });
  
  const itemsPerPage = 10;

  // Memoized unique dropdown lists
  const sectorList = useMemo(() => {
    const list = contratos.map(c => c.setor).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [contratos]);

  const categoryList = useMemo(() => {
    const list = contratos.map(c => c.categoria).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [contratos]);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contratos.filter(c => {
      const matchesSearch = 
        c.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.contrato.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.empenho.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.historico.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSetor = selectedSetor === "all" || c.setor === selectedSetor;
      const matchesCategoria = selectedCategoria === "all" || c.categoria === selectedCategoria;

      return matchesSearch && matchesSetor && matchesCategoria;
    });
  }, [contratos, searchTerm, selectedSetor, selectedCategoria]);

  // Totals of filtered items
  const filteredTotals = useMemo(() => {
    return filteredContracts.reduce((acc, curr) => {
      acc.valor_mensal += curr.valor_mensal;
      acc.valor_anual += curr.valor_anual;
      return acc;
    }, { valor_mensal: 0, valor_anual: 0 });
  }, [filteredContracts]);

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

  const sortedContracts = useMemo(() => {
    const items = [...filteredContracts];
    if (sortConfig.key && sortConfig.direction) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];

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
  }, [filteredContracts, sortConfig]);

  // Reset page on filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSetor, selectedCategoria]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const paginatedContracts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedContracts.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedContracts, currentPage]);

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
                <ChevronUp className="w-3 h-3 text-rose-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-rose-500" />
              )}
            </span>
          )}
          <span>{label}</span>
          {align !== 'right' && (
            <span className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
              {!isSorted ? (
                <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
              ) : sortConfig.direction === 'asc' ? (
                <ChevronUp className="w-3 h-3 text-rose-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-rose-500" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Donut Chart Data (Fixed Expenses Composition)
  const donutChartData = useMemo(() => {
    return [
      { name: "Folha Salarial", value: resumo_geral.folha_anual },
      { name: "Contratos de Serviços", value: resumo_geral.contratos_anual },
      { name: "Auxílio Alimentação", value: resumo_geral.auxilio_anual },
      { name: "Convênio INGESP", value: resumo_geral.ingesp_anual }
    ];
  }, [resumo_geral]);

  // Department Bar Chart Data (Top 5)
  const deptBarChartData = useMemo(() => {
    return contratos_por_setor.slice(0, 5).map(item => ({
      name: item.setor
        .replace("DEPARTAMENTO MUNICIPAL DE ", "DEP. ")
        .replace("DEPARTAMENTO DE ", "DEP. ")
        .replace("SECRETARIA MUNICIPAL DE ", "SEC. ")
        .replace("SECRETARIA DE ", "SEC. ")
        .replace(" E SERVIÇOS URBANOS", "")
        .replace(" E FINANÇAS", "")
        .substring(0, 25),
      "Valor Contratado": item.valor,
      fullName: item.setor
    }));
  }, [contratos_por_setor]);

  // Contract specific chart data helper
  const contractScheduleData = useMemo(() => {
    if (!selectedContract) return [];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return selectedContract.cronograma.map((val, idx) => ({
      name: months[idx],
      "Valor Parcela": val
    }));
  }, [selectedContract]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Despesas Fixas e Contratos 2026</h2>
          <p className="text-slate-500 text-sm font-medium">
            Monitoramento detalhado dos contratos de prestação de serviços municipais, folha de pagamento, auxílios e convênios permanentes
          </p>
        </div>
      </div>

      {/* Bento Grid: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Despesa Fixa Anual"
          value={formatBRL(resumo_geral.total_despesas_fixas_anual)}
          subtitle="Projeção total para o ano de 2026"
          icon={Wallet}
          bgClass="bg-rose-50"
          iconColorClass="text-rose-500"
        />
        <StatCard
          title="Média Mensal Estimada"
          value={formatBRL(resumo_geral.total_despesas_fixas_mensal)}
          subtitle="Custo fixo mensal de manutenção"
          icon={TrendingDown}
          bgClass="bg-slate-50"
          iconColorClass="text-slate-600"
        />
        <StatCard
          title="Folha Salarial Anual"
          value={formatBRL(resumo_geral.folha_anual)}
          subtitle="Salários, encargos e provisão 13º"
          icon={UserCheck}
          bgClass="bg-violet-50"
          iconColorClass="text-violet-500"
        />
        <StatCard
          title="Contratos Municipais"
          value={formatBRL(resumo_geral.contratos_anual)}
          subtitle={`Soma de ${resumo_geral.num_contratos_ativos} contratos ativos`}
          icon={FileText}
          bgClass="bg-blue-50"
          iconColorClass="text-blue-500"
        />
        <StatCard
          title="Auxílio & INGESP"
          value={formatBRL(resumo_geral.auxilio_anual + resumo_geral.ingesp_anual)}
          subtitle="Soma de auxílio-alimentação e INGESP"
          icon={Coffee}
          bgClass="bg-emerald-50"
          iconColorClass="text-emerald-500"
        />
      </div>

      {/* Bento Grid: Charts & Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Donut Chart: Composition of Fixed Expenses */}
        <div className="lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Composição Anual das Despesas Fixas</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Distribuição proporcional dos recursos contratados e fixos</p>
          </div>

          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [formatBRL(Number(v)), "Valor Anual"]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 bg-slate-50/40 p-3 rounded-2xl border border-slate-100/50">
            {donutChartData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS.pieColors[i % COLORS.pieColors.length] }} 
                />
                <span className="truncate">{item.name} ({((item.value / resumo_geral.total_despesas_fixas_anual) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Area Chart: Monthly Costs Progression */}
        <div className="lg:col-span-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Evolução Mensal do Custo Fixo 2026</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Visualização da sazonalidade (pico de folha salarial em dezembro com o 13º)</p>
          </div>

          <div className="w-full h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={progressao_mensal}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="mes_nome" 
                  tick={{ fill: COLORS.neutral, fontSize: 8, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: COLORS.neutral, fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(val: any, name: any) => [formatBRL(Number(val)), name.toString().toUpperCase()]}
                  contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "1px solid #f1f5f9" }}
                />
                <Legend 
                  iconType="circle"
                  iconSize={8} 
                  wrapperStyle={{ fontSize: "9px", fontWeight: 700, marginTop: "8px" }} 
                  {...({
                    payload: [
                      { value: "Folha Salarial", type: "circle", id: "folha", color: "#8B5CF6" },
                      { value: "Contratos", type: "circle", id: "contratos", color: "#3B82F6" },
                      { value: "Auxílio Alim.", type: "circle", id: "auxilio", color: "#F59E0B" },
                      { value: "INGESP", type: "circle", id: "ingesp", color: "#10B981" }
                    ]
                  } as any)}
                />
                <Area type="monotone" dataKey="folha" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} name="Folha Salarial" />
                <Area type="monotone" dataKey="contratos" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} name="Contratos" />
                <Area type="monotone" dataKey="auxilio" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} name="Auxílio Alim." />
                <Area type="monotone" dataKey="ingesp" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.15} name="INGESP" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Info/Explanation Cards */}
        <div className="lg:col-span-3 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-md font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Info className="w-4 h-4 text-rose-500 shrink-0" />
              Especificações e Detalhes
            </h4>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Custos Fixos Parametrizados</p>
          </div>

          <div className="space-y-4 my-3 text-xs flex-grow overflow-y-auto">
            {/* Folha Card */}
            <div className="p-3 rounded-2xl bg-violet-50/40 border border-violet-100/50">
              <span className="font-extrabold text-violet-700 block">Folha Salarial</span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                Custos reais com folha e encargos. De Janeiro a Abril fixados em <strong>R$ 6.120.055,45</strong> e de Maio a Novembro em <strong>R$ 6.386.277,86</strong> mensais. Em Dezembro, há o pagamento de 13º salário totalizando <strong>R$ 10.028.664,25</strong>.
              </span>
            </div>

            {/* Auxilio Card */}
            <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100/50">
              <span className="font-extrabold text-amber-700 block">Auxílio Alimentação</span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                Pagamentos de ticket alimentação de servidores mantidos de forma constante em <strong>R$ 1.059.300,00</strong> por mês.
              </span>
            </div>

            {/* INGESP Card */}
            <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/50">
              <span className="font-extrabold text-emerald-700 block">Convênio INGESP Innovare</span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                Pagamento permanente de convênio e prestação de serviços com valor fixado em <strong>R$ 500.000,00</strong> mensais.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Top 5 departments spending on contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6">
          <div className="mb-4">
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Concentração de Despesas de Contratos por Departamento</h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Comparativo dos 5 departamentos municipais com maior volume acumulado de contratos de serviços</p>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptBarChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  tick={{ fill: COLORS.neutral, fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: COLORS.neutral, fontSize: 8, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={150}
                />
                <Tooltip 
                  formatter={(value: any) => [formatBRL(Number(value)), "Valor Total"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "1px solid #f1f5f9" }}
                />
                <Bar dataKey="Valor Contratado" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Contracts Table */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6">
        
        {/* Filters Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200/50">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Detalhamento dos Contratos</h4>
              <p className="text-xs font-semibold text-slate-400">Pesquise fornecedores, objetos de contrato ou filtre por departamento</p>
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
                placeholder="Buscar fornecedor, contrato, empenho..."
                className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              />
            </div>

            {/* Setor Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedSetor}
                onChange={(e) => setSelectedSetor(e.target.value)}
                className="w-full sm:w-56 px-3.5 py-2 text-sm font-bold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all shadow-sm"
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
                className="w-full sm:w-48 px-3.5 py-2 text-sm font-bold rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all shadow-sm"
              >
                <option value="all">Categoria: Todas</option>
                {categoryList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm !== "" || selectedSetor !== "all" || selectedCategoria !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSetor("all");
                  setSelectedCategoria("all");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all shadow-sm cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Contracts Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/95 shadow-sm mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60">
                {renderSortableHeader("Empenho", "empenho", "left")}
                {renderSortableHeader("Contrato", "contrato", "left")}
                {renderSortableHeader("Fornecedor / Contratado", "fornecedor", "left")}
                {renderSortableHeader("Setor / Secretaria", "setor", "left")}
                {renderSortableHeader("Tipo de Despesa", "categoria", "left")}
                {renderSortableHeader("Valor Mensal", "valor_mensal", "right")}
                {renderSortableHeader("Valor Anual", "valor_anual", "right")}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {paginatedContracts.length > 0 ? (
                  paginatedContracts.map((c) => {
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={`${c.empenho}-${c.fornecedor}`}
                        onClick={() => setSelectedContract(c)}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-600">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200/60 group-hover:bg-rose-50 group-hover:text-rose-700 group-hover:border-rose-200 transition-colors">
                            {c.empenho}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">
                          {c.contrato}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors">{c.fornecedor}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 line-clamp-1">{c.historico}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-slate-600 line-clamp-1 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {c.setor}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {c.categoria}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-sm text-slate-800">
                          {formatBRL(c.valor_mensal)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-sm text-slate-800">
                          {formatBRL(c.valor_anual)}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold text-sm">
                      Nenhum contrato encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
            {filteredContracts.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/80 border-t-2 border-slate-200/80 font-extrabold text-slate-800">
                  <td colSpan={5} className="py-3 px-4 text-xs font-black uppercase text-slate-500 tracking-wider">
                    Total Filtrado ({filteredContracts.length} Contratos)
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {formatBRL(filteredTotals.valor_mensal)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {formatBRL(filteredTotals.valor_anual)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination controls */}
        {filteredContracts.length > 0 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Página {currentPage} de {totalPages} ({filteredContracts.length} contratos)
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

      {/* Contract Detail Modal/Drawer */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContract(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl rounded-3xl bg-[#FAFAED] border border-white/60 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between z-10"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedContract(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Contractor info */}
              <div className="pr-10 mb-6">
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-widest">
                  Ficha Orçamentária: {selectedContract.ficha || "n/a"}
                </span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2 line-clamp-2">
                  {selectedContract.fornecedor}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  {selectedContract.setor}
                </p>
              </div>

              {/* Description & Metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 overflow-y-auto pr-1">
                
                {/* Historico / Object */}
                <div className="md:col-span-8 space-y-4">
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Histórico / Objeto do Empenho</span>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed leading-5">
                      {selectedContract.historico}
                    </p>
                  </div>

                  {/* Monthly Installments Chart */}
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cronograma de Parcelas Planejadas</span>
                    <div className="w-full h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={contractScheduleData}
                          margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: COLORS.neutral, fontSize: 8, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: COLORS.neutral, fontSize: 8 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                          />
                          <Tooltip 
                            formatter={(val: any) => [formatBRL(Number(val)), "Valor da Parcela"]}
                            contentStyle={{ borderRadius: "10px", fontSize: "10px" }}
                          />
                          <Bar dataKey="Valor Parcela" fill="#F43F5E" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Contract Specs */}
                <div className="md:col-span-4 space-y-4">
                  
                  {/* Empenho Code */}
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Código Empenho</span>
                    <span className="text-sm font-black text-slate-700 font-mono mt-1 block">{selectedContract.empenho}</span>
                  </div>

                  {/* Contrato Number */}
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Número do Contrato</span>
                    <span className="text-sm font-black text-slate-700 font-mono mt-1 block">{selectedContract.contrato}</span>
                  </div>

                  {/* Monthly Value */}
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm bg-rose-50/20 border-rose-100/50">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Mensalidade Média</span>
                    <span className="text-md font-black text-rose-600 mt-1 block">{formatBRL(selectedContract.valor_mensal)}</span>
                  </div>

                  {/* Annual Value */}
                  <div className="bg-white/60 rounded-2xl border border-white/80 p-4 shadow-sm bg-rose-50/40 border-rose-100">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">Valor Total Anual</span>
                    <span className="text-lg font-black text-rose-700 mt-1 block">{formatBRL(selectedContract.valor_anual)}</span>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
