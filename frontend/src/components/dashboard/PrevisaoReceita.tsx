"use client";

import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronRight, ChevronDown, Landmark, Globe, Layers, TrendingUp, BadgeDollarSign, Landmark as TreasuryIcon } from "lucide-react";

import treemapDataRaw from "@/data/treemap_data.json";
import treetableDataRaw from "@/data/treetable_data.json";

const treemapData = treemapDataRaw as any[];
const treetableData = treetableDataRaw as any[];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Custom Treemap Content to display names and values nicely
const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, value, payload } = props;

  const displayValue = value ?? payload?.value ?? 0;
  const displayName = name ?? payload?.name ?? "";

  // Tesouro vs Outros colors (Tailwind emerald vs blue)
  const isTesouro = displayName.includes("Próprio") || displayName.includes("Tesouro");
  const bg = isTesouro ? "#10B981" : "#3B82F6";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: bg,
          stroke: "#ffffff",
          strokeWidth: 2,
          strokeOpacity: 0.8,
        }}
        rx={16}
        ry={16}
      />
      {width > 120 && height > 60 ? (
        <>
          <text 
            x={x + 16} 
            y={y + 36} 
            fill="#ffffff" 
            fontSize={width > 250 ? 18 : 14} 
            fontWeight={700}
          >
            {displayName}
          </text>
          <text 
            x={x + 16} 
            y={y + 60} 
            fill="#ffffff" 
            fontSize={width > 250 ? 16 : 13} 
            fontWeight={500} 
            opacity={0.9}
          >
            {formatBRL(displayValue)}
          </text>
        </>
      ) : null}
    </g>
  );
};

