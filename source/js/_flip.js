var flipCard = (function () {


  var isWelcomeFlipped = false,
      buttonTriggerFlip = $('.btn--show-login'),
      flipContainer = $('.flip-container');


  function init () {
    _setUpListners();
  };


  function _setUpListners () {

    buttonTriggerFlip.on('click', _showLogin);
    $('.wrapper--welcome, .footer--welcome').on('click', _prepareToHide);
    $('.btn--hide-login').on('click', _hideLogin);
  };



  function _hideLogin(e) {

    e.preventDefault();

    // то переворачиваем обратно
    isWelcomeFlipped = false;
    flipContainer.removeClass('flip');
    buttonTriggerFlip.fadeTo(300, 1, function(){
      buttonTriggerFlip.css('visibility', 'visible');
    });

  };



  function _prepareToHide(e) {
      // если кликаем на карточке, то переворачивать не надо
      if (e.target.closest('.welcome__card') !== null) {
        return;
      }
      // если кликаем не на карточке,
      if (isWelcomeFlipped && 
          e.target.id != buttonTriggerFlip.attr('id')
        ) {
        _hideLogin(e);
      }
  };


  
  function _showLogin(e) {

    e.preventDefault();
    isWelcomeFlipped = true;
    flipContainer.addClass('flip');
    buttonTriggerFlip.fadeTo(300, 0).css('visibility', 'hidden');
  };


  return {
    init: init
  };

})();




// flipping animation

  // (function(){

  //   var isWelcomeFlipped = false,
  //       buttonTriggerFlip = $('.btn--show-login'),
  //       flipContainer = $('.flip-container');


  //   buttonTriggerFlip.on('click', function(e){

  //     e.preventDefault();
  //     isWelcomeFlipped = true;
  //     flipContainer.addClass('flip');
  //     buttonTriggerFlip.fadeTo(300, 0).css('visibility', 'hidden');
  //   });


  //   $('.wrapper--welcome, .footer--welcome').on('click', function(e){
      
  //     // если кликаем на карточке, то переворачивать не надо
  //     if (e.target.closest('.welcome__card') !== null) {
  //       return;
  //     }
  //     // если кликаем не на карточке, то
  //     if (isWelcomeFlipped && 
  //         e.target.id != buttonTriggerFlip.attr('id')
  //       ) {

  //       isWelcomeFlipped = false;
  //       flipContainer.removeClass('flip');
  //       buttonTriggerFlip.fadeTo(300, 1, function(){
  //         buttonTriggerFlip.css('visibility', 'visible');
  //       })
  //     }

  //   });

  //   $('.btn--hide-login').on('click', function(e){

  //     e.preventDefault();
  //     isWelcomeFlipped = false;
  //     flipContainer.removeClass('flip');
  //     buttonTriggerFlip.fadeTo(300, 1).css('visibility', 'visible');
  //   });

  // })();