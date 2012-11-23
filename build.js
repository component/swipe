/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-event/index.js", function(module, exports, require){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
};
});
require.register("carousel/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var event = require('event');

/**
 * Expose `Carousel`.
 */

module.exports = Carousel;

/**
 * Turn `el` into a carousel.
 *
 * @param {Element} el
 * @api public
 */

function Carousel(el) {
  if (!(this instanceof Carousel)) return new Carousel(el);
  if (!el) throw new TypeError('swipe() requires an element');
  this.el = el;
  this.child = el.children[0];
  this.total = this.child.children.length;
  this.childWidth = el.getBoundingClientRect().width;
  this.width = this.childWidth * this.total | 0;
  this.child.style.width = this.width + 'px';
  this.child.style.height = this.height + 'px';
  this.interval(5000);
  this.duration(300);
  this.show(0, 0);
  this.bind();
  // TODO: Swipeable() mixin
}

/**
 * Bind event handlers.
 *
 * @api public
 */

Carousel.prototype.bind = function(){
  // TODO: create a bulk event management component.. this is nasty
  event.bind(this.child, 'mousedown', this.ontouchstart.bind(this));
  event.bind(this.child, 'mousemove', this.ontouchmove.bind(this));
  event.bind(document, 'mouseup', this.ontouchend.bind(this));
  event.bind(this.child, 'touchstart', this.ontouchstart.bind(this));
  event.bind(this.child, 'touchmove', this.ontouchmove.bind(this));
  event.bind(document, 'touchend', this.ontouchend.bind(this));
};

/**
 * Unbind event handlers.
 *
 * @api public
 */

Carousel.prototype.unbind = function(){
  // TODO: me
};

/**
 * Handle touchstart.
 *
 * @api private
 */

Carousel.prototype.ontouchstart = function(e){
  e.stopPropagation();
  if (e.touches) e = e.touches[0];

  this.transitionDuration(0);
  this.dx = 0;

  this.down = {
    x: e.pageX,
    at: new Date
  };
};

/**
 * Handle touchmove.
 *
 * For the first and last slides
 * we apply some resistence to help
 * indicate that you're at the edges.
 *
 * @api private
 */

Carousel.prototype.ontouchmove = function(e){
  if (!this.down) return;
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();
  if (e.touches) e = e.touches[0];
  var s = this.down;
  var x = e.pageX;
  var w = this.childWidth;
  var i = this.current;
  this.dx = x - s.x;
  var dir = this.dx < 0 ? 1 : 0;
  if (this.isFirst() && 0 == dir) this.dx /= 2;
  if (this.isLast() && 1 == dir) this.dx /= 2;
  this.translate((i * w) + -this.dx);
};

/**
 * Handle touchend.
 *
 * @api private
 */

Carousel.prototype.ontouchend = function(e){
  if (!this.down) return;
  e.stopPropagation();

  // touches
  if (e.changedTouches) e = e.changedTouches[0];

  // setup
  var dx = this.dx;
  var x = e.pageX;
  var w = this.childWidth;

  // < 200ms swipe
  var ms = new Date - this.down.at;
  var threshold = ms < 200 ? w / 10 : w / 2;
  var dir = dx < 0 ? 1 : 0;
  var half = Math.abs(dx) >= threshold;

  // clear
  this.down = null;

  // first -> next
  if (this.isFirst() && 1 == dir && half) return this.next();

  // first -> first
  if (this.isFirst()) return this.prev();

  // last -> last
  if (this.isLast() && 1 == dir) return this.next();

  // last -> prev
  if (this.isLast()) return this.prev();

  // N -> N + 1
  if (1 == dir && half) return this.next();

  // N -> N - 1
  if (0 == dir && half) return this.prev();

  // N -> N
  this.show(this.current);
};

/**
 * Set transition duration to `ms`.
 *
 * @param {Number} ms
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.duration = function(ms){
  this._duration = ms;
  return this;
};

/**
 * Set cycle interval to `ms`.
 *
 * @param {Number} ms
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.interval = function(ms){
  this._interval = ms;
  return this;
};

/**
 * Play through all the elements.
 *
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.play = function(){
  if (this.timer) return;
  this.timer = setInterval(this.cycle.bind(this), this._interval);
  return this;
};

/**
 * Stop playing.
 *
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.stop = function(){
  clearInterval(this.timer);
  return this;
};

/**
 * Show the next slide, when the end
 * is reached start from the beginning.
 *
 * @api public
 */

Carousel.prototype.cycle = function(){
  if (this.isLast()) {
    this.current = -1;
    this.next();
  } else {
    this.next();
  }
};

/**
 * Check if we're on the first slide.
 *
 * @return {Boolean}
 * @api public
 */

Carousel.prototype.isFirst = function(){
  return this.current == 0;
};

/**
 * Check if we're on the last slide.
 *
 * @return {Boolean}
 * @api public
 */

Carousel.prototype.isLast = function(){
  return this.current == this.total - 1;
};

/**
 * Show the previous slide, if any.
 *
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.prev = function(){
  this.show(this.current - 1);
  return this;
};

/**
 * Show the next slide, if any.
 *
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.next = function(){
  this.show(this.current + 1);
  return this;
};

/**
 * Show slide `i`.
 *
 * @param {Number} i
 * @return {Carousel} self
 * @api public
 */

Carousel.prototype.show = function(i, ms){
  if (null == ms) ms = this._duration;
  i = Math.max(0, Math.min(i, this.total - 1));
  var x = this.childWidth * i;
  this.current = i;
  this.transitionDuration(ms);
  this.translate(x);
  return this;
};

/**
 * Set transition duration.
 *
 * @api private
 */

Carousel.prototype.transitionDuration = function(ms){
  var s = this.child.style;
  s.webkitTransitionDuration =
  s.MozTransitionDuration =
  s.msTransitionDuration =
  s.OTransitionDuration =
  s.transitionDuration = ms + 'ms';
};

/**
 * Translate to `x`.
 *
 * @api private
 */

Carousel.prototype.translate = function(x){
  var s = this.child.style;
  x = -x;
  s.webkitTransform = s.MozTransform = 'translate3d(' + x + 'px, 0, 0)';
  s.msTransform = s.OTransform = 'translateX(' + x + 'px)';
};


});
require.alias("component-event/index.js", "carousel/deps/event/index.js");
