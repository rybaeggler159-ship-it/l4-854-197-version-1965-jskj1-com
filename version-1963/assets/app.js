(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    hero.addEventListener('mouseleave', start);
    start();
  }

  function textOf(card) {
    return (card.getAttribute('data-search') || '').toLowerCase();
  }

  function filterCards(cards, keyword, typeValue, regionValue) {
    var visible = 0;
    var key = (keyword || '').trim().toLowerCase();
    var type = (typeValue || '').trim().toLowerCase();
    var region = (regionValue || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = textOf(card);
      var cardType = (card.getAttribute('data-type') || '').toLowerCase();
      var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
      var matchKeyword = !key || text.indexOf(key) !== -1;
      var matchType = !type || cardType.indexOf(type) !== -1;
      var matchRegion = !region || cardRegion.indexOf(region) !== -1;
      var show = matchKeyword && matchType && matchRegion;
      card.classList.toggle('is-filtered-out', !show);
      if (show) {
        visible += 1;
      }
    });
    return visible;
  }

  function setupPageFilter() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var input = document.getElementById('page-filter');
    var type = document.getElementById('type-filter');
    var cards = queryAll('.movie-card', grid);
    function run() {
      filterCards(cards, input ? input.value : '', type ? type.value : '', '');
    }
    if (input) {
      input.addEventListener('input', run);
    }
    if (type) {
      type.addEventListener('change', run);
    }
  }

  function setupSearchPage() {
    var grid = document.querySelector('[data-search-grid]');
    if (!grid) {
      return;
    }
    var input = document.getElementById('search-page-input');
    var type = document.getElementById('search-type');
    var region = document.getElementById('search-region');
    var count = document.getElementById('search-count');
    var cards = queryAll('.movie-card', grid);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    function run() {
      var visible = filterCards(
        cards,
        input ? input.value : '',
        type ? type.value : '',
        region ? region.value : ''
      );
      if (count) {
        count.textContent = visible ? '找到 ' + visible + ' 部相关内容' : '没有找到匹配内容';
      }
    }
    [input, type, region].forEach(function (element) {
      if (!element) {
        return;
      }
      element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', run);
    });
    run();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
})();
