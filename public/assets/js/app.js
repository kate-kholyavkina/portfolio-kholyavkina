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
    _modal.css({
      'top': '50%',
      'opacity': '0'
    }).animate({
      'opacity': '1',
    }, 300);
    _modalHolder.show();
  }


  // прячем сообщение
  function _hideMessage(e) {
    e.preventDefault();
    _modal.css({
      'top': '-100%'
    }).animate({
      'opacity': '0',
    }, 300, function(){
      _modalHolder.hide();
    });
  };


  return {
    init: init,
    showMessage: showMessage
  };

})();

var preloader = (function () {

  var 
    // массив для всех изображений на странице
    _imgs = [],
    
    // будет использоваться из других модулей, чтобы проверить, отрисованы ли все элементы
    // т.к. document.ready из-за прелоадера срабатывает раньше, когда отрисован прелоадер, а не вся страница
    contentReady = $.Deferred();


  // инициальзация модуля
  function init () {
    _countImages();
    _startPreloader();

  };

  function _countImages(){

    // проходим по всем элементам на странице
    $.each($('*'), function(){
      var $this = $(this),
        background = $this.css('background-image'),
        img = $this.is('img');

      // записываем в массив все пути к бэкграундам
      if (background != 'none') {

        // в chrome в урле есть кавычки, вырезаем с ними. url("...") -> ...
        // в safari в урле нет кавычек, вырезаем без них. url( ... ) -> ...
        var path = background.replace('url("', "").replace('")', "");
        var path = path.replace('url(', "").replace(')', "");

        _imgs.push(path);
      }

      // записываем в массив все пути к картинкам
      if (img) {
        var path = '' + $this.attr('src');
        if ( (path) && ($this.css('display') !== 'none') ) {
          _imgs.push(path);
        }
      }

    });

  };


  function _startPreloader(){

    $('body').addClass('overflow-hidden');

    // загружено 0 картинок
    var loaded = 0;

    // проходим по всем собранным картинкам 
    for (var i = 0; i < _imgs.length; i++) {

      var image = $('<img>', {
        attr: {
          src: _imgs[i]
        }
      });

      // загружаем по подной 
      $(image).load(function(){
        loaded++;
        var percentLoaded = _countPercent(loaded,_imgs.length);
        _setPercent(percentLoaded);
      });

    };

  }

  // пересчитывает в проценты, сколько картинок загружено
  // current - number, сколько картинок загружено
  // total - number, сколько их всего
  function _countPercent(current, total){
    return Math.ceil(current / total * 100);
  }

  
  
  // записывает процент в div прелоадер
  // percent - number, какую цифру записать
  function _setPercent(percent){

    $('.preloader__percents').text(percent);

    // когда дошли до 100%, скрываем прелоадер и показываем содержимое страницы
    if (percent >= 100) {
      $('.preloader__hidden').css('display', 'block');
      $('.preloader').fadeOut(300);
      $('body').removeClass('overflow-hidden');
      _finishPreloader();
    }

  };

  function _finishPreloader(){

    contentReady.resolve();
  };



  return {
    init: init,
    contentReady: contentReady
  };

})();



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

var scrollspy = (function () {

  _nav = $('.blog-nav__link');



  function init () {
    _scrollSpy();
    _setUpListeners();
  };

  // if (_nav === 0) {
  //   return;
  // };

  // прослушка событий
  function _setUpListeners() {

    // по скроллу делаем scroll spy
    $(window).on("scroll", _scrollSpy);

    // по клику переходим на нужную статью с анимацией
    $(_nav).on("click", function(e){
      _showArticle($(e.target).attr('href'), true);
    });

    // по ссылке переходим на нужную статью без анимации
    $(function() {
      if (window.location.hash !== '') {
        _showArticle(window.location.hash, false);
      }
    });
  }


  // переход на нужную статью (с анимацией или без)
  function _showArticle(article, isAnimate) {
    var 
      direction = article.replace('#', ''),
      reqArticle = $('.articles__item').filter('[data-article="' + direction + '"]'),
      reqArticlePos = reqArticle.offset().top;

      if (isAnimate) {
        $('body, html').animate({
          scrollTop: reqArticlePos
        }, 500);
      } else {
        $('body, html').scrollTop(reqArticlePos);
      }
  }


  // scroll spy
  function _scrollSpy() {
    $('.articles__item').each(function(){
      var
        $this = $(this),
        topEdge = $this.offset().top - 200,
        btmEdge = topEdge + $this.height(),
        wScroll = $(window).scrollTop();

        if (topEdge < wScroll && btmEdge > wScroll) {
          var 
            currentId = $this.data('article'),
            activeLink = _nav.filter('[href="#' + currentId + '"]');

          activeLink.closest('.blog-nav__item').addClass('active').siblings().removeClass('active');
        }

    });
  };


  return {
    init: init
  };

})();



var blogMenuPanel = (function(){

  var html = $('html');
  var body = $('body');


  function init(){
    _setUpListeners();
    _locateMenu();
  };


  function _setUpListeners(){

    $('.off-canvas--menu').on('click', _openMenu);
    $('.off-canvas--content').on('click', _closeMenu);

    $(window).on({
      'resize': function() {
        _closeMenu();
        _locateMenu();
      },
      'scroll': _fixMenu
    });

  };


  function _openMenu(){
    if ( $( window ).width() < 768 ) {
      html.addClass('html--blog-opened');
    }
  }


  function _closeMenu(){
    if ( $( window ).width() < 768 ) {
      html.removeClass('html--blog-opened');
    }
  }


  function _fixMenu() {

    var header = $('.header');
    var headerHeight = header.height();
    var menu = $('.off-canvas--menu');
    var scrollY = window.scrollY;

    if (scrollY > headerHeight) {
      menu.addClass('fixed');
    } else {
      menu.removeClass('fixed');
    }
        
  }

  function _locateMenu() {

    var header = $('.header');
    var menu = $('.off-canvas--menu');

    //  menu 'top' is right under the header
    //  menu 'top' is 0 when menu is on green panel
    if ( $( window ).width() > 768 ) {
      menu.css('top', header.css('height'));
    } else {
      menu.css('top', '0');
    }
  }


  return {
    init: init
  };

})();

var blur = (function () {


  function init() {
    _setUpListeners();
  }

  function _setUpListeners() {
    // отрисовываем блюр по загрузке страницы и ресайзу окна
    $(window).on('load resize', _blur);
  }

  function _blur() {

    var bg = $('.blur__bg');

    if (bg.length === 0) {
      // return;
    };

    var form = $('.blur__form'),
      bgWidth = bg.width(),
      posTop  = bg.offset().top  - form.offset().top,
      posLeft = bg.offset().left - form.offset().left;

    form.css({
      'background-size': bgWidth + 'px' + ' ' + 'auto',
      'background-position': posLeft + 'px' + ' ' + posTop + 'px'
    });
  };

  return {
    init: init
  };

})();


var flipCard = (function () {


  var isWelcomeFlipped = false,
      buttonTriggerFlip = $('.btn--show-login'),
      flipContainer = $('.flip-container');


  function init () {
    _setUpListners();
  };


  function _setUpListners () {

    buttonTriggerFlip.on('click', _showLogin);
    $('.wrapper--welcome, .footer--welcome').on('click', _prepareToHide);
    $('.btn--hide-login').on('click', _hideLogin);
  };



  // переворачиваем обратно
  function _hideLogin(e) {

    e.preventDefault();

    isWelcomeFlipped = false;
    flipContainer.removeClass('flip');
    buttonTriggerFlip.fadeTo(300, 1, function(){
      buttonTriggerFlip.css('visibility', 'visible');
    });

  };



  // по клику на области вокруг, переворачиваем обратно
  function _prepareToHide(e) {
      // если кликаем на карточке, то переворачивать не надо
      if (e.target.closest('.welcome__card') !== null) {
        return;
      }
      // если карточка уже перевернута,
      if (isWelcomeFlipped 
        // и мы кликнули не по кнопке "Авторизоваться"
        && e.target.id != buttonTriggerFlip.attr('id')
        ) {
        // то переворачиваем обратно
        _hideLogin(e);
      }
  };


  
  function _showLogin(e) {

    e.preventDefault();
    isWelcomeFlipped = true;
    flipContainer.addClass('flip');
    buttonTriggerFlip.fadeTo(300, 0).css('visibility', 'hidden');
  };


  return {
    init: init
  };

})();

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

var contactForm = (function () {

  function init () {
    _setUpListeners();
  };

  function _setUpListeners () {
    $('#contact-btn').on('click', _submitForm);  
    $('.form--contact input, .form--contact textarea').on('keydown', _clearErrorStyles);  
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
      _sendForm(form);
    };

  }

  function _sendForm(form){
    $.ajax({
      type: "POST",
      url: 'assets/php/mail.php',
      cache: false,
      data: form.serialize()
    }).done(function(html){
      modal.showMessage(html);
    }).fail(function(html){
      modal.showMessage('Сообщение не отправлено!');
    })
  }

  return {
    init: init
  };

})();

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

    formIsValid = validation.validateForm(form, [{
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

    if (formIsValid) {
      _sendForm(data, '/auth/')
    }
  }

  function _sendForm(data, url){
    $.ajax({
      type: "POST",
      url: url,
      cache: false,
      data: data
    }).done(function(response){
      if (response.error) {
        modal.showMessage(response.error);
      } else {
        window.location.href = '/admin';
      }
    }).fail(function(response){
      modal.showMessage('произошла непредвиденная ошибка. попробуйте еще раз или обратитесь к администратору');
    })
  };

  return {
    init: init
  };

})();

var hamburgerMenu = (function () {


  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $('#burger-btn').on('click', _toggleMenu);
  };


  function _toggleMenu(e) {

    $(this).toggleClass('burger-btn--active');
    $('body').toggleClass('overfow-hidden');
    $('.main-menu').toggleClass('main-menu--open');
  };


  return {
    init: init
  };

})();
var map = (function () {


function init() {
    var 
      mapDiv = document.getElementById('map'),
      isDraggable;

      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        isDraggable = false;
      } else {
        isDraggable = true;
      }
    
    var mapOptions = {
      center: {
        lat: 50.445008, 
        lng: 30.514811
      },
      zoom: 12,
      disableDefaultUI: true,
      scrollwheel: false,
      draggable: isDraggable,
      styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.country","elementType":"geometry.fill","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#2bd3b7"},{"visibility":"simplified"}]}]
    }


    var map = new google.maps.Map(mapDiv, mapOptions);

  };


  return {
    init: init
  };

})();
var parallax = (function () {


  // инициальзация модуля
  function init () {
    // включаем прослушку 
    _setUpListners();
    // сразу же ищем ширину и высоту параллакса
    _parallaxResize();
  };

  var 
      // скорость и размах движения слоев
      _speed = 1 / 50,
      _window    = $(window),
      _wWidth  = _window.innerWidth(),
      _wHeight = _window.innerHeight(),
      _halfWidth  = _window.innerWidth() / 2,
      _halfHeight = _window.innerHeight() / 2,
      _layers  = $('.parallax').find('.parallax__layer');



  // устанавлмваем прослушку на движение мыши и ресайз окна
  function _setUpListners () {
    $(window).on('mousemove', _parallaxMove);
    $(window).on('resize', _parallaxResize);
  };

  // функция пересчитывает ширину и высоту для слоев параллакса
  function _parallaxResize() {


    // каждый раз при ресайзе пересчитаываем размеры окна
    var 
      _wWidth  = _window.innerWidth(),
      _wHeight = _window.innerHeight(),
      _halfHeight = _window.innerHeight() / 2;

    // ищем максимальный номер слоя
    var maxIndex = _layers.length -1;

    // у картинки будут отступы справа и слева, чтобы параллакс полностью помещался.
    // отступы равны максимальному сдвигу слоев
    // (самый последний слой двигается больше всех, так что ищем именнно его максимальный сдвиг)
    var maxShiftX = _halfWidth * maxIndex * _speed,


        // ширина "расширенной" картинки: ширина окна + 2 отступа
        widthWider = _wWidth + (maxShiftX * 2),

        //соотношение сторон экрана (высоту экрана делим на ширину "расширенной" картинки)
        windowRatio = (_wHeight / widthWider),

        //соотношение сторон реальной картинки
        pictureRatio = (1994 / 3000);


    // если картинка помещается в экран по высоте, то надо ее увеличить
    if ( windowRatio > pictureRatio ) {
      // высота = высоте экрана, все остальное рассчитываем, исходя из этой высоты
      parallaxHeight = _wHeight + 'px';
      parallaxWidth = _wHeight / pictureRatio;
      parallaxMarginLeft = (parallaxWidth  - _wWidth) / 2;

    // если картинка не помещается в экран по высоте, то высота будет рассчитываться автоматически
    // будем выравнивать по ширине
    } else {

      // ширина = ширине экрана (+ 2 отступа), все остальное рассчитываем, исходя из этой ширины
      parallaxWidth = widthWider;
      parallaxHeight = 'auto';
      parallaxMarginLeft = maxShiftX;

    }

    // подставляем найденные значения ширины, высоты и margin-left всем слоям
    _layers.css( {
      'width': parallaxWidth + 'px',
      'height': parallaxHeight,
      'margin-left': '-' + parallaxMarginLeft + 'px'
    });


    $.each(_layers, function(index, elem){
      // topShift - это величина, на которую нужно сдвинуть каждый слой вниз, чтобы не было видно краев 
      topShift =  (_halfHeight * index * _speed);
      $(elem).css({
        'top': topShift + 'px',
      });
    });
    
  };




  // функция двигает слои в зависимости от положения мыши
  function _parallaxMove (e) {

    var 
        // положение мыши
        mouseX  = e.pageX,
        mouseY  = e.pageY,

        // положение мыши в нашей новой системе координат (с центром в середине экрана)
        coordX  = _halfWidth - mouseX,
        coordY  = _halfHeight - mouseY;

        // move each layer
        $.each(_layers, function(index, elem){

          // рассчитываем для каждого слоя, на сколько его сдвигать
          var shiftX = Math.round(coordX * index * _speed),
              shiftY = Math.round(coordY * index * _speed),
              // topShift - это величина, на которую нужно сдвинуть каждый слой вниз, чтобы не было видно краев 
              topShift =  (_halfHeight * index * _speed);

          $(elem).css({
            'top': topShift + 'px',
            'transform': 'translate3d(' + shiftX + 'px, ' + shiftY + 'px, ' + ' 0)'
          });
        });
  }


  return {
    init: init
  };

})();


