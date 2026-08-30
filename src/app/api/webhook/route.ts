import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formattedMessage } = body;

    if (!formattedMessage) {
      return NextResponse.json({ error: 'formattedMessage is required' }, { status: 400 });
    }

    const decodedMessage = decodeURIComponent(formattedMessage);
    const groupJid = process.env.WHATSAPP_GROUP_JID || '120363413913766840@g.us';

    const { error } = await supabase.from('whatsapp_outbox').insert([
      {
        group_jid: groupJid,
        message: decodedMessage,
        status: 'pending'
      }
    ]);

    if (error) {
      console.error('[API Webhook Supabase Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message queued for WhatsApp delivery in Supabase' });
  } catch (error: any) {
    console.error('[API Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
