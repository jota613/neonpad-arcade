(() => {
  "use strict";

  // =========================================================================
  // 1. EFECTO VISUAL AL CLICK + SONIDO SINTÉTICO SUAVE (WEB AUDIO)
  // =========================================================================
  let audioCtx = null;

  const playUiTone = (freq = 520, duration = 0.07, type = "sine") => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0008, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Silenciar si el navegador bloquea el audio
    }
  };

  document.addEventListener("pointerdown", (e) => {
    const pulse = document.createElement("span");
    pulse.className = "click-pulse";
    pulse.style.left = `${e.clientX}px`;
    pulse.style.top = `${e.clientY}px`;
    document.body.appendChild(pulse);
    pulse.addEventListener("animationend", () => pulse.remove(), { once: true });

    if (e.target.closest("button, a, .chip, .faq-item")) {
      playUiTone(640, 0.05, "triangle");
    }
  });

  // =========================================================================
  // 2. ARRANQUE INTERACTIVO CON CONTROL DE PLAYSTATION
  // =========================================================================
  const bootOverlay = document.getElementById("bootOverlay");
  const bootScreen = document.getElementById("bootScreen");
  const bootLed = document.getElementById("bootLed");
  const bootStatus = document.getElementById("bootStatus");
  const bootProgressBar = document.getElementById("bootProgressBar");
  const psPowerBtn = document.getElementById("psPowerBtn");
  const symbolBtns = document.querySelectorAll(".ps-symbol");
  const skipBootBtn = document.getElementById("skipBootBtn");
  const reopenBootBtn = document.getElementById("reopenBootBtn");

  let isBooting = false;

  const powerOnScreen = (triggerLabel = "PS") => {
    if (isBooting) return;
    isBooting = true;

    playUiTone(330, 0.12, "sine");
    setTimeout(() => playUiTone(660, 0.18, "triangle"), 110);

    bootLed?.classList.add("is-powered");
    bootScreen?.classList.add("is-powering");
    if (bootStatus) {
      bootStatus.textContent = `Señal [${triggerLabel}] recibida — Encendiendo pantalla...`;
    }
    if (bootProgressBar) {
      bootProgressBar.style.width = "100%";
    }

    setTimeout(() => {
      bootOverlay?.classList.add("is-hidden");
      bootOverlay?.setAttribute("aria-hidden", "true");
      isBooting = false;
    }, 920);
  };

  const resetBootOverlay = () => {
    isBooting = false;
    bootLed?.classList.remove("is-powered");
    bootScreen?.classList.remove("is-powering");
    if (bootProgressBar) bootProgressBar.style.width = "0%";
    if (bootStatus) bootStatus.textContent = "Esperando señal del dual-controller...";
    bootOverlay?.setAttribute("aria-hidden", "false");
    bootOverlay?.classList.remove("is-hidden");
  };

  psPowerBtn?.addEventListener("click", () => powerOnScreen("BOTÓN PS"));
  symbolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sym = btn.dataset.symbol || "BOTÓN";
      powerOnScreen(sym);
    });
  });

  skipBootBtn?.addEventListener("click", () => powerOnScreen("SKIP"));
  reopenBootBtn?.addEventListener("click", resetBootOverlay);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bootOverlay && !bootOverlay.classList.contains("is-hidden")) {
      powerOnScreen("ESC");
    }
  });

  // =========================================================================
  // 3. NAVEGACIÓN MÓVIL & SCROLL REVEAL
  // =========================================================================
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileNav = document.getElementById("mobileNav");

  const setMobileMenu = (open) => {
    if (!burgerBtn || !mobileNav) return;
    burgerBtn.setAttribute("aria-expanded", String(open));
    mobileNav.classList.toggle("is-open", open);
  };

  burgerBtn?.addEventListener("click", () => {
    const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
    setMobileMenu(!expanded);
  });

  mobileNav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMobileMenu(false));
  });

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // =========================================================================
  // 4. TIENDA DE VIDEOJUEGOS & CARRITO
  // =========================================================================
  const gamesCatalog = [
    {
      id: "cd-zero",
      title: "Chrono Drift: Zero Sector",
      category: "accion",
      platform: "PS5 · PC · XBOX",
      price: 59.99,
      desc: "Acción cibernética a 120 FPS con campañas cooperativas y modo arcade.",
    },
    {
      id: "apex-2088",
      title: "Apex Overdrive 2088",
      category: "carreras",
      platform: "PS5 · PC",
      price: 49.99,
      desc: "Carreras urbanas futuristas con física precisa y pistas dinámicas.",
    },
    {
      id: "iron-bastion",
      title: "Iron Bastion: Orbit",
      category: "estrategia",
      platform: "PC · STEAM DECK",
      price: 39.99,
      desc: "Estrategia táctica espacial con gestión de flotas y multijugador rankeado.",
    },
    {
      id: "valkyrie-pro",
      title: "Valkyrie Protocol",
      category: "accion",
      platform: "PS5 · PC",
      price: 64.99,
      desc: "RPG de acción de ritmo veloz con jefes colosales y mejora de armaduras.",
    },
    {
      id: "neon-rally",
      title: "Synth Rally GT",
      category: "carreras",
      platform: "PC · XBOX",
      price: 29.99,
      desc: "Tramos nocturnos bajo lluvia de neón y modos contrarreloj globales.",
    },
    {
      id: "grid-command",
      title: "Grid Command: Sector 7",
      category: "estrategia",
      platform: "PC",
      price: 34.99,
      desc: "Defensa y asalto táctico por turnos con editor de misiones.",
    },
  ];

  let cart = [];
  let activeGameFilter = "all";

  const storeGrid = document.getElementById("storeGrid");
  const filterChips = document.querySelectorAll(".chip[data-game-filter]");
  const cartCountEl = document.getElementById("cartCount");
  const cartModal = document.getElementById("cartModal");
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const cartFeedback = document.getElementById("cartFeedback");

  const renderStore = () => {
    if (!storeGrid) return;
    const list =
      activeGameFilter === "all"
        ? gamesCatalog
        : gamesCatalog.filter((g) => g.category === activeGameFilter);

    storeGrid.innerHTML = list
      .map(
        (game) => `
      <article class="glass-card game-card">
        <div>
          <span class="game-platform mono">${game.platform}</span>
          <h3>${game.title}</h3>
          <p>${game.desc}</p>
        </div>
        <div class="game-bottom">
          <span class="price-tag mono">$${game.price.toFixed(2)}</span>
          <button
            type="button"
            class="btn btn--primary btn--sm"
            data-add-cart='${JSON.stringify({
              id: game.id,
              title: game.title,
              price: game.price,
              platform: game.platform,
            })}'
          >
            Agregar
          </button>
        </div>
      </article>
    `
      )
      .join("");
  };

  const renderCart = () => {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalUsd = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cartCountEl) cartCountEl.textContent = String(totalQty);
    if (cartTotalEl) cartTotalEl.textContent = `$${totalUsd.toFixed(2)} USD`;

    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p class="mono" style="color: var(--text-muted); font-size: 0.84rem;">Tu carrito está vacío.</p>`;
      return;
    }

    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-row">
        <div>
          <div style="font-weight: 600;">${item.title}</div>
          <div class="mono" style="font-size: 0.74rem; color: var(--text-muted);">${item.platform} · x${item.qty}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="mono text-cyan">$${(item.price * item.qty).toFixed(2)}</span>
          <button type="button" class="mono" data-remove-id="${item.id}" style="color: #fda4af; font-size: 0.78rem;">Quitar</button>
        </div>
      </div>
    `
      )
      .join("");
  };

  const addToCart = (gameObj) => {
    const existing = cart.find((item) => item.id === gameObj.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...gameObj, qty: 1 });
    }
    if (cartFeedback) cartFeedback.textContent = "";
    renderCart();
  };

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-cart]");
    if (addBtn) {
      try {
        const gameData = JSON.parse(addBtn.getAttribute("data-add-cart"));
        addToCart(gameData);
        addBtn.textContent = "¡Agregado!";
        setTimeout(() => {
          addBtn.textContent = addBtn.closest(".hero-showcase") ? "Añadir al Carrito" : "Agregar";
        }, 850);
      } catch {
        // Ignorar JSON malformado
      }
    }

    const removeBtn = e.target.closest("[data-remove-id]");
    if (removeBtn) {
      const id = removeBtn.getAttribute("data-remove-id");
      cart = cart.filter((item) => item.id !== id);
      renderCart();
    }
  });

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeGameFilter = chip.dataset.gameFilter || "all";
      renderStore();
    });
  });

  openCartBtn?.addEventListener("click", () => {
    cartModal?.classList.add("is-open");
    cartModal?.setAttribute("aria-hidden", "false");
  });

  const closeCart = () => {
    cartModal?.classList.remove("is-open");
    cartModal?.setAttribute("aria-hidden", "true");
  };

  closeCartBtn?.addEventListener("click", closeCart);
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCart();
  });

  checkoutBtn?.addEventListener("click", () => {
    if (!cartFeedback) return;
    if (cart.length === 0) {
      cartFeedback.textContent = "Agrega al menos un juego antes de confirmar.";
      cartFeedback.classList.add("is-error");
      return;
    }
    cartFeedback.classList.remove("is-error");
    cartFeedback.textContent = "Pedido procesado en modo demo. Claves listas en tu perfil.";
    cart = [];
    renderCart();
  });

  renderStore();
  renderCart();

  // =========================================================================
  // 5. SOPORTE EN LÍNEA & CONTACTO
  // =========================================================================
  const faqAnswers = {
    "¿Cómo canjeo mi código digital?":
      "Al completar tu compra recibirás un código alfanumérico para canjear en tu tienda de consola o cliente PC.",
    "¿Puedo solicitar reembolso en compras digitales?":
      "Sí, dentro de las primeras 48 horas siempre que el código no haya sido revelado ni activado.",
    "¿Cómo configuro el control en Steam / PC?":
      "Activa 'Steam Input' en Propiedades del mando o conecta por USB/Bluetooth y verifica la calibración.",
  };

  const supportAnswer = document.getElementById("supportAnswer");
  document.querySelectorAll(".faq-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.faq || "";
      if (supportAnswer) {
        supportAnswer.textContent = faqAnswers[q] || "Consulta registrada.";
      }
    });
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const supportForm = document.getElementById("supportForm");
  const supportFeedback = document.getElementById("supportFeedback");

  supportForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("supportMessage")?.value.trim() || "";
    const topic = document.getElementById("supportTopic")?.value || "";

    if (!msg) {
      if (supportFeedback) {
        supportFeedback.textContent = "Describe tu incidencia antes de enviar.";
        supportFeedback.classList.add("is-error");
      }
      return;
    }

    if (supportFeedback) {
      supportFeedback.classList.remove("is-error");
      const ticket = Math.floor(1000 + Math.random() * 9000);
      supportFeedback.textContent = `Ticket #NP-${ticket} (${topic}) enviado a soporte en línea.`;
    }
    supportForm.reset();
  });

  const contactForm = document.getElementById("contactForm");
  const contactFeedback = document.getElementById("contactFeedback");

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName")?.value.trim() || "";
    const email = document.getElementById("contactEmail")?.value.trim() || "";
    const msg = document.getElementById("contactMsg")?.value.trim() || "";

    if (!name || !isValidEmail(email) || !msg) {
      if (contactFeedback) {
        contactFeedback.textContent = "Completa tu nombre, un correo válido y tu mensaje.";
        contactFeedback.classList.add("is-error");
      }
      return;
    }

    if (contactFeedback) {
      contactFeedback.classList.remove("is-error");
      contactFeedback.textContent = `Gracias, ${name}. Tu mensaje fue enviado correctamente.`;
    }
    contactForm.reset();
  });
})();