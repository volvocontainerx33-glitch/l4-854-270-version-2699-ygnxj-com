(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.hasAttribute("hidden");
        if (open) {
          panel.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        } else {
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (next) {
        slides[current].classList.remove("active");
        dots[current].classList.remove("active");
        current = (next + slides.length) % slides.length;
        slides[current].classList.add("active");
        dots[current].classList.add("active");
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var keyword = filterRoot.querySelector("[data-filter-keyword]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var type = filterRoot.querySelector("[data-filter-type]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var reset = filterRoot.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
      var empty = filterRoot.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      if (keyword && params.get("q")) {
        keyword.value = params.get("q");
      }
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-keywords") || "").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) ok = false;
          if (r && card.getAttribute("data-region") !== r) ok = false;
          if (t && card.getAttribute("data-type") !== t) ok = false;
          if (y && card.getAttribute("data-year") !== y) ok = false;
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      };
      [keyword, region, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (keyword) keyword.value = "";
          if (region) region.value = "";
          if (type) type.value = "";
          if (year) year.value = "";
          apply();
        });
      }
      apply();
    }
  });
})();
