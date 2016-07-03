var modal = (function () {

  function init() {
    _setUpListeners();
  }

  function showMessage(msg) {
    _showMessage(msg);
  }

  var modalHolder = $('.modal__holder');
  var modal = $('.modal');
  var modalText = $('.modal__text');

  // прослушка событий
  function _setUpListeners() {
    $('#modal-close').on("click", _hideMessage);
  }

  // показываем сообщение
  function _showMessage (msg) {

    modalText.text(msg);

    modal.animate({
      'top': '50%',
    }, 300);

    modalHolder.show();

  }

  // прячем сообщение
  function _hideMessage(e) {

    e.preventDefault();

    modal.animate({
      'top': '-100%',
    }, 300, function(){
      modalHolder.hide();
    });

  };

  return {
    init: init,
    showMessage: showMessage
  };

})();


modal.init();
