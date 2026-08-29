import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const outboxFile = path.join(process.cwd(), 'whatsapp-outbox.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formattedMessage } = body;

    if (!formattedMessage) {
      return NextResponse.json({ error: 'formattedMessage is required' }, { status: 400 });
    }

    const decodedMessage = decodeURIComponent(formattedMessage);
    const groupJid = process.env.WHATSAPP_GROUP_JID || '120363413913766840@g.us';

    let outbox: Array<{ id: string; groupJid: string; message: string; createdAt: number }> = [];

    if (fs.existsSync(outboxFile)) {
      try {
        const content = fs.readFileSync(outboxFile, 'utf-8');
        outbox = JSON.parse(content);
      } catch (err) {
        outbox = [];
      }
    }

    // Adiciona a nova mensagem à fila outbox
    outbox.push({
      id: Date.now().toString(),
      groupJid,
      message: decodedMessage,
      createdAt: Date.now(),
    });

    fs.writeFileSync(outboxFile, JSON.stringify(outbox, null, 2));

    return NextResponse.json({ success: true, message: 'Message queued for WhatsApp delivery' });
  } catch (error: any) {
    console.error('[API Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
