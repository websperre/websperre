"use strict";

const blockedRequestHtml = "blocked-request.html";
const blockedRequestRedirect = chrome.runtime.getURL(blockedRequestHtml);

const dGs = (gs) => {
    const decodedGs = [];
    const gsLength = gs.length;
    if (gsLength === 0) {
        return decodedGs;
    }
    for (let i = 0; i < gsLength; i++) {
        decodedGs.push(atob(gs[i]));
    }
    return decodedGs;
};

let dGesperrtSeiten = [];
const updateBlockedUrlsListener = async () => {
    try {
        const currRulesLength = (await chrome.declarativeNetRequest.getDynamicRules()).length;
        const removeRuleIds = Array.from({length: currRulesLength}, (_, i) => i+1);

        const getGs = await chrome.storage.local.get("gs");
        if ((getGs.gs === undefined || getGs.gs.length === 0) && currRulesLength !== 0) {
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: removeRuleIds,
            });
            return;
        }
        dGesperrtSeiten = dGs(getGs.gs);

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: removeRuleIds,
        });

        const rules = dGesperrtSeiten.map((site, index) => ({
            id: index+1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: {
                    url: blockedRequestRedirect
                }
            },
            condition: {
                urlFilter: site,
                resourceTypes: ["main_frame"]
            }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules
        });
    } catch (err) {
        console.error("error updating blocked url listener. ERROR:", err);
    }
};

const handleStorageChange = (changes, areaName) => {
    if (areaName === "local" && "gs" in changes) {
        updateBlockedUrlsListener();
    }
};
chrome.storage.onChanged.addListener(handleStorageChange);

chrome.tabs.onActivated.addListener(updateBlockedUrlsListener);
chrome.tabs.onUpdated.addListener(updateBlockedUrlsListener);
chrome.runtime.onInstalled.addListener(updateBlockedUrlsListener);
