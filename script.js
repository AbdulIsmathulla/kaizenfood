/* ===== GALLERY SLIDER ===== */
(function () {
  const gallery = document.querySelector(".gallery");
  const items   = document.querySelectorAll(".gallery-item");
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");
  if (!gallery || !items.length) return;

  let index = 0;
  let autoSlide;

  function getItemWidth() {
    const item   = items[0];
    const style  = getComputedStyle(item);
    const margin = parseInt(style.marginRight) || 12;
    return item.offsetWidth + margin;
  }

  function getVisible() {
    const ww = document.querySelector(".gallery-wrapper").offsetWidth;
    return Math.max(1, Math.floor(ww / getItemWidth()));
  }

  function showSlide() {
    gallery.style.transform = `translateX(-${index * getItemWidth()}px)`;
  }

  function nextSlide() {
    const max = items.length - getVisible();
    index = index < max ? index + 1 : 0;
    showSlide();
  }

  function prevSlide() {
    const max = items.length - getVisible();
    index = index > 0 ? index - 1 : max;
    showSlide();
  }

  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  function startAuto() { autoSlide = setInterval(nextSlide, 2500); }
  function stopAuto()  { clearInterval(autoSlide); }

  gallery.addEventListener("mouseenter", stopAuto);
  gallery.addEventListener("mouseleave", startAuto);

  startAuto();
  window.addEventListener("resize", showSlide);
})();

/* ===== BACK TO TOP ===== */
(function () {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

/* ===== SCROLL ANIMATIONS ===== */
(function () {
  const els = document.querySelectorAll(".slide-top");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      } else {
        e.target.classList.remove("visible");
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  els.forEach(el => io.observe(el));
})();

/* ===== NAVBAR: shrink on scroll ===== */
(function () {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.style.background = window.scrollY > 60
      ? "rgba(10,10,10,0.97)"
      : "rgba(15,15,15,0.92)";
  });
})();

/* ===== BRANCH CARD HOVER GRADIENTS ===== */
(function () {
  const cards = document.querySelectorAll(".colorful-menu .menu-card");
  const gradients = [
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#42e695,#3bb2b8)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
    "linear-gradient(135deg,#84fab0,#8fd3f4)"
  ];
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.background = gradients[Math.floor(Math.random() * gradients.length)];
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "";
    });
  });
})();

