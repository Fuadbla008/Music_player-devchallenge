const musicPlayer = document.querySelector(".music-player");
const playPauseBtn = document.querySelector(".play-pause-button");
const prevBtn = document.querySelector(".prev-button");
const nextBtn = document.querySelector(".next-button");
const shuffleBtn = document.querySelector(".shuffle-button");
const repeatBtn = document.querySelector(".repeat-button");
const audio = document.querySelector(".audio");
const progressContainer = document.querySelector(".progress-container");
const progress = document.querySelector(".progress");
const albumCover = document.querySelector(".album-cover");
const trackTitle = document.querySelector(".track-title");
const artistName = document.querySelector(".artist-name");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const volumeSlider = document.querySelector(".volume-slider");

// Songs data
const songs = [
  {
    title: "Lost in the City Lights",
    artist: "Cosmo Sheldrake",
    audioSrc: "./resources/lost-in-city-lights-145038.mp3",
    coverSrc: "https://picsum.photos/seed/1/200",
  },
  {
    title: "Forest Lullaby",
    artist: "Lesfm",
    audioSrc: "./resources/forest-lullaby-110624.mp3",
    coverSrc: "https://picsum.photos/seed/2/200",
  },
];

let songIndex = 0;
let isShuffle = false;
let repeatMode = "none"; // none, one, all

// Load song details
function loadSong(song) {
  trackTitle.textContent = song.title;
  artistName.textContent = song.artist;
  audio.src = song.audioSrc;
  albumCover.src = song.coverSrc;
}

// Play song
function playSong() {
  musicPlayer.classList.add("playing");
  playPauseBtn.querySelector("i.fas").classList.remove("fa-play");
  playPauseBtn.querySelector("i.fas").classList.add("fa-pause");
  audio.play();
}

// Pause song
function pauseSong() {
  musicPlayer.classList.remove("playing");
  playPauseBtn.querySelector("i.fas").classList.add("fa-play");
  playPauseBtn.querySelector("i.fas").classList.remove("fa-pause");
  audio.pause();
}

// Previous song
function prevSong() {
  songIndex--;
  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }
  loadSong(songs[songIndex]);
  playSong();
}

// Next song
function nextSong() {
  if (isShuffle) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === songIndex);
    songIndex = newIndex;
  } else {
    songIndex++;
    if (songIndex > songs.length - 1) {
      songIndex = 0;
    }
  }
  loadSong(songs[songIndex]);
  playSong();
}

// Song ended logic
function onSongEnd() {
    if (repeatMode === 'one') {
        audio.currentTime = 0;
        playSong();
    } else if (repeatMode === 'all') {
        nextSong();
    } else { // 'none'
        if (isShuffle) {
            nextSong();
        } else {
            if (songIndex < songs.length - 1) {
                nextSong();
            } else {
                // Stop playing if it's the last song and no repeat/shuffle
                pauseSong();
                audio.currentTime = 0;
            }
        }
    }
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  // Update time display
  durationEl.textContent = formatTime(duration);
  currentTimeEl.textContent = formatTime(currentTime);
}

// Format time to 0:00
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}


// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Set volume
function setVolume(e) {
    audio.volume = e.target.value;
}

// Toggle Shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
}

// Toggle Repeat
function toggleRepeat() {
    if (repeatMode === 'none') {
        repeatMode = 'all';
        repeatBtn.classList.add('active');
    } else if (repeatMode === 'all') {
        repeatMode = 'one';
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position: absolute; font-size: 10px; font-weight: bold; top: 12px; left: 16px;">1</span>';
    } else { // 'one'
        repeatMode = 'none';
        repeatBtn.classList.remove('active');
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }
}

// Event listeners
playPauseBtn.addEventListener("click", () => {
  const isPlaying = musicPlayer.classList.contains("playing");
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
shuffleBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", toggleRepeat);

audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", onSongEnd);

progressContainer.addEventListener("click", setProgress);

volumeSlider.addEventListener('input', setVolume);

// Initial load
loadSong(songs[songIndex]);
audio.volume = volumeSlider.value;
