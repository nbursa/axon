const WS_URL = "wss://localhost:7381/ws";
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

function interceptSend() {
  const editable = document.querySelector(
    "div.ProseMirror[contenteditable='true']"
  );

  const sendBtn = document.querySelector('button[data-testid="send-button"]');

  if (!editable || !sendBtn) {
    console.warn("[AXON] Could not find input or send button.");
    return;
  }

  editable.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Enter" && !ke.shiftKey) {
      setTimeout(() => {
        if (lastUserText.length > 0) {
          console.log("[AXON] Enter submit captured:", lastUserText);
          console.log("[AXON] Sending to daemon:", {
            type: "user_msg",
            session_id: sessionId,
            text: lastUserText,
          });

          sendToDaemon("user_msg", lastUserText);
        }
      }, 10);
    }
  });

  let lastUserText = "";

  editable.addEventListener("input", () => {
    lastUserText = editable.textContent?.trim() || "";
  });

  sendBtn.addEventListener("click", () => {
    setTimeout(() => {
      if (lastUserText.length > 0) {
        console.log("[AXON] Captured user input:", lastUserText);
        console.log("[AXON] Sending to daemon:", {
          type: "user_msg",
          session_id: sessionId,
          text: lastUserText,
        });

        sendToDaemon("user_msg", lastUserText);
      }
    }, 10); // allow time for React update
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
setTimeout(interceptSend, 2000);
setTimeout(observeAssistant, 3000);
