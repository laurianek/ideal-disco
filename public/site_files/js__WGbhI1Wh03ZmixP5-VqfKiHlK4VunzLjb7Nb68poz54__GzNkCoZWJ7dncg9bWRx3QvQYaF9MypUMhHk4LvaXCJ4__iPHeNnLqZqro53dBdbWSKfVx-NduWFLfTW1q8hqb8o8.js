// Set up global disqus variables.
window.disqus_shortname = Drupal.settings.tg_disqus.shortname;

if ('identifier' in Drupal.settings.tg_disqus) {
  window.disqus_identifier = Drupal.settings.tg_disqus.identifier;
}

(function ($) {
  Drupal.behaviors.tgDisqus = {
    attach: function(context) {
      $('.comments__show-button', context).click(function () {
        var dataElementContainer = $(this).find('.disqus-comment-count')
        // Disqus idenitifer.
        var disqus_id = $(this).find('.disqus-comment-count').data('disqus-identifier');
        var disqusTOC = $('#disqusTOC');
        var disqusURL = window.location.origin + '/' + dataElementContainer.data('disqus-url');

        // When there is more than one disqus instance on a page
        // we remove the #disqus_thread element so that we can load
        // the new one in the correct position.
        if ($("#disqus_thread").length) {
          $("#disqus_thread").remove();
        }

        $('<div id="disqus_thread" class></div>').insertAfter(this);
        // Add the Disqus TOCs.
        $(disqusTOC).insertAfter(this);
        $('#disqusTOC').removeClass('element-hidden');
        
        refresh(disqus_id, disqusURL, dataElementContainer.data('disqus-title'));

      });


      function refresh(newIdentifier, newUrl, title) {
        if (window.DISQUS) {
          DISQUS.reset({
            reload: true,
            config: function () {
              this.page.identifier = newIdentifier;
              this.page.url = newUrl;
              this.page.title = title;

            }
          });
        }
      }

    }
  };

  Drupal.behaviors.tgDisqusInfoLink = {
    attach: function(context) {
      $('.post-info__comments a', context).once('tgDisqusInfoLink').click(function (e) {
        var top = $('#comments').offset().top - 45;
        $('.comments__show-button').trigger('click');
        $('html, body').animate({scrollTop: top}, 700);
        e.preventDefault();
      });
    }
  };

  Drupal.behaviors.tgDisqusCommentCount = {
    attach: function(context) {
      $.ajax({
        type: 'GET',
        url: 'https://' + window.disqus_shortname + '.disqus.com/count.js',
        dataType: 'script',
        cache: true
      });
    }
  };
})(jQuery);
;/**/
