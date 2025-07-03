/**
 *  🔒 Privacy-tools plugin
 *  • .presence <jid>     → start tracking a contact’s online/typing/recording events
 *  • .unpresence <jid>   → stop tracking
 *  • .whoread <groupJid> → list members who read the latest group message
 *
 *  Works on Baileys / BWM-XMD.
 */
const { command } = require("../lib");
const tracked = new Set();          // JIDs we are tracking
const logged  = {};                 // last presence string per JID

// ---- presence tracker ------------------------------------------------------
command(
  { pattern: "presence ?(.*)", fromMe: true },
  async (msg, match) => {
    const jid = match.trim();
    if (!jid.endsWith("@s.whatsapp.net")) {
      return await msg.sendMessage("⚠️  Provide a full JID, e.g. 2547xxxxxxx@s.whatsapp.net");
    }
    tracked.add(jid);
    await msg.sendMessage(`✅ Now tracking presence for ${jid}`);
  }
);

command(
  { pattern: "unpresence ?(.*)", fromMe: true },
  async (msg, match) => {
    const jid = match.trim();
    tracked.delete(jid);
    await msg.sendMessage(`🚫 Stopped tracking presence for ${jid}`);
  }
);

// listen to presence-update events
global.sock.ev.on("presence-update", async (pu) => {
  const { id, presences } = pu;
  if (!tracked.has(id)) return;

  const data = presences[id] || {};
  const state = data.lastKnownPresence || "unknown";

  if (logged[id] !== state) {
    logged[id] = state;
    await global.sock.sendMessage(
      global.owner + "@s.whatsapp.net",
      { text: `📡 ${id} is now *${state}*` }
    );
  }
});

// ---- group read receipt ----------------------------------------------------
command(
  { pattern: "whoread ?(.*)", fromMe: true },
  async (msg, match) => {
    const gid = match.trim();
    if (!gid.endsWith("@g.us")) {
      return await msg.sendMessage("⚠️  That is not a group JID.");
    }

    const participants = await sock.groupMetadata(gid)
                                   .then(g => g.participants.map(p => p.id));

    let result = "👁️ People who read the last message:\n";
    let found  = false;

    for (const p of participants) {
      const rr = sock.chatReadTimestamp(gid, p);
      if (rr) {
        found = true;
        result += ` • ${p}\n`;
      }
    }

    await msg.sendMessage(found ? result : "Nobody has read the last message yet.");
  }
);