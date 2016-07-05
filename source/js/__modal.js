var modal = (function () {


  function init() {
    _setUpListeners();
  }


  function showMessage(msg) {
    _showMessage(msg);
  }


  var 
    _modalHolder = $('.modal__holder'),
    _modal = $('.modal'),
    _modalText = $('.modal__text');


  // прослушка событий
  function _setUpListeners() {
    $('#modal-close').on("click", _hideMessage);
  }


  // показываем сообщение
  function _showMessage (msg) {
    _modalText.text(msg);
    _modal.animate({
      'top': '50%',
    }, 300);
    _modalHolder.show();
  }


  // прячем сообщение
  function _hideMessage(e) {
    e.preventDefault();
    _modal.animate({
      'top': '-100%',
    }, 300, function(){
      _modalHolder.hide();
    });
  };


  return {
    init: init,
    showMessage: showMessage
  };

})();


