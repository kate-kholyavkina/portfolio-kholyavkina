var validation = (function () {


  function _validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    return re.test(email);
  }

  // закрашиваем некорректные инпуты в красный
  function setErrorStyles(element) {
    element.css({
      'background-color': '#fffafa'
    });
  }

  // перекрашиваем инпуты обратно в белый
  function clearErrorStyles(element) {

    // любые, кроме submit
    if (element.attr('type') == 'submit') {
      return;
    }

    element.css({
      'background-color': '#fff'
    });
  }



  function validateForm (form) {

    var valid = true;
        message = '';
    var elements = form.find('input, textarea').not(
      'input[type="hidden"], ' + 
      'input[type="file"], ' + 
      'input[type="submit"]'),
      //  элементы лдя дополнительной проверки. Если в форме есть специфические поля
      //  пример использования: нужно проверить инпут типа 'checkbox' с id 'ishuman' на то что он 'true', 
      //  в случае ошибки вывести 'errorMsg'.
      // 
      //  validation.validateForm(form, [{
      //    id: 'ishuman',
      //    type: 'checkbox',
      //    checked: true,
      //    errorMsg: 'Роботам здесь не место'
      //  }]);
      itemsToCheck = arguments[1];


    // каждый эл-т формы
    $.each(elements, function(index, elem){

      var 
        element = $(elem),
        value = element.val();

      // проверяем каждый эл-т на пустоту (кроме checkbox и radio)
      if (  (element.attr('type') != "checkbox") &&
            (element.attr('type') != "radio") &&
            (value.length === 0) ) {

        //если да, то ошибка 
        setErrorStyles(element);
        valid = false;
        message = 'Вы заполнили не все поля формы';
      }

      // проверяем каждый email валидатором имейлов
      if (element.attr('type') == "email") {


        // если имейл не валидный
        if (!_validateEmail(value)) {

          //то ошибка 
          setErrorStyles(element);
          valid = false;
          message = 'Некорректный email';
        }

      }

      // парсим список дополнительных элементов на проверку
      $(itemsToCheck).map(function(key, item){

        // если текущий элемент формы совпадает с каким-то из эл-тов списка itemsToCheck
        if (element.attr('id') === item.id) {

          // если это чекбокс или радио, 
          // &&
          // если значение checked не равно тому, что мы хотим (что мы передали при вызове) ( true/ false )
          if ( (item.type === 'checkbox' || item.type === 'radio') &&
            element.prop('checked') !== item.checked  ) {

            // то ошибка 
            setErrorStyles(element);
            valid = false;
            message = item.errorMsg;
          }
        }

      });


    });


    // выводим сообщение об ошибке с помощью модуля modal (_modal.js)
    if (message !== '') {
      modal.showMessage(message);
    }

    return valid;
  }

  return {
    validateForm: validateForm,
    setErrorStyles: setErrorStyles,
    clearErrorStyles: clearErrorStyles
  };

})();