/* ===== LOADER ===== */
(function () {
  const screen = document.getElementById("blackScreen");
  if (!screen) return;

  let stopped = false;

  function hide() {
    stopped = true;
    screen.style.transition = "opacity 0.8s ease";
    screen.style.opacity    = "0";
    setTimeout(() => { screen.style.display = "none"; }, 850);
  }

  window.addEventListener("load", () => setTimeout(hide, 3200));

  const closeBtn = document.getElementById("closeLoader");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      screen.style.transition = "opacity 0.4s ease";
      hide();
    });
  }

  /* ---- Fish logo hop animation inside the loader ---- */
  const stage  = document.getElementById("loaderFish");
  const object = document.getElementById("loaderObject");
  const shadow = document.getElementById("loaderShadow");
  if (!stage || !object || !shadow) return;

  const hopSettings = {
    hopsPerCrossing: 5,
    jumpDuration: 320,
    pauseBetweenHops: 70,
    pauseAtEnd: 280,
    jumpHeight: 34,
    edgePaddingPercent: 20,
    minShadowScale: 0.45,
    maxShadowScale: 1.0,
    minShadowOpacity: 0.12,
    maxShadowOpacity: 0.35,
    easing: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };

  let direction = 1;

  function bounds() {
    const w = stage.clientWidth;
    const pad = (hopSettings.edgePaddingPercent / 100) * w;
    return { left: pad, right: w - pad };
  }

  function positionAt(xPx, arcProgress) {
    const lift = Math.sin(Math.PI * arcProgress) * hopSettings.jumpHeight;
    object.style.left = xPx + "px";
    object.style.bottom = `calc(8px + ${lift}px)`;
    shadow.style.left = xPx + "px";

    const scale = hopSettings.maxShadowScale - (hopSettings.maxShadowScale - hopSettings.minShadowScale) * Math.sin(Math.PI * arcProgress);
    const fade  = hopSettings.maxShadowOpacity - (hopSettings.maxShadowOpacity - hopSettings.minShadowOpacity) * Math.sin(Math.PI * arcProgress);
    shadow.style.transform = `translate(-50%, 50%) scale(${scale})`;
    shadow.style.opacity = fade;
  }

  function hop(fromX, toX, onDone) {
    if (stopped) return;
    const start = performance.now();
    function frame(now) {
      if (stopped) return;
      let t = (now - start) / hopSettings.jumpDuration;
      if (t > 1) t = 1;
      const xPx = fromX + (toX - fromX) * hopSettings.easing(t);
      positionAt(xPx, t);
      if (t < 1) requestAnimationFrame(frame);
      else onDone();
    }
    requestAnimationFrame(frame);
  }

  function loop() {
    if (stopped) return;
    const b = bounds();
    const startX = direction === 1 ? b.left : b.right;
    const endX   = direction === 1 ? b.right : b.left;
    const step = (endX - startX) / hopSettings.hopsPerCrossing;

    let hopIndex = 0;
    let currentX = startX;

    function nextHop() {
      if (stopped) return;
      if (hopIndex >= hopSettings.hopsPerCrossing) {
        direction *= -1;
        setTimeout(loop, hopSettings.pauseAtEnd);
        return;
      }
      const from = currentX;
      const to = currentX + step;
      hop(from, to, () => {
        currentX = to;
        hopIndex++;
        setTimeout(nextHop, hopSettings.pauseBetweenHops);
      });
    }
    nextHop();
  }

  const b0 = bounds();
  positionAt(b0.left, 0);
  loop();
})();

/* =============================================================
   REGULAR / SMALL MENU FILTER
   Only runs on pages that actually have the filter buttons
   (i.e. full-menu.html). This guard is what fixes the bug where
   .menu-card elements on index.html and branch-location.html
   were being force-hidden (display:none) on every page load,
   because they have no data-size attribute and used to get
   caught by the old unconditional filterMenu("regular") call.
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".regular-button");

    // Guard: if this page has no filter buttons, do nothing at all.
    if (!buttons.length) return;

    const cards = document.querySelectorAll(".menu-card");

    function filterMenu(type) {
        cards.forEach(card => {
            // Guard: only touch cards that actually opted into filtering
            // (i.e. have a data-size attribute). Leave everything else alone.
            if (!card.dataset.size) return;

            card.style.display = (card.dataset.size === type) ? "block" : "none";
        });

        buttons.forEach(btn => btn.classList.remove("active"));
        const activeBtn = document.querySelector(`[data-filter="${type}"]`);
        if (activeBtn) activeBtn.classList.add("active");
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            filterMenu(button.dataset.filter);
        });
    });

    // Show Regular menu on page load
    filterMenu("regular");

});

// /* ===== GALLERY SLIDER ===== */
// (function () {
//   const gallery = document.querySelector(".gallery");
//   const items   = document.querySelectorAll(".gallery-item");
//   const nextBtn = document.querySelector(".next-btn");
//   const prevBtn = document.querySelector(".prev-btn");
//   if (!gallery || !items.length) return;

//   let index = 0;
//   let autoSlide;

//   function getItemWidth() {
//     const item   = items[0];
//     const style  = getComputedStyle(item);
//     const margin = parseInt(style.marginRight) || 12;
//     return item.offsetWidth + margin;
//   }

//   function getVisible() {
//     const ww = document.querySelector(".gallery-wrapper").offsetWidth;
//     return Math.max(1, Math.floor(ww / getItemWidth()));
//   }

//   function showSlide() {
//     gallery.style.transform = `translateX(-${index * getItemWidth()}px)`;
//   }

