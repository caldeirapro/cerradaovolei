'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Zap, X, Trash2 } from 'lucide-react';
import { sanitizePlayerName } from '@/utils/helpers';

interface AddPlayerFormProps {
  onAddPlayers: (names: string[]) => void;
  maxPlayers: number;
  currentCount: number;
  onShowToast: (title: string, message: string, type?: 'warning' | 'error' | 'info' | 'success') => void;
  onShowConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({
  onAddPlayers,
  maxPlayers,
  currentCount,
  onShowToast,
  onShowConfirmModal,
}) => {
  const [name, setName] = useState('');
  const [myMainName, setMyMainName] = useState<string>('');
  const [nameHistory, setNameHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMain = localStorage.getItem('cerradao_user_main_name');
      if (savedMain) setMyMainName(savedMain);

      const savedHistory = localStorage.getItem('cerradao_user_name_history');
      if (savedHistory) {
        try {
          setNameHistory(JSON.parse(savedHistory));
        } catch (e) {
          setNameHistory([]);
        }
      }
    }
  }, []);

  const saveNameToHistory = (enteredName: string, isMain: boolean = true) => {
    if (typeof window === 'undefined' || !enteredName.trim()) return;
    const cleanName = enteredName.trim();

    // Se for o primeiro nome cadastrado no aparelho e isMain for true, define como nome principal
    if (isMain && !myMainName) {
      setMyMainName(cleanName);
      localStorage.setItem('cerradao_user_main_name', cleanName);
    }

    // Atualiza histórico (últimos 5 nomes únicos usados)
    const updatedHistory = [cleanName, ...nameHistory.filter((n) => n !== cleanName)].slice(0, 5);
    setNameHistory(updatedHistory);
    localStorage.setItem('cerradao_user_name_history', JSON.stringify(updatedHistory));
  };

  const handleRemoveSingleHistoryName = (nameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita selecionar o nome ao clicar no X
    if (typeof window === 'undefined') return;

    const updatedHistory = nameHistory.filter((n) => n !== nameToRemove);
    setNameHistory(updatedHistory);
    localStorage.setItem('cerradao_user_name_history', JSON.stringify(updatedHistory));

    // Se o nome removido for o nome principal, limpa o nome principal
    if (nameToRemove === myMainName) {
      setMyMainName('');
      localStorage.removeItem('cerradao_user_main_name');
    }
  };

  const handleClearAllSavedNames = () => {
    onShowConfirmModal(
      'Limpar Atalhos?',
      'Deseja limpar todos os nomes salvos nos seus atalhos deste aparelho?',
      () => {
        setMyMainName('');
        setNameHistory([]);
        localStorage.removeItem('cerradao_user_main_name');
        localStorage.removeItem('cerradao_user_name_history');
        onShowToast('Atalhos limpos', 'Todos os seus nomes salvos foram removidos.', 'info');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Separa nomes por vírgula (,), ponto e vírgula (;) ou quebra de linha (\n)
    const rawNames = name.split(/[,;\n]/).map((n) => n.trim()).filter((n) => n.length > 0);

    if (rawNames.length === 0) {
      onShowToast(
        'Nome inválido',
        'Por favor, digite um nome válido com no mínimo 2 letras (sem aspas ou caracteres especiais).',
        'warning'
      );
      return;
    }

    const validNames: string[] = [];
    for (const rawName of rawNames) {
      const cleanName = sanitizePlayerName(rawName);
      if (cleanName) {
        validNames.push(cleanName);
      }
    }

    if (validNames.length === 0) {
      onShowToast(
        'Nome inválido',
        'Por favor, digite nomes válidos com no mínimo 2 letras cada.',
        'warning'
      );
      return;
    }

    // Salva apenas o PRIMEIRO nome inserido como o nome principal do atalho "Eu", e salva os demais no histórico
    saveNameToHistory(validNames[0]);
    validNames.slice(1).forEach((otherName) => {
      saveNameToHistory(otherName, false); // Não substitui o nome principal com o nome de acompanhantes
    });

    // Envia todos os nomes de uma só vez para inserção atômica
    onAddPlayers(validNames);
    setName('');
    setShowHistory(false);
  };

  const handleQuickInsert = (selectedName: string) => {
    const cleanName = sanitizePlayerName(selectedName);
    if (!cleanName) return;
    saveNameToHistory(cleanName);
    onAddPlayers([cleanName]);
    setName('');
    setShowHistory(false);
  };

  const isWaitlist = currentCount >= maxPlayers;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-6 relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-orange-500" />
          Colocar Nome na Lista
        </h2>
        {isWaitlist && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            ⚠️ Vagas cheias! Você entrará na Fila de Espera.
          </span>
        )}
      </div>

      {/* Atalhos Rápidos (Seu Nome e Histórico com opção de deletar) */}
      {(myMainName || nameHistory.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Atalhos:
          </span>

          {myMainName && (
            <div className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-bold rounded-xl border border-orange-200 overflow-hidden">
              <button
                type="button"
                onClick={() => handleQuickInsert(myMainName)}
                className="px-3 py-1.5 hover:bg-orange-200 transition-all flex items-center gap-1.5 active:scale-95"
                title="Inserir meu nome principal"
              >
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>⚡ {myMainName} (Eu)</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleRemoveSingleHistoryName(myMainName, e)}
                className="px-1.5 py-1.5 hover:bg-orange-300 text-orange-700 transition-colors border-l border-orange-200"
                title="Remover meu nome dos atalhos"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {nameHistory
            .filter((n) => n !== myMainName)
            .map((histName) => (
              <div
                key={histName}
                className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleQuickInsert(histName)}
                  className="px-3 py-1.5 hover:bg-slate-200 transition-all active:scale-95"
                >
                  {histName}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveSingleHistoryName(histName, e)}
                  className="px-1.5 py-1.5 hover:bg-slate-300 text-slate-500 transition-colors border-l border-slate-200"
                  title={`Remover "${histName}" dos atalhos`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

          <button
            type="button"
            onClick={handleClearAllSavedNames}
            className="text-[11px] font-medium text-slate-400 hover:text-rose-600 hover:underline ml-auto flex items-center gap-0.5"
            title="Limpar todos os nomes salvos"
          >
            <Trash2 className="w-3 h-3" /> Limpar atalhos
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            required
            placeholder="Digite seu nome (ou vários por vírgula)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowHistory(true);
            }}
            onFocus={() => setShowHistory(true)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800 font-medium"
          />
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 px-1 flex items-center gap-1">
            <span>💡 <strong>Dica:</strong> Insira vários nomes de uma vez usando vírgulas (ex: <em>Daniel, Acsa, Adão</em>).</span>
          </p>

          {/* Sugestões de Autocomplete em Dropdown com remoção individual */}
          {showHistory && nameHistory.length > 0 && name.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100">
              <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Nomes salvos anteriormente</span>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {nameHistory
                .filter((n) => n.toLowerCase().includes(name.toLowerCase()))
                .map((suggestedName) => (
                  <div
                    key={suggestedName}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-orange-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleQuickInsert(suggestedName)}
                      className="flex-1 text-left py-1 text-sm font-medium text-slate-700 group-hover:text-orange-700 flex items-center justify-between mr-2"
                    >
                      <span>{suggestedName}</span>
                      {suggestedName === myMainName && (
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-md">
                          Meu Nome
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSingleHistoryName(suggestedName, e)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Apagar este nome do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`py-3 px-8 rounded-2xl text-white font-bold text-base shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shrink-0 ${
            isWaitlist
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          {isWaitlist ? 'Entrar na Fila de Espera' : 'Garantir Vaga'}
        </button>
      </form>
    </div>
  );
};
