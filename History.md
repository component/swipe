
1.7.7 / 2015-04-15
==================

 * index: fix require of component/events

1.7.6 / 2015-03-16
==================

  * package: update all deps and fix browserify build
  * package: remove "development" field
  * package: remove "repo" field
  * component: update "emitter" to v1.2.0

1.7.5 / 2014-09-27
==================

  * component: update dependencies (#28)

1.7.4 / 2013-11-15
==================

  * Revert "use component/indexof"

1.7.3 / 2013-11-13
==================

  * package: use GitHub tarball URL for indexof component

1.7.2 / 2013-11-13
==================

  * Add touch support for IE (@tootallnate)
  * use component/indexof (@tootallnate)

1.7.1 / 2013-07-31
==================

  * fixed jumpiness when scrolling and quickly stopping scroll

1.7.0 / 2013-07-11
==================

  * replace `show` event with `showing`, wait till transitionend to emit `show`

1.6.0 / 2013-06-19
==================

  * add Swipe#fastThreshold(ms)
  * add Swipe#threshold(n)

1.5.4 / 2013-06-01
==================

  * index: fix `silent` value passed

1.5.3 / 2013-06-01
==================

  * index: make `refresh` not emit events

1.5.2 / 2013-05-31
==================

  * fix show on .refresh() regression
  * fix support for hidden slides
  * fix .isFirst(), should be visible only
  * change currentIndex -> currentVisibleIndex

1.5.1 / 2013-05-29
==================

  * fix .current relative to all elements and a few other subtle bugs

1.5.0 / 2013-05-28
==================

  * swipe is now display:none aware [MatthewMueller]

1.4.2 / 2013-05-27
==================

  * pin deps

1.4.1 / 2013-05-03
==================

  * remove .add()
  * remove .remove()
  * change .refresh() to detect dom changes

1.4.0 / 2013-05-02
==================

  * add `.add(el, i)`
  * add `.remove(i)`

1.3.4 / 2013-04-17
==================

  * swipe directionally aware

1.3.3 / 2013-04-05
==================

  * index: implemented proper feature detection

1.3.2 / 2013-03-27
==================

  * index: make sure to give extra room for zoom changes

1.3.1 / 2013-03-24
==================

  * index: prevent bad `show` if `refresh` is called right after `cycle`
  * index: make refresh `show` silent

1.3.0 / 2013-03-05
==================

  * add .show() .silent option

1.2.2 / 2013-02-26
==================

  * fix .refresh() - show the current item again

1.2.1 / 2013-02-15
==================

  * typo

1.2.0 / 2013-02-15
==================

  * add .refresh()

1.1.1 / 2013-01-18
==================

  * Add \`show\` event emission.

1.1.0 / 2012-12-16
==================

  * rename to swipe
  * fix clicking of last item

1.0.1 / 2012-11-22
==================

  * fix resistance. Closes #3

1.0.0 / 2012-11-22
==================

  * Initial release
