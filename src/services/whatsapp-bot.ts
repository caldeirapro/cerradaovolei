import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import { supabase } from '../lib/supabase';

let sock: WASocket | null = null;
let isConnected = false;

const statusFile = path.join(process.cwd(), 'whatsapp-status.json');

function writeStatus(connected: boolean) {
  try {
    fs.writeFileSync(statusFile, JSON.stringify({ isConnected: connected, lastUpdated: Date.now() }));
  } catch (err) {
    console.error('[WhatsApp Bot] Failed to write status file:', err);
  }
}

export async function connectToWhatsApp(): Promise<WASocket> {
  writeStatus(false);
  const authFolder = path.join(process.cwd(), 'auth_session');
  
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  sock = makeWASocket({
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n----------------------------------------------------');
      console.log('📌 LEIA O QR CODE ABAIXO PARA CONECTAR SEU WHATSAPP:');
      console.log('----------------------------------------------------');
      const qrcode = require('qrcode-terminal');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      isConnected = false;
      writeStatus(false);
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[WhatsApp Bot] Conexão fechada. Reconectando: ', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ [WhatsApp Bot] Sessão ativa e conectada com sucesso ao WhatsApp!');
      isConnected = true;
      writeStatus(true);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return sock;
}

export function getWhatsAppSocket(): WASocket | null {
  return sock;
}

export function isWhatsAppConnected(): boolean {
  return isConnected;
}


let isProcessingQueue = false;
let isQueueStarted = false;

export function startWhatsAppOutboxQueue() {
  if (isQueueStarted) {
    return;
  }
  isQueueStarted = true;

  console.log('[WhatsApp Bot Queue] Fila do Supabase com Debounce (15s) iniciada...');
  setInterval(async () => {
    if (!sock || !isConnected || isProcessingQueue) {
      return;
    }

    isProcessingQueue = true;

    try {
      const { data: pendingMessages, error } = await supabase
        .from('whatsapp_outbox')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        return;
      }

      if (pendingMessages && pendingMessages.length > 0) {
        const latestMessage = pendingMessages[pendingMessages.length - 1];
        const messageAgeMs = Date.now() - new Date(latestMessage.created_at).getTime();
        const DEBOUNCE_WAIT_MS = 15000; // Aguarda 15s de silêncio após a última alteração na lista

        if (messageAgeMs < DEBOUNCE_WAIT_MS) {
          // Ainda está recebendo alterações em sequência, aguarda mais um pouco
          return;
        }

        console.log(`[WhatsApp Bot Queue] Processando lote de ${pendingMessages.length} alteração(ões) acumulada(s)...`);
        
        // Marca todas as mensagens acumuladas como enviadas
        const idsToUpdate = pendingMessages.map((m: any) => m.id);
        await supabase
          .from('whatsapp_outbox')
          .update({ status: 'sent' })
          .in('id', idsToUpdate);

        // Envia apenas a última mensagem consolidada com a lista final perfeita
        await sendGroupMessage(latestMessage.group_jid, latestMessage.message);
      }
    } catch (err) {
      console.error('[WhatsApp Bot Queue] Erro ao processar fila do Supabase:', err);
    } finally {
      isProcessingQueue = false;
    }
  }, 3000);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sendGroupMessage(groupJid: string, text: string): Promise<boolean> {
  if (!sock || !isConnected) {
    console.warn('[WhatsApp Bot] Tentativa de envio com bot desconectado.');
    return false;
  }

  try {
    console.log(`[WhatsApp Bot] Simulando digitação humana para o grupo ${groupJid}...`);

    // 1. Notifica o WhatsApp que o bot está "digitando..."
    await sock.sendPresenceUpdate('composing', groupJid);

    // 2. Calcula tempo de digitação realista proporcional ao tamanho do texto (mínimo 2.5s, máximo 6s)
    const typingTimeMs = Math.min(Math.max(text.length * 60, 2500), 6000) + getRandomNumber(300, 1200);
    await sleep(typingTimeMs);

    // 3. Pausa a digitação pouco antes de enviar
    await sock.sendPresenceUpdate('paused', groupJid);
    await sleep(getRandomNumber(400, 900));

    // 4. Envia a mensagem
    console.log(`[WhatsApp Bot] Enviando mensagem para o grupo ${groupJid}...`);
    await sock.sendMessage(groupJid, { text });
    console.log(`✅ [WhatsApp Bot] Mensagem enviada para o grupo com sucesso!`);

    // 5. Pequena pausa após o envio
    await sleep(getRandomNumber(1000, 2000));

    return true;
  } catch (error) {
    console.error(`❌ [WhatsApp Bot] Erro ao enviar mensagem para ${groupJid}:`, error);
    return false;
  }
}

