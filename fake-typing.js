const { command } = require("../lib");

// Command: .typetest — shows fake typing then replies
command(
  { pattern: "typetest", fromMe: true },
  async (message, match, m, client) => {
    // Send 'typing...' presence
    await client.sendPresenceUpdate("composing", message.jid);

    // Wait 3 seconds (3000ms)
    await new Promise((res) => setTimeout(res, 3000));

    // Stop typing presence
    await client.sendPresenceUpdate("paused", message.jid);

    // Then reply
    await message.sendMessage("✅ This is a fake typing response!");
  }
);