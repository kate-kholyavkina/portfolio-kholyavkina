'use strict';

module.exports = function() {
  $.gulp.task('public.copy.image', function() {
    return $.gulp.src('./source/images/**/*.*', { since: $.gulp.lastRun('public.copy.image') })
      .pipe($.gulp.dest($.config.root + '/public/assets/img'));
  });
};
