/**
 * @file
 * tg.scripts.js
 */

(function ($) {
  'use strict';

  var $window = $(window);

  if (window.Drupal === undefined) {
    window.Drupal = {};
  }

  Drupal.tgOpenPopup = function (url, title, w, h) {
    var left = (screen.width / 2) - (w / 2),
        top = (screen.height / 2) - (h / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  };

  /**
   * Derivative table plugin.
   *
   * Table scrolling mechanic
   * Makes part of the table scrollable.
   */
  $.fn.tgDerivativeList = function () {
    return this.each(function () {
      var $this = $(this),
          // Build helper table.
          $helper = $('<table>', {
            'class': 'derivative-list__table derivative-list__table--helper'
          }),
          $head = $('<thead>'),
          $body = $('<tbody>');

      $helper.append($head).append($body);

      $this.find('.derivative-list__table th:first-child').each(function () {
        var cell = $(this).clone();
        $head.append($('<tr>').append(cell));
      });

      $this.find('.derivative-list__table td:first-child').each(function () {
        var cell = $(this).clone();
        $body.append($('<tr>').append(cell));
      });

      $this.append($helper);
    });
  };

  /**
   * Derivative table accordion plugin.
   *
   * Adds expanding behavior to tables.
   */
  $.fn.tgAccordion = function () {
    return this.each(function () {
      var $this = $(this),
          $header = $this.find('.accordion__header'),
          $content = $this.find('.accordion__content'),
          open = $this.hasClass('is-expanded');

      $header.bind('click touchend', function (ev) {
        ev.preventDefault(); // Avoids 'double press' issue.
        $content.stop().slideToggle(!open);
        $this.toggleClass('is-expanded');
        open = !open;

        // Send GA event if car spec is expanded.
        if ('tg_tracking' in Drupal.settings && $this.hasClass('is-expanded')) {
          ga('send', 'event', 'First Drive', 'Specs Panel', 'open');
        }
      });
    });
  };

  /**
   * Appends 'catch-all' link to cover element and simulate block level link.
   */
  $.tgFauxBlockLink = function (element, settings) {
    var $this = $(element),
        $link = $this.find(settings.linkSelector).eq(0),
        $linkClone = $link.clone(),
        scrolling = false,
        scrollTimer,
        hoverTimer;

    $linkClone.attr({
      'class': 'faux-block-link',
      tabindex: -1
    });

    $linkClone.click(function () {
      $link.trigger('click');
    });

    $linkClone.hover(function () {
      clearInterval(hoverTimer);
      // Don't add hover state when scrolling for performance reasons.
      if (!scrolling) {
        $this.addClass('has-faux-block-link-hover');
      }
      else {
        // Wait until scrolling has stopped.
        hoverTimer = setInterval(function () {
          if (!scrolling) {
            clearInterval(hoverTimer);
            $this.addClass('has-faux-block-link-hover');
          }
        }, 50);
      }
    }, function () {
      clearInterval(hoverTimer);
      $this.removeClass('has-faux-block-link-hover');
    });

    $window.scroll(function () {
      scrolling = true;
      clearInterval(scrollTimer);
      scrollTimer = setInterval(function () {
        clearInterval(scrollTimer);
        scrolling = false;
      }, 100);
    });

    $this.addClass('has-faux-block-link')
        .append($linkClone);
  };

  $.fn.tgFauxBlockLink = function (options) {
    var settings = $.extend({linkSelector: 'a'}, options);
    return this.each(function () {
      $.tgFauxBlockLink(this, settings);
    });
  };

  /**
   * Tooltip plugin.
   */
  var tgTooltip__defaults = {
    autoHide: true,
    hideDelay: 3000,
    showOnHover: false,
    show: true,
    distance: 5,
    width: 160,
    visibleClass: 'is-visible',
    useJSAnimations: !$('html').hasClass('csstransitions')
  };

  var tgTooltip__name = 'plugin_tgTooltip';

  var TGTooltip = function (element, options) {
    this.element = element;
    // Settings is a "merger" of provided options and default values.
    this.settings = $.extend({}, tgTooltip__defaults, options);
    this.init();
  };

  $.extend(TGTooltip.prototype, {
    init: function () {
      // Build tooltip element.
      var $tooltip = $('<div>', {'class': 'tooltip'});
      var $tooltipContent = $('<div>', {'class': 'tooltip__content'});
      var $tooltipTextElement = $('<div>', {'class': 'tooltip__text'});
      var $tooltipTipElement = $('<div>', {'class': 'tooltip__tip'});

      $tooltipContent.append($tooltipTextElement);
      $tooltipContent.append($tooltipTipElement);
      $tooltip.append($tooltipContent);

      this.$tooltipElement = $tooltip;
      this.$tooltipTextElement = $tooltipTextElement;
      this.$tooltipTipElement = $tooltipTipElement;

      // Prepare element.
      this.prepare();

      $('body').append($tooltip);

      var self = this;

      $(window).resize(function () {
        if (self && self.isVisible) {
          self.updatePosition();
        }
      });
    },

    /**
     * Reinit takes new options and updates the tooltip.
     */
    reinit: function (options) {
      this.settings = $.extend({}, tgTooltip__defaults, options);
      this.prepare();
    },

    /**
     * The prepare function sets the text, width, additional classes, updates
     * the position and shows the tooltip if required.
     */
    prepare: function () {
      this.isVisible = false;
      this.setText(this.settings.text);
      this.$tooltipElement.width(this.settings.width);
      this.$tooltipElement.toggleClass('tooltip--js-anim', this.settings.useJSAnimations);
      this.updatePosition();

      var self = this;

      // In case we have already attached an event handler, we have to unbind.
      $(this.element).unbind('.tgTooltip');

      if (this.settings.showOnHover) {
        $(this.element).bind('mouseenter.tgTooltip', function tooltipMouseover() {
          self.show();
        }).bind('mouseleave.tgTooltip', function tooltipMouseleave() {
          self.hide();
        });
      }

      if (this.settings.show) {
        setTimeout(function () {
          self.show();
        }, 0);
      }
    },

    setText: function (text) {
      this.$tooltipTextElement.text(text);
    },

    show: function () {
      // If JS animations are required, use fadeIn(); otherwise, simply add
      // class (CSS transitions)
      if (this.settings.useJSAnimations) {
        this.$tooltipElement.stop().fadeIn();
      }
      else {
        this.$tooltipElement.addClass(this.settings.visibleClass);
      }

      this.isVisible = true;

      // Prevent any "queued" auto-hide from happening.
      clearTimeout(this._timeout);

      if (this.settings.autoHide) {
        var self = this;
        this._timeout = setTimeout(function () {
          self.hide();
        }, this.settings.hideDelay);
      }
    },

    hide: function () {
      clearTimeout(this._timeout);
      if (this.settings.useJSAnimations) {
        this.$tooltipElement.stop().fadeOut();
      }
      else {
        this.$tooltipElement.removeClass(this.settings.visibleClass);
      }
      this.isVisible = false;
    },

    updatePosition: function () {
      var $element = $(this.element);

      var offset = $element.offset();
      var distanceTop = $element.height() + this.settings.distance;
      // Center the tooltip below the element.
      var distanceLeft = -(this.settings.width / 2) + $element.width() / 2;

      // Check if the tooltip would stick out on the right hand side of the
      // window.
      var delta = Math.min(Drupal.windowSize.width - (offset.left + distanceLeft + this.settings.width), 0);

      // Check if it sticks out on the left hand side of the window.
      if (offset.left + distanceLeft < 0) {
        delta = -(offset.left + distanceLeft);
      }

      var css = $.extend({}, offset, {
        'margin-top': distanceTop,
        'margin-left': distanceLeft + delta
      });

      // Shift the tooltip element if neccessary so that it points at the
      // element correctly.
      this.$tooltipTipElement.css('margin-left', -delta);
      // Set the tooltip location.
      this.$tooltipElement.css(css);
    }
  });

  $.fn.tgTooltip = function (options) {
    return this.each(function tgTooltip_master() {
      var tooltip = $.data(this, tgTooltip__name);
      if (!tooltip) {
        if (typeof options === 'object') {
          $.data(this, tgTooltip__name, new TGTooltip(this, options));
        }
      }
      else {
        // If the argument is a string, we treat it as a command.
        if (typeof options === 'string') {
          var args = Array.prototype.slice.call(arguments, 1);
          tooltip[options].apply(this, args);
        }
        else {
          tooltip.reinit(options);
        }
      }
    });
  };

  $.fn.tgSubnavNavigation = function () {
    var $self = this,
        $navArrows = $('<div>', {'class': 'sub-nav__nav-arrows'}),
        $prev = $('<button class="sub-nav__nav-arrow"><i class="icon-arrow-left"></i><span class="element-invisible">' + Drupal.t('Previous') + '</span></button>'),
        $next = $('<button class="sub-nav__nav-arrow"><i class="icon-arrow-right"></i><span class="element-invisible">' + Drupal.t('Next') + '</span></button>'),
        $subnavList = $self.find('.sub-nav__list'),
        subnavListOffset = 0,
        subnavListWidth = 0;

    $navArrows.append($prev);
    $navArrows.append($next);
    this.append($navArrows);

    function scroll(direction) {
      var scrollLeft = $subnavList.scrollLeft();
      // Move the list up to a third (0.333) of its width.
      $subnavList.stop().animate({scrollLeft: scrollLeft + (subnavListWidth * 0.333 * direction)}, 250);
    }

    function checkArrowsNeeded() {
      $self.toggleClass('has-nav-arrows', $self.width() < subnavListWidth + subnavListOffset);
    }

    $prev.click(function () {
      scroll(-1);
    });
    $next.click(function () {
      scroll(1);
    });

    if ($subnavList.length > 0) {
      subnavListOffset = $subnavList.position().left;
    }
    $subnavList.children('li').each(function () {
      subnavListWidth += $(this).width();
    });

    $(window).resize(Drupal.debounce(checkArrowsNeeded, 100));
    checkArrowsNeeded();

    return this;
  };

  $.fn.tgReadMore = function () {

    var maxHeight = parseInt(this.css('max-height'));
    this.css('max-height', 'none');

    if (!isNaN(maxHeight) && this.height() > maxHeight) {
      // Revert max-height.
      this.css('max-height', maxHeight);
    }
    else {
      /*
       At this point, we return because max-height wasn't set,
       or because the article text is shorter than max-height.
       However it is now set to 'none' so that we do not trim
       the text when the user decides to resize the window.
      */
      return this;
    }

    var $self = this;
    var $readMoreButton = $('<button>', {'class': 'btn'}).text(Drupal.t('Read more'));

    $readMoreButton.click(function readMoreButtonExpand() {
      $self.css('max-height', 'none');
      $self.height(maxHeight);

      var delta = Drupal.windowSize.height - ($self.position().top - $(window).scrollTop() + maxHeight);

      $self.animate({height: maxHeight + delta}, function readMoreButtonPostExpand() {
        $(this).height('auto');
        if (Drupal.settings.tgTheme.nodeType === 'news_article') {
          // Lazy load an advert when load more button is clicked.
          $('.content-body').after('<div class="l-runaround-mpu"><div class= "ad ad--narrow ad--mpu ad--mpu-premium-1-narrow" id="ad-manager-ad-mpu_premium_1_narrow"></div></div>');
          Drupal.GPT.addSlot('ad-manager-ad-mpu_premium_1_narrow', function () {
            var m = Drupal.GPT.buildSizeMapping([[[0, 0], [[300, 250]]], [[1000, 0], []]]);
            var s = googletag.defineSlot(Drupal.GPT.unitPath(), m.define, 'ad-manager-ad-mpu_premium_1_narrow') // Jshint ignore:line.
                .defineSizeMapping(m.mapping.build())
                .setTargeting('pos', ['mpu_premium_1']);
            Drupal.GPT.attachTargeting(s, Drupal.settings.gpt.targeting, false);
            s.addService(googletag.pubads()); // Jshint ignore:line.
          });
          googletag.pubads().refresh([Drupal.GPT.grabSlot('ad-manager-ad-mpu_premium_1_narrow')]); // Jshint ignore:line.
        }
        $readMoreButton.remove();
      });
    });

    var $buttonContainer = $('<div>', {'class': 'read-more__button-container'}).append($readMoreButton);

    this.after($buttonContainer);

    return this;
  };

  $.tgSticky = function (element, settings) {
    var $self = $(element),
        $clone = $self.clone(),
        $window = $(window),
        top = $self.offset().top,
        isFixed = false;

    $clone.addClass(settings.hiddenClass)
        .addClass(settings.fixedClass);

    $(settings.containerSelector).append($clone);

    function checkScroll() {
      var scrollTop = $window.scrollTop(),
          scrolledPast = scrollTop > top;

      if (scrolledPast && !isFixed) {
        $clone.removeClass(settings.hiddenClass);
      }
      else if (!scrolledPast && isFixed) {
        $clone.addClass(settings.hiddenClass);
      }
      isFixed = scrolledPast;
    }

    $window.resize(Drupal.debounce(function () {
      top = $self.offset().top;
    }, 16))
        .scroll(Drupal.debounce(checkScroll, 16));

    checkScroll();

    return this;
  };

  $.fn.tgSticky = function (options) {
    var defaults = {
          containerSelector: '.l-main',
          hiddenClass: 'is-hidden',
          fixedClass: 'is-fixed'
        },
        settings = $.extend(defaults, options);

    return this.each(function () {
      $.tgSticky(this, settings);
    });
  };

  var tgVideoPlaylist__defaults = {};

  var tgVideoPlaylist__name = 'plugin_tgVideoPlaylist';

  var TGVideoPlaylist = function (element, options) {
    this.$element = $(element);
    // Settings is a "merger" of provided options and default values.
    this.settings = $.extend({}, tgVideoPlaylist__defaults, options);
    this.init();
  };

  $.extend(TGVideoPlaylist.prototype, {
    init: function () {
      var self = this;

      this.$videoPlayer = this.$element.find('.video-player');
      this.$playlist = this.$element.find('.video-playlist__playlist');
      this.$playlistCounter = this.$element.find('.video-playlist__counter');
      this.videoPlayer = window.videojs(this.$videoPlayer.find('.video-js').attr('id'));
      this.currentVideo = this.$videoPlayer.find('.video-js').attr('data-video-id');
      this.playlistData = Drupal.settings.tgViews.videoPlaylist[this.$element.attr('id')];

      this.$playlist.find('[data-video-id=' + this.currentVideo + ']').addClass('is-active');

      this.$playlist.on('click', '.video-playlist__item .faux-block-link', function (ev) {
        ev.preventDefault();
      });

      this.$playlist.on('click', '.video-playlist__item .push-item__text-content a', function (ev) {
        ev.preventDefault();
        self.playVideo($(this).parents('.video-playlist__item').attr('data-video-id'));
      });

      this.videoPlayer.ready(function () {
        var removePlayClass = function () {
          self.$element.removeClass('is-playing');
        };

        this.on('play', function () {
          self.$element.addClass('is-playing');
        }).on('pause', removePlayClass)
            .on('loadstart', removePlayClass)
            .on('ended', function () {
              removePlayClass();
              var $next = self.$playlist.find('[data-video-id=' + self.currentVideo + ']').next('[data-video-id]');
              if ($next.length > 0) {
                self.playVideo($next.attr('data-video-id'));
              }
            });
      });

      var visibleClass = 'is-visible';

      var $buttonTemplate = $('<a>', {
        'class': 'video-playlist__nav-button',
        'href': '#'
      });

      var $prevButton = $buttonTemplate.clone().addClass('video-playlist__nav-button--prev').text(Drupal.t('Previous'));
      var $nextButton = $buttonTemplate.clone().addClass('video-playlist__nav-button--next ' + visibleClass).text(Drupal.t('Next'));

      this.$playlist.append($prevButton, $nextButton);

      this.$videoPlaylistItems = this.$element.find('.video-playlist__items');

      this._playlistViewportHeight = this.$videoPlaylistItems.outerHeight();

      var $listItems = this.$videoPlaylistItems.children('li');
      var $activeListItemIndex = this.$videoPlaylistItems.children('li.is-active').index() + 1;
      var itemHeight = $listItems.height();
      this._playlistTotalHeight = itemHeight * $listItems.length;
      this._playlistScrollTop = 0;

      this.$videoPlaylistItems.scroll(function () {
        var scrollTop = $(this).scrollTop();

        self._playlistScrollTop = scrollTop;

        $prevButton.toggleClass(visibleClass, (scrollTop > 0));
        $nextButton.toggleClass(visibleClass, (scrollTop < self._playlistTotalHeight - self._playlistViewportHeight));
      });

      this.$element.on('click', '.video-playlist__nav-button', function (ev) {
        ev.preventDefault();
        var delta = itemHeight * 3;

        if ($(this).hasClass('video-playlist__nav-button--prev')) {
          delta *= -1;
        }

        var scroll = Math.max(0, self._playlistScrollTop + delta);

        self.$videoPlaylistItems.stop().animate({'scrollTop': scroll});

      });

      // Append counter to the playlist title.
      if ($listItems.length > 1) {
        this.$playlistCounter.append($('<span>', {
          'class': 'video-playlist__counter-current'
        }).text($activeListItemIndex));

        this.$playlistCounter.append('/');

        this.$playlistCounter.append($('<span>', {
          'class': 'video-playlist__counter-total'
        }).text($listItems.length));
      }

      // Update "cache".
      $(window).resize(function () {
        self._playlistViewportHeight = self.$videoPlaylistItems.outerHeight();
      });

    },

    playVideo: function (videoID, callback) {
      var self = this;
      this.videoPlayer.ready(function () {

        // Ads Manager sometimes throws an exception.
        try {
          var thisPlayer = this;
          if (thisPlayer.ima3.adsManager !== undefined && thisPlayer.ima3.adsManager !== null && thisPlayer.ima3.adsManager.stop !== undefined) {
            thisPlayer.ima3.adsManager.stop();
          }
        }
        catch (e) {
          console.log(e);
        }

        var $playlistTitleCurrentCounter = self.$playlist.find('.video-playlist__counter-current');
        var $playlistItem = self.$playlist.find('[data-video-id=' + videoID + ']');

        // Move playlist item into view.
        var delta = $playlistItem.position().top - (self.$playlist.height() - $playlistItem.height());
        if (delta > 0) {
          self.$playlist.animate({scrollTop: self.$playlist.scrollTop() + delta + ($playlistItem.height() * 0.5)});
        }

        $playlistItem.addClass('is-loading');
        this.catalog.getVideo(videoID, function (error, video) {

          if (error) {
            console.log(error);
            return;
          }

          self.currentVideo = videoID;

          thisPlayer.catalog.load(video);
          thisPlayer.play();

          self.updateVideoDetails(self.playlistData['v' + videoID]);

          self.$playlist.find('.is-active').removeClass('is-active');
          $playlistItem.addClass('is-active').removeClass('is-loading');

          // Update the playlist title counter.
          if ($playlistTitleCurrentCounter.length > 0) {
            $playlistTitleCurrentCounter.text($playlistItem.index() + 1);
          }

          if (typeof callback === 'function') {
            // Make sure that `this` refers to the playlistPlayer.
            callback.call(self, video);
          }
        });
      });
    },

    updateVideoDetails: function (data) {
      var updateData = {
        '.video-player__title': data.title,
        '.video-player__description': data.description,
        '.video-player__date-value': data.published,
        '.video-player__tags': data.tags,
        '.video-player__share-links': data.service_links,
      };

      for (var entry in updateData) {
        if (updateData.hasOwnProperty(entry)) {
          this.$videoPlayer.find(entry).html(updateData[entry]);
        }
      }
    },

    pauseVideo: function () {
      this.videoPlayer.pause();
    }
  });

  $.fn.tgVideoPlaylist = function (options) {
    return this.each(function tgVideoPlaylist_master() {
      var videoPlaylist = $.data(this, tgVideoPlaylist__name);
      if (!videoPlaylist) {
        $.data(this, tgVideoPlaylist__name, new TGVideoPlaylist(this, options));
      }
      else if (typeof options === 'string') {
        var args = Array.prototype.slice.call(arguments, 1);
        videoPlaylist[options].apply(videoPlaylist, args);
      }
    });
  };

  $.fn.tgSideBar = function () {
    var $items = $(this).children('li').clone();
    var $body = $('.l-master-wrapper');

    // Get all content that needs shifting.
    var $content = $body.find('header .main-nav__container, .l-main, .footer');

    // We are going to indicate that it is shiftable.
    $content.addClass('is-sidebar-shiftable');

    var $sidebar = $('<div>', {'class': 'sidebar'});
    var $sidebarList = $('<ul>', {'class': 'sidebar__list'}).append($items);

    $sidebar.append($sidebarList);

    $body.append($sidebar);

    var pressEvent = ($('html').hasClass('touch')) ? 'touchstart' : 'click';

    $('.main-nav__button--hamburger').bind(pressEvent, function openSideBar(ev) {
      ev.preventDefault();
      $content.toggleClass('is-sidebar-shifted');
      $sidebar.toggleClass('is-open');
    });
  };

  $.fn.tgTabs = function () {
    return this.each(function () {
      var $el = $(this),
          $links = $el.find('.tabset__list a'),
          $contentPanes = $el.find('.tabset__pane');

      // Set aria attributes and initial state.
      $el.find('.tabset__list').attr('role', 'tablist');
      $links.each(function (i) {
        var id = $(this).attr('href').substring(1);
        $(this).attr('role', 'tab')
            .attr('aria-controls', $(this).attr('href').substring(1))
            .attr('id', id + '-tab');
        $(this).parent().attr('aria-selected', i === 0);
      });
      $contentPanes.each(function (i) {
        $(this).attr('role', 'tabpanel')
            .attr('aria-labelledby', $(this).attr('id') + '-tab')
            .attr('aria-hidden', i !== 0);
      });

      $links.click(function (e) {
        var $li = $(this).parent(),
            selector = $(this).attr('href');
        e.preventDefault();
        $li.attr('aria-selected', true);
        $li.siblings().attr('aria-selected', false);
        $contentPanes.not(selector).attr('aria-hidden', true);
        $(selector).attr('aria-hidden', false);
        // Force redraw to fix IE issue with CSS counter on hidden element.
        $contentPanes.toggleClass('ie-fix');
      });
    });
  };

  // Check if element is on screen.
  $.fn.isOnScreen = function () {
    var viewport = {
      top: $window.scrollTop(),
      left: $window.scrollLeft()
    };
    viewport.right = viewport.left + Drupal.windowSize.width;
    viewport.bottom = viewport.top + Drupal.windowSize.height;

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
  };

  // These functions are taken from gpt.js. gpt.js lives in the head of the
  // page but jQuery isn't loaded at that point. We override the
  // Drupal.GPT.wait function now when jQuery is available.
  function listenerCount(domEl, listener) {
    if (typeof $._data(domEl, 'events')[listener] === 'undefined') {
      return 0;
    }

    return $._data(domEl, 'events')[listener].length;
  }

  Drupal.GPT.wait = function (timeout, domEl, eventName, args, action) {
    var count = listenerCount(domEl, eventName);
    // If no listeners are bound, execute the action now.
    if (count === 0) {
      action();
      return;
    }

    // Set a timeout which upon completion will execute the action and prevent
    // the done callback from executing the action.
    var delay = setTimeout(function () {
      count = 0;
      action();
    }, timeout);

    // Create a done function which will execute the action when all listeners
    // have responded and clear the timeout.
    var done = function () {
      count--;
      if (count === 0) {
        clearTimeout(delay);
        action();
      }
    };

    // Prepend the args with done so that listeners can respond.
    args.unshift(done);

    $(domEl).trigger(eventName, args);
  };

  // We also need to monkey patch the refreshSlots function to call a clear()
  // before refresh(). Otherwise the adverts will reuse the iframe and this
  // will cause some adverts to break.
  Drupal.GPT.refreshSlots = function (slots) {
    if (typeof slots === 'undefined') {
      slots = null;
    }
    // Miliseconds to wait for third parties to finish their work.
    var maxDelay = 500;

    // Note debouncing may be desired here.
    window.googletag.cmd.push(function () {
      Drupal.GPT.wait(maxDelay, document, 'gptSlotsRefresh', [slots], function () {
        window.googletag.pubads().updateCorrelator();
        window.googletag.pubads().clear(slots);
        window.googletag.pubads().refresh(slots, {changeCorrelator: false});
      });
    });
  };

  $.fn.bindFirst = function (name, fn) {
    // Bind as you normally would.
    // Don't want to miss out on any jQuery magic.
    this.on(name, fn);

    // Thanks to a comment by @Martin, adding support for
    // namespaced events too.
    this.each(function () {
      var handlers = $._data(this, 'events')[name.split('.')[0]];
      // Take out the handler we just inserted from the end.
      var handler = handlers.pop();
      // Move it at the beginning.
      handlers.splice(0, 0, handler);
    });
  };

  // Store UTM source in cookie to use for ad targeting.
  var matches = window.location.href.match(/utm_source=([^&]+)(&|$)/);
  if (matches && matches[1]) {
    $.cookie('utm_source', matches[1]);
  }

  // Checks if an element is in view.
  $.fn.isScrolledIntoView = function (elem) {
    if (elem.length) {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();

      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(elem).height();

      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
  };
  
}(jQuery));
;/**/
/**
 * @file
 */

(function ($) {
  'use strict';

  var $window = $(window),
    $body = $('body');

  // Ads are expecting $ in scope.
  window.$ = $;

  Drupal.behaviors.tgMainNav = {
    attach: function (context) {
      $('.main-nav__button--hamburger', context)
        .once('tg-main-nav', function () {
          $('#main-menu-links').tgSideBar();
        });
    }
  };

  // For some reason this variable doesn't update when placed within the behaviour.
  var loadMoreSubmitType;

  Drupal.behaviors.loadMoreFocus = {
    // Focus on the first new result when Views Load More is triggered.
    attach: function (context) {
      $('.pager-load-more a', context)
        .once('load-more-focus')
        .bind('mousedown keydown', function (e) {
          // Detect if mouse or keyboard.
          loadMoreSubmitType = e.type;
        });
      $body.once('load-more-focus', function () {
        $window.bind('views_load_more.new_content', function (e) {
          if (loadMoreSubmitType === 'keydown') {
            setTimeout(function () {
              $(e.target).find('.l-content-grid:last a:first').focus();
            }, 50);
          }
        });
      });
    }
  };

  Drupal.behaviors.tgDerivativeList = {
    attach: function (context) {
      $('.derivative-list', context).once('derivative-list').tgDerivativeList();
    }
  };

  Drupal.behaviors.tgAccordion = {
    attach: function (context) {
      $('.accordion', context).once('accordion').tgAccordion();
    }
  };

  Drupal.behaviors.tgStickyTitles = {
    attach: function () {
      // Skip this if not on small screen.
      if (Drupal.windowSize.width >= 768) {
        return;
      }

      $('.page-cars-hub').once('sticky-titles', function () {
        var $titles = $('.sticky-title'),
          $titleBars = $titles.clone().addClass('sticky-title-bar'),
          titleHeight = 45,
          navHeight = 56,
          stickTop = false,
          stickBottom = true;

        $titleBars.addClass('is-hidden');
        $(this).append($titleBars);

        $titleBars.each(function (i, element) {
          $(element).bind('click touchend', function () {
            var elementTop = $titles.eq(i).offset().top - navHeight;
            if (stickTop) {
              elementTop -= i * titleHeight;
            }
            $('html, body').animate({scrollTop: elementTop}, 200);
          });
        });

        function checkPosititon() {
          var windowTop = $window.scrollTop(),
            windowBottom = windowTop + Drupal.windowSize.height,
            topElements = 0,
            bottomElements = 0;

          windowTop += navHeight;
          windowBottom -= titleHeight;

          $titleBars.addClass('is-hidden');

          if (stickTop) {
            $titleBars.each(function (i, element) {
              var elementTop = $titles.eq(i).offset().top;
              if (elementTop < windowTop) {
                $(element)
                  .removeClass('is-hidden')
                  .addClass('is-top')
                  .removeClass('is-bottom')
                  .css({
                    top: (navHeight + topElements * titleHeight) + 'px',
                    bottom: 'auto',
                  });
                windowTop += titleHeight;
                topElements++;
              }
            });
          }

          if (stickBottom) {
            $($titleBars.get().reverse()).each(function (i, element) {
              var elementTop = $titles.eq($titleBars.length - 1 - i)
                .offset().top;

              if (elementTop > windowBottom) {
                $(element)
                  .removeClass('is-hidden')
                  .addClass('is-bottom')
                  .removeClass('is-top')
                  .css({
                    bottom: (bottomElements) * titleHeight + 'px',
                    top: 'auto',
                  });
                windowBottom -= titleHeight;
                bottomElements++;
              }
            });
          }

        }

        $window.scroll(Drupal.debounce(checkPosititon, 16));
        checkPosititon();
      });
    }
  };

  Drupal.behaviors.tgWildcardReveal = {
    attach: function (context) {
      $('.wildcard', context).once('reveal', function () {
        var $wildcard = $(this);

        // Clone image for reveal purposes.
        var $wildcardRevealContainer = $wildcard.find('.wildcard__reveal-container');
        var $wildcardImage = $wildcard.find('.wildcard__image img').clone();

        $wildcardRevealContainer.prepend($('<div>', {'class': 'wildcard__reveal-image'})
          .append($wildcardImage));

        $wildcard.find('.wildcard__reveal-button').click(function () {
          $wildcard.addClass('is-revealed inverse');
        });
      });
    }
  };

  Drupal.behaviors.tgCarsCategoryNav = {
    // Initialise make / body style sliders using bxSlider plugin.
    attach: function (context) {

      if ($window.width() > 768) {
        $('.view-cars-manufacturers-nav', context)
          .once('bx-slider', function () {
            $(this).addClass('has-slider')
              .find('.view-content').bxSlider({
              slideWidth: 84,
              maxSlides: 15,
              pager: false,
              infiniteLoop: true,
            });
          });

        $('.view-cars-body-styles', context).once('bx-slider', function () {
          $(this).addClass('has-slider')
            .find('.view-content').bxSlider({
            slideWidth: 94,
            maxSlides: 15,
            pager: false,
            infiniteLoop: true,
          });
        });
      }
    }
  };

  Drupal.behaviors.tgCarouselMini = {
    // Initialise mini-carousels using bxSlider plugin.
    attach: function (context) {
      $('.carousel-mini', context).once('bx-slider', function () {
        var self = this,
          $slider = $('.carousel-mini__slides', this),
          $thumbs = $('.carousel-mini__thumb', this),
          $slides,
          $slideLinks;

        if ($('.carousel-mini__slide', this).length < 2) {
          return;
        }

        function setActiveSlide($slide, index) {
          // Make only links in current slide tabbable.
          $slideLinks.attr('tabindex', -1);
          $slide.find('a:not(.faux-block-link)').attr('tabindex', null);
          // Set aria state.
          $slides.attr('aria-selected', false);
          $slide.attr('aria-selected', true);

          // Set active thumb.
          $thumbs.removeClass('is-active').eq(index)
            .addClass('is-active');

          // Update counter.
          if ($thumbs.length === 0) {
            $(self).find('.carousel-mini__counter-current').text(index + 1);
          }
        }

        $slider.bxSlider({
          pager: false,
          infiniteLoop: true,
          onSliderLoad: function (currentIndex) {
            var moved = false;
            $slides = $('.carousel-mini__slide', self);
            $slideLinks = $('.carousel-mini__slide a', self);

            // Set aria roles.
            $slider.attr('role', 'listbox');
            $slides.attr('role', 'option');

            // Prevent clicks when dragging.
            $slideLinks.bind('touchstart', function () {
              moved = false;
            })
              .bind('touchmove', function () {
                moved = true;
              })
              .bind('click', function (e) {
                if (moved) {
                  e.preventDefault();
                }
              });

            // Tabbing to links within a slide tries to center focussed content
            // within bx-slider viewport due to use of overflow:hidden. Need to
            // put it back to original position on next frame.
            $slideLinks.focus(function () {
              setTimeout(function () {
                $('.bx-viewport', self).scrollLeft(0);
              }, 16);
            });

            // If there are no thumbs, add a "counter".
            if ($thumbs.length === 0) {
              var $counter = $('<div>', {
                'class': 'carousel-mini__counter'
              });

              $counter.append($('<span>', {
                'class': 'carousel-mini__counter-current'
              }).text(currentIndex + 1));

              $counter.append('/');

              $counter.append($('<span>', {
                'class': 'carousel-mini__counter-max'
              }).text($slider.getSlideCount()));

              $(self).append($counter);
            }

            setActiveSlide($('.carousel-mini__slide:eq(1)', self), 0);
          },
          onSlideBefore: function ($slide, oldIndex, newIndex) {
            setActiveSlide($slide, newIndex);
          }
        });

        $thumbs.click(function () {
          $slider.goToSlide($thumbs.index(this));
        })
          .eq(0).addClass('is-active');
      });
    }
  };

  Drupal.behaviors.tgBodyStyleTips = {
    // Initialise body style tips slider using bxSlider plugin.
    attach: function (context) {
      $('.body-style-tips__tips', context)
        .once('bx-slider').bxSlider({
        pager: true,
        infiniteLoop: false,
        hideControlOnEnd: true
      });
    }
  };

  Drupal.behaviors.tgPushCarousels = {
    attach: function (context) {
      var options = {
        pager: true,
        slideWidth: 222,
        slideMargin: 20,
        maxSlides: 15,
        infiniteLoop: true
      };

      var hubOptions = {
        pager: true,
        slideWidth: 222,
        slideMargin: 20,
        maxSlides: 3,
        infiniteLoop: true
      };

      $('.push-carousel--hub .push-carousel__slides', context)
        .once('bx-slide', function () {
            var slider;

            if (Drupal.windowSize.width < 1320) {
              slider = $(this).bxSlider(options);
              slider.type = 'normal';
            }
            else {
              slider = $(this).bxSlider(hubOptions);
              slider.type = 'hub';
            }

            $window.resize(Drupal.debounce(function () {
              if (slider.type === 'hub' && Drupal.windowSize.width < 1320) {
                slider.reloadSlider(options);
                slider.type = 'normal';
              }
              else {
                if (slider.type === 'normal' && Drupal.windowSize.width >= 1320) {
                  slider.reloadSlider(hubOptions);
                  slider.type = 'hub';
                }
              }
            }, 250));
          }
        );

      $('.push-carousel .push-carousel__slides', context)
        .once('bx-slide')
        .bxSlider(options);
    }
  };

  Drupal.behaviors.tgSubNav = {
    attach: function (context) {
      $('.sub-nav', context).once('nav-shift', function () {
        // We could use the native scrollIntoView() but we don't want vertical movement.
        var $active = $(this).find('li.active');
        if ($active.length > 0) {
          var left = $active.position().left;
          var element_width = $active.width();
          var width = $(this).width();

          // Check if the element is not visible.
          var delta = width - (left + element_width);

          if (delta < 0) {
            $(this).scrollLeft(-delta);
          }
        }
      });
    }
  };

  Drupal.behaviors.tgPartnerLinks = {
    attach: function (context) {
      $('.partner-links__link', context)
        .once('partner-links')
        .click(function (e) {
          Drupal.tgOpenPopup(this.href, $(this).text(), 570, 540);
          e.preventDefault();
        });
    }
  };

  Drupal.behaviors.tgFauxBlockLink = {
    attach: function (context) {
      $('.teaser', context).once('faux-block-link').tgFauxBlockLink({
        linkSelector: '.teaser__title a'
      });
      $('.push-item', context).once('faux-block-link').tgFauxBlockLink({
        linkSelector: '.push-item__title a'
      });
      $('.slide-mini', context).once('faux-block-link').tgFauxBlockLink({
        linkSelector: '.slide-mini__title a'
      });
      $('.tg-international__item', context)
        .once('faux-block-link')
        .tgFauxBlockLink({
          linkSelector: '.tg-international__title a'
        });
      $('.videos-carousel-slide', context)
        .once('faux-block-link')
        .tgFauxBlockLink({
          linkSelector: '.videos-carousel-slide__title a'
        });
      $('.product-promo__product', context)
        .once('faux-block-link')
        .tgFauxBlockLink({
          linkSelector: '.product-promo__product-name a'
        });
    }
  };

  Drupal.behaviors.tgSubNavigation = {
    attach: function (context) {
      $('.sub-nav', context).once('sub-nav').tgSubnavNavigation();
    }
  };

  Drupal.behaviors.tgVideoPlaylist = {
    attach: function (context) {
      $('.video-playlist', context).once('playlist-handler').tgVideoPlaylist();
    }
  };

  Drupal.behaviors.tgVideoPlaylistToggle = {
    attach: function (context) {
      if (Drupal.windowSize.width < '479') {
        $('.video-playlist__playlist', context).hide();
        var playlist = $('.video-playlist__playlist', context).detach();
        var controlText = '<span class="video-playlist__control">View all </span>';
        $(playlist, context).appendTo('.video-playlist');
        $('.video-playlist__title', context).before(controlText);

        if($('.section-future').length) {
          // For future hub show the playlist on page load.
          $('.video-playlist__items').show();
          $('.video-playlist__control').hide();
          $('.video-playlist__counter').show();
        } else {
          $('.video-playlist__items').hide();
          $('.video-playlist__counter').hide();
        }

        $('.video-playlist__playlist').show();

        $('.video-playlist__title, .video-playlist__control')
          .click(function () {
            $('.video-playlist__items', context).slideToggle(400, function () {
              var visible = $('.video-playlist__items').is(':visible');
              if (visible) {
                $('.video-playlist__control').hide();
                $('.video-playlist__counter').show();
              }
              else {
                $('.video-playlist__counter').hide();
                $('.video-playlist__control').show();
              }
            });
          }, );
      }
    }
  };

  Drupal.behaviors.tgReadMore = {
    attach: function (context) {
      $('.read-more', context).once('read-more', function () {
        $(this).find('.read-more__inner').tgReadMore();
      });
    }
  };

  Drupal.behaviors.tgShareLinks = {
    attach: function (context) {
      // Configure ZeroClipboard for share links.
      window.ZeroClipboard.config({
        swfPath: '/sites/all/themes/custom/tg/libraries/zeroclipboard/dist/ZeroClipboard.swf'
      });

      $('.sharebar', context).once('sharebar', function () {
        var $this = $(this),
          client = new window.ZeroClipboard($this.find('.sharebar__item--copy-link > a'));

        client.on('ready', function () {
          client.on('copy', function (e) {
            e.clipboardData.setData('text/plain', document.location.href);
          });

          client.on('aftercopy', function () {
            $this.find('.sharebar__item--copy-link').tgTooltip({
              text: Drupal.t('Link copied to clipboard'),
              visibleClass: 'is-visible--fancy',
              width: 80
            });
          });
        });

        $('.sharebar__item > a', this).click(function (e) {
          if ($(this).parent().hasClass('sharebar__item--copy-link')) {
            e.preventDefault();
          }
          else {
            if (this.protocol === 'http:' || this.protocol === 'https:') {
              e.preventDefault();
              Drupal.tgOpenPopup(this.href, false, 510, 320);
            }
          }
        });
      });
    }
  };

  Drupal.behaviors.tgShareLinksToggle = {
    attach: function (context) {

      $('.post-info__share', context).once('share-links-toggle', function () {

        var $this = $(this),
          $toggleBtn = $('<button class="post-info__share-toggle" tabindex="-1" type="button"><span class="element-invisible">' + Drupal.t('Show/hide') + '</span></button>'),
          isMenuOpen = false;

        function menuExpand() {
          $this.addClass('is-expanded');
          isMenuOpen = true;
          $body.bind('focusin', otherLinksFocus);
        }

        function menuContract() {
          $this.removeClass('is-expanded');
          isMenuOpen = false;
          $body.unbind('focusin', otherLinksFocus);
        }

        $this.append($toggleBtn);

        $toggleBtn.click(function () {
          if (isMenuOpen === false) {
            menuExpand();
          }
          else {
            menuContract();
          }
        });

        // Expand the social links menu when its links have focus if navigating with the keyboard.
        function keyboardNavFocus() {
          // Timeout required for .keyboard-focus or :focus.
          setTimeout(function () {
            if ($this.find('.keyboard-focus').length) {
              menuExpand();
            }
          }, 10);
        }

        $this.focusin(keyboardNavFocus);

        // Close the social links menu when other links on the page have focus.
        function otherLinksFocus(e) {
          var $target = $(e.target);
          if ($target.parents('.post-info__share').length === 0 && !$target.hasClass('post-info__share')) {
            menuContract();
          }
        }

        // If social links are opened without keyboard navigation then move the
        // focus so the menu doenst open when the pop up is closed.
        $this.find('a').click(function () {
          if (!$(this).hasClass('keyboard-focus')) {
            // Setting 'tabindex' to -1 takes an element out of normal
            // tab flow but allows it to be focused via javascript
            $this.attr('tabindex', -1).focus(); // focus on the content container.
          }
        });

      });

    }
  };

  Drupal.behaviors.tgBigRead = {
    attach: function (context) {
      $('.node--big-read, .node--magazine-subscription', context).once('main-image-load', function () {
        var $self = $(this);
        var $image = $self.find('.big-read__top img');
        var $window = $(window);
        var animatableElements = [
          '.pull-quote',
          '.big-read__square-image',
          '.big-read__side-image'
        ];

        $image.addClass('is-loading');

        $image.load(function () {
          $image.addClass('is-loaded');
        }).each(function () {
          if (this.complete) {
            $(this).load();
          }
        });

        var $animatableElements = $self.find(animatableElements.join(','));

        var scrollHandler = Drupal.debounce(function debouncedBigReadScrollHandler() {
          var st = $window.scrollTop();

          $animatableElements.each(function () {
            var $el = $(this);
            if ($el.offset().top + $el.height() < st + Drupal.windowSize.height) {
              $el.addClass('is-reached');
            }
            else {
              if ($el.offset().top >= st + Drupal.windowSize.height) {
                $el.removeClass('is-reached');
              }
            }
          });
        }, 17);

        $window.scroll(scrollHandler);
      });
    }
  };

  Drupal.behaviors.tgBigReadParallax = {
    attach: function (context) {
      var $window = $(window);
      $('.big-read__parallax-container', context).once('parralax', function () {
        var headerHeight = 45,
          $self = $(this),
          $content = $self.find('.big-read__parallax'),
          $image = $self.find('img');

        function update() {
          var scroll = window.scrollY,
            imageHeight = $image.height(),
            height = $self.parent().height(),

            // Top and bottom offset of image container.
            top = $self.parent().offset().top,
            bottom = top + height,

            // Scroll boundaries where any part of container is in view.
            minInView = top - Drupal.windowSize.height,
            maxInView = bottom - headerHeight,

            // Scroll boundaries where whole of container is visible.
            // minVisible =  minInView + height,
            // maxVisible =  bottom - height - headerHeight,.
            // Pixel value to offset image so that it is top aligned with the container.
            maxOffset = imageHeight - height,
            // maxOffset = height,.
            // Calculate scroll progress from minVisible to maxVisible.
            scrollProgress = 1 - (scroll - minInView) / (maxInView - minInView),

            // Use scrollProgress as a multiplier to calculate current target offset.
            offset = -Math.round(scrollProgress * maxOffset) + 'px';

          if (scroll >= minInView && scroll <= maxInView) {
            // Apply offset using available CSS properties.
            if (window.Modernizr.csstransforms3d) {
              $content[0].style[window.Modernizr.prefixed('transform')] = 'translate3d(0, ' + offset + ', 0)';
            }
            else {
              if (window.Modernizr.csstransforms) {
                $content[0].style[window.Modernizr.prefixed('transform')] = 'translateY(' + offset + ')';
              }
              else {
                $content[0].style.top = offset;
              }
            }
          }
        }

        $window.scroll(function () {
          requestAnimationFrame(update);
        });

        $window.resize(function () {
          requestAnimationFrame(update);
        });

        $image.load(update).each(function () {
          if (this.complete) {
            update();
          }
        });
      });
    }
  };

  /**
   * JS related to the tabs in the Panels tabs.
   */
  Drupal.behaviors.tgPanelsTabs = {
    attach: function (context) {
      if (Drupal.settings.panelsTabs !== undefined) {
        var tabsID = Drupal.settings.panelsTabs.tabsID;
        for (var key in Drupal.settings.panelsTabs.tabsID) {
          if (Drupal.settings.panelsTabs.tabsID.hasOwnProperty(key)) {
            $('#' + tabsID[key] + ':not(.tabs-processed)', context)
              .addClass('tabs-processed')
              .tgTabs();
          }
        }
      }
    }
  };

  Drupal.behaviors.tgEG = {
    attach: function () {
      var keys;
      var stig = false;
      $(document).keyup(function (e) {
        if (!stig && /113302022928$/.test(keys += [((e || window.self.event).keyCode - 37)])) {
          stig = true;
          var $stimg = $('<div>', {'class': 'easter-egg-stig'});
          var $head = $('<div>', {
            'class': 'easter-egg-stig__head',
            'data-dir': 'up'
          });

          $stimg.append($head);
          $('body').append($stimg);

          if ($('html').hasClass('csstransitions')) {
            setTimeout(function () {
              $stimg.addClass('is-visible');
            }, 0);
          }
          else {
            $stimg.animate({'bottom': '530px'}, 5000);
          }

          var lastDir = 'up';
          var clicks = 0;
          $stimg.click(function () {
            if (++clicks === 10) {
              $stimg.addClass('is-large');
            }
          });

          var mouseMove = Drupal.debounce(function (ev) {
            var dir = 'up';
            var x = ev.pageX;
            var y = ev.pageY - (window.scrollY || $(window).scrollTop());
            var w = Drupal.windowSize.width;
            var h = Drupal.windowSize.height;

            if (y / h > 0.75) {
              dir = 'down';
            }
            else {
              if (x / w < 1 / 3) {
                dir = 'left';
              }
              else {
                if (x / w > 2 / 3) {
                  dir = 'right';
                }
              }
            }

            if (lastDir !== dir) {
              $head.attr('data-dir', dir);
              lastDir = dir;
            }
          }, 16);

          $(window).mousemove(mouseMove);
        }
      });
    }
  };

  Drupal.behaviors.tgShowForm = {
    attach: function (context) {
      $('.show-form', context).once('show-form', function () {
        var $series = $('#edit-series'),
          $episodes = $('#edit-episode'),

          updateOptions = function () {
            var tid = $series.val(),
              options = '',
              episodes;

            if (tid) {
              episodes = Drupal.settings.tgShow.episodes['s' + tid];
              for (var i in episodes) {
                if (episodes.hasOwnProperty(i)) {
                  options += '<option value="' + episodes[i].value + '">' + episodes[i].label + '</option>';
                }
              }
              $episodes.attr('disabled', false);
            }
            else {
              options += '<option value="">' + Drupal.t('All episodes…') + '</option>';
              $episodes.attr('disabled', true);
            }

            $episodes.html(options);
          };

        $series.change(updateOptions);
        updateOptions();

        // Navigate to URL in option value.
        $(this).submit(function (e) {
          e.preventDefault();
          if ($episodes.val()) {
            window.location.href = $episodes.val();
          }
        });
      });
    }
  };

  Drupal.behaviors.tgHeaderFixed = {
    attach: function (context) {
      $('.header', context).once('tg-header-fixed', function () {
        var $this = $(this),
          fixed = false,
          HEADER_HEIGHT = 154;

        function checkScroll() {
          var scrolledPast = ($window.scrollTop() > HEADER_HEIGHT);
          if (!fixed && scrolledPast) {
            fixed = true;
            $this.addClass('is-fixed');
          }
          else {
            if (fixed && !scrolledPast) {
              fixed = false;
              if (!$('.node-type-cars-car')[0]) {
                $this.removeClass('is-fixed');
              }
            }
          }
        }

        // Big Read pages have a class to make header always in fixed (compact) state.
        // Nav is always fixed on small screen too.
        if (!$this.hasClass('is-always-fixed') && Drupal.windowSize.width >= 1000) {
          $window.scroll(Drupal.debounce(checkScroll, 12));
          checkScroll();
        }
      });
    }
  };

  Drupal.behaviors.tgHeaderToggle = {
    attach: function (context) {
      $('.header__toggle', context).once('tg-header-toggle', function () {
        var $this = $(this),
          $target = $('#' + $this.attr('aria-controls')),
          isOpen = false;

        function open() {
          isOpen = true;
          $this.attr('aria-expanded', true);
          $target.addClass('is-visible');
          $(document).bind('mousedown touchstart', checkTarget);
          $target.find('.form-text').focus();
        }

        function close() {
          isOpen = false;
          $this.attr('aria-expanded', false);
          $target.removeClass('is-visible');
          $(document).unbind('mousedown touchstart', checkTarget);
        }

        // Close if user clicks outside.
        function checkTarget(e) {
          if (e.target !== $this[0] && e.target !== $target[0] && !$.contains($this[0], e.target) && !$.contains($target[0], e.target)) {
            close();
          }
        }

        $this.bind('click touchstart', function (e) {
          e.preventDefault();
          if (isOpen) {
            close();
          }
          else {
            open();
          }
        });

      });
    }
  };

  Drupal.behaviors.tgListiclePager = {
    attach: function (context) {
      $('.listicle-list--gallery', context).once('listicle-pager', function () {
        var $this = $(this),
          $slides = $this.find('.listicle-list__item'),
          $ads = $this.find('.listicle-list__ad'),
          reversed = $this.hasClass('listicle-list--reversed'),
          currentPage,
          initialized = false,

          $imagePager = $('<div class="listicle-image-pager">'),
          $imageControls = $('<div class="listicle-image-pager__controls">'),
          $imagePrev = $('<button class="listicle-image-pager__btn listicle-image-pager__btn--prev"><i class="icon-arrow-thin-left"></i><span class="element-invisible">' + Drupal.t('Previous') + '</span></button>'),
          $imageNext = $('<button class="listicle-image-pager__btn listicle-image-pager__btn--next"><i class="icon-arrow-thin-right"></i><span class="element-invisible">' + Drupal.t('Next') + '</span></button>'),

          // Create UI elements.
          $controls = $('<div class="listicle-pager">'),
          $prev = $('<button class="btn listicle-pager__btn" type="button">' + Drupal.t('Previous') + '</button>'),
          $next = $('<button class="btn listicle-pager__btn" type="button">' + Drupal.t('Next') + '</button>'),
          $current = $('<span class="listicle-pager__current">1</span>'),
          $total = $('<span class="listicle-pager__total">' + $slides.length + '</span>'),
          $counter = $('<span class="listicle-pager__count">/</span>');

        function init() {
          // Assemble UI elements.
          $counter.prepend($current)
            .append($total);
          $controls.append($prev)
            .append($counter)
            .append($next);
          $this.after($controls);

          $imagePager.append($imageControls);
          $imageControls.append($imagePrev)
            .append($imageNext);
          $('.listicle-list').before($imagePager);

          // Move ads.
          $controls.after($ads.eq(0).children());
          $('.comments').after($ads.eq(1).children());
          $ads.remove();

          $prev.add($imagePrev).click(prev);
          $next.add($imageNext).click(next);

          $window.bind('hashchange', function () {
            var hash = getHash();
            if (currentPage !== hash) {
              goto(hash);
              track();
            }
          });

          currentPage = getHash();

          update();
        }

        function track() {
          if (window.ga !== undefined) {
            window.ga('send', 'pageview', {
              'page': window.location.pathname + window.location.search + window.location.hash
            });
          }
        }

        function getHash() {
          var hash = window.location.hash.substring(1);
          if (hash) {
            return hash - 1;
          }
          else {
            return 0;
          }
        }

        function goto(index) {
          currentPage = index;
          update();
        }

        function next() {
          currentPage++;
          if (currentPage >= $slides.length) {
            currentPage = 0;
          }
          $next.blur();
          update();
          track();
        }

        function prev() {
          currentPage--;
          if (currentPage < 0) {
            currentPage = $slides.length - 1;
          }
          $prev.blur();
          update();
          track();
        }

        function update() {
          $current.text(currentPage + 1);
          $slides.addClass('is-hidden');
          $slides.eq(currentPage).removeClass('is-hidden');

          if (reversed) {
            $this.css('counter-reset', 'listicle ' + ($slides.length - currentPage + 1));
          }
          else {
            $this.css('counter-reset', 'listicle ' + currentPage);
          }

          window.location.hash = currentPage + 1;

          // Don't refresh or scroll on page load!
          if (initialized) {
            $window.scrollTop(Drupal.windowSize.width > 1000 ? 160 : 0);
            Drupal.GPT.refreshSlots();
          }
          initialized = true;
        }

        init();
      });

      // Add class to pager if on a sponsored listicle.
      if ($('.listicle--sponsored').length > 0) {
        $('.listicle-pager').addClass('listicle-pager--sponsored');
      }
    }
  };

  Drupal.behaviors.tgStickyLeader = {
    attach: function (context) {
      // Only apply to smaller resolution screens.
      if (Drupal.windowSize.width < 1000) {
        $('.block--ad-manager-top-slot', context)
            .once('sticky-leader', function () {
              var $content,
                  firstTop,
                  hide = false,
                  // Tolerance for showing/hiding the banner from top of the
                  // page.
                  scrollTolerance = 100,
                  // Excess to decide when to show/hide the banner.
                  scrollExcess = 600;

              function checkPosition() {
                var currentScroll = $window.scrollTop();
                var mpuInView = currentScroll + scrollExcess >= firstTop && currentScroll >= scrollTolerance;

                if (hide !== mpuInView) {
                  hide = mpuInView;
                  $content.toggleClass('is-scrolled-past', hide);

                  // If a sponsored header is present, move this with the
                  // header ad.
                  if ($('.sponsored-header-bar').length > 0) {
                    $('.sponsored-header-bar').toggleClass('is-scrolled-past', hide);
                    $('.sponsored-header-bar').toggleClass('is-sticky', hide);
                  }
                }
              }

              if (Drupal.windowSize.width < scrollExcess) {
                $content = $(this).find('.block__content');
                firstTop = $('.ad--mpu').eq(0).offset().top;
                $window.scroll(Drupal.debounce(checkPosition, 16));
                checkPosition();
              }
            });

      }
    }
  };

  /*
   * Move focus to the main content area when the "Skip to main content" link is followed.
   * https://www.bignerdranch.com/blog/web-accessibility-skip-navigation-links/
   */
  Drupal.behaviors.jumpToCont = {
    attach: function (context) {

      // Bind a click event to the 'skip' link.
      $('.header__jump-to-cont', context)
        .once('jump-to-cont')
        .click(function (e) {

          e.preventDefault();

          var HEADER_HEIGHT = 45;
          var $mainContent = $('#main-content');
          var top = $mainContent.offset().top - HEADER_HEIGHT;

          // Setting 'tabindex' to -1 takes an element out of normal
          // tab flow but allows it to be focused via javascript.
          $mainContent.attr('tabindex', -1).on('blur focusout', function () {

            // When focus leaves this element,
            // remove the tabindex attribute.
            $(this).removeAttr('tabindex');

          }).focus(); // Focus on the content container.

          $window.scrollTop(top);

        });

    }
  };

  /*
   * Sponsored Header Bar
   */
  Drupal.behaviors.sponsoredHeaderBar = {
    attach: function (context) {
      // Sticky sponsored header bar.
      $('.sponsored-header-bar', context).once('sticky-leader', function () {
        var $content,
            sticky = false;

        function checkScroll() {
          var currentScroll = $window.scrollTop();
          var topAdHeight = $('.block--ad-manager-top-slot').outerHeight();
          var topNavHeight = ($('.header .header__inner').outerHeight() + 7);
          var headerBarHitTop = (currentScroll >= ((topAdHeight + $content.outerHeight()) - topNavHeight));
          var sponsoredHeaderBar = $('.sponsored-header-bar').outerHeight() - topNavHeight;
          var article_scroll;

          if ($('#article-scroll').length > 0) {
              article_scroll = $('#article-scroll').offset().top;
          }

          if ($content.parent().hasClass('big-read')) {
            $content.toggleClass('is-big-read', true);
            $content.toggleClass('is-sticky', false);

            if (currentScroll >= $content.position().top) {
              sticky = headerBarHitTop;
              $content.toggleClass('is-sticky', sticky);
            }
          }
          else {
            if (Drupal.windowSize.width < 1000) {
              // Apply to tablets only.
              if (sticky !== headerBarHitTop && Drupal.windowSize.width > 700) {
                $('.sponsored-header-bar').css('position', 'relative');
                sticky = headerBarHitTop;
                $content.toggleClass('is-sticky', sticky);
              }

              // If an article scroll div is hit.
              if (article_scroll <= (currentScroll + sponsoredHeaderBar)) {
                $content.toggleClass('is-article-scroll-visible', true);
              }
              else {
                $content.toggleClass('is-article-scroll-visible', false);
              }
            }
          }
        }

        // Sponsored header bar behaviour.
        $content = $(this);
        $window.scroll(Drupal.debounce(checkScroll, 16));
        checkScroll();
      });
    }
  };

  /*
   * Zebra striping classes for Video Hub panel panes.
   */
  Drupal.behaviors.videosHubZebraStriping = {
    attach: function (context) {
      if (Drupal.windowSize.width < 1000) {
        $('.video-promo .l-content-inner .panel-pane', context)
          .each(function (index) {
            // Skip the video search section on mobile.
            if (index > 0) {
              $(this)
                .addClass(index % 2 ? 'video-promo-box--even' : 'video-promo-box--odd');
            }
          });
      }
      else {
        $('.video-promo .l-content-inner .pane-videos-carousel-collection-tag-pane-v2', context)
          .each(function (index) {
            $(this)
              .addClass(index % 2 ? 'video-promo-box--odd' : 'video-promo-box--even');
          });
      }
    }
  };

  Drupal.behaviors.singleVideosPagePlaylistToogle = {
    attach: function (context) {
      var left_height = $('.video-page__left').height();
      $('.video-page__right').css('height', left_height);
      $('.video-playlist__show-more', context).click(function () {
        if ($(this).hasClass('video-playlist__show-more--slide-down')) {
          $('.node--videos-video--full .video-page__right--inner')
            .animate({top: '0px'}, 20);
          $('.video-playlist__item--single-video-page')
            .animate({height: '100%'}, 20);
          $(this)
            .addClass('video-playlist__show-more--slide-up video-playlist__show-less--text');
          $(this)
            .removeClass('video-playlist__show-more--slide-down video-playlist__show-more--text');
          $('.video-playlist__show-less--text').text('Show less');
        }
        else {
          $('.node--videos-video--full .video-page__right--inner')
            .animate({top: '-550px'}, 20);
          $('.video-playlist__item--single-video-page')
            .animate({height: '182px'}, 20);
          $(this)
            .addClass('video-playlist__show-more--slide-down video-playlist__show-more--text');
          $(this)
            .removeClass('video-playlist__show-more--slide-up video-playlist__show-less--text');
          $('.video-playlist__show-more--text').text('Show more');
        }
      });
      $(window).resize(function () {
        if (Drupal.windowSize.width < 1000) {
          $('.video-playlist__item--single-video-page').css('height', '92%');
        }
        else {
          if ($('.video-playlist__show-more')
              .hasClass('video-playlist__show-more--slide-down')) {
            $('.video-playlist__item--single-video-page')
              .css('height', '182px');
          }
          else {
            if ($('.video-playlist__show-more')
                .hasClass('video-playlist__show-more--slide-up')) {
              $('.video-playlist__item--single-video-page')
                .css('height', '100%');
            }
          }
        }
      });
    }
  };

  Drupal.behaviors.carsSubnavSticky = {
    attach: function (context) {
      var nav = $('.cars-subnav');
      var scroll_class = 'cars-subnav--scrolled';

      $(window, context).scroll(function () {
        if ($(this).scrollTop() > 100) {
          nav.addClass(scroll_class);
        }
        else {
          nav.removeClass(scroll_class);
        }
      });

      if ($('.view-mode-tab_4')[0] || $('.view-mode-tab_5')[0]) {
        $('.cars-subnav').scrollLeft(500);
      }
      else {
        if ($('.view-mode-tab_3')[0]) {
          $('.cars-subnav').scrollLeft(100);
        }
        else {
          if ($('.view-mode-tab_2')[0]) {
            $('.cars-subnav').scrollLeft(68);
          }
        }
      }
    }
  };

  Drupal.behaviors.carsMainNav = {
    attach: function () {
      if ($('.node-type-cars-car')[0]) {
        $('.header').addClass('is-fixed');
        $('.main-nav__item--reviews').addClass('active-trail');
      }
    }
  };

  function tgGetParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  Drupal.behaviors.tgUnderSlideAd = {
    attach: function (context) {
      // Create div for ad ad slot.
      $('.l-region--before-footer', context).after('<div class= "ad ad--footer underslide-ad" id="ad-manager-ad-footer"></div>');
      $(".l-region--before-footer", context).once('ad-footer', function () {
        // Define ad slot.
        googletag.cmd.push(function () {
          Drupal.underSlideAdSlot = googletag.defineSlot(Drupal.GPT.unitPath(), [7, 7], 'ad-manager-ad-footer')
              .setTargeting("pos", ["footer"])
              .addService(googletag.pubads());
        });
      });

      $(window).scroll(function () {
        if ($(this).isScrolledIntoView('.block--ad-manager-top-slot') === false) {
          $('.underslide-ad').show('slow');
          $(".l-region--leader", context).once('ad-manager-top-slot-processed', function () {
            // Lazyload ad slot.
            googletag.pubads().refresh([Drupal.underSlideAdSlot]);
          })
        }
        else {
          $('.underslide-ad').hide('slow');
        }
      })
    }
  }

  Drupal.behaviors.abTestResurfacing = {
    attach: function (context) {
      if (Drupal.windowSize.width < 426) {
        var query = tgGetParameterByName('tgAB');
        var subscriptionUrl = 'https://www.buysubscriptions.com/print/bbc-top-gear-magazine-subscription?&contenttype=content';
        var pathname = tgGetParameterByName('tgABurl') || 'car-news/british/hooray-its-been-record-year-britains-car-industry';
        $(window).bind('load', function () {
          // Depending on the value of tgAB a different test is run. 1 removes some outbrain items,
          // 2 removes all related content block 3 removes releated content and outbrain.
          if (window.location.pathname !== '/' + pathname && (query === '1' || query === '2' || query === '3')) {
            $('.read-more__button-container .btn').trigger('click');
            $.get('/' + pathname, function (data) {
              var posts = $(data).filter('main');
              $('main', context).after(posts);
              $('.l-page-header:eq(1)')
                .after('<a href=' + subscriptionUrl + '><div class=\'ab-test__leaderboard\'>  </div></a>');
              $('div', context).removeClass('read-more__inner');
              $('.view-display-id-inline', context).hide();
              $('.meta-section', context).hide();

              if (query === '2') {
                $('.view-id-related_content', context).hide();
              }

              $('.block-ad-manager-mpu-premium-1-narrow:eq(1)').hide();
              $('.block--ad-manager-mpu-premium-2-narrow:eq(1)').hide();
              $('main .ob-dynamic-rec-container:eq(1)').hide();
              $('main .ob-dynamic-rec-container:eq(2)').hide();
              $('main .ob-dynamic-rec-container:eq(3)').hide();
              $('main:eq(1)')
                .css({
                  'border-top': 'lightgrey 1px solid',
                  'padding-top': '28px'
                });
              $('.l-content-inner:eq(1)')
                .after('<a href=' + subscriptionUrl + '><div class=\'ab-test__mpu\'>  </div></a>');
              $('.l-region--sidebar-second:first').hide();
              $('.l-page-header:eq(1)').hide();

              if (query === '3') {
                $('.view-id-related_content', context).hide();
                $('#block-outbrain-integration-outbrain-integration-external', context)
                  .hide();
              }

            });
          }
        });
      }
    }
  };

})(jQuery);
;/**/
/**
 * bxSlider v4.2.1d
 * Copyright 2013-2017 Steven Wanderski
 * Written while drinking Belgian ales and listening to jazz
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

;(function($) {

  var defaults = {

    // GENERAL
    mode: 'horizontal',
    slideSelector: '',
    infiniteLoop: true,
    hideControlOnEnd: false,
    speed: 500,
    easing: null,
    slideMargin: 0,
    startSlide: 0,
    randomStart: false,
    captions: false,
    ticker: false,
    tickerHover: false,
    adaptiveHeight: false,
    adaptiveHeightSpeed: 500,
    video: false,
    useCSS: true,
    preloadImages: 'visible',
    responsive: true,
    slideZIndex: 50,
    wrapperClass: 'bx-wrapper',

    // TOUCH
    touchEnabled: true,
    swipeThreshold: 50,
    oneToOneTouch: true,
    preventDefaultSwipeX: true,
    preventDefaultSwipeY: false,

    // ACCESSIBILITY
    ariaLive: true,
    ariaHidden: true,

    // KEYBOARD
    keyboardEnabled: false,

    // PAGER
    pager: true,
    pagerType: 'full',
    pagerShortSeparator: ' / ',
    pagerSelector: null,
    buildPager: null,
    pagerCustom: null,

    // CONTROLS
    controls: true,
    nextText: 'Next',
    prevText: 'Prev',
    nextSelector: null,
    prevSelector: null,
    autoControls: false,
    startText: 'Start',
    stopText: 'Stop',
    autoControlsCombine: false,
    autoControlsSelector: null,

    // AUTO
    auto: false,
    pause: 4000,
    autoStart: true,
    autoDirection: 'next',
    stopAutoOnClick: false,
    autoHover: false,
    autoDelay: 0,
    autoSlideForOnePage: false,

    // CAROUSEL
    minSlides: 1,
    maxSlides: 1,
    moveSlides: 0,
    slideWidth: 0,
    shrinkItems: false,

    // CALLBACKS
    onSliderLoad: function() { return true; },
    onSlideBefore: function() { return true; },
    onSlideAfter: function() { return true; },
    onSlideNext: function() { return true; },
    onSlidePrev: function() { return true; },
    onSliderResize: function() { return true; },
	onAutoChange: function() { return true; } //calls when auto slides starts and stops
  };

  $.fn.bxSlider = function(options) {

    if (this.length === 0) {
      return this;
    }

    // support multiple elements
    if (this.length > 1) {
      this.each(function() {
        $(this).bxSlider(options);
      });
      return this;
    }

    // create a namespace to be used throughout the plugin
    var slider = {},
    // set a reference to our slider element
    el = this,
    // get the original window dimens (thanks a lot IE)
    windowWidth = $(window).width(),
    windowHeight = $(window).height();

    // Return if slider is already initialized
    if ($(el).data('bxSlider')) { return; }

    /**
     * ===================================================================================
     * = PRIVATE FUNCTIONS
     * ===================================================================================
     */

    /**
     * Initializes namespace settings to be used throughout plugin
     */
    var init = function() {
      // Return if slider is already initialized
      if ($(el).data('bxSlider')) { return; }
      // merge user-supplied options with the defaults
      slider.settings = $.extend({}, defaults, options);
      // parse slideWidth setting
      slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
      // store the original children
      slider.children = el.children(slider.settings.slideSelector);
      // check if actual number of slides is less than minSlides / maxSlides
      if (slider.children.length < slider.settings.minSlides) { slider.settings.minSlides = slider.children.length; }
      if (slider.children.length < slider.settings.maxSlides) { slider.settings.maxSlides = slider.children.length; }
      // if random start, set the startSlide setting to random number
      if (slider.settings.randomStart) { slider.settings.startSlide = Math.floor(Math.random() * slider.children.length); }
      // store active slide information
      slider.active = { index: slider.settings.startSlide };
      // store if the slider is in carousel mode (displaying / moving multiple slides)
      slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
      // if carousel, force preloadImages = 'all'
      if (slider.carousel) { slider.settings.preloadImages = 'all'; }
      // calculate the min / max width thresholds based on min / max number of slides
      // used to setup and update carousel slides dimensions
      slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
      slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
      // store the current state of the slider (if currently animating, working is true)
      slider.working = false;
      // initialize the controls object
      slider.controls = {};
      // initialize an auto interval
      slider.interval = null;
      // determine which property to use for transitions
      slider.animProp = slider.settings.mode === 'vertical' ? 'top' : 'left';
      // determine if hardware acceleration can be used
      slider.usingCSS = slider.settings.useCSS && slider.settings.mode !== 'fade' && (function() {
        // create our test div element
        var div = document.createElement('div'),
        // css transition properties
        props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
        // test for each property
        for (var i = 0; i < props.length; i++) {
          if (div.style[props[i]] !== undefined) {
            slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
            slider.animProp = '-' + slider.cssPrefix + '-transform';
            return true;
          }
        }
        return false;
      }());
      // if vertical mode always make maxSlides and minSlides equal
      if (slider.settings.mode === 'vertical') { slider.settings.maxSlides = slider.settings.minSlides; }
      // save original style data
      el.data('origStyle', el.attr('style'));
      el.children(slider.settings.slideSelector).each(function() {
        $(this).data('origStyle', $(this).attr('style'));
      });

      // perform all DOM / CSS modifications
      setup();
    };

    /**
     * Performs all DOM and CSS modifications
     */
    var setup = function() {
      var preloadSelector = slider.children.eq(slider.settings.startSlide); // set the default preload selector (visible)

      // wrap el in a wrapper
      el.wrap('<div class="' + slider.settings.wrapperClass + '"><div class="bx-viewport"></div></div>');
      // store a namespace reference to .bx-viewport
      slider.viewport = el.parent();

      // add aria-live if the setting is enabled and ticker mode is disabled
      if (slider.settings.ariaLive && !slider.settings.ticker) {
        slider.viewport.attr('aria-live', 'polite');
      }
      // add a loading div to display while images are loading
      slider.loader = $('<div class="bx-loading" />');
      slider.viewport.prepend(slider.loader);
      // set el to a massive width, to hold any needed slides
      // also strip any margin and padding from el
      el.css({
        width: slider.settings.mode === 'horizontal' ? (slider.children.length * 1000 + 215) + '%' : 'auto',
        position: 'relative'
      });
      // if using CSS, add the easing property
      if (slider.usingCSS && slider.settings.easing) {
        el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
      // if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
      } else if (!slider.settings.easing) {
        slider.settings.easing = 'swing';
      }
      // make modifications to the viewport (.bx-viewport)
      slider.viewport.css({
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      });
      slider.viewport.parent().css({
        maxWidth: getViewportMaxWidth()
      });
      // apply css to all slider children
      slider.children.css({
        // the float attribute is a reserved word in compressors like YUI compressor and need to be quoted #48
        'float': slider.settings.mode === 'horizontal' ? 'left' : 'none',
        listStyle: 'none',
        position: 'relative'
      });
      // apply the calculated width after the float is applied to prevent scrollbar interference
      slider.children.css('width', getSlideWidth());
      // if slideMargin is supplied, add the css
      if (slider.settings.mode === 'horizontal' && slider.settings.slideMargin > 0) { slider.children.css('marginRight', slider.settings.slideMargin); }
      if (slider.settings.mode === 'vertical' && slider.settings.slideMargin > 0) { slider.children.css('marginBottom', slider.settings.slideMargin); }
      // if "fade" mode, add positioning and z-index CSS
      if (slider.settings.mode === 'fade') {
        slider.children.css({
          position: 'absolute',
          zIndex: 0,
          display: 'none'
        });
        // prepare the z-index on the showing element
        slider.children.eq(slider.settings.startSlide).css({zIndex: slider.settings.slideZIndex, display: 'block'});
      }
      // create an element to contain all slider controls (pager, start / stop, etc)
      slider.controls.el = $('<div class="bx-controls" />');
      // if captions are requested, add them
      if (slider.settings.captions) { appendCaptions(); }
      // check if startSlide is last slide
      slider.active.last = slider.settings.startSlide === getPagerQty() - 1;
      // if video is true, set up the fitVids plugin
      if (slider.settings.video) { el.fitVids(); }
	  //preloadImages
	  if (slider.settings.preloadImages === 'none') { 
		  preloadSelector = null; 
	  }
      else if (slider.settings.preloadImages === 'all' || slider.settings.ticker) { 
		  preloadSelector = slider.children; 
	  }
      // only check for control addition if not in "ticker" mode
      if (!slider.settings.ticker) {
        // if controls are requested, add them
        if (slider.settings.controls) { appendControls(); }
        // if auto is true, and auto controls are requested, add them
        if (slider.settings.auto && slider.settings.autoControls) { appendControlsAuto(); }
        // if pager is requested, add it
        if (slider.settings.pager) { appendPager(); }
        // if any control option is requested, add the controls wrapper
        if (slider.settings.controls || slider.settings.autoControls || slider.settings.pager) { slider.viewport.after(slider.controls.el); }
      // if ticker mode, do not allow a pager
      } else {
        slider.settings.pager = false;
      }
	  if (preloadSelector === null) {
        start();
      } else {
        loadElements(preloadSelector, start);
      }
    };

    var loadElements = function(selector, callback) {
      var total = selector.find('img:not([src=""]), iframe').length,
      count = 0;
      if (total === 0) {
        callback();
        return;
      }
      selector.find('img:not([src=""]), iframe').each(function() {
        $(this).one('load error', function() {
          if (++count === total) { callback(); }
        }).each(function() {
          if (this.complete || this.src == '') { $(this).trigger('load'); }
        });
      });
    };

    /**
     * Start the slider
     */
    var start = function() {
      // if infinite loop, prepare additional slides
      if (slider.settings.infiniteLoop && slider.settings.mode !== 'fade' && !slider.settings.ticker) {
        var slice    = slider.settings.mode === 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides,
        sliceAppend  = slider.children.slice(0, slice).clone(true).addClass('bx-clone'),
        slicePrepend = slider.children.slice(-slice).clone(true).addClass('bx-clone');
        if (slider.settings.ariaHidden) {
          sliceAppend.attr('aria-hidden', true);
          slicePrepend.attr('aria-hidden', true);
        }
        el.append(sliceAppend).prepend(slicePrepend);
      }
      // remove the loading DOM element
      slider.loader.remove();
      // set the left / top position of "el"
      setSlidePosition();
      // if "vertical" mode, always use adaptiveHeight to prevent odd behavior
      if (slider.settings.mode === 'vertical') { slider.settings.adaptiveHeight = true; }
      // set the viewport height
      slider.viewport.height(getViewportHeight());
      // make sure everything is positioned just right (same as a window resize)
      el.redrawSlider();
      // onSliderLoad callback
      slider.settings.onSliderLoad.call(el, slider.active.index);
      // slider has been fully initialized
      slider.initialized = true;
      // add the resize call to the window
      if (slider.settings.responsive) { $(window).on('resize', resizeWindow); }
      // if auto is true and has more than 1 page, start the show
      if (slider.settings.auto && slider.settings.autoStart && (getPagerQty() > 1 || slider.settings.autoSlideForOnePage)) { initAuto(); }
      // if ticker is true, start the ticker
      if (slider.settings.ticker) { initTicker(); }
      // if pager is requested, make the appropriate pager link active
      if (slider.settings.pager) { updatePagerActive(slider.settings.startSlide); }
      // check for any updates to the controls (like hideControlOnEnd updates)
      if (slider.settings.controls) { updateDirectionControls(); }
      // if touchEnabled is true, setup the touch events
      if (slider.settings.touchEnabled && !slider.settings.ticker) { initTouch(); }
      // if keyboardEnabled is true, setup the keyboard events
      if (slider.settings.keyboardEnabled && !slider.settings.ticker) {
        $(document).keydown(keyPress);
      }
    };

    /**
     * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
     */
    var getViewportHeight = function() {
      var height = 0;
      // first determine which children (slides) should be used in our height calculation
      var children = $();
      // if mode is not "vertical" and adaptiveHeight is false, include all children
      if (slider.settings.mode !== 'vertical' && !slider.settings.adaptiveHeight) {
        children = slider.children;
      } else {
        // if not carousel, return the single active child
        if (!slider.carousel) {
          children = slider.children.eq(slider.active.index);
        // if carousel, return a slice of children
        } else {
          // get the individual slide index
          var currentIndex = slider.settings.moveSlides === 1 ? slider.active.index : slider.active.index * getMoveBy();
          // add the current slide to the children
          children = slider.children.eq(currentIndex);
          // cycle through the remaining "showing" slides
          for (i = 1; i <= slider.settings.maxSlides - 1; i++) {
            // if looped back to the start
            if (currentIndex + i >= slider.children.length) {
              children = children.add(slider.children.eq(i - 1));
            } else {
              children = children.add(slider.children.eq(currentIndex + i));
            }
          }
        }
      }
      // if "vertical" mode, calculate the sum of the heights of the children
      if (slider.settings.mode === 'vertical') {
        children.each(function(index) {
          height += $(this).outerHeight();
        });
        // add user-supplied margins
        if (slider.settings.slideMargin > 0) {
          height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
        }
      // if not "vertical" mode, calculate the max height of the children
      } else {
        height = Math.max.apply(Math, children.map(function() {
          return $(this).outerHeight(false);
        }).get());
      }

      if (slider.viewport.css('box-sizing') === 'border-box') {
        height += parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom')) +
              parseFloat(slider.viewport.css('border-top-width')) + parseFloat(slider.viewport.css('border-bottom-width'));
      } else if (slider.viewport.css('box-sizing') === 'padding-box') {
        height += parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom'));
      }

      return height;
    };

    /**
     * Returns the calculated width to be used for the outer wrapper / viewport
     */
    var getViewportMaxWidth = function() {
      var width = '100%';
      if (slider.settings.slideWidth > 0) {
        if (slider.settings.mode === 'horizontal') {
          width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
        } else {
          width = slider.settings.slideWidth;
        }
      }
      return width;
    };

    /**
     * Returns the calculated width to be applied to each slide
     */
    var getSlideWidth = function() {
      var newElWidth = slider.settings.slideWidth, // start with any user-supplied slide width
      wrapWidth      = slider.viewport.width();    // get the current viewport width
      // if slide width was not supplied, or is larger than the viewport use the viewport width
      if (slider.settings.slideWidth === 0 ||
        (slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
        slider.settings.mode === 'vertical') {
        newElWidth = wrapWidth;
      // if carousel, use the thresholds to determine the width
      } else if (slider.settings.maxSlides > 1 && slider.settings.mode === 'horizontal') {
        if (wrapWidth > slider.maxThreshold) {
          return newElWidth;
        } else if (wrapWidth < slider.minThreshold) {
          newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
        } else if (slider.settings.shrinkItems) {
          newElWidth = Math.floor((wrapWidth + slider.settings.slideMargin) / (Math.ceil((wrapWidth + slider.settings.slideMargin) / (newElWidth + slider.settings.slideMargin))) - slider.settings.slideMargin);
        }
      }
      return newElWidth;
    };

    /**
     * Returns the number of slides currently visible in the viewport (includes partially visible slides)
     */
    var getNumberSlidesShowing = function() {
      var slidesShowing = 1,
      childWidth = null;
      if (slider.settings.mode === 'horizontal' && slider.settings.slideWidth > 0) {
        // if viewport is smaller than minThreshold, return minSlides
        if (slider.viewport.width() < slider.minThreshold) {
          slidesShowing = slider.settings.minSlides;
        // if viewport is larger than maxThreshold, return maxSlides
        } else if (slider.viewport.width() > slider.maxThreshold) {
          slidesShowing = slider.settings.maxSlides;
        // if viewport is between min / max thresholds, divide viewport width by first child width
        } else {
          childWidth = slider.children.first().width() + slider.settings.slideMargin;
          slidesShowing = Math.floor((slider.viewport.width() +
            slider.settings.slideMargin) / childWidth) || 1;
        }
      // if "vertical" mode, slides showing will always be minSlides
      } else if (slider.settings.mode === 'vertical') {
        slidesShowing = slider.settings.minSlides;
      }
      return slidesShowing;
    };

    /**
     * Returns the number of pages (one full viewport of slides is one "page")
     */
    var getPagerQty = function() {
      var pagerQty = 0,
      breakPoint = 0,
      counter = 0;
      // if moveSlides is specified by the user
      if (slider.settings.moveSlides > 0) {
        if (slider.settings.infiniteLoop) {
          pagerQty = Math.ceil(slider.children.length / getMoveBy());
        } else {
          // when breakpoint goes above children length, counter is the number of pages
          while (breakPoint < slider.children.length) {
            ++pagerQty;
            breakPoint = counter + getNumberSlidesShowing();
            counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
          }
		  return counter;
        }
      // if moveSlides is 0 (auto) divide children length by sides showing, then round up
      } else {
        pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
      }
      return pagerQty;
    };

    /**
     * Returns the number of individual slides by which to shift the slider
     */
    var getMoveBy = function() {
      // if moveSlides was set by the user and moveSlides is less than number of slides showing
      if (slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()) {
        return slider.settings.moveSlides;
      }
      // if moveSlides is 0 (auto)
      return getNumberSlidesShowing();
    };

    /**
     * Sets the slider's (el) left or top position
     */
    var setSlidePosition = function() {
      var position, lastChild, lastShowingIndex;
      // if last slide, not infinite loop, and number of children is larger than specified maxSlides
      if (slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop) {
        if (slider.settings.mode === 'horizontal') {
          // get the last child's position
          lastChild = slider.children.last();
          position = lastChild.position();
          // set the left position
          setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.outerWidth())), 'reset', 0);
        } else if (slider.settings.mode === 'vertical') {
          // get the last showing index's position
          lastShowingIndex = slider.children.length - slider.settings.minSlides;
          position = slider.children.eq(lastShowingIndex).position();
          // set the top position
          setPositionProperty(-position.top, 'reset', 0);
        }
      // if not last slide
      } else {
        // get the position of the first showing slide
        position = slider.children.eq(slider.active.index * getMoveBy()).position();
        // check for last slide
        if (slider.active.index === getPagerQty() - 1) { slider.active.last = true; }
        // set the respective position
        if (position !== undefined) {
          if (slider.settings.mode === 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
          else if (slider.settings.mode === 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
        }
      }
    };

    /**
     * Sets the el's animating property position (which in turn will sometimes animate el).
     * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
     *
     * @param value (int)
     *  - the animating property's value
     *
     * @param type (string) 'slide', 'reset', 'ticker'
     *  - the type of instance for which the function is being
     *
     * @param duration (int)
     *  - the amount of time (in ms) the transition should occupy
     *
     * @param params (array) optional
     *  - an optional parameter containing any variables that need to be passed in
     */
    var setPositionProperty = function(value, type, duration, params) {
      var animateObj, propValue;
      // use CSS transform
      if (slider.usingCSS) {
        // determine the translate3d value
        propValue = slider.settings.mode === 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
        // add the CSS transition-duration
        el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
        if (type === 'slide') {
          // set the property value
          el.css(slider.animProp, propValue);
          if (duration !== 0) {
            // add a callback method - executes when CSS transition completes
            el.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
              //make sure it's the correct one
              if (!$(e.target).is(el)) { return; }
              // remove the callback
              el.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
              updateAfterSlideTransition();
            });
          } else { //duration = 0
            updateAfterSlideTransition();
          }
        } else if (type === 'reset') {
          el.css(slider.animProp, propValue);
        } else if (type === 'ticker') {
          // make the transition use 'linear'
          el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
          el.css(slider.animProp, propValue);
          if (duration !== 0) {
            el.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
              //make sure it's the correct one
              if (!$(e.target).is(el)) { return; }
              // remove the callback
              el.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
              // reset the position
              setPositionProperty(params.resetValue, 'reset', 0);
              // start the loop again
              tickerLoop();
            });
          } else { //duration = 0
            setPositionProperty(params.resetValue, 'reset', 0);
            tickerLoop();
          }
        }
      // use JS animate
      } else {
        animateObj = {};
        animateObj[slider.animProp] = value;
        if (type === 'slide') {
          el.animate(animateObj, duration, slider.settings.easing, function() {
            updateAfterSlideTransition();
          });
        } else if (type === 'reset') {
          el.css(slider.animProp, value);
        } else if (type === 'ticker') {
          el.animate(animateObj, duration, 'linear', function() {
            setPositionProperty(params.resetValue, 'reset', 0);
            // run the recursive loop after animation
            tickerLoop();
          });
        }
      }
    };

    /**
     * Populates the pager with proper amount of pages
     */
    var populatePager = function() {
      var pagerHtml = '',
      linkContent = '',
      pagerQty = getPagerQty();
      // loop through each pager item
      for (var i = 0; i < pagerQty; i++) {
        linkContent = '';
        // if a buildPager function is supplied, use it to get pager link value, else use index + 1
        if (slider.settings.buildPager && $.isFunction(slider.settings.buildPager) || slider.settings.pagerCustom) {
          linkContent = slider.settings.buildPager(i);
          slider.pagerEl.addClass('bx-custom-pager');
        } else {
          linkContent = i + 1;
          slider.pagerEl.addClass('bx-default-pager');
        }
        // var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
        // add the markup to the string
        pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
      }
      // populate the pager element with pager links
      slider.pagerEl.html(pagerHtml);
    };

    /**
     * Appends the pager to the controls element
     */
    var appendPager = function() {
      if (!slider.settings.pagerCustom) {
        // create the pager DOM element
        slider.pagerEl = $('<div class="bx-pager" />');
        // if a pager selector was supplied, populate it with the pager
        if (slider.settings.pagerSelector) {
          $(slider.settings.pagerSelector).html(slider.pagerEl);
        // if no pager selector was supplied, add it after the wrapper
        } else {
          slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
        }
        // populate the pager
        populatePager();
      } else {
        slider.pagerEl = $(slider.settings.pagerCustom);
      }
      // assign the pager click binding
      slider.pagerEl.on('click touchend', 'a', clickPagerBind);
    };

    /**
     * Appends prev / next controls to the controls element
     */
    var appendControls = function() {
      slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
      slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
      // add click actions to the controls
      slider.controls.next.on('click touchend', clickNextBind);
      slider.controls.prev.on('click touchend', clickPrevBind);
      // if nextSelector was supplied, populate it
      if (slider.settings.nextSelector) {
        $(slider.settings.nextSelector).append(slider.controls.next);
      }
      // if prevSelector was supplied, populate it
      if (slider.settings.prevSelector) {
        $(slider.settings.prevSelector).append(slider.controls.prev);
      }
      // if no custom selectors were supplied
      if (!slider.settings.nextSelector && !slider.settings.prevSelector) {
        // add the controls to the DOM
        slider.controls.directionEl = $('<div class="bx-controls-direction" />');
        // add the control elements to the directionEl
        slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
        // slider.viewport.append(slider.controls.directionEl);
        slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
      }
    };

    /**
     * Appends start / stop auto controls to the controls element
     */
    var appendControlsAuto = function() {
      slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
      slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
      // add the controls to the DOM
      slider.controls.autoEl = $('<div class="bx-controls-auto" />');
      // on click actions to the controls
      slider.controls.autoEl.on('click', '.bx-start', clickStartBind);
      slider.controls.autoEl.on('click', '.bx-stop', clickStopBind);
      // if autoControlsCombine, insert only the "start" control
      if (slider.settings.autoControlsCombine) {
        slider.controls.autoEl.append(slider.controls.start);
      // if autoControlsCombine is false, insert both controls
      } else {
        slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
      }
      // if auto controls selector was supplied, populate it with the controls
      if (slider.settings.autoControlsSelector) {
        $(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
      // if auto controls selector was not supplied, add it after the wrapper
      } else {
        slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
      }
      // update the auto controls
      updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
    };

    /**
     * Appends image captions to the DOM
     */
    var appendCaptions = function() {
      // cycle through each child
      slider.children.each(function(index) {
        // get the image title attribute
        var title = $(this).find('img:first').attr('title');
        // append the caption
        if (title !== undefined && ('' + title).length) {
          $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
        }
      });
    };

    /**
     * Click next binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickNextBind = function(e) {
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) { return; }
      // if auto show is running, stop it
      if (slider.settings.auto && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      el.goToNextSlide();
    };

    /**
     * Click prev binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickPrevBind = function(e) {
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) { return; }
      // if auto show is running, stop it
      if (slider.settings.auto && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      el.goToPrevSlide();
    };

    /**
     * Click start binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickStartBind = function(e) {
      el.startAuto();
      e.preventDefault();
    };

    /**
     * Click stop binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickStopBind = function(e) {
      el.stopAuto();
      e.preventDefault();
    };

    /**
     * Click pager binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickPagerBind = function(e) {
      var pagerLink, pagerIndex;
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) {
        return;
      }
      // if auto show is running, stop it
      if (slider.settings.auto  && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      pagerLink = $(e.currentTarget);
      if (pagerLink.attr('data-slide-index') !== undefined) {
        pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
        // if clicked pager link is not active, continue with the goToSlide call
        if (pagerIndex !== slider.active.index) { el.goToSlide(pagerIndex); }
      }
    };

    /**
     * Updates the pager links with an active class
     *
     * @param slideIndex (int)
     *  - index of slide to make active
     */
    var updatePagerActive = function(slideIndex) {
      // if "short" pager type
      var len = slider.children.length; // nb of children
      if (slider.settings.pagerType === 'short') {
        if (slider.settings.maxSlides > 1) {
          len = Math.ceil(slider.children.length / slider.settings.maxSlides);
        }
        slider.pagerEl.html((slideIndex + 1) + slider.settings.pagerShortSeparator + len);
        return;
      }
      // remove all pager active classes
      slider.pagerEl.find('a').removeClass('active');
      // apply the active class for all pagers
      slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
    };

    /**
     * Performs needed actions after a slide transition
     */
    var updateAfterSlideTransition = function() {
      // if infinite loop is true
      if (slider.settings.infiniteLoop) {
        var position = '';
        // first slide
        if (slider.active.index === 0) {
          // set the new position
          position = slider.children.eq(0).position();
        // carousel, last slide
        } else if (slider.active.index === getPagerQty() - 1 && slider.carousel) {
          position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
        // last slide
        } else if (slider.active.index === slider.children.length - 1) {
          position = slider.children.eq(slider.children.length - 1).position();
        }
        if (position) {
          if (slider.settings.mode === 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
          else if (slider.settings.mode === 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
        }
      }
      // declare that the transition is complete
      slider.working = false;
      // onSlideAfter callback
      slider.settings.onSlideAfter.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
    };

    /**
     * Updates the auto controls state (either active, or combined switch)
     *
     * @param state (string) "start", "stop"
     *  - the new state of the auto show
     */
    var updateAutoControls = function(state) {
      // if autoControlsCombine is true, replace the current control with the new state
      if (slider.settings.autoControlsCombine) {
        slider.controls.autoEl.html(slider.controls[state]);
      // if autoControlsCombine is false, apply the "active" class to the appropriate control
      } else {
        slider.controls.autoEl.find('a').removeClass('active');
        slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
      }
    };

    /**
     * Updates the direction controls (checks if either should be hidden)
     */
    var updateDirectionControls = function() {
      if (getPagerQty() === 1) {
        slider.controls.prev.addClass('disabled');
        slider.controls.next.addClass('disabled');
      } else if (!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd) {
        // if first slide
        if (slider.active.index === 0) {
          slider.controls.prev.addClass('disabled');
          slider.controls.next.removeClass('disabled');
        // if last slide
        } else if (slider.active.index === getPagerQty() - 1) {
          slider.controls.next.addClass('disabled');
          slider.controls.prev.removeClass('disabled');
        // if any slide in the middle
        } else {
          slider.controls.prev.removeClass('disabled');
          slider.controls.next.removeClass('disabled');
        }
      }
    };
	/* auto start and stop functions */
	var windowFocusHandler = function() { el.startAuto(); };
	var windowBlurHandler = function() { el.stopAuto(); };
    /**
     * Initializes the auto process
     */
    var initAuto = function() {
      // if autoDelay was supplied, launch the auto show using a setTimeout() call
      if (slider.settings.autoDelay > 0) {
        setTimeout(el.startAuto, slider.settings.autoDelay);
      // if autoDelay was not supplied, start the auto show normally
      } else {
        el.startAuto();

        //add focus and blur events to ensure its running if timeout gets paused
        $(window).focus(windowFocusHandler).blur(windowBlurHandler);
      }
      // if autoHover is requested
      if (slider.settings.autoHover) {
        // on el hover
        el.hover(function() {
          // if the auto show is currently playing (has an active interval)
          if (slider.interval) {
            // stop the auto show and pass true argument which will prevent control update
            el.stopAuto(true);
            // create a new autoPaused value which will be used by the relative "mouseout" event
            slider.autoPaused = true;
          }
        }, function() {
          // if the autoPaused value was created be the prior "mouseover" event
          if (slider.autoPaused) {
            // start the auto show and pass true argument which will prevent control update
            el.startAuto(true);
            // reset the autoPaused value
            slider.autoPaused = null;
          }
        });
      }
    };

    /**
     * Initializes the ticker process
     */
    var initTicker = function() {
      var startPosition = 0,
      position, transform, value, idx, ratio, property, newSpeed, totalDimens;
      // if autoDirection is "next", append a clone of the entire slider
      if (slider.settings.autoDirection === 'next') {
        el.append(slider.children.clone().addClass('bx-clone'));
      // if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
      } else {
        el.prepend(slider.children.clone().addClass('bx-clone'));
        position = slider.children.first().position();
        startPosition = slider.settings.mode === 'horizontal' ? -position.left : -position.top;
      }
      setPositionProperty(startPosition, 'reset', 0);
      // do not allow controls in ticker mode
      slider.settings.pager = false;
      slider.settings.controls = false;
      slider.settings.autoControls = false;
      // if autoHover is requested
      if (slider.settings.tickerHover) {
        if (slider.usingCSS) {
          idx = slider.settings.mode === 'horizontal' ? 4 : 5;
          slider.viewport.hover(function() {
            transform = el.css('-' + slider.cssPrefix + '-transform');
            value = parseFloat(transform.split(',')[idx]);
            setPositionProperty(value, 'reset', 0);
          }, function() {
            totalDimens = 0;
            slider.children.each(function(index) {
              totalDimens += slider.settings.mode === 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
            });
            // calculate the speed ratio (used to determine the new speed to finish the paused animation)
            ratio = slider.settings.speed / totalDimens;
            // determine which property to use
            property = slider.settings.mode === 'horizontal' ? 'left' : 'top';
            // calculate the new speed
            newSpeed = ratio * (totalDimens - (Math.abs(parseInt(value))));
            tickerLoop(newSpeed);
          });
        } else {
          // on el hover
          slider.viewport.hover(function() {
            el.stop();
          }, function() {
            // calculate the total width of children (used to calculate the speed ratio)
            totalDimens = 0;
            slider.children.each(function(index) {
              totalDimens += slider.settings.mode === 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
            });
            // calculate the speed ratio (used to determine the new speed to finish the paused animation)
            ratio = slider.settings.speed / totalDimens;
            // determine which property to use
            property = slider.settings.mode === 'horizontal' ? 'left' : 'top';
            // calculate the new speed
            newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
            tickerLoop(newSpeed);
          });
        }
      }
      // start the ticker loop
      tickerLoop();
    };

    /**
     * Runs a continuous loop, news ticker-style
     */
    var tickerLoop = function(resumeSpeed) {
      var speed = resumeSpeed ? resumeSpeed : slider.settings.speed,
      position = {left: 0, top: 0},
      reset = {left: 0, top: 0},
      animateProperty, resetValue, params;

      // if "next" animate left position to last child, then reset left to 0
      if (slider.settings.autoDirection === 'next') {
        position = el.find('.bx-clone').first().position();
      // if "prev" animate left position to 0, then reset left to first non-clone child
      } else {
        reset = slider.children.first().position();
      }
      animateProperty = slider.settings.mode === 'horizontal' ? -position.left : -position.top;
      resetValue = slider.settings.mode === 'horizontal' ? -reset.left : -reset.top;
      params = {resetValue: resetValue};
      setPositionProperty(animateProperty, 'ticker', speed, params);
    };

    /**
     * Check if el is on screen
     */
    var isOnScreen = function(el) {
      var win = $(window),
      viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
      },
      bounds = el.offset();

      viewport.right = viewport.left + win.width();
      viewport.bottom = viewport.top + win.height();
      bounds.right = bounds.left + el.outerWidth();
      bounds.bottom = bounds.top + el.outerHeight();

      return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    };

    /**
     * Initializes keyboard events
     */
    var keyPress = function(e) {
      var activeElementTag = document.activeElement.tagName.toLowerCase(),
      tagFilters = 'input|textarea',
      p = new RegExp(activeElementTag,['i']),
      result = p.exec(tagFilters);

      if (result == null && isOnScreen(el)) {
        if (e.keyCode === 39) {
          clickNextBind(e);
          return false;
        } else if (e.keyCode === 37) {
          clickPrevBind(e);
          return false;
        }
      }
    };

    /**
     * Initializes touch events
     */
    var initTouch = function() {
      // initialize object to contain all touch values
      slider.touch = {
        start: {x: 0, y: 0},
        end: {x: 0, y: 0}
      };
      slider.viewport.on('touchstart MSPointerDown pointerdown', onTouchStart);

      //for browsers that have implemented pointer events and fire a click after
      //every pointerup regardless of whether pointerup is on same screen location as pointerdown or not
      slider.viewport.on('click', '.bxslider a', function(e) {
        if (slider.viewport.hasClass('click-disabled')) {
          e.preventDefault();
          slider.viewport.removeClass('click-disabled');
        }
      });
    };

    /**
     * Event handler for "touchstart"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchStart = function(e) {
      // watch only for left mouse, touch contact and pen contact
      // touchstart event object doesn`t have button property
      if ((e.type !== 'touchstart' ||  e.type !== 'pointerdown') && e.button !== 0) {
        return;
      }
      e.preventDefault();
      //disable slider controls while user is interacting with slides to avoid slider freeze that happens on touch devices when a slide swipe happens immediately after interacting with slider controls
      slider.controls.el.addClass('disabled');

      if (slider.working) {
        slider.controls.el.removeClass('disabled');
      } else {
        // record the original position when touch starts
        slider.touch.originalPos = el.position();
        var orig = e.originalEvent,
        touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig];
		var chromePointerEvents = typeof PointerEvent === 'function'; 
		if (chromePointerEvents) { 
			if (orig.pointerId === undefined) { 
				return;
			} 
		}
        // record the starting touch x, y coordinates
        slider.touch.start.x = touchPoints[0].pageX;
        slider.touch.start.y = touchPoints[0].pageY;

        if (slider.viewport.get(0).setPointerCapture) {
          slider.pointerId = orig.pointerId;
          slider.viewport.get(0).setPointerCapture(slider.pointerId);
        }
        // store original event data for click fixation
        slider.originalClickTarget = orig.originalTarget || orig.target;
        slider.originalClickButton = orig.button;
        slider.originalClickButtons = orig.buttons;
        slider.originalEventType = orig.type;
        // at this moment we don`t know what it is click or swipe
        slider.hasMove = false;
        // on a "touchmove" event to the viewport
        slider.viewport.on('touchmove MSPointerMove pointermove', onTouchMove);
        // on a "touchend" event to the viewport
        slider.viewport.on('touchend MSPointerUp pointerup', onTouchEnd);
        slider.viewport.on('MSPointerCancel pointercancel', onPointerCancel);
      }
    };

    /**
     * Cancel Pointer for Windows Phone
     *
     * @param e (event)
     *  - DOM event object
     */
    var onPointerCancel = function(e) {
      e.preventDefault();
      /* onPointerCancel handler is needed to deal with situations when a touchend
      doesn't fire after a touchstart (this happens on windows phones only) */
      setPositionProperty(slider.touch.originalPos.left, 'reset', 0);

      //remove handlers
      slider.controls.el.removeClass('disabled');
      slider.viewport.off('MSPointerCancel pointercancel', onPointerCancel);
      slider.viewport.off('touchmove MSPointerMove pointermove', onTouchMove);
      slider.viewport.off('touchend MSPointerUp pointerup', onTouchEnd);
      if (slider.viewport.get(0).releasePointerCapture) {
        slider.viewport.get(0).releasePointerCapture(slider.pointerId);
      }
    };

    /**
     * Event handler for "touchmove"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchMove = function(e) {
      var orig = e.originalEvent,
      touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
      // if scrolling on y axis, do not prevent default
      xMovement = Math.abs(touchPoints[0].pageX - slider.touch.start.x),
      yMovement = Math.abs(touchPoints[0].pageY - slider.touch.start.y),
      value = 0,
      change = 0;
      // this is swipe
      slider.hasMove = true;

      // x axis swipe
      if ((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX) {
        e.preventDefault();
      // y axis swipe
      } else if ((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY) {
        e.preventDefault();
      }
      if (e.type !== 'touchmove') {
        e.preventDefault();
      }

      if (slider.settings.mode !== 'fade' && slider.settings.oneToOneTouch) {
        // if horizontal, drag along x axis
        if (slider.settings.mode === 'horizontal') {
          change = touchPoints[0].pageX - slider.touch.start.x;
          value = slider.touch.originalPos.left + change;
        // if vertical, drag along y axis
        } else {
          change = touchPoints[0].pageY - slider.touch.start.y;
          value = slider.touch.originalPos.top + change;
        }
        setPositionProperty(value, 'reset', 0);
      }
    };

    /**
     * Event handler for "touchend"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchEnd = function(e) {
      e.preventDefault();
      slider.viewport.off('touchmove MSPointerMove pointermove', onTouchMove);
      //enable slider controls as soon as user stops interacing with slides
      slider.controls.el.removeClass('disabled');
      var orig    = e.originalEvent,
      touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
      value       = 0,
      distance    = 0;
      // record end x, y positions
      slider.touch.end.x = touchPoints[0].pageX;
      slider.touch.end.y = touchPoints[0].pageY;
      // if fade mode, check if absolute x distance clears the threshold
      if (slider.settings.mode === 'fade') {
        distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
        if (distance >= slider.settings.swipeThreshold) {
          if (slider.touch.start.x > slider.touch.end.x) {
            el.goToNextSlide();
          } else {
            el.goToPrevSlide();
          }
          el.stopAuto();
        }
      // not fade mode
      } else {
        // calculate distance and el's animate property
        if (slider.settings.mode === 'horizontal') {
          distance = slider.touch.end.x - slider.touch.start.x;
          value = slider.touch.originalPos.left;
        } else {
          distance = slider.touch.end.y - slider.touch.start.y;
          value = slider.touch.originalPos.top;
        }
        // if not infinite loop and first / last slide, do not attempt a slide transition
        if (!slider.settings.infiniteLoop && ((slider.active.index === 0 && distance > 0) || (slider.active.last && distance < 0))) {
          setPositionProperty(value, 'reset', 200);
        } else {
          // check if distance clears threshold
          if (Math.abs(distance) >= slider.settings.swipeThreshold) {
            if (distance < 0) {
              el.goToNextSlide();
            } else {
              el.goToPrevSlide();
            }
            el.stopAuto();
          } else {
            // el.animate(property, 200);
            setPositionProperty(value, 'reset', 200);
          }
        }
      }
      slider.viewport.off('touchend MSPointerUp pointerup', onTouchEnd);

      if (slider.viewport.get(0).releasePointerCapture) {
        slider.viewport.get(0).releasePointerCapture(slider.pointerId);
      }
      // if slider had swipe with left mouse, touch contact and pen contact
      if (slider.hasMove === false && (slider.originalClickButton === 0 || slider.originalEventType === 'touchstart')) {
        // trigger click event (fix for Firefox59 and PointerEvent standard compatibility)
        $(slider.originalClickTarget).trigger({
          type: 'click',
          button: slider.originalClickButton,
          buttons: slider.originalClickButtons
        });
      }
    };

    /**
     * Window resize event callback
     */
    var resizeWindow = function(e) {
      // don't do anything if slider isn't initialized.
      if (!slider.initialized) { return; }
      // Delay if slider working.
      if (slider.working) {
        window.setTimeout(resizeWindow, 10);
      } else {
        // get the new window dimens (again, thank you IE)
        var windowWidthNew = $(window).width(),
        windowHeightNew = $(window).height();
        // make sure that it is a true window resize
        // *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
        // are resized. Can you just die already?*
        if (windowWidth !== windowWidthNew || windowHeight !== windowHeightNew) {
          // set the new window dimens
          windowWidth = windowWidthNew;
          windowHeight = windowHeightNew;
          // update all dynamic elements
          el.redrawSlider();
          // Call user resize handler
          slider.settings.onSliderResize.call(el, slider.active.index);
        }
      }
    };

    /**
     * Adds an aria-hidden=true attribute to each element
     *
     * @param startVisibleIndex (int)
     *  - the first visible element's index
     */
    var applyAriaHiddenAttributes = function(startVisibleIndex) {
      var numberOfSlidesShowing = getNumberSlidesShowing();
      // only apply attributes if the setting is enabled and not in ticker mode
      if (slider.settings.ariaHidden && !slider.settings.ticker) {
        // add aria-hidden=true to all elements
        slider.children.attr('aria-hidden', 'true');
        // get the visible elements and change to aria-hidden=false
        slider.children.slice(startVisibleIndex, startVisibleIndex + numberOfSlidesShowing).attr('aria-hidden', 'false');
      }
    };

    /**
     * Returns index according to present page range
     *
     * @param slideOndex (int)
     *  - the desired slide index
     */
    var setSlideIndex = function(slideIndex) {
      if (slideIndex < 0) {
        if (slider.settings.infiniteLoop) {
          return getPagerQty() - 1;
        }else {
          //we don't go to undefined slides
          return slider.active.index;
        }
      // if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
      } else if (slideIndex >= getPagerQty()) {
        if (slider.settings.infiniteLoop) {
          return 0;
        } else {
          //we don't move to undefined pages
          return slider.active.index;
        }
      // set active index to requested slide
      } else {
        return slideIndex;
      }
    };

    /**
     * ===================================================================================
     * = PUBLIC FUNCTIONS
     * ===================================================================================
     */

    /**
     * Performs slide transition to the specified slide
     *
     * @param slideIndex (int)
     *  - the destination slide's index (zero-based)
     *
     * @param direction (string)
     *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
     */
    el.goToSlide = function(slideIndex, direction) {
      // onSlideBefore, onSlideNext, onSlidePrev callbacks
      // Allow transition canceling based on returned value
      var performTransition = true,
      moveBy = 0,
      position = {left: 0, top: 0},
      lastChild = null,
      lastShowingIndex, eq, value, requestEl;
      // store the old index
      slider.oldIndex = slider.active.index;
      //set new index
      slider.active.index = setSlideIndex(slideIndex);

      // if plugin is currently in motion, ignore request
      if (slider.working || slider.active.index === slider.oldIndex) { return; }
      // declare that plugin is in motion
      slider.working = true;

      performTransition = slider.settings.onSlideBefore.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);

      // If transitions canceled, reset and return
      if (typeof (performTransition) !== 'undefined' && !performTransition) {
        slider.active.index = slider.oldIndex; // restore old index
        slider.working = false; // is not in motion
        return;
      }

      if (direction === 'next') {
        // Prevent canceling in future functions or lack there-of from negating previous commands to cancel
        if (!slider.settings.onSlideNext.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
          performTransition = false;
        }
      } else if (direction === 'prev') {
        // Prevent canceling in future functions or lack there-of from negating previous commands to cancel
        if (!slider.settings.onSlidePrev.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
          performTransition = false;
        }
      }

      // check if last slide
      slider.active.last = slider.active.index >= getPagerQty() - 1;
      // update the pager with active class
      if (slider.settings.pager || slider.settings.pagerCustom) { updatePagerActive(slider.active.index); }
      // // check for direction control update
      if (slider.settings.controls) { updateDirectionControls(); }
      // if slider is set to mode: "fade"
      if (slider.settings.mode === 'fade') {
        // if adaptiveHeight is true and next height is different from current height, animate to the new height
        if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
          slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
        }
        // fade out the visible child and reset its z-index value
        slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
        // fade in the newly requested slide
        slider.children.eq(slider.active.index).css('zIndex', slider.settings.slideZIndex + 1).fadeIn(slider.settings.speed, function() {
          $(this).css('zIndex', slider.settings.slideZIndex);
          updateAfterSlideTransition();
        });
      // slider mode is not "fade"
      } else {
        // if adaptiveHeight is true and next height is different from current height, animate to the new height
        if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
          slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
        }
        // if carousel and not infinite loop
        if (!slider.settings.infiniteLoop && slider.carousel && slider.active.last) {
          if (slider.settings.mode === 'horizontal') {
            // get the last child position
            lastChild = slider.children.eq(slider.children.length - 1);
            position = lastChild.position();
            // calculate the position of the last slide
            moveBy = slider.viewport.width() - lastChild.outerWidth();
          } else {
            // get last showing index position
            lastShowingIndex = slider.children.length - slider.settings.minSlides;
            position = slider.children.eq(lastShowingIndex).position();
          }
          // horizontal carousel, going previous while on first slide (infiniteLoop mode)
        } else if (slider.carousel && slider.active.last && direction === 'prev') {
          // get the last child position
          eq = slider.settings.moveSlides === 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
          lastChild = el.children('.bx-clone').eq(eq);
          position = lastChild.position();
        // if infinite loop and "Next" is clicked on the last slide
        } else if (direction === 'next' && slider.active.index === 0) {
          // get the last clone position
          position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
          slider.active.last = false;
        // normal non-zero requests
        } else if (slideIndex >= 0) {
          //parseInt is applied to allow floats for slides/page
          requestEl = slideIndex * parseInt(getMoveBy());
          position = slider.children.eq(requestEl).position();
        }

        /* If the position doesn't exist
         * (e.g. if you destroy the slider on a next click),
         * it doesn't throw an error.
         */
        if (typeof (position) !== 'undefined') {
          value = slider.settings.mode === 'horizontal' ? -(position.left - moveBy) : -position.top;
          // plugin values to be animated
          setPositionProperty(value, 'slide', slider.settings.speed);
        }
        slider.working = false;
      }
      if (slider.settings.ariaHidden) { applyAriaHiddenAttributes(slider.active.index * getMoveBy()); }
    };

    /**
     * Transitions to the next slide in the show
     */
    el.goToNextSlide = function() {
      // if infiniteLoop is false and last page is showing, disregard call
      if (!slider.settings.infiniteLoop && slider.active.last) { return; }
	  if (slider.working === true){ return ;}
      var pagerIndex = parseInt(slider.active.index) + 1;
      el.goToSlide(pagerIndex, 'next');
    };

    /**
     * Transitions to the prev slide in the show
     */
    el.goToPrevSlide = function() {
      // if infiniteLoop is false and last page is showing, disregard call
      if (!slider.settings.infiniteLoop && slider.active.index === 0) { return; }
	  if (slider.working === true){ return ;}
      var pagerIndex = parseInt(slider.active.index) - 1;
      el.goToSlide(pagerIndex, 'prev');
    };

    /**
     * Starts the auto show
     *
     * @param preventControlUpdate (boolean)
     *  - if true, auto controls state will not be updated
     */
    el.startAuto = function(preventControlUpdate) {
      // if an interval already exists, disregard call
      if (slider.interval) { return; }
      // create an interval
      slider.interval = setInterval(function() {
        if (slider.settings.autoDirection === 'next') {
          el.goToNextSlide();
        } else {
          el.goToPrevSlide();
        }
      }, slider.settings.pause);
	  //allback for when the auto rotate status changes
	  slider.settings.onAutoChange.call(el, true);
      // if auto controls are displayed and preventControlUpdate is not true
      if (slider.settings.autoControls && preventControlUpdate !== true) { updateAutoControls('stop'); }
    };

    /**
     * Stops the auto show
     *
     * @param preventControlUpdate (boolean)
     *  - if true, auto controls state will not be updated
     */
    el.stopAuto = function(preventControlUpdate) {
      // if slider is auto paused, just clear that state
      if (slider.autoPaused) slider.autoPaused = false;
      // if no interval exists, disregard call
      if (!slider.interval) { return; }
      // clear the interval
      clearInterval(slider.interval);
      slider.interval = null;
	  //allback for when the auto rotate status changes
	  slider.settings.onAutoChange.call(el, false);
      // if auto controls are displayed and preventControlUpdate is not true
      if (slider.settings.autoControls && preventControlUpdate !== true) { updateAutoControls('start'); }
    };

    /**
     * Returns current slide index (zero-based)
     */
    el.getCurrentSlide = function() {
      return slider.active.index;
    };

    /**
     * Returns current slide element
     */
    el.getCurrentSlideElement = function() {
      return slider.children.eq(slider.active.index);
    };

    /**
     * Returns a slide element
     * @param index (int)
     *  - The index (zero-based) of the element you want returned.
     */
    el.getSlideElement = function(index) {
      return slider.children.eq(index);
    };

    /**
     * Returns number of slides in show
     */
    el.getSlideCount = function() {
      return slider.children.length;
    };

    /**
     * Return slider.working variable
     */
    el.isWorking = function() {
      return slider.working;
    };

    /**
     * Update all dynamic slider elements
     */
    el.redrawSlider = function() {
      // resize all children in ratio to new screen size
      slider.children.add(el.find('.bx-clone')).outerWidth(getSlideWidth());
      // adjust the height
      slider.viewport.css('height', getViewportHeight());
      // update the slide position
      if (!slider.settings.ticker) { setSlidePosition(); }
      // if active.last was true before the screen resize, we want
      // to keep it last no matter what screen size we end on
      if (slider.active.last) { slider.active.index = getPagerQty() - 1; }
      // if the active index (page) no longer exists due to the resize, simply set the index as last
      if (slider.active.index >= getPagerQty()) { slider.active.last = true; }
      // if a pager is being displayed and a custom pager is not being used, update it
      if (slider.settings.pager && !slider.settings.pagerCustom) {
        populatePager();
        updatePagerActive(slider.active.index);
      }
      if (slider.settings.ariaHidden) { applyAriaHiddenAttributes(slider.active.index * getMoveBy()); }
    };

    /**
     * Destroy the current instance of the slider (revert everything back to original state)
     */
    el.destroySlider = function() {
      // don't do anything if slider has already been destroyed
      if (!slider.initialized) { return; }
      slider.initialized = false;
      $('.bx-clone', this).remove();
      slider.children.each(function() {
        if ($(this).data('origStyle') !== undefined) {
          $(this).attr('style', $(this).data('origStyle'));
        } else {
          $(this).removeAttr('style');
        }
      });
      if ($(this).data('origStyle') !== undefined) {
        this.attr('style', $(this).data('origStyle'));
      } else {
        $(this).removeAttr('style');
      }
      $(this).unwrap().unwrap();
      if (slider.controls.el) { slider.controls.el.remove(); }
      if (slider.controls.next) { slider.controls.next.remove(); }
      if (slider.controls.prev) { slider.controls.prev.remove(); }
      if (slider.pagerEl && slider.settings.controls && !slider.settings.pagerCustom) { slider.pagerEl.remove(); }
      $('.bx-caption', this).remove();
      if (slider.controls.autoEl) { slider.controls.autoEl.remove(); }
      clearInterval(slider.interval);
      if (slider.settings.responsive) { $(window).off('resize', resizeWindow); }
      if (slider.settings.keyboardEnabled) { $(document).off('keydown', keyPress); }
      //remove self reference in data
      $(this).removeData('bxSlider');
	  // remove global window handlers
	  $(window).off('blur', windowBlurHandler).off('focus', windowFocusHandler);
    };

    /**
     * Reload the slider (revert all DOM changes, and re-initialize)
     */
    el.reloadSlider = function(settings) {
      if (settings !== undefined) { options = settings; }
      el.destroySlider();
      init();
      //store reference to self in order to access public functions later
      $(el).data('bxSlider', this);
    };

    init();

    $(el).data('bxSlider', this);

    // returns the current jQuery object
    return this;
  };

})(jQuery);
;/**/
/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface
 * Copyright (c) 2009-2016 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v2.3.0
 */
