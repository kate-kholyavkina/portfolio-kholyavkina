var slider = (function () {

  function init () {
    _setUpListners();
  };




  function _setUpListners () {
    $('.slider__control').on('click', _moveSlider);
  };


  function _indexDec(activeIndex, total) {
      var prevIndex = (activeIndex <=   0  ) ? total : activeIndex - 1;
      return prevIndex;
  };

  function _indexInc(activeIndex, total) {
      var nextIndex = (activeIndex >= total) ?   0   : activeIndex + 1;
      return nextIndex;
  };


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


  function _displaySlide(indexToHide, indexToShow, items) {

    var 
      itemToHide = items.eq(indexToHide),
      itemToShow = items.eq(indexToShow);

    itemToHide.removeClass('slider__item--active');
    itemToHide.animate({'opacity': '0'}, 150);

    itemToShow.addClass('slider__item--active');
    itemToShow.delay(150).animate({'opacity': '1'}, 150);
  };


  function _displayInfo(indexToHide, indexToShow, infoItems) {
    infoItems.eq(indexToHide).css('display', 'none');
    infoItems.eq(indexToShow).css('display', 'inline-block');
  }

  function _moveSlider (e) {

      e.preventDefault();

      var
        $this = $(this),
        container = $this.closest('.slider'),
        items = container.find('.slider__item'),
        infoItems = container.find('.slider__item-info'),
        total = items.length - 1,
        prevControl = container.find('.slider__control--prev'),
        nextControl = container.find('.slider__control--next'),
        activeItem = container.find('.slider__item--active'),
        activeIndex = items.index(activeItem),
        prevIndex = _indexDec(activeIndex, total),
        nextIndex = _indexInc(activeIndex, total);


      if ( $this.hasClass('slider__control--prev') ) {

        var prevIndexDec = _indexDec(prevIndex, total);
        var nextIndexDec = _indexDec(nextIndex, total);

        _displaySlide(activeIndex, prevIndex, items);
        _displayInfo(activeIndex, prevIndex, infoItems);

        _moveSmallSlider('up', prevControl, prevIndexDec);
        _moveSmallSlider('down', nextControl, nextIndexDec);

      };


      if ( $this.hasClass('slider__control--next') ) {

        var prevIndexInc = _indexInc(prevIndex, total);
        var nextIndexInc = _indexInc(nextIndex, total);
        
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

slider.init();




// (function(){

//     function indexDec(activeIndex, total) {
//         var prevIndex = (activeIndex <=   0  ) ? total : activeIndex - 1;
//         return prevIndex;
//     };

//     function indexInc(activeIndex, total) {
//         var nextIndex = (activeIndex >= total) ?   0   : activeIndex + 1;
//         return nextIndex;
//     };


//     function moveSlider(direction, control, newIndex) {
//       var 
//         items = control.find('.control__item'),
//         oldItem = control.find('.control__item--active'),
//         newItem = items.eq(newIndex);



//         oldItem.removeClass('control__item--active');
//         newItem.addClass('control__item--active');


//       if (direction == 'up') {

//           newItem.css('top', '100%');
//           oldItem.animate({'top': '-100%'}, 300);
//           newItem.animate({'top': '0'}, 300);

//       };
//       if (direction == 'down') {

//           newItem.css('top', '-100%');
//           oldItem.animate({'top': '100%'}, 300);
//           newItem.animate({'top': '0'}, 300);
        
//       };
//     };


//     function displaySlide(indexToHide, indexToShow, items) {

//       var 
//         itemToHide = items.eq(indexToHide),
//         itemToShow = items.eq(indexToShow);

//       itemToHide.removeClass('slider__item--active');
//       itemToHide.animate({'opacity': '0'}, 150);

//       itemToShow.addClass('slider__item--active');
//       itemToShow.delay(150).animate({'opacity': '1'}, 150);
//     };


//     function displayInfo(indexToHide, indexToShow, infoItems) {
//       infoItems.eq(indexToHide).css('display', 'none');
//       infoItems.eq(indexToShow).css('display', 'inline-block');
//     }



//     $('.slider__control').on('click', function(e){

//       e.preventDefault();

//       var
//         $this = $(this),
//         container = $this.closest('.slider'),
//         items = container.find('.slider__item'),
//         infoItems = container.find('.slider__item-info'),
//         total = items.length - 1,
//         prevControl = container.find('.slider__control--prev'),
//         nextControl = container.find('.slider__control--next'),
//         activeItem = container.find('.slider__item--active'),
//         activeIndex = items.index(activeItem),
//         prevIndex = indexDec(activeIndex, total),
//         nextIndex = indexInc(activeIndex, total);


//       if ( $this.hasClass('slider__control--prev') ) {

//         var prevIndexDec = indexDec(prevIndex, total);
//         var nextIndexDec = indexDec(nextIndex, total);

//         displaySlide(activeIndex, prevIndex, items);
//         displayInfo(activeIndex, prevIndex, infoItems);

//         moveSlider('up', prevControl, prevIndexDec);
//         moveSlider('down', nextControl, nextIndexDec);

//       };


//       if ( $this.hasClass('slider__control--next') ) {

//         var prevIndexInc = indexInc(prevIndex, total);
//         var nextIndexInc = indexInc(nextIndex, total);
        
//         displaySlide(activeIndex, nextIndex, items);
//         displayInfo(activeIndex, nextIndex, infoItems);

//         moveSlider('up', prevControl, prevIndexInc);
//         moveSlider('down', nextControl, nextIndexInc);

//       };

//     });
 

// });
