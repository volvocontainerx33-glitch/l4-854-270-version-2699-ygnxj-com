import { H as Hls } from "./hls.js";

export function setupPlayer(mediaUrl) {
    var video = document.querySelector("#main-player");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
    var ready = false;
    var hls = null;

    function prepare() {
        if (!video || ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = mediaUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(mediaUrl);
            hls.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }

        ready = true;
    }

    function play() {
        if (!video) {
            return;
        }

        prepare();

        if (cover) {
            cover.classList.add("is-hidden");
        }

        video.controls = true;
        video.play().catch(function () {});
    }

    buttons.forEach(function (button) {
        button.addEventListener("click", play);
    });

    if (cover) {
        cover.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!ready) {
                play();
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
