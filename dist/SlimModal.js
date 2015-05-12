(function(root, undefined) {

  "use strict";


/*
 * TODO: refactor the below and utilize jQuery transit
 * Currently just using jQuery animation
 * jQuery transit will allow us to utlize CSS3 animations with nice JS fallbacks
 */

var SlimModal = function($element, options) {
  this.$element = $element;
  this.options = $.extend(this.constructor.DEFAULTS, options);
  this.$maskLayer = null;
  this.isLocked = null;
  this.checkTransformSupport();
};

SlimModal.VERSION = '1.0.0';

/*
 * Modal defaults can be overridden using the data attributes shown below:
 * ex. data-overlay="false"
 * ex. data-keyboard="false"
 * ex. data-modal="false"
 * ex. data-load="true"
 */
SlimModal.DEFAULTS = {
  overlay: true,
  keyboard: true,
  modal: true,
  load: false
};

/*
 * Please use events to attach  calls, hide or display content, etc.
 * ex. $(document).on('slimModal.before.show', '[data-modal="MODAL-TARGET-NAME"]', function() {});
 * ex. $(document).on('slimModal.after.show', '[data-modal="MODAL-TARGET-NAME"]', function() {});
 * ex. $(document).on('slimModal.before.hide', '[data-modal="MODAL-TARGET-NAME"]', function() {});
 * ex. $(document).on('slimModal.after.hide', '[data-modal="MODAL-TARGET-NAME"]', function() {});
 */
SlimModal.EVENTS = {
  BEFORE_SHOW: 'slimModal.before.show',
  AFTER_SHOW: 'slimModal.after.show',
  BEFORE_HIDE: 'slimModal.before.hide',
  AFTER_HIDE: 'slimModal.after.hide'
};

// Escape key number
SlimModal.ESCAPE_KEY = 27;

// Animation speed
SlimModal.ANIMATION_SPEED = 250;

SlimModal.prototype.checkTransformSupport = function() {
  // Delegate .transition() calls to .animate()
  // if the browser can't do CSS transitions.
  if (!$.support.transition) {
    $.fn.transition = $.fn.animate;
  }
};

SlimModal.prototype.toggle = function() {
  this.isLocked ? this.hide() : this.show();
};

SlimModal.prototype.show = function() {
  this.isLocked = true;
  this.addMaskLayer();
  this.addCloseButton();
  this.keyboardBindings();
  this.overlayBindings();
  this.closeButtonBindings();
  this.showAnimation();
};

/*
 * TODO: Need to replace the return false and pass in the event object and then preven the default action
 * This event needs to be passed in from the toggle method
 */
SlimModal.prototype.hide = function(e) {
  this.isLocked = false;
  this.hideAnimation();
  return false;
};

SlimModal.prototype.showAnimation = function() {
  this.$element.trigger(this.constructor.EVENTS.BEFORE_SHOW);
  this.$element.css('top', this.resetTop() + 'px');
  this.$maskLayer.show().stop().transition({opacity: 1}, this.constructor.ANIMATION_SPEED, $.proxy(function() {
    this.$element.show().stop()
                 .transition({top: this.offsetTop() + 'px', opacity: 1}, this.constructor.ANIMATION_SPEED)
                 .trigger(this.constructor.EVENTS.AFTER_SHOW);
  }, this));
};

SlimModal.prototype.hideAnimation = function() {
  this.$element.trigger(this.constructor.EVENTS.BEFORE_HIDE);
  this.$element.stop().transition({top: this.resetTop() + 'px', opacity: 0},
    this.constructor.ANIMATION_SPEED, $.proxy(function() {
      this.$maskLayer.stop().transition({opacity: 0}, this.constructor.ANIMATION_SPEED, $.proxy(function() {
        this.$maskLayer.hide().remove();
        this.$element.trigger(this.constructor.EVENTS.AFTER_HIDE).hide();
      }, this));
    }, this));
};

SlimModal.prototype.offsetTop = function() {
  return parseInt($(window).scrollTop() + 45, 10);
};

SlimModal.prototype.resetTop = function() {
  return parseInt($(window).scrollTop() - this.$element.outerHeight(), 10);
};

SlimModal.prototype.addMaskLayer = function() {
  this.$maskLayer = $('<div/>', {class: 'slimModal-Overlay'});
  $('body').append(this.$maskLayer);
};

SlimModal.prototype.addCloseButton = function() {
  var notVisible = this.$element.find('[data-js="close_modal_button"]').length;

  if (this.options.modal && notVisible) {
    var html = '<div class="SlimModal-close">' +
               '<a href="#" class="SlimModal-close-link" data-js="close_modal_button">' +
               '<i class="SlimModal-close-icon sb-Icon--times"></i>' +
               '</a>' +
               '</div>';
    this.$element.prepend(html);
  }
};

SlimModal.prototype.keyboardBindings = function() {
  if (this.isLocked && this.options.keyboard) {
    $(document).one('keyup', $.proxy(function(e) {
      e.which === SlimModal.ESCAPE_KEY && this.hide();
    }, this));
  }
};

SlimModal.prototype.overlayBindings = function() {
  if (this.isLocked && this.options.overlay) {
    this.$maskLayer.one('click.overlay.close.slimModal', $.proxy(this.hide, this));
  }
};

SlimModal.prototype.closeButtonBindings = function() {
  if (this.isLocked && this.options.modal) {
    this.$element.one('click.button.close.slimModal', '[data-js="close_modal_button"]', $.proxy(this.hide, this));
  }
};

/*
 * This plugin allows you to programmatically open and close a modal
 * ex. $('[data-modal="MODAL-TARGET-NAME"]').slimModal('show')
 * ex. $('[data-modal="MODAL-TARGET-NAME"]').slimModal('hide')
 * ex. $('[data-modal="MODAL-TARGET-NAME"]').slimModal('toggle')
 */
function slimModalPlugin(option) {
  var $element = $(this);
  var options = $.extend(SlimModal.DEFAULTS, $element.data());
  var data = $element.data('slimModal.data');
  !data && $element.data('slimModal.data', data = new SlimModal($element, options));
  typeof option === 'string' && data[option]();
  return this;
}
$.fn.slimModal = slimModalPlugin;

// This will open the modal when a target element is triggered (on demand initialization)
$(document).on('click.show.slimModal', '[data-js="slimModal-trigger"]', function(e) {
  var $this = $(this);
  $this.is('a') && e.preventDefault();
  var $element = $('[data-modal=' + $this.attr('data-target') + ']');
  var data = $element.data('slimModal.data');
  var options = $element.data();
  data || $element.data('slimModal.data', data = new SlimModal($element, options));
  data.toggle();
});

// Loads all modals on page load that are needed
$('[data-js="slimModal-target"][data-load="true"]').each(function() {
  var $element = $(this);
  var options = $.extend(SlimModal.DEFAULTS, $element.data());
  var data = new SlimModal($element, options);
  $element.data('slimModal.data', data);
  data.toggle();
});


}(this));
