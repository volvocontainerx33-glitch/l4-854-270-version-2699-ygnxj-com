(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeSlide);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }

      heroTimer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(heroTimer);
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var searchInput = document.querySelector(".movie-search");
    var yearSelect = document.querySelector(".year-filter");
    var sortSelect = document.querySelector(".sort-select");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var grid = document.querySelector("[data-card-grid]");
    var emptyResult = document.querySelector(".empty-result");
    var activeFilter = "all";

    function getCards() {
      return Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-category"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" "));
    }

    function matchYear(card, value) {
      if (value === "all") {
        return true;
      }

      var year = Number(card.getAttribute("data-year")) || 0;

      if (value === "2020") {
        return year <= 2020;
      }

      return year === Number(value);
    }

    function applyFilters() {
      var query = searchInput ? normalize(searchInput.value) : "";
      var yearValue = yearSelect ? yearSelect.value : "all";
      var visibleCount = 0;

      getCards().forEach(function (card) {
        var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
        var matchesCategory = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
        var matchesYear = matchYear(card, yearValue);
        var isVisible = matchesQuery && matchesCategory && matchesYear;

        card.hidden = !isVisible;

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyResult) {
        emptyResult.hidden = visibleCount !== 0;
      }
    }

    function applySort() {
      if (!grid || !sortSelect) {
        return;
      }

      var value = sortSelect.value;
      var cards = getCards();

      if (value === "rating") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        });
      } else if (value === "year") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (value === "title") {
        cards.sort(function (a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      } else {
        cards.sort(function (a, b) {
          return Number(a.getAttribute("data-id")) - Number(b.getAttribute("data-id"));
        });
      }

      cards.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilters();
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });

        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });
  });
})();
