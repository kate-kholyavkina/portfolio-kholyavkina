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


  // на странице admin
  if ($('#add-blog-btn').length) {
    addBlogForm.init('#add-blog-btn');
  }



})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9fbW9kYWwuanMiLCJfX3ByZWxvYWRlci5qcyIsIl9fdmFsaWRhdGlvbi5qcyIsIl9hZGQtYmxvZy1mb3JtLmpzIiwiX2Jsb2ctbWVudS5qcyIsIl9ibHVyLmpzIiwiX2NvbnRhY3QtZm9ybS5qcyIsIl9mbGlwLmpzIiwiX2hhbWJ1cmdlci1tZW51LmpzIiwiX2xvZ2luLWZvcm0uanMiLCJfbWFwLmpzIiwiX3BhcmFsbGF4LmpzIiwiX3Njcm9sbC1idXR0b25zLmpzIiwiX3NraWxscy5qcyIsIl9zbGlkZXItdGl0bGVzLmpzIiwiX3NsaWRlci5qcyIsImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbW9kYWwgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobXNnKSB7XG4gICAgX3Nob3dNZXNzYWdlKG1zZyk7XG4gIH1cblxuXG4gIHZhciBcbiAgICBfbW9kYWxIb2xkZXIgPSAkKCcubW9kYWxfX2hvbGRlcicpLFxuICAgIF9tb2RhbCA9ICQoJy5tb2RhbCcpLFxuICAgIF9tb2RhbFRleHQgPSAkKCcubW9kYWxfX3RleHQnKTtcblxuXG4gIC8vINC/0YDQvtGB0LvRg9GI0LrQsCDRgdC+0LHRi9GC0LjQuVxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMoKSB7XG4gICAgJCgnI21vZGFsLWNsb3NlJykub24oXCJjbGlja1wiLCBfaGlkZU1lc3NhZ2UpO1xuICB9XG5cblxuICAvLyDQv9C+0LrQsNC30YvQstCw0LXQvCDRgdC+0L7QsdGJ0LXQvdC40LVcbiAgZnVuY3Rpb24gX3Nob3dNZXNzYWdlIChtc2cpIHtcbiAgICBfbW9kYWxUZXh0LnRleHQobXNnKTtcbiAgICBfbW9kYWwuY3NzKHtcbiAgICAgICd0b3AnOiAnNTAlJyxcbiAgICAgICdvcGFjaXR5JzogJzAnXG4gICAgfSkuYW5pbWF0ZSh7XG4gICAgICAnb3BhY2l0eSc6ICcxJyxcbiAgICB9LCAzMDApO1xuICAgIF9tb2RhbEhvbGRlci5zaG93KCk7XG4gIH1cblxuXG4gIC8vINC/0YDRj9GH0LXQvCDRgdC+0L7QsdGJ0LXQvdC40LVcbiAgZnVuY3Rpb24gX2hpZGVNZXNzYWdlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgX21vZGFsLmNzcyh7XG4gICAgICAndG9wJzogJy0xMDAlJ1xuICAgIH0pLmFuaW1hdGUoe1xuICAgICAgJ29wYWNpdHknOiAnMCcsXG4gICAgfSwgMzAwLCBmdW5jdGlvbigpe1xuICAgICAgX21vZGFsSG9sZGVyLmhpZGUoKTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBzaG93TWVzc2FnZTogc2hvd01lc3NhZ2VcbiAgfTtcblxufSkoKTtcbiIsInZhciBwcmVsb2FkZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gIHZhciBcbiAgICAvLyDQvNCw0YHRgdC40LIg0LTQu9GPINCy0YHQtdGFINC40LfQvtCx0YDQsNC20LXQvdC40Lkg0L3QsCDRgdGC0YDQsNC90LjRhtC1XG4gICAgX2ltZ3MgPSBbXSxcbiAgICBcbiAgICAvLyDQsdGD0LTQtdGCINC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0LjQtyDQtNGA0YPQs9C40YUg0LzQvtC00YPQu9C10LksINGH0YLQvtCx0Ysg0L/RgNC+0LLQtdGA0LjRgtGMLCDQvtGC0YDQuNGB0L7QstCw0L3RiyDQu9C4INCy0YHQtSDRjdC70LXQvNC10L3RgtGLXG4gICAgLy8g0YIu0LouIGRvY3VtZW50LnJlYWR5INC40Lct0LfQsCDQv9GA0LXQu9C+0LDQtNC10YDQsCDRgdGA0LDQsdCw0YLRi9Cy0LDQtdGCINGA0LDQvdGM0YjQtSwg0LrQvtCz0LTQsCDQvtGC0YDQuNGB0L7QstCw0L0g0L/RgNC10LvQvtCw0LTQtdGALCDQsCDQvdC1INCy0YHRjyDRgdGC0YDQsNC90LjRhtCwXG4gICAgY29udGVudFJlYWR5ID0gJC5EZWZlcnJlZCgpO1xuXG5cbiAgLy8g0LjQvdC40YbQuNCw0LvRjNC30LDRhtC40Y8g0LzQvtC00YPQu9GPXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9jb3VudEltYWdlcygpO1xuICAgIF9zdGFydFByZWxvYWRlcigpO1xuXG4gIH07XG5cbiAgZnVuY3Rpb24gX2NvdW50SW1hZ2VzKCl7XG5cbiAgICAvLyDQv9GA0L7RhdC+0LTQuNC8INC/0L4g0LLRgdC10Lwg0Y3Qu9C10LzQtdC90YLQsNC8INC90LAg0YHRgtGA0LDQvdC40YbQtVxuICAgICQuZWFjaCgkKCcqJyksIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICBiYWNrZ3JvdW5kID0gJHRoaXMuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyksXG4gICAgICAgIGltZyA9ICR0aGlzLmlzKCdpbWcnKTtcblxuICAgICAgLy8g0LfQsNC/0LjRgdGL0LLQsNC10Lwg0LIg0LzQsNGB0YHQuNCyINCy0YHQtSDQv9GD0YLQuCDQuiDQsdGN0LrQs9GA0LDRg9C90LTQsNC8XG4gICAgICBpZiAoYmFja2dyb3VuZCAhPSAnbm9uZScpIHtcblxuICAgICAgICAvLyDQsiBjaHJvbWUg0LIg0YPRgNC70LUg0LXRgdGC0Ywg0LrQsNCy0YvRh9C60LgsINCy0YvRgNC10LfQsNC10Lwg0YEg0L3QuNC80LguIHVybChcIi4uLlwiKSAtPiAuLi5cbiAgICAgICAgLy8g0LIgc2FmYXJpINCyINGD0YDQu9C1INC90LXRgiDQutCw0LLRi9GH0LXQuiwg0LLRi9GA0LXQt9Cw0LXQvCDQsdC10Lcg0L3QuNGFLiB1cmwoIC4uLiApIC0+IC4uLlxuICAgICAgICB2YXIgcGF0aCA9IGJhY2tncm91bmQucmVwbGFjZSgndXJsKFwiJywgXCJcIikucmVwbGFjZSgnXCIpJywgXCJcIik7XG4gICAgICAgIHZhciBwYXRoID0gcGF0aC5yZXBsYWNlKCd1cmwoJywgXCJcIikucmVwbGFjZSgnKScsIFwiXCIpO1xuXG4gICAgICAgIF9pbWdzLnB1c2gocGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vINC30LDQv9C40YHRi9Cy0LDQtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0L/Rg9GC0Lgg0Log0LrQsNGA0YLQuNC90LrQsNC8XG4gICAgICBpZiAoaW1nKSB7XG4gICAgICAgIHZhciBwYXRoID0gJycgKyAkdGhpcy5hdHRyKCdzcmMnKTtcbiAgICAgICAgaWYgKCAocGF0aCkgJiYgKCR0aGlzLmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpICkge1xuICAgICAgICAgIF9pbWdzLnB1c2gocGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0pO1xuXG4gIH07XG5cblxuICBmdW5jdGlvbiBfc3RhcnRQcmVsb2FkZXIoKXtcblxuICAgICQoJ2JvZHknKS5hZGRDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJyk7XG5cbiAgICAvLyDQt9Cw0LPRgNGD0LbQtdC90L4gMCDQutCw0YDRgtC40L3QvtC6XG4gICAgdmFyIGxvYWRlZCA9IDA7XG5cbiAgICAvLyDQv9GA0L7RhdC+0LTQuNC8INC/0L4g0LLRgdC10Lwg0YHQvtCx0YDQsNC90L3Ri9C8INC60LDRgNGC0LjQvdC60LDQvCBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9pbWdzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgIHZhciBpbWFnZSA9ICQoJzxpbWc+Jywge1xuICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgc3JjOiBfaW1nc1tpXVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8g0LfQsNCz0YDRg9C20LDQtdC8INC/0L4g0L/QvtC00L3QvtC5IFxuICAgICAgJChpbWFnZSkubG9hZChmdW5jdGlvbigpe1xuICAgICAgICBsb2FkZWQrKztcbiAgICAgICAgdmFyIHBlcmNlbnRMb2FkZWQgPSBfY291bnRQZXJjZW50KGxvYWRlZCxfaW1ncy5sZW5ndGgpO1xuICAgICAgICBfc2V0UGVyY2VudChwZXJjZW50TG9hZGVkKTtcbiAgICAgIH0pO1xuXG4gICAgfTtcblxuICB9XG5cbiAgLy8g0L/QtdGA0LXRgdGH0LjRgtGL0LLQsNC10YIg0LIg0L/RgNC+0YbQtdC90YLRiywg0YHQutC+0LvRjNC60L4g0LrQsNGA0YLQuNC90L7QuiDQt9Cw0LPRgNGD0LbQtdC90L5cbiAgLy8gY3VycmVudCAtIG51bWJlciwg0YHQutC+0LvRjNC60L4g0LrQsNGA0YLQuNC90L7QuiDQt9Cw0LPRgNGD0LbQtdC90L5cbiAgLy8gdG90YWwgLSBudW1iZXIsINGB0LrQvtC70YzQutC+INC40YUg0LLRgdC10LPQvlxuICBmdW5jdGlvbiBfY291bnRQZXJjZW50KGN1cnJlbnQsIHRvdGFsKXtcbiAgICByZXR1cm4gTWF0aC5jZWlsKGN1cnJlbnQgLyB0b3RhbCAqIDEwMCk7XG4gIH1cblxuICBcbiAgXG4gIC8vINC30LDQv9C40YHRi9Cy0LDQtdGCINC/0YDQvtGG0LXQvdGCINCyIGRpdiDQv9GA0LXQu9C+0LDQtNC10YBcbiAgLy8gcGVyY2VudCAtIG51bWJlciwg0LrQsNC60YPRjiDRhtC40YTRgNGDINC30LDQv9C40YHQsNGC0YxcbiAgZnVuY3Rpb24gX3NldFBlcmNlbnQocGVyY2VudCl7XG5cbiAgICAkKCcucHJlbG9hZGVyX19wZXJjZW50cycpLnRleHQocGVyY2VudCk7XG5cbiAgICAvLyDQutC+0LPQtNCwINC00L7RiNC70Lgg0LTQviAxMDAlLCDRgdC60YDRi9Cy0LDQtdC8INC/0YDQtdC70L7QsNC00LXRgCDQuCDQv9C+0LrQsNC30YvQstCw0LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDRgdGC0YDQsNC90LjRhtGLXG4gICAgaWYgKHBlcmNlbnQgPj0gMTAwKSB7XG4gICAgICAkKCcucHJlbG9hZGVyX19oaWRkZW4nKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICQoJy5wcmVsb2FkZXInKS5mYWRlT3V0KDMwMCk7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuICAgICAgX2ZpbmlzaFByZWxvYWRlcigpO1xuICAgIH1cblxuICB9O1xuXG4gIGZ1bmN0aW9uIF9maW5pc2hQcmVsb2FkZXIoKXtcblxuICAgIGNvbnRlbnRSZWFkeS5yZXNvbHZlKCk7XG4gIH07XG5cblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBjb250ZW50UmVhZHk6IGNvbnRlbnRSZWFkeVxuICB9O1xuXG59KSgpO1xuXG5cbiIsInZhciB2YWxpZGF0aW9uID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIF92YWxpZGF0ZUVtYWlsKGVtYWlsKSB7XG4gICAgdmFyIHJlID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG4gICAgLy8gdmFyIHJlID0gL1tBLVowLTkuXyUrLV0rQFtBLVowLTkuLV0rLltBLVpdezIsNH0vaWdtO1xuICAgIHJldHVybiByZS50ZXN0KGVtYWlsKTtcbiAgfVxuXG4gIC8vINC30LDQutGA0LDRiNC40LLQsNC10Lwg0L3QtdC60L7RgNGA0LXQutGC0L3Ri9C1INC40L3Qv9GD0YLRiyDQsiDQutGA0LDRgdC90YvQuVxuICBmdW5jdGlvbiBzZXRFcnJvclN0eWxlcyhlbGVtZW50KSB7XG4gICAgZWxlbWVudC5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZmFmYSdcbiAgICB9KTtcbiAgfVxuXG4gIC8vINC/0LXRgNC10LrRgNCw0YjQuNCy0LDQtdC8INC40L3Qv9GD0YLRiyDQvtCx0YDQsNGC0L3QviDQsiDQsdC10LvRi9C5XG4gIGZ1bmN0aW9uIGNsZWFyRXJyb3JTdHlsZXMoZWxlbWVudCkge1xuXG4gICAgLy8g0LvRjtCx0YvQtSwg0LrRgNC+0LzQtSBzdWJtaXRcbiAgICBpZiAoZWxlbWVudC5hdHRyKCd0eXBlJykgPT0gJ3N1Ym1pdCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlbGVtZW50LmNzcyh7XG4gICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmZmJ1xuICAgIH0pO1xuICB9XG5cblxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRm9ybSAoZm9ybSkge1xuXG4gICAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWVzc2FnZSA9ICcnO1xuICAgIHZhciBlbGVtZW50cyA9IGZvcm0uZmluZCgnaW5wdXQsIHRleHRhcmVhJykubm90KFxuICAgICAgJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0sICcgKyBcbiAgICAgICdpbnB1dFt0eXBlPVwiZmlsZVwiXSwgJyArIFxuICAgICAgJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKSxcbiAgICAgIC8vICDRjdC70LXQvNC10L3RgtGLINC70LTRjyDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3QvtC5INC/0YDQvtCy0LXRgNC60LguINCV0YHQu9C4INCyINGE0L7RgNC80LUg0LXRgdGC0Ywg0YHQv9C10YbQuNGE0LjRh9C10YHQutC40LUg0L/QvtC70Y9cbiAgICAgIC8vICDQv9GA0LjQvNC10YAg0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y86INC90YPQttC90L4g0L/RgNC+0LLQtdGA0LjRgtGMINC40L3Qv9GD0YIg0YLQuNC/0LAgJ2NoZWNrYm94JyDRgSBpZCAnaXNodW1hbicg0L3QsCDRgtC+INGH0YLQviDQvtC9ICd0cnVlJywgXG4gICAgICAvLyAg0LIg0YHQu9GD0YfQsNC1INC+0YjQuNCx0LrQuCDQstGL0LLQtdGB0YLQuCAnZXJyb3JNc2cnLlxuICAgICAgLy8gXG4gICAgICAvLyAgdmFsaWRhdGlvbi52YWxpZGF0ZUZvcm0oZm9ybSwgW3tcbiAgICAgIC8vICAgIGlkOiAnaXNodW1hbicsXG4gICAgICAvLyAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgLy8gICAgY2hlY2tlZDogdHJ1ZSxcbiAgICAgIC8vICAgIGVycm9yTXNnOiAn0KDQvtCx0L7RgtCw0Lwg0LfQtNC10YHRjCDQvdC1INC80LXRgdGC0L4nXG4gICAgICAvLyAgfV0pO1xuICAgICAgaXRlbXNUb0NoZWNrID0gYXJndW1lbnRzWzFdO1xuXG5cbiAgICAvLyDQutCw0LbQtNGL0Lkg0Y3Quy3RgiDRhNC+0YDQvNGLXG4gICAgJC5lYWNoKGVsZW1lbnRzLCBmdW5jdGlvbihpbmRleCwgZWxlbSl7XG5cbiAgICAgIHZhciBcbiAgICAgICAgZWxlbWVudCA9ICQoZWxlbSksXG4gICAgICAgIHZhbHVlID0gZWxlbWVudC52YWwoKTtcblxuICAgICAgLy8g0L/RgNC+0LLQtdGA0Y/QtdC8INC60LDQttC00YvQuSDRjdC7LdGCINC90LAg0L/Rg9GB0YLQvtGC0YMgKNC60YDQvtC80LUgY2hlY2tib3gg0LggcmFkaW8pXG4gICAgICBpZiAoICAoZWxlbWVudC5hdHRyKCd0eXBlJykgIT0gXCJjaGVja2JveFwiKSAmJlxuICAgICAgICAgICAgKGVsZW1lbnQuYXR0cigndHlwZScpICE9IFwicmFkaW9cIikgJiZcbiAgICAgICAgICAgICh2YWx1ZS5sZW5ndGggPT09IDApICkge1xuXG4gICAgICAgIC8v0LXRgdC70Lgg0LTQsCwg0YLQviDQvtGI0LjQsdC60LAgXG4gICAgICAgIHNldEVycm9yU3R5bGVzKGVsZW1lbnQpO1xuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICBtZXNzYWdlID0gJ9CS0Ysg0LfQsNC/0L7Qu9C90LjQu9C4INC90LUg0LLRgdC1INC/0L7Qu9GPINGE0L7RgNC80YsnO1xuICAgICAgfVxuXG4gICAgICAvLyDQv9GA0L7QstC10YDRj9C10Lwg0LrQsNC20LTRi9C5IGVtYWlsINCy0LDQu9C40LTQsNGC0L7RgNC+0Lwg0LjQvNC10LnQu9C+0LJcbiAgICAgIGlmIChlbGVtZW50LmF0dHIoJ3R5cGUnKSA9PSBcImVtYWlsXCIpIHtcblxuXG4gICAgICAgIC8vINC10YHQu9C4INC40LzQtdC50Lsg0L3QtSDQstCw0LvQuNC00L3Ri9C5XG4gICAgICAgIGlmICghX3ZhbGlkYXRlRW1haWwodmFsdWUpKSB7XG5cbiAgICAgICAgICAvL9GC0L4g0L7RiNC40LHQutCwIFxuICAgICAgICAgIHNldEVycm9yU3R5bGVzKGVsZW1lbnQpO1xuICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgbWVzc2FnZSA9ICfQndC10LrQvtGA0YDQtdC60YLQvdGL0LkgZW1haWwnO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgLy8g0L/QsNGA0YHQuNC8INGB0L/QuNGB0L7QuiDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9GFINGN0LvQtdC80LXQvdGC0L7QsiDQvdCwINC/0YDQvtCy0LXRgNC60YNcbiAgICAgICQoaXRlbXNUb0NoZWNrKS5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKXtcblxuICAgICAgICAvLyDQtdGB0LvQuCDRgtC10LrRg9GJ0LjQuSDRjdC70LXQvNC10L3RgiDRhNC+0YDQvNGLINGB0L7QstC/0LDQtNCw0LXRgiDRgSDQutCw0LrQuNC8LdGC0L4g0LjQtyDRjdC7LdGC0L7QsiDRgdC/0LjRgdC60LAgaXRlbXNUb0NoZWNrXG4gICAgICAgIGlmIChlbGVtZW50LmF0dHIoJ2lkJykgPT09IGl0ZW0uaWQpIHtcblxuICAgICAgICAgIC8vINC10YHQu9C4INGN0YLQviDRh9C10LrQsdC+0LrRgSDQuNC70Lgg0YDQsNC00LjQviwgXG4gICAgICAgICAgLy8gJiZcbiAgICAgICAgICAvLyDQtdGB0LvQuCDQt9C90LDRh9C10L3QuNC1IGNoZWNrZWQg0L3QtSDRgNCw0LLQvdC+INGC0L7QvNGDLCDRh9GC0L4g0LzRiyDRhdC+0YLQuNC8ICjRh9GC0L4g0LzRiyDQv9C10YDQtdC00LDQu9C4INC/0YDQuCDQstGL0LfQvtCy0LUpICggdHJ1ZS8gZmFsc2UgKVxuICAgICAgICAgIGlmICggKGl0ZW0udHlwZSA9PT0gJ2NoZWNrYm94JyB8fCBpdGVtLnR5cGUgPT09ICdyYWRpbycpICYmXG4gICAgICAgICAgICBlbGVtZW50LnByb3AoJ2NoZWNrZWQnKSAhPT0gaXRlbS5jaGVja2VkICApIHtcblxuICAgICAgICAgICAgLy8g0YLQviDQvtGI0LjQsdC60LAgXG4gICAgICAgICAgICBzZXRFcnJvclN0eWxlcyhlbGVtZW50KTtcbiAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICBtZXNzYWdlID0gaXRlbS5lcnJvck1zZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cblxuICAgIH0pO1xuXG5cbiAgICAvLyDQstGL0LLQvtC00LjQvCDRgdC+0L7QsdGJ0LXQvdC40LUg0L7QsSDQvtGI0LjQsdC60LUg0YEg0L/QvtC80L7RidGM0Y4g0LzQvtC00YPQu9GPIG1vZGFsIChfbW9kYWwuanMpXG4gICAgaWYgKG1lc3NhZ2UgIT09ICcnKSB7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHZhbGlkYXRlRm9ybTogdmFsaWRhdGVGb3JtLFxuICAgIHNldEVycm9yU3R5bGVzOiBzZXRFcnJvclN0eWxlcyxcbiAgICBjbGVhckVycm9yU3R5bGVzOiBjbGVhckVycm9yU3R5bGVzXG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgYWRkQmxvZ0Zvcm0gPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgJGFkZEJsb2dCdG47XG5cbiAgZnVuY3Rpb24gaW5pdCAoYWRkQmxvZ0J0bikge1xuICAgICRhZGRCbG9nQnRuID0gJChhZGRCbG9nQnRuKTtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICRhZGRCbG9nQnRuLm9uKCdjbGljaycsIF9zdWJtaXRGb3JtKTsgIFxuICAgICQoJy5mb3JtLS1hZGQtYmxvZyBpbnB1dCwgLmZvcm0tLWFkZC1ibG9nIHRleHRhcmVhJykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7ICBcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9jbGVhckVycm9yU3R5bGVzKCkge1xuICAgIHZhbGlkYXRpb24uY2xlYXJFcnJvclN0eWxlcygkKHRoaXMpKTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhclxuICAgICAgZm9ybSA9ICQodGhpcykuY2xvc2VzdCgnLmZvcm0nKSxcbiAgICAgIGRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCQodGhpcykpO1xuICAgIGNvbnNvbGUubG9nKGZvcm0pO1xuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgaWYgKHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0pKSB7XG4gICAgICBfc2VuZEZvcm0oZGF0YSwgJy9hZG1pbi9ibG9nJyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZW5kRm9ybShkYXRhLCB1cmwpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogdXJsLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UocmVzcG9uc2UubWVzc2FnZSk7XG4gICAgICAvLyBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgIC8vICAgbW9kYWwuc2hvd01lc3NhZ2UocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgLy8gfSBlbHNlIGlmIChyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICAvLyB9XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZSgn0L/RgNC+0LjQt9C+0YjQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLiDQv9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3INC40LvQuCDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQsNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgNGDJyk7XG4gICAgfSlcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBzY3JvbGxzcHkgPSAoZnVuY3Rpb24gKCkge1xuXG4gIF9uYXYgPSAkKCcuYmxvZy1uYXZfX2xpbmsnKTtcblxuXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX3Njcm9sbFNweSgpO1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICB9O1xuXG4gIC8vIGlmIChfbmF2ID09PSAwKSB7XG4gIC8vICAgcmV0dXJuO1xuICAvLyB9O1xuXG4gIC8vINC/0YDQvtGB0LvRg9GI0LrQsCDRgdC+0LHRi9GC0LjQuVxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMoKSB7XG5cbiAgICAvLyDQv9C+INGB0LrRgNC+0LvQu9GDINC00LXQu9Cw0LXQvCBzY3JvbGwgc3B5XG4gICAgJCh3aW5kb3cpLm9uKFwic2Nyb2xsXCIsIF9zY3JvbGxTcHkpO1xuXG4gICAgLy8g0L/QviDQutC70LjQutGDINC/0LXRgNC10YXQvtC00LjQvCDQvdCwINC90YPQttC90YPRjiDRgdGC0LDRgtGM0Y4g0YEg0LDQvdC40LzQsNGG0LjQtdC5XG4gICAgJChfbmF2KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgX3Nob3dBcnRpY2xlKCQoZS50YXJnZXQpLmF0dHIoJ2hyZWYnKSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICAvLyDQv9C+INGB0YHRi9C70LrQtSDQv9C10YDQtdGF0L7QtNC40Lwg0L3QsCDQvdGD0LbQvdGD0Y4g0YHRgtCw0YLRjNGOINCx0LXQtyDQsNC90LjQvNCw0YbQuNC4XG4gICAgJChmdW5jdGlvbigpIHtcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAhPT0gJycpIHtcbiAgICAgICAgX3Nob3dBcnRpY2xlKHdpbmRvdy5sb2NhdGlvbi5oYXNoLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vINC/0LXRgNC10YXQvtC0INC90LAg0L3Rg9C20L3Rg9GOINGB0YLQsNGC0YzRjiAo0YEg0LDQvdC40LzQsNGG0LjQtdC5INC40LvQuCDQsdC10LcpXG4gIGZ1bmN0aW9uIF9zaG93QXJ0aWNsZShhcnRpY2xlLCBpc0FuaW1hdGUpIHtcbiAgICB2YXIgXG4gICAgICBkaXJlY3Rpb24gPSBhcnRpY2xlLnJlcGxhY2UoJyMnLCAnJyksXG4gICAgICByZXFBcnRpY2xlID0gJCgnLmFydGljbGVzX19pdGVtJykuZmlsdGVyKCdbZGF0YS1hcnRpY2xlPVwiJyArIGRpcmVjdGlvbiArICdcIl0nKSxcbiAgICAgIHJlcUFydGljbGVQb3MgPSByZXFBcnRpY2xlLm9mZnNldCgpLnRvcDtcblxuICAgICAgaWYgKGlzQW5pbWF0ZSkge1xuICAgICAgICAkKCdib2R5LCBodG1sJykuYW5pbWF0ZSh7XG4gICAgICAgICAgc2Nyb2xsVG9wOiByZXFBcnRpY2xlUG9zXG4gICAgICAgIH0sIDUwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKCdib2R5LCBodG1sJykuc2Nyb2xsVG9wKHJlcUFydGljbGVQb3MpO1xuICAgICAgfVxuICB9XG5cblxuICAvLyBzY3JvbGwgc3B5XG4gIGZ1bmN0aW9uIF9zY3JvbGxTcHkoKSB7XG4gICAgJCgnLmFydGljbGVzX19pdGVtJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyXG4gICAgICAgICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgdG9wRWRnZSA9ICR0aGlzLm9mZnNldCgpLnRvcCAtIDIwMCxcbiAgICAgICAgYnRtRWRnZSA9IHRvcEVkZ2UgKyAkdGhpcy5oZWlnaHQoKSxcbiAgICAgICAgd1Njcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuICAgICAgICBpZiAodG9wRWRnZSA8IHdTY3JvbGwgJiYgYnRtRWRnZSA+IHdTY3JvbGwpIHtcbiAgICAgICAgICB2YXIgXG4gICAgICAgICAgICBjdXJyZW50SWQgPSAkdGhpcy5kYXRhKCdhcnRpY2xlJyksXG4gICAgICAgICAgICBhY3RpdmVMaW5rID0gX25hdi5maWx0ZXIoJ1tocmVmPVwiIycgKyBjdXJyZW50SWQgKyAnXCJdJyk7XG5cbiAgICAgICAgICBhY3RpdmVMaW5rLmNsb3Nlc3QoJy5ibG9nLW5hdl9faXRlbScpLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcblxuXG5cbnZhciBibG9nTWVudVBhbmVsID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGh0bWwgPSAkKCdodG1sJyk7XG4gIHZhciBib2R5ID0gJCgnYm9keScpO1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpe1xuICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIF9sb2NhdGVNZW51KCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMoKXtcblxuICAgICQoJy5vZmYtY2FudmFzLS1tZW51Jykub24oJ2NsaWNrJywgX29wZW5NZW51KTtcbiAgICAkKCcub2ZmLWNhbnZhcy0tY29udGVudCcpLm9uKCdjbGljaycsIF9jbG9zZU1lbnUpO1xuXG4gICAgJCh3aW5kb3cpLm9uKHtcbiAgICAgICdyZXNpemUnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgX2Nsb3NlTWVudSgpO1xuICAgICAgICBfbG9jYXRlTWVudSgpO1xuICAgICAgfSxcbiAgICAgICdzY3JvbGwnOiBfZml4TWVudVxuICAgIH0pO1xuXG4gIH07XG5cblxuICBmdW5jdGlvbiBfb3Blbk1lbnUoKXtcbiAgICBpZiAoICQoIHdpbmRvdyApLndpZHRoKCkgPCA3NjggKSB7XG4gICAgICBodG1sLmFkZENsYXNzKCdodG1sLS1ibG9nLW9wZW5lZCcpO1xuICAgIH1cbiAgfVxuXG5cbiAgZnVuY3Rpb24gX2Nsb3NlTWVudSgpe1xuICAgIGlmICggJCggd2luZG93ICkud2lkdGgoKSA8IDc2OCApIHtcbiAgICAgIGh0bWwucmVtb3ZlQ2xhc3MoJ2h0bWwtLWJsb2ctb3BlbmVkJyk7XG4gICAgfVxuICB9XG5cblxuICBmdW5jdGlvbiBfZml4TWVudSgpIHtcblxuICAgIHZhciBoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XG4gICAgdmFyIGhlYWRlckhlaWdodCA9IGhlYWRlci5oZWlnaHQoKTtcbiAgICB2YXIgbWVudSA9ICQoJy5vZmYtY2FudmFzLS1tZW51Jyk7XG4gICAgdmFyIHNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWTtcblxuICAgIGlmIChzY3JvbGxZID4gaGVhZGVySGVpZ2h0KSB7XG4gICAgICBtZW51LmFkZENsYXNzKCdmaXhlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZW51LnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgIH1cbiAgICAgICAgXG4gIH1cblxuICBmdW5jdGlvbiBfbG9jYXRlTWVudSgpIHtcblxuICAgIHZhciBoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XG4gICAgdmFyIG1lbnUgPSAkKCcub2ZmLWNhbnZhcy0tbWVudScpO1xuXG4gICAgLy8gIG1lbnUgJ3RvcCcgaXMgcmlnaHQgdW5kZXIgdGhlIGhlYWRlclxuICAgIC8vICBtZW51ICd0b3AnIGlzIDAgd2hlbiBtZW51IGlzIG9uIGdyZWVuIHBhbmVsXG4gICAgaWYgKCAkKCB3aW5kb3cgKS53aWR0aCgpID4gNzY4ICkge1xuICAgICAgbWVudS5jc3MoJ3RvcCcsIGhlYWRlci5jc3MoJ2hlaWdodCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVudS5jc3MoJ3RvcCcsICcwJyk7XG4gICAgfVxuICB9XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBibHVyID0gKGZ1bmN0aW9uICgpIHtcblxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gIH1cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMoKSB7XG4gICAgLy8g0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdC8INCx0LvRjtGAINC/0L4g0LfQsNCz0YDRg9C30LrQtSDRgdGC0YDQsNC90LjRhtGLINC4INGA0LXRgdCw0LnQt9GDINC+0LrQvdCwXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZScsIF9ibHVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9ibHVyKCkge1xuXG4gICAgdmFyIGJnID0gJCgnLmJsdXJfX2JnJyk7XG5cbiAgICBpZiAoYmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyByZXR1cm47XG4gICAgfTtcblxuICAgIHZhciBmb3JtID0gJCgnLmJsdXJfX2Zvcm0nKSxcbiAgICAgIGJnV2lkdGggPSBiZy53aWR0aCgpLFxuICAgICAgcG9zVG9wICA9IGJnLm9mZnNldCgpLnRvcCAgLSBmb3JtLm9mZnNldCgpLnRvcCxcbiAgICAgIHBvc0xlZnQgPSBiZy5vZmZzZXQoKS5sZWZ0IC0gZm9ybS5vZmZzZXQoKS5sZWZ0O1xuXG4gICAgZm9ybS5jc3Moe1xuICAgICAgJ2JhY2tncm91bmQtc2l6ZSc6IGJnV2lkdGggKyAncHgnICsgJyAnICsgJ2F1dG8nLFxuICAgICAgJ2JhY2tncm91bmQtcG9zaXRpb24nOiBwb3NMZWZ0ICsgJ3B4JyArICcgJyArIHBvc1RvcCArICdweCdcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcblxuIiwidmFyIGNvbnRhY3RGb3JtID0gKGZ1bmN0aW9uICgpIHtcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICQoJyNjb250YWN0LWJ0bicpLm9uKCdjbGljaycsIF9zdWJtaXRGb3JtKTsgIFxuICAgICQoJy5mb3JtLS1jb250YWN0IGlucHV0LCAuZm9ybS0tY29udGFjdCB0ZXh0YXJlYScpLm9uKCdrZXlkb3duJywgX2NsZWFyRXJyb3JTdHlsZXMpOyAgXG4gIH07XG5cblxuICBmdW5jdGlvbiBfY2xlYXJFcnJvclN0eWxlcygpIHtcbiAgICB2YWxpZGF0aW9uLmNsZWFyRXJyb3JTdHlsZXMoJCh0aGlzKSk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIF9zdWJtaXRGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyXG4gICAgICBmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCcuZm9ybScpLFxuICAgICAgZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XG4gICAgXG4gICAgaWYgKHZhbGlkYXRpb24udmFsaWRhdGVGb3JtKGZvcm0pKSB7XG4gICAgICBfc2VuZEZvcm0oZm9ybSk7XG4gICAgfTtcblxuICB9XG5cbiAgZnVuY3Rpb24gX3NlbmRGb3JtKGZvcm0pe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogJ2Fzc2V0cy9waHAvbWFpbC5waHAnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZm9ybS5zZXJpYWxpemUoKVxuICAgIH0pLmRvbmUoZnVuY3Rpb24oaHRtbCl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZShodG1sKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGh0bWwpe1xuICAgICAgbW9kYWwuc2hvd01lc3NhZ2UoJ9Ch0L7QvtCx0YnQtdC90LjQtSDQvdC1INC+0YLQv9GA0LDQstC70LXQvdC+IScpO1xuICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBmbGlwQ2FyZCA9IChmdW5jdGlvbiAoKSB7XG5cblxuICB2YXIgaXNXZWxjb21lRmxpcHBlZCA9IGZhbHNlLFxuICAgICAgYnV0dG9uVHJpZ2dlckZsaXAgPSAkKCcuYnRuLS1zaG93LWxvZ2luJyksXG4gICAgICBmbGlwQ29udGFpbmVyID0gJCgnLmZsaXAtY29udGFpbmVyJyk7XG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0bmVycygpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3NldFVwTGlzdG5lcnMgKCkge1xuXG4gICAgYnV0dG9uVHJpZ2dlckZsaXAub24oJ2NsaWNrJywgX3Nob3dMb2dpbik7XG4gICAgJCgnLndyYXBwZXItLXdlbGNvbWUsIC5mb290ZXItLXdlbGNvbWUnKS5vbignY2xpY2snLCBfcHJlcGFyZVRvSGlkZSk7XG4gICAgJCgnLmJ0bi0taGlkZS1sb2dpbicpLm9uKCdjbGljaycsIF9oaWRlTG9naW4pO1xuICB9O1xuXG5cblxuICAvLyDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDQtdC8INC+0LHRgNCw0YLQvdC+XG4gIGZ1bmN0aW9uIF9oaWRlTG9naW4oZSkge1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaXNXZWxjb21lRmxpcHBlZCA9IGZhbHNlO1xuICAgIGZsaXBDb250YWluZXIucmVtb3ZlQ2xhc3MoJ2ZsaXAnKTtcbiAgICBidXR0b25UcmlnZ2VyRmxpcC5mYWRlVG8oMzAwLCAxLCBmdW5jdGlvbigpe1xuICAgICAgYnV0dG9uVHJpZ2dlckZsaXAuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICB9KTtcblxuICB9O1xuXG5cblxuICAvLyDQv9C+INC60LvQuNC60YMg0L3QsCDQvtCx0LvQsNGB0YLQuCDQstC+0LrRgNGD0LMsINC/0LXRgNC10LLQvtGA0LDRh9C40LLQsNC10Lwg0L7QsdGA0LDRgtC90L5cbiAgZnVuY3Rpb24gX3ByZXBhcmVUb0hpZGUoZSkge1xuICAgICAgLy8g0LXRgdC70Lgg0LrQu9C40LrQsNC10Lwg0L3QsCDQutCw0YDRgtC+0YfQutC1LCDRgtC+INC/0LXRgNC10LLQvtGA0LDRh9C40LLQsNGC0Ywg0L3QtSDQvdCw0LTQvlxuICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJy53ZWxjb21lX19jYXJkJykgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8g0LXRgdC70Lgg0LrQsNGA0YLQvtGH0LrQsCDRg9C20LUg0L/QtdGA0LXQstC10YDQvdGD0YLQsCxcbiAgICAgIGlmIChpc1dlbGNvbWVGbGlwcGVkIFxuICAgICAgICAvLyDQuCDQvNGLINC60LvQuNC60L3Rg9C70Lgg0L3QtSDQv9C+INC60L3QvtC/0LrQtSBcItCQ0LLRgtC+0YDQuNC30L7QstCw0YLRjNGB0Y9cIlxuICAgICAgICAmJiBlLnRhcmdldC5pZCAhPSBidXR0b25UcmlnZ2VyRmxpcC5hdHRyKCdpZCcpXG4gICAgICAgICkge1xuICAgICAgICAvLyDRgtC+INC/0LXRgNC10LLQvtGA0LDRh9C40LLQsNC10Lwg0L7QsdGA0LDRgtC90L5cbiAgICAgICAgX2hpZGVMb2dpbihlKTtcbiAgICAgIH1cbiAgfTtcblxuXG4gIFxuICBmdW5jdGlvbiBfc2hvd0xvZ2luKGUpIHtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpc1dlbGNvbWVGbGlwcGVkID0gdHJ1ZTtcbiAgICBmbGlwQ29udGFpbmVyLmFkZENsYXNzKCdmbGlwJyk7XG4gICAgYnV0dG9uVHJpZ2dlckZsaXAuZmFkZVRvKDMwMCwgMCkuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9O1xuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgaGFtYnVyZ2VyTWVudSA9IChmdW5jdGlvbiAoKSB7XG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0bmVycygpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3NldFVwTGlzdG5lcnMgKCkge1xuICAgICQoJyNidXJnZXItYnRuJykub24oJ2NsaWNrJywgX3RvZ2dsZU1lbnUpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3RvZ2dsZU1lbnUoZSkge1xuXG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYnVyZ2VyLWJ0bi0tYWN0aXZlJyk7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdvdmVyZm93LWhpZGRlbicpO1xuICAgICQoJy5tYWluLW1lbnUnKS50b2dnbGVDbGFzcygnbWFpbi1tZW51LS1vcGVuJyk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTsiLCJ2YXIgbG9naW5Gb3JtID0gKGZ1bmN0aW9uICgpIHtcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0ZW5lcnMgKCkge1xuICAgICQoJyNsb2dpbi1idG4nKS5vbignY2xpY2snLCBfc3VibWl0Rm9ybSk7XG4gICAgJCgnLmZvcm0tLWxvZ2luIGlucHV0Jykubm90KCcjbG9naW4tYnRuJykub24oJ2tleWRvd24nLCBfY2xlYXJFcnJvclN0eWxlcyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gX2NsZWFyRXJyb3JTdHlsZXMoKSB7XG4gICAgdmFsaWRhdGlvbi5jbGVhckVycm9yU3R5bGVzKCQodGhpcykpO1xuICB9XG5cbiAgZnVuY3Rpb24gX3N1Ym1pdEZvcm0oZSkge1xuICAgIGNvbnNvbGUubG9nKCdzdWJtaXR0aW5nIExvZ2luIEZvcm0gJyk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhclxuICAgICAgZm9ybSA9ICQodGhpcykuY2xvc2VzdCgnLmZvcm0nKSxcbiAgICAgIGRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xuXG4gICAgZm9ybUlzVmFsaWQgPSB2YWxpZGF0aW9uLnZhbGlkYXRlRm9ybShmb3JtLCBbe1xuICAgICAgaWQ6ICdpc2h1bWFuJyxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBjaGVja2VkOiB0cnVlLFxuICAgICAgZXJyb3JNc2c6ICfQoNC+0LHQvtGC0LDQvCDQt9C00LXRgdGMINC90LUg0LzQtdGB0YLQvidcbiAgICB9LCB7XG4gICAgICBpZDogJ25vdHJvYm90LXllcycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogdHJ1ZSxcbiAgICAgIGVycm9yTXNnOiAn0KDQvtCx0L7RgtCw0Lwg0LfQtNC10YHRjCDQvdC1INC80LXRgdGC0L4nXG4gICAgfSwge1xuICAgICAgaWQ6ICdub3Ryb2JvdC1ubycsXG4gICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgY2hlY2tlZDogZmFsc2UsXG4gICAgICBlcnJvck1zZzogJ9Cg0L7QsdC+0YLQsNC8INC30LTQtdGB0Ywg0L3QtSDQvNC10YHRgtC+J1xuICAgIH1dKTtcblxuICAgIGlmIChmb3JtSXNWYWxpZCkge1xuICAgICAgX3NlbmRGb3JtKGRhdGEsICcvYXV0aC8nKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZW5kRm9ybShkYXRhLCB1cmwpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgIHVybDogdXJsLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgIG1vZGFsLnNob3dNZXNzYWdlKHJlc3BvbnNlLmVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBtb2RhbC5zaG93TWVzc2FnZSgn0L/RgNC+0LjQt9C+0YjQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLiDQv9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3INC40LvQuCDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQsNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgNGDJyk7XG4gICAgfSlcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBtYXAgPSAoZnVuY3Rpb24gKCkge1xuXG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIFxuICAgICAgbWFwRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLFxuICAgICAgaXNEcmFnZ2FibGU7XG5cbiAgICAgIGlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XG4gICAgICAgIGlzRHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0RyYWdnYWJsZSA9IHRydWU7XG4gICAgICB9XG4gICAgXG4gICAgdmFyIG1hcE9wdGlvbnMgPSB7XG4gICAgICBjZW50ZXI6IHtcbiAgICAgICAgbGF0OiA1MC40NDUwMDgsIFxuICAgICAgICBsbmc6IDMwLjUxNDgxMVxuICAgICAgfSxcbiAgICAgIHpvb206IDEyLFxuICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcbiAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcbiAgICAgIGRyYWdnYWJsZTogaXNEcmFnZ2FibGUsXG4gICAgICBzdHlsZXM6IFt7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNDQ0NDQ0XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmNvdW50cnlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHRcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmNvdW50cnlcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZS5jb3VudHJ5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLmljb25cIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2YyZjJmMlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5hdHRyYWN0aW9uXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuYnVzaW5lc3NcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5nb3Zlcm5tZW50XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kubWVkaWNhbFwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaS5wbGFjZV9vZl93b3JzaGlwXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kuc3BvcnRzX2NvbXBsZXhcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOi0xMDB9LHtcImxpZ2h0bmVzc1wiOjQ1fSx7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcInNpbXBsaWZpZWRcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5hcnRlcmlhbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0LnN0YXRpb25cIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMmJkM2I3XCJ9LHtcInZpc2liaWxpdHlcIjpcInNpbXBsaWZpZWRcIn1dfV1cbiAgICB9XG5cblxuICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcERpdiwgbWFwT3B0aW9ucyk7XG5cbiAgfTtcblxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xuXG59KSgpOyIsInZhciBwYXJhbGxheCA9IChmdW5jdGlvbiAoKSB7XG5cblxuICAvLyDQuNC90LjRhtC40LDQu9GM0LfQsNGG0LjRjyDQvNC+0LTRg9C70Y9cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgLy8g0LLQutC70Y7Rh9Cw0LXQvCDQv9GA0L7RgdC70YPRiNC60YMgXG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgICAvLyDRgdGA0LDQt9GDINC20LUg0LjRidC10Lwg0YjQuNGA0LjQvdGDINC4INCy0YvRgdC+0YLRgyDQv9Cw0YDQsNC70LvQsNC60YHQsFxuICAgIF9wYXJhbGxheFJlc2l6ZSgpO1xuICB9O1xuXG4gIHZhciBcbiAgICAgIC8vINGB0LrQvtGA0L7RgdGC0Ywg0Lgg0YDQsNC30LzQsNGFINC00LLQuNC20LXQvdC40Y8g0YHQu9C+0LXQslxuICAgICAgX3NwZWVkID0gMSAvIDUwLFxuICAgICAgX3dpbmRvdyAgICA9ICQod2luZG93KSxcbiAgICAgIF93V2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCksXG4gICAgICBfd0hlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQoKSxcbiAgICAgIF9oYWxmV2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCkgLyAyLFxuICAgICAgX2hhbGZIZWlnaHQgPSBfd2luZG93LmlubmVySGVpZ2h0KCkgLyAyLFxuICAgICAgX2xheWVycyAgPSAkKCcucGFyYWxsYXgnKS5maW5kKCcucGFyYWxsYXhfX2xheWVyJyk7XG5cblxuXG4gIC8vINGD0YHRgtCw0L3QsNCy0LvQvNCy0LDQtdC8INC/0YDQvtGB0LvRg9GI0LrRgyDQvdCwINC00LLQuNC20LXQvdC40LUg0LzRi9GI0Lgg0Lgg0YDQtdGB0LDQudC3INC+0LrQvdCwXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcbiAgICAkKHdpbmRvdykub24oJ21vdXNlbW92ZScsIF9wYXJhbGxheE1vdmUpO1xuICAgICQod2luZG93KS5vbigncmVzaXplJywgX3BhcmFsbGF4UmVzaXplKTtcbiAgfTtcblxuICAvLyDRhNGD0L3QutGG0LjRjyDQv9C10YDQtdGB0YfQuNGC0YvQstCw0LXRgiDRiNC40YDQuNC90YMg0Lgg0LLRi9GB0L7RgtGDINC00LvRjyDRgdC70L7QtdCyINC/0LDRgNCw0LvQu9Cw0LrRgdCwXG4gIGZ1bmN0aW9uIF9wYXJhbGxheFJlc2l6ZSgpIHtcblxuXG4gICAgLy8g0LrQsNC20LTRi9C5INGA0LDQtyDQv9GA0Lgg0YDQtdGB0LDQudC30LUg0L/QtdGA0LXRgdGH0LjRgtCw0YvQstCw0LXQvCDRgNCw0LfQvNC10YDRiyDQvtC60L3QsFxuICAgIHZhciBcbiAgICAgIF93V2lkdGggID0gX3dpbmRvdy5pbm5lcldpZHRoKCksXG4gICAgICBfd0hlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQoKSxcbiAgICAgIF9oYWxmSGVpZ2h0ID0gX3dpbmRvdy5pbm5lckhlaWdodCgpIC8gMjtcblxuICAgIC8vINC40YnQtdC8INC80LDQutGB0LjQvNCw0LvRjNC90YvQuSDQvdC+0LzQtdGAINGB0LvQvtGPXG4gICAgdmFyIG1heEluZGV4ID0gX2xheWVycy5sZW5ndGggLTE7XG5cbiAgICAvLyDRgyDQutCw0YDRgtC40L3QutC4INCx0YPQtNGD0YIg0L7RgtGB0YLRg9C/0Ysg0YHQv9GA0LDQstCwINC4INGB0LvQtdCy0LAsINGH0YLQvtCx0Ysg0L/QsNGA0LDQu9C70LDQutGBINC/0L7Qu9C90L7RgdGC0YzRjiDQv9C+0LzQtdGJ0LDQu9GB0Y8uXG4gICAgLy8g0L7RgtGB0YLRg9C/0Ysg0YDQsNCy0L3RiyDQvNCw0LrRgdC40LzQsNC70YzQvdC+0LzRgyDRgdC00LLQuNCz0YMg0YHQu9C+0LXQslxuICAgIC8vICjRgdCw0LzRi9C5INC/0L7RgdC70LXQtNC90LjQuSDRgdC70L7QuSDQtNCy0LjQs9Cw0LXRgtGB0Y8g0LHQvtC70YzRiNC1INCy0YHQtdGFLCDRgtCw0Log0YfRgtC+INC40YnQtdC8INC40LzQtdC90L3QvdC+INC10LPQviDQvNCw0LrRgdC40LzQsNC70YzQvdGL0Lkg0YHQtNCy0LjQsylcbiAgICB2YXIgbWF4U2hpZnRYID0gX2hhbGZXaWR0aCAqIG1heEluZGV4ICogX3NwZWVkLFxuXG5cbiAgICAgICAgLy8g0YjQuNGA0LjQvdCwIFwi0YDQsNGB0YjQuNGA0LXQvdC90L7QuVwiINC60LDRgNGC0LjQvdC60Lg6INGI0LjRgNC40L3QsCDQvtC60L3QsCArIDIg0L7RgtGB0YLRg9C/0LBcbiAgICAgICAgd2lkdGhXaWRlciA9IF93V2lkdGggKyAobWF4U2hpZnRYICogMiksXG5cbiAgICAgICAgLy/RgdC+0L7RgtC90L7RiNC10L3QuNC1INGB0YLQvtGA0L7QvSDRjdC60YDQsNC90LAgKNCy0YvRgdC+0YLRgyDRjdC60YDQsNC90LAg0LTQtdC70LjQvCDQvdCwINGI0LjRgNC40L3RgyBcItGA0LDRgdGI0LjRgNC10L3QvdC+0LlcIiDQutCw0YDRgtC40L3QutC4KVxuICAgICAgICB3aW5kb3dSYXRpbyA9IChfd0hlaWdodCAvIHdpZHRoV2lkZXIpLFxuXG4gICAgICAgIC8v0YHQvtC+0YLQvdC+0YjQtdC90LjQtSDRgdGC0L7RgNC+0L0g0YDQtdCw0LvRjNC90L7QuSDQutCw0YDRgtC40L3QutC4XG4gICAgICAgIHBpY3R1cmVSYXRpbyA9ICgxOTk0IC8gMzAwMCk7XG5cblxuICAgIC8vINC10YHQu9C4INC60LDRgNGC0LjQvdC60LAg0L/QvtC80LXRidCw0LXRgtGB0Y8g0LIg0Y3QutGA0LDQvSDQv9C+INCy0YvRgdC+0YLQtSwg0YLQviDQvdCw0LTQviDQtdC1INGD0LLQtdC70LjRh9C40YLRjFxuICAgIGlmICggd2luZG93UmF0aW8gPiBwaWN0dXJlUmF0aW8gKSB7XG4gICAgICAvLyDQstGL0YHQvtGC0LAgPSDQstGL0YHQvtGC0LUg0Y3QutGA0LDQvdCwLCDQstGB0LUg0L7RgdGC0LDQu9GM0L3QvtC1INGA0LDRgdGB0YfQuNGC0YvQstCw0LXQvCwg0LjRgdGF0L7QtNGPINC40Lcg0Y3RgtC+0Lkg0LLRi9GB0L7RgtGLXG4gICAgICBwYXJhbGxheEhlaWdodCA9IF93SGVpZ2h0ICsgJ3B4JztcbiAgICAgIHBhcmFsbGF4V2lkdGggPSBfd0hlaWdodCAvIHBpY3R1cmVSYXRpbztcbiAgICAgIHBhcmFsbGF4TWFyZ2luTGVmdCA9IChwYXJhbGxheFdpZHRoICAtIF93V2lkdGgpIC8gMjtcblxuICAgIC8vINC10YHQu9C4INC60LDRgNGC0LjQvdC60LAg0L3QtSDQv9C+0LzQtdGJ0LDQtdGC0YHRjyDQsiDRjdC60YDQsNC9INC/0L4g0LLRi9GB0L7RgtC1LCDRgtC+INCy0YvRgdC+0YLQsCDQsdGD0LTQtdGCINGA0LDRgdGB0YfQuNGC0YvQstCw0YLRjNGB0Y8g0LDQstGC0L7QvNCw0YLQuNGH0LXRgdC60LhcbiAgICAvLyDQsdGD0LTQtdC8INCy0YvRgNCw0LLQvdC40LLQsNGC0Ywg0L/QviDRiNC40YDQuNC90LVcbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyDRiNC40YDQuNC90LAgPSDRiNC40YDQuNC90LUg0Y3QutGA0LDQvdCwICgrIDIg0L7RgtGB0YLRg9C/0LApLCDQstGB0LUg0L7RgdGC0LDQu9GM0L3QvtC1INGA0LDRgdGB0YfQuNGC0YvQstCw0LXQvCwg0LjRgdGF0L7QtNGPINC40Lcg0Y3RgtC+0Lkg0YjQuNGA0LjQvdGLXG4gICAgICBwYXJhbGxheFdpZHRoID0gd2lkdGhXaWRlcjtcbiAgICAgIHBhcmFsbGF4SGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgcGFyYWxsYXhNYXJnaW5MZWZ0ID0gbWF4U2hpZnRYO1xuXG4gICAgfVxuXG4gICAgLy8g0L/QvtC00YHRgtCw0LLQu9GP0LXQvCDQvdCw0LnQtNC10L3QvdGL0LUg0LfQvdCw0YfQtdC90LjRjyDRiNC40YDQuNC90YssINCy0YvRgdC+0YLRiyDQuCBtYXJnaW4tbGVmdCDQstGB0LXQvCDRgdC70L7Rj9C8XG4gICAgX2xheWVycy5jc3MoIHtcbiAgICAgICd3aWR0aCc6IHBhcmFsbGF4V2lkdGggKyAncHgnLFxuICAgICAgJ2hlaWdodCc6IHBhcmFsbGF4SGVpZ2h0LFxuICAgICAgJ21hcmdpbi1sZWZ0JzogJy0nICsgcGFyYWxsYXhNYXJnaW5MZWZ0ICsgJ3B4J1xuICAgIH0pO1xuXG5cbiAgICAkLmVhY2goX2xheWVycywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuICAgICAgLy8gdG9wU2hpZnQgLSDRjdGC0L4g0LLQtdC70LjRh9C40L3QsCwg0L3QsCDQutC+0YLQvtGA0YPRjiDQvdGD0LbQvdC+INGB0LTQstC40L3Rg9GC0Ywg0LrQsNC20LTRi9C5INGB0LvQvtC5INCy0L3QuNC3LCDRh9GC0L7QsdGLINC90LUg0LHRi9C70L4g0LLQuNC00L3QviDQutGA0LDQtdCyIFxuICAgICAgdG9wU2hpZnQgPSAgKF9oYWxmSGVpZ2h0ICogaW5kZXggKiBfc3BlZWQpO1xuICAgICAgJChlbGVtKS5jc3Moe1xuICAgICAgICAndG9wJzogdG9wU2hpZnQgKyAncHgnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gIH07XG5cblxuXG5cbiAgLy8g0YTRg9C90LrRhtC40Y8g0LTQstC40LPQsNC10YIg0YHQu9C+0Lgg0LIg0LfQsNCy0LjRgdC40LzQvtGB0YLQuCDQvtGCINC/0L7Qu9C+0LbQtdC90LjRjyDQvNGL0YjQuFxuICBmdW5jdGlvbiBfcGFyYWxsYXhNb3ZlIChlKSB7XG5cbiAgICB2YXIgXG4gICAgICAgIC8vINC/0L7Qu9C+0LbQtdC90LjQtSDQvNGL0YjQuFxuICAgICAgICBtb3VzZVggID0gZS5wYWdlWCxcbiAgICAgICAgbW91c2VZICA9IGUucGFnZVksXG5cbiAgICAgICAgLy8g0L/QvtC70L7QttC10L3QuNC1INC80YvRiNC4INCyINC90LDRiNC10Lkg0L3QvtCy0L7QuSDRgdC40YHRgtC10LzQtSDQutC+0L7RgNC00LjQvdCw0YIgKNGBINGG0LXQvdGC0YDQvtC8INCyINGB0LXRgNC10LTQuNC90LUg0Y3QutGA0LDQvdCwKVxuICAgICAgICBjb29yZFggID0gX2hhbGZXaWR0aCAtIG1vdXNlWCxcbiAgICAgICAgY29vcmRZICA9IF9oYWxmSGVpZ2h0IC0gbW91c2VZO1xuXG4gICAgICAgIC8vIG1vdmUgZWFjaCBsYXllclxuICAgICAgICAkLmVhY2goX2xheWVycywgZnVuY3Rpb24oaW5kZXgsIGVsZW0pe1xuXG4gICAgICAgICAgLy8g0YDQsNGB0YHRh9C40YLRi9Cy0LDQtdC8INC00LvRjyDQutCw0LbQtNC+0LPQviDRgdC70L7Rjywg0L3QsCDRgdC60L7Qu9GM0LrQviDQtdCz0L4g0YHQtNCy0LjQs9Cw0YLRjFxuICAgICAgICAgIHZhciBzaGlmdFggPSBNYXRoLnJvdW5kKGNvb3JkWCAqIGluZGV4ICogX3NwZWVkKSxcbiAgICAgICAgICAgICAgc2hpZnRZID0gTWF0aC5yb3VuZChjb29yZFkgKiBpbmRleCAqIF9zcGVlZCksXG4gICAgICAgICAgICAgIC8vIHRvcFNoaWZ0IC0g0Y3RgtC+INCy0LXQu9C40YfQuNC90LAsINC90LAg0LrQvtGC0L7RgNGD0Y4g0L3Rg9C20L3QviDRgdC00LLQuNC90YPRgtGMINC60LDQttC00YvQuSDRgdC70L7QuSDQstC90LjQtywg0YfRgtC+0LHRiyDQvdC1INCx0YvQu9C+INCy0LjQtNC90L4g0LrRgNCw0LXQsiBcbiAgICAgICAgICAgICAgdG9wU2hpZnQgPSAgKF9oYWxmSGVpZ2h0ICogaW5kZXggKiBfc3BlZWQpO1xuXG4gICAgICAgICAgJChlbGVtKS5jc3Moe1xuICAgICAgICAgICAgJ3RvcCc6IHRvcFNoaWZ0ICsgJ3B4JyxcbiAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJyArIHNoaWZ0WCArICdweCwgJyArIHNoaWZ0WSArICdweCwgJyArICcgMCknXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcblxuIiwidmFyIHNjcm9sbEJ1dHRvbnMgPSAoZnVuY3Rpb24gKCkge1xuXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX3NldFVwTGlzdG5lcnMoKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zZXRVcExpc3RuZXJzICgpIHtcbiAgICAkKCcuc2Nyb2xsLWNvbnRyb2wtLWRvd24nKS5vbignY2xpY2snLCBfc2Nyb2xsRG93bilcbiAgICAkKCcuc2Nyb2xsLWNvbnRyb2wtLXVwJykub24oJ2NsaWNrJywgX3Njcm9sbFVwKVxuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3Njcm9sbFVwKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgX3Njcm9sbFRvKCAnMCcsIDcwMCApO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3Njcm9sbERvd24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBfc2Nyb2xsVG8oICQoXCIuaGVhZGVyXCIpLmhlaWdodCgpICwgNTAwKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIF9zY3JvbGxUbyhwb3MsIGR1cmF0aW9uKXtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICBzY3JvbGxUb3A6IHBvc1xuICAgIH0sIGR1cmF0aW9uKTtcbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7IiwidmFyIHNraWxsc0FuaW1hdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICBfc2V0VXBMaXN0bmVycygpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gX3NldFVwTGlzdG5lcnMgKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgX3Njcm9sbCk7XG4gIH07XG5cbiAgLy8g0LXRgdC70Lgg0LTQvtGB0LrRgNC+0LvQu9C40LvQuCDQtNC+INCx0LvQvtC60LAg0YHQviDRgdC60LjQu9Cw0LzQuCwg0YLQviDQv9C+0LrQsNC30YvQstCw0LXQvCDQuNGFXG4gIGZ1bmN0aW9uIF9zY3JvbGwoZSkge1xuICAgIFxuICAgIHdTY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgc2tpbGxzVG9wID0gJCgnLnNraWxscy1ibG9jaycpLm9mZnNldCgpLnRvcCAtIDIwMDtcblxuICAgIGlmICh3U2Nyb2xsID4gc2tpbGxzVG9wKSB7XG4gICAgICBfc2hvd1NraWxscygpO1xuICAgIH1cblxuICAgIFxuICB9XG5cblxuICAvLyDRhNGD0L3QutGG0LjRjyDQv9C+0LrQsNC30YvQstCw0LXRgiDQuCDQsNC90LjQvNC40YDRg9C10YIg0YHQutC40LvRiy5cbiAgZnVuY3Rpb24gX3Nob3dTa2lsbHMoKXtcblxuICAgIHZhciBhcmMsIGNpcmN1bWZlcmVuY2U7XG4gICAgdmFyIHRpbWUgPSAwO1xuICAgIHZhciBkZWxheSA9IDE1MDtcblxuICAgICQoJ2NpcmNsZS5pbm5lcicpLmVhY2goZnVuY3Rpb24oaSwgZWwpe1xuICAgICAgXG4gICAgICB2YXIgYXJjID0gTWF0aC5jZWlsKCQoZWwpLmRhdGEoJ2FyYycpKTtcbiAgICAgIHZhciBjaXJjdW1mZXJlbmNlID0gTWF0aC5jZWlsKCQoZWwpLmRhdGEoJ2NpcmN1bWZlcmVuY2UnKSk7XG5cbiAgICAgIC8vINCw0L3QuNC80LjRgNGD0LXQvCDQutCw0LbQtNGL0Lkg0LrRgNGD0LMg0YEg0LHQvtC70YzRiNC10Lkg0LfQsNC00LXRgNC20LrQvtC5XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgJChlbCkuY2xvc2VzdCgnLnNraWxsc19faXRlbScpLmFuaW1hdGUoe1xuICAgICAgICAgICdvcGFjaXR5JzogJzEnXG4gICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgJChlbCkuY3NzKCdzdHJva2UtZGFzaGFycmF5JywgYXJjKydweCAnICsgY2lyY3VtZmVyZW5jZSArICdweCcpO1xuXG4gICAgICB9LCB0aW1lICs9IGRlbGF5ICk7XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7IiwidmFyIHNsaWRlclRpdGxlc0FuaW1hdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgX2FuaW1hdGVUaXRsZXMoKTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINC/0YDQvtGF0L7QtNC40YIg0L/QviDQstGB0LXQvCDQt9Cw0LPQvtC70L7QstC60LDQvCDRgdC70LDQudC00LXRgNCwLiDRhNGD0L3QutGG0LjRjyDQs9C10L3QtdGA0LjRgNGD0LXRgiBodG1sLdC60L7QtCwgXG4gIC8vINC30LDQstC+0YDQsNGH0LjQstCw0Y7RidC40Lkg0LLRgdC1INCx0YPQutCy0Ysg0Lgg0YHQu9C+0LLQsCDQsiBodG1sLdGC0LXQs9C4INC00LvRjyDQtNCw0LvRjNC90LXQudGI0LXQuSDRgNCw0LHQvtGC0Ysg0YEg0L3QuNC80Lgg0YEg0L/QvtC80L7RidGM0Y4gY3NzXG4gIGZ1bmN0aW9uIF9hbmltYXRlVGl0bGVzKCkge1xuXG4gICAgdmFyIFxuICAgICAgX3RpdGxlcyA9ICQoJy5zbGlkZXJfX2luZm8gLnNlY3Rpb24tdGl0bGVfX2lubmVyJyksXG4gICAgICBpbmplY3Q7XG5cblxuICAgIC8vINC60LDQttC00YvQuSDQt9Cw0LPQvtC70L7QstC+0LpcbiAgICBfdGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIFxuICAgICAgdmFyIFxuICAgICAgICAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgIHRpdGxlVGV4dCA9ICR0aGlzLnRleHQoKTtcblxuICAgICAgLy8g0L7Rh9C40YnQsNC10Lwg0LfQsNCz0L7Qu9C+0LLQvtC6LCDRh9GC0L7QsdGLINC/0L7RgtC+0Lwg0LLRgdGC0LDQstC40YLRjCDRgtGD0LTQsCDRgdCz0LXQvdC10YDQuNGA0L7QstCw0L3QvdGL0Lkg0LrQvtC0XG4gICAgICAkdGhpcy5odG1sKCcnKTtcblxuICAgICAgLy8g0YHRh9C10YLRh9C40Log0LTQu9GPINC90L7QvNC10YDQvtCyINCx0YPQutCyINCyINC30LDQs9C+0LvQvtCy0LrQtVxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAvLyDRgNCw0LHQvtGC0LDQtdC8INGBINC60LDQttC00YvQvCDRgdC70L7QstC+0Lw6IFxuICAgICAgJC5lYWNoKHRpdGxlVGV4dC5zcGxpdCgnICcpLCBmdW5jdGlvbihjLCB3b3JkKSB7XG5cbiAgICAgICAgICAvLyDQvtGH0LjRidCw0LXQvCDRgdC70L7QstC+XG4gICAgICAgICAgaW5qZWN0ID0gJyc7XG5cbiAgICAgICAgICAvLyDQutCw0LbQtNCw0Y8g0LHRg9C60LLQsCDQt9Cw0LLQtdGA0L3Rg9GC0LAg0LIgc3BhbiDRgSDQutC70LDRgdGB0LDQvNC4IGNoYXItLTEsIGNoYXItLTIsIC4uLiAuIFxuICAgICAgICAgIC8vINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGN0YLQuNGFINC60LvQsNGB0YHQvtCyINCx0YPQutCy0LDQvCDQsiBjc3Mg0L/RgNC+0YHRgtCw0LLQu9GP0LXRgtGB0Y8g0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQuNC5IGFuaW1hdGlvbi1kZWxheS5cbiAgICAgICAgICAkLmVhY2god29yZC5zcGxpdCgnJyksIGZ1bmN0aW9uKGssIGNoYXIpIHtcbiAgICAgICAgICAgIGluamVjdCArPSAnPHNwYW4gY2xhc3M9XCJjaGFyIGNoYXItLScgKyBpICsgJ1wiPicgKyBjaGFyICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g0LrQsNC20LTQvtC1INGB0LvQvtCy0L4g0LfQsNCy0LXRgNC90YPRgtC+INCyIHNwYW4gY2xhc3M9XCJ3b3JkXCIsINGH0YLQvtCx0Ysg0YDQtdGI0LjRgtGMINC/0YDQvtCx0LvQtdC80YMg0YEg0L/QtdGA0LXQvdC+0YHQvtC8INGB0YLRgNC+0Log0L/QvtGB0YDQtdC00Lgg0YHQu9C+0LLQsFxuICAgICAgICAgIHZhciB3b3JkID0gJzxzcGFuIGNsYXNzPVwid29yZFwiPicgKyBpbmplY3QgKyAnPC9zcGFuPic7XG5cblxuICAgICAgICAgICR0aGlzLmFwcGVuZCh3b3JkKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG4gIH07XG5cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcblxufSkoKTtcbiIsInZhciBzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIF9zZXRVcExpc3RuZXJzKCk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBfc2V0VXBMaXN0bmVycyAoKSB7XG4gICAgJCgnLnNsaWRlcl9fY29udHJvbCcpLm9uKCdjbGljaycsIF9tb3ZlU2xpZGVyKTtcbiAgfTtcblxuXG4gIC8vINGD0LzQtdC90YzRiNCw0LXRgiDQvdC+0LzQtdGAINGB0LvQsNC50LTQsCDQvdCwINC10LTQuNC90LjRhtGDICjQtdGB0LvQuCDQvdCw0LTQviwg0LfQsNC60L7Qu9GM0YbQvtCy0YvQstCw0LXRgilcbiAgZnVuY3Rpb24gX2luZGV4RGVjKGFjdGl2ZUluZGV4LCBtYXhJbmRleCkge1xuICAgICAgdmFyIHByZXZJbmRleCA9IChhY3RpdmVJbmRleCA8PSAgIDAgICkgPyBtYXhJbmRleCA6IGFjdGl2ZUluZGV4IC0gMTtcbiAgICAgIHJldHVybiBwcmV2SW5kZXg7XG4gIH07XG5cblxuICAvLyDRg9Cy0LXQu9C40YfQuNCy0LDQtdGCINC90L7QvNC10YAg0YHQu9Cw0LnQtNCwINC90LAg0LXQtNC40L3QuNGG0YMgKNC10YHQu9C4INC90LDQtNC+LCDQt9Cw0LrQvtC70YzRhtC+0LLRi9Cy0LDQtdGCKVxuICBmdW5jdGlvbiBfaW5kZXhJbmMoYWN0aXZlSW5kZXgsIG1heEluZGV4KSB7XG4gICAgICB2YXIgbmV4dEluZGV4ID0gKGFjdGl2ZUluZGV4ID49IG1heEluZGV4KSA/ICAgMCAgIDogYWN0aXZlSW5kZXggKyAxO1xuICAgICAgcmV0dXJuIG5leHRJbmRleDtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDQvNCw0LvQtdC90YzQutC40LUg0YHQu9Cw0LnQtNC10YDRiyAocHJldiwgbmV4dClcbiAgLy8gZGlyZWN0aW9uIC0g0L3QsNC/0YDQsNCy0LvQtdC90LjQtSDRgdC70LDQudC00LXRgNCwLCDQv9GA0LjQvdC40LzQsNC10YIg0LfQvdCw0YfQtdC90LjRjyAndXAnLydkb3duJywg0LLQvdC40Lcv0LLQstC10YDRhVxuICAvLyBjb250cm9sIC0g0YHQu9Cw0LnQtNC10YAsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0L/RgNC+0LDQvdC40LzQuNGA0L7QstCw0YLRjDog0LvQtdCy0YvQuSDQuNC70Lgg0L/RgNCw0LLRi9C5XG4gIC8vIG5ld0luZGV4IC0g0L3QvtC80LXRgCDRgdC70LDQudC00LAsINC60L7RgtC+0YDRi9C5INC/0L7QutCw0LfQsNGC0Ywg0YHQu9C10LTRg9GO0YjQuNC8XG4gIGZ1bmN0aW9uIF9tb3ZlU21hbGxTbGlkZXIoZGlyZWN0aW9uLCBjb250cm9sLCBuZXdJbmRleCkge1xuICAgIHZhciBcbiAgICAgIGl0ZW1zID0gY29udHJvbC5maW5kKCcuY29udHJvbF9faXRlbScpLFxuICAgICAgb2xkSXRlbSA9IGNvbnRyb2wuZmluZCgnLmNvbnRyb2xfX2l0ZW0tLWFjdGl2ZScpLFxuICAgICAgbmV3SXRlbSA9IGl0ZW1zLmVxKG5ld0luZGV4KTtcblxuXG4gICAgICBvbGRJdGVtLnJlbW92ZUNsYXNzKCdjb250cm9sX19pdGVtLS1hY3RpdmUnKTtcbiAgICAgIG5ld0l0ZW0uYWRkQ2xhc3MoJ2NvbnRyb2xfX2l0ZW0tLWFjdGl2ZScpO1xuXG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICd1cCcpIHtcblxuICAgICAgICBuZXdJdGVtLmNzcygndG9wJywgJzEwMCUnKTtcbiAgICAgICAgb2xkSXRlbS5hbmltYXRlKHsndG9wJzogJy0xMDAlJ30sIDMwMCk7XG4gICAgICAgIG5ld0l0ZW0uYW5pbWF0ZSh7J3RvcCc6ICcwJ30sIDMwMCk7XG5cbiAgICB9O1xuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG5cbiAgICAgICAgbmV3SXRlbS5jc3MoJ3RvcCcsICctMTAwJScpO1xuICAgICAgICBvbGRJdGVtLmFuaW1hdGUoeyd0b3AnOiAnMTAwJSd9LCAzMDApO1xuICAgICAgICBuZXdJdGVtLmFuaW1hdGUoeyd0b3AnOiAnMCd9LCAzMDApO1xuICAgICAgXG4gICAgfTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDQsdC+0LvRjNGI0L7QuSDRgdC70LDQudC00LXRgFxuICAvLyBpbmRleFRvSGlkZSAtINGB0LvQsNC50LQsINC60L7RgtC+0YDRi9C5INC90YPQttC90L4g0YHQutGA0YvRgtGMXG4gIC8vIGluZGV4VG9TaG93IC0g0YHQu9Cw0LnQtCwg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDQv9C+0LrQsNC30LDRgtGMXG4gIC8vIGl0ZW1zIC0g0LLRgdC1INGB0LvQsNC50LTRi1xuICBmdW5jdGlvbiBfZGlzcGxheVNsaWRlKGluZGV4VG9IaWRlLCBpbmRleFRvU2hvdywgaXRlbXMpIHtcblxuICAgIHZhciBcbiAgICAgIGl0ZW1Ub0hpZGUgPSBpdGVtcy5lcShpbmRleFRvSGlkZSksXG4gICAgICBpdGVtVG9TaG93ID0gaXRlbXMuZXEoaW5kZXhUb1Nob3cpO1xuXG4gICAgaXRlbVRvSGlkZS5yZW1vdmVDbGFzcygnc2xpZGVyX19pdGVtLS1hY3RpdmUnKTtcbiAgICBpdGVtVG9IaWRlLmFuaW1hdGUoeydvcGFjaXR5JzogJzAnfSwgMTUwKTtcblxuICAgIGl0ZW1Ub1Nob3cuYWRkQ2xhc3MoJ3NsaWRlcl9faXRlbS0tYWN0aXZlJyk7XG4gICAgaXRlbVRvU2hvdy5kZWxheSgxNTApLmFuaW1hdGUoeydvcGFjaXR5JzogJzEnfSwgMTUwKTtcbiAgfTtcblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINCw0L3QuNC80LjRgNGD0LXRgiDRgdC70LDQudC00LXRgCDRgSDQuNC90YTQvtGA0LzQsNGG0LjQtdC5XG4gIC8vIGluZGV4VG9IaWRlIC0g0YHQu9Cw0LnQtCwg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDRgdC60YDRi9GC0YxcbiAgLy8gaW5kZXhUb1Nob3cgLSDRgdC70LDQudC0LCDQutC+0YLQvtGA0YvQuSDQvdGD0LbQvdC+INC/0L7QutCw0LfQsNGC0YxcbiAgLy8gaW5mb0l0ZW1zIC0g0LLRgdC1INGB0LvQsNC50LTRiyDRgSDQuNC90YTQvtGA0LzQsNGG0LjQtdC5XG4gIGZ1bmN0aW9uIF9kaXNwbGF5SW5mbyhpbmRleFRvSGlkZSwgaW5kZXhUb1Nob3csIGluZm9JdGVtcykge1xuICAgIGluZm9JdGVtcy5lcShpbmRleFRvSGlkZSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICBpbmZvSXRlbXMuZXEoaW5kZXhUb1Nob3cpLmNzcygnZGlzcGxheScsICdpbmxpbmUtYmxvY2snKTtcbiAgfVxuXG5cblxuXG4gIC8vINGE0YPQvdC60YbQuNGPINC+0L/QtdGA0LXQtNC10LvRj9C10YIsINC/0L4g0LrQsNC60L7QvNGDINC60L7QvdGC0YDQvtC70YMg0LzRiyDQutC70LjQutC90YPQu9C4INC4INCy0YvQt9GL0LLQsNC10YIg0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQuNC1OlxuICAvLyBfZGlzcGxheUluZm8sINGH0YLQvtCx0Ysg0L/QvtC60LDQt9Cw0YLRjCDQvdGD0LbQvdGD0Y4g0LjQvdGE0L7RgNC80LDRhtC40Y5cbiAgLy8gX2Rpc3BsYXlTbGlkZS4sINGH0YLQvtCx0Ysg0L/QvtC60LDQt9Cw0YLRjCDQvdGD0LbQvdGL0Lkg0YHQu9Cw0LnQtFxuICAvLyBfbW92ZVNtYWxsU2xpZGVyLCDRh9GC0L7QsdGLINC/0YDQvtCw0L3QuNC80LjRgNC+0LLQsNGC0YwgcHJldiBjb250cm9sIFxuICAvLyBfbW92ZVNtYWxsU2xpZGVyLCDRh9GC0L7QsdGLINC/0YDQvtCw0L3QuNC80LjRgNC+0LLQsNGC0YwgbmV4dCBjb250cm9sIFxuICBmdW5jdGlvbiBfbW92ZVNsaWRlciAoZSkge1xuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhclxuICAgICAgICAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgIGNvbnRhaW5lciA9ICR0aGlzLmNsb3Nlc3QoJy5zbGlkZXInKSxcbiAgICAgICAgaXRlbXMgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbScpLFxuICAgICAgICBpbmZvSXRlbXMgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbS1pbmZvJyksXG4gICAgICAgIG1heEluZGV4ID0gaXRlbXMubGVuZ3RoIC0gMSxcbiAgICAgICAgcHJldkNvbnRyb2wgPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9fY29udHJvbC0tcHJldicpLFxuICAgICAgICBuZXh0Q29udHJvbCA9IGNvbnRhaW5lci5maW5kKCcuc2xpZGVyX19jb250cm9sLS1uZXh0JyksXG4gICAgICAgIGFjdGl2ZUl0ZW0gPSBjb250YWluZXIuZmluZCgnLnNsaWRlcl9faXRlbS0tYWN0aXZlJyksXG4gICAgICAgIGFjdGl2ZUluZGV4ID0gaXRlbXMuaW5kZXgoYWN0aXZlSXRlbSksXG4gICAgICAgIHByZXZJbmRleCA9IF9pbmRleERlYyhhY3RpdmVJbmRleCwgbWF4SW5kZXgpLFxuICAgICAgICBuZXh0SW5kZXggPSBfaW5kZXhJbmMoYWN0aXZlSW5kZXgsIG1heEluZGV4KTtcblxuICAgICAgLy8g0L/QvtC60LDQt9Cw0YLRjCDQv9GA0LXQtNGL0LTRg9GJ0LjQuSDRgdC70LDQudC0XG4gICAgICBpZiAoICR0aGlzLmhhc0NsYXNzKCdzbGlkZXJfX2NvbnRyb2wtLXByZXYnKSApIHtcblxuICAgICAgICB2YXIgcHJldkluZGV4RGVjID0gX2luZGV4RGVjKHByZXZJbmRleCwgbWF4SW5kZXgpO1xuICAgICAgICB2YXIgbmV4dEluZGV4RGVjID0gX2luZGV4RGVjKG5leHRJbmRleCwgbWF4SW5kZXgpO1xuXG4gICAgICAgIF9kaXNwbGF5U2xpZGUoYWN0aXZlSW5kZXgsIHByZXZJbmRleCwgaXRlbXMpO1xuICAgICAgICBfZGlzcGxheUluZm8oYWN0aXZlSW5kZXgsIHByZXZJbmRleCwgaW5mb0l0ZW1zKTtcblxuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCd1cCcsIHByZXZDb250cm9sLCBwcmV2SW5kZXhEZWMpO1xuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCdkb3duJywgbmV4dENvbnRyb2wsIG5leHRJbmRleERlYyk7XG5cbiAgICAgIH07XG5cblxuICAgICAgLy8g0L/QvtC60LDQt9Cw0YLRjCDRgdC70LXQtNGD0Y7RidC40Lkg0YHQu9Cw0LnQtFxuICAgICAgaWYgKCAkdGhpcy5oYXNDbGFzcygnc2xpZGVyX19jb250cm9sLS1uZXh0JykgKSB7XG5cbiAgICAgICAgdmFyIHByZXZJbmRleEluYyA9IF9pbmRleEluYyhwcmV2SW5kZXgsIG1heEluZGV4KTtcbiAgICAgICAgdmFyIG5leHRJbmRleEluYyA9IF9pbmRleEluYyhuZXh0SW5kZXgsIG1heEluZGV4KTtcbiAgICAgICAgXG4gICAgICAgIF9kaXNwbGF5U2xpZGUoYWN0aXZlSW5kZXgsIG5leHRJbmRleCwgaXRlbXMpO1xuICAgICAgICBfZGlzcGxheUluZm8oYWN0aXZlSW5kZXgsIG5leHRJbmRleCwgaW5mb0l0ZW1zKTtcblxuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCd1cCcsIHByZXZDb250cm9sLCBwcmV2SW5kZXhJbmMpO1xuICAgICAgICBfbW92ZVNtYWxsU2xpZGVyKCdkb3duJywgbmV4dENvbnRyb2wsIG5leHRJbmRleEluYyk7XG5cbiAgICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBwcmVsb2FkZXIuaW5pdCgpO1xuICBtb2RhbC5pbml0KCk7XG4gIGhhbWJ1cmdlck1lbnUuaW5pdCgpO1xuICBzY3JvbGxCdXR0b25zLmluaXQoKTtcblxuXG5cbiAgLy8g0L3QsCDRgdGC0YDQsNC90LjRhtC1IGluZGV4XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9pbmRleC5odG1sJyB8fCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy8nKSB7XG5cbiAgICBwYXJhbGxheC5pbml0KCk7XG4gICAgbG9naW5Gb3JtLmluaXQoKTtcbiAgICBmbGlwQ2FyZC5pbml0KCk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSBibG9nXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9ibG9nLmh0bWwnKSB7XG5cbiAgICAvLyDQnNC+0LTRg9C70YwgYmxvZ01lbnUg0LTQvtC70LbQtdC9INCx0YvRgtGMINC40L3QuNGG0LjQsNC70LjQt9C40YDQvtCy0LDQvSDQv9C+0YHQu9C1INC+0YLRgNC40YHQvtCy0LrQuCDQstGB0LXRhSDRjdC70LXQvNC10L3RgtC+0LIsXG4gICAgLy8g0LTQu9GPINGH0LXQs9C+INC70L7Qs9C40YfQvdC+INCx0YvQu9C+INCx0Ysg0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMIGRvY3VtZW50LnJlYWR5XG4gICAgLy8g0J3QviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjQtSBkb2N1bWVudC5yZWFkeSDRgtGD0YIg0L3QtdCy0L7Qt9C80L7QttC90L4g0LjQty3Qt9CwINC/0YDQtdC70L7QsNC00LXRgNCwLCBcbiAgICAvLyDRgtCw0Log0LrQsNC6INC00LvRjyDQv9GA0LDQstC40LvRjNC90L7QuSDRgNCw0LHQvtGC0Ysg0L/RgNC10LvQvtCw0LTQtdGA0LAg0YMg0LLRgdC10YUg0Y3Qu9C10LzQtdC90YLQvtCyINGB0L3QsNGH0LDQu9CwINGB0YLQvtC40YIgZGlzcGxheTogbm9uZS5cbiAgICAvLyDQuNC3LdC30LAg0Y3RgtC+0LPQviBkb2N1bWVudC5yZWFkeSDRgdGA0LDQsdCw0YLRi9Cy0LDQtdGCINGB0LvQuNGI0LrQvtC8INGA0LDQvdC+LCDQutC+0LPQtNCwINC+0YLRgNC40YHQvtCy0LDQvSDRgtC+0LvRjNC60L4g0L/RgNC10LvQvtCw0LTQtdGALlxuICAgIC8vIFxuICAgIC8vINC/0L7RjdGC0L7QvNGDINC/0YDQuNGI0LvQvtGB0Ywg0YHQvtC30LTQsNGC0YwgRGVmZXJyZWQg0L7QsdGK0LXQutGCINCyINC80L7QtNGD0LvQtSBwcmVsb2FkZXI6IHByZWxvYWRlci5jb250ZW50UmVhZHlcbiAgICAvLyBwcmVsb2FkZXIuY29udGVudFJlYWR5INC/0L7Qu9GD0YfQsNC10YIg0LzQtdGC0L7QtCAucmVzb2x2ZSgpINGC0L7Qu9GM0LrQviDQv9C+0YHQu9C1INGC0L7Qs9C+LCDQutCw0Log0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0L/QvtC70YPRh9Cw0Y7RgiBkaXNwbGF5OiBibG9ja1xuICAgIC8vINCh0L7QvtGC0LLQtdGC0YHRgtCy0LXQvdC90L4sINC40L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPIGJsb2dNZW51INC/0YDQvtC40YHRhdC+0LTQuNGCINC/0L7RgdC70LUg0L/QvtC70YPRh9C10L3QuNGPIGRpc3BsYXk6IGJsb2NrINC4INC+0YLRgNC40YHQvtCy0LrQuCDQstGB0LXRhSDRjdC70LXQvNC10L3RgtC+0LJcblxuICAgIHByZWxvYWRlci5jb250ZW50UmVhZHkuZG9uZShmdW5jdGlvbigpIHsgXG4gICAgICBzY3JvbGxzcHkuaW5pdCgpO1xuICAgICAgYmxvZ01lbnVQYW5lbC5pbml0KCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSB3b3Jrc1xuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvd29ya3MuaHRtbCcpIHtcblxuICAgIGJsdXIuaW5pdCgpO1xuICAgIHNsaWRlci5pbml0KCk7XG4gICAgc2xpZGVyVGl0bGVzQW5pbWF0aW9uLmluaXQoKTtcbiAgICBjb250YWN0Rm9ybS5pbml0KCk7XG4gIH1cblxuXG4gIC8vINC90LAg0YHRgtGA0LDQvdC40YbQtSBhYm91dFxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvYWJvdXQuaHRtbCcpIHtcbiAgICBza2lsbHNBbmltYXRpb24uaW5pdCgpO1xuICB9XG5cblxuICAvLyDQvdCwINGB0YLRgNCw0L3QuNGG0LUgYWRtaW5cbiAgaWYgKCQoJyNhZGQtYmxvZy1idG4nKS5sZW5ndGgpIHtcbiAgICBhZGRCbG9nRm9ybS5pbml0KCcjYWRkLWJsb2ctYnRuJyk7XG4gIH1cblxuXG5cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
