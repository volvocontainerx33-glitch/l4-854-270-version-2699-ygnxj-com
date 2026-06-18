(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  if (slides.length) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    };
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var movieItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty]');
  if (filterForm && movieItems.length) {
    var input = filterForm.querySelector('[name="q"]');
    var channel = filterForm.querySelector('[name="channel"]');
    var year = filterForm.querySelector('[name="year"]');
    var runFilter = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var c = channel ? channel.value : '';
      var y = year ? year.value : '';
      var visible = 0;
      movieItems.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (c && item.getAttribute('data-channel') !== c) ok = false;
        if (y && item.getAttribute('data-year') !== y) ok = false;
        item.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    };
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });
    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, runFilter);
    });
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
      runFilter();
    }
  }
}());

function setupPlayer(src) {
  var video = document.getElementById('player');
  var shell = document.querySelector('[data-player-shell]');
  var overlay = document.querySelector('[data-player-overlay]');
  var started = false;
  if (!video || !src) return;

  var hideOverlay = function () {
    if (overlay) overlay.classList.add('hidden');
  };

  var start = function () {
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };

  if (overlay) overlay.addEventListener('click', start);
  if (shell) shell.addEventListener('click', function (event) {
    if (event.target === video && !started) start();
  });
  video.addEventListener('play', hideOverlay);
}
