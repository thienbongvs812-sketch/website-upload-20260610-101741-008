(function () {
    function closestList(element) {
        var scope = element.closest(".section") || document;
        return scope.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters(list, input, activeFilter) {
        if (!list) {
            return;
        }
        var query = normalize(input ? input.value : "");
        var filter = normalize(activeFilter || "all");
        var cards = list.querySelectorAll("[data-card]");
        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute("data-search"));
            var year = normalize(card.getAttribute("data-year"));
            var category = normalize(card.getAttribute("data-category"));
            var matchesText = !query || searchText.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || year === filter || category === filter || searchText.indexOf(filter) !== -1;
            card.classList.toggle("is-hidden", !(matchesText && matchesFilter));
        });
    }

    function setupSearchAreas() {
        document.querySelectorAll("[data-search-input]").forEach(function (input) {
            var list = closestList(input);
            var filterGroup = (input.closest(".section") || document).querySelector("[data-filter-group]");
            var activeFilter = "all";
            input.addEventListener("input", function () {
                applyFilters(list, input, activeFilter);
            });
            if (filterGroup) {
                filterGroup.querySelectorAll("[data-filter]").forEach(function (button) {
                    button.addEventListener("click", function () {
                        activeFilter = button.getAttribute("data-filter") || "all";
                        filterGroup.querySelectorAll("[data-filter]").forEach(function (item) {
                            item.classList.toggle("is-active", item === button);
                        });
                        applyFilters(list, input, activeFilter);
                    });
                });
            }
        });
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    window.initializeMoviePlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var cover = document.getElementById("playerCoverButton");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        function attach() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupSearchAreas();
    });
})();
