(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var container = document.querySelector('[data-filter-container]');
    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
    var input = document.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var count = document.querySelector('[data-filter-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var selected = {};
      selects.forEach(function (select) {
        selected[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesSelects = Object.keys(selected).every(function (key) {
          return !selected[key] || normalize(card.getAttribute('data-' + key)) === selected[key];
        });
        var shouldShow = matchesKeyword && matchesSelects;
        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '正在显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializeHls() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('正在使用浏览器原生播放能力加载视频。');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
        setStatus('播放初始化完成，正在加载视频。');
        return Promise.resolve();
      }

      video.src = source;
      setStatus('当前浏览器兼容性有限，已尝试直接加载播放源。');
      return Promise.resolve();
    }

    button.addEventListener('click', function () {
      initializeHls().then(function () {
        var playPromise = video.play();
        video.closest('.video-shell').classList.add('is-playing');
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止自动播放，请再次点击视频控件播放。');
            video.closest('.video-shell').classList.remove('is-playing');
          });
        }
      });
    });

    video.addEventListener('play', function () {
      video.closest('.video-shell').classList.add('is-playing');
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="details/' + movie.sid + '.html">',
      '  <span class="poster-frame">',
      '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'; this.parentElement.classList.add(\'poster-fallback\');">',
      '    <span class="poster-badge">' + escapeHtml(movie.rating) + '</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <span class="movie-card-title">' + escapeHtml(movie.title) + '</span>',
      '    <span class="movie-card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '    <span class="movie-card-desc">' + escapeHtml(movie.one_line) + '</span>',
      '    <span class="tag-row">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-page-input]');
    var summary = document.querySelector('[data-search-summary]');
    if (!results || !input || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runSearch(keyword) {
      var normalized = normalize(keyword);
      if (!normalized) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '请输入关键词进行搜索。';
        }
        return;
      }

      var matches = window.MOVIE_INDEX.filter(function (movie) {
        return normalize(movie.search).indexOf(normalized) !== -1;
      });

      results.innerHTML = matches.map(movieCardHtml).join('');
      if (summary) {
        summary.textContent = '找到 ' + matches.length + ' 部相关影片。';
      }
    }

    runSearch(q);
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
