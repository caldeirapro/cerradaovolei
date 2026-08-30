import { Player, MatchDetails } from '@/types';
import { formatWhatsAppMessage } from './helpers';

export interface WebhookPayload {
  event: 'player_added' | 'player_removed' | 'list_reset';
  newPlayerName?: string;
  totalPlayers: number;
  matchDetails: MatchDetails;
  players: Player[];
  formattedMessage: string;
}

/**
 * Sends a webhook notification when a player or list change occurs.
 */
export async function sendListWebhook(
  event: 'player_added' | 'player_removed' | 'list_reset',
  players: Player[],
  matchDetails: MatchDetails,
  newPlayerName?: string
): Promise<boolean> {
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL && !process.env.NEXT_PUBLIC_WEBHOOK_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_WEBHOOK_URL
    : '/api/webhook';

  const formattedMessage = formatWhatsAppMessage(matchDetails, players);

  const payload: WebhookPayload = {
    event,
    newPlayerName,
    totalPlayers: players.length,
    matchDetails,
    players,
    formattedMessage,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook failed with status:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return false;
  }
}
