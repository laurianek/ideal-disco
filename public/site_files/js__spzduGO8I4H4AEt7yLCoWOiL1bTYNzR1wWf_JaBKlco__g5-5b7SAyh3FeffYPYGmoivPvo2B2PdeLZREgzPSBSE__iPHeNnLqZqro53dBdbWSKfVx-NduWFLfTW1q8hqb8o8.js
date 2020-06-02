/**
 * @file
 */

(function ($) {
    'use strict';
    Drupal.behaviors.tgCarsForm = {
        attach: function (context) {

            function updateOptions (type, model, manufacturer) {
                var tid = manufacturer.val(),
                    options = '',
                    cars;

                if (tid) {
                    cars = Drupal.settings.tgCars.cars['m' + tid];
                    for (var i in cars) {
                        if (cars.hasOwnProperty(i)) {
                            if (type == 'motors-form') {
                                options += '<option value="' + cars[i].label + '">' + cars[i].label + '</option>';
                            } else {
                                options += '<option value="' + cars[i].value + '">' + cars[i].label + '</option>';
                            }

                        }
                    }
                    model.attr('disabled', false);
                }
                else {
                    if (type == 'motors-form') {
                        options += '<option value="[]">' + Drupal.t('Model') + '</option>';
                    } else {
                        options += '<option value="[]">' + Drupal.t('All models…') + '</option>';
                    }

                    model.attr('disabled', true);
                }

                model.html(options);
            };

            function getMakeModelValues(make, model) {
                var makeModel
                if(make === 'Make' ) {
                    makeModel =[]
                } else if (model === 'All models…') {
                    makeModel = [{ "Value": make,
                        "Models": []}]
                } else {
                    makeModel = [{ "Value": make,
                        "Models": [model]}]
                }
                return makeModel;
            }

            function resetPostcodeErrors() {
                $('#edit-postcode-motors').css('border-color', '#e6e6e6');
                if($('.cars-form-motor__postcode-error')) {
                    $('.cars-form-motor__postcode-error').text('')
                }
            }

            $('.cars-form-motors', context).once('cars-form-motors', function () {
                var $manufacturer = $('#edit-manufacturer-motors'),
                    $cars = $('#edit-car-motors'),
                    $type = 'motors-form'
                
                $manufacturer.change(function(){
                    updateOptions($type, $cars,$manufacturer );
                });
                updateOptions($type, $cars,$manufacturer);
                
                // Navigate to URL in option value.
                $(this).submit(function (e) {

                    resetPostcodeErrors();

                    if($('#edit-postcode-motors').val() == "") {
                        // Do not submit form if there is no postcode.
                        $('#edit-postcode-motors').css('border-color', 'red');
                        $('.cars-form-motor__postcode-error').text(Drupal.t('Please enter a postcode'))
                        return false
                    }

                    // Reset the params so a user can do a new search.
                    if($('#searchPanelParameters')) {
                        $('#searchPanelParameters').remove();
                    }

                    if ($cars.val()) {

                        var searchParams = {
                            "Postcode": $('#edit-postcode-motors').val(),
                            "Type": 1,
                            "Distance": 1000,
                            "MinPrice": "-1",
                            "MaxPrice": "-1",
                            "SelectedFuelEfficiency": "*",
                            "MakeModels": getMakeModelValues($manufacturer.find(":selected").text(), $cars.find(":selected").text())
                        }
                        $('<input />').attr('type', 'hidden')
                            .attr('name', "searchPanelParameters")
                            .attr('value',  JSON.stringify(searchParams))
                            .attr('id',  "searchPanelParameters")
                            .appendTo(this);

                        this.reset();

                    }
                });
            });

            $('.cars-form', context).once('cars-form', function () {
                var $manufacturer = $('#edit-manufacturer'),
                    $cars = $('#edit-car'),
                    $type = 'quick-car-finder-form'


                $manufacturer.change(function(){
                    updateOptions($type, $cars, $manufacturer );
                });
                updateOptions($type, $cars, $manufacturer);

                // Navigate to URL in option value.
                $(this).submit(function (e) {
                    e.preventDefault();
                    // If no options are selected the user is taken to a general search page /car-reviews/find.
                    if ($cars.val() && $cars.val() != "[]") {
                        window.location.href = $cars.val();
                    } else {
                        window.location.href = "/car-reviews/find";
                    }
                });
            });

        }

    };
}(jQuery));;/**/
/**
 * @file
 * Load the view with ajax.
 */

