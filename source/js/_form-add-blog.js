var addBlogForm = (function () {
  var $addBlogBtn;

  function init (addBlogBtn) {
    $addBlogBtn = $(addBlogBtn);
    _putCurrentDate('#datePicker');
    _setUpListeners();
  };

  function _putCurrentDate(inputDate){
    var now = new Date();
    var dd = ("0" + now.getDate()).slice(-2);
    var mm = ("0" + (now.getMonth() + 1)).slice(-2);
    var yyyy = now.getFullYear();
    var today = yyyy+"-"+mm+"-"+dd ;
    $(inputDate).val(today);
  }

  function _setUpListeners () {
    $addBlogBtn.on('click', _submitForm);  
    $('.form--add-blog input, .form--add-blog textarea').on('keydown', _clearErrorStyles);  
  };


  function _clearErrorStyles() {
    validation.clearErrorStyles($(this));
  }
  
  function _submitForm(e) {
    e.preventDefault();

    var
      form = $(this).closest('.form'),
      data = form.serialize();

    if (validation.validateForm(form)) {
      _sendForm(data, '/admin/blog');
    };

    form[0].reset();
  }

  function _sendForm(data, url){
    $.ajax({
      type: "POST",
      url: url,
      cache: false,
      data: data
    }).done(function(response){
      console.log(response);
      if (response.error) {
        modal.showMessage(response.error);
      } else if (response.message) {
        modal.showMessage(response.message);
      }
    }).fail(function(response){
      modal.showMessage('произошла непредвиденная ошибка. попробуйте еще раз или обратитесь к администратору');
    })
  };

  return {
    init: init
  };

})();
