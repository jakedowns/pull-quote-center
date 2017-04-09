require('per-word-action');
require('underscore');

$.fn.pullQuoteCenter = function(options){
  var $this = $(this);
  if($this.data('pqc')){
    $this.data('pqc').destroy();
  }
  var pqc = new PQC($this, options);
  $this.data('pqc', pqc);
}

class PQC
{
  constructor($this, options) {
    let defaults = {
      debug: false,
      min_breakpoint: 0, // 769
      wiggle_room: 30,
      wrapper_selector: '.two_column_wrapper',
      pquote_selector: '.pquote.center',
      clone_classname: 'pqc-clone',
      lhc_selector: '.left-column',
      rhc_selector: '.right-column',
      responsive: true
    };

    this.$el = $this;
    this.opts = {...defaults, ...options};
    var opts = this.opts;

    this.init_dbounced = _.debounce(this.init.bind(this), 250);

    $(window).off('.pqc');
    if(opts.responsive){
      $(window).on('resize.pqc', this.init_dbounced.bind(this));
    }

    this.init();
  }

  init() {
    var _this = this;
    var $this = $(this.$el);
    // clean up old helper elements, prep for re-calc/re-insert
    $this.find('.' + this.opts.clone_classname).remove();

    var wiggle_room = this.opts.wiggle_room;

    var opts = _this.opts;

    $this.find(this.opts.pquote_selector).each(function(index){
      var $this = $(this);
      var parent_wrapper = $this.closest(_this.opts.wrapper_selector);
      var rhc = parent_wrapper.find(_this.opts.rhc_selector);
      var $clone = $this.clone();
      var pquoteTop = $this.offset().top;
      var found_insert_point = false;
      var $prevWord = null;
      var prevLine = 0;
      var prevDiff = 0;
      var text = $this.text();

      $(rhc).perWordAction(($word, line)=>{
        if(!$word || !$word.length) return;
      if(found_insert_point) return;
      var wordTop = $word.offset().top;
      var diff = wordTop - pquoteTop;

      var doInsert = Math.abs(diff) < wiggle_room && Math.abs(prevDiff) < wiggle_room;

      //console.log(text, line, diff, prevDiff);

      // let it go too far, (diff = pos integer), then backtrack
      if(line !== prevLine){
        if($prevWord && Math.abs(prevDiff) < wiggle_room && diff > wiggle_room){
          $word = $prevWord;
          doInsert = true;
        }
      }

      if(doInsert){
        found_insert_point = true;
        $clone.addClass(_this.opts.clone_classname);
        $this.attr('data-pqc-index', index);
        $clone.attr('data-pqc-clone-index', index);
        $($word).prepend($clone);

        var $newClone = $word.find('.pqc-clone');
        var final = pquoteTop - $newClone.offset().top;

        // not quite right, let's do incremental fine-tuning...
        if(Math.abs(final) >= 20){
          _this.step_fine_tuner(line, final, $word, $newClone, pquoteTop, text, null, 0, {
            best: 9999,
            bestEl: null
          });
        }
      }

      if(line !== prevLine){
        prevLine = line;
        $prevWord = $word;
        prevDiff = diff;
      }
    });

      if(_this.opts.debug) console.log('-------');
      $this = null;
    });

    if(this.opts.debug === true){
      $('.pquote').css({
        border: '1px solid rgba(0,255,0,0.5)'
      });
      $('.pqc-clone').css({
        border: '1px solid blue',
        opacity: 0.1
      });
    }
  }

