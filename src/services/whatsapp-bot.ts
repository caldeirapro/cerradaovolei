import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

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

const outboxFile = path.join(process.cwd(), 'whatsapp-outbox.json');
let isProcessingQueue = false;
let isQueueStarted = false;

export function startWhatsAppOutboxQueue() {
  if (isQueueStarted) {
    return;
  }
  isQueueStarted = true;

  console.log('[WhatsApp Bot Queue] Fila de envio iniciada (verificando a cada 3s)...');
  setInterval(async () => {
    if (!sock || !isConnected || isProcessingQueue) {
      return;
    }

    if (!fs.existsSync(outboxFile)) {
      return;
    }

    isProcessingQueue = true;

    try {
      const content = fs.readFileSync(outboxFile, 'utf-8');
      const outbox: Array<{ id: string; groupJid: string; message: string; createdAt: number }> = JSON.parse(content);

      if (outbox.length > 0) {
        console.log(`[WhatsApp Bot Queue] Processando ${outbox.length} mensagem(ns) pendente(s)...`);
        
        // Pega a mensagem mais recente para enviar e limpa a fila IMEDIATAMENTE
        const itemToSend = outbox[outbox.length - 1];
        fs.writeFileSync(outboxFile, JSON.stringify([], null, 2));

        await sendGroupMessage(itemToSend.groupJid, itemToSend.message);
      }
    } catch (err) {
      console.error('[WhatsApp Bot Queue] Erro ao ler fila de envio:', err);
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

