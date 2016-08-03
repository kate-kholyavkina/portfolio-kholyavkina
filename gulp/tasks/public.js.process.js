'use strict';

module.exports = function() {
  $.gulp.task('public.js.process', function() {
    return $.gulp.src($.path.app)
      .pipe($.gp.sourcemaps.init({identityMap: true}))
      .pipe($.gp.concat('app.js'))
      .pipe($.gp.sourcemaps.write())
      .pipe($.gulp.dest($.config.root + '/public/assets/js'))
  })
};
