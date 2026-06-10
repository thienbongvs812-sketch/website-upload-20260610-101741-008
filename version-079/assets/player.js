function initMoviePlayer(url) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    var ready = false;
    var hlsInstance = null;

    function bindStream() {
        if (!video || ready) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
        }
        ready = true;
    }

    function playVideo() {
        bindStream();
        if (!video) {
            return;
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {});
        }
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
}
