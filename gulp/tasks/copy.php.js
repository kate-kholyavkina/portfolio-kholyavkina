'use strict';

module.exports = function() {
  $.gulp.task('copy.php', function() {
    return $.gulp.src('./source/php/**/*.*')
      .pipe($.gulp.dest($.config.root + '/assets/php'));
  });
};
