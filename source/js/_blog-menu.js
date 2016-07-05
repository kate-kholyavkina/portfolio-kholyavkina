var scrollspy = (function () {

  _nav = $('.blog-nav__link');



  function init () {
    _scrollSpy();
    _setUpListeners();
  };

  // if (_nav === 0) {
  //   return;
  // };

  // прослушка событий
  function _setUpListeners() {

    // по скроллу делаем scroll spy
    $(window).on("scroll", _scrollSpy);

    // по клику переходим на нужную статью с анимацией
    $(_nav).on("click", function(e){
      _showArticle($(e.target).attr('href'), true);
    });

    // по ссылке переходим на нужную статью без анимации
    $(function() {
      if (window.location.hash !== '') {
        _showArticle(window.location.hash, false);
      }
    });
  }


  // переход на нужную статью (с анимацией или без)
  function _showArticle(article, isAnimate) {
    var 
      direction = article.replace('#', ''),
      reqArticle = $('.articles__item').filter('[data-article="' + direction + '"]'),
      reqArticlePos = reqArticle.offset().top;

      if (isAnimate) {
        $('body, html').animate({
          scrollTop: reqArticlePos
        }, 500);
      } else {
        $('body, html').scrollTop(reqArticlePos);
      }
  }


  // scroll spy
  function _scrollSpy() {
    $('.articles__item').each(function(){
      var
        $this = $(this),
        topEdge = $this.offset().top - 200,
        btmEdge = topEdge + $this.height(),
        wScroll = $(window).scrollTop();

        if (topEdge < wScroll && btmEdge > wScroll) {
          var 
            currentId = $this.data('article'),
            activeLink = _nav.filter('[href="#' + currentId + '"]');

          activeLink.closest('.blog-nav__item').addClass('active').siblings().removeClass('active');
        }

    });
  };


  return {
    init: init
  };

})();



var blogMenuPanel = (function(){

  var html = $('html');
  var body = $('body');


  function init(){
    _setUpListeners();
    _locateMenu();
  };


  function _setUpListeners(){

    $('.off-canvas--menu').on('click', _openMenu);
    $('.off-canvas--content').on('click', _closeMenu);

    $(window).on({
      'resize': function() {
        _closeMenu();
        _locateMenu();
      },
      'scroll': _fixMenu
    });

  };


  function _openMenu(){
    if ( $( window ).width() < 768 ) {
      html.addClass('html--blog-opened');
    }
  }


  function _closeMenu(){
    if ( $( window ).width() < 768 ) {
      html.removeClass('html--blog-opened');
    }
  }


  function _fixMenu() {

    var header = $('.header');
    var headerHeight = header.height();
    var menu = $('.off-canvas--menu');
    var scrollY = window.scrollY;

    if (scrollY > headerHeight) {
      menu.addClass('fixed');
    } else {
      menu.removeClass('fixed');
    }
        
  }

  function _locateMenu() {

    var header = $('.header');
    var menu = $('.off-canvas--menu');

    //  menu 'top' is right under the header
    //  menu 'top' is 0 when menu is on green panel
    if ( $( window ).width() > 768 ) {
      menu.css('top', header.css('height'));
    } else {
      menu.css('top', '0');
    }
  }


  return {
    init: init
  };

})();
