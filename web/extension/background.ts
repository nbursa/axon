import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("Axon Companion installed.");
});

browser.runtime.onStartup.addListener(() => {
  console.log("Axon Companion started.");
});

browser.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender,
    sendResponse: (response: any) => void
  ) => {
    if (message.type === "ping") {
      sendResponse({ type: "pong" });
    }
    return true;
  }
);