var scrollButtons = (function () {


  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $('.scroll-control--down').on('click', _scrollDown)
    $('.scroll-control--up').on('click', _scrollUp)
  };


  function _scrollUp(e) {
    e.preventDefault();
    _scrollTo( '0', 700 );
  };


  function _scrollDown(e) {
    e.preventDefault();
    _scrollTo( $(".header").height() , 500);
  };


  function _scrollTo(pos, duration){
    $('html, body').animate({
      scrollTop: pos
    }, duration);
  }


  return {
    init: init
  };

})();
var skillsAnimation = (function () {


  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $(window).on('scroll', _scroll);
  };

  // если доскроллили до блока со скилами, то показываем их
  function _scroll(e) {
    
    wScroll = $(window).scrollTop();
    skillsTop = $('.skills-block').offset().top - 200;

    if (wScroll > skillsTop) {
      _showSkills();
    }

    
  }


  // функция показывает и анимирует скилы.
  function _showSkills(){

    var arc, circumference;
    var time = 0;
    var delay = 150;

    $('circle.inner').each(function(i, el){
      
      var arc = Math.ceil($(el).data('arc'));
      var circumference = Math.ceil($(el).data('circumference'));

      // анимируем каждый круг с большей задержкой
      setTimeout(function(){

        $(el).closest('.skills__item').animate({
          'opacity': '1'
        }, 300);

        $(el).css('stroke-dasharray', arc+'px ' + circumference + 'px');

      }, time += delay );
    });

  }


  return {
    init: init
  };

})();
var sliderTitlesAnimation = (function () {

  function init () {
    _animateTitles();
  };


  // функция проходит по всем заголовкам слайдера. функция генерирует html-код, 
  // заворачивающий все буквы и слова в html-теги для дальнейшей работы с ними с помощью css
  function _animateTitles() {

    var 
      _titles = $('.slider__info .section-title__inner'),
      inject;


    // каждый заголовок
    _titles.each(function(){
      
      var 
        $this = $(this),
        titleText = $this.text();

      // очищаем заголовок, чтобы потом вставить туда сгенерированный код
      $this.html('');

      // счетчик для номеров букв в заголовке
      var i = 0;

      // работаем с каждым словом: 
      $.each(titleText.split(' '), function(c, word) {

          // очищаем слово
          inject = '';

          // каждая буква завернута в span с классами char--1, char--2, ... . 
          // на основании этих классов буквам в css проставляется соответствующий animation-delay.
          $.each(word.split(''), function(k, char) {
            inject += '<span class="char char--' + i + '">' + char + '</span>';
            i++;
          });

          // каждое слово завернуто в span class="word", чтобы решить проблему с переносом строк посреди слова
          var word = '<span class="word">' + inject + '</span>';


          $this.append(word);
      });

    });
  };


  return {
    init: init
  };

})();

var slider = (function () {

  function init () {
    _setUpListners();
  };


  function _setUpListners () {
    $('.slider__control').on('click', _moveSlider);
  };


  // уменьшает номер слайда на единицу (если надо, закольцовывает)
  function _indexDec(activeIndex, maxIndex) {
      var prevIndex = (activeIndex <=   0  ) ? maxIndex : activeIndex - 1;
      return prevIndex;
  };


  // увеличивает номер слайда на единицу (если надо, закольцовывает)
  function _indexInc(activeIndex, maxIndex) {
      var nextIndex = (activeIndex >= maxIndex) ?   0   : activeIndex + 1;
      return nextIndex;
  };


  // функция анимирует маленькие слайдеры (prev, next)
  // direction - направление слайдера, принимает значения 'up'/'down', вниз/вверх
  // control - слайдер, который нужно проанимировать: левый или правый
  // newIndex - номер слайда, который показать следуюшим
  function _moveSmallSlider(direction, control, newIndex) {
    var 
      items = control.find('.control__item'),
      oldItem = control.find('.control__item--active'),
      newItem = items.eq(newIndex);


      oldItem.removeClass('control__item--active');
      newItem.addClass('control__item--active');


    if (direction == 'up') {

        newItem.css('top', '100%');
        oldItem.animate({'top': '-100%'}, 300);
        newItem.animate({'top': '0'}, 300);

    };
    if (direction == 'down') {

        newItem.css('top', '-100%');
        oldItem.animate({'top': '100%'}, 300);
        newItem.animate({'top': '0'}, 300);
      
    };
  };


  // функция анимирует большой слайдер
  // indexToHide - слайд, который нужно скрыть
  // indexToShow - слайд, который нужно показать
  // items - все слайды
  function _displaySlide(indexToHide, indexToShow, items) {

    var 
      itemToHide = items.eq(indexToHide),
      itemToShow = items.eq(indexToShow);

    itemToHide.removeClass('slider__item--active');
    itemToHide.animate({'opacity': '0'}, 150);

    itemToShow.addClass('slider__item--active');
    itemToShow.delay(150).animate({'opacity': '1'}, 150);
  };


  // функция анимирует слайдер с информацией
  // indexToHide - слайд, который нужно скрыть
  // indexToShow - слайд, который нужно показать
  // infoItems - все слайды с информацией
  function _displayInfo(indexToHide, indexToShow, infoItems) {
    infoItems.eq(indexToHide).css('display', 'none');
    infoItems.eq(indexToShow).css('display', 'inline-block');
  }




  // функция опеределяет, по какому контролу мы кликнули и вызывает соответствующие:
  // _displayInfo, чтобы показать нужную информацию
  // _displaySlide., чтобы показать нужный слайд
  // _moveSmallSlider, чтобы проанимировать prev control 
  // _moveSmallSlider, чтобы проанимировать next control 
  function _moveSlider (e) {

      e.preventDefault();

      var
        $this = $(this),
        container = $this.closest('.slider'),
        items = container.find('.slider__item'),
        infoItems = container.find('.slider__item-info'),
        maxIndex = items.length - 1,
        prevControl = container.find('.slider__control--prev'),
        nextControl = container.find('.slider__control--next'),
        activeItem = container.find('.slider__item--active'),
        activeIndex = items.index(activeItem),
        prevIndex = _indexDec(activeIndex, maxIndex),
        nextIndex = _indexInc(activeIndex, maxIndex);

      // показать предыдущий слайд
      if ( $this.hasClass('slider__control--prev') ) {

        var prevIndexDec = _indexDec(prevIndex, maxIndex);
        var nextIndexDec = _indexDec(nextIndex, maxIndex);

        _displaySlide(activeIndex, prevIndex, items);
        _displayInfo(activeIndex, prevIndex, infoItems);

        _moveSmallSlider('up', prevControl, prevIndexDec);
        _moveSmallSlider('down', nextControl, nextIndexDec);

      };


      // показать следующий слайд
      if ( $this.hasClass('slider__control--next') ) {

        var prevIndexInc = _indexInc(prevIndex, maxIndex);
        var nextIndexInc = _indexInc(nextIndex, maxIndex);
        
        _displaySlide(activeIndex, nextIndex, items);
        _displayInfo(activeIndex, nextIndex, infoItems);

        _moveSmallSlider('up', prevControl, prevIndexInc);
        _moveSmallSlider('down', nextControl, nextIndexInc);

      };
  };

  return {
    init: init
  };

})();

