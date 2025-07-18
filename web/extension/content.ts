const WS_URL = "ws://localhost:7381/ws";
const sessionId = `sess_${new Date().toISOString().replace(/[:.]/g, "-")}`;
let socket: WebSocket | null = null;

function initWebSocket() {
  socket = new WebSocket(WS_URL);
  socket.onopen = () => console.log("[AXON] connected");
  socket.onerror = (e) => console.error("[AXON] WS error", e);
  socket.onclose = () => console.warn("[AXON] WS closed");
}

function sendToDaemon(type: string, text: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type, session_id: sessionId, text }));
}

// function interceptInput() {
//   const textarea = document.querySelector("textarea");
//   if (!textarea) return;
//
//   textarea.addEventListener("keydown", (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       const text = (e.target as HTMLTextAreaElement).value.trim();
//       if (text.length > 0) sendToDaemon("user_msg", text);
//     }
//   });
// }

function interceptSendButton() {
  const textarea = document.querySelector("textarea");
  const sendBtn = document.querySelector('button[data-testid="send-button"]');

  if (!textarea || !sendBtn) {
    console.warn("[AXON] Could not find textarea or send button.");
    return;
  }

  sendBtn.addEventListener("click", () => {
    const text = (textarea as HTMLTextAreaElement).value.trim();
    if (text.length > 0) {
      console.log("[AXON] Sending user_msg:", text);
      sendToDaemon("user_msg", text);
    }
  });
}

function observeAssistant() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.innerText &&
          node.innerText.length > 0 &&
          node.querySelector("svg") === null && // crude check: no button/like content
          node.innerText.length > 10
        ) {
          sendToDaemon("assistant_msg", node.innerText.trim());
        }
      });
    }
  });

  const target = document.querySelector("main");
  if (target) {
    observer.observe(target, { childList: true, subtree: true });
    console.log("[AXON] observing ChatGPT output");
  }
}

// INIT
initWebSocket();
// setTimeout(interceptInput, 2000); // give DOM time to load
setTimeout(interceptSendButton, 2000);
setTimeout(observeAssistant, 3000);
