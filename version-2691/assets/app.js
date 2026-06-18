(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initBackTop() {
    qsa('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearchAndFilters() {
    var input = qs('[data-page-search]');
    var cards = qsa('[data-search-card]');
    var count = qs('[data-result-count]');
    var region = qs('[data-filter-region]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');

    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }

    function matches(card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var keyword = normalize(input.value);
      var selectedRegion = region ? normalize(region.value) : '';
      var selectedType = type ? normalize(type.value) : '';
      var selectedYear = year ? normalize(year.value) : '';
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedRegion && cardRegion !== selectedRegion) {
        return false;
      }
      if (selectedType && cardType !== selectedType) {
        return false;
      }
      if (selectedYear && cardYear !== selectedYear) {
        return false;
      }
      return true;
    }

    function update() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', update);
    [region, type, year].forEach(function (select) {
      if (select) {
        select.addEventListener('change', update);
      }
    });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initBackTop();
    initHero();
    initSearchAndFilters();
  });
})();
