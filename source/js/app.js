(function() {
  'use strict';




// preloader
  
  (function(){
    var imgs = [];

    $.each($('*'), function(){
      var $this = $(this),
          background = $this.css('background-image'),
          img = $this.is('img');

      if (background != 'none') {

        var path = background.replace('url("', "").replace('")', "");
        var path = path.replace('url(', "").replace(')', "");

        imgs.push(path);

      }

      if (img) {
        var path = '' + $this.attr('src');

        if (path) {
          imgs.push(path);
        }
      }

    });

    var loaded = 1;

    for (var i = 0; i < imgs.length; i++) {
      var image = $('<img>', {
        attr: {
          src: imgs[i]
        }
      });
      $(image).load(function(){
        var percentLoaded = countPercent(loaded,imgs.length);
        setPercent(percentLoaded);
        loaded++;
      });  
    };

    console.log(imgs);


    function countPercent(current, total){
      return Math.ceil(current / total * 100);
    }

    

    function setPercent(percent){

      $('.preloader__percents').text(percent);
      
      if (percent >= 100) {
        $('.preloader__hidden').delay(500).css('display', 'block');
        $('.preloader').delay(500).fadeOut(300);
      }

    }


  })();



// blur 
function blur(){

    var bg   = $('.blur__bg'),
      form = $('.blur__form'),

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

// slider 






(function(){

    function indexDec(activeIndex, total) {
        var prevIndex = (activeIndex <=   0  ) ? total : activeIndex - 1;
        return prevIndex;
    };

    function indexInc(activeIndex, total) {
        var nextIndex = (activeIndex >= total) ?   0   : activeIndex + 1;
        return nextIndex;
    };


    function moveSlider(direction, control, newIndex) {
      var 
        items = control.find('.control__item'),
        oldItem = control.find('.control__item--active'),
        newItem = items.eq(newIndex);



        oldItem.removeClass('control__item--active');
        newItem.addClass('control__item--active');


      if (direction == 'up') {

          newItem.css('top', '100%');
          oldItem.animate({'top': '-100%'}, 300);
          newItem.animate({'top': '0'}, 300);

      };
      if (direction == 'down') {

          newItem.css('top', '-100%');
          oldItem.animate({'top': '100%'}, 300);
          newItem.animate({'top': '0'}, 300);
        
      };
    };


    function displaySlide(indexToHide, indexToShow, items) {

      var 
        itemToHide = items.eq(indexToHide),
        itemToShow = items.eq(indexToShow);

      itemToHide.removeClass('slider__item--active');
      itemToHide.animate({'opacity': '0'}, 150);

      itemToShow.addClass('slider__item--active');
      itemToShow.delay(150).animate({'opacity': '1'}, 150);
    };


    function displayInfo(indexToHide, indexToShow, infoItems) {
      infoItems.eq(indexToHide).css('display', 'none');
      infoItems.eq(indexToShow).css('display', 'inline-block');
    }



    $('.slider__control').on('click', function(e){

      e.preventDefault();

      var
        $this = $(this),
        container = $this.closest('.slider'),
        items = container.find('.slider__item'),
        infoItems = container.find('.slider__item-info'),
        total = items.length - 1,
        prevControl = container.find('.slider__control--prev'),
        nextControl = container.find('.slider__control--next'),
        activeItem = container.find('.slider__item--active'),
        activeIndex = items.index(activeItem),
        prevIndex = indexDec(activeIndex, total),
        nextIndex = indexInc(activeIndex, total);


      if ( $this.hasClass('slider__control--prev') ) {

        var prevIndexDec = indexDec(prevIndex, total);
        var nextIndexDec = indexDec(nextIndex, total);

        displaySlide(activeIndex, prevIndex, items);
        displayInfo(activeIndex, prevIndex, infoItems);

        moveSlider('up', prevControl, prevIndexDec);
        moveSlider('down', nextControl, nextIndexDec);

      };


      if ( $this.hasClass('slider__control--next') ) {

        var prevIndexInc = indexInc(prevIndex, total);
        var nextIndexInc = indexInc(nextIndex, total);
        
        displaySlide(activeIndex, nextIndex, items);
        displayInfo(activeIndex, nextIndex, infoItems);

        moveSlider('up', prevControl, prevIndexInc);
        moveSlider('down', nextControl, nextIndexInc);

      };

    });
 

})();



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

        var word = $('<span class="word"></span>').html(inject);
        console.log(word);
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
  (function(){

    var html = $('html');
    $('.off-canvas--menu').on('click', function() {
      html.toggleClass('html--blog-opened');
    });

    $(window).on({

      'resize' : function(){
        if ( $( window ).width() > 768 ) {
          html.removeClass('html--blog-opened');
        }
        blogMenuFindTop();
      },
      'scroll' : function(){
        var header = $('.header');
        var headerHeight = parseInt($(header).css('height'));
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
      // $('.header__burger').toggleClass('fixed');
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


    $('.wrapper--welcome').on('click', function(e){
      
      console.log(e.target);
      if (e.target !== this) {
        return;
      }

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