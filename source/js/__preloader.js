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


