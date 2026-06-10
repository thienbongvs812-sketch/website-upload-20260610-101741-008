(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyMovieFilter(term) {
    var value = normalize(term);
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var matched = !value || value === "全部" || haystack.indexOf(value) !== -1;
      card.classList.toggle("is-filtered-out", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  if (query) {
    document.querySelectorAll("[data-filter-form] input, .quick-search input").forEach(function (input) {
      input.value = query;
    });
    applyMovieFilter(query);
  }

  document.querySelectorAll("[data-filter-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      applyMovieFilter(input ? input.value : "");
    });
  });

  document.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll("[data-filter-chip]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      applyMovieFilter(chip.getAttribute("data-filter-chip"));
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var index = 0;

  function showSlide(nextIndex) {
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

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }
})();

function setupMoviePlayer(sourceUrl) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".player-overlay");

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  var loaded = false;
  var player = null;

  function attachSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.loadSource(sourceUrl);
      player.attachMedia(video);
      loaded = true;
    }
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add("is-hidden");

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);

  video.addEventListener("click", function () {
    if (!loaded) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (player && typeof player.destroy === "function") {
      player.destroy();
    }
  });
}
