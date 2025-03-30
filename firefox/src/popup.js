"use strict";

const currentUrlInput = document.querySelector("#current-url");
const finalUrlInput = document.querySelector("#final-url");
const addBtn = document.querySelector("#add-button");
const regexMatch = document.querySelector("#regex-match");
const exactUrl = document.querySelector("#exact-url");
const customEdit = document.querySelector("#custom-edit");

let currentTabUrl = "";
let urlTypeUrl = "";

const shuffleFisherYates = (gs) => {
    if (gs.length <= 2)
        return gs;
    let m = gs.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = gs[m];
        gs[m] = gs[i];
        gs[i] = t;
    }
    return gs;
}

const addToList = () => {
    const finalValue = finalUrlInput.value;
    if (finalValue === "") return;
    browser.storage.local
        .get("gs")
        .then((result) => {
            let gesperrtSeiten = result.gs || [];
            gesperrtSeiten.push(btoa(finalValue));
            addBtn.innerHTML = "Added";
            addBtn.disabled = true;
            gesperrtSeiten = shuffleFisherYates(gesperrtSeiten);
            return browser.storage.local.set({
                gs: gesperrtSeiten,
            });
        })
        .catch((err) => {
            console.error("error saving data. ERROR:", err);
        });

    setTimeout(() => {
        window.close();
    }, 1000);
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
    currentUrlInput.addEventListener("keyup", () => {
        finalUrlInput.value = currentUrlInput.value;
    });
    setTimeout(() => (currentUrlInput.style.backgroundColor = "#0b192c"), 1000);
};
customEdit.addEventListener("click", finalUrlCustom);

let salz = "";
const genSalz = () => {
    if (salz !== "")
        return;
    const csprngBase = crypto.getRandomValues(new Uint32Array(1));
    salz = csprngBase[0].toString(32);
    browser.storage.local.set({
        s: salz,
    });
};

const genKennwort = async (num) => {
    genSalz();

    const genRandNum = (Math.floor(Math.random() * num) + 1).toString();
    // const genRandNum = "123"; // ONLY FOR TESTING
    // console.log(genRandNum); // ONLY FOR TESTING

    const finalKennwort = genRandNum + salz;
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(finalKennwort),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKennwort = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return hashedKennwort;
};

const checkKennwort = () => {
    browser.storage.local
        .get("k")
        .then(async (result) => {
            const kennwort = result.k;
            if (kennwort !== undefined) {
                return;
            }
            let genK = [await genKennwort(100000), await genKennwort(10000), await genKennwort(1000), await genKennwort(100), await genKennwort(10)];
            browser.storage.local.set({
                k: genK,
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
        checkKennwort();
    });
};

init();
