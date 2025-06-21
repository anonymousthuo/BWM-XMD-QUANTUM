const { command } = require("../lib");

// .guesssavedme command
command(
  { pattern: "guesssavedme", fromMe: true },
  async (message, match, m, client) => {
    const chats = await client.chats.all();
    let result = "📇 *People who likely saved your number:*\n\n";

    for (const chat of chats) {
      const { id, name } = chat;
      if (name && id.includes("@s.whatsapp.net")) {
        result += `✅ ${name} (${id})\n`;
      }
    }

    await message.sendMessage(result || "❌ No contacts found.");
  }
);

// .typetest fake typing demo
command(
  { pattern: "typetest", fromMe: true },
  async (message, match, m, client) => {
    await client.sendPresenceUpdate("composing", message.jid);
    await new Promise((res) => setTimeout(res, 3000));
    await client.sendPresenceUpdate("paused", message.jid);
    await message.sendMessage("✅ This was a fake typing effect.");
  }
);