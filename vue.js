const Gallery = {
  data() {
    return {
      category: '',
      images: [
        { index: 1, src: 'img/IMG_4897.webp', category: 'Landscape' },
        { index: 2, src: 'img/IMG_4922.webp', category: 'Animal' },
        { index: 3, src: 'img/IMG_4925.webp', category: 'Animal' },
        { index: 4, src: 'img/IMG_4971.webp', category: 'Animal' },
        { index: 5, src: 'img/IMG_4983.webp', category: 'Animal' },
        { index: 6, src: 'img/IMG_4989.webp', category: 'Animal' },
        { index: 7, src: 'img/IMG_4995.webp', category: 'Animal' },
        { index: 8, src: 'img/IMG_5011.webp', category: 'Animal' },
        { index: 9, src: 'img/IMG_5019.webp', category: 'Animal' },
        { index: 10, src: 'img/IMG_5026.webp', category: 'Animal' },
        { index: 11, src: 'img/IMG_5028.webp', category: 'Animal' },
        { index: 12, src: 'img/IMG_5038.webp', category: 'Landscape' },
        { index: 13, src: 'img/IMG_5066.webp', category: 'Landscape' },
        { index: 14, src: 'img/IMG_5084.webp', category: 'Landscape' },
        { index: 15, src: 'img/IMG_5114.webp', category: 'Landscape' },
        { index: 16, src: 'img/IMG_5126.webp', category: 'Landscape' },
        { index: 17, src: 'img/IMG_5177.webp', category: 'Landscape' },
        { index: 18, src: 'img/IMG_5178.webp', category: 'Landscape' },
        { index: 19, src: 'img/IMG_5188.webp', category: 'Landscape' },
        { index: 20, src: 'img/IMG_5227.webp', category: 'Landscape' },
        { index: 21, src: 'img/IMG_5256.webp', category: 'Animal' },
        { index: 21, src: 'img/IMG_5264.webp', category: 'Animal' },
        { index: 21, src: 'img/IMG_5293.webp', category: 'Landscape' },
        { index: 21, src: 'img/IMG_5295.webp', category: 'Animal' }
      ],
      isModalVisible: false,
      selectedImage: null
    };
  },
  computed: {
    filterByCategory() {
      if (this.category === '') return this.images;
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
      // Remplacer l'extension .webp par .jpg
      const jpgImage = this.selectedImage.replace(/\.webp$/, '.jpg');
      
      // Créer un élément d'ancrage temporaire
      const link = document.createElement('a');
      link.href = jpgImage; // Chemin vers l'image JPG
      link.download = jpgImage.split('/').pop(); // Nom du fichier à télécharger
      
      // Ajouter le lien au DOM
      document.body.appendChild(link);
      
      // Simuler le clic sur le lien pour lancer le téléchargement
      link.click();
      
      // Retirer le lien du DOM
      document.body.removeChild(link);
  }
  }
};

Vue.createApp(Gallery).mount('#app1');
