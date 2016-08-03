(function() {
  'use strict';

  preloader.init();
  modal.init();
  hamburgerMenu.init();
  scrollButtons.init();



  // на странице index
  if (window.location.pathname == '/index.html' || window.location.pathname == '/') {

    parallax.init();
    loginForm.init();
    flipCard.init();
  }


  // на странице blog
  if (window.location.pathname == '/blog.html') {

    // Модуль blogMenu должен быть инициализирован после отрисовки всех элементов,
    // для чего логично было бы использовать document.ready
    // Но использование document.ready тут невозможно из-за прелоадера, 
    // так как для правильной работы прелоадера у всех элементов сначала стоит display: none.
    // из-за этого document.ready срабатывает слишком рано, когда отрисован только прелоадер.
    // 
    // поэтому пришлось создать Deferred объект в модуле preloader: preloader.contentReady
    // preloader.contentReady получает метод .resolve() только после того, как все элементы получают display: block
    // Соответственно, инициализация blogMenu происходит после получения display: block и отрисовки всех элементов

    preloader.contentReady.done(function() { 
      scrollspy.init();
      blogMenuPanel.init();
    });
  }


  // на странице works
  if (window.location.pathname == '/works.html') {

    blur.init();
    slider.init();
    sliderTitlesAnimation.init();
    contactForm.init();
  }


  // на странице about
  if (window.location.pathname == '/about.html') {
    skillsAnimation.init();
  }


  // на странице admin
  if ($('#add-blog-btn').length) {
    addBlogForm.init('#add-blog-btn');
  }



})();