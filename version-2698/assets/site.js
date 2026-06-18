document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  filterPanels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute("data-filter-panel")) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));
    var search = panel.querySelector(".filter-search");
    var type = panel.querySelector(".filter-type");
    var region = panel.querySelector(".filter-region");
    var year = panel.querySelector(".filter-year");
    var empty = scope.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) {
      search.value = params.get("q");
    }
    var normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };
    var apply = function () {
      var q = normalize(search ? search.value : "");
      var t = normalize(type ? type.value : "");
      var r = normalize(region ? region.value : "");
      var y = normalize(year ? year.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (t && normalize(card.dataset.typeGroup) !== t) ok = false;
        if (r && normalize(card.dataset.regionGroup) !== r) ok = false;
        if (y && normalize(card.dataset.year) !== y) ok = false;
        card.classList.toggle("hidden-card", !ok);
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
  players.forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var message = shell.querySelector(".player-message");
    var hlsInstance = null;
    var setMessage = function (text) {
      if (message) message.textContent = text || "";
    };
    var playVideo = function () {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setMessage("请再次点击播放");
        });
      }
    };
    var ready = function (autoplay) {
      shell.classList.add("is-ready");
      setMessage("");
      if (autoplay) playVideo();
    };
    var load = function (autoplay) {
      if (!video) return;
      if (video.dataset.ready === "1") {
        ready(autoplay);
        return;
      }
      var stream = shell.dataset.stream;
      if (!stream) {
        setMessage("播放暂时不可用");
        return;
      }
      video.dataset.ready = "1";
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready(autoplay);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放暂时不可用");
            try {
              hlsInstance.destroy();
            } catch (error) {}
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          ready(autoplay);
        }, { once: true });
        video.load();
      } else {
        setMessage("播放暂时不可用");
      }
    };
    if (overlay) {
      overlay.addEventListener("click", function () {
        shell.classList.add("is-playing");
        load(true);
      });
    }
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "1") {
        load(true);
      }
    });
  });
});
