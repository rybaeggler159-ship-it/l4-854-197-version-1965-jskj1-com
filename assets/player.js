(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll('[data-hls-player]').forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var button = wrap.querySelector('[data-player-button]');
            var message = wrap.querySelector('[data-player-message]');
            var source = wrap.getAttribute('data-src');
            var hlsInstance = null;
            var attached = false;
            var pendingPlay = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add('is-visible');
            }

            function hideButton() {
                if (button) {
                    button.classList.add('is-hidden');
                }
            }

            function attachSource() {
                if (attached || !video || !source) {
                    return true;
                }

                var Hls = window.StaticMovieHls;
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        attached = true;
                        if (pendingPlay) {
                            pendingPlay = false;
                            playVideo();
                        }
                    });
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('视频加载失败，请稍后重试。');
                            if (hlsInstance) {
                                hlsInstance.destroy();
                            }
                        }
                    });
                    return true;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    attached = true;
                    return true;
                }

                pendingPlay = true;
                window.addEventListener('hls-module-ready', function retryAttach() {
                    window.removeEventListener('hls-module-ready', retryAttach);
                    attachSource();
                });
                return false;
            }

            function playVideo() {
                if (!attachSource()) {
                    return;
                }
                var playPromise = video.play();
                hideButton();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', hideButton);
                video.addEventListener('pause', function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        });
    });
})();
