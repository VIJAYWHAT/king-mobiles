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
 HAMBURGER & MOBILE NAV
───────────────────────────── */
var hamburger = document.getElementById("hamburger");
var navMobile = document.getElementById("nav-mobile");

function syncMobileNavPosition() {
  if (!navMobile || !navbar) return;
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

window.addEventListener("resize", function () {
  if (navMobile.classList.contains("open")) syncMobileNavPosition();
});

// Expose syncMobileNavPosition globally so animations.js can call it for banner close callbacks
window.syncMobileNavPosition = syncMobileNavPosition;

/* ─────────────────────────────
 SERVICES SECTION DYNAMIC LOADING & SELECTION
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
    default: {
      title: "Fast, Reliable & Honest Repair Service",
      description:
        "Our experienced technicians handle all brands and models. We diagnose accurately, quote transparently, and repair quickly — usually same day for most issues.",
      image: "assets/images/service_default.png",
      waMessage: "Hello King Mobiles, I need a mobile repair service...",
      showBadges: false,
    },
    services: [
      {
        id: "repair",
        name: "Mobile Repair",
        title: "Mobile Repair",
        description:
          "Professional repair services for all hardware issues including charging port fixes, battery replacements, microphone repairs, speaker changes, and motherboard issues. We use premium replacement parts and offer warranty.",
        image: "assets/images/service_repair.png",
        waMessage: "Hello King Mobiles, I need a mobile repair service...",
        showBadges: false,
      },
      {
        id: "screen",
        name: "Screen Replacement",
        title: "Screen Replacement",
        description:
          "High-quality screen replacements for all smartphone brands. We resolve issues like cracked glass, unresponsive touch screens, black screens, or display bleeding. Includes a free tempered glass!",
        image: "assets/images/service_screen.png",
        waMessage: "Hello King Mobiles, I need a screen replacement service...",
        showBadges: false,
      },
      {
        id: "glass",
        name: "Tempered Glass Replacement",
        title: "Tempered Glass Replacement",
        description:
          "Premium 9H hardness tempered glass installation to protect your display from drops and scratches. We ensure bubble-free application with precise fit for all models.",
        image: "assets/images/service_glass.png",
        waMessage: "Hello King Mobiles, I need a tempered glass replacement...",
        showBadges: false,
      },
      {
        id: "software",
        name: "Software Flashing & Change",
        title: "Software Flashing & Change",
        description:
          "Fix bootloops, system lag, and software errors with official firmware flashing. We also assist with OS updates, data backup, and resolving software glitches.",
        image: "assets/images/service_software.png",
        waMessage: "Hello King Mobiles, I need a software flashing service...",
        showBadges: false,
      },
      {
        id: "unlocking",
        name: "Mobile Unlocking",
        title: "Mobile Unlocking",
        description:
          "Safe and secure mobile unlocking for pattern, PIN, password, or network/carrier locks. Get access to your phone or use it with any carrier worldwide.",
        image: "assets/images/service_unlocking.png",
        waMessage: "Hello King Mobiles, I need a mobile unlocking service...",
        showBadges: false,
      },
      {
        id: "sim",
        name: "New SIM Card Activation",
        title: "New SIM Card Activation",
        description:
          "Get a new prepaid or postpaid SIM card activated instantly. We support Airtel, Jio, and Vi with quick Aadhaar-based digital KYC process.",
        image: "assets/images/service_sim.png",
        waMessage: "Hello King Mobiles, I want to activate a new SIM card...",
        showBadges: true,
      },
      {
        id: "porting",
        name: "SIM Operator Change",
        title: "SIM Operator Change",
        description:
          "Switch your current mobile operator to Airtel, Jio, or Vi without changing your mobile number. Benefit from exciting port-in offers and high-speed data plans.",
        image: "assets/images/service_porting.png",
        waMessage:
          "Hello King Mobiles, I want to port my SIM to another operator...",
        showBadges: true,
      },
      {
        id: "dth",
        name: "Sundirect DTH Recharge",
        title: "Sundirect DTH Recharge",
        description:
          "Quick and hassle-free Sundirect DTH recharging services. Renew your monthly packs, add channels, or upgrade packages instantly in-store or via WhatsApp.",
        image: "assets/images/service_dth.png",
        waMessage: "Hello King Mobiles, I want to recharge my Sundirect DTH...",
        showBadges: false,
      },
    ],
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
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      servicesData = data;
      renderUI();
    })
    .catch((err) => {
      console.warn(
        "Could not load services.json (likely file:// protocol CORS). Using dynamic fallback copy.",
        err,
      );
      renderUI();
    });

  function renderUI() {
    servicesContainer.innerHTML = "";
    servicesData.services.forEach((service) => {
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
    const clickedItem = Array.from(items).find(
      (el) => el.getAttribute("data-service") === serviceId,
    );

    previousActiveServiceId = activeServiceId;

    if (activeServiceId === serviceId) {
      // Deselect
      activeServiceId = null;
      items.forEach((el) => el.classList.remove("active"));
      triggerTransition(servicesData.default, null);
    } else {
      // Select new
      activeServiceId = serviceId;
      items.forEach((el) => {
        if (el.getAttribute("data-service") === serviceId) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
      const selectedService = servicesData.services.find(
        (s) => s.id === serviceId,
      );
      triggerTransition(selectedService, clickedItem);
    }
  }

  function triggerTransition(data, targetItem) {
    if (window.animateServiceTransition) {
      window.animateServiceTransition(
        data,
        targetItem,
        previousActiveServiceId,
        servicesContainer,
        detailContent,
        updateDetailPanel,
      );
    } else {
      updateDetailPanel(data);
    }
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
    const phone = window.shopWhatsappNumber || "917339480350";
    const encodedText = encodeURIComponent(data.waMessage);
    serviceWaBtn.href = `https://wa.me/${phone}?text=${encodedText}`;
  }
}

// Expose globally
window.initServices = initServices;

/* ─────────────────────────────
 WHY CHOOSE US DYNAMIC LOADER
───────────────────────────── */
function initWhy() {
  const sloganEl = document.getElementById("why-slogan");
  const gridContainer = document.getElementById("why-grid-container");
  if (!gridContainer) return;

  const fallbackData = {
    slogan: "We don't just sell phones — we build trust with every customer, every day.",
    cards: [
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\" /></svg>",
        title: "Genuine Products Only",
        desc: "Every product we sell is 100% original, directly from authorised distributors. No duplicates, no compromises."
      },
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\" /></svg>",
        title: "Official Brand Partners",
        desc: "Authorised dealer for 7+ premium brands including boAt, itel, Lava, Oraimo, Zebronics, Portronics & HMD Global."
      },
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z\" /></svg>",
        title: "Expert Mobile Service",
        desc: "Trained technicians for all repairs — software, hardware, screen replacement & more with quick turnaround."
      },
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\" ry=\"2\" /><line x1=\"12\" y1=\"18\" x2=\"12.01\" y2=\"18\" /></svg>",
        title: "Screen Replacement",
        desc: "Professional screen and tempered glass replacement for all major brands at honest, transparent prices."
      },
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z\" /><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\" /><path d=\"M16 10a4 4 0 01-8 0\" /></svg>",
        title: "Accessories Collection",
        desc: "Cases, chargers, earbuds, smartwatches, cables, power banks — everything you need, all under one roof."
      },
      {
        icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D4A017\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" ry=\"2\" /><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\" /></svg>",
        title: "SIM & Recharge Services",
        desc: "New SIM activations for Airtel, Jio & Vi. Sundirect DTH recharge. All operator services at one place."
      }
    ]
  };

  fetch("why.json")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      renderWhy(data);
    })
    .catch((err) => {
      console.warn("Could not load why.json (likely file:// protocol CORS). Using dynamic fallback copy.", err);
      renderWhy(fallbackData);
    });

  function renderWhy(data) {
    if (sloganEl && data.slogan) {
      sloganEl.textContent = data.slogan;
    }

    gridContainer.innerHTML = "";
    if (data.cards) {
      data.cards.forEach((card) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "why-card";
        cardDiv.innerHTML = `
          <div class="why-icon">
            ${card.icon}
          </div>
          <div class="why-title">${card.title}</div>
          <div class="why-desc">${card.desc}</div>
        `;
        gridContainer.appendChild(cardDiv);
      });
    }

    // Initialize/start the intersection cards trigger now that they are rendered!
    if (window.initWhyCards) {
      window.initWhyCards();
    }
  }
}

