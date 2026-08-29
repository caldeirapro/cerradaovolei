import { Player, MatchDetails } from '@/types';

const INITIAL_MATCH_DETAILS: MatchDetails = {
  title: "Cerradão Vôlei",
  date: "Terça-feira, 02 de Setembro",
  time: "A partir das 19h00",
  location: "Parque da Cidade - Estacionamento 7",
  maxPlayers: 18,
};

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Daniel', registeredAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '2', name: 'João', registeredAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: '3', name: 'Marcos', registeredAt: new Date(Date.now() - 3600000 * 3.5).toISOString() },
  { id: '4', name: 'Lucas', registeredAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: '5', name: 'Gabriel', registeredAt: new Date(Date.now() - 3600000 * 2.5).toISOString() },
  { id: '6', name: 'Bruno', registeredAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '7', name: 'Rodrigo', registeredAt: new Date(Date.now() - 3600000 * 1.8).toISOString() },
  { id: '8', name: 'Felipe', registeredAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { id: '9', name: 'Thiago', registeredAt: new Date(Date.now() - 3600000 * 1.2).toISOString() },
  { id: '10', name: 'Mateus', registeredAt: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: '11', name: 'Guilherme', registeredAt: new Date(Date.now() - 3600000 * 0.8).toISOString() },
  { id: '12', name: 'André', registeredAt: new Date(Date.now() - 3600000 * 0.6).toISOString() },
  { id: '13', name: 'Rafael', registeredAt: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: '14', name: 'Caio', registeredAt: new Date(Date.now() - 3600000 * 0.4).toISOString() },
  { id: '15', name: 'Leonardo', registeredAt: new Date(Date.now() - 3600000 * 0.3).toISOString() },
  { id: '16', name: 'Gustavo', registeredAt: new Date(Date.now() - 3600000 * 0.2).toISOString() },
  { id: '17', name: 'Eduardo', registeredAt: new Date(Date.now() - 3600000 * 0.1).toISOString() },
  { id: '18', name: 'Vinicius', registeredAt: new Date().toISOString() },
  // Waitlist players
  { id: '19', name: 'Henrique (Fila)', registeredAt: new Date(Date.now() + 1000).toISOString() },
  { id: '20', name: 'Samuel (Fila)', registeredAt: new Date(Date.now() + 2000).toISOString() },
];

export const getStoredPlayers = (): Player[] => {
  if (typeof window === 'undefined') return INITIAL_PLAYERS;
  const stored = localStorage.getItem('cerradao_players_v2');
  if (!stored) {
    localStorage.setItem('cerradao_players_v2', JSON.stringify(INITIAL_PLAYERS));
    return INITIAL_PLAYERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PLAYERS;
  }
};

export const saveStoredPlayers = (players: Player[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cerradao_players_v2', JSON.stringify(players));
    window.dispatchEvent(new Event('storage_cerradao_players'));
  }
};

export const getStoredMatchDetails = (): MatchDetails => {
  if (typeof window === 'undefined') return INITIAL_MATCH_DETAILS;
  const stored = localStorage.getItem('cerradao_match_details_v2');
  if (!stored) {
    localStorage.setItem('cerradao_match_details_v2', JSON.stringify(INITIAL_MATCH_DETAILS));
    return INITIAL_MATCH_DETAILS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MATCH_DETAILS;
  }
};

export const saveStoredMatchDetails = (details: MatchDetails) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cerradao_match_details_v2', JSON.stringify(details));
    window.dispatchEvent(new Event('storage_cerradao_match'));
  }
};
