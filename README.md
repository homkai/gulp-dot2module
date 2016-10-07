# gulp-dot2module
Gulp plugin for pre-compile doT templates to commonJS modules.Support multiple sub-tpl.
## Example
If we have following folder structure:
src/tpl-multiple.html:
```html
<script type="text/template" export="main">
  <div>{{=it.title}}</div>
</script>
<script type="text/template" export="detail">
  <div>{{=it.title}}</div>
</script>
```
src/tpl-single.html:
```html
<div>{{=it.title}}</div>
```
Then, running this code:
```js
var dot2module = require('gulp-dot2module');
gulp.task('templates', function() {
    gulp.src('src/*.html')
    .pipe(dot2module())
    .pipe(gulp.dest('dist'));
});
```
Will produce:
dist/tpl-multiple.js:
```js
define('tpl-multiple', function(require, exports, module){
    exports.main = function ...
    exports.detail = function ...
    ...
});
```
dist/tpl-single.js:
```js
define('tpl-single', function(require, exports, module){
    module.exports = function ...
});
```
