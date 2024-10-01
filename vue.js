const Gallery = {
  data() {
    return {
      category: '',
      images: [
        { index: 1, src: '../img/IMG_4894.JPG', category: 'Landscape' },
        { index: 2, src: '../img/IMG_4895.JPG', category: 'Landscape' },
        { index: 3, src: '../img/IMG_4896.JPG', category: 'Landscape' },
        { index: 4, src: '../img/IMG_4897.JPG', category: 'Landscape' },
        { index: 5, src: '../img/IMG_4922.JPG', category: 'Animal' },
        { index: 6, src: '../img/IMG_4925.JPG', category: 'Animal' }]
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
