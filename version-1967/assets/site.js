(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var opened = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
        });
      }

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(index + 1);
        }, 5600);
      }
    }

    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var emptyState = document.querySelector("[data-empty-state]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var activeFilter = "all";

    function setInitialQuery() {
      if (!input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var category = card.getAttribute("data-category") || "";
        var queryMatch = !query || text.indexOf(query) !== -1;
        var filterMatch = activeFilter === "all" || category === activeFilter;
        var matched = queryMatch && filterMatch;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    setInitialQuery();

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });

    applyFilters();

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector("[data-play-button]");
      if (!video || !playButton) {
        return;
      }

      var source = video.getAttribute("data-video-url");
      var streamPromise = null;
      var hlsInstance = null;

      function attachStream() {
        if (streamPromise) {
          return streamPromise;
        }

        streamPromise = new Promise(function (resolve) {
          if (!source) {
            resolve();
            return;
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", resolve, { once: true });
            window.setTimeout(resolve, 900);
            return;
          }

          var HlsConstructor = window.Hls;
          if (HlsConstructor && HlsConstructor.isSupported()) {
            hlsInstance = new HlsConstructor({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(HlsConstructor.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === HlsConstructor.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === HlsConstructor.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            });
            window.setTimeout(resolve, 1600);
          } else {
            video.src = source;
            resolve();
          }
        });

        return streamPromise;
      }

      function startPlayback() {
        player.classList.add("player-ready");
        attachStream().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              player.classList.add("player-ready");
            });
          }
        });
      }

      playButton.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("player-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("player-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
