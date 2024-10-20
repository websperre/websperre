"use strict";

const blockedRequestHtml = "blocked-request.html";
const blockedRequestRedirect = browser.runtime.getURL(blockedRequestHtml);

const setupWebRequestListener = (urls) => {
  browser.webRequest.onBeforeRequest.addListener(
    handleRequest,
    { urls: urls },
    ["blocking"],
  );
};

const handleRequest = () => {
  return { redirectUrl: blockedRequestRedirect };
};

const init = () => {
  browser.storage.local
    .get("gesperrt_seiten")
    .then((result) => {
      const gesperrt_seiten = result.gesperrt_seiten || [];
      setupWebRequestListener(gesperrt_seiten);
    })
    .catch((err) => {
      console.error("error retrieving URLs. ERROR:", err);
    });
};

init();
