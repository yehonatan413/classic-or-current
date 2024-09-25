"use strict";

const main = document.querySelector("main");
const audioPlayer = document.querySelector("audio");
const logo = document.querySelector(".logo");
const desc = document.querySelector(".desc");
const btnStart = document.querySelector(".btn-start");
const score = document.querySelector(".score");
const albumCover = document.querySelector(".album-cover");
const btnAudio = document.querySelector(".btn-audio");
const btnClassic = document.querySelector(".btn-classic");
const btnCurrent = document.querySelector(".btn-current");
const answersContainer = document.querySelector(".answers-container");
const albumCoverOverlay = document.querySelector(".album-cover-overlay");
const albumCoverContainer = document.querySelector(".album-cover-container");
const round = document.querySelector(".round");
const albumCoverTextMobile = document.querySelector(".album-cover-text-mobile");
const resultListContainer = document.querySelector(".resultList-container");
const btnPlayAgain = document.querySelector(".btn-play-again");

let songList;
let songsArr;
let loadedSong;
let isLoadedSongCurrent; //is the song from modern times

const startScreenElements = [logo, desc, btnStart];

const mainScreenElements = [
    audioPlayer,
    round,
    score,
    albumCover,
    btnAudio,
    answersContainer,
    btnClassic,
    btnCurrent,
    albumCoverOverlay,
    albumCoverContainer,
    albumCoverTextMobile,
];

const endScreenElements = [
    // resultsHeading,
    resultListContainer,
    btnPlayAgain,
    score,
];

btnStart.addEventListener("click", function () {
    startScreenElements.forEach((element) => element.classList.add("hidden"));
    mainScreenElements.forEach((element) => element.classList.remove("hidden"));
    songsArr = [];
    score.textContent = "0";
    loadRandomSong();
});

btnClassic.addEventListener("click", function () {
    if (!isLoadedSongCurrent) {
        updateScore(100);
    } else animateCSS("main", "headShake");
    loadRandomSong();
});

btnCurrent.addEventListener("click", function () {
    if (isLoadedSongCurrent) {
        updateScore(100);
    } else animateCSS("main", "headShake");
    loadRandomSong();
});

albumCoverOverlay.addEventListener("click", function () {
    albumCover.src = loadedSong["Album Image URL"];
    albumCoverOverlay.classList.add("hidden");
    albumCoverTextMobile.classList.add("hidden");
    updateScore(-50);
});

btnAudio.addEventListener("click", function () {
    if (audioPlayer.paused) {
        audioPlayer.play();
        btnAudio.src = "img/pause.png";
    } else {
        audioPlayer.pause();
        btnAudio.src = "img/play.png";
    }
});

btnPlayAgain.addEventListener("click", function () {
    endScreenElements.forEach((element) => element.classList.add("hidden"));
    startScreenElements.forEach((element) =>
        element.classList.remove("hidden")
    );
});

albumCoverOverlay.addEventListener("mouseover", function () {
    albumCoverOverlay.style.opacity = "1";
});

albumCoverOverlay.addEventListener("mouseout", function () {
    albumCoverOverlay.style.opacity = "0";
});

function updateScore(amount) {
    score.textContent = parseInt(score.textContent) + amount;

    const scorePopupLeftover = document.getElementById("scorePopup");
    scorePopupLeftover?.remove();

    const scorePopup = document.createElement("span");
    scorePopup.id = "scorePopup";
    scorePopup.innerHTML = amount.toString();
    score.after(scorePopup);

    scorePopup.style.position = "absolute";
    scorePopup.style.top = "0";
    scorePopup.style.transition = "opacity 0.2s";

    if (amount > 0) {
        scorePopup.style.color = "green";
        scorePopup.textContent = `+${scorePopup.textContent}`;
    } else {
        scorePopup.style.color = "red";
        animateCSS(".score", "headShake");
    }

    setTimeout(function () {
        scorePopup.style.opacity = 0;
    }, 1000);

    scorePopup.ontransitionend = function () {
        scorePopup.remove();
    };
}
async function fetchSongList() {
    const response = await fetch("./MusicDB.json");
    const jsonList = await response.json();
    return jsonList;
}

fetchSongList().then((jsonList) => {
    songList = jsonList;
});

function loadRandomSong() {
    round.textContent = parseInt(round.textContent[0]) + 1 + "/10";
    if (round.textContent === "10/10") {
        endGame();
        return;
    }
    albumCoverOverlay.classList.remove("hidden");
    albumCoverTextMobile.classList.remove("hidden");

    isLoadedSongCurrent = Math.round(Math.random()); //randomly pick whether song is classic or current
    let r = Math.floor(Math.random() * songList[isLoadedSongCurrent].length);

    loadedSong = songList[isLoadedSongCurrent][r];
    songsArr.push(loadedSong);

    songList[isLoadedSongCurrent].splice(r, 1); //remove song from being picked again

    let vol = 0;
    audioPlayer.volume = vol;
    const fadeIn = setInterval(function () {
        // Reduce volume by 0.05 as long as it is above 0
        // This works as long as you start with a multiple of 0.05!
        if (vol < 0.5) {
            vol += 0.075;
            audioPlayer.volume = vol;
        } else {
            // Stop the setInterval when 0 is reached
            clearInterval(fadeIn);
        }
    }, 100);

    albumCover.src = "img/album-cover-unknown.png";
    audioPlayer.src = loadedSong["Track Preview URL"];
    audioPlayer.play();
    btnAudio.src = "img/pause.png";
    preloadImage(loadedSong["Album Image URL"]);
}

function preloadImage(url) {
    let img = new Image();
    img.src = url;
}

const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, {
            once: true,
        });
    });

function endGame() {
    mainScreenElements.forEach((element) => element.classList.add("hidden"));
    endScreenElements.forEach((element) => element.classList.remove("hidden"));

    audioPlayer.pause();

    let mq = window.matchMedia("(max-width: 768px)");
    let maxChar;
    mq.matches ? (maxChar = 12) : (maxChar = 25);

    let markup = "";
    songsArr.forEach(
        (song) =>
            (markup += `<div class="resultList-item"${
                song["isCurrent"] === 0
                    ? 'style="background-color: rgb(255, 204, 102)"'
                    : 'style="background-color: rgb(153, 204, 204)"'
            }>
    <img class="resultList-album-cover" src="${
        song["Album Image URL"]
    }" alt="cover" />
    <div class="resultList-info-container">
        <span class="resultList-info song">${song["Track Name"]}</span>
        <span class="resultList-info artist">${song["Artist Name(s)"]}</span>
    </div>
    <span class="album">${truncate(song["Album Name"], maxChar)} (${song[
                "Album Release Date"
            ]
                .toString()
                .slice(0, 4)})</span>
</div>`)
    );
    resultListContainer.innerHTML = markup;
}

function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
}
