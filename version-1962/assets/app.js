(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
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

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var searchInput = document.querySelector("[data-card-search]");
        var categorySelect = document.querySelector("[data-category-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        if (!cards.length || (!searchInput && !categorySelect)) {
            return;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var category = categorySelect ? categorySelect.value : "";
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatched = !category || cardCategory === category;
                card.classList.toggle("hidden", !(keywordMatched && categoryMatched));
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        if (categorySelect) {
            categorySelect.addEventListener("change", apply);
        }
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector(".player-start");
        var message = player.querySelector("[data-player-message]");
        var url = player.getAttribute("data-video");
        var loaded = false;
        var hls = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function loadVideo() {
            if (loaded || !video || !url) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("视频加载失败，请稍后再试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function playVideo() {
            loadVideo();
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.then === "function") {
                promise.then(function () {
                    player.classList.add("is-playing");
                    setMessage("");
                }).catch(function () {
                    setMessage("点击视频区域继续播放");
                });
            } else {
                player.classList.add("is-playing");
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
        if (video) {
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("error", function () {
                setMessage("视频加载失败，请稍后再试");
            });
        }
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