// Recursive Component for the Tree Table
const TreeNode = ({ node, level = 0 }: { node: any; level?: number }) => {
  // Level 0 (Roots) are open by default. Levels 1+ are closed by default.
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 1.5 + 1.25; // rem

  const isLevel0 = level === 0;
  const isLevel1 = level === 1;

  // Determine source to apply consistent color styling
  // We can check if it's the root node itself, or bubble down from its parent ID/structure
  const isTesouro = node.id === "01" || node.id.startsWith("11") || node.id.startsWith("12") || node.id.startsWith("13") || node.id.startsWith("16") || node.id.startsWith("19") || node.id.startsWith("22") || node.id.startsWith("29") || (node.id.startsWith("17") && !["1713", "1714", "1716", "1719.6", "1721.53", "1722.51", "1724", "1751"].some(p => node.id.startsWith(p)));
  
  // Custom design based on level
  const rowStyle = isLevel0
    ? isTesouro
      ? "bg-emerald-50/60 border-l-4 border-l-emerald-500 hover:bg-emerald-50 font-bold text-slate-800"
      : "bg-blue-50/60 border-l-4 border-l-blue-500 hover:bg-blue-50 font-bold text-slate-800"
    : isLevel1
      ? "bg-slate-50/40 hover:bg-slate-50 font-semibold text-slate-700"
      : "hover:bg-slate-50/60 text-slate-600";

  return (
    <>
      <tr 
        className={`border-b border-slate-100 transition-all duration-200 ${rowStyle}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        <td className="py-4 px-6 flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}rem` }}>
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className={`w-4.5 h-4.5 ${isLevel0 ? "text-slate-700" : "text-slate-400"}`} />
            ) : (
              <ChevronRight className={`w-4.5 h-4.5 ${isLevel0 ? "text-slate-700" : "text-slate-400"}`} />
            )
          ) : (
            <span className="w-4.5 h-4.5 inline-block"></span>
          )}
          
          <div className="flex items-center gap-2.5 flex-wrap">
            {isLevel0 && (
              isTesouro ? (
                <Landmark className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              ) : (
                <Globe className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              )
            )}
            
            <span className={`text-sm ${
              isLevel0 ? 'text-base font-extrabold text-slate-800' : 
              isLevel1 ? 'font-semibold text-slate-700' : 
              'text-slate-600 font-medium'
            }`}>
              {!isLevel0 && <span className="text-slate-400 font-mono text-xs mr-2">{node.id}</span>}
              {node.name}
            </span>

            {node.siglas && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                isTesouro 
                  ? "bg-emerald-100/70 text-emerald-800 border border-emerald-200/50" 
                  : "bg-blue-100/70 text-blue-800 border border-blue-200/50"
              }`}>
                {node.siglas}
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-6 text-right">
          <span className={`text-sm font-semibold ${
            isLevel0 ? 'text-slate-900 text-base font-extrabold' : 
            isLevel1 ? 'text-slate-800 font-bold' : 
            'text-slate-600'
          }`}>
            {formatBRL(node.value)}
          </span>
        </td>
      </tr>
      
      {isExpanded && hasChildren && (
        <>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </>
      )}
    </>
  );
};

export function PrevisaoReceita() {
  // Calculate dynamic stats from treetableData
  const totalRevenue = treetableData.reduce((acc, curr) => acc + curr.value, 0);
  const tesouroNode = treetableData.find(n => n.id === "01");
  const vinculadosNode = treetableData.find(n => n.id === "02");
  
  const tesouroVal = tesouroNode?.value ?? 0;
  const vinculadosVal = vinculadosNode?.value ?? 0;
  
  const tesouroPercent = totalRevenue > 0 ? (tesouroVal / totalRevenue) * 100 : 0;
  const vinculadosPercent = totalRevenue > 0 ? (vinculadosVal / totalRevenue) * 100 : 0;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 py-6 pb-40">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Previsão da Receita</h2>
          <p className="text-slate-500 text-sm">Estrutura e detalhamento dos recursos financeiros previstos para o município</p>
        </div>
      </div>

      {/* Bento Cards: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Total previsto */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Previsão Total</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{formatBRL(totalRevenue)}</h3>
            <span className="text-xs text-slate-500">Orçamento Municipal 2026</span>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tesouro */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Recursos Próprios (Tesouro)</span>
            <h3 className="text-2xl font-extrabold text-emerald-600">{formatBRL(tesouroVal)}</h3>
            <span className="text-xs font-semibold text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded-full">
              {tesouroPercent.toFixed(1)}% do orçamento
            </span>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Vinculados */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Recursos Vinculados</span>
            <h3 className="text-2xl font-extrabold text-blue-600">{formatBRL(vinculadosVal)}</h3>
            <span className="text-xs font-semibold text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded-full">
              {vinculadosPercent.toFixed(1)}% do orçamento
            </span>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100">
            <Globe className="w-6 h-6" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 2xl:gap-8 animate-fadeIn">
        
        {/* Treemap Card */}
        <div className="col-span-1 xl:col-span-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Divisão por Fonte de Recurso</h4>
              <span className="text-sm font-medium text-slate-500">Proporção entre Recursos Próprios e Recursos Vinculados</span>
            </div>
            <div className="flex items-center gap-5 bg-white/50 px-4 py-2 rounded-2xl border border-white/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-500">
                  <Landmark className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Próprio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-500">
                  <Globe className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Vinculado</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="value"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent />}
              >
                <Tooltip 
                  formatter={(value: any) => formatBRL(Number(value))} 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.6)", 
                    backgroundColor: "rgba(255,255,255,0.85)", 
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)" 
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TreeTable Card */}
        <div className="col-span-1 xl:col-span-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Detalhamento por Fonte de Recurso</h4>
              <span className="text-sm font-medium text-slate-500">Expanda os grupos e macro categorias para ver os valores das contas contábeis</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Código e Especificação</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-64">Previsão (R$)</th>
                </tr>
              </thead>
              <tbody>
                {treetableData.map((rootNode) => (
                  <TreeNode key={rootNode.id} node={rootNode} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
