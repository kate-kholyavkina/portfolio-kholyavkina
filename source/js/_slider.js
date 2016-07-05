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
