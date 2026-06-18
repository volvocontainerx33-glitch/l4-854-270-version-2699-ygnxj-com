(() => {
    const config = window.__ASIA_VIDEO__ || {};
    const video = document.getElementById('movie-player');
    const cover = document.getElementById('player-cover');
    const trigger = document.getElementById('play-trigger');
    let prepared = false;
    let hlsInstance = null;

    if (!video || !config.videoUrl) {
        return;
    }

    const prepare = () => {
        if (prepared) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(config.videoUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.videoUrl;
        }

        prepared = true;
    };

    const start = () => {
        prepare();
        video.controls = true;
        if (cover) {
            cover.classList.add('is-hidden');
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
        }
    };

    if (cover) {
        cover.addEventListener('click', start);
    }

    if (trigger) {
        trigger.addEventListener('click', start);
    }

    video.addEventListener('click', () => {
        if (!prepared) {
            start();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
