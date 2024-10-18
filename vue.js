const Gallery = {
  data() {
    return {
      category: '',
      images: [], // Assurez-vous que ce tableau est vide au départ
      isModalVisible: false,
      selectedImage: null
    };
  },
  computed: {
    filterByCategory() {
      if (this.category === '') return this.images;
      console.log(this.images.filter(image => image.category === this.category));
      return this.images.filter(image => image.category === this.category);
    }
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
      const jpgImage = this.selectedImage.replace(/\.webp$/, '.jpg');
      const jpgImagePath = jpgImage.includes('Animal')
        ? `img/Animal/en_jpg/${jpgImage.split('/').pop()}`
        : jpgImage.includes('Landscape')
        ? `img/Landscape/en_jpg/${jpgImage.split('/').pop()}`
        : `img/en_jpg/${jpgImage.split('/').pop()}`;

        console.log(jpgImagePath);

      const link = document.createElement('a');
      link.href = jpgImagePath;
      link.download = jpgImage.split('/').pop();

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    fetchImagesFromGitHub() {
      fetch('https://api.github.com/repos/JSJL29/JSPictureStudio/git/trees/main?recursive=1')
        .then(response => response.json())
        .then(data => {
          const imgFiles = data.tree.filter(file => 
            (file.path.startsWith('img/Animal') || file.path.startsWith('img/Landscape')) && file.path.endsWith('.webp')
          );          

          imgFiles.forEach(file => {
            const category = file.path.includes('Landscape') ? 'Landscape' : 'Animal';
            this.images.push({
              index: this.images.length + 1, // Assigner un index unique
              src: file.path, // Le chemin du fichier image
              category: category // Assigner la catégorie en fonction du chemin ou de votre logique
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

Vue.createApp(Gallery).mount('#app1');
