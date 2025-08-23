import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("Axon Companion installed.");
});

browser.runtime.onStartup.addListener(() => {
  console.log("Axon Companion started.");
});

browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: any) => void) => {
    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      typeof (message as any).type === "string"
    ) {
      if ((message as any).type === "ping") {
        sendResponse({ type: "pong" });
      }
    }
    return true;
  }
);
