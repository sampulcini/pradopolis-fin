"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  User, 
  Mail, 
  Shield, 
  Users, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Building,
  Info,
  Calendar,
  Key
} from "lucide-react";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface UserProfile {
  name: string;
  email: string;
}

export function Configuracoes({ user }: { user: UserProfile | null }) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isAdmin = user?.email === "contabilidade@pradopolis.sp.gov.br";

  useEffect(() => {
    if (isAdmin) {
      fetchPendingUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/auth/admin/pending");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar usuários pendentes.");
      }
      setPendingUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao buscar cadastros.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    setNotification(null);
    try {
      const res = await fetch("/api/auth/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao aprovar usuário.");
      }
      
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setNotification({ message: "Servidor aprovado com sucesso!", type: "success" });
    } catch (err: any) {
      setNotification({ message: err.message || "Erro de conexão.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm("Tem certeza que deseja recusar e excluir este cadastro?")) {
      return;
    }
    setActionLoading(userId);
    setNotification(null);
    try {
      const res = await fetch("/api/auth/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao recusar usuário.");
      }

      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setNotification({ message: "Cadastro recusado e excluído do sistema.", type: "success" });
    } catch (err: any) {
      setNotification({ message: err.message || "Erro de conexão.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-slate-500 mt-4 font-semibold text-sm">Carregando dados da sessão...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8">
        <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-800/10">
          <Settings className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Painel de Configurações</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-semibold">
            Gerenciamento de perfil institucional e aprovações de acesso
          </p>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-sm ${
            notification.type === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
              : "bg-rose-50 border-rose-100 text-rose-600"
          }`}
        >
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Seu Perfil
            </h3>

            {/* Profile Detail List */}
            <div className="space-y-4">
              <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Servidor</span>
                  <span className="text-sm font-black text-slate-700">{user.name}</span>
                </div>
              </div>

              <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-mail Institucional</span>
                  <span className="text-sm font-black text-slate-700 break-all">{user.email}</span>
                </div>
              </div>

              <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-9 w-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Nível de Acesso</span>
                  <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                    {isAdmin ? "Administrador Contábil" : "Servidor Municipal"}
                    <span className={`inline-block h-2 w-2 rounded-full ${isAdmin ? "bg-blue-500" : "bg-emerald-500"}`} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              Institucional
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Este dashboard financeiro é uma plataforma restrita de Pradópolis/SP. Caso precise atualizar seus dados cadastrais ou solicitar permissões adicionais de secretaria, entre em contato diretamente com a Coordenadoria de Contabilidade e Finanças do município.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Versão 2.1.0 • Pradópolis/SP</span>
            </div>
          </div>
        </div>

        {/* Right Side: Admin Permissions/Users Table */}
        <div className="lg:col-span-2">
          {isAdmin ? (
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Cadastros de Servidores Aguardando Aprovação
                </h3>
                <span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-full">
                  {pendingUsers.length} {pendingUsers.length === 1 ? "pendente" : "pendentes"}
                </span>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-slate-400 text-xs font-bold mt-3">Carregando solicitações...</span>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                  <h4 className="text-sm font-extrabold text-slate-700">Falha ao buscar usuários</h4>
                  <p className="text-slate-400 text-xs font-medium max-w-md mt-1">{error}</p>
                  <button 
                    onClick={fetchPendingUsers} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 bg-white/30 border border-dashed border-slate-200 rounded-2xl">
                  <Clock className="w-12 h-12 text-slate-300 mb-3" />
                  <h4 className="text-sm font-black text-slate-600">Nenhum cadastro pendente</h4>
                  <p className="text-slate-400 text-xs font-medium max-w-sm mt-1 px-4">
                    Todas as solicitações de registro de servidores municipais foram processadas e liberadas.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Servidor / E-mail</th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Data de Registro</th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {pendingUsers.map((pUser) => (
                          <motion.tr 
                            key={pUser.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="group hover:bg-white/40"
                          >
                            <td className="py-4 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs uppercase">
                                  {pUser.name.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-black text-slate-700 block truncate">{pUser.name}</span>
                                  <span className="text-[10px] font-semibold text-slate-400 block truncate">{pUser.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-3 hidden sm:table-cell">
                              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {new Date(pUser.created_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(pUser.id)}
                                  disabled={actionLoading !== null}
                                  className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span className="hidden xs:inline">Aprovar</span>
                                </button>
                                <button
                                  onClick={() => handleReject(pUser.id)}
                                  disabled={actionLoading !== null}
                                  className="h-8 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-rose-500/10"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span className="hidden xs:inline">Rejeitar</span>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 min-h-[400px]">
              <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Segurança & Permissões
              </h3>

              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Acesso Homologado</h4>
                    <p className="text-xs text-emerald-700 font-semibold leading-relaxed mt-1">
                      Sua conta de servidor municipal está homologada e possui permissão de leitura sobre todas as receitas, despesas fixas, projeções orçamentárias e contratos vigentes do município de Pradópolis.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                  <Key className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Ações Administrativas Restritas</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                      Esta conta não possui nível de administrador. O gerenciamento de usuários cadastrados e controle de políticas de acesso são permitidos apenas para o e-mail de liderança da contabilidade municipal (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">contabilidade@pradopolis.sp.gov.br</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
