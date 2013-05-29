
/**
 * Module dependencies.
 */

var transform = require('transform-property');
var has3d = require('has-translate3d');
var style = require('computed-style');
var Emitter = require('emitter');
var events = require('events');
var min = Math.min;
var max = Math.max;

/**
 * Expose `Swipe`.
 */

module.exports = Swipe;

/**
 * Turn `el` into a swipeable list.
 *
 * @param {Element} el
 * @api public
 */

function Swipe(el) {
  if (!(this instanceof Swipe)) return new Swipe(el);
  if (!el) throw new TypeError('Swipe() requires an element');
  this.child = el.children[0];
  this.current = 0;
  this.el = el;
  this.refresh();
  this.interval(5000);
  this.duration(300);
  this.show(0, 0, { silent: true });
  this.bind();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Swipe.prototype);

/**
 * Refresh sizing data.
 *
 * @api public
 */

Swipe.prototype.refresh = function(){
  var children = this.children();
  var visible = children.visible.length;
  var prev = this.visible || visible;

  var i = indexOf(children.visible, this.currentEl);

  // we removed/added item(s), update current
  if (visible < prev && i <= this.current && i >= 0) {
    this.current -= this.current - i;
  } else if (visible > prev && i > this.current) {
    this.current += i - this.current;
  }

  this.visible = visible;
  this.childWidth = this.el.getBoundingClientRect().width;
  this.width = Math.ceil(this.childWidth * visible);
  this.child.style.width = this.width + 'px';
  this.child.style.height = this.height + 'px';
};

/**
 * Bind event handlers.
 *
 * @api public
 */

Swipe.prototype.bind = function(){
  this.events = events(this.child, this);
  this.events.bind('mousedown', 'ontouchstart');
  this.events.bind('mousemove', 'ontouchmove');
  this.events.bind('touchstart');
  this.events.bind('touchmove');

  this.docEvents = events(document, this);
  this.docEvents.bind('mouseup', 'ontouchend');
  this.docEvents.bind('touchend');
};

/**
 * Unbind event handlers.
 *
 * @api public
 */

Swipe.prototype.unbind = function(){
  this.events.unbind();
  this.docEvents.unbind();
};

/**
 * Handle touchstart.
 *
 * @api private
 */

Swipe.prototype.ontouchstart = function(e){
  e.stopPropagation();
  if (e.touches) e = e.touches[0];

  this.transitionDuration(0);
  this.dx = 0;
  this.lock = false;
  this.ignore = false;

  this.down = {
    x: e.pageX,
    y: e.pageY,
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

Swipe.prototype.ontouchmove = function(e){
  if (!this.down || this.ignore) return;
  if (e.touches && e.touches.length > 1) return;
  if (e.touches) {
    var ev = e;
    e = e.touches[0];
  }
  var s = this.down;
  var x = e.pageX;
  var w = this.childWidth;
  var i = this.current;
  this.dx = x - s.x;

  // determine dy and the slope
  if (!this.lock) {
    this.lock = true;
    var y = e.pageY;
    var dy = y - s.y;
    var slope = dy / this.dx;

    // if is greater than 1 or -1, we're swiping up/down
    if (slope > 1 || slope < -1) {
      this.ignore = true;
      return;
    }
  }

  // when we overwrite touch event with e.touches[0], it doesn't
  // have the preventDefault method. e.preventDefault() prevents
  // multiaxis scrolling when moving from left to right
  (ev || e).preventDefault();

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

Swipe.prototype.ontouchend = function(e){
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
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.duration = function(ms){
  this._duration = ms;
  return this;
};

/**
 * Set cycle interval to `ms`.
 *
 * @param {Number} ms
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.interval = function(ms){
  this._interval = ms;
  return this;
};

/**
 * Play through all the elements.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.play = function(){
  if (this.timer) return;
  this.timer = setInterval(this.cycle.bind(this), this._interval);
  return this;
};

/**
 * Stop playing.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.stop = function(){
  clearInterval(this.timer);
  this.timer = null;
  return this;
};

/**
 * Show the next slide, when the end
 * is reached start from the beginning.
 *
 * @api public
 */

Swipe.prototype.cycle = function(){
  if (this.isLast()) {
    this.current = -1;
    this.next();
  } else {
    this.next();
  }
};

/**
 * Check if we're on the first visible slide.
 *
 * @return {Boolean}
 * @api public
 */

Swipe.prototype.isFirst = function(){
  return this.current == 0;
};

/**
 * Check if we're on the last visible slide.
 *
 * @return {Boolean}
 * @api public
 */

Swipe.prototype.isLast = function(){
  return this.currentIndex == this.visible - 1;
};

/**
 * Show the previous slide, if any.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.prev = function(){
  this.show(this.current - 1);
  return this;
};

/**
 * Show the next slide, if any.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.next = function(){
  this.show(this.current + 1);
  return this;
};

/**
 * Show slide `i`.
 *
 * Emits `show `event
 *
 * @param {Number} i
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.show = function(i, ms, options){
  options = options || {};
  if (null == ms) ms = this._duration;
  var children = this.children();
  i = max(0, min(i, children.visible.length - 1));
  this.currentIndex = i;
  this.currentEl = children.visible[i];
  this.current = indexOf(children.all, this.currentEl);
  this.transitionDuration(ms);
  this.translate(this.childWidth * i);
  if (!options.silent) this.emit('show', this.current, this.currentEl);
  return this;
};

/**
 * Return children categorized by visibility.
 *
 * @return {Object}
 * @api private
 */

Swipe.prototype.children = function(){
  var els = this.child.children;

  var ret = {
    all: els,
    visible: [],
    hidden: []
  };

  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (visible(el)) {
      ret.visible.push(el);
    } else {
      ret.hidden.push(el);
    }
  }

  return ret;
};

/**
 * Set transition duration.
 *
 * @api private
 */

Swipe.prototype.transitionDuration = function(ms){
  var s = this.child.style;
  s.webkitTransition = ms + 'ms -webkit-transform';
  s.MozTransition = ms + 'ms -moz-transform';
  s.msTransition = ms + 'ms -ms-transform';
  s.OTransition = ms + 'ms -o-transform';
  s.transition = ms + 'ms transform';
};

/**
 * Translate to `x`.
 *
 * @api private
 */

Swipe.prototype.translate = function(x){
  // TODO: use translate component
  var s = this.child.style;
  x = -x;
  if (has3d) {
    s[transform] = 'translate3d(' + x + 'px, 0, 0)';
  } else {
    s[transform] = 'translateX(' + x + 'px)';
  }
};

/**
 * Return index of `el` in `els`.
 *
 * @param {Array} els
 * @param {Element} el
 * @return {Number}
 * @api private
 */

function indexOf(els, el) {
  for (var i = 0; i < els.length; i++) {
    if (els[i] == el) return i;
  }
  return -1;
}

/**
 * Check if `el` is visible.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

function visible(el) {
  return style(el).display != 'none';
}
