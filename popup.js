"use strict";

const currentUrlInput = document.querySelector("#current-url");
const finalUrlInput = document.querySelector("#final-url");
const addBtn = document.querySelector("#add-button");
const regexMatch = document.querySelector("#regex-match");
const exactUrl = document.querySelector("#exact-url");
const customEdit = document.querySelector("#custom-edit");

let currentTabUrl = "";
let urlTypeUrl = "";

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
    });
});

const addToList = () => {
  browser.storage.local
    .get("gesperrt_seiten")
    .then((result) => {
      const gs = result.gesperrt_seiten || [];
      gs.push(finalUrlInput.value);
      return browser.storage.local.set({ gesperrt_seiten: gs });
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
  setTimeout((e) => (currentUrlInput.style.backgroundColor = "#0b192c"), 1000);
};
customEdit.addEventListener("click", finalUrlCustom);
