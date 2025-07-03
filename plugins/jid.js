const { command } = require("../lib");

command(
  { pattern: "jid", fromMe: true },
  async (msg) => {
    const reply = msg.reply_message;
    let targetJid;

    if (reply) {
      targetJid = reply.jid;
    } else {
      targetJid = msg.jid;
    }

    await msg.sendMessage(`🆔 JID: \`${targetJid}\``);
  }
);