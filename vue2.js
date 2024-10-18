const Gallery = {
  props: {
    imagePathPrefix: String, // Chemin personnalisé pour chaque instance
  },
  data() {
    return {
      images: [], // Initialisation du tableau d'images vide
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
      // Remplace l'extension webp par l'extension personnalisée
      const newImage = this.selectedImage.replace(/\.webp$/, '.jpg');
      const newImagePath = `${this.imagePathPrefix}/${newImage.split('/').pop()}`;

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
          console.log(imgFiles);

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
  }
};


document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault(); // Empêche la navigation par défaut

    const section = this.getAttribute('data-section');
    
    // Vérifie et lance l'application correspondante
    switch(section) {
      case 'autruche':
        if (!document.querySelector('#app1').__vue_app__) {
          Vue.createApp(Gallery, {
            imagePathPrefix: 'img/roadTrip/FermeAutruche'
          }).mount('#app1');
        }
        break;
      case 'addo':
        if (!document.querySelector('#app2').__vue_app__) {
          Vue.createApp(Gallery, {
            imagePathPrefix: 'img/roadTrip/AddoPark'
          }).mount('#app2');
        }
        break;
      case 'tsitsikamma':
        if (!document.querySelector('#app3').__vue_app__) {
          Vue.createApp(Gallery, {
            imagePathPrefix: 'img/roadTrip/Tsitsikamma'
          }).mount('#app3');
        }
        break;
      case 'random':
        if (!document.querySelector('#app4').__vue_app__) {
          Vue.createApp(Gallery, {
            imagePathPrefix: 'img/roadTrip/Random'
          }).mount('#app4');
        }
        break;
      default:
        console.log('Section inconnue.');
    }
  });
});
