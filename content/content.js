(function () {
  const browser = globalThis.browser ?? globalThis.chrome;
  const HOST_ID = "__secimi_cevir_tooltip_host__";
  let hostEl = null;
  let closeHandlersAttached = false;

  browser.runtime.onMessage.addListener((msg) => {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "SHOW_TRANSLATION") {
      showTooltip({
        title: `${msg.detectedSrc || "?"} → ${msg.target || "?"}`,
        body: msg.translated || "",
        original: msg.original || "",
        isError: false
      });
    } else if (msg.type === "SHOW_ERROR") {
      showTooltip({
        title: "Hata",
        body: msg.message || "Bilinmeyen hata",
        original: "",
        isError: true
      });
    }
  });

  function getAnchorRect() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect && (rect.width || rect.height)) return rect;
    }
    return null;
  }

  function showTooltip({ title, body, original, isError }) {
    removeTooltip();

    hostEl = document.createElement("div");
    hostEl.id = HOST_ID;
    hostEl.style.all = "initial";
    hostEl.style.position = "fixed";
    hostEl.style.zIndex = "2147483647";
    hostEl.style.top = "0";
    hostEl.style.left = "0";

    const shadow = hostEl.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .box {
        position: fixed;
        max-width: 360px;
        min-width: 180px;
        background: #1f2937;
        color: #f9fafb;
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border-radius: 8px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        padding: 10px 12px;
        box-sizing: border-box;
      }
      .box.error { background: #7f1d1d; }
      .hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #9ca3af;
      }
      .box.error .hdr { color: #fecaca; }
      .body {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 14px;
        color: #f9fafb;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      button {
        all: unset;
        cursor: pointer;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(255,255,255,0.12);
        color: #f9fafb;
      }
      button:hover { background: rgba(255,255,255,0.22); }
      .close {
        cursor: pointer;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1;
        padding: 0 4px;
      }
      .close:hover { color: #fff; }
    `;

    const box = document.createElement("div");
    box.className = "box" + (isError ? " error" : "");

    const hdr = document.createElement("div");
    hdr.className = "hdr";
    const hdrLabel = document.createElement("span");
    hdrLabel.textContent = title;
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", removeTooltip);
    hdr.appendChild(hdrLabel);
    hdr.appendChild(closeBtn);

    const bodyEl = document.createElement("div");
    bodyEl.className = "body";
    bodyEl.textContent = body;

    box.appendChild(hdr);
    box.appendChild(bodyEl);

    if (!isError && body) {
      const actions = document.createElement("div");
      actions.className = "actions";
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Kopyala";
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(body);
          copyBtn.textContent = "Kopyalandı ✓";
          setTimeout(() => { copyBtn.textContent = "Kopyala"; }, 1200);
        } catch (_) {
          copyBtn.textContent = "Hata";
        }
      });
      actions.appendChild(copyBtn);
      box.appendChild(actions);
    }

    shadow.appendChild(style);
    shadow.appendChild(box);
    document.documentElement.appendChild(hostEl);

    positionBox(box);
    attachCloseHandlers();
  }

  function positionBox(box) {
    const rect = getAnchorRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;

    // Measure
    box.style.visibility = "hidden";
    box.style.left = "0px";
    box.style.top = "0px";
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;

    let left, top;
    if (rect) {
      left = rect.left;
      top = rect.bottom + margin;
      if (top + bh > vh) top = Math.max(margin, rect.top - bh - margin);
      if (left + bw > vw) left = Math.max(margin, vw - bw - margin);
      if (left < margin) left = margin;
    } else {
      left = Math.max(margin, (vw - bw) / 2);
      top = margin;
    }
    box.style.left = left + "px";
    box.style.top = top + "px";
    box.style.visibility = "visible";
  }

  function removeTooltip() {
    if (hostEl && hostEl.parentNode) {
      hostEl.parentNode.removeChild(hostEl);
    }
    hostEl = null;
    detachCloseHandlers();
  }

  function onOutsideMouseDown(e) {
    if (!hostEl) return;
    // Shadow DOM boundary: hostEl.contains(e.target) true olur tüm iç tıklamalar için
    if (!hostEl.contains(e.target)) {
      removeTooltip();
    }
  }
  function onKeyDown(e) {
    if (e.key === "Escape") removeTooltip();
  }
  function attachCloseHandlers() {
    if (closeHandlersAttached) return;
    document.addEventListener("mousedown", onOutsideMouseDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    closeHandlersAttached = true;
  }
  function detachCloseHandlers() {
    if (!closeHandlersAttached) return;
    document.removeEventListener("mousedown", onOutsideMouseDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    closeHandlersAttached = false;
  }
})();
