"use strict";

const currentUrlInput = document.querySelector("#current-url");
const finalUrlInput = document.querySelector("#final-url");
const addBtn = document.querySelector("#add-button");
const regexMatch = document.querySelector("#regex-match");
const exactUrl = document.querySelector("#exact-url");
const customEdit = document.querySelector("#custom-edit");

let currentTabUrl = "";
let urlTypeUrl = "";

const addToList = () => {
    browser.storage.local
        .get("gs")
        .then((result) => {
            const gesperrt_seiten = result.gs || [];
            gesperrt_seiten.push(btoa(finalUrlInput.value));
            return browser.storage.local.set({
                gs: gesperrt_seiten,
            });
        })
        .catch((err) => {
            console.error("error saving data. ERROR:", err);
        });
};
addBtn.addEventListener("click", addToList);

const finalUrlRegexMatch = () => {
    finalUrlInput.value = "*://" + urlTypeUrl.hostname + "/*";
};
regexMatch.addEventListener("click", finalUrlRegexMatch);

const finalUrlExact = () => {
    finalUrlInput.value = currentTabUrl + "*";
};
exactUrl.addEventListener("click", finalUrlExact);

const finalUrlCustom = () => {
    currentUrlInput.style.backgroundColor = "#ff6500";
    currentUrlInput.focus();
    currentUrlInput.addEventListener("keyup", (e) => {
        finalUrlInput.value = currentUrlInput.value;
    });
    setTimeout(
        (e) => (currentUrlInput.style.backgroundColor = "#0b192c"),
        1000,
    );
};
customEdit.addEventListener("click", finalUrlCustom);

const gen_salz = () => {
    const csprng_base = crypto.getRandomValues(new Uint32Array(1));
    const salz = csprng_base[0].toString(32);
    browser.storage.local.set({
        s: salz,
    });
    return salz;
};

const gen_kennwort = async () => {
    const salz = gen_salz();
    const gen_rand_num = (Math.floor(Math.random() * 100000) + 1).toString();
    const final_kennwort = gen_rand_num + salz;

    const hash_buffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(final_kennwort),
    );
    const hash_array = Array.from(new Uint8Array(hash_buffer));
    const hash_kennwort = hash_array
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return hash_kennwort;
};

const check_kennwort = () => {
    browser.storage.local
        .get("k")
        .then(async (result) => {
            const kennwort = result.k;
            if (kennwort !== undefined) {
                return;
            }
            const hashed_kennwort = await gen_kennwort();
            browser.storage.local.set({
                k: hashed_kennwort,
            });
        })
        .catch((err) => {
            console.error(err);
        });
};

const init = () => {
    window.addEventListener("load", () => {
        browser.tabs
            .query({ currentWindow: true, active: true })
            .then((tabs) => {
                currentTabUrl = tabs[0].url;
                currentUrlInput.value = currentTabUrl;
                urlTypeUrl = new URL(currentTabUrl);
                finalUrlInput.value = "*://" + urlTypeUrl.hostname + "/*";
            })
            .catch((err) => {
                console.error("error getting URL. ERROR:", err);
                return;
            });
        check_kennwort();
    });
};

init();
