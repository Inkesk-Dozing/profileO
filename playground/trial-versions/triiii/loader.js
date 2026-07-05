(function () {
  var loaderEl     = document.getElementById('loader');
  var loaderNumber = document.getElementById('loader-number');
  var loaderTitle  = document.getElementById('loader-title');

  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';

  var isMob = window.innerWidth <= 768;
  var titleText  = 'WHAT IF GEORGE ORWELL HAD A WEBSITE';
  var titleIndex = 0;

  function startTypewriter(callback) {
    var speed = isMob ? 30 : 55;
    var interval = setInterval(function () {
      if (titleIndex < titleText.length) {
        loaderTitle.textContent += titleText[titleIndex++];
      } else {
        clearInterval(interval);
        setTimeout(callback, 400);
      }
    }, speed);
  }

  var numbers  = [0, 19, 84, 100];
  var numIndex = 0;
  loaderNumber.textContent = '';

  function showNumber(num, callback) {
    var staggerIn  = isMob ? 0.08 : 0.15;
    var staggerOut = isMob ? 0.05 : 0.10;

    function animateIn() {
      loaderNumber.innerHTML = String(num).split('').map(function (d) {
        return '<span style="display:inline-block">' + d + '</span>';
      }).join('');
      var spans = loaderNumber.querySelectorAll('span');
      window.gsap.set(spans, { clipPath: 'inset(100% 0 0% 0)', y: 60 });
      window.gsap.to(spans, {
        clipPath: 'inset(0% 0 0% 0)', y: 0,
        duration: 0.5, ease: 'power3.out', stagger: staggerIn,
        onComplete: callback
      });
    }

    var existing = loaderNumber.querySelectorAll('span');
    if (existing.length > 0) {
      window.gsap.to(existing, {
        clipPath: 'inset(0 0 100% 0)', y: -40,
        duration: 0.4, ease: 'power3.in', stagger: staggerOut,
        onComplete: animateIn
      });
    } else {
      animateIn();
    }
  }

  // ── Rendezvous with index.js ──────────────────────────────
  var _animDone    = false;
  var _handPromise = null;
  var _hiding      = false;

  function tryHide() {
    if (!_animDone || _hiding) return;
    _hiding = true;
    var timeout = new Promise(function (r) { setTimeout(r, 5000); });
    Promise.race([_handPromise || Promise.resolve(), timeout]).then(doHide);
  }

  function doHide() {
    var W = window.innerWidth;
    var H = window.innerHeight;

    var glitch = document.createElement('canvas');
    glitch.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;pointer-events:none;';
    glitch.width  = W;
    glitch.height = H;
    document.body.appendChild(glitch);
    var ctx = glitch.getContext('2d');

    var start = Date.now();
    var DURATION = 620;

    function frame() {
      var t    = Math.min(1, (Date.now() - start) / DURATION);
      var ease = t * t; // quadratic — slow build, explosive finish

      ctx.clearRect(0, 0, W, H);

      // Horizontal strip displacement — the core glitch
      var bars = Math.floor(4 + ease * 20);
      for (var i = 0; i < bars; i++) {
        var y  = Math.random() * H;
        var h  = 1 + Math.random() * (ease * 55);
        var dx = (Math.random() - 0.5) * ease * 160;

        // Black strip — content displacement
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, y, W, h);

        // Red channel left — RGB split
        if (Math.random() < 0.65) {
          ctx.fillStyle = 'rgba(204,0,0,' + (Math.random() * 0.6 * ease) + ')';
          ctx.fillRect(dx - 6, y, W, h);
        }
        // Cold cyan channel right — RGB split
        if (Math.random() < 0.55) {
          ctx.fillStyle = 'rgba(180,230,255,' + (Math.random() * 0.45 * ease) + ')';
          ctx.fillRect(dx + 9, y, W, h);
        }
      }

      // Bright white scan lines
      if (Math.random() < ease * 0.45) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + Math.random() * 0.6) + ')';
        ctx.fillRect(0, Math.random() * H, W, Math.random() < 0.6 ? 1 : 2);
      }

      // Fade the actual loader behind the canvas in the second half
      if (t > 0.48) {
        loaderEl.style.opacity = String(Math.max(0, 1 - (t - 0.48) * 1.92));
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // Hard cut to black, then reveal
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        loaderEl.style.opacity = '0';
        setTimeout(function () {
          if (glitch.parentNode) glitch.parentNode.removeChild(glitch);
          loaderEl.style.display = 'none';
          document.body.style.overflow = '';
          if (window.lenis) window.lenis.start();
          if (window._onLoaderHidden) window._onLoaderHidden();
        }, 55);
      }
    }

    frame();
  }

  // index.js calls this as soon as handLoadPromise is created
  window._loaderSetHandPromise = function (p) {
    _handPromise = p;
    tryHide();
  };
  // ─────────────────────────────────────────────────────────

  function runNumbers() {
    if (numIndex >= numbers.length) return;
    var num  = numbers[numIndex++];
    var wait = isMob ? 300 : 600;

    showNumber(num, function () {
      if (num === 100) {
        window.gsap.to(loaderNumber, {
          color: '#cc0000', duration: 0.3, delay: 0.2,
          onComplete: function () {
            setTimeout(function () { _animDone = true; tryHide(); }, 300);
          }
        });
      } else {
        setTimeout(runNumbers, wait);
      }
    });
  }

  startTypewriter(function () { runNumbers(); });
})();