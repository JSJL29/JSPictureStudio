const Gallery = {
  props: {
    imagePathPrefix: String,
  },
  data() {
    return {
      images: [],
      isModalVisible: false,
      selectedImage: null,
      selectedIndex: 0,
      selectedImages: [],
    };
  },
  methods: {
    showImage(imageSrc, index) {
      this.selectedImage = imageSrc;
      this.selectedIndex = index;
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.selectedImage = null;
    },
    downloadImage() {
      const newImage = this.selectedImage.replace(/\.webp$/, '.jpg');
      const newImagePath = `${this.imagePathPrefix}/en_jpg/${newImage.split('/').pop()}`;
      const link = document.createElement('a');
      link.href = newImagePath;
      link.download = newImage.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    fetchImagesFromGitHub() {
      fetch('https://api.github.com/repos/JSJL29/JSPictureStudio/git/trees/main?recursive=1')
        .then(response => response.json())
        .then(data => {
          const imgFiles = data.tree.filter(file => file.path.startsWith(this.imagePathPrefix) && file.path.endsWith('.webp'));
          imgFiles.forEach(file => {
            this.images.push({
              index: this.images.length + 1,
              src: file.path,
            });
          });
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des fichiers:', error);
        });
    },
    nextImage() {
      if (this.selectedIndex < this.images.length - 1) {
        this.selectedIndex++;
        this.selectedImage = this.images[this.selectedIndex].src;
      }
    },
    prevImage() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.selectedImage = this.images[this.selectedIndex].src;
      }
    },
    toggleSelectImage(imageSrc) {
      const index = this.selectedImages.indexOf(imageSrc);
      if (index > -1) {
        this.selectedImages.splice(index, 1);
      } else {
        this.selectedImages.push(imageSrc);
      }
    },
    isSelected(imageSrc) {
      return this.selectedImages.includes(imageSrc);
    },
    downloadSelectedImages() {
      this.selectedImages.forEach(imageSrc => {
        const newImage = imageSrc.replace(/\.webp$/, '.jpg');
        const newImagePath = `${this.imagePathPrefix}/en_jpg/${newImage.split('/').pop()}`;
        const link = document.createElement('a');
        link.href = newImagePath;
        link.download = newImage.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  },
  mounted() {
    this.fetchImagesFromGitHub();
  },
  template: `
  <button @click.stop="downloadSelectedImages">Télécharger les images sélectionnées</button>
    <transition-group appear tag="ul" class="category-list">
      <li v-for="(image, index) in images" :key="image.index">
        <img :src="image.src" :alt="image.alt" loading="lazy" @click="showImage(image.src, index)">
        <input type="checkbox" :value="image.src" @change="toggleSelectImage(image.src)" :checked="isSelected(image.src)">
      </li>
    </transition-group>
    <div v-if="isModalVisible" class="modal" @click="closeModal">
      <span class="close" @click="closeModal">&times;</span>
      <img class="modal-content" :src="selectedImage" @click.stop>
      <div class="download-button">
        <button @click.stop.prevent="downloadImage" aria-label="Télécharger l'image">Télécharger</button>
      </div>
      <button @click.stop.prevent="prevImage" class="nav-button prev-button"> < Précédent  </button>
      <button @click.stop.prevent="nextImage" class="nav-button next-button">  Suivant > </button>
      <div class="download-selected" @click.stop>
        <input type="checkbox" :value="selectedImage" @change.stop="toggleSelectImage(selectedImage)" :checked="isSelected(selectedImage)">
      </div>
    </div>
  `,
};

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();

    const section = this.getAttribute('data-section');
    const appMappings = {
      autruche: { id: 'app1', prefix: 'img/roadTrip/FermeAutruche' },
      addo: { id: 'app2', prefix: 'img/roadTrip/AddoPark' },
      tsitsikamma: { id: 'app3', prefix: 'img/roadTrip/Tsitsikamma' },
      random: { id: 'app4', prefix: 'img/roadTrip/Random' },
      kruger: { id: 'app5', prefix: 'img/Krug/Kruger' },
      reptileCenter: { id: 'app6', prefix: 'img/Krug/ReptileCenter' },
      rehabCenter: { id: 'app7', prefix: 'img/Krug/RehabCenter' },
      bourkesLuck: { id: 'app8', prefix: 'img/Krug/BourkesLuck' },
    };

    const mapping = appMappings[section];
    if (!mapping) {
      console.log(`Section inconnue : "${section}"`);
      return;
    }

    const targetElement = document.querySelector(`#${mapping.id}`);
    if (!targetElement) {
      console.error(`Élément cible introuvable pour la section : "${section}"`);
      return;
    }

    if (!targetElement.__vue_app__) {
      Vue.createApp(Gallery, {
        imagePathPrefix: mapping.prefix,
      }).mount(`#${mapping.id}`);
    }
  });
});
