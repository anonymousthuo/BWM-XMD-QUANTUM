const { command } = require("../lib");
const fs = require("fs");
const path = "./status-log.json";

// Load or initialize log
let statusLog = {};
if (fs.existsSync(path)) {
  try {
    statusLog = JSON.parse(fs.readFileSync(path));
  } catch (e) {
    statusLog = {};
  }
}

// ✅ .statuswatch Command
command({ pattern: "statuswatch", fromMe: true }, async (msg) => {
  if (Object.keys(statusLog).length === 0) {
    return await msg.sendMessage("📭 No status viewer data logged.");
  }

  let text = "👁️ *Status Watch Log:*\n\n";
  for (const [jid, count] of Object.entries(statusLog)) {
    text += `👤 ${jid} viewed ${count} status(es)\n`;
  }

  return await msg.sendMessage(text);
});

// ✅ .guesssavedme Command
command({ pattern: "guesssavedme", fromMe: true }, async (msg, match, m) => {
  try {
    let contacts = await msg.client.groupFetchAllParticipating();
    let text = "📇 *Possible Saved Contacts:*\n\n";

    for (const groupId in contacts) {
      const group = contacts[groupId];
      group.participants.forEach((p) => {
        if (p.admin && p.id.includes("@s.whatsapp.net")) {
          text += `✅ ${p.id}\n`;
        }
      });
    }

    await msg.sendMessage(text || "❌ No matching contacts found.");
  } catch (e) {
    await msg.sendMessage("❌ Couldn't fetch contacts. This feature may be limited.");
  }
});