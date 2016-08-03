var addBlogForm = (function () {
  var $addBlogBtn;

  function init (addBlogBtn) {
    $addBlogBtn = $(addBlogBtn);
    _setUpListeners();
  };

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
    
    console.log($(this));
    console.log(form);
    console.log(data);

    if (validation.validateForm(form)) {
      _sendForm(data, '/admin/blog');
    };
  }

  function _sendForm(data, url){
    $.ajax({
      type: "POST",
      url: url,
      cache: false,
      data: data
    }).done(function(response){
      console.log(response);
      modal.showMessage(response.message);
      // if (response.error) {
      //   modal.showMessage(response.error);
      // } else if (response.message) {
      // }
    }).fail(function(response){
      modal.showMessage('произошла непредвиденная ошибка. попробуйте еще раз или обратитесь к администратору');
    })
  };

  return {
    init: init
  };

})();
