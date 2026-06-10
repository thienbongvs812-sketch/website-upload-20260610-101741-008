(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var next = hero.querySelector('[data-hero-next]');
      var prev = hero.querySelector('[data-hero-prev]');
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          startTimer();
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          startTimer();
        });
      });

      startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach(function (input) {
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
          card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
      });
    });

    var players = new WeakMap();

    function startVideo(video) {
      if (!video) {
        return;
      }

      var source = video.getAttribute('data-src');
      var shell = video.closest('.player-shell');
      var overlay = shell ? shell.querySelector('.play-overlay') : null;

      if (!source) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!players.has(video)) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 32
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          players.set(video, hls);
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (video.src !== source) {
        video.src = source;
      }
      video.play().catch(function () {});
    }

    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-target]'));

    playButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-player-target');
        startVideo(document.getElementById(id));
      });
    });

    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-src]'));

    videos.forEach(function (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(video);
        }
      });

      video.addEventListener('play', function () {
        var shell = video.closest('.player-shell');
        var overlay = shell ? shell.querySelector('.play-overlay') : null;

        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  });
})();
