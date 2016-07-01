var loginForm = (function () {

  function init () {
    _setUpListeners();
  };

  function _setUpListeners () {
    $('#login-btn').on('click', _submitForm);  
    $('.form--login input').on('keydown', _clearErrorStyles);  
  };

  function _clearErrorStyles(e) {
    var element = $(this);
    element.css({
      'background-color': '#fff'
    });
  }
  function _submitForm(e) {
    console.log('submitting Login Form ');
    e.preventDefault();
    var
      form = $(this).closest('.form'),
      data = form.serialize();

    validation.validateForm(form);

  }

  return {
    init: init
  };

})();

loginForm.init();