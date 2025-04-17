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
closeTabBtn?.addEventListener("click", closeTab);

const unhidePwInfo = () => {
    if (passwordInfo.hidden === true || guessInput.hidden === true) {
        listBlockedBtn.hidden = true;
        passwordInfo.hidden = false;
        guessInput.hidden = false;
        guessPw.focus();
    }
};
listBlockedBtn?.addEventListener("click", unhidePwInfo);

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
    await chrome.storage.local.get("s").then((result) => {
        savedSalz = result.s;
    });
};
retrieveSalz();

const dGsFill = (gs) => {
    fillBlockedUrls.innerHTML = "";
    const decodedGs = [];
    const gsLength = gs.length;
    if (gsLength === 0) {
        fillBlockedUrls.textContent = "Nothing to show. Block list is empty";
        return decodedGs;
    }
    for (let i = 0; i < gsLength; i++) {
        decodedGs.push(atob(gs[i]));

        const blockedURL = document.createElement("div");
        blockedURL.textContent = decodedGs[i];

        const removeButton       = document.createElement("button");
        removeButton.id          = `removeEntry-${i}`;
        removeButton.className   = "remove-entry";
        removeButton.title       = `Remove '${decodedGs[i]}' from block list`;
        removeButton.textContent = "Remove";

        fillBlockedUrls.appendChild(blockedURL);
        fillBlockedUrls.appendChild(removeButton);
    }
    return decodedGs;
};

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
    const savedKennwort = await chrome.storage.local
        .get("k")
        .then((result) => {
            return result.k[triesSoFar];
        });

    if (hashedKennwort === savedKennwort) {
        fillBlockedUrls.innerHTML = "";
        chrome.storage.local
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
guessBtn?.addEventListener("click", revealBlockedList);

// [timeout, info_update]
const triesToTimeout = {
    0: [1*60*1000, "1-100.000"],
    1: [2*60*1000, "1-10.000"],
    2: [3*60*1000, "1-1.000"],
    3: [4*60*1000, "1-100"],
    4: [5*60*1000, "1-10"],
};

// // for testing purposes
// const triesToTimeout = {
//     0: [1*1000, "1-100.000"],
//     1: [1*10*1000, "1-10.000"],
//     2: [2*10*1000, "1-1.000"],
//     3: [3*10*1000, "1-100"],
//     4: [4*10*1000, "1-10"],
// };

let timerOn        = false;
let timeoutCounter = 0;
let oneSecTimeout;
let timeout;

const timedCount = () => {
    timeoutCounter += 1000;
    if (timeoutCounter > timeout)
        stopCount();
    else
        oneSecTimeout = setTimeout(timedCount, 1*1000);
};

const startCount = () => {
    if (!timerOn) {
        timerOn = true;
        timedCount();
    }
};

const stopCount = () => {
    clearTimeout(oneSecTimeout);
    timerOn = false;
    if (timeoutCounter > timeout) {
        easierBtn.disabled = false;
        guessBtn.disabled = false;
        guessPw.disabled = false;
        guessPw.value = "";
        guessPw.placeholder = "password";
        guessPw.focus();
        timeoutCounter = 0;
        timeout = 0;
    }
}

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

    timeout = triesToTimeout[newTriesCount][0];
    startCount();

    window.addEventListener("blur", stopCount);
    window.addEventListener("focus", startCount);
};
easierBtn?.addEventListener("click", makingItEasier);

const removeEntry = async (event) => {
    if (event.target.classList.contains("remove-entry")) {
        const removeId = event.target.id.split("-")[1];

        let gsResult = await chrome.storage.local.get("gs");
        let editGs = gsResult.gs;
        editGs.splice(removeId, 1);

        await chrome.storage.local.set({
            gs: editGs,
        });
        gsResult = await chrome.storage.local.get("gs");
        dGsFill(gsResult.gs);

        const removeButtons = document.querySelectorAll(".remove-entry");
        removeButtons.forEach((removeButton) => (removeButton.disabled = true));
        setTimeout(() => {
            hidePwInfo();
        }, 3000);
    }
};
fillBlockedUrls?.addEventListener("click", removeEntry);