//   function nextSlide() {
//     const max = items.length - getVisible();
//     index = index < max ? index + 1 : 0;
//     showSlide();
//   }

//   function prevSlide() {
//     const max = items.length - getVisible();
//     index = index > 0 ? index - 1 : max;
//     showSlide();
//   }

//   nextBtn.addEventListener("click", nextSlide);
//   prevBtn.addEventListener("click", prevSlide);

//   function startAuto() { autoSlide = setInterval(nextSlide, 2500); }
//   function stopAuto()  { clearInterval(autoSlide); }

//   gallery.addEventListener("mouseenter", stopAuto);
//   gallery.addEventListener("mouseleave", startAuto);

//   startAuto();
//   window.addEventListener("resize", showSlide);
// })();

// /* ===== LOADER ===== */
// (function () {
//   const screen = document.getElementById("blackScreen");
//   if (!screen) return;

//   function hide() {
//     screen.style.transition = "opacity 0.8s ease";
//     screen.style.opacity    = "0";
//     setTimeout(() => { screen.style.display = "none"; }, 850);
//   }

//   window.addEventListener("load", () => setTimeout(hide, 3200));

//   const closeBtn = document.getElementById("closeLoader");
//   if (closeBtn) {
//     closeBtn.addEventListener("click", () => {
//       screen.style.transition = "opacity 0.4s ease";
//       hide();
//     });
//   }
// })();

// /* ===== BACK TO TOP ===== */
// (function () {
//   const btn = document.getElementById("backToTop");
//   if (!btn) return;

//   window.addEventListener("scroll", () => {
//     btn.style.display = window.scrollY > 300 ? "flex" : "none";
//   });

//   btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
// })();

// /* ===== SCROLL ANIMATIONS ===== */
// (function () {
//   const els = document.querySelectorAll(".slide-top");
//   if (!els.length) return;

//   const io = new IntersectionObserver((entries) => {
//     entries.forEach(e => {
//       if (e.isIntersecting) {
//         e.target.classList.add("visible");
//       } else {
//         e.target.classList.remove("visible");
//       }
//     });
//   }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

//   els.forEach(el => io.observe(el));
// })();

// /* ===== NAVBAR: shrink on scroll ===== */
// (function () {
//   const nav = document.getElementById("navbar");
//   if (!nav) return;
//   window.addEventListener("scroll", () => {
//     nav.style.background = window.scrollY > 60
//       ? "rgba(10,10,10,0.97)"
//       : "rgba(15,15,15,0.92)";
//   });
// })();

// /* ===== BRANCH CARD HOVER GRADIENTS ===== */
// (function () {
//   const cards = document.querySelectorAll(".colorful-menu .menu-card");
//   const gradients = [
//     "linear-gradient(135deg,#f093fb,#f5576c)",
//     "linear-gradient(135deg,#42e695,#3bb2b8)",
//     "linear-gradient(135deg,#f6d365,#fda085)",
//     "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
//     "linear-gradient(135deg,#84fab0,#8fd3f4)"
//   ];
//   cards.forEach(card => {
//     card.addEventListener("mouseenter", () => {
//       card.style.background = gradients[Math.floor(Math.random() * gradients.length)];
//     });
//     card.addEventListener("mouseleave", () => {
//       card.style.background = "";
//     });
//   });
// })();

// // ----------------------------------------- loader -------------------------------------------------------------
// /* ===== LOADER ===== */
// (function () {
//   const screen = document.getElementById("blackScreen");
//   if (!screen) return;

//   let stopped = false;

//   function hide() {
//     stopped = true;
//     screen.style.transition = "opacity 0.8s ease";
//     screen.style.opacity    = "0";
//     setTimeout(() => { screen.style.display = "none"; }, 850);
//   }

//   window.addEventListener("load", () => setTimeout(hide, 3200));

//   const closeBtn = document.getElementById("closeLoader");
//   if (closeBtn) {
//     closeBtn.addEventListener("click", () => {
//       screen.style.transition = "opacity 0.4s ease";
//       hide();
//     });
//   }

