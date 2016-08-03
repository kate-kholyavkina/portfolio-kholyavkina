'use strict';

module.exports = function() {
  $.gulp.task('public.copy.fonts', function() {
    return $.gulp.src('./source/fonts/**/*.*', { since: $.gulp.lastRun('public.copy.fonts') })
      .pipe($.gulp.dest($.config.public + '/assets/fonts'));
  });
};
