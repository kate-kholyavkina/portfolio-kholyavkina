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

    validation.validateForm(form, [{
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
    }]);

  }

  return {
    init: init
  };

})();