//   /* ---- Fish logo hop animation inside the loader ---- */
//   const stage  = document.getElementById("loaderFish");
//   const object = document.getElementById("loaderObject");
//   const shadow = document.getElementById("loaderShadow");
//   if (!stage || !object || !shadow) return;

//   const hopSettings = {
//     hopsPerCrossing: 5,
//     jumpDuration: 320,
//     pauseBetweenHops: 70,
//     pauseAtEnd: 280,
//     jumpHeight: 34,
//     edgePaddingPercent: 20,
//     minShadowScale: 0.45,
//     maxShadowScale: 1.0,
//     minShadowOpacity: 0.12,
//     maxShadowOpacity: 0.35,
//     easing: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
//   };

//   let direction = 1;

//   function bounds() {
//     const w = stage.clientWidth;
//     const pad = (hopSettings.edgePaddingPercent / 100) * w;
//     return { left: pad, right: w - pad };
//   }

//   function positionAt(xPx, arcProgress) {
//     const lift = Math.sin(Math.PI * arcProgress) * hopSettings.jumpHeight;
//     object.style.left = xPx + "px";
//     object.style.bottom = `calc(8px + ${lift}px)`;
//     shadow.style.left = xPx + "px";

//     const scale = hopSettings.maxShadowScale - (hopSettings.maxShadowScale - hopSettings.minShadowScale) * Math.sin(Math.PI * arcProgress);
//     const fade  = hopSettings.maxShadowOpacity - (hopSettings.maxShadowOpacity - hopSettings.minShadowOpacity) * Math.sin(Math.PI * arcProgress);
//     shadow.style.transform = `translate(-50%, 50%) scale(${scale})`;
//     shadow.style.opacity = fade;
//   }

//   function hop(fromX, toX, onDone) {
//     if (stopped) return;
//     const start = performance.now();
//     function frame(now) {
//       if (stopped) return;
//       let t = (now - start) / hopSettings.jumpDuration;
//       if (t > 1) t = 1;
//       const xPx = fromX + (toX - fromX) * hopSettings.easing(t);
//       positionAt(xPx, t);
//       if (t < 1) requestAnimationFrame(frame);
//       else onDone();
//     }
//     requestAnimationFrame(frame);
//   }

//   function loop() {
//     if (stopped) return;
//     const b = bounds();
//     const startX = direction === 1 ? b.left : b.right;
//     const endX   = direction === 1 ? b.right : b.left;
//     const step = (endX - startX) / hopSettings.hopsPerCrossing;

//     let hopIndex = 0;
//     let currentX = startX;

//     function nextHop() {
//       if (stopped) return;
//       if (hopIndex >= hopSettings.hopsPerCrossing) {
//         direction *= -1;
//         setTimeout(loop, hopSettings.pauseAtEnd);
//         return;
//       }
//       const from = currentX;
//       const to = currentX + step;
//       hop(from, to, () => {
//         currentX = to;
//         hopIndex++;
//         setTimeout(nextHop, hopSettings.pauseBetweenHops);
//       });
//     }
//     nextHop();
//   }

//   const b0 = bounds();
//   positionAt(b0.left, 0);
//   loop();
// })();
// // =============================small and regular=================================================
// document.addEventListener("DOMContentLoaded", () => {

//     const buttons = document.querySelectorAll(".regular-button");
//     const cards = document.querySelectorAll(".menu-card");

//     function filterMenu(type) {

//         cards.forEach(card => {
//             if (card.dataset.size === type) {
//                 card.style.display = "block";
//             } else {
//                 card.style.display = "none";
//             }
//         });

//         buttons.forEach(btn => btn.classList.remove("active"));
//         document
//             .querySelector(`[data-filter="${type}"]`)
//             .classList.add("active");
//     }

//     buttons.forEach(button => {
//         button.addEventListener("click", () => {
//             filterMenu(button.dataset.filter);
//         });
//     });

//     // Show Regular menu on page load
//     filterMenu("regular");

// });