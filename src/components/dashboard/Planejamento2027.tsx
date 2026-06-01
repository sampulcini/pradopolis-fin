"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  User, 
  Clock, 
  FileText, 
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlanningTask {
  periodo: string;
  etapa: string;
  atividade: string;
  responsavel: string;
  concluido: boolean;
}

const ldoData: PlanningTask[] = [
  {
    periodo: "Maio",
    etapa: "Alinhamento pós-PPA",
    atividade: "Análise da LDO anterior e definição das metas fiscais do exercício",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Junho",
    etapa: "Proposta técnica inicial",
    atividade: "Elaboração da minuta da LDO com base no PPA e nas prioridades da gestão",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Julho",
    etapa: "Revisão e complementação",
    atividade: "Ajustes técnicos e integração com os setores",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Até 10 de Agosto",
    etapa: "Audiência pública",
    atividade: "Realização da audiência pública sobre a LDO",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Até 20 de Agosto",
    etapa: "Entrega à Câmara",
    atividade: "Protocolo do Projeto de Lei do LDO na Câmara Municipal",
    responsavel: "Diretor de Finanças",
    concluido: false
  }
];

const loaData: PlanningTask[] = [
  {
    periodo: "Julho",
    etapa: "Coleta de dados e estimativas",
    atividade: "Levantamento das receitas, despesas, emendas e demandas por unidade orçamentária",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Agosto",
    etapa: "Elaboração da proposta",
    atividade: "Redação técnica da LOA e organização dos anexos e quadros",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Até 10 de Setembro",
    etapa: "Audiência pública",
    atividade: "Realização da audiência pública sobre a proposta orçamentária",
    responsavel: "ALEX MORONTA , SAMUEL PULCINI",
    concluido: false
  },
  {
    periodo: "Até 20 de Setembro",
    etapa: "Entrega à Câmara",
    atividade: "Protocolo do Projeto de Lei da LOA na Câmara Municipal",
    responsavel: "Diretor de Finanças",
    concluido: false
  }
];

