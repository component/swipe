
/**
 * Module dependencies.
 */

var transitionend = require('transitionend-property');
var transform = require('transform-property');
var touchAction = require('touchaction-property');
var has3d = require('has-translate3d');
var style = require('computed-style');
var Emitter = require('emitter');
var event = require('event');
var events = require('component-events');
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
  this.touchAction('none');
  this.currentEl = this.children().visible[0];
  this.currentVisible = 0;
  this.current = 0;
  this.el = el;
  this.refresh();
  this.interval(5000);
  this.duration(300);
  this.fastThreshold(200);
  this.threshold(0.5);
  this.show(0, 0, { silent: true });
  this.bind();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Swipe.prototype);

/**
 * Set the swipe threshold to `n`.
 *
 * This is the factor required for swipe
 * to detect when a slide has passed the
 * given threshold, and may display the next
 * or previous slide. For example the default
 * of `.5` means that the user must swipe _beyond_
 * half of the side width.
 *
 * @param {Number} n
 * @api public
 */

Swipe.prototype.threshold = function(n){
  this._threshold = n;
};

/**
 * Set the "fast" swipe threshold to `ms`.
 *
 * This is the amount of time in milliseconds
 * which determines if a swipe was "fast" or not. When
 * the swipe's duration is less than `ms` only 1/10th of
 * the slide's width must be exceeded to display the previous
 * or next slide.
 *
 * @param {Number} n
 * @api public
 */

Swipe.prototype.fastThreshold = function(ms){
  this._fastThreshold = ms;
};

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
  if (visible < prev && i <= this.currentVisible && i >= 0) {
    this.currentVisible -= this.currentVisible - i;
  } else if (visible > prev && i > this.currentVisible) {
    this.currentVisible += i - this.currentVisible;
  }

  this.visible = visible;
  this.childWidth = this.el.getBoundingClientRect().width;
  this.width = Math.ceil(this.childWidth * visible);
  this.child.style.width = this.width + 'px';
  this.child.style.height = this.height + 'px';
  this.show(this.currentVisible, 0, { silent: true });
};

/**
 * Bind event handlers.
 *
 * @api public
 */

Swipe.prototype.bind = function(){
  this.events = events(this.child, this);
  this.docEvents = events(document, this);

  // standard mouse click events
  this.events.bind('mousedown', 'ontouchstart');
  this.events.bind('mousemove', 'ontouchmove');
  this.docEvents.bind('mouseup', 'ontouchend');

  // W3C touch events
  this.events.bind('touchstart');
  this.events.bind('touchmove');
  this.docEvents.bind('touchend');

  // MS IE touch events
  this.events.bind('PointerDown', 'ontouchstart');
  this.events.bind('PointerMove', 'ontouchmove');
  this.docEvents.bind('PointerUp', 'ontouchstart');
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
  this.transitionDuration(0);
  this.dx = 0;
  this.updown = null;

  var touch = this.getTouch(e);
  this.down = {
    x: touch.pageX,
    y: touch.pageY,
    at: new Date()
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
  if (!this.down || this.updown) return;
  var touch = this.getTouch(e);

  // TODO: ignore more than one finger
  if (!touch) return;

  var down = this.down;
  var x = touch.pageX;
  var w = this.childWidth;
  var i = this.currentVisible;
  this.dx = x - down.x;

  // determine dy and the slope
  if (null == this.updown) {
    var y = touch.pageY;
    var dy = y - down.y;
    var slope = dy / this.dx;

    // if is greater than 1 or -1, we're swiping up/down
    if (slope > 1 || slope < -1) {
      this.updown = true;
      return;
    } else {
      this.updown = false;
    }
  }

  e.preventDefault();

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
  e.stopPropagation();
  if (!this.down) return;
  var touch = this.getTouch(e);

  // setup
  var dx = this.dx;
  var x = touch.pageX;
  var w = this.childWidth;

  // < 200ms swipe
  var ms = new Date() - this.down.at;
  var threshold = ms < this._fastThreshold ? w / 10 : w * this._threshold;
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
  this.show(this.currentVisible);
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
    this.currentVisible = -1;
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
  return this.currentVisible == 0;
};

/**
 * Check if we're on the last visible slide.
 *
 * @return {Boolean}
 * @api public
 */

Swipe.prototype.isLast = function(){
  return this.currentVisible == this.visible - 1;
};

/**
 * Show the previous slide, if any.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.prev = function(){
  this.show(this.currentVisible - 1);
  return this;
};

/**
 * Show the next slide, if any.
 *
 * @return {Swipe} self
 * @api public
 */

Swipe.prototype.next = function(){
  this.show(this.currentVisible + 1);
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
  var self = this;
  var children = this.children();
  i = max(0, min(i, children.visible.length - 1));
  this.currentVisible = i;
  this.currentEl = children.visible[i];
  this.current = indexOf(children.all, this.currentEl);
  this.transitionDuration(ms);
  this.translate(this.childWidth * i);

  if (!options.silent) {
    this.emit('showing', this.current, this.currentEl);
    if (!ms) return this;
    event.bind(this.child, transitionend, function shown() {
      if (self.current == i) self.emit('show', self.current, self.currentEl);
      event.unbind(self.child, transitionend, shown);
    });
  }
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
 * TODO: use translate component
 *
 * @api private
 */

Swipe.prototype.translate = function(x){
  var s = this.child.style;
  x = -x;
  if (has3d) {
    s[transform] = 'translate3d(' + x + 'px, 0, 0)';
  } else {
    s[transform] = 'translateX(' + x + 'px)';
  }
};

/**
 * Sets the "touchAction" CSS style property to `value`.
 *
 * @api private
 */

Swipe.prototype.touchAction = function(value){
  var s = this.child.style;
  if (touchAction) {
    s[touchAction] = value;
  }
};

/**
 * Gets the appropriate "touch" object for the `e` event. The event may be from
 * a "mouse", "touch", or "Pointer" event, so the normalization happens here.
 *
 * @api private
 */

Swipe.prototype.getTouch = function(e){
  // "mouse" and "Pointer" events just use the event object itself
  var touch = e;
  if (e.changedTouches && e.changedTouches.length > 0) {
    // W3C "touch" events use the `changedTouches` array
    touch = e.changedTouches[0];
  }
  return touch;
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
