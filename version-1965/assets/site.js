(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function cardTemplate(movie, prefix) {
        var tags = [movie.title, movie.year, movie.region, movie.genre, movie.type, movie.category].join(' ');
        return '' +
            '<article class="movie-card" data-card data-text="' + escapeHtml(tags) + '">' +
                '<a href="' + prefix + 'videos/' + movie.id + '.html">' +
                    '<div class="card-poster">' +
                        '<img src="' + prefix + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="badge poster-badge">' + escapeHtml(movie.duration) + '</span>' +
                        '<div class="card-overlay">▶ 立即播放</div>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<div class="card-category">' + escapeHtml(movie.category) + '</div>' +
                        '<h3 class="line-clamp-2">' + escapeHtml(movie.title) + '</h3>' +
                        '<p class="line-clamp-2">' + escapeHtml(movie.description) + '</p>' +
                        '<div class="meta-row">' +
                            '<span>👁 ' + formatViews(movie.views) + '</span>' +
                            '<span>⭐ ' + escapeHtml(movie.rating) + '</span>' +
                            '<span>' + escapeHtml(movie.year) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatViews(value) {
        var number = Number(value || 0);
        if (number >= 10000) {
            return (number / 10000).toFixed(1) + '万';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'k';
        }
        return String(number);
    }

    ready(function () {
        document.querySelectorAll('[data-mobile-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                var panel = document.querySelector('[data-mobile-panel]');
                if (panel) {
                    panel.classList.toggle('is-open');
                }
            });
        });

        document.querySelectorAll('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var keyword = input ? input.value.trim() : '';
                if (!keyword) {
                    event.preventDefault();
                    return;
                }
            });
        });

        var filterInput = document.querySelector('[data-filter-input]');
        if (filterInput) {
            filterInput.addEventListener('input', function () {
                var keyword = filterInput.value.trim().toLowerCase();
                document.querySelectorAll('[data-card]').forEach(function (card) {
                    var text = (card.getAttribute('data-text') || card.textContent || '').toLowerCase();
                    card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
                });
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var searchResults = document.querySelector('[data-search-results]');
        if (searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
            var params = new URLSearchParams(window.location.search);
            var q = (params.get('q') || '').trim();
            var queryInput = document.querySelector('[data-search-query]');
            if (queryInput) {
                queryInput.value = q;
                queryInput.addEventListener('input', function () {
                    renderSearch(queryInput.value.trim());
                });
            }
            renderSearch(q);
        }

        function renderSearch(keyword) {
            var lower = keyword.toLowerCase();
            var data = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                if (!lower) {
                    return true;
                }
                var haystack = [movie.title, movie.description, movie.year, movie.region, movie.genre, movie.type, movie.category, movie.tags].join(' ').toLowerCase();
                return haystack.indexOf(lower) !== -1;
            }).slice(0, 200);

            if (!data.length) {
                searchResults.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>请尝试更换关键词，或返回分类页继续浏览。</p></div>';
                return;
            }
            searchResults.innerHTML = '<div class="movie-grid compact">' + data.map(function (movie) {
                return cardTemplate(movie, '');
            }).join('') + '</div>';
        }
    });
})();
