function initMoviePlayer(playUrl) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playOverlay");
  var attached = false;
  var hlsInstance = null;

  if (!video || !playUrl) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = playUrl;
  }

  function startPlayback() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
