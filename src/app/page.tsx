'use client';

import React, { useState, useEffect } from 'react';
import { Player, MatchDetails } from '@/types';
import {
  getStoredPlayers,
  saveStoredPlayers,
  getStoredMatchDetails,
  saveStoredMatchDetails,
} from '@/utils/storage';
import { formatWhatsAppMessage, sanitizePlayerName } from '@/utils/helpers';
import { sendListWebhook } from '@/utils/webhook';
import { supabase } from '@/lib/supabase';
import { MatchHeader } from '@/components/MatchHeader';
import { AddPlayerForm } from '@/components/AddPlayerForm';
import { PlayerList } from '@/components/PlayerList';
import { TeamDrawModal } from '@/components/TeamDrawModal';
import { NotificationModal, ToastConfig, ConfirmModalConfig } from '@/components/NotificationModal';
import { Share2, Shuffle, RefreshCw, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    title: "Cerradão Vôlei",
    date: "Terça-feira, 02 de Setembro",
    time: "A partir das 19h00",
    location: "Parque da Cidade - Estacionamento 7",
    maxPlayers: 18,
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const details = await getStoredMatchDetails();
      const loadedPlayers = await getStoredPlayers();
      setMatchDetails(details);
      setPlayers(loadedPlayers);
    };

    loadData();

    // Polling ativo a cada 3 segundos como garantia para atualizar a tela sem recarregar!
    const interval = setInterval(async () => {
      const updatedDetails = await getStoredMatchDetails();
      const updatedPlayers = await getStoredPlayers();
      setMatchDetails((prev) => (JSON.stringify(prev) !== JSON.stringify(updatedDetails) ? updatedDetails : prev));
      setPlayers((prev) => (JSON.stringify(prev) !== JSON.stringify(updatedPlayers) ? updatedPlayers : prev));
    }, 3000);

    // Inscrição em tempo real no Supabase
    try {
      const channel = supabase
        .channel('cerradao_state_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cerradao_state' },
          async () => {
            const updatedDetails = await getStoredMatchDetails();
            const updatedPlayers = await getStoredPlayers();
            setMatchDetails(updatedDetails);
            setPlayers(updatedPlayers);
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Realtime subscription error:', err);
      return () => clearInterval(interval);
    }
  }, []);

  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  const showToast = (title: string, message: string, type: 'warning' | 'error' | 'info' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const handleUpdateMatchDetails = (newDetails: MatchDetails) => {
    setMatchDetails(newDetails);
    saveStoredMatchDetails(newDetails);
  };

  const handleAddPlayer = async (name: string) => {
    const cleanName = sanitizePlayerName(name);
    if (!cleanName) return;

    // Busca o estado mais recente do banco para evitar sobrescrever inserções simultâneas de outros usuários
    const currentLatestPlayers = await getStoredPlayers();

    // Bloqueia adição se o nome já estiver exatamente na lista
    const alreadyExists = currentLatestPlayers.some(
      (p) => p.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      showToast('Nome em duplicidade', `O nome "${cleanName}" já está na lista!`, 'warning');
      return;
    }

    const newPlayer: Player = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      registeredAt: new Date().toISOString(),
    };

    const updated = [...currentLatestPlayers, newPlayer];
    setPlayers(updated);
    await saveStoredPlayers(updated);

    // Dispara webhook assíncrono para notificação do WhatsApp
    sendListWebhook('player_added', updated, matchDetails, cleanName);

    if (updated.length <= matchDetails.maxPlayers) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast('Vaga garantida! 🏐', `${cleanName} foi adicionado(a) com sucesso.`, 'success');
    } else {
      showToast('Fila de Espera', `${cleanName} entrou na fila de espera.`, 'warning');
    }
  };

  const handleRemovePlayer = async (id: string) => {
    // Busca a versão mais atualizada do banco antes de filtrar para evitar perdas concorrentes
    const currentLatestPlayers = await getStoredPlayers();
    const updated = currentLatestPlayers.filter((p) => p.id !== id);
    setPlayers(updated);
    await saveStoredPlayers(updated);

    // Dispara webhook assíncrono informando remoção
    sendListWebhook('player_removed', updated, matchDetails);
    showToast('Nome removido', 'Jogador removido da lista.', 'info');
  };

  const handleCopyWhatsApp = () => {
    if (players.length === 0) {
      showToast('Lista Vazia', 'Não há nenhum jogador confirmado na lista para copiar.', 'warning');
      return;
    }
    const text = formatWhatsAppMessage(matchDetails, players);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    showToast('Copiado!', 'Lista formatada copiada para a área de transferência.', 'success');
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (players.length === 0) {
      showToast('Lista Vazia', 'Não há nenhum jogador confirmado na lista para enviar ao WhatsApp.', 'warning');
      return;
    }
    const text = formatWhatsAppMessage(matchDetails, players);
    const encodedText = encodeURIComponent(text);
    // WhatsApp Universal Link - abre a tela de seleção de conversa ou grupo
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleResetList = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Resetar Lista Semanal?',
      message: 'Tem certeza que deseja zerar a lista da semana? Todos os nomes serão removidos permanentemente.',
      onConfirm: () => {
        setPlayers([]);
        saveStoredPlayers([]);
        sendListWebhook('list_reset', [], matchDetails);
        setConfirmModal(null);
        showToast('Lista zerada', 'Todos os jogadores foram removidos.', 'info');
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const confirmedCount = Math.min(players.length, matchDetails.maxPlayers);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏐</span>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">
              Cerradão Vôlei
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Sortear Times</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all active:scale-95"
              title="Compartilhar lista diretamente no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
              title="Copiar texto formatado"
            >
              {copiedWhatsApp ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Copiado!
                </>
              ) : (
                <>Copiar</>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <MatchHeader
          details={matchDetails}
          onUpdateDetails={handleUpdateMatchDetails}
          totalConfirmed={confirmedCount}
        />

        <AddPlayerForm
          onAddPlayer={handleAddPlayer}
          maxPlayers={matchDetails.maxPlayers}
          currentCount={players.length}
          onShowToast={showToast}
        />

        <PlayerList
          players={players}
          maxPlayers={matchDetails.maxPlayers}
          onRemovePlayer={handleRemovePlayer}
        />

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 pt-4">
          <button
            onClick={handleResetList}
            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resetar Lista Semanal
          </button>
          <p>© Cerradão Vôlei App</p>
        </div>
      </div>

      <TeamDrawModal
        players={players}
        maxPlayers={matchDetails.maxPlayers}
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      <NotificationModal
        toast={toast}
        onCloseToast={() => setToast(null)}
        confirmModal={confirmModal}
      />
    </main>
  );
}
