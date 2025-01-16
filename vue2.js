const Gallery = {
  props: {
      imagePathPrefix: String,
  },
  data() {
      return {
          images: [],
          isModalVisible: false,
          selectedImage: null,
      };
  },
  methods: {
      showImage(imageSrc) {
          this.selectedImage = imageSrc;
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
              console.log(this.response);
    
              imgFiles.forEach(file => {
                this.images.push({
                  index: this.images.length + 1, // Assigner un index unique
                  src: file.path, // Le chemin du fichier image
                });
              });
            })
            .catch(error => {
              console.error('Erreur lors de la récupération des fichiers:', error);
            });
        }
      },
  mounted() {
      this.fetchImagesFromGitHub();
  },
  template: `
      <transition-group appear tag="ul" class="category-list">
          <li v-for="image in images" :key="image.index">
              <img :src="image.src" :alt="image.alt" loading="lazy" @click="showImage(image.src)">
          </li>
      </transition-group>
      <div v-if="isModalVisible" class="modal" @click="closeModal">
          <span class="close" @click="closeModal">&times;</span>
          <img class="modal-content" :src="selectedImage" @click.stop>
          <div class="download-button">
              <button @click.stop.prevent="downloadImage" aria-label="Télécharger l'image">Télécharger</button>
          </div>
      </div>
  `,
};

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Empêche la navigation par défaut

    const section = this.getAttribute('data-section');
    const appMappings = {
      autruche: { id: 'app1', prefix: 'img/roadTrip/FermeAutruche' },
      addo: { id: 'app2', prefix: 'img/roadTrip/AddoPark' },
      tsitsikamma: { id: 'app3', prefix: 'img/roadTrip/Tsitsikamma' },
      random: { id: 'app4', prefix: 'img/roadTrip/Random' },
      kruger: { id: 'app5', prefix: 'img/Krug/Kruger' },
      reptileCenter: { id: 'app6', prefix: 'img/Krug/ReptileCenter' },
      rehabCenter: { id: 'app7', prefix: 'img/Krug/RehabCenter' },
      echoCaves: { id: 'app8', prefix: 'img/Krug/EchoCaves' },
      bourkesLuck: { id: 'app9', prefix: 'img/Krug/BourkesLuck' },
      harcelement: { id: 'app10', prefix: 'img/Krug/Harcelement' },
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

    // Vérifie si l'application Vue est déjà montée
    if (!targetElement.__vue_app__) {
      console.log(`Montage de Vue pour la section "${section}" avec le préfixe "${mapping.prefix}"`);
      Vue.createApp(Gallery, {
        imagePathPrefix: mapping.prefix,
      }).mount(`#${mapping.id}`);
    } else {
      console.log(`L'application Vue est déjà montée pour la section "${section}".`);
    }
  });
});
