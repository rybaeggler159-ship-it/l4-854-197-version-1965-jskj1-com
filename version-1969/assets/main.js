(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const mobileButton = $('.mobile-toggle');
  const mobilePanel = $('.mobile-panel');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('open');
    });
  }

  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  let heroIndex = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === heroIndex);
    });
  };
  if (slides.length) {
    const next = () => showSlide(heroIndex + 1);
    const prev = () => showSlide(heroIndex - 1);
    $('.hero-next')?.addEventListener('click', next);
    $('.hero-prev')?.addEventListener('click', prev);
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    setInterval(next, 5000);
  }

  const list = $('.all-list');
  const input = $('.filter-input');
  const selects = $$('.filter-select');
  const empty = $('.empty-state');
  if (list && (input || selects.length)) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && input) input.value = query;
    const cards = $$('.movie-card', list);
    const apply = () => {
      const term = input ? input.value.trim().toLowerCase() : '';
      const filters = {};
      selects.forEach((select) => {
        const key = select.getAttribute('data-filter');
        if (key && select.value) filters[key] = select.value;
      });
      let shown = 0;
      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        let ok = !term || text.includes(term);
        Object.keys(filters).forEach((key) => {
          if ((card.getAttribute(`data-${key}`) || '') !== filters[key]) ok = false;
        });
        card.classList.toggle('is-hidden', !ok);
        if (ok) shown += 1;
      });
      list.classList.toggle('filtered-empty', shown === 0);
      if (empty) empty.classList.toggle('visible', shown === 0);
    };
    input?.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  }

  $$('.watch-player').forEach((player) => {
    const video = $('.video-el', player);
    const button = $('.play-overlay', player);
    const message = $('.player-message', player);
    const src = player.getAttribute('data-stream');
    let started = false;
    let hls = null;
    const setMessage = (text) => {
      if (!message) return;
      message.textContent = text;
      message.classList.toggle('visible', Boolean(text));
    };
    const start = async () => {
      if (!video || !src) return;
      setMessage('');
      try {
        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, (_event, data) => {
              if (data && data.fatal) setMessage('播放暂不可用，请稍后重试');
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            setMessage('播放暂不可用，请稍后重试');
            return;
          }
          started = true;
        }
        player.classList.add('is-playing');
        video.controls = true;
        await video.play();
      } catch (_error) {
        player.classList.remove('is-playing');
        setMessage('点击播放器继续播放');
      }
    };
    button?.addEventListener('click', start);
    video?.addEventListener('click', () => {
      if (!started || video.paused) start();
    });
    window.addEventListener('beforeunload', () => {
      if (hls) hls.destroy();
    });
  });
})();
