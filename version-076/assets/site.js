import { H as Hls } from "./original/video-player-dru42stk.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
    const button = $(".menu-toggle");
    const panel = $(".mobile-panel");

    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
    });
}

function setupImageFallbacks() {
    $$("img[data-fallback-image]").forEach((image) => {
        image.addEventListener("error", () => {
            const frame = image.closest(".poster-frame");

            if (frame) {
                frame.classList.add("poster-fallback");
            }

            image.remove();
        });
    });
}

function setupHeroCarousel() {
    const carousel = $("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    const slides = $$('[data-hero-slide]', carousel);
    const dots = $$('[data-hero-dot]', carousel);
    const previous = $('[data-hero-prev]', carousel);
    const next = $('[data-hero-next]', carousel);
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === current));
        dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === current));
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    if (previous) {
        previous.addEventListener('click', () => {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            start();
        });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
}

function setupFilters() {
    const panel = $('[data-filter-panel]');
    const list = $('[data-card-list]');

    if (!panel || !list) {
        return;
    }

    const cards = $$('.movie-card', list);
    const search = $('[data-card-search]', panel);
    const category = $('[data-category-filter]', panel);
    const year = $('[data-year-filter]', panel);
    const result = $('[data-filter-result]', panel);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query && search) {
        search.value = query;
    }

    const apply = () => {
        const keyword = (search?.value || '').trim().toLowerCase();
        const categoryValue = category?.value || '';
        const yearValue = year?.value || '';
        let visible = 0;

        cards.forEach((card) => {
            const haystack = (card.dataset.search || '').toLowerCase();
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesCategory = !categoryValue || card.dataset.category === categoryValue;
            const matchesYear = !yearValue || card.dataset.year === yearValue;
            const matches = matchesKeyword && matchesCategory && matchesYear;

            card.classList.toggle('is-hidden-by-filter', !matches);

            if (matches) {
                visible += 1;
            }
        });

        if (result) {
            result.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
        }
    };

    [search, category, year].forEach((control) => {
        if (!control) {
            return;
        }

        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
    });

    apply();
}

function setupPlayers() {
    $$('[data-player]').forEach((player) => {
        const video = $('.player-video', player);
        const start = $('[data-player-start]', player);
        const status = $('[data-player-status]', player);

        if (!video || !start) {
            return;
        }

        let attached = false;
        let hls = null;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const attachMp4 = () => {
            const mp4 = video.dataset.mp4;

            if (mp4) {
                video.src = mp4;
                setStatus('已切换兼容播放源。');
            }
        };

        const attachSource = () => {
            if (attached) {
                return;
            }

            attached = true;
            const hlsUrl = video.dataset.hls;

            if (hlsUrl && Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });

                hls.loadSource(hlsUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源已加载。');
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        hls.destroy();
                        hls = null;
                        attachMp4();
                    }
                });
            } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
                setStatus('播放源已加载。');
            } else {
                attachMp4();
            }
        };

        start.addEventListener('click', async () => {
            attachSource();
            start.classList.add('hidden');

            try {
                await video.play();
            } catch (error) {
                setStatus('请再次点击视频控件开始播放。');
            }
        });

        video.addEventListener('play', () => start.classList.add('hidden'));
        video.addEventListener('error', attachMp4);
    });
}

setupMobileMenu();
setupImageFallbacks();
setupHeroCarousel();
setupFilters();
setupPlayers();
