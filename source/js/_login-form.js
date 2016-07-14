var loginForm = (function () {

  function init () {
    _setUpListeners();
  };

  function _setUpListeners () {
    $('#login-btn').on('click', _submitForm);
    $('.form--login input').not('#login-btn').on('keydown', _clearErrorStyles);
  };

  function _clearErrorStyles() {
    validation.clearErrorStyles($(this));
  }

  function _submitForm(e) {
    console.log('submitting Login Form ');
    e.preventDefault();
    var
      form = $(this).closest('.form'),
      data = form.serialize();
      validationParameters = [{
        id: 'ishuman',
        type: 'checkbox',
        checked: true,
        errorMsg: 'Роботам здесь не место'
      }, {
        id: 'notrobot-yes',
        type: 'radio',
        checked: true,
        errorMsg: 'Роботам здесь не место'
      }, {
        id: 'notrobot-no',
        type: 'radio',
        checked: false,
        errorMsg: 'Роботам здесь не место'
      }];

    if (validation.validateForm(form, validationParameters)) {
      _sendForm(form);
    }

    function _sendForm(form){
      // $.ajax({
      //   type: "POST",
      //   url: 'assets/php/mail.php',
      //   cache: false,
      //   data: form.serialize()
      // }).done(function(html){
      //   modal.showMessage(html);
      // }).fail(function(html){
      //   modal.showMessage('Сообщение не отправлено!');
      // })
    };


  }

  return {
    init: init
  };

})();
