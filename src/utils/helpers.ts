import { Player, MatchDetails, Team } from '@/types';

export function formatWhatsAppMessage(details: MatchDetails, players: Player[]): string {
  const mainPlayers = players.slice(0, details.maxPlayers);
  const waitlistPlayers = players.slice(details.maxPlayers);

  let text = `🏐 *${details.title.toUpperCase()}* 🏐\n`;
  text += `📅 *Data:* ${details.date}\n`;
  text += `⏰ *Horário:* ${details.time}\n`;
  text += `📍 *Local:* ${details.location}\n`;
  text += `------------------------------------\n`;
  text += `👥 *LISTA DE CONFIRMADOS (${mainPlayers.length}/${details.maxPlayers})*\n\n`;

  mainPlayers.forEach((player, index) => {
    text += `${index + 1}. ${player.name}\n`;
  });

  if (waitlistPlayers.length > 0) {
    text += `\n⏳ *FILA DE ESPERA (${waitlistPlayers.length})*\n`;
    waitlistPlayers.forEach((player, index) => {
      text += `${index + 1}. ${player.name}\n`;
    });
  }

  text += `\n🔗 *Confirme sua presença no link:* ${typeof window !== 'undefined' ? window.location.href : 'https://cerradao-volei.app'}\n`;

  return text;
}

/**
 * Calculates the next preferred match date (Tuesday = 2, Thursday = 4, Sunday = 0)
 * Format: "Terça-feira, 01 de Setembro"
 */
export function getNextPreferredMatchDate(fromDate: Date = new Date()): { formattedDate: string; rawDateStr: string } {
  const preferredDays = [2, 4, 0]; // Tuesday (2), Thursday (4), Sunday (0)
  const currentDay = fromDate.getDay();

  // Find days to add until the next preferred day
  let minDaysToAdd = 7;
  for (const targetDay of preferredDays) {
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Must be in the future (next match)
    }
    if (daysToAdd < minDaysToAdd) {
      minDaysToAdd = daysToAdd;
    }
  }

  const nextDate = new Date(fromDate);
  nextDate.setDate(fromDate.getDate() + minDaysToAdd);

  const dayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const dayOfWeek = dayNames[nextDate.getDay()];
  const dayNumber = String(nextDate.getDate()).padStart(2, '0');
  const monthName = monthNames[nextDate.getMonth()];

  const formattedDate = `${dayOfWeek}, ${dayNumber} de ${monthName}`;
  const rawDateStr = nextDate.toISOString().split('T')[0];

  return { formattedDate, rawDateStr };
}

/**
 * Randomly shuffles players and distributes them evenly into teams
 */
export function getRandomTeams(players: Player[], numTeams: number = 3): Team[] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    name: `Time ${String.fromCharCode(65 + i)}`,
    players: [],
  }));

  shuffled.forEach((player, index) => {
    teams[index % numTeams].players.push(player);
  });

  return teams;
}
