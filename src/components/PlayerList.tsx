import React, { useState } from 'react';
import { Player } from '@/types';
import { Clock, Trash2, CheckSquare, Square, X } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  maxPlayers: number;
  onRemovePlayer: (id: string) => void;
  onRemovePlayers?: (ids: string[]) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  maxPlayers,
  onRemovePlayer,
  onRemovePlayers,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemovePlayer(id);
      setRemovingId(null);
    }, 250);
  };

  const toggleSelectPlayer = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleConfirmBatchRemove = () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    if (onRemovePlayers) {
      onRemovePlayers(idsArray);
    } else {
      idsArray.forEach((id) => onRemovePlayer(id));
    }
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const confirmedPlayers = players.slice(0, maxPlayers);
  const waitlistPlayers = players.slice(maxPlayers);

  return (
    <div className="space-y-6">
      {/* Top Header Actions / Batch Selection Toggle */}
      {players.length > 0 && (
        <div className="flex justify-end items-center gap-2">
          {isSelectMode ? (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-2xl animate-item-add">
              <span className="text-xs font-bold text-rose-800 px-2">
                {selectedIds.size} selecionado(s)
              </span>
              <button
                onClick={handleConfirmBatchRemove}
                disabled={selectedIds.size === 0}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Selecionados</span>
              </button>
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="p-1.5 hover:bg-rose-100 rounded-xl text-rose-700 transition-colors"
                title="Cancelar Seleção"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckSquare className="w-4 h-4 text-orange-500" />
              <span>Gerenciar / Selecionar Vários</span>
            </button>
          )}
        </div>
      )}

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
            {confirmedPlayers.map((player, index) => {
              const isRemoving = removingId === player.id;
              const isSelected = selectedIds.has(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => isSelectMode && toggleSelectPlayer(player.id)}
                  className={`py-3 flex items-center justify-between gap-3 group px-3 rounded-xl transition-all duration-300 ease-in-out animate-item-add ${
                    isSelectMode ? 'cursor-pointer hover:bg-orange-50/60' : 'hover:bg-slate-50/80'
                  } ${isRemoving ? 'opacity-0 scale-95 -translate-x-4 bg-rose-50' : 'opacity-100'} ${
                    isSelected ? 'bg-orange-50/90 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isSelectMode ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPlayer(player.id);
                        }}
                        className="text-orange-600 transition-transform active:scale-95 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 fill-orange-100 text-orange-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                        {index + 1}
                      </span>
                    )}
                    <p className="font-semibold text-slate-800 text-base truncate">
                      {player.name}
                    </p>
                  </div>

                  {!isSelectMode && (
                    <button
                      onClick={() => handleRemove(player.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1 text-xs font-medium active:scale-90"
                      title="Desistir / Remover da lista"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remover</span>
                    </button>
                  )}
                </div>
              );
            })}
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
            {waitlistPlayers.map((player, index) => {
              const isRemoving = removingId === player.id;
              const isSelected = selectedIds.has(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => isSelectMode && toggleSelectPlayer(player.id)}
                  className={`py-3 flex items-center justify-between gap-3 px-3 rounded-xl transition-all duration-300 ease-in-out animate-item-add ${
                    isSelectMode ? 'cursor-pointer hover:bg-amber-100/60' : 'hover:bg-amber-100/40'
                  } ${isRemoving ? 'opacity-0 scale-95 -translate-x-4 bg-rose-50' : 'opacity-100'} ${
                    isSelected ? 'bg-amber-100/90 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isSelectMode ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPlayer(player.id);
                        }}
                        className="text-amber-700 transition-transform active:scale-95 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 fill-amber-200 text-amber-700" />
                        ) : (
                          <Square className="w-5 h-5 text-amber-300 hover:text-amber-400" />
                        )}
                      </button>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 text-sm font-bold flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                        +{index + 1}
                      </span>
                    )}
                    <p className="font-semibold text-amber-950 text-base truncate">{player.name}</p>
                  </div>

                  {!isSelectMode && (
                    <button
                      onClick={() => handleRemove(player.id)}
                      className="p-2 text-amber-600 hover:text-rose-600 hover:bg-rose-100/50 rounded-xl transition-all flex items-center gap-1 text-xs font-medium active:scale-90"
                      title="Sair da Fila"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Sair da Fila</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
