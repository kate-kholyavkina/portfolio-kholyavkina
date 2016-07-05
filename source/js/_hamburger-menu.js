var hamburgerMenu = (function () {


  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $('#burger-btn').on('click', _toggleMenu);
  };


  function _toggleMenu(e) {

    $(this).toggleClass('burger-btn--active');
    $('body').toggleClass('overfow-hidden');
    $('.main-menu').toggleClass('main-menu--open');
  };


  return {
    init: init
  };

})();