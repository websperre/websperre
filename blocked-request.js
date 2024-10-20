"use strict";

const listBlockedBtn = document.querySelector("#list-blocked");
const closeTabBtn = document.querySelector("#close-tab");
const passwordInfo = document.querySelector("#password-info");
const guessInput = document.querySelector("#guess-input");
const guessPw = document.querySelector("#guess-password");
const guessBtn = document.querySelector("#guess-btn");
const fillBlockedUrls = document.querySelector("#fill-blocked-urls");

const closeTab = () => window.close();
closeTabBtn.addEventListener("click", closeTab);

const unhidePwInfo = () => {
    if (passwordInfo.hidden === true || guessInput.hidden === true) {
        listBlockedBtn.hidden = true;
        passwordInfo.hidden = false;
        guessInput.hidden = false;
        guessPw.focus();
    }
};
listBlockedBtn.addEventListener("click", unhidePwInfo);

const revealBlockedList = () => {
    console.log("reveal func");
};
guessBtn.addEventListener("click", revealBlockedList);
