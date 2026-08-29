import { Player, MatchDetails } from '@/types';
import { getNextPreferredMatchDate } from '@/utils/helpers';

const initialNextDate = getNextPreferredMatchDate();

const INITIAL_MATCH_DETAILS: MatchDetails = {
  title: "Cerradão Vôlei",
  date: initialNextDate.formattedDate,
  time: "A partir das 19h00",
  location: "Parque da Cidade - Estacionamento 7",
  maxPlayers: 18,
  isManuallyEdited: false,
  rawDateStr: initialNextDate.rawDateStr,
};

// Começa com lista de jogadores vazia por padrão
const INITIAL_PLAYERS: Player[] = [];

export const getStoredPlayers = (): Player[] => {
  if (typeof window === 'undefined') return INITIAL_PLAYERS;
  const stored = localStorage.getItem('cerradao_players_v4');
  if (!stored) {
    localStorage.setItem('cerradao_players_v4', JSON.stringify(INITIAL_PLAYERS));
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
    localStorage.setItem('cerradao_players_v4', JSON.stringify(players));
    window.dispatchEvent(new Event('storage_cerradao_players'));
  }
};

export const getStoredMatchDetails = (): MatchDetails => {
  if (typeof window === 'undefined') return INITIAL_MATCH_DETAILS;
  const stored = localStorage.getItem('cerradao_match_details_v3');
  const todayStr = new Date().toISOString().split('T')[0];

  if (!stored) {
    localStorage.setItem('cerradao_match_details_v3', JSON.stringify(INITIAL_MATCH_DETAILS));
    return INITIAL_MATCH_DETAILS;
  }

  try {
    const details: MatchDetails = JSON.parse(stored);

    // Se a data NÃO foi editada manualmente pelo usuário E o dia do jogo já passou,
    // atualiza automaticamente para a próxima terça, quinta ou domingo!
    if (!details.isManuallyEdited && details.rawDateStr && details.rawDateStr < todayStr) {
      const nextMatch = getNextPreferredMatchDate();
      const updatedDetails: MatchDetails = {
        ...details,
        date: nextMatch.formattedDate,
        rawDateStr: nextMatch.rawDateStr,
      };
      localStorage.setItem('cerradao_match_details_v3', JSON.stringify(updatedDetails));
      return updatedDetails;
    }

    return details;
  } catch (e) {
    return INITIAL_MATCH_DETAILS;
  }
};

export const saveStoredMatchDetails = (details: MatchDetails) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cerradao_match_details_v3', JSON.stringify(details));
    window.dispatchEvent(new Event('storage_cerradao_match'));
  }
};