!function(a,b){"use strict";var c,d,e,f=a,g=f.document,h=f.navigator,i=f.setTimeout,j=f.clearTimeout,k=f.setInterval,l=f.clearInterval,m=f.getComputedStyle,n=f.encodeURIComponent,o=f.ActiveXObject,p=f.Error,q=f.Number.parseInt||f.parseInt,r=f.Number.parseFloat||f.parseFloat,s=f.Number.isNaN||f.isNaN,t=f.Date.now,u=f.Object.keys,v=f.Object.prototype.hasOwnProperty,w=f.Array.prototype.slice,x=function(){var a=function(a){return a};if("function"==typeof f.wrap&&"function"==typeof f.unwrap)try{var b=g.createElement("div"),c=f.unwrap(b);1===b.nodeType&&c&&1===c.nodeType&&(a=f.unwrap)}catch(d){}return a}(),y=function(a){return w.call(a,0)},z=function(){var a,c,d,e,f,g,h=y(arguments),i=h[0]||{};for(a=1,c=h.length;c>a;a++)if(null!=(d=h[a]))for(e in d)v.call(d,e)&&(f=i[e],g=d[e],i!==g&&g!==b&&(i[e]=g));return i},A=function(a){var b,c,d,e;if("object"!=typeof a||null==a||"number"==typeof a.nodeType)b=a;else if("number"==typeof a.length)for(b=[],c=0,d=a.length;d>c;c++)v.call(a,c)&&(b[c]=A(a[c]));else{b={};for(e in a)v.call(a,e)&&(b[e]=A(a[e]))}return b},B=function(a,b){for(var c={},d=0,e=b.length;e>d;d++)b[d]in a&&(c[b[d]]=a[b[d]]);return c},C=function(a,b){var c={};for(var d in a)-1===b.indexOf(d)&&(c[d]=a[d]);return c},D=function(a){if(a)for(var b in a)v.call(a,b)&&delete a[b];return a},E=function(a,b){if(a&&1===a.nodeType&&a.ownerDocument&&b&&(1===b.nodeType&&b.ownerDocument&&b.ownerDocument===a.ownerDocument||9===b.nodeType&&!b.ownerDocument&&b===a.ownerDocument))do{if(a===b)return!0;a=a.parentNode}while(a);return!1},F=function(a){var b;return"string"==typeof a&&a&&(b=a.split("#")[0].split("?")[0],b=a.slice(0,a.lastIndexOf("/")+1)),b},G=function(a){var b,c;return"string"==typeof a&&a&&(c=a.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/),c&&c[1]?b=c[1]:(c=a.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/),c&&c[1]&&(b=c[1]))),b},H=function(){var a,b;try{throw new p}catch(c){b=c}return b&&(a=b.sourceURL||b.fileName||G(b.stack)),a},I=function(){var a,c,d;if(g.currentScript&&(a=g.currentScript.src))return a;if(c=g.getElementsByTagName("script"),1===c.length)return c[0].src||b;if("readyState"in(c[0]||document.createElement("script")))for(d=c.length;d--;)if("interactive"===c[d].readyState&&(a=c[d].src))return a;return"loading"===g.readyState&&(a=c[c.length-1].src)?a:(a=H())?a:b},J=function(){var a,c,d,e=g.getElementsByTagName("script");for(a=e.length;a--;){if(!(d=e[a].src)){c=null;break}if(d=F(d),null==c)c=d;else if(c!==d){c=null;break}}return c||b},K=function(){var a=F(I())||J()||"";return a+"ZeroClipboard.swf"},L=function(){var a=/win(dows|[\s]?(nt|me|ce|xp|vista|[\d]+))/i;return!!h&&(a.test(h.appVersion||"")||a.test(h.platform||"")||-1!==(h.userAgent||"").indexOf("Windows"))},M=function(){return null==f.opener&&(!!f.top&&f!=f.top||!!f.parent&&f!=f.parent)}(),N="html"===g.documentElement.nodeName,O={bridge:null,version:"0.0.0",pluginType:"unknown",sandboxed:null,disabled:null,outdated:null,insecure:null,unavailable:null,degraded:null,deactivated:null,overdue:null,ready:null},P="11.0.0",Q={},R={},S=null,T=0,U=0,V={ready:"Flash communication is established",error:{"flash-sandboxed":"Attempting to run Flash in a sandboxed iframe, which is impossible","flash-disabled":"Flash is disabled or not installed. May also be attempting to run Flash in a sandboxed iframe, which is impossible.","flash-outdated":"Flash is too outdated to support ZeroClipboard","flash-insecure":"Flash will be unable to communicate due to a protocol mismatch between your `swfPath` configuration and the page","flash-unavailable":"Flash is unable to communicate bidirectionally with JavaScript","flash-degraded":"Flash is unable to preserve data fidelity when communicating with JavaScript","flash-deactivated":"Flash is too outdated for your browser and/or is configured as click-to-activate.\nThis may also mean that the ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity.\nMay also be attempting to run Flash in a sandboxed iframe, which is impossible.","flash-overdue":"Flash communication was established but NOT within the acceptable time limit","version-mismatch":"ZeroClipboard JS version number does not match ZeroClipboard SWF version number","clipboard-error":"At least one error was thrown while ZeroClipboard was attempting to inject your data into the clipboard","config-mismatch":"ZeroClipboard configuration does not match Flash's reality","swf-not-found":"The ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity","browser-unsupported":"The browser does not support the required HTML DOM and JavaScript features"}},W=["flash-unavailable","flash-degraded","flash-overdue","version-mismatch","config-mismatch","clipboard-error"],X=["flash-sandboxed","flash-disabled","flash-outdated","flash-insecure","flash-unavailable","flash-degraded","flash-deactivated","flash-overdue"],Y=new RegExp("^flash-("+X.map(function(a){return a.replace(/^flash-/,"")}).join("|")+")$"),Z=new RegExp("^flash-("+X.filter(function(a){return"flash-disabled"!==a}).map(function(a){return a.replace(/^flash-/,"")}).join("|")+")$"),$={swfPath:K(),trustedDomains:f.location.host?[f.location.host]:[],cacheBust:!0,forceEnhancedClipboard:!1,flashLoadTimeout:3e4,autoActivate:!0,bubbleEvents:!0,fixLineEndings:!0,containerId:"global-zeroclipboard-html-bridge",containerClass:"global-zeroclipboard-container",swfObjectId:"global-zeroclipboard-flash-bridge",hoverClass:"zeroclipboard-is-hover",activeClass:"zeroclipboard-is-active",forceHandCursor:!1,title:null,zIndex:999999999},_=function(a){"object"!=typeof a||!a||"length"in a||u(a).forEach(function(b){if(/^(?:forceHandCursor|title|zIndex|bubbleEvents|fixLineEndings)$/.test(b))$[b]=a[b];else if(null==O.bridge)if("containerId"===b||"swfObjectId"===b){if(!qa(a[b]))throw new Error("The specified `"+b+"` value is not valid as an HTML4 Element ID");$[b]=a[b]}else $[b]=a[b]});{if("string"!=typeof a||!a)return A($);if(v.call($,a))return $[a]}},aa=function(){return Ya(),{browser:z(B(h,["userAgent","platform","appName","appVersion"]),{isSupported:ba()}),flash:C(O,["bridge"]),zeroclipboard:{version:$a.version,config:$a.config()}}},ba=function(){return!!(g.addEventListener&&f.Object.keys&&f.Array.prototype.map)},ca=function(){return!!(O.sandboxed||O.disabled||O.outdated||O.unavailable||O.degraded||O.deactivated)},da=function(a,d){var e,f,g,h={};if("string"==typeof a&&a?g=a.toLowerCase().split(/\s+/):"object"!=typeof a||!a||"length"in a||"undefined"!=typeof d||u(a).forEach(function(b){var c=a[b];"function"==typeof c&&$a.on(b,c)}),g&&g.length&&d){for(e=0,f=g.length;f>e;e++)a=g[e].replace(/^on/,""),h[a]=!0,Q[a]||(Q[a]=[]),Q[a].push(d);if(h.ready&&O.ready&&$a.emit({type:"ready"}),h.error){for(ba()||$a.emit({type:"error",name:"browser-unsupported"}),e=0,f=X.length;f>e;e++)if(O[X[e].replace(/^flash-/,"")]===!0){$a.emit({type:"error",name:X[e]});break}c!==b&&$a.version!==c&&$a.emit({type:"error",name:"version-mismatch",jsVersion:$a.version,swfVersion:c})}}return $a},ea=function(a,b){var c,d,e,f,g;if(0===arguments.length?f=u(Q):"string"==typeof a&&a?f=a.toLowerCase().split(/\s+/):"object"!=typeof a||!a||"length"in a||"undefined"!=typeof b||u(a).forEach(function(b){var c=a[b];"function"==typeof c&&$a.off(b,c)}),f&&f.length)for(c=0,d=f.length;d>c;c++)if(a=f[c].replace(/^on/,""),g=Q[a],g&&g.length)if(b)for(e=g.indexOf(b);-1!==e;)g.splice(e,1),e=g.indexOf(b,e);else g.length=0;return $a},fa=function(a){var b;return b="string"==typeof a&&a?A(Q[a])||null:A(Q)},ga=function(a){var b,c,d;return a=ra(a),a&&!ya(a)?"ready"===a.type&&O.overdue===!0?$a.emit({type:"error",name:"flash-overdue"}):(b=z({},a),wa.call(this,b),"copy"===a.type&&(d=Ha(R),c=d.data,S=d.formatMap),c):void 0},ha=function(){var a=$.swfPath||"",b=a.slice(0,2),c=a.slice(0,a.indexOf("://")+1);return"\\\\"===b?"file:":"//"===b||""===c?f.location.protocol:c},ia=function(){var a,b,c=O.sandboxed;return ba()?(Ya(),"boolean"!=typeof O.ready&&(O.ready=!1),void(O.sandboxed!==c&&O.sandboxed===!0?(O.ready=!1,$a.emit({type:"error",name:"flash-sandboxed"})):$a.isFlashUnusable()||null!==O.bridge||(b=ha(),b&&b!==f.location.protocol?$a.emit({type:"error",name:"flash-insecure"}):(a=$.flashLoadTimeout,"number"==typeof a&&a>=0&&(T=i(function(){"boolean"!=typeof O.deactivated&&(O.deactivated=!0),O.deactivated===!0&&$a.emit({type:"error",name:"flash-deactivated"})},a)),O.overdue=!1,Fa())))):(O.ready=!1,void $a.emit({type:"error",name:"browser-unsupported"}))},ja=function(){$a.clearData(),$a.blur(),$a.emit("destroy"),Ga(),$a.off()},ka=function(a,b){var c;if("object"==typeof a&&a&&"undefined"==typeof b)c=a,$a.clearData();else{if("string"!=typeof a||!a)return;c={},c[a]=b}for(var d in c)"string"==typeof d&&d&&v.call(c,d)&&"string"==typeof c[d]&&c[d]&&(R[d]=Xa(c[d]))},la=function(a){"undefined"==typeof a?(D(R),S=null):"string"==typeof a&&v.call(R,a)&&delete R[a]},ma=function(a){return"undefined"==typeof a?A(R):"string"==typeof a&&v.call(R,a)?R[a]:void 0},na=function(a){if(a&&1===a.nodeType){d&&(Pa(d,$.activeClass),d!==a&&Pa(d,$.hoverClass)),d=a,Oa(a,$.hoverClass);var b=a.getAttribute("title")||$.title;if("string"==typeof b&&b){var c=Da(O.bridge);c&&c.setAttribute("title",b)}var e=$.forceHandCursor===!0||"pointer"===Qa(a,"cursor");Va(e),Ua()}},oa=function(){var a=Da(O.bridge);a&&(a.removeAttribute("title"),a.style.left="0px",a.style.top="-9999px",a.style.width="1px",a.style.height="1px"),d&&(Pa(d,$.hoverClass),Pa(d,$.activeClass),d=null)},pa=function(){return d||null},qa=function(a){return"string"==typeof a&&a&&/^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(a)},ra=function(a){var b;if("string"==typeof a&&a?(b=a,a={}):"object"==typeof a&&a&&"string"==typeof a.type&&a.type&&(b=a.type),b){b=b.toLowerCase(),!a.target&&(/^(copy|aftercopy|_click)$/.test(b)||"error"===b&&"clipboard-error"===a.name)&&(a.target=e),z(a,{type:b,target:a.target||d||null,relatedTarget:a.relatedTarget||null,currentTarget:O&&O.bridge||null,timeStamp:a.timeStamp||t()||null});var c=V[a.type];return"error"===a.type&&a.name&&c&&(c=c[a.name]),c&&(a.message=c),"ready"===a.type&&z(a,{target:null,version:O.version}),"error"===a.type&&(Y.test(a.name)&&z(a,{target:null,minimumVersion:P}),Z.test(a.name)&&z(a,{version:O.version}),"flash-insecure"===a.name&&z(a,{pageProtocol:f.location.protocol,swfProtocol:ha()})),"copy"===a.type&&(a.clipboardData={setData:$a.setData,clearData:$a.clearData}),"aftercopy"===a.type&&(a=Ia(a,S)),a.target&&!a.relatedTarget&&(a.relatedTarget=sa(a.target)),ta(a)}},sa=function(a){var b=a&&a.getAttribute&&a.getAttribute("data-clipboard-target");return b?g.getElementById(b):null},ta=function(a){if(a&&/^_(?:click|mouse(?:over|out|down|up|move))$/.test(a.type)){var c=a.target,d="_mouseover"===a.type&&a.relatedTarget?a.relatedTarget:b,e="_mouseout"===a.type&&a.relatedTarget?a.relatedTarget:b,h=Ra(c),i=f.screenLeft||f.screenX||0,j=f.screenTop||f.screenY||0,k=g.body.scrollLeft+g.documentElement.scrollLeft,l=g.body.scrollTop+g.documentElement.scrollTop,m=h.left+("number"==typeof a._stageX?a._stageX:0),n=h.top+("number"==typeof a._stageY?a._stageY:0),o=m-k,p=n-l,q=i+o,r=j+p,s="number"==typeof a.movementX?a.movementX:0,t="number"==typeof a.movementY?a.movementY:0;delete a._stageX,delete a._stageY,z(a,{srcElement:c,fromElement:d,toElement:e,screenX:q,screenY:r,pageX:m,pageY:n,clientX:o,clientY:p,x:o,y:p,movementX:s,movementY:t,offsetX:0,offsetY:0,layerX:0,layerY:0})}return a},ua=function(a){var b=a&&"string"==typeof a.type&&a.type||"";return!/^(?:(?:before)?copy|destroy)$/.test(b)},va=function(a,b,c,d){d?i(function(){a.apply(b,c)},0):a.apply(b,c)},wa=function(a){if("object"==typeof a&&a&&a.type){var b=ua(a),c=Q["*"]||[],d=Q[a.type]||[],e=c.concat(d);if(e&&e.length){var g,h,i,j,k,l=this;for(g=0,h=e.length;h>g;g++)i=e[g],j=l,"string"==typeof i&&"function"==typeof f[i]&&(i=f[i]),"object"==typeof i&&i&&"function"==typeof i.handleEvent&&(j=i,i=i.handleEvent),"function"==typeof i&&(k=z({},a),va(i,j,[k],b))}return this}},xa=function(a){var b=null;return(M===!1||a&&"error"===a.type&&a.name&&-1!==W.indexOf(a.name))&&(b=!1),b},ya=function(a){var b=a.target||d||null,f="swf"===a._source;switch(delete a._source,a.type){case"error":var g="flash-sandboxed"===a.name||xa(a);"boolean"==typeof g&&(O.sandboxed=g),"browser-unsupported"===a.name?z(O,{disabled:!1,outdated:!1,unavailable:!1,degraded:!1,deactivated:!1,overdue:!1,ready:!1}):-1!==X.indexOf(a.name)?z(O,{disabled:"flash-disabled"===a.name,outdated:"flash-outdated"===a.name,insecure:"flash-insecure"===a.name,unavailable:"flash-unavailable"===a.name,degraded:"flash-degraded"===a.name,deactivated:"flash-deactivated"===a.name,overdue:"flash-overdue"===a.name,ready:!1}):"version-mismatch"===a.name&&(c=a.swfVersion,z(O,{disabled:!1,outdated:!1,insecure:!1,unavailable:!1,degraded:!1,deactivated:!1,overdue:!1,ready:!1})),Ta();break;case"ready":c=a.swfVersion;var h=O.deactivated===!0;z(O,{sandboxed:!1,disabled:!1,outdated:!1,insecure:!1,unavailable:!1,degraded:!1,deactivated:!1,overdue:h,ready:!h}),Ta();break;case"beforecopy":e=b;break;case"copy":var i,j,k=a.relatedTarget;!R["text/html"]&&!R["text/plain"]&&k&&(j=k.value||k.outerHTML||k.innerHTML)&&(i=k.value||k.textContent||k.innerText)?(a.clipboardData.clearData(),a.clipboardData.setData("text/plain",i),j!==i&&a.clipboardData.setData("text/html",j)):!R["text/plain"]&&a.target&&(i=a.target.getAttribute("data-clipboard-text"))&&(a.clipboardData.clearData(),a.clipboardData.setData("text/plain",i));break;case"aftercopy":za(a),$a.clearData(),b&&b!==Na()&&b.focus&&b.focus();break;case"_mouseover":$a.focus(b),$.bubbleEvents===!0&&f&&(b&&b!==a.relatedTarget&&!E(a.relatedTarget,b)&&Aa(z({},a,{type:"mouseenter",bubbles:!1,cancelable:!1})),Aa(z({},a,{type:"mouseover"})));break;case"_mouseout":$a.blur(),$.bubbleEvents===!0&&f&&(b&&b!==a.relatedTarget&&!E(a.relatedTarget,b)&&Aa(z({},a,{type:"mouseleave",bubbles:!1,cancelable:!1})),Aa(z({},a,{type:"mouseout"})));break;case"_mousedown":Oa(b,$.activeClass),$.bubbleEvents===!0&&f&&Aa(z({},a,{type:a.type.slice(1)}));break;case"_mouseup":Pa(b,$.activeClass),$.bubbleEvents===!0&&f&&Aa(z({},a,{type:a.type.slice(1)}));break;case"_click":e=null,$.bubbleEvents===!0&&f&&Aa(z({},a,{type:a.type.slice(1)}));break;case"_mousemove":$.bubbleEvents===!0&&f&&Aa(z({},a,{type:a.type.slice(1)}))}return/^_(?:click|mouse(?:over|out|down|up|move))$/.test(a.type)?!0:void 0},za=function(a){if(a.errors&&a.errors.length>0){var b=A(a);z(b,{type:"error",name:"clipboard-error"}),delete b.success,i(function(){$a.emit(b)},0)}},Aa=function(a){if(a&&"string"==typeof a.type&&a){var b,c=a.target||null,d=c&&c.ownerDocument||g,e={view:d.defaultView||f,canBubble:!0,cancelable:!0,detail:"click"===a.type?1:0,button:"number"==typeof a.which?a.which-1:"number"==typeof a.button?a.button:d.createEvent?0:1},h=z(e,a);c&&d.createEvent&&c.dispatchEvent&&(h=[h.type,h.canBubble,h.cancelable,h.view,h.detail,h.screenX,h.screenY,h.clientX,h.clientY,h.ctrlKey,h.altKey,h.shiftKey,h.metaKey,h.button,h.relatedTarget],b=d.createEvent("MouseEvents"),b.initMouseEvent&&(b.initMouseEvent.apply(b,h),b._source="js",c.dispatchEvent(b)))}},Ba=function(){var a=$.flashLoadTimeout;if("number"==typeof a&&a>=0){var b=Math.min(1e3,a/10),c=$.swfObjectId+"_fallbackContent";U=k(function(){var a=g.getElementById(c);Sa(a)&&(Ta(),O.deactivated=null,$a.emit({type:"error",name:"swf-not-found"}))},b)}},Ca=function(){var a=g.createElement("div");return a.id=$.containerId,a.className=$.containerClass,a.style.position="absolute",a.style.left="0px",a.style.top="-9999px",a.style.width="1px",a.style.height="1px",a.style.zIndex=""+Wa($.zIndex),a},Da=function(a){for(var b=a&&a.parentNode;b&&"OBJECT"===b.nodeName&&b.parentNode;)b=b.parentNode;return b||null},Ea=function(a){return"string"==typeof a&&a?a.replace(/["&'<>]/g,function(a){switch(a){case'"':return"&quot;";case"&":return"&amp;";case"'":return"&apos;";case"<":return"&lt;";case">":return"&gt;";default:return a}}):a},Fa=function(){var a,b=O.bridge,c=Da(b);if(!b){var d=Ma(f.location.host,$),e="never"===d?"none":"all",h=Ka(z({jsVersion:$a.version},$)),i=$.swfPath+Ja($.swfPath,$);N&&(i=Ea(i)),c=Ca();var j=g.createElement("div");c.appendChild(j),g.body.appendChild(c);var k=g.createElement("div"),l="activex"===O.pluginType;k.innerHTML='<object id="'+$.swfObjectId+'" name="'+$.swfObjectId+'" width="100%" height="100%" '+(l?'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"':'type="application/x-shockwave-flash" data="'+i+'"')+">"+(l?'<param name="movie" value="'+i+'"/>':"")+'<param name="allowScriptAccess" value="'+d+'"/><param name="allowNetworking" value="'+e+'"/><param name="menu" value="false"/><param name="wmode" value="transparent"/><param name="flashvars" value="'+h+'"/><div id="'+$.swfObjectId+'_fallbackContent">&nbsp;</div></object>',b=k.firstChild,k=null,x(b).ZeroClipboard=$a,c.replaceChild(b,j),Ba()}return b||(b=g[$.swfObjectId],b&&(a=b.length)&&(b=b[a-1]),!b&&c&&(b=c.firstChild)),O.bridge=b||null,b},Ga=function(){var a=O.bridge;if(a){var d=Da(a);d&&("activex"===O.pluginType&&"readyState"in a?(a.style.display="none",function e(){if(4===a.readyState){for(var b in a)"function"==typeof a[b]&&(a[b]=null);a.parentNode&&a.parentNode.removeChild(a),d.parentNode&&d.parentNode.removeChild(d)}else i(e,10)}()):(a.parentNode&&a.parentNode.removeChild(a),d.parentNode&&d.parentNode.removeChild(d))),Ta(),O.ready=null,O.bridge=null,O.deactivated=null,O.insecure=null,c=b}},Ha=function(a){var b={},c={};if("object"==typeof a&&a){for(var d in a)if(d&&v.call(a,d)&&"string"==typeof a[d]&&a[d])switch(d.toLowerCase()){case"text/plain":case"text":case"air:text":case"flash:text":b.text=a[d],c.text=d;break;case"text/html":case"html":case"air:html":case"flash:html":b.html=a[d],c.html=d;break;case"application/rtf":case"text/rtf":case"rtf":case"richtext":case"air:rtf":case"flash:rtf":b.rtf=a[d],c.rtf=d}return{data:b,formatMap:c}}},Ia=function(a,b){if("object"!=typeof a||!a||"object"!=typeof b||!b)return a;var c={};for(var d in a)if(v.call(a,d))if("errors"===d){c[d]=a[d]?a[d].slice():[];for(var e=0,f=c[d].length;f>e;e++)c[d][e].format=b[c[d][e].format]}else if("success"!==d&&"data"!==d)c[d]=a[d];else{c[d]={};var g=a[d];for(var h in g)h&&v.call(g,h)&&v.call(b,h)&&(c[d][b[h]]=g[h])}return c},Ja=function(a,b){var c=null==b||b&&b.cacheBust===!0;return c?(-1===a.indexOf("?")?"?":"&")+"noCache="+t():""},Ka=function(a){var b,c,d,e,g="",h=[];if(a.trustedDomains&&("string"==typeof a.trustedDomains?e=[a.trustedDomains]:"object"==typeof a.trustedDomains&&"length"in a.trustedDomains&&(e=a.trustedDomains)),e&&e.length)for(b=0,c=e.length;c>b;b++)if(v.call(e,b)&&e[b]&&"string"==typeof e[b]){if(d=La(e[b]),!d)continue;if("*"===d){h.length=0,h.push(d);break}h.push.apply(h,[d,"//"+d,f.location.protocol+"//"+d])}return h.length&&(g+="trustedOrigins="+n(h.join(","))),a.forceEnhancedClipboard===!0&&(g+=(g?"&":"")+"forceEnhancedClipboard=true"),"string"==typeof a.swfObjectId&&a.swfObjectId&&(g+=(g?"&":"")+"swfObjectId="+n(a.swfObjectId)),"string"==typeof a.jsVersion&&a.jsVersion&&(g+=(g?"&":"")+"jsVersion="+n(a.jsVersion)),g},La=function(a){if(null==a||""===a)return null;if(a=a.replace(/^\s+|\s+$/g,""),""===a)return null;var b=a.indexOf("//");a=-1===b?a:a.slice(b+2);var c=a.indexOf("/");return a=-1===c?a:-1===b||0===c?null:a.slice(0,c),a&&".swf"===a.slice(-4).toLowerCase()?null:a||null},Ma=function(){var a=function(a){var b,c,d,e=[];if("string"==typeof a&&(a=[a]),"object"!=typeof a||!a||"number"!=typeof a.length)return e;for(b=0,c=a.length;c>b;b++)if(v.call(a,b)&&(d=La(a[b]))){if("*"===d){e.length=0,e.push("*");break}-1===e.indexOf(d)&&e.push(d)}return e};return function(b,c){var d=La(c.swfPath);null===d&&(d=b);var e=a(c.trustedDomains),f=e.length;if(f>0){if(1===f&&"*"===e[0])return"always";if(-1!==e.indexOf(b))return 1===f&&b===d?"sameDomain":"always"}return"never"}}(),Na=function(){try{return g.activeElement}catch(a){return null}},Oa=function(a,b){var c,d,e,f=[];if("string"==typeof b&&b&&(f=b.split(/\s+/)),a&&1===a.nodeType&&f.length>0){for(e=(" "+(a.className||"")+" ").replace(/[\t\r\n\f]/g," "),c=0,d=f.length;d>c;c++)-1===e.indexOf(" "+f[c]+" ")&&(e+=f[c]+" ");e=e.replace(/^\s+|\s+$/g,""),e!==a.className&&(a.className=e)}return a},Pa=function(a,b){var c,d,e,f=[];if("string"==typeof b&&b&&(f=b.split(/\s+/)),a&&1===a.nodeType&&f.length>0&&a.className){for(e=(" "+a.className+" ").replace(/[\t\r\n\f]/g," "),c=0,d=f.length;d>c;c++)e=e.replace(" "+f[c]+" "," ");e=e.replace(/^\s+|\s+$/g,""),e!==a.className&&(a.className=e)}return a},Qa=function(a,b){var c=m(a,null).getPropertyValue(b);return"cursor"!==b||c&&"auto"!==c||"A"!==a.nodeName?c:"pointer"},Ra=function(a){var b={left:0,top:0,width:0,height:0};if(a.getBoundingClientRect){var c=a.getBoundingClientRect(),d=f.pageXOffset,e=f.pageYOffset,h=g.documentElement.clientLeft||0,i=g.documentElement.clientTop||0,j=0,k=0;if("relative"===Qa(g.body,"position")){var l=g.body.getBoundingClientRect(),m=g.documentElement.getBoundingClientRect();j=l.left-m.left||0,k=l.top-m.top||0}b.left=c.left+d-h-j,b.top=c.top+e-i-k,b.width="width"in c?c.width:c.right-c.left,b.height="height"in c?c.height:c.bottom-c.top}return b},Sa=function(a){if(!a)return!1;var b=m(a,null);if(!b)return!1;var c=r(b.height)>0,d=r(b.width)>0,e=r(b.top)>=0,f=r(b.left)>=0,g=c&&d&&e&&f,h=g?null:Ra(a),i="none"!==b.display&&"collapse"!==b.visibility&&(g||!!h&&(c||h.height>0)&&(d||h.width>0)&&(e||h.top>=0)&&(f||h.left>=0));return i},Ta=function(){j(T),T=0,l(U),U=0},Ua=function(){var a;if(d&&(a=Da(O.bridge))){var b=Ra(d);z(a.style,{width:b.width+"px",height:b.height+"px",top:b.top+"px",left:b.left+"px",zIndex:""+Wa($.zIndex)})}},Va=function(a){O.ready===!0&&(O.bridge&&"function"==typeof O.bridge.setHandCursor?O.bridge.setHandCursor(a):O.ready=!1)},Wa=function(a){if(/^(?:auto|inherit)$/.test(a))return a;var b;return"number"!=typeof a||s(a)?"string"==typeof a&&(b=Wa(q(a,10))):b=a,"number"==typeof b?b:"auto"},Xa=function(a){var b=/(\r\n|\r|\n)/g;return"string"==typeof a&&$.fixLineEndings===!0&&(L()?/((^|[^\r])\n|\r([^\n]|$))/.test(a)&&(a=a.replace(b,"\r\n")):/\r/.test(a)&&(a=a.replace(b,"\n"))),a},Ya=function(b){var c,d,e,f=O.sandboxed,g=null;if(b=b===!0,M===!1)g=!1;else{try{d=a.frameElement||null}catch(h){e={name:h.name,message:h.message}}if(d&&1===d.nodeType&&"IFRAME"===d.nodeName)try{g=d.hasAttribute("sandbox")}catch(h){g=null}else{try{c=document.domain||null}catch(h){c=null}(null===c||e&&"SecurityError"===e.name&&/(^|[\s\(\[@])sandbox(es|ed|ing|[\s\.,!\)\]@]|$)/.test(e.message.toLowerCase()))&&(g=!0)}}return O.sandboxed=g,f===g||b||Za(o),g},Za=function(a){function b(a){var b=a.match(/[\d]+/g);return b.length=3,b.join(".")}function c(a){return!!a&&(a=a.toLowerCase())&&(/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(a)||"chrome.plugin"===a.slice(-13))}function d(a){a&&(i=!0,a.version&&(l=b(a.version)),!l&&a.description&&(l=b(a.description)),a.filename&&(k=c(a.filename)))}var e,f,g,i=!1,j=!1,k=!1,l="";if(h.plugins&&h.plugins.length)e=h.plugins["Shockwave Flash"],d(e),h.plugins["Shockwave Flash 2.0"]&&(i=!0,l="2.0.0.11");else if(h.mimeTypes&&h.mimeTypes.length)g=h.mimeTypes["application/x-shockwave-flash"],e=g&&g.enabledPlugin,d(e);else if("undefined"!=typeof a){j=!0;try{f=new a("ShockwaveFlash.ShockwaveFlash.7"),i=!0,l=b(f.GetVariable("$version"))}catch(m){try{f=new a("ShockwaveFlash.ShockwaveFlash.6"),i=!0,l="6.0.21"}catch(n){try{f=new a("ShockwaveFlash.ShockwaveFlash"),i=!0,l=b(f.GetVariable("$version"))}catch(o){j=!1}}}}O.disabled=i!==!0,O.outdated=l&&r(l)<r(P),O.version=l||"0.0.0",O.pluginType=k?"pepper":j?"activex":i?"netscape":"unknown"};Za(o),Ya(!0);var $a=function(){return this instanceof $a?void("function"==typeof $a._createClient&&$a._createClient.apply(this,y(arguments))):new $a};$a.version="2.3.0",$a.config=function(){return _.apply(this,y(arguments))},$a.state=function(){return aa.apply(this,y(arguments))},$a.isFlashUnusable=function(){return ca.apply(this,y(arguments))},$a.on=function(){return da.apply(this,y(arguments))},$a.off=function(){return ea.apply(this,y(arguments))},$a.handlers=function(){return fa.apply(this,y(arguments))},$a.emit=function(){return ga.apply(this,y(arguments))},$a.create=function(){return ia.apply(this,y(arguments))},$a.destroy=function(){return ja.apply(this,y(arguments))},$a.setData=function(){return ka.apply(this,y(arguments))},$a.clearData=function(){return la.apply(this,y(arguments))},$a.getData=function(){return ma.apply(this,y(arguments))},$a.focus=$a.activate=function(){return na.apply(this,y(arguments))},$a.blur=$a.deactivate=function(){return oa.apply(this,y(arguments))},$a.activeElement=function(){return pa.apply(this,y(arguments))};var _a=0,ab={},bb=0,cb={},db={};z($,{autoActivate:!0});var eb=function(a){var b,c=this;c.id=""+_a++,b={instance:c,elements:[],handlers:{},coreWildcardHandler:function(a){return c.emit(a)}},ab[c.id]=b,a&&c.clip(a),$a.on("*",b.coreWildcardHandler),$a.on("destroy",function(){c.destroy()}),$a.create()},fb=function(a,d){var e,f,g,h={},i=this,j=ab[i.id],k=j&&j.handlers;if(!j)throw new Error("Attempted to add new listener(s) to a destroyed ZeroClipboard client instance");if("string"==typeof a&&a?g=a.toLowerCase().split(/\s+/):"object"!=typeof a||!a||"length"in a||"undefined"!=typeof d||u(a).forEach(function(b){var c=a[b];"function"==typeof c&&i.on(b,c)}),g&&g.length&&d){for(e=0,f=g.length;f>e;e++)a=g[e].replace(/^on/,""),h[a]=!0,k[a]||(k[a]=[]),k[a].push(d);if(h.ready&&O.ready&&this.emit({type:"ready",client:this}),h.error){for(e=0,f=X.length;f>e;e++)if(O[X[e].replace(/^flash-/,"")]){this.emit({type:"error",name:X[e],client:this});break}c!==b&&$a.version!==c&&this.emit({type:"error",name:"version-mismatch",jsVersion:$a.version,swfVersion:c})}}return i},gb=function(a,b){var c,d,e,f,g,h=this,i=ab[h.id],j=i&&i.handlers;if(!j)return h;if(0===arguments.length?f=u(j):"string"==typeof a&&a?f=a.split(/\s+/):"object"!=typeof a||!a||"length"in a||"undefined"!=typeof b||u(a).forEach(function(b){var c=a[b];"function"==typeof c&&h.off(b,c)}),f&&f.length)for(c=0,d=f.length;d>c;c++)if(a=f[c].toLowerCase().replace(/^on/,""),g=j[a],g&&g.length)if(b)for(e=g.indexOf(b);-1!==e;)g.splice(e,1),e=g.indexOf(b,e);else g.length=0;return h},hb=function(a){var b=null,c=ab[this.id]&&ab[this.id].handlers;return c&&(b="string"==typeof a&&a?c[a]?c[a].slice(0):[]:A(c)),b},ib=function(a){var b,c=this;return nb.call(c,a)&&("object"==typeof a&&a&&"string"==typeof a.type&&a.type&&(a=z({},a)),b=z({},ra(a),{client:c}),ob.call(c,b)),c},jb=function(a){if(!ab[this.id])throw new Error("Attempted to clip element(s) to a destroyed ZeroClipboard client instance");a=pb(a);for(var b=0;b<a.length;b++)if(v.call(a,b)&&a[b]&&1===a[b].nodeType){a[b].zcClippingId?-1===cb[a[b].zcClippingId].indexOf(this.id)&&cb[a[b].zcClippingId].push(this.id):(a[b].zcClippingId="zcClippingId_"+bb++,cb[a[b].zcClippingId]=[this.id],$.autoActivate===!0&&qb(a[b]));var c=ab[this.id]&&ab[this.id].elements;-1===c.indexOf(a[b])&&c.push(a[b])}return this},kb=function(a){var b=ab[this.id];if(!b)return this;var c,d=b.elements;a="undefined"==typeof a?d.slice(0):pb(a);for(var e=a.length;e--;)if(v.call(a,e)&&a[e]&&1===a[e].nodeType){for(c=0;-1!==(c=d.indexOf(a[e],c));)d.splice(c,1);var f=cb[a[e].zcClippingId];if(f){for(c=0;-1!==(c=f.indexOf(this.id,c));)f.splice(c,1);0===f.length&&($.autoActivate===!0&&rb(a[e]),delete a[e].zcClippingId)}}return this},lb=function(){var a=ab[this.id];return a&&a.elements?a.elements.slice(0):[]},mb=function(){var a=ab[this.id];a&&(this.unclip(),this.off(),$a.off("*",a.coreWildcardHandler),delete ab[this.id])},nb=function(a){if(!a||!a.type)return!1;if(a.client&&a.client!==this)return!1;var b=ab[this.id],c=b&&b.elements,d=!!c&&c.length>0,e=!a.target||d&&-1!==c.indexOf(a.target),f=a.relatedTarget&&d&&-1!==c.indexOf(a.relatedTarget),g=a.client&&a.client===this;return b&&(e||f||g)?!0:!1},ob=function(a){var b=ab[this.id];if("object"==typeof a&&a&&a.type&&b){var c=ua(a),d=b&&b.handlers["*"]||[],e=b&&b.handlers[a.type]||[],g=d.concat(e);if(g&&g.length){var h,i,j,k,l,m=this;for(h=0,i=g.length;i>h;h++)j=g[h],k=m,"string"==typeof j&&"function"==typeof f[j]&&(j=f[j]),"object"==typeof j&&j&&"function"==typeof j.handleEvent&&(k=j,j=j.handleEvent),"function"==typeof j&&(l=z({},a),va(j,k,[l],c))}}},pb=function(a){return"string"==typeof a&&(a=[]),"number"!=typeof a.length?[a]:a},qb=function(a){if(a&&1===a.nodeType){var b=function(a){(a||(a=f.event))&&("js"!==a._source&&(a.stopImmediatePropagation(),a.preventDefault()),delete a._source)},c=function(c){(c||(c=f.event))&&(b(c),$a.focus(a))};a.addEventListener("mouseover",c,!1),a.addEventListener("mouseout",b,!1),a.addEventListener("mouseenter",b,!1),a.addEventListener("mouseleave",b,!1),a.addEventListener("mousemove",b,!1),db[a.zcClippingId]={mouseover:c,mouseout:b,mouseenter:b,mouseleave:b,mousemove:b}}},rb=function(a){if(a&&1===a.nodeType){var b=db[a.zcClippingId];if("object"==typeof b&&b){for(var c,d,e=["move","leave","enter","out","over"],f=0,g=e.length;g>f;f++)c="mouse"+e[f],d=b[c],"function"==typeof d&&a.removeEventListener(c,d,!1);delete db[a.zcClippingId]}}};$a._createClient=function(){eb.apply(this,y(arguments))},$a.prototype.on=function(){return fb.apply(this,y(arguments))},$a.prototype.off=function(){return gb.apply(this,y(arguments))},$a.prototype.handlers=function(){return hb.apply(this,y(arguments))},$a.prototype.emit=function(){return ib.apply(this,y(arguments))},$a.prototype.clip=function(){return jb.apply(this,y(arguments))},$a.prototype.unclip=function(){return kb.apply(this,y(arguments))},$a.prototype.elements=function(){return lb.apply(this,y(arguments))},$a.prototype.destroy=function(){return mb.apply(this,y(arguments))},$a.prototype.setText=function(a){if(!ab[this.id])throw new Error("Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance");return $a.setData("text/plain",a),this},$a.prototype.setHtml=function(a){if(!ab[this.id])throw new Error("Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance");return $a.setData("text/html",a),this},$a.prototype.setRichText=function(a){if(!ab[this.id])throw new Error("Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance");return $a.setData("application/rtf",a),this},$a.prototype.setData=function(){if(!ab[this.id])throw new Error("Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance");return $a.setData.apply(this,y(arguments)),this},$a.prototype.clearData=function(){if(!ab[this.id])throw new Error("Attempted to clear pending clipboard data from a destroyed ZeroClipboard client instance");return $a.clearData.apply(this,y(arguments)),this},$a.prototype.getData=function(){if(!ab[this.id])throw new Error("Attempted to get pending clipboard data from a destroyed ZeroClipboard client instance");return $a.getData.apply(this,y(arguments))},"function"==typeof define&&define.amd?define(function(){return $a}):"object"==typeof module&&module&&"object"==typeof module.exports&&module.exports?module.exports=$a:a.ZeroClipboard=$a}(function(){return this||window}());
//# sourceMappingURL=ZeroClipboard.min.map;/**/
/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
;/**/
/**
 * jquery.keyboard-focus.js (defines classes for when focus was obtained via the keyboard)
 * 
 * @version 0.3
 * Changelog:
 *   * 0.1 Initial implementation
 *   * 0.2 Added support for 'focus' class to appear whenever an element is foccued. 
 *     Useful for browsers like IE6 that don't support :focus
 *   * 0.3 Added support for 'mouse-focus' class so that :focus styles can be strong for keyboard by default
 *     with more subtle style for .mouse-focus events.
 * 
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/key-focus/
 * @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
 * @requires jQuery (tested with version 1.3.1) <http://jquery.com/>
 */

if (typeof jQuery == 'undefined') {
	if (console && console.log) { console.log('Keyboard Focus plugin could not be initialised because jQuery is not available'); }
} else { /* Start if jQuery exists */

jQuery.keyFocus = {};
jQuery.keyFocus.conf = {
	keyFocusClass : 'keyboard-focus',
	mouseFocusClass : 'mouse-focus',
	focusClass : 'focus',
	mouseTimeout  : 50
};

(function($){ /* start closure (protects variables from global scope) */
	
	$(document).ready(function(){
		$('body').trackFocus();
	});
	
	/**
	 * @see http://www.w3.org/TR/wai-aria-practices/#kbd_generalnav
	 * @param DOMNode this The container element that acts as "toolbar" for the controls.
	 * @param jQuerySelector controlSelector Individual controls to navigate between.
	 * @param Object options A set of options to override the $.AKN.defaultOptions. 
	 */
	$.fn.trackFocus = function () {
		$(this).data('last-device-used', '');
		
		$(this)
			.bind('mousedown', function(e){
				$(this).data('last-device-used', 'mouse');
				$(this).data('last-device-used-when', new Date().getTime());
			})
			.bind('keydown', function(e){
				$(this).data('last-device-used', 'keyboard');
			})
			.bind('focusin', function(e){
				// Keyboard events sometimes go undetected (if tabbing in from outside the document,
				// but mouse clicks used to focus will always be closely
				// followed by the focus event. Clearing the last-device-used
				// after a short timeout and assuming keyboard when no device is known
				// works!
					if ($(this).data('last-device-used') != 'mouse' || new Date().getTime()-50 > $(this).data('last-device-used-when')) {
						$(e.target).addClass($.keyFocus.conf.keyFocusClass);
					} else {
						$(e.target).addClass($.keyFocus.conf.mouseFocusClass);
					}
					$(e.target).addClass($.keyFocus.conf.focusClass);
			})
			.bind('focusout', function(e){
				$('.'+$.keyFocus.conf.keyFocusClass+', .'+$.keyFocus.conf.mouseFocusClass).removeClass($.keyFocus.conf.keyFocusClass+' '+$.keyFocus.conf.mouseFocusClass);
				$(e.target).removeClass($.keyFocus.conf.focusClass);
			})
		;
	};
		
	
	
})(jQuery); /* end closure */
} /* end if jQuery exists */;/**/
