(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    restart();
  }

  function getText(card, key) {
    return (card.getAttribute('data-' + key) || '').toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var grid = section.querySelector('[data-movie-grid]') || document.querySelector('[data-movie-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var search = panel.querySelector('.site-search');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var empty = section.querySelector('.empty-state');

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var visible = 0;
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute('data-filter')] = select.value;
        });
        cards.forEach(function (card) {
          var text = [
            getText(card, 'title'),
            getText(card, 'type'),
            getText(card, 'region'),
            getText(card, 'year'),
            getText(card, 'tags')
          ].join(' ');
          var pass = !q || text.indexOf(q) !== -1;
          if (values.type) {
            pass = pass && getText(card, 'type').indexOf(values.type.toLowerCase()) !== -1;
          }
          if (values.year) {
            pass = pass && getText(card, 'year').indexOf(values.year.toLowerCase()) === 0;
          }
          if (values.category) {
            pass = pass && getText(card, 'category') === values.category.toLowerCase();
          }
          card.classList.toggle('is-hidden', !pass);
          if (pass) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.video-overlay');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-source');
      var hlsInstance = null;

      function attach() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        box.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
