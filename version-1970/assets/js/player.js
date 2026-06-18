(function () {
  function safePlay(video) {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  window.initMoviePlayer = function (options) {
    var video = document.querySelector(options.videoSelector);
    var trigger = document.querySelector(options.triggerSelector);
    var message = document.querySelector(options.messageSelector);
    var sourceUrl = options.url;
    var started = false;
    var hls = null;

    if (!video || !trigger || !sourceUrl) {
      return;
    }

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function hideCover() {
      trigger.classList.add("is-hidden");
    }

    function startPlayback() {
      hideCover();
      safePlay(video);
    }

    function load() {
      if (started) {
        startPlayback();
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", startPlayback, { once: true });
        video.load();
      } else {
        showMessage();
      }
    }

    trigger.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (!started) {
        load();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