(function ($) {
  Drupal.articleScroll = Drupal.articleScroll || {};
  Drupal.articleScroll.pageNum = 1
  Drupal.behaviors.articleScrolls = {

    attach: function (context) {
      function loadArticle(pageNum) {
        if (Drupal.windowSize.width < 768) {
          $('#article-scroll').append("<span id='article-scroll-loading'> </span>");
          $.ajax({
            url: '/articlescroll/json',
            type: 'get',
            data: {
              page: pageNum,
              filter: Drupal.settings.articleScroll.initialNode,
              ab: Drupal.settings.articleScroll.abTest,
            },
            dataType: 'json',
            success: function (response) {
              if (response['data'].length > 0) {
                $('#article-scroll-loading').remove();
                $('#article-scroll').append(response['data']);

                // Reattach drupal behaviours.
                Drupal.attachBehaviors($("body"), Drupal.settings);

                // Send info to GA.
                if ('tg_tracking' in Drupal.settings) {
                  $('[data-article-page-num=' + pageNum + ']').waypoint(function () {
                    // GA needs to see this as a new page.
                    // First update the tracker.
                    ga('set', 'page', '/' + $(this).data('url'));
                    // Send the page type to Google Analytics.
                    ga('set', 'contentGroup1', $(this).data('article-page-type'));
                    // Register a new page.
                    ga('send', 'pageview', {
                      'title': $(this).data('article-title'),
                      'location': $(this).data('url'),
                    });

                    // Send article scroll event.
                    ga('send', 'event', 'Article Scroll', 'Article Scroll ' + pageNum, history.state.originalPath);
                    $(this).waypoint('destroy');
                  })

                }

                // Gallery metadata so allow gallery functionality like
                // fullscreen mode to work.
                Drupal.settings.tgGalleries['tg-galleries-' + response['nid']] = response['tg-galleries-' + response['nid']]

                Drupal.articleScroll.pageNum++
              }
            },

          }, context);
        }
      }

      // Load first article.
      $('.content-body', context).waypoint(function () {
        $("#article-scroll", context).once('article-scroll-first-load', function () {
          loadArticle(Drupal.articleScroll.pageNum);
          $(this).waypoint('destroy');
        })
      })

      // Load other articles.
      $('div[data-article-page-num="' + Drupal.articleScroll.pageNum + '"]', context).waypoint(function () {
        // AB Test show 10 articles.
        if (Drupal.settings.articleScroll.abTest === 1 && Drupal.articleScroll.pageNum < 10) {
          loadArticle(Drupal.articleScroll.pageNum);
        }
        // Only show 5 articles.
        else if (Drupal.articleScroll.pageNum < 5) {
          loadArticle(Drupal.articleScroll.pageNum);
        }

        $(this).waypoint('destroy');
      });

      // Use waypoints to help trigger changing the URL when scrolling to the
      // next article.
      $('[data-article-scroll]', context).waypoint(function () {
        var url = getUrl(this);
        var pageTitle = $(this).closest('[data-article-title]').data('article-title');
        var domID = $(this).attr('id');
        changeURL(url, pageTitle, domID);
      });

      // If user goes back to the very first article, the url will change back
      // to the first article.
      $('.page-title:nth-of-type(1)', context).waypoint(function () {
        var pageTitle = $('.page-title:nth-of-type(1)').text();
        var domID = $('.page-title:nth-of-type(1)').closest($("div[id^='node-']")).attr('id');
        if (history.state && history.state.originalPath) {
          changeURL(history.state.originalPath, pageTitle, domID, history.state.originalPath);
        }
        else {
          changeURL(window.location.pathname, pageTitle, domID, window.location.pathname);
        }
      });

      /**
       * Uses the HTML5 history API, to change the url.
       *
       * @param url
       * @param pageTitle
       * @param domID
       * @param stateObj
       */
      function changeURL(url, pageTitle, domID, originalPath) {
        if (originalPath) {
          var stateObj = {
            pageName: pageTitle,
            domID: domID,
            originalPath: originalPath
          };
        }
        else { // Jshint ignore:line.
          var stateObj = {
            pageName: pageTitle,
            domID: domID,
            originalPath: history.state.originalPath
          };
        }

        // Running this check prevents the situation when a user triggers
        // the waypoint by scrolling up and, causing the history data to
        // add the same entry for the same page. Basically don't allow
        // pushState() to push a duplicate object right next to the
        // first.
        if (history.state != null && 'domID' in history.state && history.state.domID != domID) {
          // Change URL.
          history.replaceState(stateObj, stateObj.pageName, url);

        }
        else if (history.state == null) { // Jshint ignore:line.
          history.replaceState(stateObj, stateObj.pageName, url);
        }
      }

      /**
       * Injects an advert into a specified position of the dom.
       *
       * @param containerElement
       * @param domID
       * @param classes
       * @param sizes
       * @param targeting
       */
      function injectAds(containerElement, domID, classes, sizes, targeting, url) {

        var targetingValuesToReset = ['author', 'content_type', 'title', 'make', 'range', 'category', 'model', 'derivative', 'cars_body_style', 'cars_road_test_type', 'price_brackets'];
        targetingValuesToReset.forEach(function (value) {
          // Remove page level targeting values from previously loaded page.
          googletag.pubads().clearTargeting(value);

        })

        // Use waypoints to Lazy load ads.
        $(containerElement).waypoint(function () {
          Drupal.articleScroll.advertPathName = url
          $(containerElement).addClass(classes);
          var pageNum = $(containerElement).closest('[data-article-page-num]').data('article-page-num');
          targeting = [targeting + ',' + targeting + '_scroll' + pageNum];
          Drupal.GPT.addSlot(domID, function () {
            var m = Drupal.GPT.buildSizeMapping(sizes);
            var s = googletag.defineSlot(Drupal.GPT.unitPath(), m.define, domID) // Jshint
            // ignore:line.
                .defineSizeMapping(m.mapping.build())
                .setTargeting('pos', targeting);
            setPageLevelTargeting(containerElement)
            Drupal.GPT.attachTargeting(s, Drupal.settings.gpt.targeting, true);
            s.addService(googletag.pubads()); // Jshint ignore:line.
          });
          googletag.pubads().refresh([Drupal.GPT.grabSlot(domID)]); // Jshint
                                                                    // ignore:line.
          $(this).waypoint('destroy');
        }, {offset: '95%'});

      }

      /**
       * Sets the page level targeting for the loaded pages.
       *
       * @param domID
       */
      function setPageLevelTargeting(domID, url) {
        var meta = JSON.parse($(domID).closest('[data-article-meta]').data('article-meta').replace(/'/g, '"'));

        // Remove current page level targeting.
        delete Drupal.settings.gpt.targeting;
        Drupal.settings.gpt.targeting = {};

        // Get grapshot targeting.
        getJSONP.send(url, {
          onSuccess: function (segments) {
            if (segments.channels) {
              var grapeshot_segments = segments.channels.map(function (item) {
                return item.name
              }).toString()
              Drupal.settings.gpt.targeting.gs_cat = {
                0: {
                  value: grapeshot_segments
                }
              }
            }
            else {
              // In case there is an issue with grapeshot we can still serve
              // ads but without grapeshot segements.
              Drupal.settings.gpt.targeting.gs_cats = {};
            }
          },
          timeout: 0.5
        });

        // Set new values. Deleted values above may not be reassigned so new
        // control structure used.
        for (var targetingName in meta) {
          Drupal.settings.gpt.targeting[targetingName] = [{'value': meta[targetingName]}]
        }
      }

      /**
       * Gets the URL from the data attribute in the DOM.
       *
       * @param domIDorClass
       *
       * @returns {string}
       */
      function getUrl(domIDorClass) {
        return '/' + $(domIDorClass).closest('[data-url]').data('url');
      }

      $(document).ajaxStop(function () {
        if ($('#article-scroll').length) {
          // Refresh Disqus comment counts.
          if ('DISQUSWIDGETS' in window) {
            DISQUSWIDGETS.getCount({reset: true})
          }

          $("div[id^='leaderboard-wrapper--']").once('leaderboard-wrapper', function () {
            var url = getUrl(this);
            // Load TopSlot advert.
            injectAds(this, this.id, 'ad ad--top-slot', [[[0, 0], [[320, 50]]], [[728, 90], []]], 'top_slot', url);
          })

          $("div[id^='mpu-wrapper--']").once('mpu-wrapper', function () {
            var url = getUrl(this);
            // Load MPU advert.
            injectAds(this, this.id, 'ad ad--narrow ad--mpu ad--mpu-premium-1-narrow', [[[0, 0], [[300, 250]]], [[1000, 0], []]], 'mpu_premium_1', url);
          })

          $("section[id^='article-scroll_outbrain--']").once('article-scroll_outbrain', function () {
            // Populate Outbrain block.
            if (OBR) {
              OBR.extern.researchWidget();
            }
          })
        }
      });
    }
  };

  Drupal.behaviors.richTeaserAnimattion = {
    attach: function (context) {
      var img = $('.rich-teaser img');
      $(window).scroll(function () {
        if (isScrolledIntoView(img)) {
          $('.rich-teaser img', context).css({'animation': 'zoomIn 0.5s'});
          $('.rich-teaser__header--yellow', context).css({'animation': 'slideInRight 0.5s'});
          $('.rich-teaser__header', context).css({'animation': 'slideInLeft 0.5s'});
          // Bind an event listener to the css animation so that we can call
          // other animations after the one attached to the image.
          $('.rich-teaser img').bind('oanimationend animationend webkitAnimationEnd', function () {
            $('.rich-teaser__info-box', context).css({
              'animation': 'fadeIn 1.5s',
              'display': 'block'
            });
            $('.rich-teaser__info-box .teaser__details', context).css({'animation': 'fadeIn 1.0s'});
          });
        }
      });

      /**
       * Check if an element is in view.
       *
       * Todo replace this and use waypoints.
       *
       * @param elem
       *
       * @returns {boolean}
       */
      function isScrolledIntoView(elem) {
        if ($(elem).length === 0) {
          return false;
        }
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        // Return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        // //try it, will only work for text.
        return (docViewBottom >= elemTop && docViewTop <= elemBottom);
      }
    }
  };
}(jQuery));
;/**/
