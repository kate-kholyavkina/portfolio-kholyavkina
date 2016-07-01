var loginForm = (function () {

  function init () {
    _setUpListeners();
  };

  function _setUpListeners () {
    $('#contact-btn').on('click', _submitForm);  
  };

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