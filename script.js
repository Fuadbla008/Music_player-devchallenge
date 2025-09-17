const musicPlayer = document.querySelector(".music-player");
const playPauseBtn = document.querySelector(".play-pause-button");
const prevBtn = document.querySelector(".prev-button");
const nextBtn = document.querySelector(".next-button");
const shuffleBtn = document.querySelector(".shuffle-button");
const repeatBtn = document.querySelector(".repeat-button");
const audio = document.querySelector(".audio");
const progressContainer = document.querySelector(".progress-container");
const progress = document.querySelector(".progress");
const progressHandle = document.querySelector(".progress-handle");
const albumCover = document.querySelector(".album-cover");
const trackTitle = document.querySelector(".track-title");
const artistName = document.querySelector(".artist-name");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const volumeSlider = document.querySelector(".volume-slider");

// Queue panel elements (HTML uses queue-panel / queue-items)
const menuButton = document.querySelector('.menu-button');
const queuePanel = document.querySelector('.queue-panel');
const closeQueue = document.querySelector('.close-queue');
const queueItemsEl = document.querySelector('.queue-items');

// Songs data
const songs = [
  {
    title: "Lost in the City Lights",
    artist: "Cosmo Sheldrake",
    audioSrc: "./resources/lost-in-city-lights-145038.mp3",
    coverSrc: "https://picsum.photos/seed/1/400",
  },
  {
    title: "Forest Lullaby",
    artist: "Lesfm",
    audioSrc: "./resources/forest-lullaby-110624.mp3",
    coverSrc: "https://picsum.photos/seed/2/400",
  },
];

let songIndex = 0;
let isShuffle = false;
let repeatMode = "none"; // none, one, all

// Audio Context and Visualization
let audioContext = null;
let analyser = null;
let source = null;
let vizAnimated = false;

function initializeAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('visualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function animate() {
      if (!analyser) return;
      const width = canvas.width;
      const height = canvas.height;
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);
      const barWidth = Math.max(1, (width / bufferLength) * 2.2);
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1ed760');
        grad.addColorStop(1, '#1db954');
        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      requestAnimationFrame(animate);
    }

    if (!vizAnimated) {
      vizAnimated = true;
      animate();
    }
  }
}

// Load song details
function loadSong(song) {
  if (!song) return;
  trackTitle.textContent = song.title;
  artistName.textContent = song.artist;
  albumCover.src = song.coverSrc;
  audio.src = song.audioSrc;
  // update queue active highlighting
  updateQueueActive();
}

// Like button functionality (guard)
const likeButton = document.querySelector('.like-button');
if (likeButton) {
  likeButton.addEventListener('click', () => {
    const icon = likeButton.querySelector('i');
    if (!icon) return;
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    icon.classList.toggle('liked');
  });
}

// Play song
function playSong() {
  musicPlayer.classList.add("playing");
  const icon = playPauseBtn.querySelector("i");
  if (icon) {
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  }
  // initialize audio context on first user interaction
  initializeAudioContext();
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  audio.play().catch(() => {});
}

// Pause song
function pauseSong() {
  musicPlayer.classList.remove("playing");
  const icon = playPauseBtn.querySelector("i");
  if (icon) {
    icon.classList.add("fa-play");
    icon.classList.remove("fa-pause");
  }
  audio.pause();
}

// Previous song
function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

// Next song
function nextSong() {
  if (isShuffle) {
    let newIndex;
    if (songs.length === 1) newIndex = 0;
    else {
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === songIndex && songs.length > 1);
    }
    songIndex = newIndex;
  } else {
    songIndex = (songIndex + 1) % songs.length;
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
  } else {
    if (isShuffle && songs.length > 1) {
      nextSong();
    } else if (songIndex < songs.length - 1) {
      nextSong();
    } else {
      pauseSong();
      audio.currentTime = 0;
    }
  }
}

// Update progress bar
function updateProgress() {
  const duration = audio.duration || 0;
  const currentTime = audio.currentTime || 0;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  progress.style.width = `${progressPercent}%`;
  if (progressHandle) progressHandle.style.left = `${progressPercent}%`;

  durationEl.textContent = formatTime(duration);
  currentTimeEl.textContent = formatTime(currentTime);
}

// Format time to 0:00
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Set progress bar (on click)
function setProgress(e) {
  if (!audio || !progressContainer) return;
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const duration = audio.duration || 0;
  if (duration) audio.currentTime = (clickX / width) * duration;
}

// Set volume
function setVolume(e) {
  if (!audio) return;
  audio.volume = parseFloat(e.target.value);
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
    repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
  } else if (repeatMode === 'all') {
    repeatMode = 'one';
    repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position:absolute; font-size:10px; font-weight:bold; top:6px; left:10px;">1</span>';
    repeatBtn.classList.add('active');
  } else {
    repeatMode = 'none';
    repeatBtn.classList.remove('active');
    repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
  }
}

// Initialize queue (up next)
function initializeQueue() {
  if (!queueItemsEl) return;
  queueItemsEl.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'queue-item';
    li.textContent = `${song.title} — ${song.artist}`;
    li.addEventListener('click', () => {
      songIndex = index;
      loadSong(songs[songIndex]);
      playSong();
    });
    queueItemsEl.appendChild(li);
  });
  updateQueueActive();
}

function updateQueueActive() {
  if (!queueItemsEl) return;
  const items = queueItemsEl.querySelectorAll('.queue-item');
  items.forEach((it, idx) => {
    it.classList.toggle('active', idx === songIndex);
  });
}

// Event listeners
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    const isPlaying = musicPlayer.classList.contains("playing");
    if (isPlaying) pauseSong();
    else playSong();
  });
}
if (prevBtn) prevBtn.addEventListener("click", prevSong);
if (nextBtn) nextBtn.addEventListener("click", nextSong);
if (shuffleBtn) shuffleBtn.addEventListener("click", toggleShuffle);
if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);

audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", onSongEnd);
audio.addEventListener("loadedmetadata", updateProgress);

if (progressContainer) progressContainer.addEventListener("click", setProgress);
if (volumeSlider) volumeSlider.addEventListener('input', setVolume);

// Menu / queue toggle
if (menuButton && queuePanel) {
  menuButton.addEventListener('click', () => {
    queuePanel.classList.toggle('open');
  });
}
if (closeQueue && queuePanel) {
  closeQueue.addEventListener('click', () => {
    queuePanel.classList.remove('open');
  });
}

// Initialize UI
initializeQueue();
loadSong(songs[songIndex]);
audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.5;
initializePlaylist();

// Initial load
loadSong(songs[songIndex]);
audio.volume = volumeSlider.value;
