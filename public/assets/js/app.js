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




// flipping animation

  // (function(){

  //   var isWelcomeFlipped = false,
  //       buttonTriggerFlip = $('.btn--show-login'),
  //       flipContainer = $('.flip-container');


  //   buttonTriggerFlip.on('click', function(e){

  //     e.preventDefault();
  //     isWelcomeFlipped = true;
  //     flipContainer.addClass('flip');
  //     buttonTriggerFlip.fadeTo(300, 0).css('visibility', 'hidden');
  //   });


  //   $('.wrapper--welcome, .footer--welcome').on('click', function(e){
      
  //     // если кликаем на карточке, то переворачивать не надо
  //     if (e.target.closest('.welcome__card') !== null) {
  //       return;
  //     }
  //     // если кликаем не на карточке, то
  //     if (isWelcomeFlipped && 
  //         e.target.id != buttonTriggerFlip.attr('id')
  //       ) {

  //       isWelcomeFlipped = false;
  //       flipContainer.removeClass('flip');
  //       buttonTriggerFlip.fadeTo(300, 1, function(){
  //         buttonTriggerFlip.css('visibility', 'visible');
  //       })
  //     }

  //   });

  //   $('.btn--hide-login').on('click', function(e){

  //     e.preventDefault();
  //     isWelcomeFlipped = false;
  //     flipContainer.removeClass('flip');
  //     buttonTriggerFlip.fadeTo(300, 1).css('visibility', 'visible');
  //   });

  // })();
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
    }).done(function(responce){
      if (responce.error) {
        modal.showMessage(responce.error);
      } else {
        window.location.href = '/admin';
      }
    }).fail(function(responce){
      modal.showMessage('произошла непредвиденная ошибка. попробуйте еще раз или обратитесь к администратору');
    })
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


})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9fbW9kYWwuanMiLCJfX3ByZWxvYWRlci5qcyIsIl9fdmFsaWRhdGlvbi5qcyIsIl9ibG9nLW1lbnUuanMiLCJfYmx1ci5qcyIsIl9jb250YWN0LWZvcm0uanMiLCJfZmxpcC5qcyIsIl9oYW1idXJnZXItbWVudS5qcyIsIl9sb2dpbi1mb3JtLmpzIiwiX21hcC5qcyIsIl9wYXJhbGxheC5qcyIsIl9zY3JvbGwtYnV0dG9ucy5qcyIsIl9za2lsbHMuanMiLCJfc2xpZGVyLXRpdGxlcy5qcyIsIl9zbGlkZXIuanMiLCJhcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbW9kYWwgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobXNnKSB7XG4gICAgX3Nob3dNZXNzYWdlKG1zZyk7XG4gIH1cblxuXG4gIHZhciBcbiAgICBfbW9kYWxIb2xkZXIgPSAkKCcubW9kYWxfX2hvbGRlcicpLFxuICAgIF9tb2RhbCA9ICQoJy5tb2RhbCcpLFxuICAgIF9tb2RhbFRleHQgPSAkKCcubW9kYWxfX3RleHQnKTtcblxuXG4gIC8vINC/0YDQvtGB0LvRg9GI0LrQsCDRgdC+0LHRi9GC0LjQuVxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMoKSB7XG4gICAgJCgnI21vZGFsLWNsb3NlJykub24oXCJjbGlja1wiLCBfaGlkZU1lc3NhZ2UpO1xuICB9XG5cblxuICAvLyDQv9C+0LrQsNC30YvQstCw0LXQvCDRgdC+0L7QsdGJ0LXQvdC40LVcbiAgZnVuY3Rpb24gX3Nob3dNZXNzYWdlIChtc2cpIHtcbiAgICBfbW9kYWxUZXh0LnRleHQobXNnKTtcbiAgICBfbW9kYWwuY3NzKHtcbiAgICAgICd0b3AnOiAnNTAlJyxcbiAgICAgICdvcGFjaXR5JzogJzAnXG4gICAgfSkuYW5pbWF0ZSh7XG4gICAgICAnb3BhY2l0eSc6ICcxJyxcbiAgICB9LCAzMDApO1xuICAgIF9tb2RhbEhvbGRlci5zaG93KCk7XG4gIH1cblxuXG4gIC8vINC/0YDRj9GH0LXQvCDRgdC+0L7QsdGJ0LXQvdC40LVcbiAgZnVuY3Rpb24gX2hpZGVNZXNzYWdlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgX21vZGFsLmNzcyh7XG4gICAgICAndG9wJzogJy0xMDAlJ1xuICAgIH0pLmFuaW1hdGUoe1xuICAgICAgJ29wYWNpdHknOiAnMCcsXG4gICAgfSwgMzAwLCBmdW5jdGlvbigpe1xuICAgICAgX21vZGFsSG9sZGVyLmhpZGUoKTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBzaG93TWVzc2FnZTogc2hvd01lc3NhZ2VcbiAgfTtcblxufSkoKTtcblxuXG4iLCJ2YXIgcHJlbG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcblxuICB2YXIgXG4gICAgLy8g0LzQsNGB0YHQuNCyINC00LvRjyDQstGB0LXRhSDQuNC30L7QsdGA0LDQttC10L3QuNC5INC90LAg0YHRgtGA0LDQvdC40YbQtVxuICAgIF9pbWdzID0gW10sXG4gICAgXG4gICAgLy8g0LHRg9C00LXRgiDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC40Lcg0LTRgNGD0LPQuNGFINC80L7QtNGD0LvQtdC5LCDRh9GC0L7QsdGLINC/0YDQvtCy0LXRgNC40YLRjCwg0L7RgtGA0LjRgdC+0LLQsNC90Ysg0LvQuCDQstGB0LUg0Y3Qu9C10LzQtdC90YLRi1xuICAgIC8vINGCLtC6LiBkb2N1bWVudC5yZWFkeSDQuNC3LdC30LAg0L/RgNC10LvQvtCw0LTQtdGA0LAg0YHRgNCw0LHQsNGC0YvQstCw0LXRgiDRgNCw0L3RjNGI0LUsINC60L7Qs9C00LAg0L7RgtGA0LjRgdC+0LLQsNC9INC/0YDQtdC70L7QsNC00LXRgCwg0LAg0L3QtSDQstGB0Y8g0YHRgtGA0LDQvdC40YbQsFxuICAgIGNvbnRlbnRSZWFkeSA9ICQuRGVmZXJyZWQoKTtcblxuXG4gIC8vINC40L3QuNGG0LjQsNC70YzQt9Cw0YbQuNGPINC80L7QtNGD0LvRj1xuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfY291bnRJbWFnZXMoKTtcbiAgICBfc3RhcnRQcmVsb2FkZXIoKTtcblxuICB9O1xuXG4gIGZ1bmN0aW9uIF9jb3VudEltYWdlcygpe1xuXG4gICAgLy8g0L/RgNC+0YXQvtC00LjQvCDQv9C+INCy0YHQtdC8INGN0LvQtdC80LXQvdGC0LDQvCDQvdCwINGB0YLRgNCw0L3QuNGG0LVcbiAgICAkLmVhY2goJCgnKicpLCBmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgYmFja2dyb3VuZCA9ICR0aGlzLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLFxuICAgICAgICBpbWcgPSAkdGhpcy5pcygnaW1nJyk7XG5cbiAgICAgIC8vINC30LDQv9C40YHRi9Cy0LDQtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0L/Rg9GC0Lgg0Log0LHRjdC60LPRgNCw0YPQvdC00LDQvFxuICAgICAgaWYgKGJhY2tncm91bmQgIT0gJ25vbmUnKSB7XG5cbiAgICAgICAgLy8g0LIgY2hyb21lINCyINGD0YDQu9C1INC10YHRgtGMINC60LDQstGL0YfQutC4LCDQstGL0YDQtdC30LDQtdC8INGBINC90LjQvNC4LiB1cmwoXCIuLi5cIikgLT4gLi4uXG4gICAgICAgIC8vINCyIHNhZmFyaSDQsiDRg9GA0LvQtSDQvdC10YIg0LrQsNCy0YvRh9C10LosINCy0YvRgNC10LfQsNC10Lwg0LHQtdC3INC90LjRhS4gdXJsKCAuLi4gKSAtPiAuLi5cbiAgICAgICAgdmFyIHBhdGggPSBiYWNrZ3JvdW5kLnJlcGxhY2UoJ3VybChcIicsIFwiXCIpLnJlcGxhY2UoJ1wiKScsIFwiXCIpO1xuICAgICAgICB2YXIgcGF0aCA9IHBhdGgucmVwbGFjZSgndXJsKCcsIFwiXCIpLnJlcGxhY2UoJyknLCBcIlwiKTtcblxuICAgICAgICBfaW1ncy5wdXNoKHBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyDQt9Cw0L/QuNGB0YvQstCw0LXQvCDQsiDQvNCw0YHRgdC40LIg0LLRgdC1INC/0YPRgtC4INC6INC60LDRgNGC0LjQvdC60LDQvFxuICAgICAgaWYgKGltZykge1xuICAgICAgICB2YXIgcGF0aCA9ICcnICsgJHRoaXMuYXR0cignc3JjJyk7XG4gICAgICAgIGlmICggKHBhdGgpICYmICgkdGhpcy5jc3MoJ2Rpc3BsYXknKSAhPT0gJ25vbmUnKSApIHtcbiAgICAgICAgICBfaW1ncy5wdXNoKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9KTtcblxuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3N0YXJ0UHJlbG9hZGVyKCl7XG5cbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuXG4gICAgLy8g0LfQsNCz0YDRg9C20LXQvdC+IDAg0LrQsNGA0YLQuNC90L7QulxuICAgIHZhciBsb2FkZWQgPSAwO1xuXG4gICAgLy8g0L/RgNC+0YXQvtC00LjQvCDQv9C+INCy0YHQtdC8INGB0L7QsdGA0LDQvdC90YvQvCDQutCw0YDRgtC40L3QutCw0LwgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfaW1ncy5sZW5ndGg7IGkrKykge1xuXG4gICAgICB2YXIgaW1hZ2UgPSAkKCc8aW1nPicsIHtcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIHNyYzogX2ltZ3NbaV1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vINC30LDQs9GA0YPQttCw0LXQvCDQv9C+INC/0L7QtNC90L7QuSBcbiAgICAgICQoaW1hZ2UpLmxvYWQoZnVuY3Rpb24oKXtcbiAgICAgICAgbG9hZGVkKys7XG4gICAgICAgIHZhciBwZXJjZW50TG9hZGVkID0gX2NvdW50UGVyY2VudChsb2FkZWQsX2ltZ3MubGVuZ3RoKTtcbiAgICAgICAgX3NldFBlcmNlbnQocGVyY2VudExvYWRlZCk7XG4gICAgICB9KTtcblxuICAgIH07XG5cbiAgfVxuXG4gIC8vINC/0LXRgNC10YHRh9C40YLRi9Cy0LDQtdGCINCyINC/0YDQvtGG0LXQvdGC0YssINGB0LrQvtC70YzQutC+INC60LDRgNGC0LjQvdC+0Log0LfQsNCz0YDRg9C20LXQvdC+XG4gIC8vIGN1cnJlbnQgLSBudW1iZXIsINGB0LrQvtC70YzQutC+INC60LDRgNGC0LjQvdC+0Log0LfQsNCz0YDRg9C20LXQvdC+XG4gIC8vIHRvdGFsIC0gbnVtYmVyLCDRgdC60L7Qu9GM0LrQviDQuNGFINCy0YHQtdCz0L5cbiAgZnVuY3Rpb24gX2NvdW50UGVyY2VudChjdXJyZW50LCB0b3RhbCl7XG4gICAgcmV0dXJuIE1hdGguY2VpbChjdXJyZW50IC8gdG90YWwgKiAxMDApO1xuICB9XG5cbiAgXG4gIFxuICAvLyDQt9Cw0L/QuNGB0YvQstCw0LXRgiDQv9GA0L7RhtC10L3RgiDQsiBkaXYg0L/RgNC10LvQvtCw0LTQtdGAXG4gIC8vIHBlcmNlbnQgLSBudW1iZXIsINC60LDQutGD0Y4g0YbQuNGE0YDRgyDQt9Cw0L/QuNGB0LDRgtGMXG4gIGZ1bmN0aW9uIF9zZXRQZXJjZW50KHBlcmNlbnQpe1xuXG4gICAgJCgnLnByZWxvYWRlcl9fcGVyY2VudHMnKS50ZXh0KHBlcmNlbnQpO1xuXG4gICAgLy8g0LrQvtCz0LTQsCDQtNC+0YjQu9C4INC00L4gMTAwJSwg0YHQutGA0YvQstCw0LXQvCDQv9GA0LXQu9C+0LDQtNC10YAg0Lgg0L/QvtC60LDQt9GL0LLQsNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0YHRgtGA0LDQvdC40YbRi1xuICAgIGlmIChwZXJjZW50ID49IDEwMCkge1xuICAgICAgJCgnLnByZWxvYWRlcl9faGlkZGVuJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAkKCcucHJlbG9hZGVyJykuZmFkZU91dCgzMDApO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdvdmVyZmxvdy1oaWRkZW4nKTtcbiAgICAgIF9maW5pc2hQcmVsb2FkZXIoKTtcbiAgICB9XG5cbiAgfTtcblxuICBmdW5jdGlvbiBfZmluaXNoUHJlbG9hZGVyKCl7XG5cbiAgICBjb250ZW50UmVhZHkucmVzb2x2ZSgpO1xuICB9O1xuXG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgY29udGVudFJlYWR5OiBjb250ZW50UmVhZHlcbiAgfTtcblxufSkoKTtcblxuXG4iLCJ2YXIgdmFsaWRhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cblxuICBmdW5jdGlvbiBfdmFsaWRhdGVFbWFpbChlbWFpbCkge1xuICAgIHZhciByZSA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuICAgIC8vIHZhciByZSA9IC9bQS1aMC05Ll8lKy1dK0BbQS1aMC05Li1dKy5bQS1aXXsyLDR9L2lnbTtcbiAgICByZXR1cm4gcmUudGVzdChlbWFpbCk7XG4gIH1cblxuICAvLyDQt9Cw0LrRgNCw0YjQuNCy0LDQtdC8INC90LXQutC+0YDRgNC10LrRgtC90YvQtSDQuNC90L/Rg9GC0Ysg0LIg0LrRgNCw0YHQvdGL0LlcbiAgZnVuY3Rpb24gc2V0RXJyb3JTdHlsZXMoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZmZhZmEnXG4gICAgfSk7XG4gIH1cblxuICAvLyDQv9C10YDQtdC60YDQsNGI0LjQstCw0LXQvCDQuNC90L/Rg9GC0Ysg0L7QsdGA0LDRgtC90L4g0LIg0LHQtdC70YvQuVxuICBmdW5jdGlvbiBjbGVhckVycm9yU3R5bGVzKGVsZW1lbnQpIHtcblxuICAgIC8vINC70Y7QsdGL0LUsINC60YDQvtC80LUgc3VibWl0XG4gICAgaWYgKGVsZW1lbnQuYXR0cigndHlwZScpID09ICdzdWJtaXQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWxlbWVudC5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZidcbiAgICB9KTtcbiAgfVxuXG5cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUZvcm0gKGZvcm0pIHtcblxuICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgIG1lc3NhZ2UgPSAnJztcbiAgICB2YXIgZWxlbWVudHMgPSBmb3JtLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYScpLm5vdChcbiAgICAgICdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdLCAnICsgXG4gICAgICAnaW5wdXRbdHlwZT1cImZpbGVcIl0sICcgKyBcbiAgICAgICdpbnB1dFt0eXBlPVwic3VibWl0XCJdJyksXG4gICAgICAvLyAg0Y3Qu9C10LzQtdC90YLRiyDQu9C00Y8g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90L7QuSDQv9GA0L7QstC10YDQutC4LiDQldGB0LvQuCDQsiDRhNC+0YDQvNC1INC10YHRgtGMINGB0L/QtdGG0LjRhNC40YfQtdGB0LrQuNC1INC/0L7Qu9GPXG4gICAgICAvLyAg0L/RgNC40LzQtdGAINC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPOiDQvdGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjCDQuNC90L/Rg9GCINGC0LjQv9CwICdjaGVja2JveCcg0YEgaWQgJ2lzaHVtYW4nINC90LAg0YLQviDRh9GC0L4g0L7QvSAndHJ1ZScsIFxuICAgICAgLy8gINCyINGB0LvRg9GH0LDQtSDQvtGI0LjQsdC60Lgg0LLRi9Cy0LXRgdGC0LggJ2Vycm9yTXNnJy5cbiAgICAgIC8vIFxuICAgICAgLy8gIHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0sIFt7XG4gICAgICAvLyAgICBpZDogJ2lzaHVtYW4nLFxuICAgICAgLy8gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgIC8vICAgIGNoZWNrZWQ6IHRydWUsXG4gICAgICAvLyAgICBlcnJvck1zZzogJ9Cg0L7QsdC+0YLQsNC8INC30LTQtdGB0Ywg0L3QtSDQvNC10YHRgtC+J1xuICAgICAgLy8gIH1dKTtcbiAgICAgIGl0ZW1zVG9DaGVjayA9IGFyZ3VtZW50c1sxXTtcblxuXG4gICAgLy8g0LrQsNC20LTRi9C5INGN0Lst0YIg0YTQvtGA0LzRi1xuICAgICQuZWFjaChlbGVtZW50cywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuXG4gICAgICB2YXIgXG4gICAgICAgIGVsZW1lbnQgPSAkKGVsZW0pLFxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQudmFsKCk7XG5cbiAgICAgIC8vINC/0YDQvtCy0LXRgNGP0LXQvCDQutCw0LbQtNGL0Lkg0Y3Quy3RgiDQvdCwINC/0YPRgdGC0L7RgtGDICjQutGA0L7QvNC1IGNoZWNrYm94INC4IHJhZGlvKVxuICAgICAgaWYgKCAgKGVsZW1lbnQuYXR0cigndHlwZScpICE9IFwiY2hlY2tib3hcIikgJiZcbiAgICAgICAgICAgIChlbGVtZW50LmF0dHIoJ3R5cGUnKSAhPSBcInJhZGlvXCIpICYmXG4gICAgICAgICAgICAodmFsdWUubGVuZ3RoID09PSAwKSApIHtcblxuICAgICAgICAvL9C10YHQu9C4INC00LAsINGC0L4g0L7RiNC40LHQutCwIFxuICAgICAgICBzZXRFcnJvclN0eWxlcyhlbGVtZW50KTtcbiAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgbWVzc2FnZSA9ICfQktGLINC30LDQv9C+0LvQvdC40LvQuCDQvdC1INCy0YHQtSDQv9C+0LvRjyDRhNC+0YDQvNGLJztcbiAgICAgIH1cblxuICAgICAgLy8g0L/RgNC+0LLQtdGA0Y/QtdC8INC60LDQttC00YvQuSBlbWFpbCDQstCw0LvQuNC00LDRgtC+0YDQvtC8INC40LzQtdC50LvQvtCyXG4gICAgICBpZiAoZWxlbWVudC5hdHRyKCd0eXBlJykgPT0gXCJlbWFpbFwiKSB7XG5cblxuICAgICAgICAvLyDQtdGB0LvQuCDQuNC80LXQudC7INC90LUg0LLQsNC70LjQtNC90YvQuVxuICAgICAgICBpZiAoIV92YWxpZGF0ZUVtYWlsKHZhbHVlKSkge1xuXG4gICAgICAgICAgLy/RgtC+INC+0YjQuNCx0LrQsCBcbiAgICAgICAgICBzZXRFcnJvclN0eWxlcyhlbGVtZW50KTtcbiAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgIG1lc3NhZ2UgPSAn0J3QtdC60L7RgNGA0LXQutGC0L3Ri9C5IGVtYWlsJztcbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIC8vINC/0LDRgNGB0LjQvCDRgdC/0LjRgdC+0Log0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvRhSDRjdC70LXQvNC10L3RgtC+0LIg0L3QsCDQv9GA0L7QstC10YDQutGDXG4gICAgICAkKGl0ZW1zVG9DaGVjaykubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSl7XG5cbiAgICAgICAgLy8g0LXRgdC70Lgg0YLQtdC60YPRidC40Lkg0Y3Qu9C10LzQtdC90YIg0YTQvtGA0LzRiyDRgdC+0LLQv9Cw0LTQsNC10YIg0YEg0LrQsNC60LjQvC3RgtC+INC40Lcg0Y3Quy3RgtC+0LIg0YHQv9C40YHQutCwIGl0ZW1zVG9DaGVja1xuICAgICAgICBpZiAoZWxlbWVudC5hdHRyKCdpZCcpID09PSBpdGVtLmlkKSB7XG5cbiAgICAgICAgICAvLyDQtdGB0LvQuCDRjdGC0L4g0YfQtdC60LHQvtC60YEg0LjQu9C4INGA0LDQtNC40L4sIFxuICAgICAgICAgIC8vICYmXG4gICAgICAgICAgLy8g0LXRgdC70Lgg0LfQvdCw0YfQtdC90LjQtSBjaGVja2VkINC90LUg0YDQsNCy0L3QviDRgtC+0LzRgywg0YfRgtC+INC80Ysg0YXQvtGC0LjQvCAo0YfRgtC+INC80Ysg0L/QtdGA0LXQtNCw0LvQuCDQv9GA0Lgg0LLRi9C30L7QstC1KSAoIHRydWUvIGZhbHNlIClcbiAgICAgICAgICBpZiAoIChpdGVtLnR5cGUgPT09ICdjaGVja2JveCcgfHwgaXRlbS50eXBlID09PSAncmFkaW8nKSAmJlxuICAgICAgICAgICAgZWxlbWVudC5wcm9wKCdjaGVja2VkJykgIT09IGl0ZW0uY2hlY2tlZCAgKSB7XG5cbiAgICAgICAgICAgIC8vINGC0L4g0L7RiNC40LHQutCwIFxuICAgICAgICAgICAgc2V0RXJyb3JTdHlsZXMoZWxlbWVudCk7XG4gICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgbWVzc2FnZSA9IGl0ZW0uZXJyb3JNc2c7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0pO1xuXG5cbiAgICB9KTtcblxuXG4gICAgLy8g0LLRi9Cy0L7QtNC40Lwg0YHQvtC+0LHRidC10L3QuNC1INC+0LEg0L7RiNC40LHQutC1INGBINC/0L7QvNC+0YnRjNGOINC80L7QtNGD0LvRjyBtb2RhbCAoX21vZGFsLmpzKVxuICAgIGlmIChtZXNzYWdlICE9PSAnJykge1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZGF0ZUZvcm06IHZhbGlkYXRlRm9ybSxcbiAgICBzZXRFcnJvclN0eWxlczogc2V0RXJyb3JTdHlsZXMsXG4gICAgY2xlYXJFcnJvclN0eWxlczogY2xlYXJFcnJvclN0eWxlc1xuICB9O1xuXG59KSgpO1xuIiwidmFyIHNjcm9sbHNweSA9IChmdW5jdGlvbiAoKSB7XG5cbiAgX25hdiA9ICQoJy5ibG9nLW5hdl9fbGluaycpO1xuXG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2Nyb2xsU3B5KCk7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gIH07XG5cbiAgLy8gaWYgKF9uYXYgPT09IDApIHtcbiAgLy8gICByZXR1cm47XG4gIC8vIH07XG5cbiAgLy8g0L/RgNC+0YHQu9GD0YjQutCwINGB0L7QsdGL0YLQuNC5XG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpIHtcblxuICAgIC8vINC/0L4g0YHQutGA0L7Qu9C70YMg0LTQtdC70LDQtdC8IHNjcm9sbCBzcHlcbiAgICAkKHdpbmRvdykub24oXCJzY3JvbGxcIiwgX3Njcm9sbFNweSk7XG5cbiAgICAvLyDQv9C+INC60LvQuNC60YMg0L/QtdGA0LXRhdC+0LTQuNC8INC90LAg0L3Rg9C20L3Rg9GOINGB0YLQsNGC0YzRjiDRgSDQsNC90LjQvNCw0YbQuNC10LlcbiAgICAkKF9uYXYpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSl7XG4gICAgICBfc2hvd0FydGljbGUoJChlLnRhcmdldCkuYXR0cignaHJlZicpLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIC8vINC/0L4g0YHRgdGL0LvQutC1INC/0LXRgNC10YXQvtC00LjQvCDQvdCwINC90YPQttC90YPRjiDRgdGC0LDRgtGM0Y4g0LHQtdC3INCw0L3QuNC80LDRhtC40LhcbiAgICAkKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICE9PSAnJykge1xuICAgICAgICBfc2hvd0FydGljbGUod2luZG93LmxvY2F0aW9uLmhhc2gsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLy8g0L/QtdGA0LXRhdC+0LQg0L3QsCDQvdGD0LbQvdGD0Y4g0YHRgtCw0YLRjNGOICjRgSDQsNC90LjQvNCw0YbQuNC10Lkg0LjQu9C4INCx0LXQtylcbiAgZnVuY3Rpb24gX3Nob3dBcnRpY2xlKGFydGljbGUsIGlzQW5pbWF0ZSkge1xuICAgIHZhciBcbiAgICAgIGRpcmVjdGlvbiA9IGFydGljbGUucmVwbGFjZSgnIycsICcnKSxcbiAgICAgIHJlcUFydGljbGUgPSAkKCcuYXJ0aWNsZXNfX2l0ZW0nKS5maWx0ZXIoJ1tkYXRhLWFydGljbGU9XCInICsgZGlyZWN0aW9uICsgJ1wiXScpLFxuICAgICAgcmVxQXJ0aWNsZVBvcyA9IHJlcUFydGljbGUub2Zmc2V0KCkudG9wO1xuXG4gICAgICBpZiAoaXNBbmltYXRlKSB7XG4gICAgICAgICQoJ2JvZHksIGh0bWwnKS5hbmltYXRlKHtcbiAgICAgICAgICBzY3JvbGxUb3A6IHJlcUFydGljbGVQb3NcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoJ2JvZHksIGh0bWwnKS5zY3JvbGxUb3AocmVxQXJ0aWNsZVBvcyk7XG4gICAgICB9XG4gIH1cblxuXG4gIC8vIHNjcm9sbCBzcHlcbiAgZnVuY3Rpb24gX3Njcm9sbFNweSgpIHtcbiAgICAkKCcuYXJ0aWNsZXNfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXJcbiAgICAgICAgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICB0b3BFZGdlID0gJHRoaXMub2Zmc2V0KCkudG9wIC0gMjAwLFxuICAgICAgICBidG1FZGdlID0gdG9wRWRnZSArICR0aGlzLmhlaWdodCgpLFxuICAgICAgICB3U2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAgIGlmICh0b3BFZGdlIDwgd1Njcm9sbCAmJiBidG1FZGdlID4gd1Njcm9sbCkge1xuICAgICAgICAgIHZhciBcbiAgICAgICAgICAgIGN1cnJlbnRJZCA9ICR0aGlzLmRhdGEoJ2FydGljbGUnKSxcbiAgICAgICAgICAgIGFjdGl2ZUxpbmsgPSBfbmF2LmZpbHRlcignW2hyZWY9XCIjJyArIGN1cnJlbnRJZCArICdcIl0nKTtcblxuICAgICAgICAgIGFjdGl2ZUxpbmsuY2xvc2VzdCgnLmJsb2ctbmF2X19pdGVtJykuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG5cbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuXG5cblxudmFyIGJsb2dNZW51UGFuZWwgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgaHRtbCA9ICQoJ2h0bWwnKTtcbiAgdmFyIGJvZHkgPSAkKCdib2R5Jyk7XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgX2xvY2F0ZU1lbnUoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpe1xuXG4gICAgJCgnLm9mZi1jYW52YXMtLW1lbnUnKS5vbignY2xpY2snLCBfb3Blbk1lbnUpO1xuICAgICQoJy5vZmYtY2FudmFzLS1jb250ZW50Jykub24oJ2NsaWNrJywgX2Nsb3NlTWVudSk7XG5cbiAgICAkKHdpbmRvdykub24oe1xuICAgICAgJ3Jlc2l6ZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBfY2xvc2VNZW51KCk7XG4gICAgICAgIF9sb2NhdGVNZW51KCk7XG4gICAgICB9LFxuICAgICAgJ3Njcm9sbCc6IF9maXhNZW51XG4gICAgfSk7XG5cbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9vcGVuTWVudSgpe1xuICAgIGlmICggJCggd2luZG93ICkud2lkdGgoKSA8IDc2OCApIHtcbiAgICAgIGh0bWwuYWRkQ2xhc3MoJ2h0bWwtLWJsb2ctb3BlbmVkJyk7XG4gICAgfVxuICB9XG5cblxuICBmdW5jdGlvbiBfY2xvc2VNZW51KCl7XG4gICAgaWYgKCAkKCB3aW5kb3cgKS53aWR0aCgpIDwgNzY4ICkge1xuICAgICAgaHRtbC5yZW1vdmVDbGFzcygnaHRtbC0tYmxvZy1vcGVuZWQnKTtcbiAgICB9XG4gIH1cblxuXG4gIGZ1bmN0aW9uIF9maXhNZW51KCkge1xuXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gaGVhZGVyLmhlaWdodCgpO1xuICAgIHZhciBtZW51ID0gJCgnLm9mZi1jYW52YXMtLW1lbnUnKTtcbiAgICB2YXIgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZO1xuXG4gICAgaWYgKHNjcm9sbFkgPiBoZWFkZXJIZWlnaHQpIHtcbiAgICAgIG1lbnUuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lbnUucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgfVxuICAgICAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIF9sb2NhdGVNZW51KCkge1xuXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcbiAgICB2YXIgbWVudSA9ICQoJy5vZmYtY2FudmFzLS1tZW51Jyk7XG5cbiAgICAvLyAgbWVudSAndG9wJyBpcyByaWdodCB1bmRlciB0aGUgaGVhZGVyXG4gICAgLy8gIG1lbnUgJ3RvcCcgaXMgMCB3aGVuIG1lbnUgaXMgb24gZ3JlZW4gcGFuZWxcbiAgICBpZiAoICQoIHdpbmRvdyApLndpZHRoKCkgPiA3NjggKSB7XG4gICAgICBtZW51LmNzcygndG9wJywgaGVhZGVyLmNzcygnaGVpZ2h0JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZW51LmNzcygndG9wJywgJzAnKTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwidmFyIGJsdXIgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycygpIHtcbiAgICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10Lwg0LHQu9GO0YAg0L/QviDQt9Cw0LPRgNGD0LfQutC1INGB0YLRgNCw0L3QuNGG0Ysg0Lgg0YDQtdGB0LDQudC30YMg0L7QutC90LBcbiAgICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplJywgX2JsdXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2JsdXIoKSB7XG5cbiAgICB2YXIgYmcgPSAkKCcuYmx1cl9fYmcnKTtcblxuICAgIGlmIChiZy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9O1xuXG4gICAgdmFyIGZvcm0gPSAkKCcuYmx1cl9fZm9ybScpLFxuICAgICAgYmdXaWR0aCA9IGJnLndpZHRoKCksXG4gICAgICBwb3NUb3AgID0gYmcub2Zmc2V0KCkudG9wICAtIGZvcm0ub2Zmc2V0KCkudG9wLFxuICAgICAgcG9zTGVmdCA9IGJnLm9mZnNldCgpLmxlZnQgLSBmb3JtLm9mZnNldCgpLmxlZnQ7XG5cbiAgICBmb3JtLmNzcyh7XG4gICAgICAnYmFja2dyb3VuZC1zaXplJzogYmdXaWR0aCArICdweCcgKyAnICcgKyAnYXV0bycsXG4gICAgICAnYmFja2dyb3VuZC1wb3NpdGlvbic6IHBvc0xlZnQgKyAncHgnICsgJyAnICsgcG9zVG9wICsgJ3B4J1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuXG4iLCJ2YXIgY29udGFjdEZvcm0gPSAoZnVuY3Rpb24gKCkge1xuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycyAoKSB7XG4gICAgJCgnI2NvbnRhY3QtYnRuJykub24oJ2NsaWNrJywgX3N1Ym1pdEZvcm0pOyAgXG4gICAgJCgnLmZvcm0tLWNvbnRhY3QgaW5wdXQsIC5mb3JtLS1jb250YWN0IHRleHRhcmVhJykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7ICBcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9jbGVhckVycm9yU3R5bGVzKCkge1xuICAgIHZhbGlkYXRpb24uY2xlYXJFcnJvclN0eWxlcygkKHRoaXMpKTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXJcbiAgICAgIGZvcm0gPSAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtJyksXG4gICAgICBkYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcbiAgICBcbiAgICBpZiAodmFsaWRhdGlvbi52YWxpZGF0ZUZvcm0oZm9ybSkpIHtcbiAgICAgIF9zZW5kRm9ybShmb3JtKTtcbiAgICB9O1xuXG4gIH1cblxuICBmdW5jdGlvbiBfc2VuZEZvcm0oZm9ybSl7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgdXJsOiAnYXNzZXRzL3BocC9tYWlsLnBocCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBkYXRhOiBmb3JtLnNlcmlhbGl6ZSgpXG4gICAgfSkuZG9uZShmdW5jdGlvbihodG1sKXtcbiAgICAgIG1vZGFsLnNob3dNZXNzYWdlKGh0bWwpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24oaHRtbCl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZSgn0KHQvtC+0LHRidC10L3QuNC1INC90LUg0L7RgtC/0YDQsNCy0LvQtdC90L4hJyk7XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwidmFyIGZsaXBDYXJkID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIHZhciBpc1dlbGNvbWVGbGlwcGVkID0gZmFsc2UsXG4gICAgICBidXR0b25UcmlnZ2VyRmxpcCA9ICQoJy5idG4tLXNob3ctbG9naW4nKSxcbiAgICAgIGZsaXBDb250YWluZXIgPSAkKCcuZmxpcC1jb250YWluZXInKTtcblxuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG5cbiAgICBidXR0b25UcmlnZ2VyRmxpcC5vbignY2xpY2snLCBfc2hvd0xvZ2luKTtcbiAgICAkKCcud3JhcHBlci0td2VsY29tZSwgLmZvb3Rlci0td2VsY29tZScpLm9uKCdjbGljaycsIF9wcmVwYXJlVG9IaWRlKTtcbiAgICAkKCcuYnRuLS1oaWRlLWxvZ2luJykub24oJ2NsaWNrJywgX2hpZGVMb2dpbik7XG4gIH07XG5cblxuXG4gIC8vINC/0LXRgNC10LLQvtGA0LDRh9C40LLQsNC10Lwg0L7QsdGA0LDRgtC90L5cbiAgZnVuY3Rpb24gX2hpZGVMb2dpbihlKSB7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpc1dlbGNvbWVGbGlwcGVkID0gZmFsc2U7XG4gICAgZmxpcENvbnRhaW5lci5yZW1vdmVDbGFzcygnZmxpcCcpO1xuICAgIGJ1dHRvblRyaWdnZXJGbGlwLmZhZGVUbygzMDAsIDEsIGZ1bmN0aW9uKCl7XG4gICAgICBidXR0b25UcmlnZ2VyRmxpcC5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIH0pO1xuXG4gIH07XG5cblxuXG4gIC8vINC/0L4g0LrQu9C40LrRgyDQvdCwINC+0LHQu9Cw0YHRgtC4INCy0L7QutGA0YPQsywg0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0LXQvCDQvtCx0YDQsNGC0L3QvlxuICBmdW5jdGlvbiBfcHJlcGFyZVRvSGlkZShlKSB7XG4gICAgICAvLyDQtdGB0LvQuCDQutC70LjQutCw0LXQvCDQvdCwINC60LDRgNGC0L7Rh9C60LUsINGC0L4g0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0YLRjCDQvdC1INC90LDQtNC+XG4gICAgICBpZiAoZS50YXJnZXQuY2xvc2VzdCgnLndlbGNvbWVfX2NhcmQnKSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyDQtdGB0LvQuCDQutCw0YDRgtC+0YfQutCwINGD0LbQtSDQv9C10YDQtdCy0LXRgNC90YPRgtCwLFxuICAgICAgaWYgKGlzV2VsY29tZUZsaXBwZWQgXG4gICAgICAgIC8vINC4INC80Ysg0LrQu9C40LrQvdGD0LvQuCDQvdC1INC/0L4g0LrQvdC+0L/QutC1IFwi0JDQstGC0L7RgNC40LfQvtCy0LDRgtGM0YHRj1wiXG4gICAgICAgICYmIGUudGFyZ2V0LmlkICE9IGJ1dHRvblRyaWdnZXJGbGlwLmF0dHIoJ2lkJylcbiAgICAgICAgKSB7XG4gICAgICAgIC8vINGC0L4g0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0LXQvCDQvtCx0YDQsNGC0L3QvlxuICAgICAgICBfaGlkZUxvZ2luKGUpO1xuICAgICAgfVxuICB9O1xuXG5cbiAgXG4gIGZ1bmN0aW9uIF9zaG93TG9naW4oZSkge1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlzV2VsY29tZUZsaXBwZWQgPSB0cnVlO1xuICAgIGZsaXBDb250YWluZXIuYWRkQ2xhc3MoJ2ZsaXAnKTtcbiAgICBidXR0b25UcmlnZ2VyRmxpcC5mYWRlVG8oMzAwLCAwKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcblxuXG5cblxuLy8gZmxpcHBpbmcgYW5pbWF0aW9uXG5cbiAgLy8gKGZ1bmN0aW9uKCl7XG5cbiAgLy8gICB2YXIgaXNXZWxjb21lRmxpcHBlZCA9IGZhbHNlLFxuICAvLyAgICAgICBidXR0b25UcmlnZ2VyRmxpcCA9ICQoJy5idG4tLXNob3ctbG9naW4nKSxcbiAgLy8gICAgICAgZmxpcENvbnRhaW5lciA9ICQoJy5mbGlwLWNvbnRhaW5lcicpO1xuXG5cbiAgLy8gICBidXR0b25UcmlnZ2VyRmxpcC5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcblxuICAvLyAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyAgICAgaXNXZWxjb21lRmxpcHBlZCA9IHRydWU7XG4gIC8vICAgICBmbGlwQ29udGFpbmVyLmFkZENsYXNzKCdmbGlwJyk7XG4gIC8vICAgICBidXR0b25UcmlnZ2VyRmxpcC5mYWRlVG8oMzAwLCAwKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIC8vICAgfSk7XG5cblxuICAvLyAgICQoJy53cmFwcGVyLS13ZWxjb21lLCAuZm9vdGVyLS13ZWxjb21lJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICBcbiAgLy8gICAgIC8vINC10YHQu9C4INC60LvQuNC60LDQtdC8INC90LAg0LrQsNGA0YLQvtGH0LrQtSwg0YLQviDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMINC90LUg0L3QsNC00L5cbiAgLy8gICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCcud2VsY29tZV9fY2FyZCcpICE9PSBudWxsKSB7XG4gIC8vICAgICAgIHJldHVybjtcbiAgLy8gICAgIH1cbiAgLy8gICAgIC8vINC10YHQu9C4INC60LvQuNC60LDQtdC8INC90LUg0L3QsCDQutCw0YDRgtC+0YfQutC1LCDRgtC+XG4gIC8vICAgICBpZiAoaXNXZWxjb21lRmxpcHBlZCAmJiBcbiAgLy8gICAgICAgICBlLnRhcmdldC5pZCAhPSBidXR0b25UcmlnZ2VyRmxpcC5hdHRyKCdpZCcpXG4gIC8vICAgICAgICkge1xuXG4gIC8vICAgICAgIGlzV2VsY29tZUZsaXBwZWQgPSBmYWxzZTtcbiAgLy8gICAgICAgZmxpcENvbnRhaW5lci5yZW1vdmVDbGFzcygnZmxpcCcpO1xuICAvLyAgICAgICBidXR0b25UcmlnZ2VyRmxpcC5mYWRlVG8oMzAwLCAxLCBmdW5jdGlvbigpe1xuICAvLyAgICAgICAgIGJ1dHRvblRyaWdnZXJGbGlwLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIC8vICAgICAgIH0pXG4gIC8vICAgICB9XG5cbiAgLy8gICB9KTtcblxuICAvLyAgICQoJy5idG4tLWhpZGUtbG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcblxuICAvLyAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyAgICAgaXNXZWxjb21lRmxpcHBlZCA9IGZhbHNlO1xuICAvLyAgICAgZmxpcENvbnRhaW5lci5yZW1vdmVDbGFzcygnZmxpcCcpO1xuICAvLyAgICAgYnV0dG9uVHJpZ2dlckZsaXAuZmFkZVRvKDMwMCwgMSkuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgLy8gICB9KTtcblxuICAvLyB9KSgpOyIsInZhciBoYW1idXJnZXJNZW51ID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCgnI2J1cmdlci1idG4nKS5vbignY2xpY2snLCBfdG9nZ2xlTWVudSk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfdG9nZ2xlTWVudShlKSB7XG5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdidXJnZXItYnRuLS1hY3RpdmUnKTtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ292ZXJmb3ctaGlkZGVuJyk7XG4gICAgJCgnLm1haW4tbWVudScpLnRvZ2dsZUNsYXNzKCdtYWluLW1lbnUtLW9wZW4nKTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBsb2dpbkZvcm0gPSAoZnVuY3Rpb24gKCkge1xuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RlbmVycyAoKSB7XG4gICAgJCgnI2xvZ2luLWJ0bicpLm9uKCdjbGljaycsIF9zdWJtaXRGb3JtKTtcbiAgICAkKCcuZm9ybS0tbG9naW4gaW5wdXQnKS5ub3QoJyNsb2dpbi1idG4nKS5vbigna2V5ZG93bicsIF9jbGVhckVycm9yU3R5bGVzKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfY2xlYXJFcnJvclN0eWxlcygpIHtcbiAgICB2YWxpZGF0aW9uLmNsZWFyRXJyb3JTdHlsZXMoJCh0aGlzKSk7XG4gIH1cblxuICBmdW5jdGlvbiBfc3VibWl0Rm9ybShlKSB7XG4gICAgY29uc29sZS5sb2coJ3N1Ym1pdHRpbmcgTG9naW4gRm9ybSAnKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyXG4gICAgICBmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCcuZm9ybScpLFxuICAgICAgZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XG5cbiAgICB2YWxpZGF0aW9uLnZhbGlkYXRlRm9ybShmb3JtLCBbe1xuICAgICAgaWQ6ICdpc2h1bWFuJyxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBjaGVja2VkOiB0cnVlLFxuICAgICAgZXJyb3JNc2c6ICfQoNC+0LHQvtGC0LDQvCDQt9C00LXRgdGMINC90LUg0LzQtdGB0YLQvidcbiAgICB9LCB7XG4gICAgICBpZDogJ25vdHJvYm90LXllcycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogdHJ1ZSxcbiAgICAgIGVycm9yTXNnOiAn0KDQvtCx0L7RgtCw0Lwg0LfQtNC10YHRjCDQvdC1INC80LXRgdGC0L4nXG4gICAgfSwge1xuICAgICAgaWQ6ICdub3Ryb2JvdC1ubycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogZmFsc2UsXG4gICAgICBlcnJvck1zZzogJ9Cg0L7QsdC+0YLQsNC8INC30LTQtdGB0Ywg0L3QtSDQvNC10YHRgtC+J1xuICAgIH1dKTtcblxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgbWFwID0gKGZ1bmN0aW9uICgpIHtcblxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBcbiAgICAgIG1hcERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSxcbiAgICAgIGlzRHJhZ2dhYmxlO1xuXG4gICAgICBpZiggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICkge1xuICAgICAgICBpc0RyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNEcmFnZ2FibGUgPSB0cnVlO1xuICAgICAgfVxuICAgIFxuICAgIHZhciBtYXBPcHRpb25zID0ge1xuICAgICAgY2VudGVyOiB7XG4gICAgICAgIGxhdDogNTAuNDQ1MDA4LCBcbiAgICAgICAgbG5nOiAzMC41MTQ4MTFcbiAgICAgIH0sXG4gICAgICB6b29tOiAxMixcbiAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXG4gICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXG4gICAgICBkcmFnZ2FibGU6IGlzRHJhZ2dhYmxlLFxuICAgICAgc3R5bGVzOiBbe1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzQ0NDQ0NFwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmUuY291bnRyeVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmUuY291bnRyeVwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0XCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmUuY291bnRyeVwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmUuY291bnRyeVwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmMmYyZjJcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuYXR0cmFjdGlvblwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLmJ1c2luZXNzXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuZ292ZXJubWVudFwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLm1lZGljYWxcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5wYXJrXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kucGxhY2Vfb2Zfd29yc2hpcFwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnNwb3J0c19jb21wbGV4XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInNhdHVyYXRpb25cIjotMTAwfSx7XCJsaWdodG5lc3NcIjo0NX0se1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQuaGlnaHdheVwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJzaW1wbGlmaWVkXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQuYXJ0ZXJpYWxcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMuaWNvblwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwidHJhbnNpdFwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwidHJhbnNpdC5zdGF0aW9uXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzJiZDNiN1wifSx7XCJ2aXNpYmlsaXR5XCI6XCJzaW1wbGlmaWVkXCJ9XX1dXG4gICAgfVxuXG5cbiAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBEaXYsIG1hcE9wdGlvbnMpO1xuXG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTsiLCJ2YXIgcGFyYWxsYXggPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgLy8g0LjQvdC40YbQuNCw0LvRjNC30LDRhtC40Y8g0LzQvtC00YPQu9GPXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIC8vINCy0LrQu9GO0YfQsNC10Lwg0L/RgNC+0YHQu9GD0YjQutGDIFxuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gICAgLy8g0YHRgNCw0LfRgyDQttC1INC40YnQtdC8INGI0LjRgNC40L3RgyDQuCDQstGL0YHQvtGC0YMg0L/QsNGA0LDQu9C70LDQutGB0LBcbiAgICBfcGFyYWxsYXhSZXNpemUoKTtcbiAgfTtcblxuICB2YXIgXG4gICAgICAvLyDRgdC60L7RgNC+0YHRgtGMINC4INGA0LDQt9C80LDRhSDQtNCy0LjQttC10L3QuNGPINGB0LvQvtC10LJcbiAgICAgIF9zcGVlZCA9IDEgLyA1MCxcbiAgICAgIF93aW5kb3cgICAgPSAkKHdpbmRvdyksXG4gICAgICBfd1dpZHRoICA9IF93aW5kb3cuaW5uZXJXaWR0aCgpLFxuICAgICAgX3dIZWlnaHQgPSBfd2luZG93LmlubmVySGVpZ2h0KCksXG4gICAgICBfaGFsZldpZHRoICA9IF93aW5kb3cuaW5uZXJXaWR0aCgpIC8gMixcbiAgICAgIF9oYWxmSGVpZ2h0ID0gX3dpbmRvdy5pbm5lckhlaWdodCgpIC8gMixcbiAgICAgIF9sYXllcnMgID0gJCgnLnBhcmFsbGF4JykuZmluZCgnLnBhcmFsbGF4X19sYXllcicpO1xuXG5cblxuICAvLyDRg9GB0YLQsNC90LDQstC70LzQstCw0LXQvCDQv9GA0L7RgdC70YPRiNC60YMg0L3QsCDQtNCy0LjQttC10L3QuNC1INC80YvRiNC4INC4INGA0LXRgdCw0LnQtyDQvtC60L3QsFxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdtb3VzZW1vdmUnLCBfcGFyYWxsYXhNb3ZlKTtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9wYXJhbGxheFJlc2l6ZSk7XG4gIH07XG5cbiAgLy8g0YTRg9C90LrRhtC40Y8g0L/QtdGA0LXRgdGH0LjRgtGL0LLQsNC10YIg0YjQuNGA0LjQvdGDINC4INCy0YvRgdC+0YLRgyDQtNC70Y8g0YHQu9C+0LXQsiDQv9Cw0YDQsNC70LvQsNC60YHQsFxuICBmdW5jdGlvbiBfcGFyYWxsYXhSZXNpemUoKSB7XG5cblxuICAgIC8vINC60LDQttC00YvQuSDRgNCw0Lcg0L/RgNC4INGA0LXRgdCw0LnQt9C1INC/0LXRgNC10YHRh9C40YLQsNGL0LLQsNC10Lwg0YDQsNC30LzQtdGA0Ysg0L7QutC90LBcbiAgICB2YXIgXG4gICAgICBfd1dpZHRoICA9IF93aW5kb3cuaW5uZXJXaWR0aCgpLFxuICAgICAgX3dIZWlnaHQgPSBfd2luZG93LmlubmVySGVpZ2h0KCksXG4gICAgICBfaGFsZkhlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQoKSAvIDI7XG5cbiAgICAvLyDQuNGJ0LXQvCDQvNCw0LrRgdC40LzQsNC70YzQvdGL0Lkg0L3QvtC80LXRgCDRgdC70L7Rj1xuICAgIHZhciBtYXhJbmRleCA9IF9sYXllcnMubGVuZ3RoIC0xO1xuXG4gICAgLy8g0YMg0LrQsNGA0YLQuNC90LrQuCDQsdGD0LTRg9GCINC+0YLRgdGC0YPQv9GLINGB0L/RgNCw0LLQsCDQuCDRgdC70LXQstCwLCDRh9GC0L7QsdGLINC/0LDRgNCw0LvQu9Cw0LrRgSDQv9C+0LvQvdC+0YHRgtGM0Y4g0L/QvtC80LXRidCw0LvRgdGPLlxuICAgIC8vINC+0YLRgdGC0YPQv9GLINGA0LDQstC90Ysg0LzQsNC60YHQuNC80LDQu9GM0L3QvtC80YMg0YHQtNCy0LjQs9GDINGB0LvQvtC10LJcbiAgICAvLyAo0YHQsNC80YvQuSDQv9C+0YHQu9C10LTQvdC40Lkg0YHQu9C+0Lkg0LTQstC40LPQsNC10YLRgdGPINCx0L7Qu9GM0YjQtSDQstGB0LXRhSwg0YLQsNC6INGH0YLQviDQuNGJ0LXQvCDQuNC80LXQvdC90L3QviDQtdCz0L4g0LzQsNC60YHQuNC80LDQu9GM0L3Ri9C5INGB0LTQstC40LMpXG4gICAgdmFyIG1heFNoaWZ0WCA9IF9oYWxmV2lkdGggKiBtYXhJbmRleCAqIF9zcGVlZCxcblxuXG4gICAgICAgIC8vINGI0LjRgNC40L3QsCBcItGA0LDRgdGI0LjRgNC10L3QvdC+0LlcIiDQutCw0YDRgtC40L3QutC4OiDRiNC40YDQuNC90LAg0L7QutC90LAgKyAyINC+0YLRgdGC0YPQv9CwXG4gICAgICAgIHdpZHRoV2lkZXIgPSBfd1dpZHRoICsgKG1heFNoaWZ0WCAqIDIpLFxuXG4gICAgICAgIC8v0YHQvtC+0YLQvdC+0YjQtdC90LjQtSDRgdGC0L7RgNC+0L0g0Y3QutGA0LDQvdCwICjQstGL0YHQvtGC0YMg0Y3QutGA0LDQvdCwINC00LXQu9C40Lwg0L3QsCDRiNC40YDQuNC90YMgXCLRgNCw0YHRiNC40YDQtdC90L3QvtC5XCIg0LrQsNGA0YLQuNC90LrQuClcbiAgICAgICAgd2luZG93UmF0aW8gPSAoX3dIZWlnaHQgLyB3aWR0aFdpZGVyKSxcblxuICAgICAgICAvL9GB0L7QvtGC0L3QvtGI0LXQvdC40LUg0YHRgtC+0YDQvtC9INGA0LXQsNC70YzQvdC+0Lkg0LrQsNGA0YLQuNC90LrQuFxuICAgICAgICBwaWN0dXJlUmF0aW8gPSAoMTk5NCAvIDMwMDApO1xuXG5cbiAgICAvLyDQtdGB0LvQuCDQutCw0YDRgtC40L3QutCwINC/0L7QvNC10YnQsNC10YLRgdGPINCyINGN0LrRgNCw0L0g0L/QviDQstGL0YHQvtGC0LUsINGC0L4g0L3QsNC00L4g0LXQtSDRg9Cy0LXQu9C40YfQuNGC0YxcbiAgICBpZiAoIHdpbmRvd1JhdGlvID4gcGljdHVyZVJhdGlvICkge1xuICAgICAgLy8g0LLRi9GB0L7RgtCwID0g0LLRi9GB0L7RgtC1INGN0LrRgNCw0L3QsCwg0LLRgdC1INC+0YHRgtCw0LvRjNC90L7QtSDRgNCw0YHRgdGH0LjRgtGL0LLQsNC10LwsINC40YHRhdC+0LTRjyDQuNC3INGN0YLQvtC5INCy0YvRgdC+0YLRi1xuICAgICAgcGFyYWxsYXhIZWlnaHQgPSBfd0hlaWdodCArICdweCc7XG4gICAgICBwYXJhbGxheFdpZHRoID0gX3dIZWlnaHQgLyBwaWN0dXJlUmF0aW87XG4gICAgICBwYXJhbGxheE1hcmdpbkxlZnQgPSAocGFyYWxsYXhXaWR0aCAgLSBfd1dpZHRoKSAvIDI7XG5cbiAgICAvLyDQtdGB0LvQuCDQutCw0YDRgtC40L3QutCwINC90LUg0L/QvtC80LXRidCw0LXRgtGB0Y8g0LIg0Y3QutGA0LDQvSDQv9C+INCy0YvRgdC+0YLQtSwg0YLQviDQstGL0YHQvtGC0LAg0LHRg9C00LXRgiDRgNCw0YHRgdGH0LjRgtGL0LLQsNGC0YzRgdGPINCw0LLRgtC+0LzQsNGC0LjRh9C10YHQutC4XG4gICAgLy8g0LHRg9C00LXQvCDQstGL0YDQsNCy0L3QuNCy0LDRgtGMINC/0L4g0YjQuNGA0LjQvdC1XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8g0YjQuNGA0LjQvdCwID0g0YjQuNGA0LjQvdC1INGN0LrRgNCw0L3QsCAoKyAyINC+0YLRgdGC0YPQv9CwKSwg0LLRgdC1INC+0YHRgtCw0LvRjNC90L7QtSDRgNCw0YHRgdGH0LjRgtGL0LLQsNC10LwsINC40YHRhdC+0LTRjyDQuNC3INGN0YLQvtC5INGI0LjRgNC40L3Ri1xuICAgICAgcGFyYWxsYXhXaWR0aCA9IHdpZHRoV2lkZXI7XG4gICAgICBwYXJhbGxheEhlaWdodCA9ICdhdXRvJztcbiAgICAgIHBhcmFsbGF4TWFyZ2luTGVmdCA9IG1heFNoaWZ0WDtcblxuICAgIH1cblxuICAgIC8vINC/0L7QtNGB0YLQsNCy0LvRj9C10Lwg0L3QsNC50LTQtdC90L3Ri9C1INC30L3QsNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLCDQstGL0YHQvtGC0Ysg0LggbWFyZ2luLWxlZnQg0LLRgdC10Lwg0YHQu9C+0Y/QvFxuICAgIF9sYXllcnMuY3NzKCB7XG4gICAgICAnd2lkdGgnOiBwYXJhbGxheFdpZHRoICsgJ3B4JyxcbiAgICAgICdoZWlnaHQnOiBwYXJhbGxheEhlaWdodCxcbiAgICAgICdtYXJnaW4tbGVmdCc6ICctJyArIHBhcmFsbGF4TWFyZ2luTGVmdCArICdweCdcbiAgICB9KTtcblxuXG4gICAgJC5lYWNoKF9sYXllcnMsIGZ1bmN0aW9uKGluZGV4LCBlbGVtKXtcbiAgICAgIC8vIHRvcFNoaWZ0IC0g0Y3RgtC+INCy0LXQu9C40YfQuNC90LAsINC90LAg0LrQvtGC0L7RgNGD0Y4g0L3Rg9C20L3QviDRgdC00LLQuNC90YPRgtGMINC60LDQttC00YvQuSDRgdC70L7QuSDQstC90LjQtywg0YfRgtC+0LHRiyDQvdC1INCx0YvQu9C+INCy0LjQtNC90L4g0LrRgNCw0LXQsiBcbiAgICAgIHRvcFNoaWZ0ID0gIChfaGFsZkhlaWdodCAqIGluZGV4ICogX3NwZWVkKTtcbiAgICAgICQoZWxlbSkuY3NzKHtcbiAgICAgICAgJ3RvcCc6IHRvcFNoaWZ0ICsgJ3B4JyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICB9O1xuXG5cblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINC00LLQuNCz0LDQtdGCINGB0LvQvtC4INCyINC30LDQstC40YHQuNC80L7RgdGC0Lgg0L7RgiDQv9C+0LvQvtC20LXQvdC40Y8g0LzRi9GI0LhcbiAgZnVuY3Rpb24gX3BhcmFsbGF4TW92ZSAoZSkge1xuXG4gICAgdmFyIFxuICAgICAgICAvLyDQv9C+0LvQvtC20LXQvdC40LUg0LzRi9GI0LhcbiAgICAgICAgbW91c2VYICA9IGUucGFnZVgsXG4gICAgICAgIG1vdXNlWSAgPSBlLnBhZ2VZLFxuXG4gICAgICAgIC8vINC/0L7Qu9C+0LbQtdC90LjQtSDQvNGL0YjQuCDQsiDQvdCw0YjQtdC5INC90L7QstC+0Lkg0YHQuNGB0YLQtdC80LUg0LrQvtC+0YDQtNC40L3QsNGCICjRgSDRhtC10L3RgtGA0L7QvCDQsiDRgdC10YDQtdC00LjQvdC1INGN0LrRgNCw0L3QsClcbiAgICAgICAgY29vcmRYICA9IF9oYWxmV2lkdGggLSBtb3VzZVgsXG4gICAgICAgIGNvb3JkWSAgPSBfaGFsZkhlaWdodCAtIG1vdXNlWTtcblxuICAgICAgICAvLyBtb3ZlIGVhY2ggbGF5ZXJcbiAgICAgICAgJC5lYWNoKF9sYXllcnMsIGZ1bmN0aW9uKGluZGV4LCBlbGVtKXtcblxuICAgICAgICAgIC8vINGA0LDRgdGB0YfQuNGC0YvQstCw0LXQvCDQtNC70Y8g0LrQsNC20LTQvtCz0L4g0YHQu9C+0Y8sINC90LAg0YHQutC+0LvRjNC60L4g0LXQs9C+INGB0LTQstC40LPQsNGC0YxcbiAgICAgICAgICB2YXIgc2hpZnRYID0gTWF0aC5yb3VuZChjb29yZFggKiBpbmRleCAqIF9zcGVlZCksXG4gICAgICAgICAgICAgIHNoaWZ0WSA9IE1hdGgucm91bmQoY29vcmRZICogaW5kZXggKiBfc3BlZWQpLFxuICAgICAgICAgICAgICAvLyB0b3BTaGlmdCAtINGN0YLQviDQstC10LvQuNGH0LjQvdCwLCDQvdCwINC60L7RgtC+0YDRg9GOINC90YPQttC90L4g0YHQtNCy0LjQvdGD0YLRjCDQutCw0LbQtNGL0Lkg0YHQu9C+0Lkg0LLQvdC40LcsINGH0YLQvtCx0Ysg0L3QtSDQsdGL0LvQviDQstC40LTQvdC+INC60YDQsNC10LIgXG4gICAgICAgICAgICAgIHRvcFNoaWZ0ID0gIChfaGFsZkhlaWdodCAqIGluZGV4ICogX3NwZWVkKTtcblxuICAgICAgICAgICQoZWxlbSkuY3NzKHtcbiAgICAgICAgICAgICd0b3AnOiB0b3BTaGlmdCArICdweCcsXG4gICAgICAgICAgICAndHJhbnNmb3JtJzogJ3RyYW5zbGF0ZTNkKCcgKyBzaGlmdFggKyAncHgsICcgKyBzaGlmdFkgKyAncHgsICcgKyAnIDApJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG5cbiIsInZhciBzY3JvbGxCdXR0b25zID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCgnLnNjcm9sbC1jb250cm9sLS1kb3duJykub24oJ2NsaWNrJywgX3Njcm9sbERvd24pXG4gICAgJCgnLnNjcm9sbC1jb250cm9sLS11cCcpLm9uKCdjbGljaycsIF9zY3JvbGxVcClcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zY3JvbGxVcChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIF9zY3JvbGxUbyggJzAnLCA3MDAgKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zY3JvbGxEb3duKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgX3Njcm9sbFRvKCAkKFwiLmhlYWRlclwiKS5oZWlnaHQoKSAsIDUwMCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2Nyb2xsVG8ocG9zLCBkdXJhdGlvbil7XG4gICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgc2Nyb2xsVG9wOiBwb3NcbiAgICB9LCBkdXJhdGlvbik7XG4gIH1cblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBza2lsbHNBbmltYXRpb24gPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIF9zY3JvbGwpO1xuICB9O1xuXG4gIC8vINC10YHQu9C4INC00L7RgdC60YDQvtC70LvQuNC70Lgg0LTQviDQsdC70L7QutCwINGB0L4g0YHQutC40LvQsNC80LgsINGC0L4g0L/QvtC60LDQt9GL0LLQsNC10Lwg0LjRhVxuICBmdW5jdGlvbiBfc2Nyb2xsKGUpIHtcbiAgICBcbiAgICB3U2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgIHNraWxsc1RvcCA9ICQoJy5za2lsbHMtYmxvY2snKS5vZmZzZXQoKS50b3AgLSAyMDA7XG5cbiAgICBpZiAod1Njcm9sbCA+IHNraWxsc1RvcCkge1xuICAgICAgX3Nob3dTa2lsbHMoKTtcbiAgICB9XG5cbiAgICBcbiAgfVxuXG5cbiAgLy8g0YTRg9C90LrRhtC40Y8g0L/QvtC60LDQt9GL0LLQsNC10YIg0Lgg0LDQvdC40LzQuNGA0YPQtdGCINGB0LrQuNC70YsuXG4gIGZ1bmN0aW9uIF9zaG93U2tpbGxzKCl7XG5cbiAgICB2YXIgYXJjLCBjaXJjdW1mZXJlbmNlO1xuICAgIHZhciB0aW1lID0gMDtcbiAgICB2YXIgZGVsYXkgPSAxNTA7XG5cbiAgICAkKCdjaXJjbGUuaW5uZXInKS5lYWNoKGZ1bmN0aW9uKGksIGVsKXtcbiAgICAgIFxuICAgICAgdmFyIGFyYyA9IE1hdGguY2VpbCgkKGVsKS5kYXRhKCdhcmMnKSk7XG4gICAgICB2YXIgY2lyY3VtZmVyZW5jZSA9IE1hdGguY2VpbCgkKGVsKS5kYXRhKCdjaXJjdW1mZXJlbmNlJykpO1xuXG4gICAgICAvLyDQsNC90LjQvNC40YDRg9C10Lwg0LrQsNC20LTRi9C5INC60YDRg9CzINGBINCx0L7Qu9GM0YjQtdC5INC30LDQtNC10YDQttC60L7QuVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICQoZWwpLmNsb3Nlc3QoJy5za2lsbHNfX2l0ZW0nKS5hbmltYXRlKHtcbiAgICAgICAgICAnb3BhY2l0eSc6ICcxJ1xuICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICQoZWwpLmNzcygnc3Ryb2tlLWRhc2hhcnJheScsIGFyYysncHggJyArIGNpcmN1bWZlcmVuY2UgKyAncHgnKTtcblxuICAgICAgfSwgdGltZSArPSBkZWxheSApO1xuICAgIH0pO1xuXG4gIH1cblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBzbGlkZXJUaXRsZXNBbmltYXRpb24gPSAoZnVuY3Rpb24gKCkge1xuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9hbmltYXRlVGl0bGVzKCk7XG4gIH07XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQv9GA0L7RhdC+0LTQuNGCINC/0L4g0LLRgdC10Lwg0LfQsNCz0L7Qu9C+0LLQutCw0Lwg0YHQu9Cw0LnQtNC10YDQsC4g0YTRg9C90LrRhtC40Y8g0LPQtdC90LXRgNC40YDRg9C10YIgaHRtbC3QutC+0LQsIFxuICAvLyDQt9Cw0LLQvtGA0LDRh9C40LLQsNGO0YnQuNC5INCy0YHQtSDQsdGD0LrQstGLINC4INGB0LvQvtCy0LAg0LIgaHRtbC3RgtC10LPQuCDQtNC70Y8g0LTQsNC70YzQvdC10LnRiNC10Lkg0YDQsNCx0L7RgtGLINGBINC90LjQvNC4INGBINC/0L7QvNC+0YnRjNGOIGNzc1xuICBmdW5jdGlvbiBfYW5pbWF0ZVRpdGxlcygpIHtcblxuICAgIHZhciBcbiAgICAgIF90aXRsZXMgPSAkKCcuc2xpZGVyX19pbmZvIC5zZWN0aW9uLXRpdGxlX19pbm5lcicpLFxuICAgICAgaW5qZWN0O1xuXG5cbiAgICAvLyDQutCw0LbQtNGL0Lkg0LfQsNCz0L7Qu9C+0LLQvtC6XG4gICAgX3RpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBcbiAgICAgIHZhciBcbiAgICAgICAgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICB0aXRsZVRleHQgPSAkdGhpcy50ZXh0KCk7XG5cbiAgICAgIC8vINC+0YfQuNGJ0LDQtdC8INC30LDQs9C+0LvQvtCy0L7Quiwg0YfRgtC+0LHRiyDQv9C+0YLQvtC8INCy0YHRgtCw0LLQuNGC0Ywg0YLRg9C00LAg0YHQs9C10L3QtdGA0LjRgNC+0LLQsNC90L3Ri9C5INC60L7QtFxuICAgICAgJHRoaXMuaHRtbCgnJyk7XG5cbiAgICAgIC8vINGB0YfQtdGC0YfQuNC6INC00LvRjyDQvdC+0LzQtdGA0L7QsiDQsdGD0LrQsiDQsiDQt9Cw0LPQvtC70L7QstC60LVcbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgLy8g0YDQsNCx0L7RgtCw0LXQvCDRgSDQutCw0LbQtNGL0Lwg0YHQu9C+0LLQvtC8OiBcbiAgICAgICQuZWFjaCh0aXRsZVRleHQuc3BsaXQoJyAnKSwgZnVuY3Rpb24oYywgd29yZCkge1xuXG4gICAgICAgICAgLy8g0L7Rh9C40YnQsNC10Lwg0YHQu9C+0LLQvlxuICAgICAgICAgIGluamVjdCA9ICcnO1xuXG4gICAgICAgICAgLy8g0LrQsNC20LTQsNGPINCx0YPQutCy0LAg0LfQsNCy0LXRgNC90YPRgtCwINCyIHNwYW4g0YEg0LrQu9Cw0YHRgdCw0LzQuCBjaGFyLS0xLCBjaGFyLS0yLCAuLi4gLiBcbiAgICAgICAgICAvLyDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRjdGC0LjRhSDQutC70LDRgdGB0L7QsiDQsdGD0LrQstCw0Lwg0LIgY3NzINC/0YDQvtGB0YLQsNCy0LvRj9C10YLRgdGPINGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LjQuSBhbmltYXRpb24tZGVsYXkuXG4gICAgICAgICAgJC5lYWNoKHdvcmQuc3BsaXQoJycpLCBmdW5jdGlvbihrLCBjaGFyKSB7XG4gICAgICAgICAgICBpbmplY3QgKz0gJzxzcGFuIGNsYXNzPVwiY2hhciBjaGFyLS0nICsgaSArICdcIj4nICsgY2hhciArICc8L3NwYW4+JztcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vINC60LDQttC00L7QtSDRgdC70L7QstC+INC30LDQstC10YDQvdGD0YLQviDQsiBzcGFuIGNsYXNzPVwid29yZFwiLCDRh9GC0L7QsdGLINGA0LXRiNC40YLRjCDQv9GA0L7QsdC70LXQvNGDINGBINC/0LXRgNC10L3QvtGB0L7QvCDRgdGC0YDQvtC6INC/0L7RgdGA0LXQtNC4INGB0LvQvtCy0LBcbiAgICAgICAgICB2YXIgd29yZCA9ICc8c3BhbiBjbGFzcz1cIndvcmRcIj4nICsgaW5qZWN0ICsgJzwvc3Bhbj4nO1xuXG5cbiAgICAgICAgICAkdGhpcy5hcHBlbmQod29yZCk7XG4gICAgICB9KTtcblxuICAgIH0pO1xuICB9O1xuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0bmVycygpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3NldFVwTGlzdG5lcnMgKCkge1xuICAgICQoJy5zbGlkZXJfX2NvbnRyb2wnKS5vbignY2xpY2snLCBfbW92ZVNsaWRlcik7XG4gIH07XG5cblxuICAvLyDRg9C80LXQvdGM0YjQsNC10YIg0L3QvtC80LXRgCDRgdC70LDQudC00LAg0L3QsCDQtdC00LjQvdC40YbRgyAo0LXRgdC70Lgg0L3QsNC00L4sINC30LDQutC+0LvRjNGG0L7QstGL0LLQsNC10YIpXG4gIGZ1bmN0aW9uIF9pbmRleERlYyhhY3RpdmVJbmRleCwgbWF4SW5kZXgpIHtcbiAgICAgIHZhciBwcmV2SW5kZXggPSAoYWN0aXZlSW5kZXggPD0gICAwICApID8gbWF4SW5kZXggOiBhY3RpdmVJbmRleCAtIDE7XG4gICAgICByZXR1cm4gcHJldkluZGV4O1xuICB9O1xuXG5cbiAgLy8g0YPQstC10LvQuNGH0LjQstCw0LXRgiDQvdC+0LzQtdGAINGB0LvQsNC50LTQsCDQvdCwINC10LTQuNC90LjRhtGDICjQtdGB0LvQuCDQvdCw0LTQviwg0LfQsNC60L7Qu9GM0YbQvtCy0YvQstCw0LXRgilcbiAgZnVuY3Rpb24gX2luZGV4SW5jKGFjdGl2ZUluZGV4LCBtYXhJbmRleCkge1xuICAgICAgdmFyIG5leHRJbmRleCA9IChhY3RpdmVJbmRleCA+PSBtYXhJbmRleCkgPyAgIDAgICA6IGFjdGl2ZUluZGV4ICsgMTtcbiAgICAgIHJldHVybiBuZXh0SW5kZXg7XG4gIH07XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQsNC90LjQvNC40YDRg9C10YIg0LzQsNC70LXQvdGM0LrQuNC1INGB0LvQsNC50LTQtdGA0YsgKHByZXYsIG5leHQpXG4gIC8vIGRpcmVjdGlvbiAtINC90LDQv9GA0LDQstC70LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsCwg0L/RgNC40L3QuNC80LDQtdGCINC30L3QsNGH0LXQvdC40Y8gJ3VwJy8nZG93bicsINCy0L3QuNC3L9Cy0LLQtdGA0YVcbiAgLy8gY29udHJvbCAtINGB0LvQsNC50LTQtdGALCDQutC+0YLQvtGA0YvQuSDQvdGD0LbQvdC+INC/0YDQvtCw0L3QuNC80LjRgNC+0LLQsNGC0Yw6INC70LXQstGL0Lkg0LjQu9C4INC/0YDQsNCy0YvQuVxuICAvLyBuZXdJbmRleCAtINC90L7QvNC10YAg0YHQu9Cw0LnQtNCwLCDQutC+0YLQvtGA0YvQuSDQv9C+0LrQsNC30LDRgtGMINGB0LvQtdC00YPRjtGI0LjQvFxuICBmdW5jdGlvbiBfbW92ZVNtYWxsU2xpZGVyKGRpcmVjdGlvbiwgY29udHJvbCwgbmV3SW5kZXgpIHtcbiAgICB2YXIgXG4gICAgICBpdGVtcyA9IGNvbnRyb2wuZmluZCgnLmNvbnRyb2xfX2l0ZW0nKSxcbiAgICAgIG9sZEl0ZW0gPSBjb250cm9sLmZpbmQoJy5jb250cm9sX19pdGVtLS1hY3RpdmUnKSxcbiAgICAgIG5ld0l0ZW0gPSBpdGVtcy5lcShuZXdJbmRleCk7XG5cblxuICAgICAgb2xkSXRlbS5yZW1vdmVDbGFzcygnY29udHJvbF9faXRlbS0tYWN0aXZlJyk7XG4gICAgICBuZXdJdGVtLmFkZENsYXNzKCdjb250cm9sX19pdGVtLS1hY3RpdmUnKTtcblxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAndXAnKSB7XG5cbiAgICAgICAgbmV3SXRlbS5jc3MoJ3RvcCcsICcxMDAlJyk7XG4gICAgICAgIG9sZEl0ZW0uYW5pbWF0ZSh7J3RvcCc6ICctMTAwJSd9LCAzMDApO1xuICAgICAgICBuZXdJdGVtLmFuaW1hdGUoeyd0b3AnOiAnMCd9LCAzMDApO1xuXG4gICAgfTtcbiAgICBpZiAoZGlyZWN0aW9uID09ICdkb3duJykge1xuXG4gICAgICAgIG5ld0l0ZW0uY3NzKCd0b3AnLCAnLTEwMCUnKTtcbiAgICAgICAgb2xkSXRlbS5hbmltYXRlKHsndG9wJzogJzEwMCUnfSwgMzAwKTtcbiAgICAgICAgbmV3SXRlbS5hbmltYXRlKHsndG9wJzogJzAnfSwgMzAwKTtcbiAgICAgIFxuICAgIH07XG4gIH07XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQsNC90LjQvNC40YDRg9C10YIg0LHQvtC70YzRiNC+0Lkg0YHQu9Cw0LnQtNC10YBcbiAgLy8gaW5kZXhUb0hpZGUgLSDRgdC70LDQudC0LCDQutC+0YLQvtGA0YvQuSDQvdGD0LbQvdC+INGB0LrRgNGL0YLRjFxuICAvLyBpbmRleFRvU2hvdyAtINGB0LvQsNC50LQsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0L/QvtC60LDQt9Cw0YLRjFxuICAvLyBpdGVtcyAtINCy0YHQtSDRgdC70LDQudC00YtcbiAgZnVuY3Rpb24gX2Rpc3BsYXlTbGlkZShpbmRleFRvSGlkZSwgaW5kZXhUb1Nob3csIGl0ZW1zKSB7XG5cbiAgICB2YXIgXG4gICAgICBpdGVtVG9IaWRlID0gaXRlbXMuZXEoaW5kZXhUb0hpZGUpLFxuICAgICAgaXRlbVRvU2hvdyA9IGl0ZW1zLmVxKGluZGV4VG9TaG93KTtcblxuICAgIGl0ZW1Ub0hpZGUucmVtb3ZlQ2xhc3MoJ3NsaWRlcl9faXRlbS0tYWN0aXZlJyk7XG4gICAgaXRlbVRvSGlkZS5hbmltYXRlKHsnb3BhY2l0eSc6ICcwJ30sIDE1MCk7XG5cbiAgICBpdGVtVG9TaG93LmFkZENsYXNzKCdzbGlkZXJfX2l0ZW0tLWFjdGl2ZScpO1xuICAgIGl0ZW1Ub1Nob3cuZGVsYXkoMTUwKS5hbmltYXRlKHsnb3BhY2l0eSc6ICcxJ30sIDE1MCk7XG4gIH07XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQsNC90LjQvNC40YDRg9C10YIg0YHQu9Cw0LnQtNC10YAg0YEg0LjQvdGE0L7RgNC80LDRhtC40LXQuVxuICAvLyBpbmRleFRvSGlkZSAtINGB0LvQsNC50LQsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0YHQutGA0YvRgtGMXG4gIC8vIGluZGV4VG9TaG93IC0g0YHQu9Cw0LnQtCwg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDQv9C+0LrQsNC30LDRgtGMXG4gIC8vIGluZm9JdGVtcyAtINCy0YHQtSDRgdC70LDQudC00Ysg0YEg0LjQvdGE0L7RgNC80LDRhtC40LXQuVxuICBmdW5jdGlvbiBfZGlzcGxheUluZm8oaW5kZXhUb0hpZGUsIGluZGV4VG9TaG93LCBpbmZvSXRlbXMpIHtcbiAgICBpbmZvSXRlbXMuZXEoaW5kZXhUb0hpZGUpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgaW5mb0l0ZW1zLmVxKGluZGV4VG9TaG93KS5jc3MoJ2Rpc3BsYXknLCAnaW5saW5lLWJsb2NrJyk7XG4gIH1cblxuXG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQvtC/0LXRgNC10LTQtdC70Y/QtdGCLCDQv9C+INC60LDQutC+0LzRgyDQutC+0L3RgtGA0L7Qu9GDINC80Ysg0LrQu9C40LrQvdGD0LvQuCDQuCDQstGL0LfRi9Cy0LDQtdGCINGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LjQtTpcbiAgLy8gX2Rpc3BsYXlJbmZvLCDRh9GC0L7QsdGLINC/0L7QutCw0LfQsNGC0Ywg0L3Rg9C20L3Rg9GOINC40L3RhNC+0YDQvNCw0YbQuNGOXG4gIC8vIF9kaXNwbGF5U2xpZGUuLCDRh9GC0L7QsdGLINC/0L7QutCw0LfQsNGC0Ywg0L3Rg9C20L3Ri9C5INGB0LvQsNC50LRcbiAgLy8gX21vdmVTbWFsbFNsaWRlciwg0YfRgtC+0LHRiyDQv9GA0L7QsNC90LjQvNC40YDQvtCy0LDRgtGMIHByZXYgY29udHJvbCBcbiAgLy8gX21vdmVTbWFsbFNsaWRlciwg0YfRgtC+0LHRiyDQv9GA0L7QsNC90LjQvNC40YDQvtCy0LDRgtGMIG5leHQgY29udHJvbCBcbiAgZnVuY3Rpb24gX21vdmVTbGlkZXIgKGUpIHtcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXJcbiAgICAgICAgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICBjb250YWluZXIgPSAkdGhpcy5jbG9zZXN0KCcuc2xpZGVyJyksXG4gICAgICAgIGl0ZW1zID0gY29udGFpbmVyLmZpbmQoJy5zbGlkZXJfX2l0ZW0nKSxcbiAgICAgICAgaW5mb0l0ZW1zID0gY29udGFpbmVyLmZpbmQoJy5zbGlkZXJfX2l0ZW0taW5mbycpLFxuICAgICAgICBtYXhJbmRleCA9IGl0ZW1zLmxlbmd0aCAtIDEsXG4gICAgICAgIHByZXZDb250cm9sID0gY29udGFpbmVyLmZpbmQoJy5zbGlkZXJfX2NvbnRyb2wtLXByZXYnKSxcbiAgICAgICAgbmV4dENvbnRyb2wgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9fY29udHJvbC0tbmV4dCcpLFxuICAgICAgICBhY3RpdmVJdGVtID0gY29udGFpbmVyLmZpbmQoJy5zbGlkZXJfX2l0ZW0tLWFjdGl2ZScpLFxuICAgICAgICBhY3RpdmVJbmRleCA9IGl0ZW1zLmluZGV4KGFjdGl2ZUl0ZW0pLFxuICAgICAgICBwcmV2SW5kZXggPSBfaW5kZXhEZWMoYWN0aXZlSW5kZXgsIG1heEluZGV4KSxcbiAgICAgICAgbmV4dEluZGV4ID0gX2luZGV4SW5jKGFjdGl2ZUluZGV4LCBtYXhJbmRleCk7XG5cbiAgICAgIC8vINC/0L7QutCw0LfQsNGC0Ywg0L/RgNC10LTRi9C00YPRidC40Lkg0YHQu9Cw0LnQtFxuICAgICAgaWYgKCAkdGhpcy5oYXNDbGFzcygnc2xpZGVyX19jb250cm9sLS1wcmV2JykgKSB7XG5cbiAgICAgICAgdmFyIHByZXZJbmRleERlYyA9IF9pbmRleERlYyhwcmV2SW5kZXgsIG1heEluZGV4KTtcbiAgICAgICAgdmFyIG5leHRJbmRleERlYyA9IF9pbmRleERlYyhuZXh0SW5kZXgsIG1heEluZGV4KTtcblxuICAgICAgICBfZGlzcGxheVNsaWRlKGFjdGl2ZUluZGV4LCBwcmV2SW5kZXgsIGl0ZW1zKTtcbiAgICAgICAgX2Rpc3BsYXlJbmZvKGFjdGl2ZUluZGV4LCBwcmV2SW5kZXgsIGluZm9JdGVtcyk7XG5cbiAgICAgICAgX21vdmVTbWFsbFNsaWRlcigndXAnLCBwcmV2Q29udHJvbCwgcHJldkluZGV4RGVjKTtcbiAgICAgICAgX21vdmVTbWFsbFNsaWRlcignZG93bicsIG5leHRDb250cm9sLCBuZXh0SW5kZXhEZWMpO1xuXG4gICAgICB9O1xuXG5cbiAgICAgIC8vINC/0L7QutCw0LfQsNGC0Ywg0YHQu9C10LTRg9GO0YnQuNC5INGB0LvQsNC50LRcbiAgICAgIGlmICggJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlcl9fY29udHJvbC0tbmV4dCcpICkge1xuXG4gICAgICAgIHZhciBwcmV2SW5kZXhJbmMgPSBfaW5kZXhJbmMocHJldkluZGV4LCBtYXhJbmRleCk7XG4gICAgICAgIHZhciBuZXh0SW5kZXhJbmMgPSBfaW5kZXhJbmMobmV4dEluZGV4LCBtYXhJbmRleCk7XG4gICAgICAgIFxuICAgICAgICBfZGlzcGxheVNsaWRlKGFjdGl2ZUluZGV4LCBuZXh0SW5kZXgsIGl0ZW1zKTtcbiAgICAgICAgX2Rpc3BsYXlJbmZvKGFjdGl2ZUluZGV4LCBuZXh0SW5kZXgsIGluZm9JdGVtcyk7XG5cbiAgICAgICAgX21vdmVTbWFsbFNsaWRlcigndXAnLCBwcmV2Q29udHJvbCwgcHJldkluZGV4SW5jKTtcbiAgICAgICAgX21vdmVTbWFsbFNsaWRlcignZG93bicsIG5leHRDb250cm9sLCBuZXh0SW5kZXhJbmMpO1xuXG4gICAgICB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgcHJlbG9hZGVyLmluaXQoKTtcbiAgbW9kYWwuaW5pdCgpO1xuICBoYW1idXJnZXJNZW51LmluaXQoKTtcbiAgc2Nyb2xsQnV0dG9ucy5pbml0KCk7XG5cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSBpbmRleFxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvaW5kZXguaHRtbCcgfHwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvJykge1xuXG4gICAgcGFyYWxsYXguaW5pdCgpO1xuICAgIGxvZ2luRm9ybS5pbml0KCk7XG4gICAgZmxpcENhcmQuaW5pdCgpO1xuICB9XG5cblxuICAvLyDQvdCwINGB0YLRgNCw0L3QuNGG0LUgYmxvZ1xuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvYmxvZy5odG1sJykge1xuXG4gICAgLy8g0JzQvtC00YPQu9GMIGJsb2dNZW51INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQuNC90LjRhtC40LDQu9C40LfQuNGA0L7QstCw0L0g0L/QvtGB0LvQtSDQvtGC0YDQuNGB0L7QstC60Lgg0LLRgdC10YUg0Y3Qu9C10LzQtdC90YLQvtCyLFxuICAgIC8vINC00LvRjyDRh9C10LPQviDQu9C+0LPQuNGH0L3QviDQsdGL0LvQviDQsdGLINC40YHQv9C+0LvRjNC30L7QstCw0YLRjCBkb2N1bWVudC5yZWFkeVxuICAgIC8vINCd0L4g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40LUgZG9jdW1lbnQucmVhZHkg0YLRg9GCINC90LXQstC+0LfQvNC+0LbQvdC+INC40Lct0LfQsCDQv9GA0LXQu9C+0LDQtNC10YDQsCwgXG4gICAgLy8g0YLQsNC6INC60LDQuiDQtNC70Y8g0L/RgNCw0LLQuNC70YzQvdC+0Lkg0YDQsNCx0L7RgtGLINC/0YDQtdC70L7QsNC00LXRgNCwINGDINCy0YHQtdGFINGN0LvQtdC80LXQvdGC0L7QsiDRgdC90LDRh9Cw0LvQsCDRgdGC0L7QuNGCIGRpc3BsYXk6IG5vbmUuXG4gICAgLy8g0LjQty3Qt9CwINGN0YLQvtCz0L4gZG9jdW1lbnQucmVhZHkg0YHRgNCw0LHQsNGC0YvQstCw0LXRgiDRgdC70LjRiNC60L7QvCDRgNCw0L3Qviwg0LrQvtCz0LTQsCDQvtGC0YDQuNGB0L7QstCw0L0g0YLQvtC70YzQutC+INC/0YDQtdC70L7QsNC00LXRgC5cbiAgICAvLyBcbiAgICAvLyDQv9C+0Y3RgtC+0LzRgyDQv9GA0LjRiNC70L7RgdGMINGB0L7Qt9C00LDRgtGMIERlZmVycmVkINC+0LHRitC10LrRgiDQsiDQvNC+0LTRg9C70LUgcHJlbG9hZGVyOiBwcmVsb2FkZXIuY29udGVudFJlYWR5XG4gICAgLy8gcHJlbG9hZGVyLmNvbnRlbnRSZWFkeSDQv9C+0LvRg9GH0LDQtdGCINC80LXRgtC+0LQgLnJlc29sdmUoKSDRgtC+0LvRjNC60L4g0L/QvtGB0LvQtSDRgtC+0LPQviwg0LrQsNC6INCy0YHQtSDRjdC70LXQvNC10L3RgtGLINC/0L7Qu9GD0YfQsNGO0YIgZGlzcGxheTogYmxvY2tcbiAgICAvLyDQodC+0L7RgtCy0LXRgtGB0YLQstC10L3QvdC+LCDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyBibG9nTWVudSDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9C+0YHQu9C1INC/0L7Qu9GD0YfQtdC90LjRjyBkaXNwbGF5OiBibG9jayDQuCDQvtGC0YDQuNGB0L7QstC60Lgg0LLRgdC10YUg0Y3Qu9C10LzQtdC90YLQvtCyXG5cbiAgICBwcmVsb2FkZXIuY29udGVudFJlYWR5LmRvbmUoZnVuY3Rpb24oKSB7IFxuICAgICAgc2Nyb2xsc3B5LmluaXQoKTtcbiAgICAgIGJsb2dNZW51UGFuZWwuaW5pdCgpO1xuICAgIH0pO1xuICB9XG5cblxuICAvLyDQvdCwINGB0YLRgNCw0L3QuNGG0LUgd29ya3NcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL3dvcmtzLmh0bWwnKSB7XG5cbiAgICBibHVyLmluaXQoKTtcbiAgICBzbGlkZXIuaW5pdCgpO1xuICAgIHNsaWRlclRpdGxlc0FuaW1hdGlvbi5pbml0KCk7XG4gICAgY29udGFjdEZvcm0uaW5pdCgpO1xuICB9XG5cblxuICAvLyDQvdCwINGB0YLRgNCw0L3QuNGG0LUgYWJvdXRcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2Fib3V0Lmh0bWwnKSB7XG4gICAgc2tpbGxzQW5pbWF0aW9uLmluaXQoKTtcbiAgfVxuXG5cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
