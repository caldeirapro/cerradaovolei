'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
  maxPlayers: number;
  currentCount: number;
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, maxPlayers, currentCount }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlayer(name.trim());
    setName('');
  };

  const isWaitlist = currentCount >= maxPlayers;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-orange-500" />
          Colocar Nome na Lista
        </h2>
        {isWaitlist && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            ⚠️ As vagas principais acabaram! Você entrará na Fila de Espera.
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            required
            placeholder="Digite seu nome ou apelido (Ex: Daniel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800 font-medium"
          />
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
