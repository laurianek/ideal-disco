(function () {


  Drupal.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  function getWindowSize() {
    Drupal.windowSize = {
      width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };
  }

  // Store window size so we don't recalcualte styles every time we access it.
  if (!window.addEventListener) {
    window.attachEvent('onresize', Drupal.debounce(getWindowSize, 10));  }
  else {
    window.addEventListener('resize', Drupal.debounce(getWindowSize, 10));
  }
  getWindowSize();

  // Custom Modernizr test for 'appearance' property.
  Modernizr.addTest('appearance', function () {
    return Modernizr.testAllProps('appearance');
  });
}());

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
;/**/

/*

 MyFonts Webfont Build ID 3014842, 2015-04-24T06:20:54-0400

 The fonts listed in this notice are subject to the End User License
 Agreement(s) entered into by the website owner. All other parties are
 explicitly restricted from using the Licensed Webfonts(s).

 You may obtain a valid license at the URLs below.

 Webfont: PillGothic300mg-Bold by Betatype
 URL: http://www.myfonts.com/fonts/betatype/pill-gothic/300mg-bold/

 Webfont: PillGothic300mg-Regular by Betatype
 URL: http://www.myfonts.com/fonts/betatype/pill-gothic/300mg-regular/


 License: http://www.myfonts.com/viewlicense?type=web&buildid=3014842
 Licensed pageviews: 60,000,000
 Webfonts copyright: Copyright (c) 2007 by Betatype. All rights reserved.

 ? 2015 MyFonts Inc
*/

var protocol = document.location.protocol;
if (protocol !== "https:") {
  protocol = "http:";
}
var count = document.createElement("script");
count.type = "text/javascript";
count.async = true;
count.src = protocol + "//hello.myfonts.net/count/2e00ba";
var s = document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(count, s);

var browserVersion,
  webfontType,
  woffEnabled = true,
  svgEnabled = false,
  woff2Enabled = false,
  wfpath = "/sites/all/themes/custom/tg/libraries/pill-gothic/webfonts/",
  browsers = [{
    regex: "MSIE (\\d+\\.\\d+)",
    versionRegex: "new Number(RegExp.$1)",
    type: [{
      version: 9,
      type: "woff"
    }, {
      version: 5,
      type: "eot"
    }]
  }, {
    regex: "Trident/(\\d+\\.\\d+); (.+)?rv:(\\d+\\.\\d+)",
    versionRegex: "new Number(RegExp.$3)",
    type: [{
      version: 11,
      type: "woff"
    }]
  }, {
    regex: "Firefox[/s](\\d+\\.\\d+)",
    versionRegex: "new Number(RegExp.$1)",
    type: [{
      version: 3.6,
      type: "woff"
    }, {
      version: 3.5,
      type: "ttf"
    }]
  }, {
    regex: "Chrome/(\\d+\\.\\d+)",
    versionRegex: "new Number(RegExp.$1)",
    type: [{
      version: 36,
      type: "woff2"
    }, {
      version: 6,
      type: "woff"
    }, {
      version: 4,
      type: "ttf"
    }]
  }, {
    regex: "Mozilla.*Android (\\d+\\.\\d+).*AppleWebKit.*Safari",
    versionRegex: "new Number(RegExp.$1)",
    type: [{
      version: 4.1,
      type: "woff"
    }, {
      version: 3.1,
      type: "svg#wf"
    }, {
      version: 2.2,
      type: "ttf"
    }]
  }, {
    regex: "Mozilla.*(iPhone|iPad).* OS (\\d+)_(\\d+).* AppleWebKit.*Safari",
    versionRegex: "new Number(RegExp.$2) + (new Number(RegExp.$3) / 10)",
    unhinted: !0,
    type: [{
        version: 5,
        type: "woff"
    }, {
        version: 4.2,
        type: "ttf"
    }, {
        version: 1,
        type: "svg#wf"
    }]
  }, {
    regex: "Mozilla.*(iPhone|iPad|BlackBerry).*AppleWebKit.*Safari",
    versionRegex: "1.0",
    type: [{
      version: 1,
      type: "svg#wf"
    }]
  }, {
    regex: "Version/(\\d+\\.\\d+)(\\.\\d+)? Safari/(\\d+\\.\\d+)",
    versionRegex: "new Number(RegExp.$1)",
    type: [{
      version: 5.1,
      type: "woff"
    }, {
      version: 3.1,
      type: "ttf"
    }]
  }, {
    regex: "Opera/(\\d+\\.\\d+)(.+)Version/(\\d+\\.\\d+)(\\.\\d+)?",
    versionRegex: "new Number(RegExp.$3)",
    type: [{
      version: 24,
      type: "woff2"
    }, {
      version: 11.1,
      type: "woff"
    }, {
      version: 10.1,
      type: "ttf"
    }]
  }],
  browLen = browsers.length,
  suffix = "",
  head = document.getElementsByTagName("head")[0];

a: for (var i = 0; i < browLen; i++) {
  var regex = new RegExp(browsers[i].regex);
  if (regex.test(navigator.userAgent)) {
    browserVersion = eval(browsers[i].versionRegex);
    var typeLen = browsers[i].type.length;
    for (var j = 0; j < typeLen; j++) {
      if (browserVersion >= browsers[i].type[j].version && (!0 == browsers[i].unhinted && (suffix = "_unhinted"), webfontType = browsers[i].type[j].type, "woff" != webfontType || woffEnabled) && ("woff2" != webfontType || woff2Enabled) && ("svg#wf" != webfontType || svgEnabled)) break a
    }
  } else {
    webfontType = "woff";
  }
}
/(Macintosh|Android)/.test(navigator.userAgent) && "svg#wf" != webfontType && (suffix = "_unhinted");

if (webfontType === 'eot') {
  var fonts = [{
      fontFamily: "PillGothic",
      fontWeight: "bold",
      fontStyle: "normal",
      url: wfpath + "2E00BA_0" + suffix + "_0." + webfontType
    }, {
      fontFamily: "PillGothic",
      url: wfpath + "2E00BA_1" + suffix + "_0." + webfontType
    }],
    len = fonts.length,
    stylesheet = document.createElement("style");

  for (var css = "", i = 0; i < len; i++) {
      var format = "svg#wf" == webfontType ? 'format("svg")' : "ttf" == webfontType ? 'format("truetype")' : "eot" == webfontType ? "" : 'format("' + webfontType + '")',
          css = css + ("@font-face{font-family: " + fonts[i].fontFamily + ";src:url(" + fonts[i].url + ")" + format + ";");
      fonts[i].fontWeight && (css += "font-weight: " + fonts[i].fontWeight + ";");
      fonts[i].fontStyle && (css += "font-style: " + fonts[i].fontStyle + ";");
      css += "}"
  }
  stylesheet.setAttribute("type", "text/css");
  head.appendChild(stylesheet);
  stylesheet.styleSheet ? stylesheet.styleSheet.cssText = css : stylesheet.innerHTML = css;
}
else {
  var link = document.createElement("link"),
    data_fn;

"ttf" == webfontType ? data_fn = "_unhinted" == suffix ? "2E00BA_data_unhintedttf.css" : "2E00BA_datattf.css" : "woff" == webfontType && (data_fn = "_unhinted" == suffix ? "2E00BA_data_unhintedwoff.css" : "2E00BA_datawoff.css");

  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", wfpath + data_fn);
  head.appendChild(link);

}
;/**/
