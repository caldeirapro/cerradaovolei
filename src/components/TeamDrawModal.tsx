'use client';

import React, { useState } from 'react';
import { Player, Team } from '@/types';
import { getRandomTeams } from '@/utils/helpers';
import { Shuffle, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeamDrawModalProps {
  players: Player[];
  maxPlayers: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamDrawModal: React.FC<TeamDrawModalProps> = ({
  players,
  maxPlayers,
  isOpen,
  onClose,
}) => {
  const confirmedPlayers = players.slice(0, maxPlayers);
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDrawn, setIsDrawn] = useState(false);

  const handleClose = () => {
    setIsDrawn(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleDraw = () => {
    if (confirmedPlayers.length === 0) return;
    const result = getRandomTeams(confirmedPlayers, numTeams);
    setTeams(result);
    setIsDrawn(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">Sorteio Aleatório de Times</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {!isDrawn ? (
          <div className="space-y-6 py-4">
            <p className="text-slate-600 text-sm">
              Embaralha aleatoriamente os <strong>{confirmedPlayers.length} jogadores confirmados</strong> e os divide em equipes iguais.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                Em quantos times deseja dividir?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumTeams(n)}
                    className={`py-3 rounded-2xl font-bold text-sm border transition-all ${
                      numTeams === n
                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {n} Times ({Math.floor(confirmedPlayers.length / n)} jog/time)
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDraw}
              disabled={confirmedPlayers.length === 0}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 text-base"
            >
              <Shuffle className="w-5 h-5" /> Embaralhar e Sortear
            </button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div
                  key={team.name}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                      {team.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border">
                      {team.players.length} Jogadores
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {team.players.map((p, i) => (
                      <li
                        key={p.id}
                        className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2"
                      >
                        <span className="text-slate-400 font-bold text-xs">{i + 1}.</span>
                        <span>{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setIsDrawn(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Alterar Quantidade / Refazer
              </button>
              <button
                onClick={handleDraw}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm"
              >
                <Shuffle className="w-4 h-4" /> Resortear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
