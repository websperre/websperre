"use strict";

const listBlockedBtn = document.querySelector("#list-blocked");
const closeTabBtn = document.querySelector("#close-tab");
const passwordInfo = document.querySelector("#password-info");
const numRange = document.querySelector("#num-range");
const guessInput = document.querySelector("#guess-input");
const triesCount = document.querySelector("#tries-count");
const guessPw = document.querySelector("#guess-password");
const guessBtn = document.querySelector("#guess-btn");
const easierBtn = document.querySelector("#easier");
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

const hidePwInfo = () => {
    if (passwordInfo.hidden === false || guessInput.hidden === false) {
        listBlockedBtn.hidden = false;
        guessBtn.disabled = false;
        easierBtn.disabled = false;
        guessPw.disabled = false;
        guessPw.value = "";
        passwordInfo.hidden = true;
        guessInput.hidden = true;
        fillBlockedUrls.innerHTML = "";
        listBlockedBtn.focus();
    }
};

let savedSalz = "";
const retrieveSalz = async () => {
    await browser.storage.local.get("s").then((result) => {
        savedSalz = result.s;
    });
};
retrieveSalz();

const dGsFill = (gs) => {
    fillBlockedUrls.innerHTML = "";
    const decodedGs = [];
    const gsLength = gs.length;
    if (gsLength === 0) {
        fillBlockedUrls.innerHTML = "Nothing to show. Block list is empty";
        return decodedGs;
    }
    for (let i = 0; i < gsLength; i++) {
        decodedGs.push(atob(gs[i]));
        fillBlockedUrls.innerHTML += `<div>${decodedGs[i]}</div> <button id="removeEntry-${i}" class="remove-entry" title="Remove '${decodedGs[i]}' from block list">Remove</button>`;
    }
    return decodedGs;
};

// [timeout, info_update]
const triesToTimeout = {
    0: [60000, "1-100.000"],
    1: [120000, "1-10.000"],
    2: [180000, "1-1.000"],
    3: [240000, "1-100"],
    4: [300000, "1-10"],
};

// // for testing purposes
// const triesToTimeout = {
//     0: [600, "1-100.000"],
//     1: [1200, "1-10.000"],
//     2: [1800, "1-1.000"],
//     3: [2400, "1-100"],
//     4: [3000, "1-10"],
// };

const revealBlockedList = async () => {
    const userInputKennwort = guessPw.value;
    if (userInputKennwort === "") {
        guessPw.style.backgroundColor = "#ff6500";
        setTimeout(() => (guessPw.style.backgroundColor = "#0b192c"), 1000);
        guessPw.focus();
        return;
    }

    if (savedSalz === undefined) {
        console.error("you should not be at this page yet.. or you know what you deleted");
        alert("you should not be at this page yet or you know what you deleted: the salt");
        return;
    }

    const finalKennwort = userInputKennwort + savedSalz;
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(finalKennwort),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKennwort = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    const triesSoFar = Number(triesCount.innerHTML);
    const savedKennwort = await browser.storage.local
        .get("k")
        .then((result) => {
            return result.k[triesSoFar];
        });

    if (hashedKennwort === savedKennwort) {
        fillBlockedUrls.innerHTML = "";
        browser.storage.local
            .get("gs")
            .then((result) => {
                const gesperrtSeiten = result.gs || [];
                dGsFill(gesperrtSeiten);
            })
            .catch((err) => {
                console.error("you're not supposed to be here yet.. ERROR:", err);
            });
        guessBtn.disabled = true;
        easierBtn.disabled = true;
        guessPw.disabled = true;
        return;
    }
    guessBtn.disabled = true;
    setTimeout(() => {
        guessBtn.disabled = false;
        guessPw.value = "";
        guessPw.focus();
    }, 3000);
    easierBtn.hidden = false;
};
guessBtn.addEventListener("click", revealBlockedList);

const makingItEasier = () => {
    fillBlockedUrls.innerHTML = "";
    const triesSoFar = Number(triesCount.innerHTML);
    let newTriesCount = triesSoFar + 1;
    triesCount.innerText = newTriesCount;

    try {
        numRange.innerText = triesToTimeout[newTriesCount][1];
    } catch (err) {
        console.error("ERROR:", err);
        alert("you are at rock bottom. cannot go lower than this");
        newTriesCount = newTriesCount - 1;
        triesCount.innerText = newTriesCount;
        easierBtn.disabled = true;
        return;
    }
    numRange.style.backgroundColor = "#ff6500";
    setTimeout(() => (numRange.style.backgroundColor = "#0b192c"), 1000);

    easierBtn.disabled = true;
    guessBtn.disabled = true;
    guessPw.disabled = true;
    guessPw.value = "";
    guessPw.placeholder = `disabled for ${triesToTimeout[newTriesCount][0] / 60000} mins`;
    setTimeout(() => {
        easierBtn.disabled = false;
        guessBtn.disabled = false;
        guessPw.disabled = false;
        guessPw.value = "";
        guessPw.placeholder = "password";
        guessPw.focus();
    }, triesToTimeout[newTriesCount][0]);
};
easierBtn.addEventListener("click", makingItEasier);

const removeEntry = async (event) => {
    if (event.target.classList.contains("remove-entry")) {
        const removeId = event.target.id.split("-")[1];

        let gsResult = await browser.storage.local.get("gs");
        let editGs = gsResult.gs;
        editGs.splice(removeId, 1);

        await browser.storage.local.set({
            gs: editGs,
        });
        gsResult = await browser.storage.local.get("gs");
        dGsFill(gsResult.gs);

        const removeButtons = document.querySelectorAll(".remove-entry");
        removeButtons.forEach((removeButton) => (removeButton.disabled = true));
        setTimeout(() => {
            hidePwInfo();
        }, 3000);
    }
};
fillBlockedUrls.addEventListener("click", removeEntry);
