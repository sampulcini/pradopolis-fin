"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  BookOpen, 
  AlertCircle, 
  TrendingDown, 
  FileCheck, 
  User, 
  Calendar, 
  Scale, 
  BarChart as BarIcon, 
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function DocumentosViewer({ onBack }: { onBack?: () => void }) {
  const [selectedDoc, setSelectedDoc] = useState("receitas");

  // Loss details from dashboard_data / estudo-receitas2026.pdf
  const lossBreakdown = [
    {
      name: "IRRF (Perda Reforma)",
      bruto: 4314075.12,
      perda: 992237.28,
      liquido: 3321837.84,
      rate: 23.0,
      color: "#EF4444", // Red
      description: "Queda estrutural nos repasses e retenção de IRRF provocada pela alteração das faixas de isenção federais sobre a folha salarial.",
      finding: "A reforma do Imposto de Renda causou uma retração consolidada de 21,26% no primeiro quadrimestre de 2026 em relação ao mesmo período de 2025. Estimado impacto de 23% de perda sobre o potencial bruto no orçamento de recursos próprios."
    },
    {
      name: "ISS (Serviços)",
      bruto: 7789541.84,
      perda: 1314874.66,
      liquido: 6474667.18,
      rate: 16.9,
      color: "#F59E0B", // Orange
      description: "Inadimplência de prestadores locais e prestação de serviços terceirizados municipais.",
      finding: "Histórico estável com média de inadimplência de 15,64% entre 2020 e 2024. A Nota Fiscal Eletrônica e a grande concentração da Usina São Martinho auxiliam na contenção de perdas maiores."
    },
    {
      name: "IPTU (Patrimônio)",
      bruto: 4796492.34,
      perda: 1261477.49,
      liquido: 3535014.85,
      rate: 26.3,
      color: "#3B82F6", // Blue
      description: "Não pagamento de proprietários urbanos no exercício corrente.",
      finding: "Inadimplência crônica de 23,2% em média (R$ 846.654,48 anuais não pagos). O pico histórico ocorreu em 2021 (pandemia) e segue em patamar elevado de 26,3%, demandando refis ativos."
    },
    {
      name: "Água e Esgoto (Tarifa)",
      bruto: 2862012.04,
      perda: 1173424.94,
      liquido: 1688587.10,
      rate: 41.0,
      color: "#10B981", // Emerald
      description: "Taxa de inadimplência de consumidores e falta de pagamento na tarifa de água e esgotamento sanitário.",
      finding: "Alerta Crítico: a arrecadação efetiva é de apenas 57,4%, gerando uma inadimplência acumulada de 41,0% no período. Isso inviabiliza investimentos de expansão e manutenção da autarquia."
    }
  ];

  // Water & Sewage default rate history from Page 34 of the PDF
  const waterHistory = [
    { ano: "2020", lancado: 2426542.72, pago: 1348944.24, inadimplente: 1064191.66, rate: 43.87 },
    { ano: "2021", lancado: 2504765.74, pago: 1513970.81, inadimplente: 987364.82, rate: 39.41 },
    { ano: "2022", lancado: 2413057.46, pago: 1402425.72, inadimplente: 1009652.45, rate: 41.84 },
    { ano: "2023", lancado: 2380842.24, pago: 1423172.11, inadimplente: 954611.48, rate: 40.09 },
    { ano: "2024", lancado: 2646091.01, pago: 1459330.19, inadimplente: 1167372.87, rate: 44.11 }
  ];

  // IPTU default rate history from Page 12/16 of the PDF
  const iptuHistory = [
    { ano: "2020", lancado: 2889270.87, pago: 2089270.87, inadimplente: 689270.87, rate: 23.60 },
    { ano: "2021", lancado: 3896345.08, pago: 2649032.58, inadimplente: 1247312.50, rate: 32.01 },
    { ano: "2022", lancado: 3440241.46, pago: 2664012.30, inadimplente: 664012.30, rate: 19.30 },
    { ano: "2023", lancado: 3646127.59, pago: 2780123.59, inadimplente: 712012.59, rate: 19.53 },
    { ano: "2024", lancado: 4368257.47, pago: 3318257.47, inadimplente: 987654.88, rate: 22.61 }
  ];

  const totalPerda = lossBreakdown.reduce((sum, item) => sum + item.perda, 0);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      
      {/* Voltar / Header */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Documentos e Estudos Orçamentários</h2>
          <p className="text-slate-500 text-sm">Acompanhe estudos técnicos, análise de perdas fiscais e previsões orçamentárias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 2xl:gap-8">
        
        {/* Sidebar: Document List */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
              Estudos Disponíveis
            </h4>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedDoc("receitas")}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  selectedDoc === "receitas" 
                    ? "bg-amber-500/10 border-amber-400 text-amber-950 font-semibold shadow-sm" 
                    : "bg-white/50 border-white/80 hover:bg-white text-slate-600"
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  selectedDoc === "receitas" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">Análise de Previsão de Receitas</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Estudo de inadimplência, renúncias fiscais e projeção 2026.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 2026</span>
                    <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> 8.55 MB</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => alert("O estudo orçamentário de Despesas está em consolidação pela Secretaria de Planejamento.")}
                className="w-full text-left p-4 rounded-2xl border bg-white/30 border-white/40 text-slate-400 flex items-start gap-3 cursor-not-allowed opacity-60"
              >
                <div className="p-2 rounded-xl bg-slate-100/50 text-slate-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">Estudo de Evolução do Custo Fixo</h5>
                  <p className="text-[10px] mt-1">Impactos salariais e contratos de terceirização.</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-200/50 text-[8px] font-black tracking-widest uppercase">
                    Em Breve
                  </span>
                </div>
              </button>
            </div>

            {/* Document Info Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ficha Técnica do PDF</h5>
              <div className="space-y-2 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Documento:</span>
                  <span className="font-bold text-slate-700">estudo-receitas2026.pdf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Autores:</span>
                  <span className="text-slate-700">Samuel Pulcini & Alex Moronta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Páginas:</span>
                  <span className="text-slate-700">78 páginas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Métodos:</span>
                  <span className="text-slate-700 text-right">Regressão Linear & Médias Ponderadas</span>
                </div>
              </div>
              <a
                href="/estudo-receitas2026.pdf"
                download="estudo-receitas2026.pdf"
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/10"
              >
                <Download className="w-4 h-4" /> Baixar PDF Original
              </a>
            </div>
          </div>
        </div>

        {/* Content Panel: Detailed Analysis */}
        <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
          
          {/* Main Info Card */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> Estudo Técnico de Arrecadação
                </span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2">
                  Diagnóstico de Inadimplência e Frustração de Receitas 2026
                </h3>
                <p className="text-slate-400 text-xs mt-1">Análise detalhada das perdas projetadas de R$ {formatBRL(totalPerda)} sobre os recursos próprios.</p>
              </div>
              <a
                href="/estudo-receitas2026.pdf"
                target="_blank"
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" /> Ler PDF
              </a>
            </div>

            {/* Total Loss Display */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-rose-50/40 border border-rose-100/60 items-center">
              <div className="md:col-span-4 space-y-1">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Perda Total Projetada</span>
                <h3 className="text-3xl font-black text-rose-600 tracking-tight">
                  {formatBRL(totalPerda)}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 block">Recursos Não Arrecadados no Exercício</span>
              </div>
              <div className="md:col-span-8">
                <p className="text-xs font-medium text-rose-950 leading-relaxed">
                  O estudo técnico indica que Pradópolis enfrenta um risco fiscal severo decorrente da frustração de receitas próprias. De cada R$ 100 previstos brutamente em impostos e tarifas, cerca de <strong>R$ 21,30</strong> são perdidos por inadimplência corrente ou alterações na legislação tributária, reduzindo a capacidade municipal para novos investimentos públicos.
                </p>
              </div>
            </div>

            {/* Recharts Breakdown */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                Distribuição das Perdas de Receita por Rubrica
              </h4>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lossBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tickFormatter={(val) => `R$ ${(val/1000000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: "bold" }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", backgroundColor: "rgba(255,255,255,0.9)" }}
                      formatter={(val) => [formatBRL(Number(val)), "Valor Perda"]}
                    />
                    <Bar dataKey="perda" radius={[0, 4, 4, 0]} barSize={16}>
                      {lossBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cards: Deep Dive per Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lossBreakdown.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm font-black text-slate-800 tracking-tight">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 border border-slate-200" style={{ color: item.color }}>
                      {item.rate}% Inadimplência
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">{item.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 my-4 border-y border-slate-100/80 py-3 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Previsão Bruta</span>
                      <span className="text-xs font-bold text-slate-700">{formatBRL(item.bruto).substring(0, 14)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block" style={{ color: item.color }}>Perda Estimada</span>
                      <span className="text-xs font-black" style={{ color: item.color }}>-{formatBRL(item.perda).substring(0, 14)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Receita Líquida</span>
                      <span className="text-xs font-bold text-slate-700">{formatBRL(item.liquido).substring(0, 14)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 mt-2">
                  <p className="text-[10px] font-semibold text-slate-600 leading-relaxed">
                    <strong>Estudo Técnico:</strong> {item.finding}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Deep Dive Section: Water & Sewage Detail (Page 34) */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 tracking-tight">Estudo Crítico: Tarifa de Água e Esgoto (Pág. 34)</h4>
                <p className="text-[11px] text-slate-400 font-semibold">Inadimplência alarmante compromete a sustentabilidade do saneamento</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* History Table */}
              <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/50">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-3 py-2 text-left">Ano</th>
                      <th className="px-3 py-2 text-right">Lançado (R$)</th>
                      <th className="px-3 py-2 text-right">Pago (R$)</th>
                      <th className="px-3 py-2 text-right">Inadimplido (R$)</th>
                      <th className="px-3 py-2 text-right">% Inad.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-600">
                    {waterHistory.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-left font-bold text-slate-800">{row.ano}</td>
                        <td className="px-3 py-2 text-right">{formatBRL(row.lancado).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right text-emerald-600">{formatBRL(row.pago).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right text-rose-500">{formatBRL(row.inadimplente).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right font-bold text-rose-600">{row.rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Text Context */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <h5 className="text-xs font-bold text-emerald-800">Conclusão do Estudo Municipal</h5>
                  <p className="text-[10px] text-emerald-700 leading-relaxed mt-1 font-medium">
                    "A média histórica de arrecadação efetiva é de apenas <strong>57,4%</strong>. Isso significa que cerca de <strong>42,6%</strong> dos valores faturados tornam-se dívida ativa. Recomenda-se a reestruturação dos processos de corte e cobrança, bem como campanhas ativas para restabelecer a sustentabilidade operacional."
                  </p>
                </div>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <h5 className="text-xs font-bold text-amber-800">Metodologia Projeção 2026</h5>
                  <p className="text-[10px] text-amber-700 leading-relaxed mt-1 font-medium">
                    A projeção adota uma postura conservadora, fixando crescimento estável de 4% ao ano para a tarifa bruta lançada, mas projetando a perda em 41% para fins de realista liquidez orçamentária do Tesouro.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dive Section: IPTU Detail (Page 11-12) */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <BarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 tracking-tight">Análise Histórica: Arrecadação de IPTU (Pág. 11-12)</h4>
                <p className="text-[11px] text-slate-400 font-semibold">Projeção conservadora baseada em crescimento nominal por inflação e novos loteamentos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Text Context */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <h5 className="text-xs font-bold text-blue-800">Crescimento da Arrecadação</h5>
                  <p className="text-[10px] text-blue-700 leading-relaxed mt-1 font-medium">
                    O IPTU municipal cresceu aproximadamente <strong>51%</strong> entre 2020 e 2024, saltando de R$ 2,88M para R$ 4,36M. No entanto, a inadimplência média anual persistiu em <strong>23,2%</strong> (média de R$ 846.654,48 não recolhidos por ano).
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <h5 className="text-xs font-bold text-slate-800">Diretrizes para Projeção 2026</h5>
                  <p className="text-[10px] text-slate-700 leading-relaxed mt-1 font-medium">
                    A receita de 2026 é projetada com base no IPCA de 3,5% somado a 2,08% de crescimento real proveniente da expansão imobiliária e consolidação de novos loteamentos na cidade.
                  </p>
                </div>
              </div>

              {/* History Table */}
              <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/50">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-3 py-2 text-left">Ano</th>
                      <th className="px-3 py-2 text-right">Lançado (R$)</th>
                      <th className="px-3 py-2 text-right">Pago (R$)</th>
                      <th className="px-3 py-2 text-right">Inadimplido (R$)</th>
                      <th className="px-3 py-2 text-right">% Inad.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-600">
                    {iptuHistory.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-left font-bold text-slate-800">{row.ano}</td>
                        <td className="px-3 py-2 text-right">{formatBRL(row.lancado).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right text-blue-600">{formatBRL(row.pago).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right text-rose-500">{formatBRL(row.inadimplente).replace("R$", "")}</td>
                        <td className="px-3 py-2 text-right font-bold text-rose-600">{row.rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
