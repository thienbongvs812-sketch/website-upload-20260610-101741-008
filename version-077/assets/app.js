const menuButton = document.querySelector('[data-menu-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
        mobilePanel.classList.toggle('open');
    });

    mobilePanel.querySelectorAll('[data-mobile-link]').forEach((link) => {
        link.addEventListener('click', () => {
            mobilePanel.classList.remove('open');
        });
    });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let activeSlide = 0;

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeSlide);
    });
}

if (slides.length) {
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    showSlide(0);

    window.setInterval(() => {
        showSlide(activeSlide + 1);
    }, 5200);
}

const quickSearchForm = document.querySelector('[data-quick-search]');
const quickSearchInput = document.querySelector('[data-quick-search-input]');

if (quickSearchForm && quickSearchInput) {
    quickSearchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = quickSearchInput.value.trim();
        const target = quickSearchForm.getAttribute('data-target') || 'search.html';
        const url = query ? `${target}?q=${encodeURIComponent(query)}` : target;
        window.location.href = url;
    });
}

const searchInput = document.querySelector('[data-search-input]');
const searchItems = Array.from(document.querySelectorAll('[data-search]'));
const searchEmpty = document.querySelector('[data-search-empty]');

function filterSearch() {
    if (!searchInput || !searchItems.length) {
        return;
    }

    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    searchItems.forEach((item) => {
        const haystack = item.getAttribute('data-search') || '';
        const matched = !query || haystack.includes(query);
        item.style.display = matched ? '' : 'none';
        if (matched) {
            visible += 1;
        }
    });

    if (searchEmpty) {
        searchEmpty.classList.toggle('show', visible === 0);
    }
}



const filterForm = document.querySelector('[data-filter-form]');

if (filterForm) {
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        filterSearch();
    });
}

if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    searchInput.addEventListener('input', filterSearch);
    filterSearch();
}

const backTop = document.querySelector('[data-back-top]');

if (backTop) {
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('show', window.scrollY > 520);
    });

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
