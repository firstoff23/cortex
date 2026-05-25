import { useState, useCallback } from "react";

// useSessionPersistence.js — Sincronização e persistência de sessões (Supabase + localStorage).
export default function useSessionPersistence({ supabaseClient, userId, conversationId }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const getLocalKey = useCallback((convId) => {
    return `cortex-conv-${convId || conversationId}`;
  }, [conversationId]);

  // Carregar sessão (Supabase com fallback para localStorage)
  const loadSession = useCallback(async (targetConvId) => {
    const activeConvId = targetConvId || conversationId;
    if (!activeConvId) return null;

    // 1. Tentar ler do localStorage primeiro (rápido)
    let localMsgs = null;
    try {
      const localData = localStorage.getItem(getLocalKey(activeConvId));
      if (localData) {
        localMsgs = JSON.parse(localData);
      }
    } catch (e) {
      console.warn("[SessionPersistence] Erro ao ler localmente:", e);
    }

    // 2. Se houver Supabase ativo, tentar sincronizar do servidor
    if (supabaseClient && userId && userId !== "anon") {
      try {
        const { data, error } = await supabaseClient
          .from("conversations")
          .select("messages")
          .eq("id", String(activeConvId))
          .single();

        if (error) {
          // Se o registo não existir no Supabase mas existir localmente, devolve o local
          if (error.code === "PGRST116") {
            return localMsgs;
          }
          throw error;
        }

        if (data && data.messages) {
          // Sincronizar o localStorage com o valor mais recente do Supabase
          try {
            localStorage.setItem(getLocalKey(activeConvId), JSON.stringify(data.messages));
          } catch {}
          return data.messages;
        }
      } catch (err) {
        console.warn("[SessionPersistence] Falha ao ler do Supabase, usando local:", err.message);
      }
    }

    return localMsgs;
  }, [supabaseClient, userId, conversationId, getLocalKey]);

  // Guardar sessão (localStorage + Supabase em background)
  const saveSession = useCallback(async (messages, targetConvId) => {
    const activeConvId = targetConvId || conversationId;
    if (!activeConvId || !messages) return;

    // 1. Guardar imediatamente no localStorage (não-bloqueante)
    try {
      localStorage.setItem(getLocalKey(activeConvId), JSON.stringify(messages));
    } catch (e) {
      console.warn("[SessionPersistence] Erro ao guardar no localStorage:", e);
    }

    // 2. Guardar no Supabase de forma assíncrona
    if (supabaseClient && userId && userId !== "anon") {
      setIsSyncing(true);
      setSyncError(null);

      // Usamos Promise.allSettled por segurança de concorrência se aplicável,
      // mas aqui fazemos um upsert simples tratado de forma isolada e sem bloquear a UI.
      try {
        const payload = {
          id: String(activeConvId),
          messages: messages,
          created_at: new Date().toISOString()
        };

        // Adicionar user_id se a tabela suportar múltiplos utilizadores
        if (userId) {
          payload.user_id = userId;
        }

        const { error } = await supabaseClient
          .from("conversations")
          .upsert(payload);

        if (error) throw error;
      } catch (err) {
        console.warn("[SessionPersistence] Sincronização falhou. Dados mantidos localmente:", err.message);
        setSyncError(err.message);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [supabaseClient, userId, conversationId, getLocalKey]);

  return {
    saveSession,
    loadSession,
    isSyncing,
    error: syncError
  };
}
