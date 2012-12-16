
# Swipe

  Swipe component with touch support, for image carousels or any other content. Try it out the [demo](http://component.github.com/carousel/) in your browser or on your device.

## Installation

    $ component install component/swipe

## API

### Swipe(el)

  Create a swipe object for `el`. This should be a container element
  that wraps a list of several items. View ./example.html for a
  working example.

### .duration(ms)

  Set the transition duration, defaults to 300ms.

### .interval(ms)

  Set the cycle interval, defaults to 5000ms.

### .play()

  Play through all items using the cycle interval.

### .stop()

  Stop playing.

### .isFirst()

  Is on the first item.

### .isLast()

  Is on the last item.

### .prev()

  Show the previous item if present, or do nothing.

### .next()

  Show the next item if present, or do nothing.

### .show(i, [ms])

  Show item with the given index `i` with the given
  transition in `ms` defaulting to the `.duration()` value.

## License

  MIT
