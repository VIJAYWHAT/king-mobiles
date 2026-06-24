/* ─────────────────────────────
 LOADER
───────────────────────────── */
window.addEventListener("load", function () {
  const tl = gsap.timeline({
    onComplete: function () {
      gsap.to("#loader", {
        opacity: 0,
        // duration: 0.6,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: function () {
          document.getElementById("loader").style.display = "none";
          document.body.style.overflow = "";
          initHero();
        },
      });
    },
  });
  document.body.style.overflow = "hidden";
  tl.to(
    "#loader-king",
    // { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.3,
    { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" },
    0.3,
  )
    .to(
      "#loader-line",
      // { width: "100%", duration: 0.6, ease: "power2.inOut" },0.8,
      { width: "100%", duration: 0.2, ease: "power2.inOut" },
      0.4,
    )
    .to(
      "#loader-mobiles",
      // { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },1.0,
      { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" },
      0.4,
    )
    .to(
      "#loader-tagline",
      // { opacity: 1, duration: 0.5, ease: "power2.out" },1.4,
      { opacity: 1, duration: 0.2, ease: "power2.out" },
      0.4,
    )
    // .to({}, { duration: 0.8 }, 1.8);
    .to({}, { duration: 0.2 }, 0.3);
});

/* ─────────────────────────────
 HERO ANIMATIONS
───────────────────────────── */
function initHero() {
  gsap.to("#h-eyebrow", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    delay: 0.1,
  });
  gsap.to("#h-heading", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.3,
  });
  gsap.to("#h-sub", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    delay: 0.5,
  });
  gsap.to("#h-ctas", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power3.out",
    delay: 0.65,
  });
  gsap.to("#h-trust", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power3.out",
    delay: 0.8,
  });
  initThree();
  AOS.init({
    once: true,
    offset: 80,
    duration: 650,
    easing: "ease-out-cubic",
  });
  initWhyCards();
  initBrandSection();
  initProductSection();
  initAccessoriesSection();
  initServices();
}

