(function(root, undefined) {

  "use strict";


var SlimModal = function($element, options) {
  this.$element = $element;
  this.options = $.extend(this.constructor.DEFAULTS, options);
  this.$maskLayer = null;
  this.isLocked = null;
};

SlimModal.VERSION = '1.0.0';

SlimModal.DEFAULTS = {
  overlay: true,
  keyboard: true,
  modal: true,
  load: false,
  ajax: false
};

SlimModal.EVENTS = {
  BEFORE_SHOW: 'slimModal.before.show',
  AFTER_SHOW: 'slimModal.after.show',
  BEFORE_HIDE: 'slimModal.before.hide',
  AFTER_HIDE: 'slimModal.after.hide'
};

SlimModal.ESCAPE_KEY = 27;

SlimModal.ANIMATION_SPEED = 250;

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

SlimModal.prototype.hide = function(e) {
  this.isLocked = false;
  this.hideAnimation();
  return false;
};

SlimModal.prototype.showAnimation = function() {
  this.$element.trigger(this.constructor.EVENTS.BEFORE_SHOW);
  this.$element.css('top', this.resetTop() + 'px');
  this.$maskLayer.show().stop().animate({opacity: 1}, this.constructor.ANIMATION_SPEED, $.proxy(function() {
    this.$element.show().stop()
                 .animate({top: this.offsetTop() + 'px', opacity: 1}, this.constructor.ANIMATION_SPEED)
                 .trigger(this.constructor.EVENTS.AFTER_SHOW);
  }, this));
};

SlimModal.prototype.hideAnimation = function() {
  this.$element.trigger(this.constructor.EVENTS.BEFORE_HIDE);
  this.$element.stop().animate({top: this.resetTop() + 'px', opacity: 0},
    this.constructor.ANIMATION_SPEED, $.proxy(function() {
      this.$maskLayer.stop().animate({opacity: 0}, this.constructor.ANIMATION_SPEED, $.proxy(function() {
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
    this.$element.one('keyup.close.slimModal', $.proxy(function(e) {
      e.which == SlimModal.ESCAPE_KEY && $.proxy(this.hide(), this);
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

$(document).on('click.show.slimModal', '[data-js="slimModal-trigger"]', function(e) {
  var $this = $(this);
  $this.is('a') && e.preventDefault();
  var $element = $('[data-modal=' + $this.attr('data-target') + ']');
  var data = $element.data('slimModal.data');
  var options = $element.data();
  data || $element.data('slimModal.data', data = new SlimModal($element, options));
  data.toggle();
});

$('[data-js="slimModal-target"][data-load="true"]').each(function() {
  var $element = $(this);
  var options = $.extend(SlimModal.DEFAULTS, $element.data());
  var data = new SlimModal($element, options);
  $element.data('slimModal.data', data);
  data.toggle();
});


}(this));
