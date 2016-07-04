(function() {
  'use strict';




  modal.init();

  preloader.init();


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
    blogMenu.init();
  });





// blur 
function blur(){

  var bg = $('.blur__bg');

  if (bg.length === 0) {
    return;
  };

  var form = $('.blur__form'),
    bgWidth = bg.width(),
    posTop  = bg.offset().top  - form.offset().top,
    posLeft = bg.offset().left - form.offset().left;

  form.css({
    'background-size': bgWidth + 'px' + ' ' + 'auto',
    'background-position': posLeft + 'px' + ' ' + posTop + 'px'
  });
};

$(window).on('load resize', function(){
  blur();
});



// slider title animation

$(function() {
  
  var 
    titleWrap = $('.slider__info .section-title__inner'),
    inject,
    delay;

  titleWrap.each(function(){
    
    var $this = $(this);
    var titleText = $this.text();
    inject = '';
    $this.html('');
    var i = 0;

    $.each(titleText.split(' '), function(c, word) {

        inject = '';
        $.each(word.split(''), function(k, char) {
          inject += '<span class="char char--' + i + '">' + char + '</span>';
          i++;
        });

        var word = '<span class="word">' + inject + '</span>';
        $this.append(word);
    });

  });
});

// scroll up button, scroll down button

  (function(){

    function scrollTo(pos, duration){
      $('html, body').animate({
        scrollTop: pos
      }, duration);
    }

    $('.scroll-control--down').on('click', function(e){
      e.preventDefault();
      scrollTo( $(".header").height() , 500);
    });

    $('.scroll-control--up').on('click', function(e){
      e.preventDefault();
      scrollTo( '0', 700 );
    });

  })();


// blog


      // $('body').toggleClass('overfow-hidden');

  (function(){

    var html = $('html');
    var body = $('body');

    $('.off-canvas--menu').on('click', function() {
      html.addClass('html--blog-opened');
      // body.addClass('overfow-hidden');
    });
    $('.off-canvas--content').on('click', function() {
      html.removeClass('html--blog-opened');
      // body.removeClass('overfow-hidden');
    });

    $(window).on({

      'resize' : function(){
        if ( $( window ).width() > 768 ) {
          html.removeClass('html--blog-opened');
          // body.removeClass('overfow-hidden');
        }
        blogMenuFindTop();
      },
      'scroll' : function(){
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
    });

  })();

// blog menu: making it fixed
  
  function blogMenuFindTop() {
    var header = $('.header');
    var menu = $('.off-canvas--menu');

    if ( $( window ).width() > 768 ) {
      $(menu).css('top', $(header).css('height'));
    } else {
      $(menu).css('top', '0');
    }
  }

  blogMenuFindTop();




// hamburger menu using css transitions


  (function(){

    $('#burger-btn').on('click', function() {
      $(this).toggleClass('burger-btn--active');
      $('body').toggleClass('overfow-hidden');
      $('.main-menu').toggleClass('main-menu--open');
    });

  })();




// sklls animation


  function showSkills(){

    var arc, circumference;
    var time = 0;
    var delay = 150;

    $('circle.inner').each(function(i, el){

      var arc = Math.ceil($(el).data('arc'));
      var circumference = Math.ceil($(el).data('circumference'));

      setTimeout(function(){
        $(el).css('stroke-dasharray', arc+'px ' + circumference + 'px');
      }, time += delay );
    });

  }

  setTimeout(showSkills, 200);






// flipping animation

  (function(){

    var isWelcomeFlipped = false,
        buttonTriggerFlip = $('.btn--show-login'),
        flipContainer = $('.flip-container');


    buttonTriggerFlip.on('click', function(e){

      e.preventDefault();
      isWelcomeFlipped = true;
      flipContainer.addClass('flip');
      buttonTriggerFlip.fadeTo(300, 0).css('visibility', 'hidden');
    });


    $('.wrapper--welcome, .footer--welcome').on('click', function(e){
      
      // если кликаем на карточке, то переворачивать не надо
      if (e.target.closest('.welcome__card') !== null) {
        return;
      }
      // если кликаем не на карточке, то
      if (isWelcomeFlipped && 
          e.target.id != buttonTriggerFlip.attr('id')
        ) {

        isWelcomeFlipped = false;
        flipContainer.removeClass('flip');
        buttonTriggerFlip.fadeTo(300, 1, function(){
          buttonTriggerFlip.css('visibility', 'visible');
        })
      }

    });

    $('.btn--hide-login').on('click', function(e){

      e.preventDefault();
      isWelcomeFlipped = false;
      flipContainer.removeClass('flip');
      buttonTriggerFlip.fadeTo(300, 1).css('visibility', 'visible');
    });

  })();

})();