function initWhyCards() {
  var whySection = document.getElementById("why");
  if (!whySection) return;

  var whyCards = whySection.querySelectorAll(".why-card");

  var revealed = false;
  var whyObserver = new IntersectionObserver(
    function (entries) {
      if (revealed || !entries[0].isIntersecting) return;
      revealed = true;
      whyCards.forEach(function (card, index) {
        window.setTimeout(function () {
          card.classList.add("why-card-visible");
        }, index * 140);
      });
      whyObserver.disconnect();
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
  );

  whyObserver.observe(whySection);
}

function initBrandSection() {
  var brandsSection = document.getElementById("brands");
  if (!brandsSection) return;

  var carouselWrap = brandsSection.querySelector(".brands-carousel-wrap");
  var brandCards = brandsSection.querySelectorAll(".brand-card");

  var revealed = false;
  var brandsObserver = new IntersectionObserver(
    function (entries) {
      if (revealed || !entries[0].isIntersecting) return;
      revealed = true;

      if (carouselWrap) {
        window.setTimeout(function () {
          carouselWrap.classList.add("brand-section-visible");
        }, 0);
      }

      brandCards.forEach(function (card, index) {
        window.setTimeout(function () {
          card.classList.add("brand-card-visible");
        }, 180 + index * 120);
      });

      brandsObserver.disconnect();
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  brandsObserver.observe(brandsSection);
}

function initProductSection() {
  var productsSection = document.getElementById("products");
  if (!productsSection) return;

  var productCards = productsSection.querySelectorAll(".product-card");

  var revealed = false;
  var productsObserver = new IntersectionObserver(
    function (entries) {
      if (revealed || !entries[0].isIntersecting) return;
      revealed = true;

      productCards.forEach(function (card, index) {
        window.setTimeout(function () {
          card.classList.add("product-card-visible");
        }, index * 120);
      });

      productsObserver.disconnect();
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  productsObserver.observe(productsSection);
}

function initAccessoriesSection() {
  var accessoriesSection = document.getElementById("accessories");
  if (!accessoriesSection) return;

  var accessoryCards = accessoriesSection.querySelectorAll(".acc-card");

  var revealed = false;
  var accessoriesObserver = new IntersectionObserver(
    function (entries) {
      if (revealed || !entries[0].isIntersecting) return;
      revealed = true;

      accessoryCards.forEach(function (card, index) {
        window.setTimeout(function () {
          card.classList.add("acc-card-visible");
        }, index * 120);
      });

      accessoriesObserver.disconnect();
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  accessoriesObserver.observe(accessoriesSection);
}

/* ─────────────────────────────
SERVICES SECTION DYNAMIC LOADING & TRANSITION
───────────────────────────── */
function initServices() {
  const servicesContainer = document.getElementById("services-list-container");
  const detailContent = document.getElementById("service-detail-content");
  const serviceImg = document.getElementById("service-img");
  const servicePlaceholder = document.getElementById("service-img-placeholder");
  const serviceTitle = document.getElementById("service-title");
  const serviceDesc = document.getElementById("service-desc");
  const serviceBadges = document.getElementById("service-sim-badges");
  const serviceWaBtn = document.getElementById("service-wa-btn");

  if (!servicesContainer) return;

  // Fallback data in JSON format for offline/file:// protocol execution to bypass CORS restrictions
  const fallbackData = {
    "default": {
      "title": "Fast, Reliable & Honest Repair Service",
      "description": "Our experienced technicians handle all brands and models. We diagnose accurately, quote transparently, and repair quickly — usually same day for most issues.",
      "image": "images/service-default.png",
      "waMessage": "Hello King Mobiles, I need a mobile repair service...",
      "showBadges": false
    },
    "services": [
      {
        "id": "repair",
        "name": "Mobile Repair",
        "title": "Mobile Repair",
        "description": "Professional repair services for all hardware issues including charging port fixes, battery replacements, microphone repairs, speaker changes, and motherboard issues. We use premium replacement parts and offer warranty.",
        "image": "images/service-repair.png",
        "waMessage": "Hello King Mobiles, I need a mobile repair service...",
        "showBadges": false
      },
      {
        "id": "screen",
        "name": "Screen Replacement",
        "title": "Screen Replacement",
        "description": "High-quality screen replacements for all smartphone brands. We resolve issues like cracked glass, unresponsive touch screens, black screens, or display bleeding. Includes a free tempered glass!",
        "image": "images/service-screen.png",
        "waMessage": "Hello King Mobiles, I need a screen replacement service...",
        "showBadges": false
      },
      {
        "id": "glass",
        "name": "Tempered Glass Replacement",
        "title": "Tempered Glass Replacement",
        "description": "Premium 9H hardness tempered glass installation to protect your display from drops and scratches. We ensure bubble-free application with precise fit for all models.",
        "image": "images/service-glass.png",
        "waMessage": "Hello King Mobiles, I need a tempered glass replacement...",
        "showBadges": false
      },
      {
        "id": "software",
        "name": "Software Flashing & Change",
        "title": "Software Flashing & Change",
        "description": "Fix bootloops, system lag, and software errors with official firmware flashing. We also assist with OS updates, data backup, and resolving software glitches.",
        "image": "images/service-software.png",
        "waMessage": "Hello King Mobiles, I need a software flashing service...",
        "showBadges": false
      },
      {
        "id": "unlocking",
        "name": "Mobile Unlocking",
        "title": "Mobile Unlocking",
        "description": "Safe and secure mobile unlocking for pattern, PIN, password, or network/carrier locks. Get access to your phone or use it with any carrier worldwide.",
        "image": "images/service-unlocking.png",
        "waMessage": "Hello King Mobiles, I need a mobile unlocking service...",
        "showBadges": false
      },
      {
        "id": "sim",
        "name": "New SIM Card Activation",
        "title": "New SIM Card Activation",
        "description": "Get a new prepaid or postpaid SIM card activated instantly. We support Airtel, Jio, and Vi with quick Aadhaar-based digital KYC process.",
        "image": "images/service-sim.png",
        "waMessage": "Hello King Mobiles, I want to activate a new SIM card...",
        "showBadges": true
      },
      {
        "id": "porting",
        "name": "SIM Operator Change",
        "title": "SIM Operator Change",
        "description": "Switch your current mobile operator to Airtel, Jio, or Vi without changing your mobile number. Benefit from exciting port-in offers and high-speed data plans.",
        "image": "images/service-porting.png",
        "waMessage": "Hello King Mobiles, I want to port my SIM to another operator...",
        "showBadges": true
      },
      {
        "id": "dth",
        "name": "Sundirect DTH Recharge",
        "title": "Sundirect DTH Recharge",
        "description": "Quick and hassle-free Sundirect DTH recharging services. Renew your monthly packs, add channels, or upgrade packages instantly in-store or via WhatsApp.",
        "image": "images/service-dth.png",
        "waMessage": "Hello King Mobiles, I want to recharge my Sundirect DTH...",
        "showBadges": false
      }
    ]
  };

  // Set up image load helper
  serviceImg.onload = function () {
    serviceImg.style.display = "block";
    servicePlaceholder.style.display = "none";
  };

  serviceImg.onerror = function () {
    serviceImg.style.display = "none";
    servicePlaceholder.style.display = "flex";
  };

  let activeServiceId = null;
  let previousActiveServiceId = null;
  let servicesData = fallbackData;

  // Attempt to load from external JSON
  fetch("services.json")
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      servicesData = data;
      renderUI();
    })
    .catch(err => {
      console.warn("Could not load services.json (likely file:// protocol CORS). Using dynamic fallback copy.", err);
      renderUI();
    });

  function renderUI() {
    servicesContainer.innerHTML = "";
    servicesData.services.forEach(service => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "service-item";
      itemDiv.setAttribute("data-service", service.id);
      itemDiv.innerHTML = `
        <div class="service-dot"></div>
        <div class="service-name">${service.name}</div>
      `;

      itemDiv.addEventListener("click", () => {
        handleServiceSelection(service.id);
      });

      servicesContainer.appendChild(itemDiv);
    });

    // Show default item on start
    updateDetailPanel(servicesData.default);
  }

  function handleServiceSelection(serviceId) {
    const items = servicesContainer.querySelectorAll(".service-item");
    const clickedItem = Array.from(items).find(el => el.getAttribute("data-service") === serviceId);

    previousActiveServiceId = activeServiceId;

    if (activeServiceId === serviceId) {
      // Deselect
      activeServiceId = null;
      items.forEach(el => el.classList.remove("active"));
      animateTransition(servicesData.default, null);
    } else {
      // Select new
      activeServiceId = serviceId;
      items.forEach(el => {
        if (el.getAttribute("data-service") === serviceId) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
      const selectedService = servicesData.services.find(s => s.id === serviceId);
      animateTransition(selectedService, clickedItem);
    }
  }

  function animateTransition(data, targetItem) {
    // Calculate offset of the previous active item
    let exitYDiff = 0;
    if (previousActiveServiceId) {
      const prevItemEl = servicesContainer.querySelector(`.service-item[data-service="${previousActiveServiceId}"]`);
      if (prevItemEl) {
        const rectItem = prevItemEl.getBoundingClientRect();
        const rectDetail = detailContent.getBoundingClientRect();
        exitYDiff = (rectItem.top + rectItem.height / 2) - (rectDetail.top + rectDetail.height / 2);
      }
    }

    // Apply exit animation:
    detailContent.style.transition = "opacity 0.22s cubic-bezier(0.25, 1, 0.5, 1), transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)";
    detailContent.style.opacity = "0";

    if (targetItem === null) {
      // Deselect: Slide-out towards the active item to the left
      detailContent.style.transform = `translate(-100px, ${exitYDiff}px) scale(0.95)`;
    } else {
      // Item change: Just fade out in-place (no horizontal slide-out)
      detailContent.style.transform = "scale(0.98)";
    }

    setTimeout(() => {
      // Update contents while invisible
      updateDetailPanel(data);

      // Calculate offset of the new target item to slide-in from it
      let entryYDiff = 0;
      if (targetItem) {
        const rectItem = targetItem.getBoundingClientRect();
        const rectDetail = detailContent.getBoundingClientRect();
        entryYDiff = (rectItem.top + rectItem.height / 2) - (rectDetail.top + rectDetail.height / 2);
      }

      // Disable transition to instantly position at starting point
      detailContent.style.transition = "none";
      detailContent.style.opacity = "0";
      detailContent.style.transform = `translate(-100px, ${entryYDiff}px) scale(0.95)`;
      detailContent.style.transformOrigin = "left center";

      // Force reflow
      detailContent.offsetHeight;

      // Enable transition and animate in to center with premium easing
      detailContent.style.transition = "opacity 0.48s cubic-bezier(0.16, 1, 0.3, 1), transform 0.48s cubic-bezier(0.16, 1, 0.3, 1)";
      detailContent.style.opacity = "1";
      detailContent.style.transform = "translate(0, 0) scale(1)";
    }, 220);
  }

  function updateDetailPanel(data) {
    // Update image
    if (data.image) {
      serviceImg.src = data.image;
      // Trigger onload manually in case it was already loaded/cached
      if (serviceImg.complete) {
        serviceImg.onload();
      }
    } else {
      serviceImg.style.display = "none";
      servicePlaceholder.style.display = "flex";
    }

    // Update texts
    serviceTitle.textContent = data.title;
    serviceDesc.textContent = data.description;

    // Update badges
    if (data.showBadges) {
      serviceBadges.style.display = "flex";
    } else {
      serviceBadges.style.display = "none";
    }

    // Update WhatsApp link
    const phone = "917339480350";
    const encodedText = encodeURIComponent(data.waMessage);
    serviceWaBtn.href = `https://wa.me/${phone}?text=${encodedText}`;
  }
}

/* ─────────────────────────────
 NAV SCROLL
───────────────────────────── */
var navbar = document.getElementById("navbar");
window.addEventListener(
  "scroll",
  function () {
    if (window.scrollY > 60) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  },
  { passive: true },
);

/* ─────────────────────────────
 HAMBURGER
───────────────────────────── */
var hamburger = document.getElementById("hamburger");
var navMobile = document.getElementById("nav-mobile");
function syncMobileNavPosition() {
  if (!navMobile) return;
  var navbarRect = navbar.getBoundingClientRect();
  navMobile.style.top = navbarRect.bottom + "px";
  navMobile.style.maxHeight = "calc(100vh - " + navbarRect.bottom + "px)";
}

hamburger.addEventListener("click", function () {
  syncMobileNavPosition();
  navMobile.classList.toggle("open");
});
document.querySelectorAll(".nav-m-link").forEach(function (link) {
  link.addEventListener("click", function () {
    navMobile.classList.remove("open");
  });
});

/* ─────────────────────────────
 BANNER CLOSE
───────────────────────────── */
document
  .getElementById("banner-close")
  .addEventListener("click", function () {
    var banner = document.getElementById("offer-banner");
    var navbar = document.getElementById("navbar");
    var body = document.body;
    gsap.to(banner, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: function () {
        banner.style.display = "none";
      },
    });
    gsap.to(navbar, {
      top: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: syncMobileNavPosition,
    });
    gsap.to(body, {
      paddingTop: "68px",
      duration: 0.3,
      ease: "power2.in",
    });
  });

window.addEventListener("resize", function () {
  if (navMobile.classList.contains("open")) syncMobileNavPosition();
});

/* ─────────────────────────────
 STATS COUNTER
───────────────────────────── */
function animateCounter(el) {
  var target = parseInt(el.dataset.target);
  var suffix = el.dataset.suffix || "";
  var start = 0;
  var duration = 2000;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var val = Math.round(eased * target);
    el.textContent = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}
var countersDone = false;
var statsSection = document.getElementById("stats");
var counterObserver = new IntersectionObserver(
  function (entries) {
    if (entries[0].isIntersecting && !countersDone) {
      countersDone = true;
      document.querySelectorAll(".stat-num").forEach(function (el) {
        animateCounter(el);
      });
    }
  },
  { threshold: 0.3 },
);
counterObserver.observe(statsSection);

/* ─────────────────────────────
 COUNTDOWN TIMERS
───────────────────────────── */
function buildCountdown(containerId, hoursFromNow) {
  var endTime = Date.now() + hoursFromNow * 3600 * 1000;
  function render() {
    var diff = Math.max(0, endTime - Date.now());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML =
      '<div class="cd-block"><div class="cd-num">' +
      String(h).padStart(2, "0") +
      '</div><div class="cd-label">HRS</div></div>' +
      '<div class="cd-block"><div class="cd-num">' +
      String(m).padStart(2, "0") +
      '</div><div class="cd-label">MIN</div></div>' +
      '<div class="cd-block"><div class="cd-num">' +
      String(s).padStart(2, "0") +
      '</div><div class="cd-label">SEC</div></div>';
  }
  render();
  setInterval(render, 1000);
}
buildCountdown("cd1", 24);
buildCountdown("cd2", 48);
buildCountdown("cd3", 16);
// ========================
// AOS INIT
// ========================
AOS.init({ once: true, offset: 80, duration: 600 });

/* ─────────────────────────────
 SWIPER INIT
───────────────────────────── */
// ========================
// SWIPER — BRANDS
// ========================
new Swiper(".swiper-brands", {
  loop: true,
  speed: 3000,
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
  },
  slidesPerView: "auto",
  spaceBetween: 0,
  allowTouchMove: false,
  freeMode: true,
  breakpoints: {
    320: { slidesPerView: 3 },
    480: { slidesPerView: 4 },
    768: { slidesPerView: 5 },
    1024: { slidesPerView: 7 },
  },
});

// ========================
// SWIPER — TESTIMONIALS
// ========================
const fallbackReviewsData = [
  {
    "stars": "★★★★★",
    "text": "\"Best mobile shop in Uchipuli! Got my screen replaced in under an hour. The staff was very helpful and the price was reasonable. Definitely recommending to everyone.\"",
    "avatar": "RK",
    "name": "Ravi Kumar",
    "verified": "✓ Verified Customer"
  },
  {
    "stars": "★★★★★",
    "text": "\"Bought a boAt earbuds and they gave me original packaging with all accessories. Very genuine shop. I also got my Jio SIM activated the same day. Great service!\"",
    "avatar": "PM",
    "name": "Priya M.",
    "verified": "✓ Verified Customer"
  },
  {
    "stars": "★★★★★",
    "text": "\"My phone had software issue and they fixed it perfectly. Very knowledgeable staff. Good collection of mobiles and accessories. Prices are competitive too.\"",
    "avatar": "SA",
    "name": "Senthil A.",
    "verified": "✓ Verified Customer"
  },
  {
    "stars": "★★★★★",
    "text": "\"Excellent shop with genuine products. I purchased an itel smartphone and they helped me set it up nicely. After-sales support is also very good.\"",
    "avatar": "MJ",
    "name": "Muthu J.",
    "verified": "✓ Verified Customer"
  },
  {
    "stars": "★★★★★",
    "text": "\"King Mobiles is my go-to shop for everything mobile. From small accessories to phone repairs — they handle everything professionally. Highly recommended!\"",
    "avatar": "LV",
    "name": "Lakshmi V.",
    "verified": "✓ Verified Customer"
  }
];

fetch("reviews.json")
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then(reviewsData => {
    renderReviews(reviewsData);
  })
  .catch(err => {
    console.warn("Could not load reviews.json (likely file:// protocol CORS). Using fallback copy.", err);
    renderReviews(fallbackReviewsData);
  });

function renderReviews(data) {
  const reviewsWrapper = document.getElementById("reviews-wrapper");
  if (reviewsWrapper) {
    reviewsWrapper.innerHTML = "";
    data.forEach(review => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `
        <div class="review-card">
          <div class="review-stars">${review.stars}</div>
          <div class="review-text">${review.text}</div>
          <div class="review-author">
            <div class="review-avatar">${review.avatar}</div>
            <div>
              <div class="review-name">${review.name}</div>
              <div class="review-verified">${review.verified}</div>
            </div>
          </div>
        </div>
      `;
      reviewsWrapper.appendChild(slide);
    });
  }

  new Swiper(".swiper-reviews", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: { el: ".swiper-pagination", clickable: true },
    breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
  });
}

/* ─────────────────────────────
THREE.JS HERO PARTICLE FIELD
───────────────────────────── */
function initThree() {
  if (window.matchMedia("(max-width: 768px)").matches) return;
  var canvas = document.getElementById("hero-canvas");
  var renderer, scene, camera, particles, animId;

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    var count = 300;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
      color: 0xd4a017,
      size: 0.8,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    function animate() {
      animId = requestAnimationFrame(animate);
      var pos = geometry.attributes.position.array;
      for (var i = 1; i < pos.length; i += 3) {
        pos[i] += 0.01;
        if (pos[i] > 100) pos[i] = -100;
      }
      geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (e) {
    if (canvas) canvas.style.display = "none";
  }
}

/* ─────────────────────────────
FAQ ACCORDION
───────────────────────────── */
document.querySelectorAll(".faq-q").forEach(function (q) {
  q.addEventListener("click", function () {
    var item = q.parentElement;
    var answer = item.querySelector(".faq-a");
    var isOpen = item.classList.contains("open");
    document
      .querySelectorAll(".faq-item.open")
      .forEach(function (openItem) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-a").style.maxHeight = "0";
      });
    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

/* ─────────────────────────────
 CONTACT FORM
───────────────────────────── */
function submitForm() {
  var name = document.getElementById("f-name").value.trim();
  var phone = document.getElementById("f-phone").value.trim();
  var msg = document.getElementById("f-msg").value.trim();
  if (!name || !msg) {
    alert("Please fill in your name and message.");
    return;
  }
  var waMsg =
    "Hello King Mobiles,%0AName: " +
    encodeURIComponent(name) +
    "%0APhone: " +
    encodeURIComponent(phone) +
    "%0AMessage: " +
    encodeURIComponent(msg);
  window.open("https://wa.me/917339480350?text=" + waMsg, "_blank");
}

/* ─────────────────────────────
 GALLERY HOVER
───────────────────────────── */
document.querySelectorAll(".gallery-item").forEach(function (item) {
  var overlay = item.querySelector(".gallery-overlay");
  if (overlay) {
    item.addEventListener("mouseenter", function () {
      overlay.style.opacity = "1";
    });
    item.addEventListener("mouseleave", function () {
      overlay.style.opacity = "0";
    });
  }
});

/* ─────────────────────────────
 SMOOTH ANCHOR SCROLL
───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    var target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
