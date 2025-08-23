// const proto = location.protocol === "https:" ? "wss" : "ws";
// const WS_URL = `${proto}://localhost:7381/ws`;

// Force secure WebSocket to avoid mixed-content blocks on https pages (ChatGPT runs on https).
const WS_URL = `wss://localhost:7381/ws`;
const sessionId = `sess_${new Date().toISOString().replace(/[:.]/g, "-")}`;

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;

function initWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  try {
    socket = new WebSocket(WS_URL);
    socket.onopen = () => {
      console.log("[AXON] connected");
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
    socket.onerror = (e) => console.error("[AXON] WS error", e);
    socket.onclose = () => {
      console.warn("[AXON] WS closed, retrying in 3s...");
      reconnectTimer = window.setTimeout(initWebSocket, 3000);
    };
  } catch (e) {
    console.error("[AXON] WS init error", e);
  }
}

function sendToDaemon(type: string, text: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type, session_id: sessionId, text }));
}

function findEditable(): HTMLElement | null {
  // Prefer ProseMirror editor
  let el = document.querySelector("div.ProseMirror[contenteditable='true']");
  if (el) return el as HTMLElement;

  // Fallback to role=textbox (older/newer ChatGPT UIs)
  el = document.querySelector("[contenteditable='true'][role='textbox']");
  if (el) return el as HTMLElement;

  // Last-resort: textarea
  const ta = document.querySelector("textarea");
  return ta as unknown as HTMLElement;
}

function findSendButton(): HTMLButtonElement | null {
  // Current UI data-testid
  let btn = document.querySelector(
    'button[data-testid="send-button"]'
  ) as HTMLButtonElement | null;
  if (btn) return btn;

  // Fallback: aria-label
  btn = Array.from(document.querySelectorAll("button")).find((b) => {
    const t = (b.textContent || "").toLowerCase();
    const a = (b.getAttribute("aria-label") || "").toLowerCase();
    return t.includes("send") || a.includes("send");
  }) as HTMLButtonElement | null;
  return btn;
}

function interceptSend() {
  const editable = findEditable();
  const sendBtn = findSendButton();

  if (!editable || !sendBtn) {
    console.warn(
      "[AXON] Could not find input editor or send button yet. Retrying..."
    );
    setTimeout(interceptSend, 1500);
    return;
  }

  let lastUserText = "";
  let lastSent = "";
  let lastSentAt = 0;

  const flushIfNeeded = () => {
    const text = lastUserText.trim();
    const now = Date.now();
    if (text.length === 0) return;
    // de-dup within 2s if same text
    if (text === lastSent && now - lastSentAt < 2000) return;

    lastSent = text;
    lastSentAt = now;
    console.log("[AXON] Sending to daemon:", {
      type: "user_msg",
      session_id: sessionId,
      text,
    });
    sendToDaemon("user_msg", text);
  };

  // Track content as user types
  editable.addEventListener("input", () => {
    const txt = (editable as HTMLElement).textContent || "";
    lastUserText = txt;
  });

  // Enter submit
  editable.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Enter" && !ke.shiftKey) {
      // Give React/ProseMirror a moment to commit changes
      setTimeout(flushIfNeeded, 10);
    }
  });

  // Click submit
  sendBtn.addEventListener("click", () => setTimeout(flushIfNeeded, 10));

  console.log("[AXON] interceptSend wired");
}

function observeAssistant() {
  const sentIds = new Set<string>();

  const capture = (root: HTMLElement) => {
    // Look for assistant message blocks
    const nodes = root.querySelectorAll<HTMLElement>(
      '[data-message-author-role="assistant"], [data-testid="conversation-turn-assistant"], article'
    );
    nodes.forEach((n) => {
      // Try to derive a stable id to avoid duplicates
      const id =
        n.getAttribute("data-message-id") ||
        n.id ||
        `${n.tagName}-${n.innerText.slice(0, 40)}`;
      if (sentIds.has(id)) return;

      const text = n.innerText?.trim();
      if (!text || text.length < 10) return;

      sentIds.add(id);
      sendToDaemon("assistant_msg", text);
    });
  };

  const mo = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        capture(node);
      });
    });
  });

  const main = document.querySelector("main") || document.body;
  capture(main as HTMLElement);
  mo.observe(main, { childList: true, subtree: true });
  console.log("[AXON] observing ChatGPT output");
}

// INIT
initWebSocket();
setTimeout(interceptSend, 1500);
setTimeout(observeAssistant, 2500);
