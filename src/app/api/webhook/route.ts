import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formattedMessage, players, matchDetails } = body;

    if (!formattedMessage) {
      return NextResponse.json({ error: 'formattedMessage is required' }, { status: 400 });
    }

    const decodedMessage = decodeURIComponent(formattedMessage);
    const groupJid = process.env.WHATSAPP_GROUP_JID || '120363413913766840@g.us';

    // 1. Atualiza o estado dos jogadores no Supabase pelo servidor
    if (players && Array.isArray(players)) {
      await supabase.from('cerradao_state').upsert({
        key: 'players',
        data: players,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Atualiza os detalhes da partida no Supabase pelo servidor
    if (matchDetails) {
      await supabase.from('cerradao_state').upsert({
        key: 'match_details',
        data: matchDetails,
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Insere a mensagem na fila do WhatsApp
    const { error: outboxError } = await supabase.from('whatsapp_outbox').insert([
      {
        group_jid: groupJid,
        message: decodedMessage,
        status: 'pending'
      }
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
