/**
 * @file Pre-compile doT templates to commonJS modules.Support multiple sub-tpl.
 * @author Homkai Wang
 */
var through = require('through2');
var util = require('gulp-util');
var dot = require('dot');

const PLUGIN_NAME = 'gulp-dot2module';

function readStream(stream, done) {
    var buffer = '';
    stream.on('data', function (chunk) {
        buffer += chunk;
    }).on('end', function () {
        done(null, buffer);
    }).on('error', function (error) {
        done(error);
    });
}

function compile(contents, options){

    // 先删掉注释
    contents = contents.replace(/<!--[\w\W\r\n]*?-->/gmi, '');

    var regStart = /(<script.*?export=["'](.*?)["'].*?type=["']text\/template["'].*?>|<script.*?type=["']text\/template["'].*?export=["'](.*?)["'].*?>)/i;
    var regRepAll = /(<script.*?type=["']text\/template["'].*?>)/ig;

    function getChildId(child){
        var m = child.match(regStart);
        return m ? (m[2] || m[3]) : false;
    }

    function getChildCode(child){
        return child.replace(/^\s*<script.*?>/, '').replace(/<\/script>\s*$/, '');
    }

    var output = [];
    if(!regStart.test(contents)){
        output.push("  module.exports = " + dot.template(getChildCode(contents)).toString() + ";");
    }else{
        var input = contents.replace(regRepAll, '|###|$1').split('|###|').slice(1);
        input.forEach(function(item){
            var childId = getChildId(item);
            if(!childId) return;
            output.push('  exports.' + childId + ' = ' + dot.template(getChildCode(item)).toString() + ';');
        });
    }

    return "define(" + (options.noModuleName ? '' : "'" + options.moduleName + "', ") + "function(require, exports, module){\r\n" +
        output.join('\r\n') +
        "\r\n});";
}

module.exports = function (options) {

    options = options || {};

    var stream = through.obj(function (file, enc, callback) {
        var complete = function (error, contents) {
            if (error) {
                this.emit('error', new util.PluginError(PLUGIN_NAME, error));
            }
            try {
                options.moduleName = (options.prefix || '') + file.path.replace(/.*[\\\/](\w+)(\.\w+$|$)/, '$1');
                file.contents = new Buffer(compile(contents, options));
                this.push(file);
                return callback();
            }
            catch (exception) {
                this.emit('error', new util.PluginError(PLUGIN_NAME, exception));
            }
        }.bind(this);

        file.path = util.replaceExtension(file.path, '.js');

        if (file.isBuffer()) {
            complete(null, file.contents.toString());
        } else if (file.isStream()) {
            readStream(file.contents, complete);
        }
    });
    return stream;
};
