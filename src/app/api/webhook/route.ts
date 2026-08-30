import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sanitizePlayerName } from '@/utils/helpers';

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting por IP (Máximo 5 requisições a cada 10 segundos por IP)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    const windowMs = 10000; // 10 segundos
    const maxRequests = 5;

    const timestamps = rateLimitMap.get(clientIp) || [];
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return NextResponse.json(
        { error: 'Muitas tentativas! Por favor, aguarde alguns segundos antes de enviar novamente.' },
        { status: 429 }
      );
    }

    validTimestamps.push(now);
    rateLimitMap.set(clientIp, validTimestamps);

    // 2. Validação de Segurança (Secret Token / Origin Check)
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-webhook-secret');

    if (webhookSecret && providedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook call' }, { status: 401 });
    }

    const body = await request.json();
    const { formattedMessage, players, matchDetails, newPlayerName } = body;

    if (!formattedMessage || typeof formattedMessage !== 'string') {
      return NextResponse.json({ error: 'Valid formattedMessage string is required' }, { status: 400 });
    }

    const decodedMessage = decodeURIComponent(formattedMessage);
    const groupJid = process.env.WHATSAPP_GROUP_JID || '120363413913766840@g.us';

    // 3. Sanitiza os nomes de todos os jogadores antes de persistir no banco
    let sanitizedPlayers = players;
    if (Array.isArray(players)) {
      sanitizedPlayers = players
        .map((p: any) => ({
          ...p,
          name: sanitizePlayerName(p.name || ''),
        }))
        .filter((p: any) => p.name.length > 0);

      // Prevenção contra Nomes Duplicados Exatos na mesma partida
      if (newPlayerName) {
        const cleanNewName = sanitizePlayerName(newPlayerName).toLowerCase();
        const duplicates = sanitizedPlayers.filter((p: any) => p.name.toLowerCase() === cleanNewName);
        if (duplicates.length > 1) {
          // Mantém apenas um com o nome duplicado exato
          const seen = new Set();
          sanitizedPlayers = sanitizedPlayers.filter((p: any) => {
            const lower = p.name.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
          });
        }
      }

      await supabase.from('cerradao_state').upsert({
        key: 'players',
        data: sanitizedPlayers,
        updated_at: new Date().toISOString(),
      });
    }

    // 4. Atualiza os detalhes da partida no Supabase pelo servidor
    if (matchDetails) {
      await supabase.from('cerradao_state').upsert({
        key: 'match_details',
        data: matchDetails,
        updated_at: new Date().toISOString(),
      });
    }

    // 5. Insere a mensagem na fila do WhatsApp
    const { error: outboxError } = await supabase.from('whatsapp_outbox').insert([
      {
        group_jid: groupJid,
        message: decodedMessage,
        status: 'pending',
      },
    ]);

    if (outboxError) {
      console.error('[API Webhook Outbox Error]:', outboxError);
      return NextResponse.json({ error: outboxError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'State updated and queued for WhatsApp delivery' });
  } catch (error: any) {
    console.error('[API Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