  step_fine_tuner(line, error_offset, $word, $clone, pquoteTop, text, prev_error_offset, counter, bestTracker) {
    var _this = this;
    counter++;
    const MAX = 10;
    if (counter > MAX) {
      if (this.opts.debug) console.log('|=======| just going with the best', bestTracker.best);
      // we're just ping-ponging at this point, choose the best and break out
      if (bestTracker.bestEl) {
        $clone.detach().prependTo(bestTracker.bestEl);
      }
      return;
    }
    var error_limit = 20;
    if (this.opts.debug) console.log('howd we do?', error_offset, [text.trim()]);

    var index = parseInt($clone.attr('data-pqc-clone-index'));

    var refEl = null;

    // fine-tuning after reflow
    if (error_offset >= error_limit) {
      // go forward a line
      if (this.opts.debug) console.log('stepping back');
      line += 1;

      var $nextLineEl_ideal = $word.parent().find('[pwa-line=' + (line) + ']').first();
      var $nextLineEl_backup = $word.parent().find('[pwa-line=' + (line - 1) + ']').last();
      var $nextLineEl_worst_case = $word.closest(this.opts.rhc_selector).find('[pwa-line=' + (line) + ']').last();

      if (this.opts.debug) {
        console.log('nextLineEl?',
          $nextLineEl_ideal.length,
          $nextLineEl_backup.length,
          $nextLineEl_worst_case.length
        );
      }

      if ($nextLineEl_ideal.length) {
        refEl = $nextLineEl_ideal;
        $clone.detach().prependTo($nextLineEl_ideal);
      } else if ($nextLineEl_backup.length) {
        refEl = $nextLineEl_backup;
        $clone.detach().prependTo($nextLineEl_backup);
      } else if ($nextLineEl_worst_case.length) {
        refEl = $nextLineEl_worst_case;
        $clone.detach().prependTo($nextLineEl_worst_case);
      } else {
        // console.log('giving up');
        return;
      }

    } else if (error_offset <= -error_limit) {
      if (this.opts.debug) console.log('stepping forward');
      // go back a line
      line -= 1;

      var $prevLineEl_ideal = $word.parent().find('[pwa-line=' + (line) + ']').last();
      var $prevLineEl_backup = $word.parent().find('[pwa-line=' + (line + 1) + ']').first();
      var $prevLineEl_worst_case = $word.closest(this.opts.rhc_selector).find('[pwa-line=' + (line) + ']').last();

      if (this.opts.debug) {
        console.log('prevLineEl?',
          $prevLineEl_ideal.length,
          $prevLineEl_backup.length,
          $prevLineEl_worst_case.length
        );
      }
      if ($prevLineEl_ideal.length) {
        refEl = $prevLineEl_ideal;
        $clone.detach().prependTo($prevLineEl_ideal);
      } else if ($prevLineEl_backup.length) {
        refEl = $prevLineEl_backup;
        $clone.detach().prependTo($prevLineEl_backup);
      } else if ($prevLineEl_worst_case.length) {
        refEl = $prevLineEl_worst_case;
        $clone.detach().prependTo($prevLineEl_worst_case);
      } else {
        // console.log('giving up');
        return;
      }
    }

    //$clone = refEl.find('.pqc-clone').first();
    $clone = $('[data-pqc-clone-index=' + index + ']').first();

    if (!$clone.length) {
      // refEl.css('color','red');
      if (this.opts.debug) console.log('WHOOPS', refEl);
      return;
    }

    var updated_error_offset = pquoteTop - $clone.offset().top;

    if (this.opts.debug) console.log('keep trying?', updated_error_offset, prev_error_offset);

    var maybe_new_best = Math.abs(updated_error_offset);
    if (maybe_new_best < bestTracker.best) {
      if (this.opts.debug) console.log('|=======| new best!', maybe_new_best);
      bestTracker.best = maybe_new_best;
      bestTracker.bestEl = refEl;
    }

    // if(updated_error_offset > prev_error_offset){
    //   console.log('stop... were just making it worse');
    //   return;
    // }

    if (Math.abs(updated_error_offset) >= error_limit) {
      if (this.opts.debug) console.log('stepping fine tuner', updated_error_offset);
      _this.step_fine_tuner(line, updated_error_offset, $word, $clone, pquoteTop, text, error_offset, counter, bestTracker);
    }
  }

  destroy() {
    console.log('destroy PQC instance');
    this.$el = null;
    this.opts = null;
  }
}