// Expose globally
window.initWhy = initWhy;

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

/* ─────────────────────────────
 SWIPER INIT — BRANDS
───────────────────────────── */
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

/* ─────────────────────────────
 SWIPER INIT — TESTIMONIALS (REVIEWS)
───────────────────────────── */
const fallbackReviewsData = [
  {
    stars: "★★★★★",
    text: '"Best mobile shop in Uchipuli! Got my screen replaced in under an hour. The staff was very helpful and the price was reasonable. Definitely recommending to everyone."',
    avatar: "RK",
    name: "Ravi Kumar",
    verified: "✓ Verified Customer",
  },
  {
    stars: "★★★★★",
    text: '"Bought a boAt earbuds and they gave me original packaging with all accessories. Very genuine shop. I also got my Jio SIM activated the same day. Great service!"',
    avatar: "PM",
    name: "Priya M.",
    verified: "✓ Verified Customer",
  },
  {
    stars: "★★★★★",
    text: '"My phone had software issue and they fixed it perfectly. Very knowledgeable staff. Good collection of mobiles and accessories. Prices are competitive too."',
    avatar: "SA",
    name: "Senthil A.",
    verified: "✓ Verified Customer",
  },
  {
    stars: "★★★★★",
    text: '"Excellent shop with genuine products. I purchased an itel smartphone and they helped me set it up nicely. After-sales support is also very good."',
    avatar: "MJ",
    name: "Muthu J.",
    verified: "✓ Verified Customer",
  },
  {
    stars: "★★★★★",
    text: '"King Mobiles is my go-to shop for everything mobile. From small accessories to phone repairs — they handle everything professionally. Highly recommended!"',
    avatar: "LV",
    name: "Lakshmi V.",
    verified: "✓ Verified Customer",
  },
];

fetch("reviews.json")
  .then((response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then((reviewsData) => {
    renderReviews(reviewsData);
  })
  .catch((err) => {
    console.warn(
      "Could not load reviews.json (likely file:// protocol CORS). Using fallback copy.",
      err,
    );
    renderReviews(fallbackReviewsData);
  });

function renderReviews(data) {
  const reviewsWrapper = document.getElementById("reviews-wrapper");
  if (reviewsWrapper) {
    reviewsWrapper.innerHTML = "";
    data.forEach((review) => {
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
 FAQ ACCORDION
───────────────────────────── */
document.querySelectorAll(".faq-q").forEach(function (q) {
  q.addEventListener("click", function () {
    var item = q.parentElement;
    var answer = item.querySelector(".faq-a");
    var isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
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
  const whatsappNum = window.shopWhatsappNumber || "917339480350";
  window.open("https://wa.me/" + whatsappNum + "?text=" + waMsg, "_blank");
}
window.submitForm = submitForm; // Expose globally for inline onclick

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
