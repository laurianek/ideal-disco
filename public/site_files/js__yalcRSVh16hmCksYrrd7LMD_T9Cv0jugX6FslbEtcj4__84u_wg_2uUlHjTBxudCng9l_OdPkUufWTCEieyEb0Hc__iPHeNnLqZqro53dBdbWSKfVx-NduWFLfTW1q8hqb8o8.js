/*! modernizr 3.0.0 (Custom Build) | MIT *
 * http://modernizr.com/download/?-appearance-backgroundsize-cssgradients-csspointerevents-csstransforms-csstransforms3d-csstransitions-generatedcontent-inlinesvg-multiplebgs-rgba-svg-touchevents-addtest-domprefixes-prefixed-prefixes-shiv-testallprops-testprop-teststyles !*/
!function(e,t,n){function r(e,t){return typeof e===t}function o(){var e,t,n,o,i,a,s;for(var u in C){if(e=[],t=C[u],t.name&&(e.push(t.name.toLowerCase()),t.options&&t.options.aliases&&t.options.aliases.length))for(n=0;n<t.options.aliases.length;n++)e.push(t.options.aliases[n].toLowerCase());for(o=r(t.fn,"function")?t.fn():t.fn,i=0;i<e.length;i++)a=e[i],s=a.split("."),1===s.length?Modernizr[s[0]]=o:(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=o),b.push((o?"":"no-")+s.join("-"))}}function i(e){var t=w.className,n=Modernizr._config.classPrefix||"";if(_&&(t=t.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+n+"no-js(\\s|$)");t=t.replace(r,"$1"+n+"js$2")}Modernizr._config.enableClasses&&(t+=" "+n+e.join(" "+n),_?w.className.baseVal=t:w.className=t)}function a(e,t){if("object"==typeof e)for(var n in e)k(e,n)&&a(n,e[n]);else{e=e.toLowerCase();var r=e.split("."),o=Modernizr[r[0]];if(2==r.length&&(o=o[r[1]]),"undefined"!=typeof o)return Modernizr;t="function"==typeof t?t():t,1==r.length?Modernizr[r[0]]=t:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=t),i([(t&&0!=t?"":"no-")+r.join("-")]),Modernizr._trigger(e,t)}return Modernizr}function s(e){return e.replace(/([a-z])-([a-z])/g,function(e,t,n){return t+n.toUpperCase()}).replace(/^-/,"")}function u(){return"function"!=typeof t.createElement?t.createElement(arguments[0]):_?t.createElementNS.call(t,"http://www.w3.org/2000/svg",arguments[0]):t.createElement.apply(t,arguments)}function f(){var e=t.body;return e||(e=u(_?"svg":"body"),e.fake=!0),e}function l(e,n,r,o){var i,a,s,l,c="modernizr",d=u("div"),p=f();if(parseInt(r,10))for(;r--;)s=u("div"),s.id=o?o[r]:c+(r+1),d.appendChild(s);return i=u("style"),i.type="text/css",i.id="s"+c,(p.fake?p:d).appendChild(i),p.appendChild(d),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(t.createTextNode(e)),d.id=c,p.fake&&(p.style.background="",p.style.overflow="hidden",l=w.style.overflow,w.style.overflow="hidden",w.appendChild(p)),a=n(d,e),p.fake?(p.parentNode.removeChild(p),w.style.overflow=l,w.offsetHeight):d.parentNode.removeChild(d),!!a}function c(e,t){return!!~(""+e).indexOf(t)}function d(e,t){return function(){return e.apply(t,arguments)}}function p(e,t,n){var o;for(var i in e)if(e[i]in t)return n===!1?e[i]:(o=t[e[i]],r(o,"function")?d(o,n||t):o);return!1}function m(e){return e.replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()}).replace(/^ms-/,"-ms-")}function h(t,r){var o=t.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(m(t[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var i=[];o--;)i.push("("+m(t[o])+":"+r+")");return i=i.join(" or "),l("@supports ("+i+") { #modernizr { position: absolute; } }",function(e){return"absolute"==getComputedStyle(e,null).position})}return n}function g(e,t,o,i){function a(){l&&(delete O.style,delete O.modElem)}if(i=r(i,"undefined")?!1:i,!r(o,"undefined")){var f=h(e,o);if(!r(f,"undefined"))return f}for(var l,d,p,m,g,v=["modernizr","tspan"];!O.style;)l=!0,O.modElem=u(v.shift()),O.style=O.modElem.style;for(p=e.length,d=0;p>d;d++)if(m=e[d],g=O.style[m],c(m,"-")&&(m=s(m)),O.style[m]!==n){if(i||r(o,"undefined"))return a(),"pfx"==t?m:!0;try{O.style[m]=o}catch(y){}if(O.style[m]!=g)return a(),"pfx"==t?m:!0}return a(),!1}function v(e,t,n,o,i){var a=e.charAt(0).toUpperCase()+e.slice(1),s=(e+" "+j.join(a+" ")+a).split(" ");return r(t,"string")||r(t,"undefined")?g(s,t,o,i):(s=(e+" "+E.join(a+" ")+a).split(" "),p(s,t,n))}function y(e,t,r){return v(e,n,n,t,r)}var b=[],C=[],x={_version:"3.0.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,t){var n=this;setTimeout(function(){t(n[e])},0)},addTest:function(e,t,n){C.push({name:e,fn:t,options:n})},addAsyncTest:function(e){C.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=x,Modernizr=new Modernizr,Modernizr.addTest("svg",!!t.createElementNS&&!!t.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect);var S=x._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];x._prefixes=S;var w=t.documentElement,_="svg"===w.nodeName.toLowerCase();_||!function(e,t){function n(e,t){var n=e.createElement("p"),r=e.getElementsByTagName("head")[0]||e.documentElement;return n.innerHTML="x<style>"+t+"</style>",r.insertBefore(n.lastChild,r.firstChild)}function r(){var e=b.elements;return"string"==typeof e?e.split(" "):e}function o(e,t){var n=b.elements;"string"!=typeof n&&(n=n.join(" ")),"string"!=typeof e&&(e=e.join(" ")),b.elements=n+" "+e,f(t)}function i(e){var t=y[e[g]];return t||(t={},v++,e[g]=v,y[v]=t),t}function a(e,n,r){if(n||(n=t),c)return n.createElement(e);r||(r=i(n));var o;return o=r.cache[e]?r.cache[e].cloneNode():h.test(e)?(r.cache[e]=r.createElem(e)).cloneNode():r.createElem(e),!o.canHaveChildren||m.test(e)||o.tagUrn?o:r.frag.appendChild(o)}function s(e,n){if(e||(e=t),c)return e.createDocumentFragment();n=n||i(e);for(var o=n.frag.cloneNode(),a=0,s=r(),u=s.length;u>a;a++)o.createElement(s[a]);return o}function u(e,t){t.cache||(t.cache={},t.createElem=e.createElement,t.createFrag=e.createDocumentFragment,t.frag=t.createFrag()),e.createElement=function(n){return b.shivMethods?a(n,e,t):t.createElem(n)},e.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+r().join().replace(/[\w\-:]+/g,function(e){return t.createElem(e),t.frag.createElement(e),'c("'+e+'")'})+");return n}")(b,t.frag)}function f(e){e||(e=t);var r=i(e);return!b.shivCSS||l||r.hasCSS||(r.hasCSS=!!n(e,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),c||u(e,r),e}var l,c,d="3.7.3",p=e.html5||{},m=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,h=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g="_html5shiv",v=0,y={};!function(){try{var e=t.createElement("a");e.innerHTML="<xyz></xyz>",l="hidden"in e,c=1==e.childNodes.length||function(){t.createElement("a");var e=t.createDocumentFragment();return"undefined"==typeof e.cloneNode||"undefined"==typeof e.createDocumentFragment||"undefined"==typeof e.createElement}()}catch(n){l=!0,c=!0}}();var b={elements:p.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:d,shivCSS:p.shivCSS!==!1,supportsUnknownElements:c,shivMethods:p.shivMethods!==!1,type:"default",shivDocument:f,createElement:a,createDocumentFragment:s,addElements:o};e.html5=b,f(t),"object"==typeof module&&module.exports&&(module.exports=b)}("undefined"!=typeof e?e:this,t);var T="Moz O ms Webkit",E=x._config.usePrefixes?T.toLowerCase().split(" "):[];x._domPrefixes=E;var k;!function(){var e={}.hasOwnProperty;k=r(e,"undefined")||r(e.call,"undefined")?function(e,t){return t in e&&r(e.constructor.prototype[t],"undefined")}:function(t,n){return e.call(t,n)}}(),x._l={},x.on=function(e,t){this._l[e]||(this._l[e]=[]),this._l[e].push(t),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},x._trigger=function(e,t){if(this._l[e]){var n=this._l[e];setTimeout(function(){var e,r;for(e=0;e<n.length;e++)(r=n[e])(t)},0),delete this._l[e]}},Modernizr._q.push(function(){x.addTest=a}),Modernizr.addTest("cssgradients",function(){var e="background-image:",t="gradient(linear,left top,right bottom,from(#9f9),to(white));",n="linear-gradient(left top,#9f9, white);",r=e+S.join(n+e).slice(0,-e.length);Modernizr._config.usePrefixes&&(r+=e+"-webkit-"+t);var o=u("a"),i=o.style;return i.cssText=r,(""+i.backgroundImage).indexOf("gradient")>-1}),Modernizr.addTest("multiplebgs",function(){var e=u("a").style;return e.cssText="background:url(https://),url(https://),red url(https://)",/(url\s*\(.*?){3}/.test(e.background)}),Modernizr.addTest("csspointerevents",function(){var e=u("a").style;return e.cssText="pointer-events:auto","auto"===e.pointerEvents}),Modernizr.addTest("rgba",function(){var e=u("a").style;return e.cssText="background-color:rgba(150,255,150,.5)",(""+e.backgroundColor).indexOf("rgba")>-1}),Modernizr.addTest("inlinesvg",function(){var e=u("div");return e.innerHTML="<svg/>","http://www.w3.org/2000/svg"==("undefined"!=typeof SVGRect&&e.firstChild&&e.firstChild.namespaceURI)});var z="CSS"in e&&"supports"in e.CSS,N="supportsCSS"in e;Modernizr.addTest("supports",z||N);var j=x._config.usePrefixes?T.split(" "):[];x._cssomPrefixes=j;var P=function(t){var r,o=S.length,i=e.CSSRule;if("undefined"==typeof i)return n;if(!t)return!1;if(t=t.replace(/^@/,""),r=t.replace(/-/g,"_").toUpperCase()+"_RULE",r in i)return"@"+t;for(var a=0;o>a;a++){var s=S[a],u=s.toUpperCase()+"_"+r;if(u in i)return"@-"+s.toLowerCase()+"-"+t}return!1};x.atRule=P;var L=x.testStyles=l;Modernizr.addTest("touchevents",function(){var n;if("ontouchstart"in e||e.DocumentTouch&&t instanceof DocumentTouch)n=!0;else{var r=["@media (",S.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");L(r,function(e){n=9===e.offsetTop})}return n}),L('#modernizr{font:0/0 a}#modernizr:after{content:":)";visibility:hidden;font:7px/1 a}',function(e){Modernizr.addTest("generatedcontent",e.offsetHeight>=7)});var F={elem:u("modernizr")};Modernizr._q.push(function(){delete F.elem});var O={style:F.elem.style};Modernizr._q.unshift(function(){delete O.style});x.testProp=function(e,t,r){return g([e],n,t,r)};x.testAllProps=v;x.prefixed=function(e,t,n){return 0===e.indexOf("@")?P(e):(-1!=e.indexOf("-")&&(e=s(e)),t?v(e,t,n):v(e,"pfx"))};x.testAllProps=y,Modernizr.addTest("backgroundsize",y("backgroundSize","100%",!0)),Modernizr.addTest("appearance",y("appearance")),Modernizr.addTest("csstransforms",function(){return-1===navigator.userAgent.indexOf("Android 2.")&&y("transform","scale(1)",!0)}),Modernizr.addTest("csstransforms3d",function(){var e=!!y("perspective","1px",!0),t=Modernizr._config.usePrefixes;if(e&&(!t||"webkitPerspective"in w.style)){var n;Modernizr.supports?n="@supports (perspective: 1px)":(n="@media (transform-3d)",t&&(n+=",(-webkit-transform-3d)")),n+="{#modernizr{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0}}",L(n,function(t){e=9===t.offsetLeft&&5===t.offsetHeight})}return e}),Modernizr.addTest("csstransitions",y("transition","all",!0)),o(),i(b),delete x.addTest,delete x.addAsyncTest;for(var D=0;D<Modernizr._q.length;D++)Modernizr._q[D]();e.Modernizr=Modernizr}(window,document);;/**/
// Jsonp method for accessing grapeshot api.
var getJSONP = (function(){
  return {
    send: function(src, options) {
      var callback_name = options.callbackName || 'parseResponse',
          on_success = options.onSuccess || function(){},
          on_timeout = options.onTimeout || function(){},
          timeout = options.timeout || 10; // sec

      var timeout_trigger = window.setTimeout(function(){
        window[callback_name] = function(){};
        on_timeout();
      }, timeout * 1000);

      window[callback_name] = function(data){
        window.clearTimeout(timeout_trigger);
        on_success(data);
      }

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = src;

      document.getElementsByTagName('head')[0].appendChild(script);
    }
  };
})();

// Attach GPT async.
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
(function () {
  var gads = document.createElement('script');
  gads.async = true;
  var useSSL = 'https:' == document.location.protocol;
  gads.src = (useSSL ? 'https:' : 'http:') +
     '//www.googletagservices.com/tag/js/gpt.js';
  var node = document.getElementsByTagName('script')[0];
  node.parentNode.insertBefore(gads, node);
})();

(function ($) {
  // Ad slots that have been defined but not yet displayed.
  var awaitingInit = [],
    awaitingLazyLoad = [],
    init = false;

  /**
   * Internal helper function to determine number of jQuery listeners.
   */
  function listenerCount (domEl, listener) {
    if (typeof $._data(domEl, "events")[listener] === "undefined") {
      return 0;
    }

    return $._data(domEl, "events")[listener].length;
  }
  /**
   * Check if a DOM Element is visible in the viewport.
   */
  function elementInView(el) {
    var top = el.offsetTop,
      height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }

    return (
      top < (window.pageYOffset + window.innerHeight) &&
      (top + height) >= window.pageYOffset
    );
  }
  /**
   * Used to throttle scroll callback.
   */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  Drupal.GPT = Drupal.GPT || {};
  Drupal.GPT.slots = Drupal.GPT.slots || {};
  Drupal.GPT.attachTargeting = function (slot, targeting, override) {
    var key
      , values
      , i;
    if (typeof override === 'undefined') {
      override = false;
    }
    for (key in targeting) {
      // Init values for the key.
      if (override) {
        values = [];
      }
      else {
        values = slot.getTargeting(key);
      }
      // Populate values from targeting.
      for (i in targeting[key]) {
        if ('eval' in targeting[key][i] && Boolean(targeting[key][i].eval)) {
          try {
            values.push(eval(targeting[key][i].value));
          }
          catch (e) {
            // Silently fail bad JS.
          }
        }
        else {
          values.push(targeting[key][i].value);
        }
      }
      // Temporary fix for Krux segments exceeding max size.
      if (jQuery.isArray(values[0]) && values[0].length > 40) {
        values[0] = shuffle(values[0]).slice(0, 40);
      }
      slot.setTargeting(key, values);
    }
  };
  Drupal.GPT.buildSizeMapping = function (sizes) {
    var i = 0;
    var m = {
      mapping: googletag.sizeMapping(),
      define: null
    };
    for (i; i < sizes.length; i++) {
      m.mapping.addSize(sizes[i][0], sizes[i][1]);
      if (sizes[i][1].length) {
        if (typeof sizes[i][1][0] === 'number') {
          m.define = sizes[i][1];
        }
        else {
          m.define = sizes[i][1][0];
        }
      }
    }
    return m;
  };
  /**
   * Queues a slot definition to be processed.
   */
  Drupal.GPT.createSlot = function (slotId, definition, pageTargeting, lazy) {
    if (lazy) {
      awaitingLazyLoad.push([slotId, definition, pageTargeting]);
    } else {
      awaitingInit.push([slotId, definition, pageTargeting]);
    }
  };
  /**
   * Check if any lazy loaded slots are in view.
   */
  Drupal.GPT.checkLazy = function() {
    var newSlots = [];
    for (var i = 0; i < awaitingLazyLoad.length; i++) {
      var element = document.getElementById(awaitingLazyLoad[i][0]);
      if (!awaitingLazyLoad[i][3] && elementInView(element)) {
        Drupal.GPT.addSlot(awaitingLazyLoad[i][0], awaitingLazyLoad[i][1], awaitingLazyLoad[i][2]);
        awaitingLazyLoad[i][3] = true;
        googletag.cmd.push(function () {
          newSlots.push(Drupal.GPT.grabSlot(awaitingLazyLoad[i][0]));
        });
      }
    }
    googletag.cmd.push(function () {
      if (newSlots.length) {
        googletag.pubads().refresh(newSlots);
      }
    });
  }
  /**
   * Processes a slot definition.
   */
  Drupal.GPT.addSlot = function (slotId, definition, pageTargeting) {
    // Add an event so third party code can react to a slot before definition.
    googletag.cmd.push(function () {
      jQuery(document).trigger('gptSlotDefine', [slotId]);
    });
    googletag.cmd.push(definition);
    if (pageTargeting) {
      googletag.cmd.push(function () {
        Drupal.GPT.attachTargeting(
            Drupal.GPT.grabSlot(slotId),
            Drupal.settings.gpt.targeting);
      });
    }
    // Add an event so third party code can react to a slot definition before
    // ad display.
    googletag.cmd.push(function () {
      jQuery(document).trigger('gptSlotDefined', [slotId]);
    });

    Drupal.GPT.displaySlot(slotId);
  };
  Drupal.GPT.displaySlot = function (slotId) {
    googletag.cmd.push(function () {
      googletag.display(slotId);
    });
  };
  /**
   * Retrieve one slot object, if slotId, provided or an object of all slots.
   */
  Drupal.GPT.grabSlot = function (slotId) {
    if (typeof slotId === 'undefined') {
      return Drupal.GPT.slots;
    }
    if (typeof this.slots[slotId] !== 'undefined') {
      return Drupal.GPT.slots[slotId];
    }
    return false;
  };
  /**
   * Refreshes list of slots, but updates correlator once.
   *
   * For GPT to see these ad refreshes as companion, the correlator value must
   * be updated once, and then all ads can be refreshed.
   *
   * @param slots
   *   If provided, should be an array of ad definitions.
   */
  Drupal.GPT.refreshSlots = function (slots) {
    if (typeof slots === 'undefined') {
      slots = null;
    }
    // Miliseconds to wait for third parties to finish their work.
    var maxDelay = 500;

    // Note debouncing may be desired here.
    googletag.cmd.push(function () {
      Drupal.GPT.wait(maxDelay, document, 'gptSlotsRefresh', [slots], function () {
        googletag.pubads().updateCorrelator();
        googletag.pubads().refresh(slots, {changeCorrelator: false});
      });
    });
  }
  /**
   * Helper to update the correlator value for GPT ads.
   *
   * After this is called, any calls to googletag.pubads().refresh() should
   * pass parameter to not refresh correlator.
   */
  Drupal.GPT.updateCorrelator = function () {
    googletag.cmd.push(function() {
      googletag.pubads().updateCorrelator();
    });
  }
  Drupal.GPT.unitPath = function () {
    var p = [Drupal.settings.gpt.networkCode];
    if ('targetedUnit' in Drupal.settings.gpt
        && Drupal.settings.gpt.targetedUnit.length) {
      p.push(Drupal.settings.gpt.targetedUnit);
    }
    return '/' + p.join('/');
  }
  // Simple promise-esque handle which provides timeout-able execution with an
  // unknown list of handlers.
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
    }

    // Prepend the args with done so that listeners can respond.
    args.unshift(done);

    $(domEl).trigger(eventName, args);
  }

  Drupal.behaviors.gpt = {
    attach: function (context, settings) {
      var gsurl = "https://www.topgear.com" + window.location.pathname;
      var gs_endpoint = "https://immediate.grapeshot.co.uk/topgear/channels-jsonp.cgi?callback=parseResponse&url=" + encodeURIComponent(gsurl);

      if (!init) {
        init = true;

        googletag.cmd.push(function () {

          getJSONP.send(gs_endpoint, {
            onSuccess: function(segments){
              if (segments.channels) {
                var grapeshot_segments = segments.channels.map(function(item) {return item.name}).toString()
                gpt_main(settings, grapeshot_segments);
              } else {
                // In case there is an issue with grapeshot we can still serve ads but without grapeshot segements
                gpt_main(settings, null);
              }
            },
            onTimeout: function() {
              // If Grapeshot fails serve ads without grapeshot segments
              gpt_main(settings, null);
            },
            timeout: 1
          });
        });
      }
    }
  };

  function gpt_main(settings, grapeshot_segs) {
    // Override googletag.defineSlot so that we can store references to the
    // slots defined, since Google doesn't provide a documented method to
    // retrieve defined slots.
    var gptDefineSlot = googletag.defineSlot;
    googletag.defineSlot = function (adUnitPath, size, div) {
      Drupal.GPT.slots[div] = gptDefineSlot(adUnitPath, size, div);
      return Drupal.GPT.slots[div];
    };

    // Override googletag.defineOutOfPageSlot for same reason as above.
    var gptDefineOutOfPageSlot = googletag.defineOutOfPageSlot;
    googletag.defineOutOfPageSlot = function (adUnitPath, div) {
      Drupal.GPT.slots[div] = gptDefineOutOfPageSlot(adUnitPath, div);
      return Drupal.GPT.slots[div];
    };

    // Set page level targeting.
    if (settings.gpt.setPageLevelTargeting) {
      if(grapeshot_segs !== null) {
        Drupal.settings.gpt.targeting.gs_cat = {
          0: {
            value: grapeshot_segs
          }
        }
      }
      var pageTargeting = googletag.pubads();
      Drupal.GPT.attachTargeting(pageTargeting, Drupal.settings.gpt.targeting, true);
    }

    // Collapse empty divs.
    if (settings.gpt.collapseEmptyDivs) {
      googletag.pubads().collapseEmptyDivs();
    }

    // Enable SRA while disabling initial load. Must use refresh() to
    // fetch newly created ads. This gives us the most flexibility.
    googletag.pubads().enableSingleRequest();
    googletag.pubads().disableInitialLoad();

    // Check if one trust is enabled.
    if(settings.tg_onetrust) {
      var onetrust_cookie = window.Cookies.get('OptanonConsent');
      // The "C0004:1" represents cookie group "4" (targeting cookies) and 1 for enabled.
      if (onetrust_cookie.indexOf("C0004:1,") >= 0) {
        // Show personalised ads.
         googletag.pubads().setRequestNonPersonalizedAds(0)
      } else {
        // Don't show personalised ads.
        googletag.pubads().setRequestNonPersonalizedAds(1)
      }

    }

    // Enable services.
    googletag.enableServices();

    googletag.cmd.push(function () {
      // Add slots that have been waiting.
      for (var i = 0; i < awaitingInit.length; i++) {
        Drupal.GPT.addSlot(awaitingInit[i][0], awaitingInit[i][1], awaitingInit[i][2]);
      }
    });

    googletag.cmd.push(function () {
      // Refresh new slots.
      var newSlots = [];
      for (var i = 0; i < awaitingInit.length; i++) {
        newSlots.push(Drupal.GPT.grabSlot(awaitingInit[i][0]));
      }
      googletag.pubads().refresh(newSlots);
      awaitingInit = [];
    });

    googletag.cmd.push(function () {
      // Add scroll handler for lazy loaded ads.
      jQuery(window).scroll(debounce(Drupal.GPT.checkLazy, 100, true));
      Drupal.GPT.checkLazy();
    });
  }

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
})(jQuery);
;/**/
