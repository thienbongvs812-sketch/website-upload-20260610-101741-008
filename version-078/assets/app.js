(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(position);
        play();
      });
    });
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".header-search"));
    if (!forms.length || !window.searchMovies) {
      return;
    }
    forms.forEach(function (form) {
      var input = form.querySelector(".site-search-input");
      var results = form.querySelector(".site-search-results");
      if (!input || !results) {
        return;
      }
      function render() {
        var term = normalize(input.value);
        results.innerHTML = "";
        if (!term) {
          results.classList.remove("is-open");
          return;
        }
        var matches = window.searchMovies.filter(function (item) {
          return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre).indexOf(term) !== -1;
        }).slice(0, 10);
        if (!matches.length) {
          results.innerHTML = '<div class="search-result-item"><span><strong>没有找到匹配影片</strong><span>换个关键词试试</span></span></div>';
          results.classList.add("is-open");
          return;
        }
        results.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
            '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + '</span></span>' +
            '</a>';
        }).join("");
        results.classList.add("is-open");
      }
      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = results.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          results.classList.remove("is-open");
        }
      });
    });
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
    lists.forEach(function (list) {
      var scope = list.closest("main") || document;
      var keyword = scope.querySelector(".filter-keyword");
      var filters = Array.prototype.slice.call(scope.querySelectorAll(".site-filter"));
      var empty = scope.querySelector(".empty-state");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
      if (!cards.length) {
        return;
      }
      function apply() {
        var term = normalize(keyword ? keyword.value : "");
        var activeFilters = filters.map(function (select) {
          return {
            key: select.getAttribute("data-filter"),
            value: normalize(select.value)
          };
        }).filter(function (item) {
          return item.key && item.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = !term || haystack.indexOf(term) !== -1;
          activeFilters.forEach(function (filter) {
            ok = ok && normalize(card.getAttribute("data-" + filter.key)).indexOf(filter.value) !== -1;
          });
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (keyword) {
        keyword.addEventListener("input", apply);
      }
      filters.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupHeaderSearch();
    setupFilters();
  });
})();
