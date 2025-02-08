"use strict";

const blockedRequestHtml = "blocked-request.html";
const blockedRequestRedirect = browser.runtime.getURL(blockedRequestHtml);

const handleRequest = (details) => {
    // console.log(details.url, details.method);
    return { redirectUrl: blockedRequestRedirect };
};

let dGesperrtSeiten = [];
const updateBlockedUrlsListener = async () => {
    try {
        const getGs = await browser.storage.local.get("gs");
        await new Promise((resolve) => setTimeout(resolve, 25));
        if (getGs.gs === undefined || getGs.gs.length === 0) {
            return;
        }
        dGesperrtSeiten = getGs.gs;
        browser.webRequest.onBeforeRequest.removeListener(handleRequest);
        browser.webRequest.onBeforeRequest.addListener(
            handleRequest,
            { urls: dGesperrtSeiten },
            ["blocking"],
        );
    } catch (err) {
        console.error("error updating blocked url listener. ERROR:", err);
    }
};

const handleStorageChange = (changes, areaName) => {
    if (areaName === "local" && "gs" in changes) {
        updateBlockedUrlsListener();
    }
};
browser.storage.onChanged.addListener(handleStorageChange);

browser.runtime.onInstalled.addListener(updateBlockedUrlsListener);
browser.tabs.onActivated.addListener(updateBlockedUrlsListener);
browser.tabs.onUpdated.addListener(updateBlockedUrlsListener);
