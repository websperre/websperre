"use strict";

const blockedRequestHtml = "blocked-request.html";
const blockedRequestRedirect = browser.runtime.getURL(blockedRequestHtml);

const handleRequest = (details) => {
    console.log("b: ", details.url);
    return { redirectUrl: blockedRequestRedirect };
};

const setupWebRequestListener = (urls) => {
    browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: urls },
        ["blocking"],
    );
};

const d_gs = (gs) => {
    const decoded_gs = [];
    const gs_length = gs.length;
    if (gs_length === 0) {
        return decoded_gs;
    }
    for (let i = 0; i < gs_length; i++) {
        decoded_gs.push(atob(gs[i]));
    }
    return decoded_gs;
};

const init = () => {
    browser.storage.local
        .get("gs")
        .then((result) => {
            const gesperrt_seiten = result.gs || [];
            const d_gesperrt_seiten = d_gs(gesperrt_seiten);
            setupWebRequestListener(d_gesperrt_seiten);
        })
        .catch((err) => {
            console.error("error retrieving seiten. ERROR:", err);
            return;
        });
};

init();
