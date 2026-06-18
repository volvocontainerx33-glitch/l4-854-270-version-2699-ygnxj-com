(function () {
  function setupPlayer() {
    var video = document.querySelector('[data-hls-video]');
    var button = document.querySelector('[data-video-play]');
    var message = document.querySelector('[data-player-message]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;
      setMessage('正在初始化播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
          video.play().catch(function () {
            setMessage('浏览器已阻止自动播放，请再次点击播放按钮。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源暂时无法加载，请稍后重试。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setMessage('');
        }, { once: true });
      } else {
        video.src = source;
        setMessage('当前浏览器将尝试直接播放 m3u8 地址。');
      }
    }

    function playVideo() {
      attachSource();
      button.classList.add('is-hidden');
      video.play().catch(function () {
        button.classList.remove('is-hidden');
      });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
