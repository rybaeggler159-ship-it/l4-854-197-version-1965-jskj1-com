(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMobileMenu() {
    var button = one('[data-mobile-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  }

  function initPageFilter() {
    var input = one('[data-page-filter]');
    var items = all('[data-filter-item]');
    if (!input || !items.length) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var haystack = (item.getAttribute('data-filter-text') || '').toLowerCase();
        item.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + item.url + '">',
      '<div class="card-cover">',
      '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
      '<span class="card-score">' + escapeHtml(item.score) + '</span>',
      '<span class="card-play">▶ 播放</span>',
      '</div>',
      '<div class="card-body">',
      '<h2 class="card-title">' + escapeHtml(item.title) + '</h2>',
      '<div class="card-meta">',
      '<span class="badge">' + escapeHtml(item.year) + '</span>',
      '<span class="badge">' + escapeHtml(item.region) + '</span>',
      '<span class="badge">' + escapeHtml(item.type) + '</span>',
      '</div>',
      '<p class="card-text">' + escapeHtml(item.line) + '</p>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var form = one('[data-search-form]');
    var input = one('[data-search-input]');
    var results = one('[data-search-results]');
    var empty = one('[data-search-empty]');
    if (!form || !input || !results || !window.SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(keyword) {
      var query = keyword.trim().toLowerCase();
      var list = window.SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.year, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, query ? 120 : 48);
      results.innerHTML = list.map(renderCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', list.length === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var keyword = input.value.trim();
      var url = keyword ? window.location.pathname + '?q=' + encodeURIComponent(keyword) : window.location.pathname;
      window.history.replaceState(null, '', url);
      render(keyword);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initial);
  }

  function initPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = one('video', player);
      var source = video ? one('source', video) : null;
      var cover = one('[data-play-cover]', player);
      if (!video || !source) {
        return;
      }

      function attach() {
        var src = source.getAttribute('src');
        if (!src) {
          return;
        }
        if (video.getAttribute('data-ready') !== '1') {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
          } else {
            video.src = src;
          }
          video.setAttribute('data-ready', '1');
        }
      }

      function start() {
        attach();
        player.classList.add('is-playing');
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initPageFilter();
    initSearchPage();
    initPlayers();
  });
})();
