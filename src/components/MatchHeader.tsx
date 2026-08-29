'use client';

import React, { useState } from 'react';
import { MatchDetails } from '@/types';
import { Calendar, Clock, MapPin, Edit2, Save, X, Users } from 'lucide-react';

interface MatchHeaderProps {
  details: MatchDetails;
  onUpdateDetails: (newDetails: MatchDetails) => void;
  totalConfirmed: number;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ details, onUpdateDetails, totalConfirmed }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MatchDetails>(details);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDetails({ ...formData, isManuallyEdited: true });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
        <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
            Próxima Partida
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            🏐 {details.title}
          </h1>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl backdrop-blur-md transition-colors"
          title="Editar Informações do Jogo"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl space-y-3 mt-4 text-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white uppercase">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white px-3 py-2 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">Data</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-white px-3 py-2 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">Horário</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-white px-3 py-2 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">Local</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white px-3 py-2 rounded-lg text-sm font-medium"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-white uppercase">Limite de Vagas Principais</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                className="w-full bg-white px-3 py-2 rounded-lg text-sm font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-1 shadow-md"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <Calendar className="w-6 h-6 text-amber-200 shrink-0" />
            <div>
              <p className="text-xs text-amber-100 font-medium">Data</p>
              <p className="font-semibold text-sm">{details.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <Clock className="w-6 h-6 text-amber-200 shrink-0" />
            <div>
              <p className="text-xs text-amber-100 font-medium">Horário</p>
              <p className="font-semibold text-sm">{details.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <MapPin className="w-6 h-6 text-amber-200 shrink-0" />
            <div>
              <p className="text-xs text-amber-100 font-medium">Local</p>
              <p className="font-semibold text-sm">{details.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <Users className="w-6 h-6 text-amber-200 shrink-0" />
            <div>
              <p className="text-xs text-amber-100 font-medium">Vagas Ocupadas</p>
              <p className="font-semibold text-sm">{totalConfirmed} / {details.maxPlayers} inscritos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
