(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHeaderSearch() {
        document.querySelectorAll("[data-site-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var action = form.getAttribute("action") || "search.html";
                var target = query ? action + "?q=" + encodeURIComponent(query) : action;
                window.location.href = target;
            });
        });
    }

    function setupStaticFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }

        var input = document.querySelector("[data-filter-input]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var items = Array.prototype.slice.call(list.querySelectorAll(".filter-item"));

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);

            items.forEach(function (item) {
                var searchText = normalize(item.getAttribute("data-search"));
                var itemType = normalize(item.getAttribute("data-type"));
                var itemYear = normalize(item.getAttribute("data-year"));
                var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchType = !typeValue || itemType.indexOf(typeValue) !== -1;
                var matchYear = !yearValue || itemYear === yearValue;
                item.classList.toggle("is-hidden", !(matchKeyword && matchType && matchYear));
            });
        }

        [input, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    }

    function cardTemplate(item) {
        var tags = item.tags && item.tags.length ? item.tags[0] : item.genre;
        return [
            '<article class="movie-card filter-item">',
            '  <a href="' + item.url + '" class="card-link" title="' + escapeHtml(item.title) + '">',
            '    <span class="poster-wrap">',
            '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">',
            '      <span class="poster-shade"></span>',
            '      <span class="badge badge-type">' + escapeHtml(item.type) + '</span>',
            '      <span class="badge badge-year">' + escapeHtml(item.year) + '</span>',
            '    </span>',
            '    <span class="card-body">',
            '      <span class="card-title">' + escapeHtml(item.title) + '</span>',
            '      <span class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span>',
            '      <span class="card-desc">' + escapeHtml(item.oneLine) + '</span>',
            '      <span class="tag-row"><span>' + escapeHtml(item.categoryName) + '</span><span>' + escapeHtml(tags) + '</span></span>',
            '    </span>',
            '  </a>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.getElementById("searchResults");
        if (!results || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector("[data-search-page-input]");
        var category = document.querySelector("[data-search-category]");
        var type = document.querySelector("[data-search-type]");
        var status = document.querySelector("[data-search-status]");

        if (input) {
            input.value = params.get("q") || "";
        }
        if (category && params.get("category")) {
            category.value = params.get("category");
        }

        function render() {
            var keyword = normalize(input && input.value);
            var categoryValue = normalize(category && category.value);
            var typeValue = normalize(type && type.value);
            var data = window.MOVIE_INDEX.filter(function (item) {
                var searchText = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.categoryName,
                    (item.tags || []).join(" ")
                ].join(" "));
                var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchCategory = !categoryValue || normalize(item.category) === categoryValue;
                var matchType = !typeValue || normalize(item.type).indexOf(typeValue) !== -1;
                return matchKeyword && matchCategory && matchType;
            }).slice(0, 160);

            results.innerHTML = data.map(cardTemplate).join("");
            if (status) {
                status.textContent = data.length ? "已展示匹配内容，点击卡片可进入详情页。" : "没有找到匹配内容，请更换关键词或筛选条件。";
            }
        }

        [input, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });

        render();
    }

    function initializeHlsVideo(video) {
        if (!video || video.dataset.initialized === "1") {
            return;
        }

        var src = video.getAttribute("data-src");
        if (!src) {
            return;
        }

        video.dataset.initialized = "1";

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = src;
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
        } else {
            video.src = src;
            video.play().catch(function () {});
        }
    }

    function setupPlayers() {
        document.querySelectorAll("[data-play-target]").forEach(function (button) {
            button.addEventListener("click", function () {
                var id = button.getAttribute("data-play-target");
                var video = document.getElementById(id);
                initializeHlsVideo(video);
                button.classList.add("is-hidden");
            });
        });

        document.querySelectorAll(".js-player").forEach(function (video) {
            video.addEventListener("play", function () {
                initializeHlsVideo(video);
                var overlay = document.querySelector("[data-play-target='" + video.id + "']");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupStaticFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
