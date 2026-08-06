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

  const getCategory = (photo) => photo.category;
  const pagePhotos = manifest.filter((photo) => photo.collection === page);
  const fileName = (photo) => photo.name;
  const thumbnail = (photo) => photo.sources["640"];
  const preview = (photo) => photo.sources["2560"];

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
          <button class="lightbox-action lightbox-download" type="button">Télécharger</button>
        </div>
      </div>`;
    document.body.appendChild(lightbox);

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));
    lightbox.querySelector(".lightbox-select").addEventListener("click", () => toggleSelection(activePhotos[lightboxIndex]));
    lightbox.querySelector(".lightbox-share").addEventListener("click", sharePhoto);
    lightbox.querySelector(".lightbox-download").addEventListener("click", (event) => {
      downloadPhoto(activePhotos[lightboxIndex], event.currentTarget);
    });
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

  const openLightbox = (photo) => {
    const index = activePhotos.findIndex((item) => item.id === photo.id);
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
    const photo = activePhotos[lightboxIndex];
    const lightbox = document.querySelector(".lightbox");
    if (!photo || !lightbox) return;
    const category = getCategory(photo);
    const image = lightbox.querySelector(".lightbox-image");
    image.src = preview(photo);
    image.width = Math.min(2560, photo.width);
    image.height = Math.round(image.width * photo.height / photo.width);
    image.alt = `Photographie ${fileName(photo)}, ${labels[category] || category}`;
    lightbox.querySelector(".lightbox-title").textContent = `${labels[category] || category} · ${fileName(photo)}`;
    lightbox.querySelector(".lightbox-count").textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(activePhotos.length).padStart(2, "0")}`;
    const selectButton = lightbox.querySelector(".lightbox-select");
    const isSelected = selected.has(photo.id);
    selectButton.classList.toggle("active", isSelected);
    selectButton.textContent = isSelected ? "✓ Sélectionnée" : "+ Sélection";
    history.replaceState(null, "", `#photo=${encodeURIComponent(photo.id)}`);
  };

  const sharePhoto = async () => {
    const photo = activePhotos[lightboxIndex];
    const url = new URL(location.href);
    url.hash = `photo=${encodeURIComponent(photo.id)}`;
    const data = { title: "JSPictureStudio", text: `Photographie ${fileName(photo)}`, url: url.href };
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

  const toggleSelection = (photo) => {
    if (selected.has(photo.id)) selected.delete(photo.id);
    else selected.add(photo.id);
    updateSelectionUI();
    if (document.querySelector(".lightbox.open")) updateLightbox();
  };

  const updateSelectionUI = () => {
    document.querySelectorAll("[data-selection-count]").forEach((node) => { node.textContent = selected.size; });
    document.querySelectorAll("[data-download-selected]").forEach((button) => { button.disabled = selected.size === 0; });
    document.querySelectorAll(".select-photo").forEach((button) => {
      const pressed = selected.has(button.dataset.id);
      button.setAttribute("aria-pressed", String(pressed));
      button.textContent = pressed ? "✓" : "+";
      button.setAttribute("aria-label", pressed ? "Retirer de la sélection" : "Ajouter à la sélection");
    });
  };

  const downloadPhoto = async (photo, button) => {
    if (!photo) return;
    const previousLabel = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = "Préparation…";
    }
    try {
      const response = await fetch(photo.download);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${fileName(photo)}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (error) {
      console.warn("Direct download unavailable, opening the original.", error);
      window.open(photo.download, "_blank", "noopener");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = previousLabel;
      }
    }
  };

  const downloadSelected = async (event) => {
    const button = event.currentTarget;
    const photos = [...selected]
      .map((id) => manifest.find((photo) => photo.id === id))
      .filter(Boolean);
    button.disabled = true;
    for (let index = 0; index < photos.length; index += 1) {
      button.childNodes[0].textContent = `Téléchargement ${index + 1}/${photos.length} `;
      await downloadPhoto(photos[index]);
    }
    button.childNodes[0].textContent = "Télécharger la sélection ";
    button.disabled = false;
  };

  const renderGallery = () => {
    if (!gallerySection) return;
    const grid = document.querySelector("#gallery-grid");
    const status = document.querySelector("#gallery-status");
    const loadMore = document.querySelector("#load-more");
    activePhotos = pagePhotos.filter((photo) => activeFilter === "all" || getCategory(photo) === activeFilter);
    const visible = activePhotos.slice(0, visibleCount);
    const fragment = document.createDocumentFragment();

    visible.forEach((photo, index) => {
      const category = getCategory(photo);
      const layoutPosition = (index % 10) + 1;
      const isWide = [1, 5, 7].includes(layoutPosition);
      const responsiveSizes = isWide
        ? "(max-width: 900px) 100vw, 50vw"
        : "(max-width: 900px) 50vw, 25vw";
      const item = document.createElement("article");
      item.className = "gallery-item";
      item.style.backgroundColor = photo.color;
      item.style.animationDelay = `${Math.min(index, 15) * 25}ms`;
      item.innerHTML = `
        <button class="gallery-image-button" type="button" aria-label="Ouvrir ${fileName(photo)}">
          <img
            src="${thumbnail(photo)}"
            srcset="${photo.sources["640"]} 640w, ${photo.sources["1280"]} 1280w"
            sizes="${responsiveSizes}"
            width="${photo.width}"
            height="${photo.height}"
            alt="Photographie ${fileName(photo)}, ${labels[category] || category}"
            loading="lazy"
            decoding="async"
            fetchpriority="${index < 4 ? "auto" : "low"}">
        </button>
        <span class="photo-meta"><span>${labels[category] || category}</span><span>${fileName(photo)}</span></span>
        <button class="select-photo" type="button" data-id="${photo.id}" aria-pressed="false" aria-label="Ajouter à la sélection">+</button>`;
      item.querySelector(".gallery-image-button").addEventListener("click", () => openLightbox(photo));
      item.querySelector(".select-photo").addEventListener("click", () => toggleSelection(photo));
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

    const sharedId = location.hash.startsWith("#photo=") ? decodeURIComponent(location.hash.slice(7)) : "";
    const sharedPhoto = pagePhotos.find((photo) => photo.id === sharedId);
    if (sharedPhoto) {
      const category = getCategory(sharedPhoto);
      const filter = [...document.querySelectorAll("[data-filter]")].find((button) => button.dataset.filter === category);
      if (filter && !activePhotos.some((photo) => photo.id === sharedId)) filter.click();
      openLightbox(sharedPhoto);
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
  document.querySelectorAll("[data-photo-count]").forEach((node) => {
    const collection = node.dataset.photoCount;
    node.textContent = collection === "all"
      ? manifest.length
      : manifest.filter((photo) => photo.collection === collection).length;
  });
  setupMenu();
  setupLightbox();
  setupGallery();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
  }
})();
