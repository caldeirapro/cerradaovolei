import { Player, MatchDetails } from '@/types';
import { getNextPreferredMatchDate } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';

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

const INITIAL_PLAYERS: Player[] = [];

export const getStoredPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('cerradao_state')
      .select('data')
      .eq('key', 'players')
      .single();

    if (!error && data && data.data) {
      return data.data;
    }
  } catch (e) {
    console.error('Error fetching players from Supabase:', e);
  }

  if (typeof window === 'undefined') return INITIAL_PLAYERS;
  const stored = localStorage.getItem('cerradao_players_v4');
  if (!stored) return INITIAL_PLAYERS;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PLAYERS;
  }
};

export const saveStoredPlayers = async (players: Player[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cerradao_players_v4', JSON.stringify(players));
  }

  try {
    await supabase.from('cerradao_state').upsert({
      key: 'players',
      data: players,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error saving players to Supabase:', e);
  }
};

export const getStoredMatchDetails = async (): Promise<MatchDetails> => {
  const currentCalculated = getNextPreferredMatchDate();

  try {
    const { data, error } = await supabase
      .from('cerradao_state')
      .select('data')
      .eq('key', 'match_details')
      .single();

    if (!error && data && data.data) {
      const details: MatchDetails = data.data;

      // Se o evento gravado no banco estiver desatualizado ou pulou o jogo de HOJE, atualiza automaticamente
      if (!details.isManuallyEdited && details.date !== currentCalculated.formattedDate) {
        const updatedDetails: MatchDetails = {
          ...details,
          date: currentCalculated.formattedDate,
          rawDateStr: currentCalculated.rawDateStr,
        };
        await saveStoredMatchDetails(updatedDetails);
        return updatedDetails;
      }

      return details;
    }
  } catch (e) {
    console.error('Error fetching match details from Supabase:', e);
  }

  if (typeof window === 'undefined') return INITIAL_MATCH_DETAILS;
  const stored = localStorage.getItem('cerradao_match_details_v3');
  if (!stored) return INITIAL_MATCH_DETAILS;
  try {
    const details = JSON.parse(stored);
    if (!details.isManuallyEdited && details.date !== currentCalculated.formattedDate) {
      return {
        ...details,
        date: currentCalculated.formattedDate,
        rawDateStr: currentCalculated.rawDateStr,
      };
    }
    return details;
  } catch (e) {
    return INITIAL_MATCH_DETAILS;
  }
};

export const saveStoredMatchDetails = async (details: MatchDetails) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cerradao_match_details_v3', JSON.stringify(details));
  }

  try {
    await supabase.from('cerradao_state').upsert({
      key: 'match_details',
      data: details,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error saving match details to Supabase:', e);
  }
};
