const Gallery = {
  data() {
    return {
      category: '',
      images: [
        { index: 1, src: 'img/IMG_4897.webp', category: 'Landscape' },
        { index: 2, src: 'img/IMG_4922.webp', category: 'Landscape' },
        { index: 3, src: 'img/IMG_4925.webp', category: 'Landscape' },
        { index: 4, src: 'img/IMG_4971.webp', category: 'Landscape' },
        { index: 5, src: 'img/IMG_4983.webp', category: 'Animal' },
        { index: 6, src: 'img/IMG_4989.webp', category: 'Animal' },
        { index: 7, src: 'img/IMG_4995.webp', category: 'Animal' },
        { index: 8, src: 'img/IMG_5011.webp', category: 'Animal' },
        { index: 9, src: 'img/IMG_5019.webp', category: 'Animal' },
        { index: 10, src: 'img/IMG_5026.webp', category: 'Animal' },
        { index: 11, src: 'img/IMG_5028.webp', category: 'Animal' },
        { index: 12, src: 'img/IMG_5038.webp', category: 'Animal' },
        { index: 13, src: 'img/IMG_5066.webp', category: 'Animal' },
        { index: 14, src: 'img/IMG_5084.webp', category: 'Animal' },
        { index: 15, src: 'img/IMG_5114.webp', category: 'Animal' },
        { index: 16, src: 'img/IMG_5126.webp', category: 'Animal' },
        { index: 17, src: 'img/IMG_5177.webp', category: 'Animal' },
        { index: 18, src: 'img/IMG_5178.webp', category: 'Animal' },
        { index: 19, src: 'img/IMG_5188.webp', category: 'Animal' },
        { index: 20, src: 'img/IMG_5227.webp', category: 'Animal' },
        { index: 21, src: 'img/IMG_5256.webp', category: 'Animal' }
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
    }
  }
};

Vue.createApp(Gallery).mount('#app1');
