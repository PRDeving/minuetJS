(function(context, factory) {
  "use strict";

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = context.document ? new factory(context, true) : function(w) {
        if (!w.document) {
          throw new Error( "minuetJS requires a window with a document" );
        }
        return new factory(w);
      };
  } else {
    context.minuet = new factory(context);
  }
})(window || this, function(context, noDOM) {

  var http = new function() {
    var getXHRConfig = function(conf) {
      var def = {
        url: false,
        method: 'GET',
        cache: true,
        responseType: 'json'
      }

      if (typeof conf == "string") {
        def.url = conf;
      } else {
        for (k in conf) def[k] = conf[k];
      }

      return def;
    };

    var ajax = function(conf) {
      var config = getXHRConfig(conf);

      return new Promise(function(resolve, reject) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function (e) {
          if (e.target && e.target.status === 200) {
            resolve(e.target.response, e);
            if (config.success) config.success(e.target.response, e);
          } else {
            reject(e.target, e);
            if (config.error) config.error(e.target, e);
          }
        };
        oReq.open(config.method, config.url + (!config.cache ? ('?' + new Date().getTime()) : ''), true);
        oReq.responseType = config.responseType;
        oReq.send();
      });
    }
    this.ajax = ajax;
  };

  var _modules = {};
  var define = function(name, cb) {
    if (_modules[name])
      throw new Error( 'Theres already a module defined as:', name);
    _modules[name] = cb;
  }

  var _requireModule = function(n) {
    if (!_modules[n])
      throw new Error('Theres no said module:', n);
    return _modules[n]();
  }

  var require = function(deps, fn) {
    var cb = arguments.length > 1 ? arguments[arguments.length - 1] : false;
    var d = [];
    for (var i in deps)
      d.push(_requireModule(deps[i]));
    return cb ? cb.apply(this, d) : (d.length === 1 ? d[0] : d);
  }

  this.http = http;
  this.define = define;
  this.require = require;
});
