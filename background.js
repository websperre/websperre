"use strict";

const blockedRequestHtml = "blocked-request.html";
const blockedRequestRedirect = browser.runtime.getURL(blockedRequestHtml);

const handleRequest = (details) => {
    return { redirectUrl: blockedRequestRedirect };
};

const setupWebRequestListener = async (dUrls) => {
    await browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: dUrls },
        ["blocking"],
    );
};

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

const init = async () => {
    await browser.storage.local
        .get("gs")
        .then(async (result) => {
            const gesperrtSeiten = (await result.gs) || [];
            const dGesperrtSeiten = dGs(gesperrtSeiten);
            await setupWebRequestListener(dGesperrtSeiten);
        })
        .catch((err) => {
            console.error("error retrieving seiten. ERROR:", err);
            return;
        });
};

init();

// it's not blocking when there are a lot of entries. could be issue because I'm just debugging the extension or issue with something else entirely
