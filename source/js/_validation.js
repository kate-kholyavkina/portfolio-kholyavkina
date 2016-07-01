var validation = (function () {

  function validateForm (form) {

    var valid = true;
    var elements = form.find('input, textarea').not('input[type="checkbox"], ' + 
      'input[type="radio"], input[type="hidden"], input[type="file"],' + 
      'input[type="submit"]');


    $.each(elements, function(index, val){

      var 
        element = $(val),
        value = element.val();

      if (value.length === 0) {
        element.css({
          'background-color': 'rgba(255, 0, 0, 0.1)'
        });
        valid = false;
        modal.showMessage('Вы заполнили не все поля формы');
      }

    });

    return valid;
  }

  return {
    validateForm: validateForm
  };

})();
