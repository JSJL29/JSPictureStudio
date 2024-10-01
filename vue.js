const Gallery = {
  data() {
    return {
      category: '',
      images: [
        { index: 1, src: 'https://raw.githubusercontent.com/JSJL29/JSPictureStudio/refs/heads/main/img/IMG_4894.webp', category: 'Landscape' },
        { index: 2, src: 'img/IMG_4895.webp', category: 'Landscape' },
        { index: 3, src: 'img/IMG_4896.webp', category: 'Landscape' },
        { index: 4, src: 'img/IMG_4897.webp', category: 'Landscape' },
        { index: 5, src: 'img/IMG_4922.webp', category: 'Animal' },
        { index: 6, src: 'img/IMG_4925.JPG', category: 'Animal' }]
    };
  },
  computed: {
    filterByCategory: function () {
      return this.images.filter(
        (image) => !image.category.indexOf(this.category)
      );
    }
  }
};
Vue.createApp(Gallery).mount("#app");