export function Planejamento2027() {
  const [activeTab, setActiveTab] = useState<"ldo" | "loa">("ldo");

  const currentTasks = activeTab === "ldo" ? ldoData : loaData;
  const tabTitle = activeTab === "ldo" ? "Lei de Diretrizes Orçamentárias - LDO" : "Lei Orçamentária Anual - LOA";
  const tabDesc = activeTab === "ldo" 
    ? "Estabelece as metas e prioridades da administração pública, orientando a elaboração da LOA."
    : "Estima as receitas e fixa as despesas para o exercício financeiro subsequente.";

  // Dynamic progress calculations
  const totalLdo = ldoData.length;
  const completedLdo = ldoData.filter(t => t.concluido).length;
  const isLdoCompleted = completedLdo === totalLdo;

  const totalLoa = loaData.length;
  const completedLoa = loaData.filter(t => t.concluido).length;
  const isLoaCompleted = completedLoa === totalLoa;

  const overallProgress = Math.round(
    ((completedLdo + completedLoa) / (totalLdo + totalLoa)) * 100
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Planejamento Orçamentário 2027</h2>
          <p className="text-slate-500 text-sm font-medium">
            Acompanhamento das peças de planejamento elaboradas em 2026 para o orçamento de 2027
          </p>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Card */}
        <div className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-violet-200/20 rounded-full blur-[40px] pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-violet-600 font-extrabold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4.5 h-4.5" />
              Status de Elaboração
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Instrumentos de Planejamento 2027</h3>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Acompanhe o cronograma de formulação, realização de audiências públicas e protocolo legislativo.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xl shadow-inner">
                {overallProgress}%
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Status Geral</span>
                <span className={`text-xs font-black uppercase tracking-wide ${overallProgress === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                  {overallProgress === 100 ? "Concluído & Protocolado" : "Em Elaboração"}
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />

            {/* LDO Badge */}
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                isLdoCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-500 border border-amber-100"
              }`}>
                {isLdoCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-5 h-5 animate-pulse" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">LDO 2027</span>
                <span className="text-xs font-black text-slate-700">
                  {isLdoCompleted ? "Entregue em 20 de Agosto" : "Prazo: Até 20 de Agosto"}
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />

            {/* LOA Badge */}
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                isLoaCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-500 border border-amber-100"
              }`}>
                {isLoaCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-5 h-5 animate-pulse" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">LOA 2027</span>
                <span className="text-xs font-black text-slate-700">
                  {isLoaCompleted ? "Entregue em 20 de Setembro" : "Prazo: Até 20 de Setembro"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PPA Status Info Box */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/15 rounded-full blur-[35px] pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs uppercase tracking-wider mb-2">
              <Info className="w-4.5 h-4.5" />
              Plano Plurianual - PPA 2026-2029
            </div>
            <h4 className="text-lg font-bold text-slate-800 tracking-tight">PPA Consolidado</h4>
            <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
              O PPA 2026-2029 já foi planejado, aprovado e está vigente, definindo as diretrizes estratégicas de médio prazo do município.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Vigência Ativa</span>
            <span className="text-xs font-extrabold bg-amber-100 text-amber-800 rounded-full px-3 py-1">2026 - 2029</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigator */}
      <div className="flex items-center gap-3 mb-6 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("ldo")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "ldo"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          LDO 2027
        </button>
        <button
          onClick={() => setActiveTab("loa")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "loa"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          LOA 2027
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline View */}
        <div className="lg:col-span-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{tabTitle}</h3>
            <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
              {tabDesc}
            </p>
          </div>

          <div className="relative border-l-2 border-slate-200/80 pl-6 ml-4 space-y-8 py-2">
            <AnimatePresence mode="wait">
              {currentTasks.map((task, idx) => (
                <motion.div
                  key={`${activeTab}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Status Indicator Circle */}
                  <span className={`absolute -left-[35px] top-1 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-all duration-300 ${
                    task.concluido 
                      ? "bg-emerald-100 text-emerald-600 border border-emerald-200" 
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}>
                    {task.concluido ? "✓" : <Clock className="w-3 h-3 text-slate-400" />}
                  </span>

                  <div className="bg-white/60 hover:bg-white/90 border border-slate-100 hover:border-violet-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-0.5 tracking-wider">
                          {task.periodo}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 mt-2 tracking-tight group-hover:text-violet-600 transition-colors">
                          {task.etapa}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold border rounded-full px-2.5 py-0.5 select-none shrink-0 ${
                        task.concluido 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {task.concluido ? "Concluído" : "Aguardando"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-semibold leading-relaxed leading-5 mb-4">
                      {task.atividade}
                    </p>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100/60">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        Responsável: <strong className="text-slate-700 uppercase tracking-wide">{task.responsavel}</strong>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Info/Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Summary stats */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Métricas do Processo</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Etapas Totais</span>
                <span className="text-sm font-black text-slate-800">{currentTasks.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                <span className="text-xs font-bold text-slate-500">Concluídas</span>
                <span className="text-sm font-black text-emerald-650">{currentTasks.filter(t => t.concluido).length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <span className="text-xs font-bold text-slate-500">Percentual Executado</span>
                <span className="text-sm font-black text-blue-600">
                  {Math.round((currentTasks.filter(t => t.concluido).length / currentTasks.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Legislative flow explanation card */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Fluxo Legislativo</h4>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed leading-5 mb-4">
              Após o protocolo na Câmara Municipal por parte do Executivo, o projeto de lei tramita pelas comissões legislativas (Finanças e Orçamento, Constituição e Justiça), passa por emendas parlamentares e votações em plenário antes de retornar para sanção do Prefeito.
            </p>
            <div className="p-3 bg-violet-50/40 border border-violet-100/50 rounded-2xl flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-500 font-semibold leading-normal">
                <strong>Prazo de Devolução:</strong> A Câmara Municipal deve deliberar e devolver a LDO aprovada até o encerramento do primeiro período da sessão legislativa (Julho) e a LOA aprovada até o encerramento da sessão legislativa anual (Dezembro).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
