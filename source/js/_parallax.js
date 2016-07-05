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

