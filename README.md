# pull-quote-center

### !!! work-in-progress, YMMV !!!

A jQuery plugin utility which dynamically inserts a symmetrical pull-quote element clone to enable a hacky float: center
between two columns of text

**Demo:** https://jakedowns.github.io/pull-quote-center

<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/2A0c3T3N3s2A3R1G213t/Screen%20recording%202017-04-08%20at%2008.41.28%20PM.gif?X-CloudApp-Visitor-Id=88002&v=c5ea8221" width="100%" height="auto">

## usage
See index.html for example HTML + CSS.

1. make sure you have jQuery loaded
1. require this plugin or load it via a script tag
1. call it after domready via:
```
$('.content').pullQuoteCenter();

// alternatively, you can pass in an options object to override default options:

$('.content').pullQuoteCenter({
    debug               : false,
    wrapper_selector    : '.two_column_wrapper',
    pquote_selector     : '.pquote.center',
    clone_classname     : 'pqc-clone',
    lhc_selector        : '.left-column',
    rhc_selector        : '.right-column',
    responsive          : false,
});
```
---

## related package / dependency
- [per-word-action](https://github.com/jakedowns/per-word-action)

## credit

This plugin was inspired by Chris Coyier's CSS-Tricks post: [Faking "float: center"](https://css-tricks.com/float-center/)