var blogMenu = (function () {


  _nav = $('.blog-nav__link');

  function init () {
    _checkArticles();
    _setUpListeners();
  };



  // прослушка событий
  function _setUpListeners() {
    $(window).on("scroll", _checkArticles);

    $(_nav).on("click", function(e){
      _showArticle($(e.target).attr('href'), true);
      console.log($(e.target).attr('href'));
    });

    $(function() {
      _showArticle(window.location.hash, false);
      console.log(window.location.hash);
    });
  }


  function _showArticle(article, isAnimate) {
    var 
      direction = article.replace('#', ''),
      reqArticle = $('.articles__item').filter('[data-article="' + direction + '"]'),
      reqArticlePos = reqArticle.offset().top;

      console.log(direction);

      if (isAnimate) {
        $('body, html').animate({
          scrollTop: reqArticlePos
        }, 500);
      } else {
        $('body, html').scrollTop(reqArticlePos);
      }
  }

  // 
  function _checkArticles() {
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

