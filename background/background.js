const browser = globalThis.browser ?? globalThis.chrome;

const MENU_ID = "translate-selection";
const DEFAULTS = { sourceLang: "auto", targetLang: "tr" };
const MAX_LEN = 5000;

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: MENU_ID,
    title: browser.i18n.getMessage("ctxMenuTitle") || 'Çevir: "%s"',
    contexts: ["selection"]
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab || tab.id === undefined) return;
  const text = (info.selectionText || "").trim();
  if (!text) return;
  await handleTranslate(text, tab.id);
});

async function handleTranslate(text, tabId) {
  const { sourceLang, targetLang } = await browser.storage.sync.get(DEFAULTS);

  if (text.length > MAX_LEN) {
    await sendToTab(tabId, {
      type: "SHOW_ERROR",
      message: browser.i18n.getMessage("errTooLong") ||
        `Seçim çok uzun (${text.length} karakter). En fazla ${MAX_LEN} karakter desteklenir.`
    });
    return;
  }

  try {
    const result = await googleTranslate(text, sourceLang, targetLang);
    await sendToTab(tabId, {
      type: "SHOW_TRANSLATION",
      original: text,
      translated: result.translated,
      detectedSrc: result.detectedSrc,
      target: targetLang
    });
  } catch (err) {
    await sendToTab(tabId, {
      type: "SHOW_ERROR",
      message: (browser.i18n.getMessage("errTranslate") || "Çeviri başarısız") +
        (err && err.message ? `: ${err.message}` : "")
    });
  }
}

async function googleTranslate(text, sl, tl) {
  const url = "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { method: "GET", credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Beklenmeyen yanıt");
  }
  const translated = data[0].map(seg => (seg && seg[0]) ? seg[0] : "").join("");
  const detectedSrc = typeof data[2] === "string" ? data[2] : sl;
  return { translated, detectedSrc };
}

async function sendToTab(tabId, message) {
  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch (e) {
    // Content script yüklenmemiş olabilir (örn. about: sayfaları)
    console.warn("sendMessage failed:", e && e.message);
  }
}
