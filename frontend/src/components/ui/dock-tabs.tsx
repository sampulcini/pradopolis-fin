"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Home, PieChart, TrendingDown, Landmark, FileText, Settings, Users, Calculator } from 'lucide-react'

interface DockItem {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  isActive?: boolean
}

// Adaptado para os módulos do dashboard de Pradópolis
const dockItems: DockItem[] = [
  { id: "home", name: "Visão Geral", icon: <Home />, color: "bg-slate-700" },
  { id: "receita", name: "Arrecadação", icon: <Landmark />, color: "bg-emerald-500" },
  { id: "despesas", name: "Despesas Fixas", icon: <TrendingDown />, color: "bg-rose-500" },
  { id: "orcamento", name: "Orçamento", icon: <PieChart />, color: "bg-blue-500" },
  { id: "folha", name: "Folha Salarial", icon: <Users />, color: "bg-indigo-500" },
  { id: "contratos", name: "Contratos", icon: <FileText />, color: "bg-amber-500" },
  { id: "simulador", name: "Simulador", icon: <Calculator />, color: "bg-teal-500" },
  { id: "settings", name: "Configurações", icon: <Settings />, color: "bg-slate-500" },
]

function DockIcon({ item, mouseX, onClick }: { item: DockItem; mouseX: any; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 80, 50])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const heightSync = useTransform(distance, [-150, 0, 150], [50, 80, 50])
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onClick={onClick}
      className="aspect-square cursor-pointer flex items-center justify-center relative group"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden ${item.color}`}
        animate={{
          y: isClicked ? 2 : isHovered ? -8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          className="text-xl"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          {item.icon}
        </motion.div>
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? -20 : 10,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap pointer-events-none backdrop-blur-md shadow-lg z-50"
      >
        {item.name}
      </motion.div>

      {/* Active indicator dot */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-slate-400/80 rounded-full"
        animate={{
          scale: item.isActive ? 1.5 : 1,
          opacity: item.isActive ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.div>
  )
}

export function DockTabs({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const mouseX = useMotionValue(Infinity)

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="mx-auto flex h-24 items-end gap-4 rounded-3xl bg-white/40 backdrop-blur-xl px-6 pb-4 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        {dockItems.map((item) => (
          <DockIcon 
            key={item.id} 
            item={{...item, isActive: activeTab === item.id}} 
            mouseX={mouseX} 
            onClick={() => onTabChange(item.id)} 
          />
        ))}
      </motion.div>
    </div>
  )
}
