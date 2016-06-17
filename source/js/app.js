(function() {
  'use strict';

  $(function() {


// map




// hamburger menu using css transitions

    var isActive = false;

    $('#burger-btn').on('click', function() {
      if (isActive) {
        $(this).removeClass('burger-btn--active');
        $('.main-menu').removeClass('main-menu--open');
      } else {
        $(this).addClass('burger-btn--active');
        $('.main-menu').addClass('main-menu--open');
      }

      isActive = !isActive;
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

    setTimeout(showSkills, 300);






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


    $('.welcome__wrapper--welcome').on('click', function(e){
      
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