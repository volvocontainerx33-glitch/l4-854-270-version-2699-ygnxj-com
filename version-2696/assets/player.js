(function () {
  window.bindPlayer = function (id, source) {
    var shell = document.getElementById(id);
    if (!shell) return;
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var loaded = false;
    var hls = null;

    function start() {
      if (!video) return;
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      if (cover) {
        cover.classList.add("hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
