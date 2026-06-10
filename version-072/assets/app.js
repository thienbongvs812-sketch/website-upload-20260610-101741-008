(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var globalSearch = document.querySelector("[data-global-search]");
    var globalButton = document.querySelector("[data-global-search-button]");

    function submitGlobalSearch() {
      var value = globalSearch ? globalSearch.value.trim() : "";
      if (value) {
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      }
    }

    if (globalSearch) {
      globalSearch.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          submitGlobalSearch();
        }
      });
    }

    if (globalButton) {
      globalButton.addEventListener("click", submitGlobalSearch);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var search = panel.querySelector("[data-movie-search]");
      var year = panel.querySelector("[data-year-filter]");
      var sort = panel.querySelector("[data-sort-filter]");
      var list = root.querySelector("[data-movie-list]");
      var empty = root.querySelector("[data-empty-result]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];

      function cardText(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
      }

      function filterCards() {
        var term = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchesText = !term || cardText(card).indexOf(term) !== -1;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var show = matchesText && matchesYear;

          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      function sortCards() {
        if (!list || !sort) {
          return;
        }

        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          var aYear = Number(a.getAttribute("data-year")) || 0;
          var bYear = Number(b.getAttribute("data-year")) || 0;
          var aTitle = a.getAttribute("data-title") || "";
          var bTitle = b.getAttribute("data-title") || "";

          if (value === "year-asc") {
            return aYear - bYear || aTitle.localeCompare(bTitle, "zh-Hans-CN");
          }

          if (value === "title-asc") {
            return aTitle.localeCompare(bTitle, "zh-Hans-CN") || bYear - aYear;
          }

          return bYear - aYear || aTitle.localeCompare(bTitle, "zh-Hans-CN");
        });

        sorted.forEach(function (card) {
          list.appendChild(card);
        });

        cards = sorted;
        filterCards();
      }

      if (search) {
        search.addEventListener("input", filterCards);
      }

      if (year) {
        year.addEventListener("change", filterCards);
      }

      if (sort) {
        sort.addEventListener("change", sortCards);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && search) {
        search.value = query;
        filterCards();
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var sourceUrl = player.getAttribute("data-url");
      var attached = false;
      var hlsInstance = null;

      function attachVideo() {
        if (!video || !sourceUrl || attached) {
          return;
        }

        attached = true;

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function playVideo() {
        attachVideo();

        if (video) {
          var promise = video.play();

          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!attached) {
            playVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
}());
