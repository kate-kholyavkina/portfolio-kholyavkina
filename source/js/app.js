(function() {
  'use strict';

  $(function() {


// blog

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

// blog menu: give it top, make it fixed
  
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


    $('#burger-btn').on('click', function() {
      $(this).toggleClass('burger-btn--active');
      $('.header__burger').toggleClass('fixed');
      $('.main-menu').toggleClass('main-menu--open');
    });





// sklls animation


    function showSkills(){

      var arc, circumference;
      var time = 0;
      var delay = 300;

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

  });

})();