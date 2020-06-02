(function ($) {
  Drupal.behaviors.tgHeaderPromo = {
    attach: function (context) {
      $('.header__promo', context).once('header-promo', function () {
        // Not needed on small screen.
        if (Drupal.windowSize.width < 1000) {
          return;
        }

        var $this = $(this)
        var index, cookieConsent;

        // if one_trust integration is enabled lets check the users consent first.
        if (Drupal.settings.tg_onetrust.enabled) {
          var onetrust_cookie = window.Cookies.get('OptanonConsent');

          // The "C0003:1" represents cookie group "3" (functional cookies) and 1 for enabled.
          if (onetrust_cookie.indexOf("C0003:1") >= 0) {
            cookieConsent = true;
            index = parseInt(window.Cookies.get('headerPromoLast'), 10) + 1 || 0;
          } else {
            cookieConsent = false;
            index = 0;
          }
        }

        var custom_index = (index === 0) ? 1 : index;
        var custom_promo;

        // Get custom header promos and select the rendered entity,
        // where the slot position matches the custom index set above.
        $.get('/custom-header-promo.json', function success(results) {
          $.each(results, function (idx, element) {
            if (element.field_slot_position == custom_index) {
              custom_promo = element.rendered_entity;
            }
          });
        });

        $.get('/header-promo.json', function success(results) {
          if (results[index] === undefined) {
            index = 0;
          }

          var content = '<h3 class="header__promo-title">' + Drupal.t('In the news') + '</h3>';

          // Show original or custom promo.
          if (custom_promo === undefined) {
            // News promo from homepage mosaic.
            content += '<div class="header__promo-content">' + results[index].rendered_entity + '</div>';
          } else {
            // Insert the custom Header promo article.
            content += '<div class="header__promo-content">' + custom_promo + '</div>';
          }

          $this.html(content).addClass('is-loaded');

          Drupal.attachBehaviors($this[0]);

          if(cookieConsent) {
            window.Cookies.set('headerPromoLast', index);
          }


        });
      });
    }
  };
}(jQuery));
;/**/
/**
 * @file
 * TopGear Fixed Promo Nav animations.
 */

(function ($) {
    Drupal.behaviors.tgPromoNavAnimation = {
        attach: function (context) {
            // Adds css so that animation can kick in.
            function thunderBoltAnimate() {
                $('.promo-nav__icon', context).css({'animation': 'rotateIn 0.5s'});
                $('.promo-nav__icon', context).bind('oanimationend animationend webkitAnimationEnd', function () {
                    $('.promo-nav__icon', context).css({'animation': ''});
                });
            }
            // Trigger animation every 10 secs.
            setInterval(function () {
                thunderBoltAnimate()
            }, 10000);
        }
    };

    Drupal.behaviors.tgPromoNavScrollCheck = {
        attach: function (context) {
            // Adds a removes fadeout effect based scroll position.
            $('.promo-nav__navigation').on('scroll', function () {
                var $width = $(this).outerWidth()
                var $scrollWidth = $(this)[0].scrollWidth;
                var $scrollLeft = $(this).scrollLeft();

                // If at theend of scroll to right.
                if ($scrollWidth - $width === $scrollLeft) {
                    $('.promo-nav__navigation .promo-nav__fadeout-right', context).addClass("promo-nav__fadeout-right--processed");
                    $('.promo-nav__navigation .promo-nav__fadeout-right', context).removeClass("promo-nav__fadeout-right");
                }
else if (!$('.promo-nav__fadeout-right--processed', context).hasClass('promo-nav__fadeout-right')) {
                    $('.promo-nav__fadeout-right--processed', context).addClass("promo-nav__fadeout-right");
                }
            })
        }
    };

    Drupal.behaviors.tgPromoNavDisableBounceScroll = {
        attach: function (context) {
            // Disable bounce scrolling on listicles.
            if ($(".node-type-news-listicle", context).length) {
                $('html, body').addClass("promo-nav__disable-bounce");
            }
        }
    };

    Drupal.behaviors.promoNavWithAds = {
        attach: function (context) {
            checkPromoNav();
            function checkPromoNav() {
                if ($('.promo-nav', context).length && window.screen.width < 660) {
                    $('#block-ad-manager-top-slot > div').css({'margin-top': '46px'});
                    $('#main-content').css({'margin-top': '96px'});
                }
            }
        }
    }

}(jQuery));
;/**/