(function() {
  'use strict';

  preloader.init();
  modal.init();
  hamburgerMenu.init();
  scrollButtons.init();



  // на странице index
  if (window.location.pathname == '/index.html' || window.location.pathname == '/') {

    parallax.init();
    loginForm.init();
    flipCard.init();
  }


  // на странице blog
  if (window.location.pathname == '/blog.html') {

    // Модуль blogMenu должен быть инициализирован после отрисовки всех элементов,
    // для чего логично было бы использовать document.ready
    // Но использование document.ready тут невозможно из-за прелоадера, 
    // так как для правильной работы прелоадера у всех элементов сначала стоит display: none.
    // из-за этого document.ready срабатывает слишком рано, когда отрисован только прелоадер.
    // 
    // поэтому пришлось создать Deferred объект в модуле preloader: preloader.contentReady
    // preloader.contentReady получает метод .resolve() только после того, как все элементы получают display: block
    // Соответственно, инициализация blogMenu происходит после получения display: block и отрисовки всех элементов

    preloader.contentReady.done(function() { 
      scrollspy.init();
      blogMenuPanel.init();
    });
  }


  // на странице works
  if (window.location.pathname == '/works.html') {

    blur.init();
    slider.init();
    sliderTitlesAnimation.init();
    contactForm.init();
  }


  // на странице about
  if (window.location.pathname == '/about.html') {
    skillsAnimation.init();
  }

  // ---------------------------
  // Adding Blog Post Init
  // ---------------------------
  if ($('#add-blog-btn').length) {
    addBlogForm.init('#add-blog-btn');
  }


  // ---------------------------
  // Edit Skills Init
  // ---------------------------
  if ($('#edit-skills-btn').length) {
    esitSkillsForm.init('#edit-skills-btn');
  }


  // ---------------------------
  // Edit Skills Init
  // ---------------------------
  // if ($('#js-get-admin-about').length) {
  //   $('#js-get-admin-about').on('click', function(){

  //     $.ajax({
  //       type: "GET",
  //       url: '/admin/',
  //       cache: false,
  //       data: {}
  //     }).done(function(response){
  //       // if (response.error) {
  //       //   modal.showMessage(response.error);
  //       // } else {
  //       //   window.location.href = '/admin';
  //       // }
  //     }).fail(function(response){
  //       modal.showMessage('произошла непредвиденная ошибка. попробуйте еще раз или обратитесь к администратору');
  //     })
  //   })
  // }

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9fbW9kYWwuanMiLCJfX3ByZWxvYWRlci5qcyIsIl9fdmFsaWRhdGlvbi5qcyIsIl9ibG9nLW1lbnUuanMiLCJfYmx1ci5qcyIsIl9mbGlwLmpzIiwiX2Zvcm0tYWRkLWJsb2cuanMiLCJfZm9ybS1jb250YWN0LmpzIiwiX2Zvcm0tZWRpdC1za2lsbHMuanMiLCJfZm9ybS1sb2dpbi5qcyIsIl9oYW1idXJnZXItbWVudS5qcyIsIl9tYXAuanMiLCJfcGFyYWxsYXguanMiLCJfc2Nyb2xsLWJ1dHRvbnMuanMiLCJfc2tpbGxzLmpzIiwiX3NsaWRlci10aXRsZXMuanMiLCJfc2xpZGVyLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIG1vZGFsID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlKG1zZykge1xuICAgIF9zaG93TWVzc2FnZShtc2cpO1xuICB9XG5cblxuICB2YXIgXG4gICAgX21vZGFsSG9sZGVyID0gJCgnLm1vZGFsX19ob2xkZXInKSxcbiAgICBfbW9kYWwgPSAkKCcubW9kYWwnKSxcbiAgICBfbW9kYWxUZXh0ID0gJCgnLm1vZGFsX190ZXh0Jyk7XG5cblxuICAvLyDQv9GA0L7RgdC70YPRiNC60LAg0YHQvtCx0YvRgtC40LlcbiAgZnVuY3Rpb24gX3NldFVwTGlzdGVuZXJzKCkge1xuICAgICQoJyNtb2RhbC1jbG9zZScpLm9uKFwiY2xpY2tcIiwgX2hpZGVNZXNzYWdlKTtcbiAgfVxuXG5cbiAgLy8g0L/QvtC60LDQt9GL0LLQsNC10Lwg0YHQvtC+0LHRidC10L3QuNC1XG4gIGZ1bmN0aW9uIF9zaG93TWVzc2FnZSAobXNnKSB7XG4gICAgX21vZGFsVGV4dC50ZXh0KG1zZyk7XG4gICAgX21vZGFsLmNzcyh7XG4gICAgICAndG9wJzogJzUwJScsXG4gICAgICAnb3BhY2l0eSc6ICcwJ1xuICAgIH0pLmFuaW1hdGUoe1xuICAgICAgJ29wYWNpdHknOiAnMScsXG4gICAgfSwgMzAwKTtcbiAgICBfbW9kYWxIb2xkZXIuc2hvdygpO1xuICB9XG5cblxuICAvLyDQv9GA0Y/Rh9C10Lwg0YHQvtC+0LHRidC10L3QuNC1XG4gIGZ1bmN0aW9uIF9oaWRlTWVzc2FnZShlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIF9tb2RhbC5jc3Moe1xuICAgICAgJ3RvcCc6ICctMTAwJSdcbiAgICB9KS5hbmltYXRlKHtcbiAgICAgICdvcGFjaXR5JzogJzAnLFxuICAgIH0sIDMwMCwgZnVuY3Rpb24oKXtcbiAgICAgIF9tb2RhbEhvbGRlci5oaWRlKCk7XG4gICAgfSk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgc2hvd01lc3NhZ2U6IHNob3dNZXNzYWdlXG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgcHJlbG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcblxuICB2YXIgXG4gICAgLy8g0LzQsNGB0YHQuNCyINC00LvRjyDQstGB0LXRhSDQuNC30L7QsdGA0LDQttC10L3QuNC5INC90LAg0YHRgtGA0LDQvdC40YbQtVxuICAgIF9pbWdzID0gW10sXG4gICAgXG4gICAgLy8g0LHRg9C00LXRgiDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC40Lcg0LTRgNGD0LPQuNGFINC80L7QtNGD0LvQtdC5LCDRh9GC0L7QsdGLINC/0YDQvtCy0LXRgNC40YLRjCwg0L7RgtGA0LjRgdC+0LLQsNC90Ysg0LvQuCDQstGB0LUg0Y3Qu9C10LzQtdC90YLRi1xuICAgIC8vINGCLtC6LiBkb2N1bWVudC5yZWFkeSDQuNC3LdC30LAg0L/RgNC10LvQvtCw0LTQtdGA0LAg0YHRgNCw0LHQsNGC0YvQstCw0LXRgiDRgNCw0L3RjNGI0LUsINC60L7Qs9C00LAg0L7RgtGA0LjRgdC+0LLQsNC9INC/0YDQtdC70L7QsNC00LXRgCwg0LAg0L3QtSDQstGB0Y8g0YHRgtGA0LDQvdC40YbQsFxuICAgIGNvbnRlbnRSZWFkeSA9ICQuRGVmZXJyZWQoKTtcblxuXG4gIC8vINC40L3QuNGG0LjQsNC70YzQt9Cw0YbQuNGPINC80L7QtNGD0LvRj1xuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfY291bnRJbWFnZXMoKTtcbiAgICBfc3RhcnRQcmVsb2FkZXIoKTtcblxuICB9O1xuXG4gIGZ1bmN0aW9uIF9jb3VudEltYWdlcygpe1xuXG4gICAgLy8g0L/RgNC+0YXQvtC00LjQvCDQv9C+INCy0YHQtdC8INGN0LvQtdC80LXQvdGC0LDQvCDQvdCwINGB0YLRgNCw0L3QuNGG0LVcbiAgICAkLmVhY2goJCgnKicpLCBmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgYmFja2dyb3VuZCA9ICR0aGlzLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLFxuICAgICAgICBpbWcgPSAkdGhpcy5pcygnaW1nJyk7XG5cbiAgICAgIC8vINC30LDQv9C40YHRi9Cy0LDQtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0L/Rg9GC0Lgg0Log0LHRjdC60LPRgNCw0YPQvdC00LDQvFxuICAgICAgaWYgKGJhY2tncm91bmQgIT0gJ25vbmUnKSB7XG5cbiAgICAgICAgLy8g0LIgY2hyb21lINCyINGD0YDQu9C1INC10YHRgtGMINC60LDQstGL0YfQutC4LCDQstGL0YDQtdC30LDQtdC8INGBINC90LjQvNC4LiB1cmwoXCIuLi5cIikgLT4gLi4uXG4gICAgICAgIC8vINCyIHNhZmFyaSDQsiDRg9GA0LvQtSDQvdC10YIg0LrQsNCy0YvRh9C10LosINCy0YvRgNC10LfQsNC10Lwg0LHQtdC3INC90LjRhS4gdXJsKCAuLi4gKSAtPiAuLi5cbiAgICAgICAgdmFyIHBhdGggPSBiYWNrZ3JvdW5kLnJlcGxhY2UoJ3VybChcIicsIFwiXCIpLnJlcGxhY2UoJ1wiKScsIFwiXCIpO1xuICAgICAgICB2YXIgcGF0aCA9IHBhdGgucmVwbGFjZSgndXJsKCcsIFwiXCIpLnJlcGxhY2UoJyknLCBcIlwiKTtcblxuICAgICAgICBfaW1ncy5wdXNoKHBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyDQt9Cw0L/QuNGB0YvQstCw0LXQvCDQsiDQvNCw0YHRgdC40LIg0LLRgdC1INC/0YPRgtC4INC6INC60LDRgNGC0LjQvdC60LDQvFxuICAgICAgaWYgKGltZykge1xuICAgICAgICB2YXIgcGF0aCA9ICcnICsgJHRoaXMuYXR0cignc3JjJyk7XG4gICAgICAgIGlmICggKHBhdGgpICYmICgkdGhpcy5jc3MoJ2Rpc3BsYXknKSAhPT0gJ25vbmUnKSApIHtcbiAgICAgICAgICBfaW1ncy5wdXNoKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9KTtcblxuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3N0YXJ0UHJlbG9hZGVyKCl7XG5cbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuXG4gICAgLy8g0LfQsNCz0YDRg9C20LXQvdC+IDAg0LrQsNGA0YLQuNC90L7QulxuICAgIHZhciBsb2FkZWQgPSAwO1xuXG4gICAgLy8g0L/RgNC+0YXQvtC00LjQvCDQv9C+INCy0YHQtdC8INGB0L7QsdGA0LDQvdC90YvQvCDQutCw0YDRgtC40L3QutCw0LwgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfaW1ncy5sZW5ndGg7IGkrKykge1xuXG4gICAgICB2YXIgaW1hZ2UgPSAkKCc8aW1nPicsIHtcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIHNyYzogX2ltZ3NbaV1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vINC30LDQs9GA0YPQttCw0LXQvCDQv9C+INC/0L7QtNC90L7QuSBcbiAgICAgICQoaW1hZ2UpLmxvYWQoZnVuY3Rpb24oKXtcbiAgICAgICAgbG9hZGVkKys7XG4gICAgICAgIHZhciBwZXJjZW50TG9hZGVkID0gX2NvdW50UGVyY2VudChsb2FkZWQsX2ltZ3MubGVuZ3RoKTtcbiAgICAgICAgX3NldFBlcmNlbnQocGVyY2VudExvYWRlZCk7XG4gICAgICB9KTtcblxuICAgIH07XG5cbiAgfVxuXG4gIC8vINC/0LXRgNC10YHRh9C40YLRi9Cy0LDQtdGCINCyINC/0YDQvtGG0LXQvdGC0YssINGB0LrQvtC70YzQutC+INC60LDRgNGC0LjQvdC+0Log0LfQsNCz0YDRg9C20LXQvdC+XG4gIC8vIGN1cnJlbnQgLSBudW1iZXIsINGB0LrQvtC70YzQutC+INC60LDRgNGC0LjQvdC+0Log0LfQsNCz0YDRg9C20LXQvdC+XG4gIC8vIHRvdGFsIC0gbnVtYmVyLCDRgdC60L7Qu9GM0LrQviDQuNGFINCy0YHQtdCz0L5cbiAgZnVuY3Rpb24gX2NvdW50UGVyY2VudChjdXJyZW50LCB0b3RhbCl7XG4gICAgcmV0dXJuIE1hdGguY2VpbChjdXJyZW50IC8gdG90YWwgKiAxMDApO1xuICB9XG5cbiAgXG4gIFxuICAvLyDQt9Cw0L/QuNGB0YvQstCw0LXRgiDQv9GA0L7RhtC10L3RgiDQsiBkaXYg0L/RgNC10LvQvtCw0LTQtdGAXG4gIC8vIHBlcmNlbnQgLSBudW1iZXIsINC60LDQutGD0Y4g0YbQuNGE0YDRgyDQt9Cw0L/QuNGB0LDRgtGMXG4gIGZ1bmN0aW9uIF9zZXRQZXJjZW50KHBlcmNlbnQpe1xuXG4gICAgJCgnLnByZWxvYWRlcl9fcGVyY2VudHMnKS50ZXh0KHBlcmNlbnQpO1xuXG4gICAgLy8g0LrQvtCz0LTQsCDQtNC+0YjQu9C4INC00L4gMTAwJSwg0YHQutGA0YvQstCw0LXQvCDQv9GA0LXQu9C+0LDQtNC10YAg0Lgg0L/QvtC60LDQt9GL0LLQsNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0YHRgtGA0LDQvdC40YbRi1xuICAgIGlmIChwZXJjZW50ID49IDEwMCkge1xuICAgICAgJCgnLnByZWxvYWRlcl9faGlkZGVuJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAkKCcucHJlbG9hZGVyJykuZmFkZU91dCgzMDApO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdvdmVyZmxvdy1oaWRkZW4nKTtcbiAgICAgIF9maW5pc2hQcmVsb2FkZXIoKTtcbiAgICB9XG5cbiAgfTtcblxuICBmdW5jdGlvbiBfZmluaXNoUHJlbG9hZGVyKCl7XG5cbiAgICBjb250ZW50UmVhZHkucmVzb2x2ZSgpO1xuICB9O1xuXG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgY29udGVudFJlYWR5OiBjb250ZW50UmVhZHlcbiAgfTtcblxufSkoKTtcblxuXG4iLCJ2YXIgdmFsaWRhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cblxuICBmdW5jdGlvbiBfdmFsaWRhdGVFbWFpbChlbWFpbCkge1xuICAgIHZhciByZSA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuICAgIC8vIHZhciByZSA9IC9bQS1aMC05Ll8lKy1dK0BbQS1aMC05Li1dKy5bQS1aXXsyLDR9L2lnbTtcbiAgICByZXR1cm4gcmUudGVzdChlbWFpbCk7XG4gIH1cblxuICAvLyDQt9Cw0LrRgNCw0YjQuNCy0LDQtdC8INC90LXQutC+0YDRgNC10LrRgtC90YvQtSDQuNC90L/Rg9GC0Ysg0LIg0LrRgNCw0YHQvdGL0LlcbiAgZnVuY3Rpb24gc2V0RXJyb3JTdHlsZXMoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZmZhZmEnXG4gICAgfSk7XG4gIH1cblxuICAvLyDQv9C10YDQtdC60YDQsNGI0LjQstCw0LXQvCDQuNC90L/Rg9GC0Ysg0L7QsdGA0LDRgtC90L4g0LIg0LHQtdC70YvQuVxuICBmdW5jdGlvbiBjbGVhckVycm9yU3R5bGVzKGVsZW1lbnQpIHtcblxuICAgIC8vINC70Y7QsdGL0LUsINC60YDQvtC80LUgc3VibWl0XG4gICAgaWYgKGVsZW1lbnQuYXR0cigndHlwZScpID09ICdzdWJtaXQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWxlbWVudC5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZidcbiAgICB9KTtcbiAgfVxuXG5cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUZvcm0gKGZvcm0pIHtcblxuICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgIG1lc3NhZ2UgPSAnJztcbiAgICB2YXIgZWxlbWVudHMgPSBmb3JtLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYScpLm5vdChcbiAgICAgICdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdLCAnICsgXG4gICAgICAnaW5wdXRbdHlwZT1cImZpbGVcIl0sICcgKyBcbiAgICAgICdpbnB1dFt0eXBlPVwic3VibWl0XCJdJyksXG4gICAgICAvLyAg0Y3Qu9C10LzQtdC90YLRiyDQu9C00Y8g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90L7QuSDQv9GA0L7QstC10YDQutC4LiDQldGB0LvQuCDQsiDRhNC+0YDQvNC1INC10YHRgtGMINGB0L/QtdGG0LjRhNC40YfQtdGB0LrQuNC1INC/0L7Qu9GPXG4gICAgICAvLyAg0L/RgNC40LzQtdGAINC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPOiDQvdGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjCDQuNC90L/Rg9GCINGC0LjQv9CwICdjaGVja2JveCcg0YEgaWQgJ2lzaHVtYW4nINC90LAg0YLQviDRh9GC0L4g0L7QvSAndHJ1ZScsIFxuICAgICAgLy8gINCyINGB0LvRg9GH0LDQtSDQvtGI0LjQsdC60Lgg0LLRi9Cy0LXRgdGC0LggJ2Vycm9yTXNnJy5cbiAgICAgIC8vIFxuICAgICAgLy8gIHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0sIFt7XG4gICAgICAvLyAgICBpZDogJ2lzaHVtYW4nLFxuICAgICAgLy8gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgIC8vICAgIGNoZWNrZWQ6IHRydWUsXG4gICAgICAvLyAgICBlcnJvck1zZzogJ9Cg0L7QsdC+0YLQsNC8INC30LTQtdGB0Ywg0L3QtSDQvNC10YHRgtC+J1xuICAgICAgLy8gIH1dKTtcbiAgICAgIGl0ZW1zVG9DaGVjayA9IGFyZ3VtZW50c1sxXTtcblxuXG4gICAgLy8g0LrQsNC20LTRi9C5INGN0Lst0YIg0YTQvtGA0LzRi1xuICAgICQuZWFjaChlbGVtZW50cywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuXG4gICAgICB2YXIgXG4gICAgICAgIGVsZW1lbnQgPSAkKGVsZW0pLFxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQudmFsKCk7XG5cbiAgICAgIC8vINC/0YDQvtCy0LXRgNGP0LXQvCDQutCw0LbQtNGL0Lkg0Y3Quy3RgiDQvdCwINC/0YPRgdGC0L7RgtGDICjQutGA0L7QvNC1IGNoZWNrYm94INC4IHJhZGlvKVxuICAgICAgaWYgKCAgKGVsZW1lbnQuYXR0cigndHlwZScpICE9IFwiY2hlY2tib3hcIikgJiZcbiAgICAgICAgICAgIChlbGVtZW50LmF0dHIoJ3R5cGUnKSAhPSBcInJhZGlvXCIpICYmXG4gICAgICAgICAgICAodmFsdWUubGVuZ3RoID09PSAwKSApIHtcblxuICAgICAgICAvL9C10YHQu9C4INC00LAsINGC0L4g0L7RiNC40LHQutCwIFxuICAgICAgICBzZXRFcnJvclN0eWxlcyhlbGVtZW50KTtcbiAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgbWVzc2FnZSA9ICfQktGLINC30LDQv9C+0LvQvdC40LvQuCDQvdC1INCy0YHQtSDQv9C+0LvRjyDRhNC+0YDQvNGLJztcbiAgICAgIH1cblxuICAgICAgLy8g0L/RgNC+0LLQtdGA0Y/QtdC8INC60LDQttC00YvQuSBlbWFpbCDQstCw0LvQuNC00LDRgtC+0YDQvtC8INC40LzQtdC50LvQvtCyXG4gICAgICBpZiAoZWxlbWVudC5hdHRyKCd0eXBlJykgPT0gXCJlbWFpbFwiKSB7XG5cblxuICAgICAgICAvLyDQtdGB0LvQuCDQuNC80LXQudC7INC90LUg0LLQsNC70LjQtNC90YvQuVxuICAgICAgICBpZiAoIV92YWxpZGF0ZUVtYWlsKHZhbHVlKSkge1xuXG4gICAgICAgICAgLy/RgtC+INC+0YjQuNCx0LrQsCBcbiAgICAgICAgICBzZXRFcnJvclN0eWxlcyhlbGVtZW50KTtcbiAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgIG1lc3NhZ2UgPSAn0J3QtdC60L7RgNGA0LXQutGC0L3Ri9C5IGVtYWlsJztcbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIC8vINC/0LDRgNGB0LjQvCDRgdC/0LjRgdC+0Log0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvRhSDRjdC70LXQvNC10L3RgtC+0LIg0L3QsCDQv9GA0L7QstC10YDQutGDXG4gICAgICAkKGl0ZW1zVG9DaGVjaykubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSl7XG5cbiAgICAgICAgLy8g0LXRgdC70Lgg0YLQtdC60YPRidC40Lkg0Y3Qu9C10LzQtdC90YIg0YTQvtGA0LzRiyDRgdC+0LLQv9Cw0LTQsNC10YIg0YEg0LrQsNC60LjQvC3RgtC+INC40Lcg0Y3Quy3RgtC+0LIg0YHQv9C40YHQutCwIGl0ZW1zVG9DaGVja1xuICAgICAgICBpZiAoZWxlbWVudC5hdHRyKCdpZCcpID09PSBpdGVtLmlkKSB7XG5cbiAgICAgICAgICAvLyDQtdGB0LvQuCDRjdGC0L4g0YfQtdC60LHQvtC60YEg0LjQu9C4INGA0LDQtNC40L4sIFxuICAgICAgICAgIC8vICYmXG4gICAgICAgICAgLy8g0LXRgdC70Lgg0LfQvdCw0YfQtdC90LjQtSBjaGVja2VkINC90LUg0YDQsNCy0L3QviDRgtC+0LzRgywg0YfRgtC+INC80Ysg0YXQvtGC0LjQvCAo0YfRgtC+INC80Ysg0L/QtdGA0LXQtNCw0LvQuCDQv9GA0Lgg0LLRi9C30L7QstC1KSAoIHRydWUvIGZhbHNlIClcbiAgICAgICAgICBpZiAoIChpdGVtLnR5cGUgPT09ICdjaGVja2JveCcgfHwgaXRlbS50eXBlID09PSAncmFkaW8nKSAmJlxuICAgICAgICAgICAgZWxlbWVudC5wcm9wKCdjaGVja2VkJykgIT09IGl0ZW0uY2hlY2tlZCAgKSB7XG5cbiAgICAgICAgICAgIC8vINGC0L4g0L7RiNC40LHQutCwIFxuICAgICAgICAgICAgc2V0RXJyb3JTdHlsZXMoZWxlbWVudCk7XG4gICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgbWVzc2FnZSA9IGl0ZW0uZXJyb3JNc2c7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0pO1xuXG5cbiAgICB9KTtcblxuXG4gICAgLy8g0LLRi9Cy0L7QtNC40Lwg0YHQvtC+0LHRidC10L3QuNC1INC+0LEg0L7RiNC40LHQutC1INGBINC/0L7QvNC+0YnRjNGOINC80L7QtNGD0LvRjyBtb2RhbCAoX21vZGFsLmpzKVxuICAgIGlmIChtZXNzYWdlICE9PSAnJykge1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZGF0ZUZvcm06IHZhbGlkYXRlRm9ybSxcbiAgICBzZXRFcnJvclN0eWxlczogc2V0RXJyb3JTdHlsZXMsXG4gICAgY2xlYXJFcnJvclN0eWxlczogY2xlYXJFcnJvclN0eWxlc1xuICB9O1xuXG59KSgpO1xuIiwidmFyIHNjcm9sbHNweSA9IChmdW5jdGlvbiAoKSB7XG5cbiAgX25hdiA9ICQoJy5ibG9nLW5hdl9fbGluaycpO1xuXG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2Nyb2xsU3B5KCk7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gIH07XG5cbiAgLy8gaWYgKF9uYXYgPT09IDApIHtcbiAgLy8gICByZXR1cm47XG4gIC8vIH07XG5cbiAgLy8g0L/RgNC+0YHQu9GD0YjQutCwINGB0L7QsdGL0YLQuNC5XG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpIHtcblxuICAgIC8vINC/0L4g0YHQutGA0L7Qu9C70YMg0LTQtdC70LDQtdC8IHNjcm9sbCBzcHlcbiAgICAkKHdpbmRvdykub24oXCJzY3JvbGxcIiwgX3Njcm9sbFNweSk7XG5cbiAgICAvLyDQv9C+INC60LvQuNC60YMg0L/QtdGA0LXRhdC+0LTQuNC8INC90LAg0L3Rg9C20L3Rg9GOINGB0YLQsNGC0YzRjiDRgSDQsNC90LjQvNCw0YbQuNC10LlcbiAgICAkKF9uYXYpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSl7XG4gICAgICBfc2hvd0FydGljbGUoJChlLnRhcmdldCkuYXR0cignaHJlZicpLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIC8vINC/0L4g0YHRgdGL0LvQutC1INC/0LXRgNC10YXQvtC00LjQvCDQvdCwINC90YPQttC90YPRjiDRgdGC0LDRgtGM0Y4g0LHQtdC3INCw0L3QuNC80LDRhtC40LhcbiAgICAkKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICE9PSAnJykge1xuICAgICAgICBfc2hvd0FydGljbGUod2luZG93LmxvY2F0aW9uLmhhc2gsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLy8g0L/QtdGA0LXRhdC+0LQg0L3QsCDQvdGD0LbQvdGD0Y4g0YHRgtCw0YLRjNGOICjRgSDQsNC90LjQvNCw0YbQuNC10Lkg0LjQu9C4INCx0LXQtylcbiAgZnVuY3Rpb24gX3Nob3dBcnRpY2xlKGFydGljbGUsIGlzQW5pbWF0ZSkge1xuICAgIHZhciBcbiAgICAgIGRpcmVjdGlvbiA9IGFydGljbGUucmVwbGFjZSgnIycsICcnKSxcbiAgICAgIHJlcUFydGljbGUgPSAkKCcuYXJ0aWNsZXNfX2l0ZW0nKS5maWx0ZXIoJ1tkYXRhLWFydGljbGU9XCInICsgZGlyZWN0aW9uICsgJ1wiXScpLFxuICAgICAgcmVxQXJ0aWNsZVBvcyA9IHJlcUFydGljbGUub2Zmc2V0KCkudG9wO1xuXG4gICAgICBpZiAoaXNBbmltYXRlKSB7XG4gICAgICAgICQoJ2JvZHksIGh0bWwnKS5hbmltYXRlKHtcbiAgICAgICAgICBzY3JvbGxUb3A6IHJlcUFydGljbGVQb3NcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoJ2JvZHksIGh0bWwnKS5zY3JvbGxUb3AocmVxQXJ0aWNsZVBvcyk7XG4gICAgICB9XG4gIH1cblxuXG4gIC8vIHNjcm9sbCBzcHlcbiAgZnVuY3Rpb24gX3Njcm9sbFNweSgpIHtcbiAgICAkKCcuYXJ0aWNsZXNfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXJcbiAgICAgICAgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICB0b3BFZGdlID0gJHRoaXMub2Zmc2V0KCkudG9wIC0gMjAwLFxuICAgICAgICBidG1FZGdlID0gdG9wRWRnZSArICR0aGlzLmhlaWdodCgpLFxuICAgICAgICB3U2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAgIGlmICh0b3BFZGdlIDwgd1Njcm9sbCAmJiBidG1FZGdlID4gd1Njcm9sbCkge1xuICAgICAgICAgIHZhciBcbiAgICAgICAgICAgIGN1cnJlbnRJZCA9ICR0aGlzLmRhdGEoJ2FydGljbGUnKSxcbiAgICAgICAgICAgIGFjdGl2ZUxpbmsgPSBfbmF2LmZpbHRlcignW2hyZWY9XCIjJyArIGN1cnJlbnRJZCArICdcIl0nKTtcblxuICAgICAgICAgIGFjdGl2ZUxpbmsuY2xvc2VzdCgnLmJsb2ctbmF2X19pdGVtJykuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG5cbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuXG5cblxudmFyIGJsb2dNZW51UGFuZWwgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgaHRtbCA9ICQoJ2h0bWwnKTtcbiAgdmFyIGJvZHkgPSAkKCdib2R5Jyk7XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgX2xvY2F0ZU1lbnUoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpe1xuXG4gICAgJCgnLm9mZi1jYW52YXMtLW1lbnUnKS5vbignY2xpY2snLCBfb3Blbk1lbnUpO1xuICAgICQoJy5vZmYtY2FudmFzLS1jb250ZW50Jykub24oJ2NsaWNrJywgX2Nsb3NlTWVudSk7XG5cbiAgICAkKHdpbmRvdykub24oe1xuICAgICAgJ3Jlc2l6ZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBfY2xvc2VNZW51KCk7XG4gICAgICAgIF9sb2NhdGVNZW51KCk7XG4gICAgICB9LFxuICAgICAgJ3Njcm9sbCc6IF9maXhNZW51XG4gICAgfSk7XG5cbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9vcGVuTWVudSgpe1xuICAgIGlmICggJCggd2luZG93ICkud2lkdGgoKSA8IDc2OCApIHtcbiAgICAgIGh0bWwuYWRkQ2xhc3MoJ2h0bWwtLWJsb2ctb3BlbmVkJyk7XG4gICAgfVxuICB9XG5cblxuICBmdW5jdGlvbiBfY2xvc2VNZW51KCl7XG4gICAgaWYgKCAkKCB3aW5kb3cgKS53aWR0aCgpIDwgNzY4ICkge1xuICAgICAgaHRtbC5yZW1vdmVDbGFzcygnaHRtbC0tYmxvZy1vcGVuZWQnKTtcbiAgICB9XG4gIH1cblxuXG4gIGZ1bmN0aW9uIF9maXhNZW51KCkge1xuXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gaGVhZGVyLmhlaWdodCgpO1xuICAgIHZhciBtZW51ID0gJCgnLm9mZi1jYW52YXMtLW1lbnUnKTtcbiAgICB2YXIgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZO1xuXG4gICAgaWYgKHNjcm9sbFkgPiBoZWFkZXJIZWlnaHQpIHtcbiAgICAgIG1lbnUuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lbnUucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgfVxuICAgICAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIF9sb2NhdGVNZW51KCkge1xuXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcbiAgICB2YXIgbWVudSA9ICQoJy5vZmYtY2FudmFzLS1tZW51Jyk7XG5cbiAgICAvLyAgbWVudSAndG9wJyBpcyByaWdodCB1bmRlciB0aGUgaGVhZGVyXG4gICAgLy8gIG1lbnUgJ3RvcCcgaXMgMCB3aGVuIG1lbnUgaXMgb24gZ3JlZW4gcGFuZWxcbiAgICBpZiAoICQoIHdpbmRvdyApLndpZHRoKCkgPiA3NjggKSB7XG4gICAgICBtZW51LmNzcygndG9wJywgaGVhZGVyLmNzcygnaGVpZ2h0JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZW51LmNzcygndG9wJywgJzAnKTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwidmFyIGJsdXIgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpIHtcbiAgICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10Lwg0LHQu9GO0YAg0L/QviDQt9Cw0LPRgNGD0LfQutC1INGB0YLRgNCw0L3QuNGG0Ysg0Lgg0YDQtdGB0LDQudC30YMg0L7QutC90LBcbiAgICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplJywgX2JsdXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2JsdXIoKSB7XG5cbiAgICB2YXIgYmcgPSAkKCcuYmx1cl9fYmcnKTtcblxuICAgIGlmIChiZy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9O1xuXG4gICAgdmFyIGZvcm0gPSAkKCcuYmx1cl9fZm9ybScpLFxuICAgICAgYmdXaWR0aCA9IGJnLndpZHRoKCksXG4gICAgICBwb3NUb3AgID0gYmcub2Zmc2V0KCkudG9wICAtIGZvcm0ub2Zmc2V0KCkudG9wLFxuICAgICAgcG9zTGVmdCA9IGJnLm9mZnNldCgpLmxlZnQgLSBmb3JtLm9mZnNldCgpLmxlZnQ7XG5cbiAgICBmb3JtLmNzcyh7XG4gICAgICAnYmFja2dyb3VuZC1zaXplJzogYmdXaWR0aCArICdweCcgKyAnICcgKyAnYXV0bycsXG4gICAgICAnYmFja2dyb3VuZC1wb3NpdGlvbic6IHBvc0xlZnQgKyAncHgnICsgJyAnICsgcG9zVG9wICsgJ3B4J1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuXG4iLCJ2YXIgZmxpcENhcmQgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgdmFyIGlzV2VsY29tZUZsaXBwZWQgPSBmYWxzZSxcbiAgICAgIGJ1dHRvblRyaWdnZXJGbGlwID0gJCgnLmJ0bi0tc2hvdy1sb2dpbicpLFxuICAgICAgZmxpcENvbnRhaW5lciA9ICQoJy5mbGlwLWNvbnRhaW5lcicpO1xuXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcblxuICAgIGJ1dHRvblRyaWdnZXJGbGlwLm9uKCdjbGljaycsIF9zaG93TG9naW4pO1xuICAgICQoJy53cmFwcGVyLS13ZWxjb21lLCAuZm9vdGVyLS13ZWxjb21lJykub24oJ2NsaWNrJywgX3ByZXBhcmVUb0hpZGUpO1xuICAgICQoJy5idG4tLWhpZGUtbG9naW4nKS5vbignY2xpY2snLCBfaGlkZUxvZ2luKTtcbiAgfTtcblxuXG5cbiAgLy8g0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0LXQvCDQvtCx0YDQsNGC0L3QvlxuICBmdW5jdGlvbiBfaGlkZUxvZ2luKGUpIHtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlzV2VsY29tZUZsaXBwZWQgPSBmYWxzZTtcbiAgICBmbGlwQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdmbGlwJyk7XG4gICAgYnV0dG9uVHJpZ2dlckZsaXAuZmFkZVRvKDMwMCwgMSwgZnVuY3Rpb24oKXtcbiAgICAgIGJ1dHRvblRyaWdnZXJGbGlwLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgfSk7XG5cbiAgfTtcblxuXG5cbiAgLy8g0L/QviDQutC70LjQutGDINC90LAg0L7QsdC70LDRgdGC0Lgg0LLQvtC60YDRg9CzLCDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDQtdC8INC+0LHRgNCw0YLQvdC+XG4gIGZ1bmN0aW9uIF9wcmVwYXJlVG9IaWRlKGUpIHtcbiAgICAgIC8vINC10YHQu9C4INC60LvQuNC60LDQtdC8INC90LAg0LrQsNGA0YLQvtGH0LrQtSwg0YLQviDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMINC90LUg0L3QsNC00L5cbiAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCcud2VsY29tZV9fY2FyZCcpICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vINC10YHQu9C4INC60LDRgNGC0L7Rh9C60LAg0YPQttC1INC/0LXRgNC10LLQtdGA0L3Rg9GC0LAsXG4gICAgICBpZiAoaXNXZWxjb21lRmxpcHBlZCBcbiAgICAgICAgLy8g0Lgg0LzRiyDQutC70LjQutC90YPQu9C4INC90LUg0L/QviDQutC90L7Qv9C60LUgXCLQkNCy0YLQvtGA0LjQt9C+0LLQsNGC0YzRgdGPXCJcbiAgICAgICAgJiYgZS50YXJnZXQuaWQgIT0gYnV0dG9uVHJpZ2dlckZsaXAuYXR0cignaWQnKVxuICAgICAgICApIHtcbiAgICAgICAgLy8g0YLQviDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDQtdC8INC+0LHRgNCw0YLQvdC+XG4gICAgICAgIF9oaWRlTG9naW4oZSk7XG4gICAgICB9XG4gIH07XG5cblxuICBcbiAgZnVuY3Rpb24gX3Nob3dMb2dpbihlKSB7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaXNXZWxjb21lRmxpcHBlZCA9IHRydWU7XG4gICAgZmxpcENvbnRhaW5lci5hZGRDbGFzcygnZmxpcCcpO1xuICAgIGJ1dHRvblRyaWdnZXJGbGlwLmZhZGVUbygzMDAsIDApLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwidmFyIGFkZEJsb2dGb3JtID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyICRhZGRCbG9nQnRuO1xuXG4gIGZ1bmN0aW9uIGluaXQgKGFkZEJsb2dCdG4pIHtcbiAgICAkYWRkQmxvZ0J0biA9ICQoYWRkQmxvZ0J0bik7XG4gICAgX3B1dEN1cnJlbnREYXRlKCcjZGF0ZVBpY2tlcicpO1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIF9wdXRDdXJyZW50RGF0ZShpbnB1dERhdGUpe1xuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciBkZCA9IChcIjBcIiArIG5vdy5nZXREYXRlKCkpLnNsaWNlKC0yKTtcbiAgICB2YXIgbW0gPSAoXCIwXCIgKyAobm93LmdldE1vbnRoKCkgKyAxKSkuc2xpY2UoLTIpO1xuICAgIHZhciB5eXl5ID0gbm93LmdldEZ1bGxZZWFyKCk7XG4gICAgdmFyIHRvZGF5ID0geXl5eStcIi1cIittbStcIi1cIitkZCA7XG4gICAgJChpbnB1dERhdGUpLnZhbCh0b2RheSk7XG4gIH1cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICRhZGRCbG9nQnRuLm9uKCdjbGljaycsIF9zdWJtaXRGb3JtKTsgIFxuICAgICQoJy5mb3JtLS1hZGQtYmxvZyBpbnB1dCwgLmZvcm0tLWFkZC1ibG9nIHRleHRhcmVhJykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7ICBcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9jbGVhckVycm9yU3R5bGVzKCkge1xuICAgIHZhbGlkYXRpb24uY2xlYXJFcnJvclN0eWxlcygkKHRoaXMpKTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhclxuICAgICAgZm9ybSA9ICQodGhpcykuY2xvc2VzdCgnLmZvcm0nKSxcbiAgICAgIGRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xuXG4gICAgaWYgKHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0pKSB7XG4gICAgICBfc2VuZEZvcm0oZGF0YSwgJy9hZG1pbi9ibG9nJyk7XG4gICAgfTtcblxuICAgIGZvcm1bMF0ucmVzZXQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZW5kRm9ybShkYXRhLCB1cmwpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogdXJsLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgIG1vZGFsLnNob3dNZXNzYWdlKHJlc3BvbnNlLmVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICBtb2RhbC5zaG93TWVzc2FnZShyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIG1vZGFsLnNob3dNZXNzYWdlKCfQv9GA0L7QuNC30L7RiNC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LAuINC/0L7Qv9GA0L7QsdGD0LnRgtC1INC10YnQtSDRgNCw0Lcg0LjQu9C4INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INCw0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGA0YMnKTtcbiAgICB9KVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwidmFyIGNvbnRhY3RGb3JtID0gKGZ1bmN0aW9uICgpIHtcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICQoJyNjb250YWN0LWJ0bicpLm9uKCdjbGljaycsIF9zdWJtaXRGb3JtKTsgIFxuICAgICQoJy5mb3JtLS1jb250YWN0IGlucHV0LCAuZm9ybS0tY29udGFjdCB0ZXh0YXJlYScpLm9uKCdrZXlkb3duJywgX2NsZWFyRXJyb3JTdHlsZXMpOyAgXG4gIH07XG5cblxuICBmdW5jdGlvbiBfY2xlYXJFcnJvclN0eWxlcygpIHtcbiAgICB2YWxpZGF0aW9uLmNsZWFyRXJyb3JTdHlsZXMoJCh0aGlzKSk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIF9zdWJtaXRGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyXG4gICAgICBmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCcuZm9ybScpLFxuICAgICAgZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XG4gICAgXG4gICAgaWYgKHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0pKSB7XG4gICAgICBfc2VuZEZvcm0oZm9ybSk7XG4gICAgfTtcblxuICB9XG5cbiAgZnVuY3Rpb24gX3NlbmRGb3JtKGZvcm0pe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogJ2Fzc2V0cy9waHAvbWFpbC5waHAnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZm9ybS5zZXJpYWxpemUoKVxuICAgIH0pLmRvbmUoZnVuY3Rpb24oaHRtbCl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZShodG1sKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGh0bWwpe1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UoJ9Ch0L7QvtCx0YnQtdC90LjQtSDQvdC1INC+0YLQv9GA0LDQstC70LXQvdC+IScpO1xuICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBlc2l0U2tpbGxzRm9ybSA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciAkZWRpdFNraWxsc0J0bjtcblxuICBmdW5jdGlvbiBpbml0IChlZGl0U2tpbGxzQnRuKSB7XG4gICAgJGVkaXRTa2lsbHNCdG4gPSAkKGVkaXRTa2lsbHNCdG4pO1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycyAoKSB7XG4gICAgJGVkaXRTa2lsbHNCdG4ub24oJ2NsaWNrJywgX3N1Ym1pdEZvcm0pOyAgXG4gICAgJCgnLmZvcm0tLWVkaXQtc2tpbGxzIGlucHV0Jykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7ICBcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9jbGVhckVycm9yU3R5bGVzKCkge1xuICAgIHZhbGlkYXRpb24uY2xlYXJFcnJvclN0eWxlcygkKHRoaXMpKTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCcuZm9ybScpO1xuICAgIHZhciBkYXRhID0ge307XG5cblxuICAgICAgdGl0bGVzR3JvdXBzID0gZm9ybS5maW5kKCcuc2tpbGxzLWdyb3VwJyk7XG4gICAgICAkLmVhY2godGl0bGVzR3JvdXBzLCBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyIGl0ZW1zID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpO1xuICAgICAgICB2YXIgdGl0bGUgID0gJCh0aGlzKS5hdHRyKCdkYXRhLXRpdGxlJyk7XG4gICAgICAgIGRhdGFbdGl0bGVdID0gaXRlbXMuc2VyaWFsaXplKCk7XG4gICAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cbiAgICBpZiAodmFsaWRhdGlvbi52YWxpZGF0ZUZvcm0oZm9ybSkpIHtcbiAgICAgIF9zZW5kRm9ybShkYXRhLCAnL2FkbWluL2Fib3V0Jyk7XG4gICAgfTtcblxuICB9XG5cbiAgZnVuY3Rpb24gX3NlbmRGb3JtKGRhdGEsIHVybCl7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkuZG9uZShmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgbW9kYWwuc2hvd01lc3NhZ2UocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICAgIG1vZGFsLnNob3dNZXNzYWdlKHJlc3BvbnNlLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UoJ9Cd0LUg0YPQtNCw0LvQvtGB0Ywg0L7RgtC/0YDQsNCy0LjRgtGMINC30LDQv9GA0L7RgS4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0LXRidC1INGA0LDQtyDQuNC70Lgg0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDRgycpO1xuICAgIH0pXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgbG9naW5Gb3JtID0gKGZ1bmN0aW9uICgpIHtcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICQoJyNsb2dpbi1idG4nKS5vbignY2xpY2snLCBfc3VibWl0Rm9ybSk7XG4gICAgJCgnLmZvcm0tLWxvZ2luIGlucHV0Jykubm90KCcjbG9naW4tYnRuJykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gX2NsZWFyRXJyb3JTdHlsZXMoKSB7XG4gICAgdmFsaWRhdGlvbi5jbGVhckVycm9yU3R5bGVzKCQodGhpcykpO1xuICB9XG5cbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGNvbnNvbGUubG9nKCdzdWJtaXR0aW5nIExvZ2luIEZvcm0gJyk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhclxuICAgICAgZm9ybSA9ICQodGhpcykuY2xvc2VzdCgnLmZvcm0nKSxcbiAgICAgIGRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xuXG4gICAgZm9ybUlzVmFsaWQgPSB2YWxpZGF0aW9uLnZhbGlkYXRlRm9ybShmb3JtLCBbe1xuICAgICAgaWQ6ICdpc2h1bWFuJyxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBjaGVja2VkOiB0cnVlLFxuICAgICAgZXJyb3JNc2c6ICfQoNC+0LHQvtGC0LDQvCDQt9C00LXRgdGMINC90LUg0LzQtdGB0YLQvidcbiAgICB9LCB7XG4gICAgICBpZDogJ25vdHJvYm90LXllcycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogdHJ1ZSxcbiAgICAgIGVycm9yTXNnOiAn0KDQvtCx0L7RgtCw0Lwg0LfQtNC10YHRjCDQvdC1INC80LXRgdGC0L4nXG4gICAgfSwge1xuICAgICAgaWQ6ICdub3Ryb2JvdC1ubycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogZmFsc2UsXG4gICAgICBlcnJvck1zZzogJ9Cg0L7QsdC+0YLQsNC8INC30LTQtdGB0Ywg0L3QtSDQvNC10YHRgtC+J1xuICAgIH1dKTtcblxuICAgIGlmIChmb3JtSXNWYWxpZCkge1xuICAgICAgX3NlbmRGb3JtKGRhdGEsICcvYXV0aC8nKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZW5kRm9ybShkYXRhLCB1cmwpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogdXJsLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgIG1vZGFsLnNob3dNZXNzYWdlKHJlc3BvbnNlLmVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZSgn0L/RgNC+0LjQt9C+0YjQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLiDQv9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3INC40LvQuCDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQsNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgNGDJyk7XG4gICAgfSlcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBoYW1idXJnZXJNZW51ID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCgnI2J1cmdlci1idG4nKS5vbignY2xpY2snLCBfdG9nZ2xlTWVudSk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfdG9nZ2xlTWVudShlKSB7XG5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdidXJnZXItYnRuLS1hY3RpdmUnKTtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ292ZXJmb3ctaGlkZGVuJyk7XG4gICAgJCgnLm1haW4tbWVudScpLnRvZ2dsZUNsYXNzKCdtYWluLW1lbnUtLW9wZW4nKTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBtYXAgPSAoZnVuY3Rpb24gKCkge1xuXG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIFxuICAgICAgbWFwRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLFxuICAgICAgaXNEcmFnZ2FibGU7XG5cbiAgICAgIGlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XG4gICAgICAgIGlzRHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0RyYWdnYWJsZSA9IHRydWU7XG4gICAgICB9XG4gICAgXG4gICAgdmFyIG1hcE9wdGlvbnMgPSB7XG4gICAgICBjZW50ZXI6IHtcbiAgICAgICAgbGF0OiA1MC40NDUwMDgsIFxuICAgICAgICBsbmc6IDMwLjUxNDgxMVxuICAgICAgfSxcbiAgICAgIHpvb206IDEyLFxuICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcbiAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcbiAgICAgIGRyYWdnYWJsZTogaXNEcmFnZ2FibGUsXG4gICAgICBzdHlsZXM6IFt7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNDQ0NDQ0XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmNvdW50cnlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHRcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmNvdW50cnlcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLmljb25cIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2YyZjJmMlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5hdHRyYWN0aW9uXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuYnVzaW5lc3NcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5nb3Zlcm5tZW50XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kubWVkaWNhbFwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5wbGFjZV9vZl93b3JzaGlwXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuc3BvcnRzX2NvbXBsZXhcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOi0xMDB9LHtcImxpZ2h0bmVzc1wiOjQ1fSx7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcInNpbXBsaWZpZWRcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5hcnRlcmlhbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0LnN0YXRpb25cIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMmJkM2I3XCJ9LHtcInZpc2liaWxpdHlcIjpcInNpbXBsaWZpZWRcIn1dfV1cbiAgICB9XG5cblxuICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcERpdiwgbWFwT3B0aW9ucyk7XG5cbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBwYXJhbGxheCA9IChmdW5jdGlvbiAoKSB7XG5cblxuICAvLyDQuNC90LjRhtC40LDQu9GM0LfQsNGG0LjRjyDQvNC+0LTRg9C70Y9cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgLy8g0LLQutC70Y7Rh9Cw0LXQvCDQv9GA0L7RgdC70YPRiNC60YMgXG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgICAvLyDRgdGA0LDQt9GDINC20LUg0LjRidC10Lwg0YjQuNGA0LjQvdGDINC4INCy0YvRgdC+0YLRgyDQv9Cw0YDQsNC70LvQsNC60YHQsFxuICAgIF9wYXJhbGxheFJlc2l6ZSgpO1xuICB9O1xuXG4gIHZhciBcbiAgICAgIC8vINGB0LrQvtGA0L7RgdGC0Ywg0Lgg0YDQsNC30LzQsNGFINC00LLQuNC20LXQvdC40Y8g0YHQu9C+0LXQslxuICAgICAgX3NwZWVkID0gMSAvIDUwLFxuICAgICAgX3dpbmRvdyAgICA9ICQod2luZG93KSxcbiAgICAgIF93V2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCksXG4gICAgICBfd0hlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQoKSxcbiAgICAgIF9oYWxmV2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCkgLyAyLFxuICAgICAgX2hhbGZIZWlnaHQgPSBfd2luZG93LmlubmVySGVpZ2h0KCkgLyAyLFxuICAgICAgX2xheWVycyAgPSAkKCcucGFyYWxsYXgnKS5maW5kKCcucGFyYWxsYXhfX2xheWVyJyk7XG5cblxuXG4gIC8vINGD0YHRgtCw0L3QsNCy0LvQvNCy0LDQtdC8INC/0YDQvtGB0LvRg9GI0LrRgyDQvdCwINC00LLQuNC20LXQvdC40LUg0LzRi9GI0Lgg0Lgg0YDQtdGB0LDQudC3INC+0LrQvdCwXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcbiAgICAkKHdpbmRvdykub24oJ21vdXNlbW92ZScsIF9wYXJhbGxheE1vdmUpO1xuICAgICQod2luZG93KS5vbigncmVzaXplJywgX3BhcmFsbGF4UmVzaXplKTtcbiAgfTtcblxuICAvLyDRhNGD0L3QutGG0LjRjyDQv9C10YDQtdGB0YfQuNGC0YvQstCw0LXRgiDRiNC40YDQuNC90YMg0Lgg0LLRi9GB0L7RgtGDINC00LvRjyDRgdC70L7QtdCyINC/0LDRgNCw0LvQu9Cw0LrRgdCwXG4gIGZ1bmN0aW9uIF9wYXJhbGxheFJlc2l6ZSgpIHtcblxuXG4gICAgLy8g0LrQsNC20LTRi9C5INGA0LDQtyDQv9GA0Lgg0YDQtdGB0LDQudC30LUg0L/QtdGA0LXRgdGH0LjRgtCw0YvQstCw0LXQvCDRgNCw0LfQvNC10YDRiyDQvtC60L3QsFxuICAgIHZhciBcbiAgICAgIF93V2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCksXG4gICAgICBfd0hlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQoKSxcbiAgICAgIF9oYWxmSGVpZ2h0ID0gX3dpbmRvdy5pbm5lckhlaWdodCgpIC8gMjtcblxuICAgIC8vINC40YnQtdC8INC80LDQutGB0LjQvNCw0LvRjNC90YvQuSDQvdC+0LzQtdGAINGB0LvQvtGPXG4gICAgdmFyIG1heEluZGV4ID0gX2xheWVycy5sZW5ndGggLTE7XG5cbiAgICAvLyDRgyDQutCw0YDRgtC40L3QutC4INCx0YPQtNGD0YIg0L7RgtGB0YLRg9C/0Ysg0YHQv9GA0LDQstCwINC4INGB0LvQtdCy0LAsINGH0YLQvtCx0Ysg0L/QsNGA0LDQu9C70LDQutGBINC/0L7Qu9C90L7RgdGC0YzRjiDQv9C+0LzQtdGJ0LDQu9GB0Y8uXG4gICAgLy8g0L7RgtGB0YLRg9C/0Ysg0YDQsNCy0L3RiyDQvNCw0LrRgdC40LzQsNC70YzQvdC+0LzRgyDRgdC00LLQuNCz0YMg0YHQu9C+0LXQslxuICAgIC8vICjRgdCw0LzRi9C5INC/0L7RgdC70LXQtNC90LjQuSDRgdC70L7QuSDQtNCy0LjQs9Cw0LXRgtGB0Y8g0LHQvtC70YzRiNC1INCy0YHQtdGFLCDRgtCw0Log0YfRgtC+INC40YnQtdC8INC40LzQtdC90L3QvdC+INC10LPQviDQvNCw0LrRgdC40LzQsNC70YzQvdGL0Lkg0YHQtNCy0LjQsylcbiAgICB2YXIgbWF4U2hpZnRYID0gX2hhbGZXaWR0aCAqIG1heEluZGV4ICogX3NwZWVkLFxuXG5cbiAgICAgICAgLy8g0YjQuNGA0LjQvdCwIFwi0YDQsNGB0YjQuNGA0LXQvdC90L7QuVwiINC60LDRgNGC0LjQvdC60Lg6INGI0LjRgNC40L3QsCDQvtC60L3QsCArIDIg0L7RgtGB0YLRg9C/0LBcbiAgICAgICAgd2lkdGhXaWRlciA9IF93V2lkdGggKyAobWF4U2hpZnRYICogMiksXG5cbiAgICAgICAgLy/RgdC+0L7RgtC90L7RiNC10L3QuNC1INGB0YLQvtGA0L7QvSDRjdC60YDQsNC90LAgKNCy0YvRgdC+0YLRgyDRjdC60YDQsNC90LAg0LTQtdC70LjQvCDQvdCwINGI0LjRgNC40L3RgyBcItGA0LDRgdGI0LjRgNC10L3QvdC+0LlcIiDQutCw0YDRgtC40L3QutC4KVxuICAgICAgICB3aW5kb3dSYXRpbyA9IChfd0hlaWdodCAvIHdpZHRoV2lkZXIpLFxuXG4gICAgICAgIC8v0YHQvtC+0YLQvdC+0YjQtdC90LjQtSDRgdGC0L7RgNC+0L0g0YDQtdCw0LvRjNC90L7QuSDQutCw0YDRgtC40L3QutC4XG4gICAgICAgIHBpY3R1cmVSYXRpbyA9ICgxOTk0IC8gMzAwMCk7XG5cblxuICAgIC8vINC10YHQu9C4INC60LDRgNGC0LjQvdC60LAg0L/QvtC80LXRidCw0LXRgtGB0Y8g0LIg0Y3QutGA0LDQvSDQv9C+INCy0YvRgdC+0YLQtSwg0YLQviDQvdCw0LTQviDQtdC1INGD0LLQtdC70LjRh9C40YLRjFxuICAgIGlmICggd2luZG93UmF0aW8gPiBwaWN0dXJlUmF0aW8gKSB7XG4gICAgICAvLyDQstGL0YHQvtGC0LAgPSDQstGL0YHQvtGC0LUg0Y3QutGA0LDQvdCwLCDQstGB0LUg0L7RgdGC0LDQu9GM0L3QvtC1INGA0LDRgdGB0YfQuNGC0YvQstCw0LXQvCwg0LjRgdGF0L7QtNGPINC40Lcg0Y3RgtC+0Lkg0LLRi9GB0L7RgtGLXG4gICAgICBwYXJhbGxheEhlaWdodCA9IF93SGVpZ2h0ICsgJ3B4JztcbiAgICAgIHBhcmFsbGF4V2lkdGggPSBfd0hlaWdodCAvIHBpY3R1cmVSYXRpbztcbiAgICAgIHBhcmFsbGF4TWFyZ2luTGVmdCA9IChwYXJhbGxheFdpZHRoICAtIF93V2lkdGgpIC8gMjtcblxuICAgIC8vINC10YHQu9C4INC60LDRgNGC0LjQvdC60LAg0L3QtSDQv9C+0LzQtdGJ0LDQtdGC0YHRjyDQsiDRjdC60YDQsNC9INC/0L4g0LLRi9GB0L7RgtC1LCDRgtC+INCy0YvRgdC+0YLQsCDQsdGD0LTQtdGCINGA0LDRgdGB0YfQuNGC0YvQstCw0YLRjNGB0Y8g0LDQstGC0L7QvNCw0YLQuNGH0LXRgdC60LhcbiAgICAvLyDQsdGD0LTQtdC8INCy0YvRgNCw0LLQvdC40LLQsNGC0Ywg0L/QviDRiNC40YDQuNC90LVcbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyDRiNC40YDQuNC90LAgPSDRiNC40YDQuNC90LUg0Y3QutGA0LDQvdCwICgrIDIg0L7RgtGB0YLRg9C/0LApLCDQstGB0LUg0L7RgdGC0LDQu9GM0L3QvtC1INGA0LDRgdGB0YfQuNGC0YvQstCw0LXQvCwg0LjRgdGF0L7QtNGPINC40Lcg0Y3RgtC+0Lkg0YjQuNGA0LjQvdGLXG4gICAgICBwYXJhbGxheFdpZHRoID0gd2lkdGhXaWRlcjtcbiAgICAgIHBhcmFsbGF4SGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgcGFyYWxsYXhNYXJnaW5MZWZ0ID0gbWF4U2hpZnRYO1xuXG4gICAgfVxuXG4gICAgLy8g0L/QvtC00YHRgtCw0LLQu9GP0LXQvCDQvdCw0LnQtNC10L3QvdGL0LUg0LfQvdCw0YfQtdC90LjRjyDRiNC40YDQuNC90YssINCy0YvRgdC+0YLRiyDQuCBtYXJnaW4tbGVmdCDQstGB0LXQvCDRgdC70L7Rj9C8XG4gICAgX2xheWVycy5jc3MoIHtcbiAgICAgICd3aWR0aCc6IHBhcmFsbGF4V2lkdGggKyAncHgnLFxuICAgICAgJ2hlaWdodCc6IHBhcmFsbGF4SGVpZ2h0LFxuICAgICAgJ21hcmdpbi1sZWZ0JzogJy0nICsgcGFyYWxsYXhNYXJnaW5MZWZ0ICsgJ3B4J1xuICAgIH0pO1xuXG5cbiAgICAkLmVhY2goX2xheWVycywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuICAgICAgLy8gdG9wU2hpZnQgLSDRjdGC0L4g0LLQtdC70LjRh9C40L3QsCwg0L3QsCDQutC+0YLQvtGA0YPRjiDQvdGD0LbQvdC+INGB0LTQstC40L3Rg9GC0Ywg0LrQsNC20LTRi9C5INGB0LvQvtC5INCy0L3QuNC3LCDRh9GC0L7QsdGLINC90LUg0LHRi9C70L4g0LLQuNC00L3QviDQutGA0LDQtdCyIFxuICAgICAgdG9wU2hpZnQgPSAgKF9oYWxmSGVpZ2h0ICogaW5kZXggKiBfc3BlZWQpO1xuICAgICAgJChlbGVtKS5jc3Moe1xuICAgICAgICAndG9wJzogdG9wU2hpZnQgKyAncHgnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gIH07XG5cblxuXG5cbiAgLy8g0YTRg9C90LrRhtC40Y8g0LTQstC40LPQsNC10YIg0YHQu9C+0Lgg0LIg0LfQsNCy0LjRgdC40LzQvtGB0YLQuCDQvtGCINC/0L7Qu9C+0LbQtdC90LjRjyDQvNGL0YjQuFxuICBmdW5jdGlvbiBfcGFyYWxsYXhNb3ZlIChlKSB7XG5cbiAgICB2YXIgXG4gICAgICAgIC8vINC/0L7Qu9C+0LbQtdC90LjQtSDQvNGL0YjQuFxuICAgICAgICBtb3VzZVggID0gZS5wYWdlWCxcbiAgICAgICAgbW91c2VZICA9IGUucGFnZVksXG5cbiAgICAgICAgLy8g0L/QvtC70L7QttC10L3QuNC1INC80YvRiNC4INCyINC90LDRiNC10Lkg0L3QvtCy0L7QuSDRgdC40YHRgtC10LzQtSDQutC+0L7RgNC00LjQvdCw0YIgKNGBINGG0LXQvdGC0YDQvtC8INCyINGB0LXRgNC10LTQuNC90LUg0Y3QutGA0LDQvdCwKVxuICAgICAgICBjb29yZFggID0gX2hhbGZXaWR0aCAtIG1vdXNlWCxcbiAgICAgICAgY29vcmRZICA9IF9oYWxmSGVpZ2h0IC0gbW91c2VZO1xuXG4gICAgICAgIC8vIG1vdmUgZWFjaCBsYXllclxuICAgICAgICAkLmVhY2goX2xheWVycywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuXG4gICAgICAgICAgLy8g0YDQsNGB0YHRh9C40YLRi9Cy0LDQtdC8INC00LvRjyDQutCw0LbQtNC+0LPQviDRgdC70L7Rjywg0L3QsCDRgdC60L7Qu9GM0LrQviDQtdCz0L4g0YHQtNCy0LjQs9Cw0YLRjFxuICAgICAgICAgIHZhciBzaGlmdFggPSBNYXRoLnJvdW5kKGNvb3JkWCAqIGluZGV4ICogX3NwZWVkKSxcbiAgICAgICAgICAgICAgc2hpZnRZID0gTWF0aC5yb3VuZChjb29yZFkgKiBpbmRleCAqIF9zcGVlZCksXG4gICAgICAgICAgICAgIC8vIHRvcFNoaWZ0IC0g0Y3RgtC+INCy0LXQu9C40YfQuNC90LAsINC90LAg0LrQvtGC0L7RgNGD0Y4g0L3Rg9C20L3QviDRgdC00LLQuNC90YPRgtGMINC60LDQttC00YvQuSDRgdC70L7QuSDQstC90LjQtywg0YfRgtC+0LHRiyDQvdC1INCx0YvQu9C+INCy0LjQtNC90L4g0LrRgNCw0LXQsiBcbiAgICAgICAgICAgICAgdG9wU2hpZnQgPSAgKF9oYWxmSGVpZ2h0ICogaW5kZXggKiBfc3BlZWQpO1xuXG4gICAgICAgICAgJChlbGVtKS5jc3Moe1xuICAgICAgICAgICAgJ3RvcCc6IHRvcFNoaWZ0ICsgJ3B4JyxcbiAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJyArIHNoaWZ0WCArICdweCwgJyArIHNoaWZ0WSArICdweCwgJyArICcgMCknXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcblxuIiwidmFyIHNjcm9sbEJ1dHRvbnMgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcbiAgICAkKCcuc2Nyb2xsLWNvbnRyb2wtLWRvd24nKS5vbignY2xpY2snLCBfc2Nyb2xsRG93bilcbiAgICAkKCcuc2Nyb2xsLWNvbnRyb2wtLXVwJykub24oJ2NsaWNrJywgX3Njcm9sbFVwKVxuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3Njcm9sbFVwKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgX3Njcm9sbFRvKCAnMCcsIDcwMCApO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3Njcm9sbERvd24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBfc2Nyb2xsVG8oICQoXCIuaGVhZGVyXCIpLmhlaWdodCgpICwgNTAwKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zY3JvbGxUbyhwb3MsIGR1cmF0aW9uKXtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICBzY3JvbGxUb3A6IHBvc1xuICAgIH0sIGR1cmF0aW9uKTtcbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7IiwidmFyIHNraWxsc0FuaW1hdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0bmVycygpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3NldFVwTGlzdG5lcnMgKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgX3Njcm9sbCk7XG4gIH07XG5cbiAgLy8g0LXRgdC70Lgg0LTQvtGB0LrRgNC+0LvQu9C40LvQuCDQtNC+INCx0LvQvtC60LAg0YHQviDRgdC60LjQu9Cw0LzQuCwg0YLQviDQv9C+0LrQsNC30YvQstCw0LXQvCDQuNGFXG4gIGZ1bmN0aW9uIF9zY3JvbGwoZSkge1xuICAgIFxuICAgIHdTY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgc2tpbGxzVG9wID0gJCgnLnNraWxscy1ibG9jaycpLm9mZnNldCgpLnRvcCAtIDIwMDtcblxuICAgIGlmICh3U2Nyb2xsID4gc2tpbGxzVG9wKSB7XG4gICAgICBfc2hvd1NraWxscygpO1xuICAgIH1cblxuICAgIFxuICB9XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQv9C+0LrQsNC30YvQstCw0LXRgiDQuCDQsNC90LjQvNC40YDRg9C10YIg0YHQutC40LvRiy5cbiAgZnVuY3Rpb24gX3Nob3dTa2lsbHMoKXtcblxuICAgIHZhciBhcmMsIGNpcmN1bWZlcmVuY2U7XG4gICAgdmFyIHRpbWUgPSAwO1xuICAgIHZhciBkZWxheSA9IDE1MDtcblxuICAgICQoJ2NpcmNsZS5pbm5lcicpLmVhY2goZnVuY3Rpb24oaSwgZWwpe1xuICAgICAgXG4gICAgICB2YXIgYXJjID0gTWF0aC5jZWlsKCQoZWwpLmRhdGEoJ2FyYycpKTtcbiAgICAgIHZhciBjaXJjdW1mZXJlbmNlID0gTWF0aC5jZWlsKCQoZWwpLmRhdGEoJ2NpcmN1bWZlcmVuY2UnKSk7XG5cbiAgICAgIC8vINCw0L3QuNC80LjRgNGD0LXQvCDQutCw0LbQtNGL0Lkg0LrRgNGD0LMg0YEg0LHQvtC70YzRiNC10Lkg0LfQsNC00LXRgNC20LrQvtC5XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgJChlbCkuY2xvc2VzdCgnLnNraWxsc19faXRlbScpLmFuaW1hdGUoe1xuICAgICAgICAgICdvcGFjaXR5JzogJzEnXG4gICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgJChlbCkuY3NzKCdzdHJva2UtZGFzaGFycmF5JywgYXJjKydweCAnICsgY2lyY3VtZmVyZW5jZSArICdweCcpO1xuXG4gICAgICB9LCB0aW1lICs9IGRlbGF5ICk7XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7IiwidmFyIHNsaWRlclRpdGxlc0FuaW1hdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX2FuaW1hdGVUaXRsZXMoKTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINC/0YDQvtGF0L7QtNC40YIg0L/QviDQstGB0LXQvCDQt9Cw0LPQvtC70L7QstC60LDQvCDRgdC70LDQudC00LXRgNCwLiDRhNGD0L3QutGG0LjRjyDQs9C10L3QtdGA0LjRgNGD0LXRgiBodG1sLdC60L7QtCwgXG4gIC8vINC30LDQstC+0YDQsNGH0LjQstCw0Y7RidC40Lkg0LLRgdC1INCx0YPQutCy0Ysg0Lgg0YHQu9C+0LLQsCDQsiBodG1sLdGC0LXQs9C4INC00LvRjyDQtNCw0LvRjNC90LXQudGI0LXQuSDRgNCw0LHQvtGC0Ysg0YEg0L3QuNC80Lgg0YEg0L/QvtC80L7RidGM0Y4gY3NzXG4gIGZ1bmN0aW9uIF9hbmltYXRlVGl0bGVzKCkge1xuXG4gICAgdmFyIFxuICAgICAgX3RpdGxlcyA9ICQoJy5zbGlkZXJfX2luZm8gLnNlY3Rpb24tdGl0bGVfX2lubmVyJyksXG4gICAgICBpbmplY3Q7XG5cblxuICAgIC8vINC60LDQttC00YvQuSDQt9Cw0LPQvtC70L7QstC+0LpcbiAgICBfdGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIFxuICAgICAgdmFyIFxuICAgICAgICAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgIHRpdGxlVGV4dCA9ICR0aGlzLnRleHQoKTtcblxuICAgICAgLy8g0L7Rh9C40YnQsNC10Lwg0LfQsNCz0L7Qu9C+0LLQvtC6LCDRh9GC0L7QsdGLINC/0L7RgtC+0Lwg0LLRgdGC0LDQstC40YLRjCDRgtGD0LTQsCDRgdCz0LXQvdC10YDQuNGA0L7QstCw0L3QvdGL0Lkg0LrQvtC0XG4gICAgICAkdGhpcy5odG1sKCcnKTtcblxuICAgICAgLy8g0YHRh9C10YLRh9C40Log0LTQu9GPINC90L7QvNC10YDQvtCyINCx0YPQutCyINCyINC30LDQs9C+0LvQvtCy0LrQtVxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAvLyDRgNCw0LHQvtGC0LDQtdC8INGBINC60LDQttC00YvQvCDRgdC70L7QstC+0Lw6IFxuICAgICAgJC5lYWNoKHRpdGxlVGV4dC5zcGxpdCgnICcpLCBmdW5jdGlvbihjLCB3b3JkKSB7XG5cbiAgICAgICAgICAvLyDQvtGH0LjRidCw0LXQvCDRgdC70L7QstC+XG4gICAgICAgICAgaW5qZWN0ID0gJyc7XG5cbiAgICAgICAgICAvLyDQutCw0LbQtNCw0Y8g0LHRg9C60LLQsCDQt9Cw0LLQtdGA0L3Rg9GC0LAg0LIgc3BhbiDRgSDQutC70LDRgdGB0LDQvNC4IGNoYXItLTEsIGNoYXItLTIsIC4uLiAuIFxuICAgICAgICAgIC8vINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGN0YLQuNGFINC60LvQsNGB0YHQvtCyINCx0YPQutCy0LDQvCDQsiBjc3Mg0L/RgNC+0YHRgtCw0LLQu9GP0LXRgtGB0Y8g0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQuNC5IGFuaW1hdGlvbi1kZWxheS5cbiAgICAgICAgICAkLmVhY2god29yZC5zcGxpdCgnJyksIGZ1bmN0aW9uKGssIGNoYXIpIHtcbiAgICAgICAgICAgIGluamVjdCArPSAnPHNwYW4gY2xhc3M9XCJjaGFyIGNoYXItLScgKyBpICsgJ1wiPicgKyBjaGFyICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g0LrQsNC20LTQvtC1INGB0LvQvtCy0L4g0LfQsNCy0LXRgNC90YPRgtC+INCyIHNwYW4gY2xhc3M9XCJ3b3JkXCIsINGH0YLQvtCx0Ysg0YDQtdGI0LjRgtGMINC/0YDQvtCx0LvQtdC80YMg0YEg0L/QtdGA0LXQvdC+0YHQvtC8INGB0YLRgNC+0Log0L/QvtGB0YDQtdC00Lgg0YHQu9C+0LLQsFxuICAgICAgICAgIHZhciB3b3JkID0gJzxzcGFuIGNsYXNzPVwid29yZFwiPicgKyBpbmplY3QgKyAnPC9zcGFuPic7XG5cblxuICAgICAgICAgICR0aGlzLmFwcGVuZCh3b3JkKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCgnLnNsaWRlcl9fY29udHJvbCcpLm9uKCdjbGljaycsIF9tb3ZlU2xpZGVyKTtcbiAgfTtcblxuXG4gIC8vINGD0LzQtdC90YzRiNCw0LXRgiDQvdC+0LzQtdGAINGB0LvQsNC50LTQsCDQvdCwINC10LTQuNC90LjRhtGDICjQtdGB0LvQuCDQvdCw0LTQviwg0LfQsNC60L7Qu9GM0YbQvtCy0YvQstCw0LXRgilcbiAgZnVuY3Rpb24gX2luZGV4RGVjKGFjdGl2ZUluZGV4LCBtYXhJbmRleCkge1xuICAgICAgdmFyIHByZXZJbmRleCA9IChhY3RpdmVJbmRleCA8PSAgIDAgICkgPyBtYXhJbmRleCA6IGFjdGl2ZUluZGV4IC0gMTtcbiAgICAgIHJldHVybiBwcmV2SW5kZXg7XG4gIH07XG5cblxuICAvLyDRg9Cy0LXQu9C40YfQuNCy0LDQtdGCINC90L7QvNC10YAg0YHQu9Cw0LnQtNCwINC90LAg0LXQtNC40L3QuNGG0YMgKNC10YHQu9C4INC90LDQtNC+LCDQt9Cw0LrQvtC70YzRhtC+0LLRi9Cy0LDQtdGCKVxuICBmdW5jdGlvbiBfaW5kZXhJbmMoYWN0aXZlSW5kZXgsIG1heEluZGV4KSB7XG4gICAgICB2YXIgbmV4dEluZGV4ID0gKGFjdGl2ZUluZGV4ID49IG1heEluZGV4KSA/ICAgMCAgIDogYWN0aXZlSW5kZXggKyAxO1xuICAgICAgcmV0dXJuIG5leHRJbmRleDtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDQvNCw0LvQtdC90YzQutC40LUg0YHQu9Cw0LnQtNC10YDRiyAocHJldiwgbmV4dClcbiAgLy8gZGlyZWN0aW9uIC0g0L3QsNC/0YDQsNCy0LvQtdC90LjQtSDRgdC70LDQudC00LXRgNCwLCDQv9GA0LjQvdC40LzQsNC10YIg0LfQvdCw0YfQtdC90LjRjyAndXAnLydkb3duJywg0LLQvdC40Lcv0LLQstC10YDRhVxuICAvLyBjb250cm9sIC0g0YHQu9Cw0LnQtNC10YAsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0L/RgNC+0LDQvdC40LzQuNGA0L7QstCw0YLRjDog0LvQtdCy0YvQuSDQuNC70Lgg0L/RgNCw0LLRi9C5XG4gIC8vIG5ld0luZGV4IC0g0L3QvtC80LXRgCDRgdC70LDQudC00LAsINC60L7RgtC+0YDRi9C5INC/0L7QutCw0LfQsNGC0Ywg0YHQu9C10LTRg9GO0YjQuNC8XG4gIGZ1bmN0aW9uIF9tb3ZlU21hbGxTbGlkZXIoZGlyZWN0aW9uLCBjb250cm9sLCBuZXdJbmRleCkge1xuICAgIHZhciBcbiAgICAgIGl0ZW1zID0gY29udHJvbC5maW5kKCcuY29udHJvbF9faXRlbScpLFxuICAgICAgb2xkSXRlbSA9IGNvbnRyb2wuZmluZCgnLmNvbnRyb2xfX2l0ZW0tLWFjdGl2ZScpLFxuICAgICAgbmV3SXRlbSA9IGl0ZW1zLmVxKG5ld0luZGV4KTtcblxuXG4gICAgICBvbGRJdGVtLnJlbW92ZUNsYXNzKCdjb250cm9sX19pdGVtLS1hY3RpdmUnKTtcbiAgICAgIG5ld0l0ZW0uYWRkQ2xhc3MoJ2NvbnRyb2xfX2l0ZW0tLWFjdGl2ZScpO1xuXG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICd1cCcpIHtcblxuICAgICAgICBuZXdJdGVtLmNzcygndG9wJywgJzEwMCUnKTtcbiAgICAgICAgb2xkSXRlbS5hbmltYXRlKHsndG9wJzogJy0xMDAlJ30sIDMwMCk7XG4gICAgICAgIG5ld0l0ZW0uYW5pbWF0ZSh7J3RvcCc6ICcwJ30sIDMwMCk7XG5cbiAgICB9O1xuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG5cbiAgICAgICAgbmV3SXRlbS5jc3MoJ3RvcCcsICctMTAwJScpO1xuICAgICAgICBvbGRJdGVtLmFuaW1hdGUoeyd0b3AnOiAnMTAwJSd9LCAzMDApO1xuICAgICAgICBuZXdJdGVtLmFuaW1hdGUoeyd0b3AnOiAnMCd9LCAzMDApO1xuICAgICAgXG4gICAgfTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDQsdC+0LvRjNGI0L7QuSDRgdC70LDQudC00LXRgFxuICAvLyBpbmRleFRvSGlkZSAtINGB0LvQsNC50LQsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0YHQutGA0YvRgtGMXG4gIC8vIGluZGV4VG9TaG93IC0g0YHQu9Cw0LnQtCwg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDQv9C+0LrQsNC30LDRgtGMXG4gIC8vIGl0ZW1zIC0g0LLRgdC1INGB0LvQsNC50LTRi1xuICBmdW5jdGlvbiBfZGlzcGxheVNsaWRlKGluZGV4VG9IaWRlLCBpbmRleFRvU2hvdywgaXRlbXMpIHtcblxuICAgIHZhciBcbiAgICAgIGl0ZW1Ub0hpZGUgPSBpdGVtcy5lcShpbmRleFRvSGlkZSksXG4gICAgICBpdGVtVG9TaG93ID0gaXRlbXMuZXEoaW5kZXhUb1Nob3cpO1xuXG4gICAgaXRlbVRvSGlkZS5yZW1vdmVDbGFzcygnc2xpZGVyX19pdGVtLS1hY3RpdmUnKTtcbiAgICBpdGVtVG9IaWRlLmFuaW1hdGUoeydvcGFjaXR5JzogJzAnfSwgMTUwKTtcblxuICAgIGl0ZW1Ub1Nob3cuYWRkQ2xhc3MoJ3NsaWRlcl9faXRlbS0tYWN0aXZlJyk7XG4gICAgaXRlbVRvU2hvdy5kZWxheSgxNTApLmFuaW1hdGUoeydvcGFjaXR5JzogJzEnfSwgMTUwKTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDRgdC70LDQudC00LXRgCDRgSDQuNC90YTQvtGA0LzQsNGG0LjQtdC5XG4gIC8vIGluZGV4VG9IaWRlIC0g0YHQu9Cw0LnQtCwg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDRgdC60YDRi9GC0YxcbiAgLy8gaW5kZXhUb1Nob3cgLSDRgdC70LDQudC0LCDQutC+0YLQvtGA0YvQuSDQvdGD0LbQvdC+INC/0L7QutCw0LfQsNGC0YxcbiAgLy8gaW5mb0l0ZW1zIC0g0LLRgdC1INGB0LvQsNC50LTRiyDRgSDQuNC90YTQvtGA0LzQsNGG0LjQtdC5XG4gIGZ1bmN0aW9uIF9kaXNwbGF5SW5mbyhpbmRleFRvSGlkZSwgaW5kZXhUb1Nob3csIGluZm9JdGVtcykge1xuICAgIGluZm9JdGVtcy5lcShpbmRleFRvSGlkZSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICBpbmZvSXRlbXMuZXEoaW5kZXhUb1Nob3cpLmNzcygnZGlzcGxheScsICdpbmxpbmUtYmxvY2snKTtcbiAgfVxuXG5cblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINC+0L/QtdGA0LXQtNC10LvRj9C10YIsINC/0L4g0LrQsNC60L7QvNGDINC60L7QvdGC0YDQvtC70YMg0LzRiyDQutC70LjQutC90YPQu9C4INC4INCy0YvQt9GL0LLQsNC10YIg0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQuNC1OlxuICAvLyBfZGlzcGxheUluZm8sINGH0YLQvtCx0Ysg0L/QvtC60LDQt9Cw0YLRjCDQvdGD0LbQvdGD0Y4g0LjQvdGE0L7RgNC80LDRhtC40Y5cbiAgLy8gX2Rpc3BsYXlTbGlkZS4sINGH0YLQvtCx0Ysg0L/QvtC60LDQt9Cw0YLRjCDQvdGD0LbQvdGL0Lkg0YHQu9Cw0LnQtFxuICAvLyBfbW92ZVNtYWxsU2xpZGVyLCDRh9GC0L7QsdGLINC/0YDQvtCw0L3QuNC80LjRgNC+0LLQsNGC0YwgcHJldiBjb250cm9sIFxuICAvLyBfbW92ZVNtYWxsU2xpZGVyLCDRh9GC0L7QsdGLINC/0YDQvtCw0L3QuNC80LjRgNC+0LLQsNGC0YwgbmV4dCBjb250cm9sIFxuICBmdW5jdGlvbiBfbW92ZVNsaWRlciAoZSkge1xuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhclxuICAgICAgICAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgIGNvbnRhaW5lciA9ICR0aGlzLmNsb3Nlc3QoJy5zbGlkZXInKSxcbiAgICAgICAgaXRlbXMgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbScpLFxuICAgICAgICBpbmZvSXRlbXMgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbS1pbmZvJyksXG4gICAgICAgIG1heEluZGV4ID0gaXRlbXMubGVuZ3RoIC0gMSxcbiAgICAgICAgcHJldkNvbnRyb2wgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9fY29udHJvbC0tcHJldicpLFxuICAgICAgICBuZXh0Q29udHJvbCA9IGNvbnRhaW5lci5maW5kKCcuc2xpZGVyX19jb250cm9sLS1uZXh0JyksXG4gICAgICAgIGFjdGl2ZUl0ZW0gPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbS0tYWN0aXZlJyksXG4gICAgICAgIGFjdGl2ZUluZGV4ID0gaXRlbXMuaW5kZXgoYWN0aXZlSXRlbSksXG4gICAgICAgIHByZXZJbmRleCA9IF9pbmRleERlYyhhY3RpdmVJbmRleCwgbWF4SW5kZXgpLFxuICAgICAgICBuZXh0SW5kZXggPSBfaW5kZXhJbmMoYWN0aXZlSW5kZXgsIG1heEluZGV4KTtcblxuICAgICAgLy8g0L/QvtC60LDQt9Cw0YLRjCDQv9GA0LXQtNGL0LTRg9GJ0LjQuSDRgdC70LDQudC0XG4gICAgICBpZiAoICR0aGlzLmhhc0NsYXNzKCdzbGlkZXJfX2NvbnRyb2wtLXByZXYnKSApIHtcblxuICAgICAgICB2YXIgcHJldkluZGV4RGVjID0gX2luZGV4RGVjKHByZXZJbmRleCwgbWF4SW5kZXgpO1xuICAgICAgICB2YXIgbmV4dEluZGV4RGVjID0gX2luZGV4RGVjKG5leHRJbmRleCwgbWF4SW5kZXgpO1xuXG4gICAgICAgIF9kaXNwbGF5U2xpZGUoYWN0aXZlSW5kZXgsIHByZXZJbmRleCwgaXRlbXMpO1xuICAgICAgICBfZGlzcGxheUluZm8oYWN0aXZlSW5kZXgsIHByZXZJbmRleCwgaW5mb0l0ZW1zKTtcblxuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCd1cCcsIHByZXZDb250cm9sLCBwcmV2SW5kZXhEZWMpO1xuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCdkb3duJywgbmV4dENvbnRyb2wsIG5leHRJbmRleERlYyk7XG5cbiAgICAgIH07XG5cblxuICAgICAgLy8g0L/QvtC60LDQt9Cw0YLRjCDRgdC70LXQtNGD0Y7RidC40Lkg0YHQu9Cw0LnQtFxuICAgICAgaWYgKCAkdGhpcy5oYXNDbGFzcygnc2xpZGVyX19jb250cm9sLS1uZXh0JykgKSB7XG5cbiAgICAgICAgdmFyIHByZXZJbmRleEluYyA9IF9pbmRleEluYyhwcmV2SW5kZXgsIG1heEluZGV4KTtcbiAgICAgICAgdmFyIG5leHRJbmRleEluYyA9IF9pbmRleEluYyhuZXh0SW5kZXgsIG1heEluZGV4KTtcbiAgICAgICAgXG4gICAgICAgIF9kaXNwbGF5U2xpZGUoYWN0aXZlSW5kZXgsIG5leHRJbmRleCwgaXRlbXMpO1xuICAgICAgICBfZGlzcGxheUluZm8oYWN0aXZlSW5kZXgsIG5leHRJbmRleCwgaW5mb0l0ZW1zKTtcblxuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCd1cCcsIHByZXZDb250cm9sLCBwcmV2SW5kZXhJbmMpO1xuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCdkb3duJywgbmV4dENvbnRyb2wsIG5leHRJbmRleEluYyk7XG5cbiAgICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBwcmVsb2FkZXIuaW5pdCgpO1xuICBtb2RhbC5pbml0KCk7XG4gIGhhbWJ1cmdlck1lbnUuaW5pdCgpO1xuICBzY3JvbGxCdXR0b25zLmluaXQoKTtcblxuXG5cbiAgLy8g0L3QsCDRgdGC0YDQsNC90LjRhtC1IGluZGV4XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9pbmRleC5odG1sJyB8fCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy8nKSB7XG5cbiAgICBwYXJhbGxheC5pbml0KCk7XG4gICAgbG9naW5Gb3JtLmluaXQoKTtcbiAgICBmbGlwQ2FyZC5pbml0KCk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSBibG9nXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9ibG9nLmh0bWwnKSB7XG5cbiAgICAvLyDQnNC+0LTRg9C70YwgYmxvZ01lbnUg0LTQvtC70LbQtdC9INCx0YvRgtGMINC40L3QuNGG0LjQsNC70LjQt9C40YDQvtCy0LDQvSDQv9C+0YHQu9C1INC+0YLRgNC40YHQvtCy0LrQuCDQstGB0LXRhSDRjdC70LXQvNC10L3RgtC+0LIsXG4gICAgLy8g0LTQu9GPINGH0LXQs9C+INC70L7Qs9C40YfQvdC+INCx0YvQu9C+INCx0Ysg0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMIGRvY3VtZW50LnJlYWR5XG4gICAgLy8g0J3QviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjQtSBkb2N1bWVudC5yZWFkeSDRgtGD0YIg0L3QtdCy0L7Qt9C80L7QttC90L4g0LjQty3Qt9CwINC/0YDQtdC70L7QsNC00LXRgNCwLCBcbiAgICAvLyDRgtCw0Log0LrQsNC6INC00LvRjyDQv9GA0LDQstC40LvRjNC90L7QuSDRgNCw0LHQvtGC0Ysg0L/RgNC10LvQvtCw0LTQtdGA0LAg0YMg0LLRgdC10YUg0Y3Qu9C10LzQtdC90YLQvtCyINGB0L3QsNGH0LDQu9CwINGB0YLQvtC40YIgZGlzcGxheTogbm9uZS5cbiAgICAvLyDQuNC3LdC30LAg0Y3RgtC+0LPQviBkb2N1bWVudC5yZWFkeSDRgdGA0LDQsdCw0YLRi9Cy0LDQtdGCINGB0LvQuNGI0LrQvtC8INGA0LDQvdC+LCDQutC+0LPQtNCwINC+0YLRgNC40YHQvtCy0LDQvSDRgtC+0LvRjNC60L4g0L/RgNC10LvQvtCw0LTQtdGALlxuICAgIC8vIFxuICAgIC8vINC/0L7RjdGC0L7QvNGDINC/0YDQuNGI0LvQvtGB0Ywg0YHQvtC30LTQsNGC0YwgRGVmZXJyZWQg0L7QsdGK0LXQutGCINCyINC80L7QtNGD0LvQtSBwcmVsb2FkZXI6IHByZWxvYWRlci5jb250ZW50UmVhZHlcbiAgICAvLyBwcmVsb2FkZXIuY29udGVudFJlYWR5INC/0L7Qu9GD0YfQsNC10YIg0LzQtdGC0L7QtCAucmVzb2x2ZSgpINGC0L7Qu9GM0LrQviDQv9C+0YHQu9C1INGC0L7Qs9C+LCDQutCw0Log0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0L/QvtC70YPRh9Cw0Y7RgiBkaXNwbGF5OiBibG9ja1xuICAgIC8vINCh0L7QvtGC0LLQtdGC0YHRgtCy0LXQvdC90L4sINC40L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPIGJsb2dNZW51INC/0YDQvtC40YHRhdC+0LTQuNGCINC/0L7RgdC70LUg0L/QvtC70YPRh9C10L3QuNGPIGRpc3BsYXk6IGJsb2NrINC4INC+0YLRgNC40YHQvtCy0LrQuCDQstGB0LXRhSDRjdC70LXQvNC10L3RgtC+0LJcblxuICAgIHByZWxvYWRlci5jb250ZW50UmVhZHkuZG9uZShmdW5jdGlvbigpIHsgXG4gICAgICBzY3JvbGxzcHkuaW5pdCgpO1xuICAgICAgYmxvZ01lbnVQYW5lbC5pbml0KCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSB3b3Jrc1xuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvd29ya3MuaHRtbCcpIHtcblxuICAgIGJsdXIuaW5pdCgpO1xuICAgIHNsaWRlci5pbml0KCk7XG4gICAgc2xpZGVyVGl0bGVzQW5pbWF0aW9uLmluaXQoKTtcbiAgICBjb250YWN0Rm9ybS5pbml0KCk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSBhYm91dFxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvYWJvdXQuaHRtbCcpIHtcbiAgICBza2lsbHNBbmltYXRpb24uaW5pdCgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEFkZGluZyBCbG9nIFBvc3QgSW5pdFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaWYgKCQoJyNhZGQtYmxvZy1idG4nKS5sZW5ndGgpIHtcbiAgICBhZGRCbG9nRm9ybS5pbml0KCcjYWRkLWJsb2ctYnRuJyk7XG4gIH1cblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBFZGl0IFNraWxscyBJbml0XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpZiAoJCgnI2VkaXQtc2tpbGxzLWJ0bicpLmxlbmd0aCkge1xuICAgIGVzaXRTa2lsbHNGb3JtLmluaXQoJyNlZGl0LXNraWxscy1idG4nKTtcbiAgfVxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEVkaXQgU2tpbGxzIEluaXRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGlmICgkKCcjanMtZ2V0LWFkbWluLWFib3V0JykubGVuZ3RoKSB7XG4gIC8vICAgJCgnI2pzLWdldC1hZG1pbi1hYm91dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cbiAgLy8gICAgICQuYWpheCh7XG4gIC8vICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gIC8vICAgICAgIHVybDogJy9hZG1pbi8nLFxuICAvLyAgICAgICBjYWNoZTogZmFsc2UsXG4gIC8vICAgICAgIGRhdGE6IHt9XG4gIC8vICAgICB9KS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgLy8gICAgICAgLy8gaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gIC8vICAgICAgIC8vICAgbW9kYWwuc2hvd01lc3NhZ2UocmVzcG9uc2UuZXJyb3IpO1xuICAvLyAgICAgICAvLyB9IGVsc2Uge1xuICAvLyAgICAgICAvLyAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gIC8vICAgICAgIC8vIH1cbiAgLy8gICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAvLyAgICAgICBtb2RhbC5zaG93TWVzc2FnZSgn0L/RgNC+0LjQt9C+0YjQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLiDQv9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3INC40LvQuCDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQsNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgNGDJyk7XG4gIC8vICAgICB9KVxuICAvLyAgIH0pXG4gIC8vIH1cblxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
