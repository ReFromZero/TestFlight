//* state
const state = { activeTrack: 0, initPlay: false, repeat: false, shuffle: false };

//* selectors
const audio = new Audio();

const ui = {
  // sliders
  seekBar: document.querySelector(".seek-slider input"),
  volumeBar: document.querySelector(".volume-slider input"),

  // buttons
  showPlayListBtn: document.querySelector(".show"),
  hidePlayListBtn: document.querySelector(".hide"),
  prevBtn: document.querySelector(".prev"),
  nextBtn: document.querySelector(".next"),
  playPauseBtn: document.querySelector(".play-pause"),
  repeatBtn: document.querySelector(".repeat"),
  shuffleBtn: document.querySelector(".shuffle"),

  // text and image
  playList: document.querySelector(".playlist"),
  playListContent: document.querySelector(".playlist-content"),
  artwork: document.querySelector(".artwork"),
  trackName: document.querySelector(".name"),
  artist: document.querySelector(".artist"),
  currentTime: document.querySelector(".current-time"),
  duration: document.querySelector(".duration"),
};

//* event listeners
const setupEventListeners = () => {
  document.addEventListener("DOMContentLoaded", loadTrack);

  // player events
  ui.playPauseBtn.addEventListener("click", playPauseTrack);
  ui.seekBar.addEventListener("input", updateSeek);
  ui.volumeBar.addEventListener("input", updateVolume);
  ui.nextBtn.addEventListener("click", nextTrack);
  ui.prevBtn.addEventListener("click", prevTrack);
  ui.showPlayListBtn.addEventListener("click", showPlayList);
  ui.hidePlayListBtn.addEventListener("click", hidePlayList);
  ui.repeatBtn.addEventListener("click", toggleRepeat);
  ui.shuffleBtn.addEventListener("click", toggleShuffle);

  // audio events
  audio.addEventListener("ended", () => {
    if (state.repeat) {
      loadTrack();  // リピートがオンなら再生を繰り返す
    } else {
      nextTrack();
    }
  });
  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("loadedmetadata", updateTrackInfo);
  audio.addEventListener("durationchange", updateDuration);
  audio.addEventListener("play", updateTrackState);
  audio.addEventListener("pause", updateTrackState);
};

//* event handlers
const updateVolume = () => {
  audio.volume = ui.volumeBar.value / 100;
  audio.muted = audio.volume === 0;
};

const updateSeek = () => {
  audio.currentTime = (ui.seekBar.value / 100) * audio.duration;
};

const updateTime = () => {
  ui.seekBar.value = (audio.currentTime / audio.duration) * 100;
  ui.currentTime.textContent = formatTime(audio.currentTime);
};

const updateDuration = () => {
  ui.seekBar.value = 0;
  ui.duration.textContent = formatTime(audio.duration);
};

const updateTrackInfo = () => {
  ui.artwork.src = tracks[state.activeTrack].artwork;
  ui.trackName.textContent = tracks[state.activeTrack].name;
  ui.artist.textContent = tracks[state.activeTrack].artist;
  updateTrackState();
};

const playPauseTrack = () => {
  audio.paused ? audio.play() : audio.pause();
  if (!state.initPlay) state.initPlay = true;
};

const prevTrack = () => {
  state.activeTrack = (state.activeTrack - 1 + tracks.length) % tracks.length;
  loadTrack();
};

const toggleRepeat = () => {
  state.repeat = !state.repeat;
  ui.repeatBtn.classList.toggle("active", state.repeat);
};

const nextTrack = () => {
  if (state.shuffle) {
    state.activeTrack = Math.floor(Math.random() * tracks.length);
  } else {
    state.activeTrack = (state.activeTrack + 1) % tracks.length;
  }
  loadTrack();
};

const toggleShuffle = () => {
  state.shuffle = !state.shuffle;
  ui.shuffleBtn.classList.toggle("active", state.shuffle);
};

const playTrack = (index) => {
  if (state.shuffle) {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    state.activeTrack = randomIndex;
  } else {
    state.activeTrack = index;
  }
  loadTrack();
};

const loadTrack = () => {
  audio.src = tracks[state.activeTrack].path;
  if (state.initPlay) playPauseTrack();
};

const updateTrackState = () => {
  console.log("updateTrackState");
  ui.playPauseBtn.classList.toggle("paused", audio.paused);
  updateActiveItem();
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const showPlayList = () => {
  ui.playList.classList.add("show");
};

const hidePlayList = () => {
  ui.playList.classList.remove("show");
};

const updateActiveItem = () => {
  console.log("updateActiveItem");
  const currentTrackEl = ui.playListContent.querySelector(".active");
  if (currentTrackEl) {
    currentTrackEl.classList.remove("active");
    const button = currentTrackEl.querySelector("button");
    if (button) button.remove();
  }

  const targetTrackEl = ui.playListContent.children[state.activeTrack];
  if (targetTrackEl) {
    const icon = audio.paused ? "bi-play-fill" : "bi-pause-fill";
    targetTrackEl.classList.add("active");
    targetTrackEl.insertAdjacentHTML(
      "beforeend",
      `<button><i class="bi ${icon}"></i></button>`
    );
  }
};

const renderPlayList = () => {
  ui.playListContent.innerHTML = "";

  tracks.forEach((track, index) => {
    const item = document.createElement("div");
    item.classList.add("item");
    item.addEventListener("click", () => playTrack(index));
    item.innerHTML = `
    <img src="${track.artwork}" alt="${track.name}" />
    <div class="item-detail">
      <h4>${track.name}</h4>
      <p>${track.artist}</p>
    </div>`;

    ui.playListContent.appendChild(item);
  });
};

renderPlayList();
setupEventListeners();
