(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachPlayer(stage) {
    var video = stage.querySelector("video");
    var cover = stage.querySelector(".player-cover");
    var startButtons = Array.prototype.slice.call(stage.querySelectorAll(".player-start"));
    var source = video ? video.getAttribute("data-src") : "";
    var hls = null;
    var started = false;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      if (!started) {
        started = true;
        loadSource();
      }

      video.controls = true;
      video.muted = false;

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    startButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    });

    if (cover) {
      cover.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });

      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startPlayback();
        }
      });
    }

    stage.addEventListener("click", function () {
      if (!started) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
  });
})();
