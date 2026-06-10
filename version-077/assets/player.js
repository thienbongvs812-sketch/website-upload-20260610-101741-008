const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((player) => {
    const video = player.querySelector('video[data-src]');
    const startButton = player.querySelector('[data-start]');
    const message = player.querySelector('[data-video-message]');
    let ready = false;
    let hlsInstance = null;

    function showMessage(value) {
        if (!message) {
            return;
        }

        message.textContent = value;
        message.classList.add('show');
    }

    function prepare() {
        if (!video || ready) {
            return;
        }

        const source = video.getAttribute('data-src');

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(window.Hls.Events.ERROR, (_event, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    showMessage('视频暂时无法播放，请稍后再试');
                }
            });

            ready = true;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            return;
        }

        showMessage('当前浏览器暂不支持该播放格式');
    }

    async function start() {
        if (!video) {
            return;
        }

        prepare();

        try {
            await video.play();
            if (startButton) {
                startButton.classList.add('hidden');
            }
        } catch (_error) {
            showMessage('请再次点击播放按钮开始播放');
        }
    }

    if (startButton) {
        startButton.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('play', () => {
            if (startButton) {
                startButton.classList.add('hidden');
            }
        });

        video.addEventListener('pause', () => {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove('hidden');
            }
        });
    }

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
