'use strict';

module.exports = function() {
  $.gulp.task('watch', function() {
    $.gulp.watch('./source/js/**/*.js', $.gulp.series('js.process', 'public.js.process'));
    $.gulp.watch('./source/style/**/*.scss', $.gulp.series('sass', 'public.sass'));
    $.gulp.watch('./source/template/**/*.jade', $.gulp.series('jade', 'public.copy.jade'));
    $.gulp.watch('./source/images/**/*.*', $.gulp.series('copy.image', 'public.copy.image'));
    $.gulp.watch('./source/fonts/**/*.*', $.gulp.series('copy.fonts', 'public.copy.fonts'));
    $.gulp.watch('./source/php/**/*.*', $.gulp.series('copy.php'));
  });
};
