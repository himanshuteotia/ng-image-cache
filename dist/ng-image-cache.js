(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var DEFAULT_BASE_64_DATA = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * @ngInject()
 */
function imageDirective(ImageCache) {
  return {
    link: link,
    restrict: 'E',
    replace: true,
    template: '<img title="ngImageCache" />'
  };

  function link(scope, element, attributes) {
    element.attr('src', DEFAULT_BASE_64_DATA);

    ImageCache
      .get(attributes.src)
      .then(function onGetImageData(base64) {
        element.attr('src', base64);
      })
    ;
  }
}
imageDirective.$inject = ["ImageCache"];

module.exports = imageDirective;

},{}],2:[function(require,module,exports){
'use strict';

angular
  .module('ngImageCache', [
    'ng'
  ])

  .factory('ImageCache', require('./services/cache'))
  .factory('ImageData', require('./services/data'))
  .factory('ImageLoader', require('./services/loader'))

  .directive('uiImage', require('./directives/image'))
;

},{"./directives/image":1,"./services/cache":3,"./services/data":4,"./services/loader":5}],3:[function(require,module,exports){
'use strict';

var cache = sessionStorage;

/**
 * @ngInject()
 */
function ImageCacheFactory($q, ImageData) {
  return {
    get: get
  };

  function get(uri) {
    return $q(function async(resolve) {
      if (cached(uri)) {
        resolve(cache[uri]);
      } else {
        ImageData.get(uri).then(function onGetData(data) {
          cache[uri] = data;
          resolve(data);
        }, function onError() {
          cache[uri] = uri;
          resolve(uri);
        });
      }
    });
  }

  function cached(key) {
    return key in cache;
  }
}
ImageCacheFactory.$inject = ["$q", "ImageData"];

module.exports = ImageCacheFactory;

},{}],4:[function(require,module,exports){
'use strict';

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

/**
 * @ngInject()
 */
function ImageDataFactory($q, ImageLoader) {
  return {
    get: get
  };

  function get(uri) {
    return $q(function async(resolve, reject) {
      ImageLoader
        .load(uri)
        .then(function onLoadImage(image) {
          // Update canvas dimensions
          canvas.height = image.height;
          canvas.width = image.width;
          // Draw image
          context.drawImage(image, 0, 0);
          // Get data url
          resolve(getDataUrl());
        }, reject)
      ;
    });
  }

  function getDataUrl() {
    var data = null;
    try {
      data = canvas.toDataURL('image/png');
    } catch (e) {
      // Security exception
    }
    return data;
  }
}
ImageDataFactory.$inject = ["$q", "ImageLoader"];

module.exports = ImageDataFactory;

},{}],5:[function(require,module,exports){
'use strict';

/**
 * @ngInject()
 */
function ImageLoaderFactory($q) {
  return {
    load: load
  };

  function load(uri) {
    return $q(function async(resolve, reject) {
      var image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = uri;
      image.addEventListener('load', onLoad);
      image.addEventListener('error', onError);
      function onLoad(event) {
        resolve(image, event);
      }
      function onError(error) {
        reject(error);
      }
    });
  }
}
ImageLoaderFactory.$inject = ["$q"];

module.exports = ImageLoaderFactory;

},{}]},{},[2]);