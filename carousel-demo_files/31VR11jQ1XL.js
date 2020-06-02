(function(k){var q=window.AmazonUIPageJS||window.P,r=q._namespace||q.attributeErrors,e=r?r("DetailPageTwisterViewAsset",""):q;e.guardFatal?e.guardFatal(k)(e,window):e.execute(function(){k(e,window)})})(function(k,q,r){k.when("A","dp-refresh-handler","view-util","twister-string-constants").register("page-refresh-view",function(e,E,l,h){var n=e.$;return function(p,m,r){function z(b){return{chunk:function(c){var d=c.ASIN,b=c.Value;c=c.FeatureName;if(!f.hiddenFeatures[c]){var g=c,a,t;try{g&&b&&b.content&&
(t=b.content[g],"undefined"!==typeof t&&(a=n("#"+g),a.html(t),a.css({opacity:""})))}catch(h){g=g||"NoFeatureName",w.logFatal(h,{message:"Error in feature"+g})}f.twisterRefreshHandler.stampFeature(g,d);"twister-slot-price_feature_div"==c&&(d=b?b.content:null,a=n(".swatchSelect .twisterSwatchPrice").html(),b=n(".swatchSelect .price_slot_ppu").html(),a&&d&&d.priceToSet&&(a=e.trim(a),d.priceToSet!==a&&(n(".swatchSelect .twisterSwatchPrice").html(d.priceToSet),u("twisterUpdatePriceMismatch"))),b&&d&&d.hasPricePerUnit&&
d.pricePerUnitDisplay&&(b=e.trim(b),d.pricePerUnitDisplay!==b&&(n(".swatchSelect .price_slot_ppu").html(d.pricePerUnitDisplay),u("twisterUpdatePricePerUnitMismatch"))))}},success:function(b,d,f){u("twisterUpdateSuccess")},error:function(b,d,f){Twister.$("#variations-overlay").hide();u("twisterUpdateFailure");Twister.showErrorMessageOnFailure&&(alert(Twister.errorMessageOnFailure),location.reload())},abort:function(b){w.logFatal("Ajax aborted: "+b)},timeout:4E4}}function A(b,c,d,f,g){var a=[];"parent"===
b?(c=x(c,f,"parent",g),a.parent=c,c=x(d,f,"partial",g),a.partial=c):(c=x(d,f,b,g),a[b]=c);return a}function y(b,c,d,h,g){for(var a in b)if(b.hasOwnProperty(a)){if("full"===a){var t=d.dimensionType,l=f.twisterUtil.getDimensionInfo().length,m=d.dimensionDisplayType,k=d.newAsin,p=g&&(e.state("dp-twister-csm")||{}).updateCSMPageTypeId;f.twisterRefreshHandler.startMeasurement(k,t,l,m,p?k:void 0,p?["is-twister","parentAsin-"+B]:void 0)}t=b[a].twisterRefreshParams;l=b[a].notifyClientParams;g&&(n(f.config[a].affectedFeatures).css({opacity:.5}),
f.twisterRefreshHandler.doPageRefresh(null,t,c,h));F(l.asin,l.id,a,g)}}function G(){n.each(m.contextMetaData,function(b,c){var d={};c=c.elementList||[];var h=c.length,g=[];d.click={};d.mouseOver={};for(var a=0;a<h;a++){var e=n("#"+c[a].divToUpdate);g.push("#"+c[a].divToUpdate);e.length&&c[a].customClientFunction&&(c[a].updateOnHover&&(d.mouseOver[c[a].divToUpdate]=e.attr("customfunctionname")),d.click[c[a].divToUpdate]=e.attr("customfunctionname"))}f.config[b].affectedFeatures=g.join(",");f.config[b].clientFeatures=
d})}function F(b,c,d,e){var g="",g=e?h.EVENT_TYPE_CLICK:h.EVENT_TYPE_MOUSEOVER;n.each(f.config[d].clientFeatures[g],function(a,d){try{var g=function(){f.twisterRefreshHandler.stampImageLoad(b)};(function(){var a={};a.P=k;(function(){eval("var P \x3d this.P;");eval("0, "+d)(c,DetailPage.StateController,g)}).call(a)})()}catch(e){w.logFatal("Client feature - "+a+", threw and exception :- "+e)}})}function x(b,c,d,h){var g={},a={};g.asinList=b;g.id="parent"===d?b:"partial"===h?c:b;g.mType=d;g=H(d,g);d=
!1;(h=e.state("pwState"))&&(d=h.isTryState);d&&(g.isTryState=d);g=f.twisterRefreshHandler.createCustomParamsMap({},g);a.asin=b;a.id=c;return{twisterRefreshParams:g,notifyClientParams:a}}function H(b,c){n.each(m.contextMetaData[b].mTypeSpecificURLParams,function(b,f){c[b]=f});return c}function I(b){b=f.twisterUtil.getSelectionInfoFromSelectedVariationValuesMap(b.selected_variation_values);f.twisterUtil.isFullySelected(b)?f.currentPageSelectionState="full":f.currentPageSelectionState="partial"}function J(b){var c=
{};b=b.twisterUpdateURLInfo.immutableURLPrefix;b+="\x26isFlushing\x3d2\x26dpEnvironment\x3d"+Twister.dpEnvironment;c.pageRefreshUrl=b;return c}function K(b){var c={};c.config=b.measurement;c.dimensionDisplayType=b.dimensionsDisplayType;c.storeID=b.storeID;c.productGroupID=b.productGroupID;return c}function C(b,c){var d;"partial"===b&&"partial"===c&&(d="partial");"partial"===b&&"full"===c&&(d="full");"full"===b&&"partial"===c&&(d="parent");"full"===b&&"full"===c&&(d="full");return d}var f=this,B=m.parent_asin,
v=q.ue,D="",w=new r("dpTwisterPageRefreshView");this.twisterUtil=p.util;this.twisterFeatureName="Twister";this.currentPageSelectionState;this.twisterRefreshHandler;this.config={partial:{},full:{},parent:{},master:{}};this.hiddenFeatures={intermediateEOS:1,EOS:1};f.viewUtil=new l(p);f.subType;var u=function(b){v&&v.count&&v.count(b,(v.count(b)||0)+1)};(function(){I(m);G();var b={featureName:f.twisterFeatureName},c=J(m),d=K(m);f.twisterRefreshHandler=new E(b,c,d);p.registerPassive({viewAttribution:"DetailPage",
viewName:"WebTwisterRefreshView"},{updateView:function(b,c){var a={};if(b!==h.METADATA){var a={},d;d=void 0;if(c)switch(b){case h.VARIATION_CHANGE:d=c.selected().selInfo;break;case h.VARIATION_PEEK:d=c.peek().selInfo}a.selectionInfo=d;a.dimensionCombination=f.viewUtil.getCurrDimCombId(a.selectionInfo,"_","X");d=f.twisterUtil.isFullySelected(a.dimensionCombination);a.childAsin=f.twisterUtil.getAsinFromSelectionInfo(a.selectionInfo,d);a.newPageSelectionState=d?"full":"partial";a.mTypeForRefresh=C(f.currentPageSelectionState,
a.newPageSelectionState);a.newAsin="parent"===a.mTypeForRefresh?B:a.childAsin;a.doNotAbort="parent"===a.mTypeForRefresh?!0:!1;a.twisterCallListParams=A(a.mTypeForRefresh,a.newAsin,a.childAsin,a.dimensionCombination,a.newPageSelectionState);a.optionsForTwisterRefresh=z(c);a.pageRefreshMeasure={newAsin:a.newAsin,dimensionType:D,dimensionDisplayType:m.dimensionsDisplayType}}switch(b){case h.VARIATION_CHANGE:f.subType!==h.PRODUCTIZED_VIEW_SUBTYPE&&(y(a.twisterCallListParams,a.optionsForTwisterRefresh,
a.pageRefreshMeasure,a.doNotAbort,!0),f.currentPageSelectionState=a.newPageSelectionState,f.subType=void 0);break;case h.VARIATION_PEEK:y(a.twisterCallListParams,a.optionsForTwisterRefresh,a.pageRefreshMeasure,a.doNotAbort,!1);break;case h.METADATA:switch(c.subType){case h.DP_STATE_VIEW_SUBTYPE:D=c.divMetadata.dimDisplayType;break;case h.PRODUCTIZED_VIEW_SUBTYPE:f.subType=c.subType,a.dimensionCombination=c.newDimCombID,a.childAsin=c.childAsin,a.newAsin=c.newAsin,a.newPageSelectionState=f.twisterUtil.isFullySelected(a.dimensionCombination)?
"full":"partial",a.mTypeForRefresh=C(f.currentPageSelectionState,a.newPageSelectionState),a.doNotAbort="parent"===a.mTypeForRefresh?!0:!1,a.twisterCallListParams=A(a.mTypeForRefresh,a.newAsin,a.childAsin,a.dimensionCombination,a.newPageSelectionState),a.optionsForTwisterRefresh=z(c),a.pageRefreshMeasure={newAsin:a.newAsin,dimensionType:c.divMetaData?c.divMetaData.dimDisplayType:void 0,dimensionDisplayType:m.dimensionsDisplayType},y(a.twisterCallListParams,a.optionsForTwisterRefresh,a.pageRefreshMeasure,
a.doNotAbort,!0),f.currentPageSelectionState=a.newPageSelectionState}}}})})()}});k.when("A").register("twister-common-constants",function(e){return{FAMILY_SIZE_BUCKET_LIMITS:[0,3,8,25,50,100,1E3,5E3],DEFAULT_SELECTION_TAG:"defaultSelection",BottomSheet:{TRIGGERING_CRITERION_BOTTOMSHEET_OPEN:"onBottomsheetOpen",BOTTOM_SHEET_SELECTOR:"#twister_bottom_sheet",OVERFLOW_THRESHOLD:8,BOTTOM_SHEET_INIT_TIME:"dpBottomSheetInitTime",PREFETCH_AJAX_CALLS_COMPLETED_EVENT:"prefetchAjaxCallsCompleted"},SortingFiltering:{PRICE_SORT_TOGGLE_SWITCH_CLICK_ON_METRIC:"DPBottomSheetSortingToggleSwitchClickOn",
PRICE_SORT_TOGGLE_SWITCH_CLICK_OFF_METRIC:"DPBottomSheetSortingToggleSwitchClickOff",PRICE_SORT_TOGGLE_SWITCH_ENABLED_STATUS_METRIC:"DPBottomSheetPriceSortingToggleSwitchEnabledStatus",PRIME_FILTER_TOGGLE_SWITCH_CLICK_ON_METRIC:"DPBottomSheetPrimeFilteringToggleSwitchClickOn",PRIME_FILTER_TOGGLE_SWITCH_CLICK_OFF_METRIC:"DPBottomSheetPrimeFilteringToggleSwitchClickOff",PRIME_FILTER_TOGGLE_SWITCH_ENABLED_STATUS_METRIC:"DPBottomSheetPrimeFilteringToggleSwitchEnabledStatus",SORTING_TYPE_PRICE:"price",
SORTING_TYPE_UNSORTED:"unsorted",PREFETCH_AJAX_CALLS_COMPLETED_EVENT:"prefetchAjaxCallsCompleted",TOGGLE_SWITCH_STATE_OFF:"off",TOGGLE_SWITCH_STATE_ON:"on",PRICE_SORTING_ENABLED_PARAMETER:"priceSortingEnabled",PRICE_SORTING_PRIORITY_NAME_PARAMETER:"priceSortingPriorityName",ALTER_TYPE_NAME_PRICE:"price",ALTER_TYPE_NAME_PRIME:"prime",ALTER_SUB_TYPE_ENABLE:"enable",ALTER_SUB_TYPE_DISABLE:"disable",ALTER_TYPE_SORT:"sort",ALTER_TYPE_FILTER:"filter",PRICE_SORT_TOGGLE_SWITCH_SELECTOR:".priceSortToggleSwitch",
PRIME_FILTER_TOGGLE_SWITCH_SELECTOR:".primeFilterToggleSwitch",EXPERIMENT_PRICE_SORTING:"priceSorting",EXPERIMENT_PRIME_FILTERING:"primeFiltering",ATTRIBUTE_PRICE_SORTING_PRIORITY:"priorityName",ATTRIBUTE_SORT_BY_PRICE_STRING:"sortByPriceString",ATTRIBUTE_SORTED_BY_PRICE_STRING:"sortedByPriceString",ATTRIBUTE_TOOL_NAME:"toolName",TOOL_TYPE_TOGGLE_SWITCH:"toggleSwitch"}}});"use strict";k.when("A","twister-util","ready").execute(function(e,k){var l=q.ue;if(void 0!==e.state("dimensionKeyList"))for(var h in e.state("dimensionKeyList").dimensionKeys)void 0!==
h&&(e.on("a:popover:beforeShow:mobile-twister_"+h,function(h){void 0===e.state("twisterInteractability")&&l&&"function"===typeof l.count&&l.count("Twister:blankTwisterSecView",(l.count("Twister:blankTwisterSecView")||0)+1)}),e.on("a:popover:beforeHide:mobile-twister_"+h,function(e){if(e&&e.popover){e=e.popover.getContent();var h=0<e.find(".aw-twister-row:first").length;e&&!h&&l&&"function"===typeof l.count&&l.count("blankTwisterSecondaryView",(l.count("blankTwisterSecondaryView")||0)+1)}}))});"use strict";
k.when("A").register("twister-bottom-sheet-container",function(e){return{getInstance:function(){return this.sheetViewInstance},saveInstance:function(k){this.sheetViewInstance=k;e.trigger("dp:sheet:twister:initialized")}}});"use strict";k.when("A","a-sheet","jQuery","ready").execute(function(e,k,l){e.on("a:sheet:afterShow:bottom_sheet_mediaMatrix",function(){var e=l("#mediaMatrix_bottomSheet_view_div").find("#format-picker-scroller"),k=e.find("#selected-format"),p=k.offset().left,m=Math.abs(k.width()),
k=Math.max(document.documentElement.clientWidth,q.innerWidth||0),m=k-m,r=e.scrollLeft();(p>m||0>=p)&&e.scrollLeft(r+p-k/3)})})});