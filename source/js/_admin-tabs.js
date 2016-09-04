var adminTabs = (function () {
  var $tabsBtns;
  var $tabsHolder;

  function init (tabsBtns, tabsHolder) {
    $tabsBtns = $(tabsBtns);
    $tabsHolder = $(tabsHolder);
    _setUpListeners();
  };

  function _setUpListeners () {
    $tabsBtns.on('click', _showTab);
  };

  
  function _showTab(e) {
    e.preventDefault();
    var $clickedBtn = $(this)
    var panelId = $clickedBtn.attr('data-link');
    var $reqTab = $tabsHolder.find('#' + panelId);


    console.log($reqTab);


    $clickedBtn.addClass('active').siblings().removeClass('active');
    $reqTab.addClass('active').siblings().removeClass('active');
  }

  return {
    init: init
  };

})();
