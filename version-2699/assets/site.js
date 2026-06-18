(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let index = 0;

        const showSlide = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => showSlide(dotIndex));
        });

        if (slides.length > 1) {
            setInterval(() => showSlide(index + 1), 6200);
        }
    }

    const cards = Array.from(document.querySelectorAll('.js-movie-card'));
    const searchInput = document.querySelector('[data-site-search]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-kind]'));
    const emptyState = document.querySelector('[data-empty-state]');
    let activeKind = 'all';

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q');
    if (searchInput && queryParam) {
        searchInput.value = queryParam;
    }

    const normalize = (value) => (value || '').toString().toLowerCase().trim();

    const applyFilters = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.tags,
                card.dataset.year
            ].join(' '));
            const kindMatch = activeKind === 'all' || card.dataset.kind === activeKind;
            const queryMatch = !query || haystack.includes(query);
            const shouldShow = kindMatch && queryMatch;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeKind = button.dataset.filterKind || 'all';
            filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
            applyFilters();
        });
    });

    if (cards.length) {
        applyFilters();
    }
})();
