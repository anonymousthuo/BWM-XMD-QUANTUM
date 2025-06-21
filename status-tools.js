const { command } = require("../lib");
const fs = require("fs");

const LOG_FILE = "./status-log.json";

// Load or initialize viewer log
let statusLog = {};
if (fs.existsSync(LOG_FILE)) {
  statusLog = JSON.parse(fs.readFileSync(LOG_FILE));
}

// Command 1: .statuswatch — Show how often users viewed statuses
command(
  { pattern: "statuswatch", fromMe: true },
  async (message) => {
    if (Object.keys(statusLog).length === 0) {
      return await message.sendMessage("No status viewers logged yet.");
    }

    let report = "👁️ *Status Watcher Report:*\n\n";
    const sorted = Object.entries(statusLog).sort((a, b) => b[1] - a[1]);

    for (const [jid, count] of sorted) {
      report += `👤 ${jid} viewed ${count} status(es)\n`;
    }

    await message.sendMessage(report);
  }
);

// Command 2: .guesssavedme — Guess who saved you
command(
  { pattern: "guesssavedme", fromMe: true },
  async (message, match, m, client) => {
    let result = "📇 *Contacts who likely saved your number:*\n\n";

    const chats = await client.chats.all();

    for (const chat of chats) {
      if (chat.name && chat.id.includes("@s.whatsapp.net")) {
        result += `✅ ${chat.name} (${chat.id})\n`;
      }
    }

    if (result === "") {
      result = "❌ No clear matches found.";
    }

    await message.sendMessage(result);
  }
);