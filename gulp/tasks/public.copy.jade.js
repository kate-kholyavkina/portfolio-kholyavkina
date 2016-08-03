'use strict';

module.exports = function() {
  $.gulp.task('public.copy.jade', function() {
    return $.gulp.src('./source/template/**/*.*'  , { since: $.gulp.lastRun('public.copy.jade') })
      .pipe($.gulp.dest($.config.public + '/markups/_pages'));
  });
};