(function($) {

/**
 * Drupal FieldGroup object.
 */
Drupal.FieldGroup = Drupal.FieldGroup || {};
Drupal.FieldGroup.Effects = Drupal.FieldGroup.Effects || {};
Drupal.FieldGroup.groupWithfocus = null;

Drupal.FieldGroup.setGroupWithfocus = function(element) {
  element.css({display: 'block'});
  Drupal.FieldGroup.groupWithfocus = element;
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processFieldset = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.fieldset', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $('legend span.fieldset-legend', $(this)).eq(0).append(' ').append($('.form-required').eq(0).clone());
        }
        if ($('.error', $(this)).length) {
          $('legend span.fieldset-legend', $(this)).eq(0).addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processAccordion = {
  execute: function (context, settings, type) {
    $('div.field-group-accordion-wrapper', context).once('fieldgroup-effects', function () {
      var wrapper = $(this);

      // Get the index to set active.
      var active_index = false;
      wrapper.find('.accordion-item').each(function(i) {
        if ($(this).hasClass('field-group-accordion-active')) {
          active_index = i;
        }
      });

      wrapper.accordion({
        heightStyle: "content",
        active: active_index,
        collapsible: true,
        changestart: function(event, ui) {
          if ($(this).hasClass('effect-none')) {
            ui.options.animated = false;
          }
          else {
            ui.options.animated = 'slide';
          }
        }
      });

      if (type == 'form') {

        var $firstErrorItem = false;

        // Add required fields mark to any element containing required fields
        wrapper.find('div.field-group-accordion-item').each(function(i) {

          if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
            $('h3.ui-accordion-header a').eq(i).append(' ').append($('.form-required').eq(0).clone());
          }
          if ($('.error', $(this)).length) {
            // Save first error item, for focussing it.
            if (!$firstErrorItem) {
              $firstErrorItem = $(this).parent().accordion("activate" , i);
            }
            $('h3.ui-accordion-header').eq(i).addClass('error');
          }
        });

        // Save first error item, for focussing it.
        if (!$firstErrorItem) {
          $('.ui-accordion-content-active', $firstErrorItem).css({height: 'auto', width: 'auto', display: 'block'});
        }

      }
    });
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processHtabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any element containing required fields
      $('fieldset.horizontal-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('horizontalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('horizontalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('horizontalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processTabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {

      var errorFocussed = false;

      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.vertical-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('verticalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('verticalTab').link.parent().addClass('error');
          // Focus the first tab with error.
          if (!errorFocussed) {
            Drupal.FieldGroup.setGroupWithfocus($(this));
            $(this).data('verticalTab').focus();
            errorFocussed = true;
          }
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 *
 * TODO clean this up meaning check if this is really
 *      necessary.
 */
Drupal.FieldGroup.Effects.processDiv = {
  execute: function (context, settings, type) {

    $('div.collapsible', context).once('fieldgroup-effects', function() {
      var $wrapper = $(this);

      // Turn the legend into a clickable link, but retain span.field-group-format-toggler
      // for CSS positioning.

      var $toggler = $('span.field-group-format-toggler:first', $wrapper);
      var $link = $('<a class="field-group-format-title" href="#"></a>');
      $link.prepend($toggler.contents());

      // Add required field markers if needed
      if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
        $link.append(' ').append($('.form-required').eq(0).clone());
      }

      $link.appendTo($toggler);

      // .wrapInner() does not retain bound events.
      $link.click(function () {
        var wrapper = $wrapper.get(0);
        // Don't animate multiple times.
        if (!wrapper.animating) {
          wrapper.animating = true;
          var speed = $wrapper.hasClass('speed-fast') ? 300 : 1000;
          if ($wrapper.hasClass('effect-none') && $wrapper.hasClass('speed-none')) {
            $('> .field-group-format-wrapper', wrapper).toggle();
          }
          else if ($wrapper.hasClass('effect-blind')) {
            $('> .field-group-format-wrapper', wrapper).toggle('blind', {}, speed);
          }
          else {
            $('> .field-group-format-wrapper', wrapper).toggle(speed);
          }
          wrapper.animating = false;
        }
        $wrapper.toggleClass('collapsed');
        return false;
      });

    });
  }
};

/**
 * Behaviors.
 */
Drupal.behaviors.fieldGroup = {
  attach: function (context, settings) {
    settings.field_group = settings.field_group || Drupal.settings.field_group;
    if (settings.field_group == undefined) {
      return;
    }

    // Execute all of them.
    $.each(Drupal.FieldGroup.Effects, function (func) {
      // We check for a wrapper function in Drupal.field_group as
      // alternative for dynamic string function calls.
      var type = func.toLowerCase().replace("process", "");
      if (settings.field_group[type] != undefined && $.isFunction(this.execute)) {
        this.execute(context, settings, settings.field_group[type]);
      }
    });

    // Fixes css for fieldgroups under vertical tabs.
    $('.fieldset-wrapper .fieldset > legend').css({display: 'block'});
    $('.vertical-tabs fieldset.fieldset').addClass('default-fallback');

    // Add a new ID to each fieldset.
    $('.group-wrapper .horizontal-tabs-panes > fieldset', context).once('group-wrapper-panes-processed', function() {
      // Tats bad, but we have to keep the actual id to prevent layouts to break.
      var fieldgroupID = 'field_group-' + $(this).attr('id');
      $(this).attr('id', fieldgroupID);
    });
    // Set the hash in url to remember last userselection.
    $('.group-wrapper ul li').once('group-wrapper-ul-processed', function() {
      var fieldGroupNavigationListIndex = $(this).index();
      $(this).children('a').click(function() {
        var fieldset = $('.group-wrapper fieldset').get(fieldGroupNavigationListIndex);
        // Grab the first id, holding the wanted hashurl.
        var hashUrl = $(fieldset).attr('id').replace(/^field_group-/, '').split(' ')[0];
        window.location.hash = hashUrl;
      });
    });

  }
};

})(jQuery);
;/**/
/**
 * TopGear galleries JS
 */

(function ($) {
  var $body = $('body'),
    // Reference to open full screen carousel.
    activeModal;

  Drupal.behaviors.tgGalleriesInline = {
    attach: function(context) {
      $('.inline-gallery', context).once('inline-gallery', function () {
        var $gallery = $(this),
          id = $gallery.attr('id'),
          $content = $gallery.find('.inline-gallery__content'),
          $items = $gallery.find('.inline-gallery__item');

        $content.bxSlider({
          pager: false,
          infiniteLoop: false,
          slideWidth: 205,
          minSlides: 2.5,
          maxSlides: 6,
          hideControlOnEnd: true,
          onSlideBefore: function () {
            thumbsAnimating = true;
          },
          onSlideAfter: function () {
            thumbsAnimating = false;
          }
        });

        $items.click(function (e) {
          e.preventDefault();
          openModal(id, $(this).index());
        });

        // Wrap images in links to allow keyboard focus.
        $items.find('img').wrap('<a class="inline-gallery__item-link" href="#">');
      });
    }
  };

  Drupal.behaviors.tgGalleriesCarousel = {
    attach: function(context) {
      // Initialise carousel using bxSlider plugin. This actually consists of two
      // linked instances - one for the main image and one for the thumbnails.
      $('.carousel', context).once('bx-slider', function () {
        var $element = $(this),
        $main = $('.carousel__slides', this),
        $thumbs = $('.carousel__thumbs', this),
        $thumbsContainer = $('.carousel__thumbs-container', this),
        $fullScreenLink = $('.carousel__full-screen', this),
        $counterCurrent = $('.carousel__counter-current', this),
        $youtubeVideos = $('.media-youtube-player', this),
        $brightcoveVideos = $('.video-js', this),
        videoElements = 'iframe, object, video',
        mainAnimating = false,
        thumbsAnimating = false,
        activePlayer = null,

        // Settings for thumbnail navigation carousel.
        thumbsSettings = {
          slideWidth: 124,
          minSlides: 3,
          maxSlides: 5,
          pager: false,
          infiniteLoop: true
        },

        // Flag to tell if user has clicked a thumbnail.
        navigating = false;

        // Add a data attribute to thumbnails before we initialise the carousel.
        // This helps us to identify which thumbnail was clicked, avoiding
        // issues around cloned items.
        $thumbs.find('.carousel__thumb').each(function (i, item) {
          $(item).attr('data-item', i);
          if (i === 0) {
            $(item).addClass('is-active');
          }
        });

        $fullScreenLink.click(function (e) {
          var index = $counterCurrent.text() ? $counterCurrent.text() - 1 : 0;
          openModal($element.attr('id'), index, mainSlider);
          e.preventDefault();
        });

        // Advert variables
        var refreshCount = 0,
          MAX_REFRESH = Drupal.settings.tgGalleries.maxAdRefresh,
          clickCount = 0,
          REFRESH_PERIOD = Drupal.settings.tgGalleries.adRefreshPeriod;

        // Initialise main carousel.
        var mainSlider = $main.bxSlider({
          infiniteLoop: true,
          pager: false,
          // Callback on slide change:
          onSlideBefore: function ($slideElement, oldIndex, newIndex) {
            // Normalize indexes > total slides.
            var total = mainSlider.getSlideCount(),
              index = newIndex % total;

            // Don't update thumbnail slider position if we've just clicked on it.
            if (!navigating) {
              // One 'slide' on the thumbnail carosuel is actually a page of up to
              // maxSlides option. We want the active thumbnail to always be
              // visible so need to calculate what page it's on.
              var slidesShowing = $thumbsContainer.find('.bx-viewport').width() / thumbsSettings.slideWidth,
                pageNo = Math.ceil((index + 1) / slidesShowing) - 1;

              thumbsSlider.goToSlide(pageNo);
              mainAnimating = true;
            }

            // Update counter text.
            $counterCurrent.text(index + 1);

            // Set active class on current thumbnail.
            $thumbs.find('.is-active').removeClass('is-active');
            $thumbs.find('.carousel__thumb[data-item=' + index + ']', this).addClass('is-active');

            // Pause the YouTube video when transitioning to the next slide.
             if (activePlayer !== null) {
              activePlayer.pauseVideo();
            }

          },
          onSlideAfter: function ($slideElement) {
            mainAnimating = false;
            clickCount++;
            if (clickCount % REFRESH_PERIOD === 0) {
              var id = $('.ad--mpu-premium-1-wide').attr('id');
              var slot = Drupal.GPT.grabSlot(id);
              if (
                slot !== undefined &&
                (MAX_REFRESH === -1 || refreshCount < MAX_REFRESH)
              ) {
                Drupal.GPT.refreshSlots([slot]);
                refreshCount++;
              }
            }
            // Add a class to the carousel if the active slide contains a video
            $element.toggleClass('contains-video', $slideElement.find(videoElements).length > 1);
          },
          onSliderLoad: function() {
            // Add a class to the carousel if the active slide contains a video
            var $slideElement = $main.find('.carousel__slide').not('.bx-clone').first();
            if ($slideElement.find(videoElements).length) {
              $element.addClass('contains-video');
            }
          }
        });

        thumbsSettings.controls = (mainSlider.getSlideCount() > 5);

        // Initialise thumbnail nav carousel.
        var thumbsSlider = $thumbs.bxSlider(thumbsSettings);

        $main.data('bxSlider', mainSlider);

        $main.find('.bx-next, .bx-prev').bindFirst('click', function (e) {
          if (mainAnimating) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        });
        $thumbs.find('.bx-next, .bx-prev').bindFirst('click', function (e) {
          if (thumbsAnimating) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        });

        // Handle thumbnail clicks.
        $thumbs.on('click', '.carousel__thumb', function (e) {
          e.preventDefault();
          if (!mainAnimating) {
            var index = $(this).attr('data-item');
            navigating = true;
            mainSlider.goToSlide(index);
            navigating = false;
          }
        });

        // Set initial counter text.
        $counterCurrent.text(1);
        $thumbsContainer.find('.carousel__counter-total').text(mainSlider.getSlideCount());

        // Set up YouTube API to toggle carousel controls on playback.
        if ($youtubeVideos.length) {
          // Load the IFrame Player API code asynchronously.
          var tag = document.createElement('script'),
            firstScriptTag = document.getElementsByTagName('script')[0];
          tag.src = '//www.youtube.com/iframe_api';
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          window.onYouTubeIframeAPIReady = function() {
            $youtubeVideos.each(function () {
              var player = new window.YT.Player(this.id, {
                events: {
                  onReady: function (e) {
                    var state = e.target.getPlayerState();
                    if (state === window.YT.PlayerState.BUFFERING || state === window.YT.PlayerState.PLAYING) {
                      $element.addClass('has-video-playing');
                      activePlayer = player;
                    }
                  },
                  onStateChange: function (e) {
                    if (e.data === window.YT.PlayerState.BUFFERING || e.data === window.YT.PlayerState.PLAYING) {
                      $element.addClass('has-video-playing');
                      activePlayer = player;
                    } else {
                      $element.removeClass('has-video-playing');
                      activePlayer = null;
                    }
                  }
                }
              });
            });
          };
        }

        // Quick workaround to toggle class without Brightcove API. TODO implement using API.
        if ($brightcoveVideos.length) {
          setInterval(function () {
            var isPlaying = $brightcoveVideos.hasClass('vjs-playing') || $brightcoveVideos.hasClass('vjs-ad-playing');
            $element.toggleClass('has-video-playing', isPlaying);
          }, 500);
        }
      });
    }
  };

  /**
   * Create a new full screen carousel from data.
   */
  function createModal(data, settings) {
    // Build carousel
    var $element = $('<div>', {
        'class': 'modal modal-gallery inverse',
        'role': 'dialog',
        'aria-label': Drupal.t('Gallery'),
        // Allows us to set focus to element on modal open.
        'tabindex': 0
      }),
      $slides = $('<div>', {'class': 'modal-gallery__slides'}),
      $caption = $('<div>', {
        'class': 'modal-gallery__caption',
        'aria-hidden': true
      }),
      $captionContent = $('<div>', {
        'class': 'modal-gallery__caption-content',
      }),

      $icons = $('<div>', {'class': 'modal-gallery__icons'}),
      $closeButton = $('<button>', {
        'class': 'modal-gallery__icon icon-close',
        'type': 'button',
      }).html('<span class="element-invisible">' + Drupal.t('Close') + '</span>'),

      $captionButton = $('<button>', {
        'class': 'modal-gallery__icon modal-gallery__icon--caption icon-comment',
        'type': 'button',
      }).html('<span class="element-invisible">' + Drupal.t('Toggle captions') + '</span>'),

      captionsOpen = false,
      count = Object.keys(data.items).length;

    for (var i in data.items) {
      if (data.items.hasOwnProperty(i)) {
        var item = data.items[i],
          $slide = $('<div>', {'class': 'modal-gallery__slide'}),
          $slideContent = $('<div>', {'class': 'modal-gallery__slide-content'});

        if (item.content.indexOf('video-js') > 0) {
          $slideContent.append('<div class="fixed-ratio">' + item.content + '</div>');
        } else {
          $slideContent.append(item.content);
        }

        $slide.append($slideContent);
        $slides.append($slide);
      }
    }

    $caption.append($captionContent);

    $icons.append($closeButton)
      .append($captionButton);

    $element.append($slides)
      .append($caption)
      .append($icons);

    $body.prepend($element);

    if (window.picturefill) {
      window.picturefill({
        reevaluate: true
      });
    }

    $closeButton.click(closeModal);

    $captionButton.click(function toggleCaptions() {
      captionsOpen = !captionsOpen;
      $captionButton.attr('aria-pressed', captionsOpen);
      $caption.attr('aria-hidden', captionsOpen);
      $element.toggleClass('has-captions-open', captionsOpen);
      data.slider.reloadSlider();
    });

    data.$element = $element;
    $element.addClass('is-visible');

    if (count > 1) {
      var $counter = $('<div class="modal-gallery__counter"><span class="modal-gallery__counter-current"></span>/' + count + '</div>');
      $element.append($counter);
      data.slider = $slides.bxSlider(settings);
    }


    return $element;
  }

  /**
   * Open a full screen carousel.
   */
  function openModal(id, startSlide, linkedSlider) {
    // Check if data provided is valid
    if (Drupal.settings.tgGalleries === undefined || Drupal.settings.tgGalleries[id] === undefined) {
      return;
    }

    var data = Drupal.settings.tgGalleries[id],
      index = startSlide || 0,
      settings = {
        pager: false,
        infiniteLoop: true,
        maxSlides: 1,
        startSlide: index,
        onSlideBefore: function($slideElement, oldIndex, newIndex) {
          // Normalize indexes > total slides.
          var total = data.slider.getSlideCount(),
            index = newIndex % total;

          if (linkedSlider && linkedSlider.goToSlide) {
            linkedSlider.goToSlide(index);
          }
          setIndex(index);
        }
      },
      setIndex = function(index) {
        // Set current slide number in counter.
        data.$element.find('.modal-gallery__counter-current').text(index + 1);
        // Set caption text.
        data.$element.find('.modal-gallery__caption-content').html(data.items[index].caption);
        data.$element.toggleClass('has-caption', (data.items[index].caption !== ''));
      };

      createModal(data, settings);

    // Hide main contenty from screen reader.
    $('.l-master-wrapper').attr('aria-hidden', true);
    // Prevent scrolling.
    $body.css('overflow', 'hidden');

    // Add event handlers.
    $body.bind('keydown', keyHandler);
    $body.bind('focus', focusRestrict);

    // Move focus to carousel element.
    data.$element.focus();

    setIndex(index);
    activeModal = data;

  }

  // Adjust modal image when user turns device into landscape mode.
  $(window).resize(function() {
    if (window.innerWidth  >  window.innerHeight ) {
      $(".modal-gallery__slide-content").css("vertical-align", "unset")
    } else {
      // Default.
      $(".modal-gallery__slide-content").css("vertical-align", "middle")
    }
  });

  /**
   * Close the active full screen carousel.
   *
   * Destroy the modal to remove all current video players. This is a simplier
   * solution then attempting to use Brightcove, YouTube and future APIs to
   * pause the videos. It also allows the browser to recover memory.
   */
  function closeModal() {
    activeModal.$element.remove();
    activeModal = null;

    $('.l-master-wrapper').attr('aria-hidden', false);
    $body.css('overflow', 'visible');
    $body.unbind('keydown', keyHandler);
    $body.unbind('focus', focusRestrict);
  }

  function keyHandler(e) {
    // Close on escape key.
    if (e.keyCode === 27) {
      closeModal();
      e.preventDefault();
    }
    // Prev / next.
    else if (activeModal.slider && e.keyCode === 39) {
      activeModal.slider.goToNextSlide();
      e.preventDefault();
    } else if (activeModal.slider && e.keyCode === 37) {
      activeModal.slider.goToPrevSlide();
      e.preventDefault();
    }
  }

  function focusRestrict(e) {
    // Don't allow focus outside active modal.
    if (activeModal && !activeModal.$element.contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
      activeModal.$element.focus();
    }
  }

}(jQuery));
;/**/
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;/**/
// Clear default form value (Name@Email.com) on click.
(function ($) {
  $(document).ready(function() {

    var swap_val = [];

    $(".tg-newsletter-form #edit-email").each(function(i){
      swap_val[i] = $(this).attr('placeholder');

      $(this).focus(function(){
        if ($(this).attr('placeholder') == swap_val[i]) {
          $(this).removeAttr('placeholder');
        }
      }).blur(function(){
        if ($.trim($(this).attr('placeholder')) == "") {
          jQuery(this).attr('placeholder', swap_val[i]);
        }
      });
    });
  });
})(jQuery);
;/**/
