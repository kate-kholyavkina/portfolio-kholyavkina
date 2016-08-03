'use strict';

// module.exports = function() {
//   $.gulp.task('jade', function() {
//     var YOUR_LOCALS = './content.json';
//     // console.log(JSON.parse($.fs.readFileSync(YOUR_LOCALS, 'utf-8')));
//     return $.gulp.src($.path.template)
//       .pipe($.gp.jade({ 
//         locals: JSON.parse($.fs.readFileSync(YOUR_LOCALS, 'utf-8')),
//         pretty: true 
//       }))
//       .on('error', $.gp.notify.onError(function(error) {
//         return {
//           title: 'Jade',
//           message:  error.message
//         }
//        }))
//       .pipe($.gulp.dest($.config.root));
//   });
// };

module.exports = function() {
  $.gulp.task('public.copy.jade', function() {
    return $.gulp.src($.path.template)
      .pipe($.gulp.dest($.config.root + '/public/markups/_pages'));
  });
};