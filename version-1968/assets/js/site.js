(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".nav-menu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
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

            function show(index) {
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

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var input = document.querySelector(".movie-search-input");
        if (input) {
            var scope = input.closest(".section-wrap") ? document : document;
            var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-list [data-title], .searchable-list .movie-card"));
            var status = document.querySelector(".search-status");

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function getText(item) {
                return normalize(item.getAttribute("data-title") || item.textContent);
            }

            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                var shown = 0;
                items.forEach(function (item) {
                    var matched = !keyword || getText(item).indexOf(keyword) !== -1;
                    item.classList.toggle("hidden-by-search", !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                if (status) {
                    status.textContent = keyword ? "已筛选出 " + shown + " 条相关内容" : "";
                }
            });
        }
    });
})();
