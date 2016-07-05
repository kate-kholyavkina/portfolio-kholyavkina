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