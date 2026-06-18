(function () {
  function attachSource(video, sourceUrl, onReady) {
    if (!sourceUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = sourceUrl;
      }
      onReady();
      return;
    }
    var Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new Hls({ enableWorker: true });
        video._hlsInstance = hls;
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
          hls.on(Hls.Events.MANIFEST_PARSED, onReady);
        } else {
          window.setTimeout(onReady, 350);
        }
      } else {
        onReady();
      }
      return;
    }
    if (!video.src) {
      video.src = sourceUrl;
    }
    onReady();
  }

  function setupPlayer(frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.play-overlay');
    if (!video || !overlay) {
      return;
    }
    var sourceUrl = video.getAttribute('data-src') || '';
    var started = false;
    function startPlayback() {
      attachSource(video, sourceUrl, function () {
        started = true;
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    }
    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
