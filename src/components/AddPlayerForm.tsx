'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Zap, X } from 'lucide-react';

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
  maxPlayers: number;
  currentCount: number;
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, maxPlayers, currentCount }) => {
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

  const saveNameToHistory = (enteredName: string) => {
    if (typeof window === 'undefined' || !enteredName.trim()) return;
    const cleanName = enteredName.trim();

    // Se for o primeiro nome cadastrado no aparelho, define como nome principal
    let newMain = myMainName;
    if (!myMainName) {
      newMain = cleanName;
      setMyMainName(cleanName);
      localStorage.setItem('cerradao_user_main_name', cleanName);
    }

    // Atualiza histórico (últimos 5 nomes únicos usados)
    const updatedHistory = [cleanName, ...nameHistory.filter((n) => n !== cleanName)].slice(0, 5);
    setNameHistory(updatedHistory);
    localStorage.setItem('cerradao_user_name_history', JSON.stringify(updatedHistory));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveNameToHistory(name);
    onAddPlayer(name.trim());
    setName('');
    setShowHistory(false);
  };

  const handleQuickInsert = (selectedName: string) => {
    setName(selectedName);
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

      {/* Atalhos Rápidos (Seu Nome e Histórico) */}
      {(myMainName || nameHistory.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Atalhos:
          </span>

          {myMainName && (
            <button
              type="button"
              onClick={() => handleQuickInsert(myMainName)}
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 border border-orange-200"
              title="Inserir meu nome principal"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>⚡ {myMainName} (Eu)</span>
            </button>
          )}

          {nameHistory
            .filter((n) => n !== myMainName)
            .map((histName) => (
              <button
                key={histName}
                type="button"
                onClick={() => handleQuickInsert(histName)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 border border-slate-200/60"
              >
                {histName}
              </button>
            ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            required
            placeholder="Digite seu nome ou apelido (Ex: Daniel ou Convidado)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowHistory(true);
            }}
            onFocus={() => setShowHistory(true)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800 font-medium"
          />

          {/* Sugestões de Autocomplete em Dropdown se estiver digitando */}
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
                  <button
                    key={suggestedName}
                    type="button"
                    onClick={() => handleQuickInsert(suggestedName)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-between"
                  >
                    <span>{suggestedName}</span>
                    {suggestedName === myMainName && (
                      <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-md">
                        Meu Nome
                      </span>
                    )}
                  </button>
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
