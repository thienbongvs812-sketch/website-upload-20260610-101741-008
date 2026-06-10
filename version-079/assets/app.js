(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector(".menu-toggle");

    if (header && menuButton) {
        menuButton.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            var panel = header.querySelector(".mobile-panel");
            if (panel) {
                panel.setAttribute("aria-hidden", open ? "false" : "true");
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("is-active", position === active);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("is-active", position === active);
        });
    }

    function startAuto() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    function restartAuto() {
        if (timer) {
            window.clearInterval(timer);
        }
        startAuto();
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                restartAuto();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                restartAuto();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartAuto();
            });
        });
        startAuto();
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var input = document.getElementById("searchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var heading = document.getElementById("searchHeading");
    var empty = document.querySelector(".empty-state");

    if (input) {
        input.value = query;
    }

    if (cards.length) {
        var shown = 0;
        cards.forEach(function (card) {
            var haystack = card.getAttribute("data-search") || "";
            var matched = !query || haystack.indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                shown += 1;
            }
        });
        if (heading) {
            heading.textContent = query ? "搜索结果" : "影片片库";
        }
        if (empty) {
            empty.hidden = shown !== 0;
        }
    }
}());
