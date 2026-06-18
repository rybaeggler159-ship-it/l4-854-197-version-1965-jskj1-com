(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        play();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]'));
        var currentType = '全部';

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-type'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var term = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var typeText = (card.getAttribute('data-type') || '') + ' ' + (card.getAttribute('data-genre') || '');
                var matchedTerm = !term || cardText(card).indexOf(term) !== -1;
                var matchedType = currentType === '全部' || typeText.indexOf(currentType) !== -1;
                card.style.display = matchedTerm && matchedType ? '' : 'none';
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && scope.hasAttribute('data-query-page')) {
                input.value = query;
            }
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                currentType = chip.getAttribute('data-filter-type') || '全部';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilter();
            });
        });

        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var src = player.getAttribute('data-video');
        var started = false;
        var hlsInstance = null;

        function loadVideo() {
            if (!video || !src || started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function startVideo(event) {
            if (event) {
                event.preventDefault();
            }
            loadVideo();
            player.classList.add('is-playing');
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (cover && video) {
            cover.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
            video.addEventListener('error', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    });

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('[data-player]');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var cover = player.querySelector('.player-cover');
                if (cover) {
                    cover.click();
                }
            }
        });
    });
})();
