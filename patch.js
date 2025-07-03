/**
 *  patch-reply.js
 *  ───────────────
 *  Legacy BWM-XMD plugins still use msg.reply_message
 *  but Baileys MD now exposes the quoted message as msg.quoted.
 *
 *  This shim maps .reply_message → .quoted once at startup,
 *  so every old command works again without edits.
 */

try {
  // most builds keep the Message prototype in lib/Message
  const MsgProto = require("../lib/Message");

  if (!Object.getOwnPropertyDescriptor(MsgProto.prototype, "reply_message")) {
    Object.defineProperty(MsgProto.prototype, "reply_message", {
      get() {
        return this.quoted ?? null;
      },
    });
    console.log("🩹  reply_message shim applied → using .quoted under the hood");
  } else {
    console.log("ℹ️  reply_message already exists (no shim needed)");
  }
} catch (e) {
  // If the path is different or Message not found we fail silently
  console.log("⚠️  Could not apply reply_message shim:", e.message);
}