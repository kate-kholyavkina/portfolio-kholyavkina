'use strict';

module.exports = function() {
  $.gulp.task('public.css.foundation', function() {
    return $.gulp.src($.path.cssFoundation)
      .pipe($.gp.concatCss('foundation.css'))
      .pipe($.gp.csso())
      .pipe($.gulp.dest($.config.root + '/public/assets/css'))
  })
};
