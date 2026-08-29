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
 * Randomly shuffles players and distributes them evenly into teams
 */
export function getRandomTeams(players: Player[], numTeams: number = 3): Team[] {
  // Fisher-Yates random shuffle
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
