const browser = globalThis.browser ?? globalThis.chrome;

const LANGUAGES = [
  ["tr", "Türkçe"],
  ["en", "İngilizce"],
  ["de", "Almanca"],
  ["fr", "Fransızca"],
  ["es", "İspanyolca"],
  ["it", "İtalyanca"],
  ["pt", "Portekizce"],
  ["nl", "Felemenkçe"],
  ["ru", "Rusça"],
  ["uk", "Ukraynaca"],
  ["pl", "Lehçe"],
  ["cs", "Çekçe"],
  ["sv", "İsveççe"],
  ["no", "Norveççe"],
  ["da", "Danca"],
  ["fi", "Fince"],
  ["el", "Yunanca"],
  ["ro", "Rumence"],
  ["bg", "Bulgarca"],
  ["hu", "Macarca"],
  ["sr", "Sırpça"],
  ["hr", "Hırvatça"],
  ["sk", "Slovakça"],
  ["sl", "Slovence"],
  ["ar", "Arapça"],
  ["fa", "Farsça"],
  ["he", "İbranice"],
  ["hi", "Hintçe"],
  ["ur", "Urduca"],
  ["bn", "Bengalce"],
  ["th", "Tayca"],
  ["vi", "Vietnamca"],
  ["id", "Endonezce"],
  ["ms", "Malayca"],
  ["ja", "Japonca"],
  ["ko", "Korece"],
  ["zh-CN", "Çince (Basitleştirilmiş)"],
  ["zh-TW", "Çince (Geleneksel)"],
  ["az", "Azerice"],
  ["ka", "Gürcüce"],
  ["kk", "Kazakça"],
  ["uz", "Özbekçe"]
];

const DEFAULTS = { sourceLang: "auto", targetLang: "tr" };

function fillSelect(sel, includeAuto) {
  const frag = document.createDocumentFragment();
  if (includeAuto) {
    const opt = document.createElement("option");
    opt.value = "auto";
    opt.textContent = "Otomatik algıla";
    frag.appendChild(opt);
  }
  for (const [code, name] of LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${name} (${code})`;
    frag.appendChild(opt);
  }
  sel.appendChild(frag);
}

async function init() {
  const sourceSel = document.getElementById("sourceLang");
  const targetSel = document.getElementById("targetLang");
  const saveBtn = document.getElementById("save");
  const statusEl = document.getElementById("status");

  fillSelect(sourceSel, true);
  fillSelect(targetSel, false);

  const stored = await browser.storage.sync.get(DEFAULTS);
  sourceSel.value = stored.sourceLang || DEFAULTS.sourceLang;
  targetSel.value = stored.targetLang || DEFAULTS.targetLang;

  saveBtn.addEventListener("click", async () => {
    const sourceLang = sourceSel.value;
    const targetLang = targetSel.value;
    await browser.storage.sync.set({ sourceLang, targetLang });
    statusEl.textContent = "Kaydedildi ✓";
    setTimeout(() => { statusEl.textContent = ""; }, 1500);
  });
}

init();
