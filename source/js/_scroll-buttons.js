var scrollButtons = (function () {


  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $('.scroll-control--down').on('click', _scrollDown)
    $('.scroll-control--up').on('click', _scrollUp)
  };


  function _scrollUp(e) {
    e.preventDefault();
    _scrollTo( '0', 700 );
  };


  function _scrollDown(e) {
    e.preventDefault();
    _scrollTo( $(".header").height() , 500);
  };


  function _scrollTo(pos, duration){
    $('html, body').animate({
      scrollTop: pos
    }, duration);
  }


  return {
    init: init
  };

})();