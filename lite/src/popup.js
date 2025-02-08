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
            const gesperrtSeiten = result.gs || [];
            gesperrtSeiten.push(finalUrlInput.value);
            addBtn.innerHTML = "Added";
            addBtn.disabled = true;
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
    });
};

init();
