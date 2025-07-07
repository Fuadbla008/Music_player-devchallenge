


document.querySelectorAll(".play-button").forEach((button) => {
  button.addEventListener("click", function () {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.play();
    //   console.log("Paused current audio");

    }
  });
});
document.querySelectorAll(".pause-button").forEach((button) => {
  button.addEventListener("click", function () {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.pause();
    //   console.log("Playing current audio");
    }
  });
});
