
# Swipe

  Swipe component with touch support, for image carousels or any other content. Try it out the [demo](http://component.github.com/swipe/) in your browser or on your device.

## Installation

    $ component install component/swipe

## Events

- `showing` (i, pane): when the transition to another pane begins
- `show` (i, pane): when the transition to another pane finishes

## API

### Swipe(el)

  Create a swipe object for `el`. This should be a container element
  that wraps a list of several items. View ./example.html for a
  working example.

### .threshold(n)

  Set the swipe threshold to `n`.

  This is the factor required for swipe
  to detect when a slide has passed the
  given threshold, and may display the next
  or previous slide. For example the default
  of `.5` means that the user must swipe _beyond_
  half of the side width.

### .fastThreshold(ms)

 Set the "fast" swipe threshold to `ms`.

 This is the amount of time in milliseconds
 which determines if a swipe was "fast" or not. When
 the swipe's duration is less than `ms` only 1/10th of
 the slide's width must be exceeded to display the previous
 or next slide.

### .duration(ms)

  Set the transition duration, defaults to 300ms.

### .interval(ms)

  Set the cycle interval, defaults to 5000ms.

### .refresh()

  This method should be invoked when the swipe element
  has been resized, or an item has been added or removed.

### .play()

  Play through all items using the cycle interval.

### .stop()

  Stop playing.

### .isFirst()

  Is on the first visible item.

### .isLast()

  Is on the last visisble item.

### .prev()

  Show the previous item if present, or do nothing.

### .next()

  Show the next item if present, or do nothing.

### .show(i, [ms], [options])

  Show item with the given index `i` with the given
  transition in `ms` defaulting to the `.duration()` value.

  You may pass `{ silent: true }` as an option to silence show events.

## License

  MIT
