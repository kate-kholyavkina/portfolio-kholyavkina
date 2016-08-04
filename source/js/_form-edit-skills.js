var esitSkillsForm = (function () {
  var $editSkillsBtn;

  function init (editSkillsBtn) {
    $editSkillsBtn = $(editSkillsBtn);
    _setUpListeners();
  };

  function _setUpListeners () {
    $editSkillsBtn.on('click', _submitForm);  
    $('.form--edit-skills input').on('keydown', _clearErrorStyles);  
  };


  function _clearErrorStyles() {
    validation.clearErrorStyles($(this));
  }
  
  function _submitForm(e) {
    e.preventDefault();

    var form = $(this).closest('.form');
    var data = {};


      titlesGroups = form.find('.skills-group');
      $.each(titlesGroups, function(e){
        var items = $(this).find('input');
        var title  = $(this).attr('data-title');
        data[title] = items.serialize();
      });

    console.log(data);


    if (validation.validateForm(form)) {
      _sendForm(data, '/admin/about');
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
      if (response.error) {
        modal.showMessage(response.error);
      } else if (response.message) {
        modal.showMessage(response.message);
      }
    }).fail(function(response){
      modal.showMessage('Не удалось отправить запрос. Попробуйте еще раз или обратитесь к администратору');
    })
  };

  return {
    init: init
  };

})();
