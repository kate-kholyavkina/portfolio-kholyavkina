'use strict';

module.exports = function() {
  $.gulp.task('public.js.foundation', function() {
    return $.gulp.src($.path.jsFoundation)
      .pipe($.gp.concat('foundation.js'))
      .pipe($.gulp.dest($.config.public + '/assets/js'))
  })
};
