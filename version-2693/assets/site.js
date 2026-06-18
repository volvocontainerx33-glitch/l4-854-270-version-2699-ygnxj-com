(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var filterForm = document.querySelector("[data-filter-form]");

    if (filterForm) {
        var searchInput = filterForm.querySelector("[data-search-input]");
        var regionSelect = filterForm.querySelector("[data-filter-region]");
        var typeSelect = filterForm.querySelector("[data-filter-type]");
        var clearButton = filterForm.querySelector("[data-filter-clear]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.tags
                ].join(" "));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
                var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
                var show = matchesKeyword && matchesRegion && matchesType;

                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput && searchInput.hasAttribute("data-read-query")) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                searchInput.value = query;
            }
        }

        [searchInput, regionSelect, typeSelect].forEach(function (field) {
            if (field) {
                field.addEventListener("input", applyFilters);
                field.addEventListener("change", applyFilters);
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                applyFilters();
            });
        }

        applyFilters();
    }
})();
