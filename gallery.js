(() => {
  "use strict";

  const manifest = Array.isArray(window.PHOTO_MANIFEST) ? window.PHOTO_MANIFEST : [];
  const gallerySection = document.querySelector("[data-gallery-scope]");
  const page = document.body.dataset.page || "home";
  const batchSize = 24;
  const selected = new Set();
  let activeFilter = "all";
  let visibleCount = batchSize;
  let activePhotos = [];
  let lightboxIndex = 0;
  let touchStartX = 0;

  const labels = {
    Animal: "Animaux",
    Landscape: "Paysages",
    FermeAutruche: "Ferme d’autruches",
    AddoPark: "Addo Park",
    Tsitsikamma: "Tsitsikamma",
    Random: "Sur la route",
    Kruger: "Parc Kruger",
    ReptileCenter: "Reptile Center",
    RehabCenter: "Rehab Center",
    BourkesLuck: "Bourke’s Luck"
  };

  const getCategory = (path) => {
    const parts = path.split("/");
    return parts[1] === "Animal" || parts[1] === "Landscape" ? parts[1] : parts[2];
  };

  const pagePhotos = manifest.filter((path) => {
    if (page === "home") return path.startsWith("img/Animal/") || path.startsWith("img/Landscape/");
    if (page === "roadtrip") return path.startsWith("img/roadTrip/");
    return path.startsWith("img/Krug/");
  });

  const fileName = (path) => path.split("/").pop().replace(".webp", "");
  const jpgPath = (path) => {
    const parts = path.split("/");
    const name = parts.pop().replace(/\.webp$/i, ".jpg");
    return [...parts, "en_jpg", name].join("/");
  };

  const setupMenu = () => {
    const toggle = document.querySelector(".menu-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  };

  const setupLightbox = () => {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Aperçu de la photographie");
    lightbox.innerHTML = `
      <div class="lightbox-top">
        <span class="lightbox-title"></span>
        <button class="icon-button lightbox-close" type="button" aria-label="Fermer">×</button>
      </div>
      <div class="lightbox-stage">
        <img class="lightbox-image" alt="">
        <button class="lightbox-nav lightbox-prev" type="button" aria-label="Photo précédente">←</button>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="Photo suivante">→</button>
      </div>
      <div class="lightbox-bottom">
        <span class="lightbox-count"></span>
        <div class="lightbox-actions">
          <button class="lightbox-action lightbox-select" type="button">+ Sélection</button>
          <button class="lightbox-action lightbox-share" type="button">Partager</button>
          <a class="lightbox-action lightbox-download" download>Télécharger</a>
        </div>
      </div>`;
    document.body.appendChild(lightbox);

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));
    lightbox.querySelector(".lightbox-select").addEventListener("click", () => toggleSelection(activePhotos[lightboxIndex]));
    lightbox.querySelector(".lightbox-share").addEventListener("click", sharePhoto);
    lightbox.querySelector(".lightbox-stage").addEventListener("click", (event) => {
      if (event.target.classList.contains("lightbox-stage")) closeLightbox();
    });
    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 55) moveLightbox(distance > 0 ? -1 : 1);
    }, { passive: true });
  };

  const openLightbox = (path) => {
    const index = activePhotos.indexOf(path);
    if (index < 0) return;
    lightboxIndex = index;
    document.querySelector(".lightbox").classList.add("open");
    document.body.classList.add("lightbox-open");
    updateLightbox();
    document.querySelector(".lightbox-close").focus();
  };

  const closeLightbox = () => {
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox || !lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    document.body.classList.remove("lightbox-open");
    if (location.hash.startsWith("#photo=")) history.replaceState(null, "", location.pathname + location.search);
  };

  const moveLightbox = (direction) => {
    if (!activePhotos.length) return;
    lightboxIndex = (lightboxIndex + direction + activePhotos.length) % activePhotos.length;
    updateLightbox();
  };

  const updateLightbox = () => {
    const path = activePhotos[lightboxIndex];
    const lightbox = document.querySelector(".lightbox");
    if (!path || !lightbox) return;
    const category = getCategory(path);
    const image = lightbox.querySelector(".lightbox-image");
    image.src = path;
    image.alt = `Photographie ${fileName(path)}, ${labels[category] || category}`;
    lightbox.querySelector(".lightbox-title").textContent = `${labels[category] || category} · ${fileName(path)}`;
    lightbox.querySelector(".lightbox-count").textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(activePhotos.length).padStart(2, "0")}`;
    const download = lightbox.querySelector(".lightbox-download");
    download.href = jpgPath(path);
    download.download = `${fileName(path)}.jpg`;
    const selectButton = lightbox.querySelector(".lightbox-select");
    const isSelected = selected.has(path);
    selectButton.classList.toggle("active", isSelected);
    selectButton.textContent = isSelected ? "✓ Sélectionnée" : "+ Sélection";
    history.replaceState(null, "", `#photo=${encodeURIComponent(path)}`);
  };

  const sharePhoto = async () => {
    const path = activePhotos[lightboxIndex];
    const url = new URL(location.href);
    url.hash = `photo=${encodeURIComponent(path)}`;
    const data = { title: "JSPictureStudio", text: `Photographie ${fileName(path)}`, url: url.href };
    const button = document.querySelector(".lightbox-share");
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url.href);
        button.textContent = "Lien copié";
        setTimeout(() => { button.textContent = "Partager"; }, 1600);
      }
    } catch (error) {
      if (error.name !== "AbortError") button.textContent = "Copie impossible";
    }
  };

  const toggleSelection = (path) => {
    if (selected.has(path)) selected.delete(path);
    else selected.add(path);
    updateSelectionUI();
    if (document.querySelector(".lightbox.open")) updateLightbox();
  };

  const updateSelectionUI = () => {
    document.querySelectorAll("[data-selection-count]").forEach((node) => { node.textContent = selected.size; });
    document.querySelectorAll("[data-download-selected]").forEach((button) => { button.disabled = selected.size === 0; });
    document.querySelectorAll(".select-photo").forEach((button) => {
      const pressed = selected.has(button.dataset.path);
      button.setAttribute("aria-pressed", String(pressed));
      button.textContent = pressed ? "✓" : "+";
      button.setAttribute("aria-label", pressed ? "Retirer de la sélection" : "Ajouter à la sélection");
    });
  };

  const downloadSelected = () => {
    [...selected].forEach((path, index) => {
      window.setTimeout(() => {
        const link = document.createElement("a");
        link.href = jpgPath(path);
        link.download = `${fileName(path)}.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, index * 180);
    });
  };

  const renderGallery = () => {
    if (!gallerySection) return;
    const grid = document.querySelector("#gallery-grid");
    const status = document.querySelector("#gallery-status");
    const loadMore = document.querySelector("#load-more");
    activePhotos = pagePhotos.filter((path) => activeFilter === "all" || getCategory(path) === activeFilter);
    const visible = activePhotos.slice(0, visibleCount);
    const fragment = document.createDocumentFragment();

    visible.forEach((path, index) => {
      const category = getCategory(path);
      const item = document.createElement("article");
      item.className = "gallery-item";
      item.style.animationDelay = `${Math.min(index, 15) * 25}ms`;
      item.innerHTML = `
        <button class="gallery-image-button" type="button" aria-label="Ouvrir ${fileName(path)}">
          <img src="${path}" alt="Photographie ${fileName(path)}, ${labels[category] || category}" loading="lazy" decoding="async">
        </button>
        <span class="photo-meta"><span>${labels[category] || category}</span><span>${fileName(path)}</span></span>
        <button class="select-photo" type="button" data-path="${path}" aria-pressed="false" aria-label="Ajouter à la sélection">+</button>`;
      item.querySelector(".gallery-image-button").addEventListener("click", () => openLightbox(path));
      item.querySelector(".select-photo").addEventListener("click", () => toggleSelection(path));
      fragment.appendChild(item);
    });

    grid.replaceChildren(fragment);
    status.textContent = `${activePhotos.length} photographie${activePhotos.length > 1 ? "s" : ""}`;
    loadMore.hidden = visibleCount >= activePhotos.length;
    updateSelectionUI();
  };

  const setupGallery = () => {
    if (!gallerySection) return;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        visibleCount = batchSize;
        document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
        renderGallery();
      });
    });
    document.querySelector("#load-more").addEventListener("click", () => {
      visibleCount += batchSize;
      renderGallery();
    });
    document.querySelectorAll("[data-download-selected]").forEach((button) => button.addEventListener("click", downloadSelected));
    renderGallery();

    const sharedPath = location.hash.startsWith("#photo=") ? decodeURIComponent(location.hash.slice(7)) : "";
    if (sharedPath && pagePhotos.includes(sharedPath)) {
      const category = getCategory(sharedPath);
      const filter = [...document.querySelectorAll("[data-filter]")].find((button) => button.dataset.filter === category);
      if (filter && !activePhotos.includes(sharedPath)) filter.click();
      openLightbox(sharedPath);
    }
  };

  document.addEventListener("keydown", (event) => {
    const isOpen = document.querySelector(".lightbox.open");
    if (!isOpen) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
  setupMenu();
  setupLightbox();
  setupGallery();
})();
