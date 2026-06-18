(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      var input = panel.querySelector('[data-search-input]');
      var typeFilter = panel.querySelector('[data-type-filter]');
      var yearFilter = panel.querySelector('[data-year-filter]');
      var reset = panel.querySelector('[data-reset-filter]');
      var empty = scope.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalize(input && input.value);
        var type = normalize(typeFilter && typeFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (typeFilter) {
            typeFilter.value = '';
          }
          if (yearFilter) {
            yearFilter.value = '';
          }
          apply();
        });
      }
    });
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var hlsInstance;
    var ready = false;

    function hideButton() {
      button.classList.add('is-hidden');
    }

    function showButton() {
      button.classList.remove('is-hidden');
    }

    function playVideo() {
      hideButton();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(showButton);
      }
    }

    function prepare() {
      if (ready) {
        playVideo();
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = stream;
      playVideo();
    }

    button.addEventListener('click', prepare);
    video.addEventListener('click', function () {
      if (!ready) {
        prepare();
      }
    });
    video.addEventListener('play', hideButton);
    video.addEventListener('ended', showButton);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
