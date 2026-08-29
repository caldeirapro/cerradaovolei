require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node"
  }
});

require('dotenv').config({ path: '.env.local' });

const { connectToWhatsApp, startWhatsAppOutboxQueue } = require('./src/services/whatsapp-bot');

console.log('[Bot Worker] Inicializando bot do WhatsApp (Baileys)...');

connectToWhatsApp()
  .then(() => {
    console.log('[Bot Worker] Conectado! Iniciando fila de envio (Outbox Queue)...');
    startWhatsAppOutboxQueue();
  })
  .catch((err) => {
    console.error('[Bot Worker] Erro ao iniciar a sessão do WhatsApp:', err);
  });
