'use client';

import React from 'react';
import { Player } from '@/types';
import { Clock, Trash2 } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  maxPlayers: number;
  onRemovePlayer: (id: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  maxPlayers,
  onRemovePlayer,
}) => {
  const confirmedPlayers = players.slice(0, maxPlayers);
  const waitlistPlayers = players.slice(maxPlayers);

  return (
    <div className="space-y-6">
      {/* Lista Principal */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-slate-800">
              Confirmados ({confirmedPlayers.length}/{maxPlayers})
            </h2>
          </div>
        </div>

        {confirmedPlayers.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm italic">
            Ninguém confirmou presença ainda. Seja o primeiro! 🏐
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {confirmedPlayers.map((player, index) => (
              <div
                key={player.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-slate-800 text-base truncate">
                    {player.name}
                  </p>
                </div>

                {/* Remover */}
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Desistir / Remover da lista"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Remover</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fila de Espera */}
      {waitlistPlayers.length > 0 && (
        <div className="bg-amber-50/50 rounded-3xl p-6 shadow-sm border border-amber-200/60">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-900">
              Fila de Espera ({waitlistPlayers.length})
            </h2>
          </div>

          <div className="divide-y divide-amber-200/40">
            {waitlistPlayers.map((player, index) => (
              <div
                key={player.id}
                className="py-3 flex items-center justify-between gap-3 px-3 rounded-xl hover:bg-amber-100/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 text-sm font-bold flex items-center justify-center shrink-0">
                    +{index + 1}
                  </span>
                  <p className="font-semibold text-amber-950 text-base truncate">{player.name}</p>
                </div>

                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="p-2 text-amber-600 hover:text-rose-600 hover:bg-rose-100/50 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Sair da Fila"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair da Fila</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
