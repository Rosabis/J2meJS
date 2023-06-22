if (!("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/g),
                        index = classes.indexOf(value);

                    fn(classes, index, value);
                    self.className = classes.join(" ");
                }
            }

            return {
                add: update(function(classes, index, value) {
                    if (!~index) classes.push(value);
                }),

                remove: update(function(classes, index) {
                    if (~index) classes.splice(index, 1);
                }),

                toggle: update(function(classes, index, value) {
                    if (~index)
                        classes.splice(index, 1);
                    else
                        classes.push(value);
                }),

                contains: function(value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                },

                item: function(i) {
                    return self.className.split(/\s+/g)[i] || null;
                }
            };
        }
    });
}

var __extends=this&&this.__extends||function(){var r=function(g,a){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,c){b.__proto__=c}||function(b,c){for(var d in c)Object.prototype.hasOwnProperty.call(c,d)&&(b[d]=c[d])})(g,a)};return function(g,a){function b(){this.constructor=g}if("function"!=typeof a&&null!==a)throw new TypeError("Class extends value "+String(a)+" is not a constructor or null");r(g,a);g.prototype=null===a?Object.create(a):(b.prototype=a.prototype,new b)}}(),
initData=(!function(){var r;"function"!=typeof window.CustomEvent&&((r=function(g,a){a=a||{bubbles:!1,cancelable:!1,detail:void 0};var b=document.createEvent("CustomEvent");return b.initCustomEvent(g,a.bubbles,a.cancelable,a.detail),b}).prototype=window.Event.prototype,window.CustomEvent=r)}(),{KEYS:{KEY_LEFT:[37,21],KEY_UP:[38,19],KEY_RIGHT:[39,22],KEY_DOWN:[40,20],KEY_ENTER:[13,23]},scrollEl:null,focusClassName:"focus",initDis:20,longPressTime:500,findFocusType:1,distanceToCenter:!1,offsetDistance:50,
limitingEl:null,formAutofocus:!0,focusableClassName:"",itemAttrname:"focusable",scrollSpeedX:0,scrollSpeedY:0,smoothTime:200,spacingTime:20}),eventType={LEFT:"left",UP:"up",RIGHT:"right",DOWN:"down"},focusdisableAttrname="focusdisable",leftEvent={type:eventType.LEFT,event:new CustomEvent(eventType.LEFT,{detail:{}})},rightEvent={type:eventType.RIGHT,event:new CustomEvent(eventType.RIGHT,{detail:{}})},upEvent={type:eventType.UP,event:new CustomEvent(eventType.UP,{detail:{}})},downEvent={type:eventType.DOWN,
event:new CustomEvent(eventType.DOWN,{detail:{}})},FocusData=(document.addEventListener("readystatechange",function(){"complete"==document.readyState&&(leftEvent={type:eventType.LEFT,event:new CustomEvent(eventType.LEFT,{detail:{}})},rightEvent={type:eventType.RIGHT,event:new CustomEvent(eventType.RIGHT,{detail:{}})},upEvent={type:eventType.UP,event:new CustomEvent(eventType.UP,{detail:{}})},downEvent={type:eventType.DOWN,event:new CustomEvent(eventType.DOWN,{detail:{}})})},!1),function(){this._KEYS=
initData.KEYS;this._scrollEl=initData.scrollEl;this._itemAttrname=initData.itemAttrname;this._focusClassName=initData.focusClassName;this._initDis=initData.initDis;this._findFocusType=initData.findFocusType;this._offsetDistance=initData.offsetDistance;this._longPressTime=initData.longPressTime;this._limitingEl=initData.limitingEl;this._distanceToCenter=initData.distanceToCenter;this._formAutofocus=initData.formAutofocus;this._focusableClassName=initData.focusableClassName;this._scrollSpeedX=initData.scrollSpeedX;
this._scrollSpeedY=initData.scrollSpeedY;this._smoothTime=initData.smoothTime;this._spacingTime=initData.spacingTime;this.globalKeyCode=0;this.eventDisabled="";this.focusOriginalEl=this.focusOriginalSize=this.lastOpt=this.scrollTimer=null;this.focusedAttrname="focused";this.eventdata=eventType;this.leftEvent=leftEvent;this.rightEvent=rightEvent;this.upEvent=upEvent;this.downEvent=downEvent}),FocusUtils=function(r){function g(){var a=null!==r&&r.apply(this,arguments)||this;return a.hasClass=function(b,
c){return b.classList.contains(c)},a.toggleClass=function(b,c){return b.classList.toggle(c)},a.parentfocusables=function(b,c){return b instanceof HTMLElement||b instanceof HTMLCanvasElement?(null!==b.parentElement.getAttribute("".concat(a._itemAttrname))&&(c=b.parentElement,b.removeAttribute("".concat(a._itemAttrname))),"none"===window.getComputedStyle(b.parentElement).display?null:"BODY"!==b.parentElement.nodeName?a.parentfocusables(b.parentElement,c):c):console.warn("receive only HTMLElement/HTMLCanvasElement")},
a.removeOneClassName=function(b,c){b&&a.hasClass(b,c)&&a.toggleClass(b,c)},a.getElementByPath=function(b){return document.evaluate(b,document).iterateNext()},a.getElementsByPath=function(b){b=document.evaluate(b,document,null,XPathResult.ANY_TYPE,null);var c=[],d=b.iterateNext();for(d&&c.push(d);d;)(d=b.iterateNext())&&c.push(d);return c},a.readXPath=function(b){if(""!==b.id)return'//*[@id="'+b.id+'"]';if(b==document.body)return"/html/"+b.tagName.toLowerCase();for(var c=1,d=b.parentNode.childNodes,
e=0,k=d.length;e<k;e++){var h=d[e];if(h==b){if(b.parentNode)return a.readXPath(b.parentNode)+"/"+b.tagName.toLowerCase()+"["+c+"]"}else 1==h.nodeType&&h.tagName==b.tagName&&c++}},a.addClassName=function(b,c){b&&a.toggleClass(b,c)},a.addAttrName=function(b,c){a.focusOriginalEl!==b&&(a.focusOriginalSize=b.getBoundingClientRect(),a.focusOriginalEl=b);var d=document.querySelector("[".concat(a.focusedAttrname,"]"));d&&(d.removeAttribute(c),a.changefn&&a.changefn(d,!1,a.globalKeyCode),d.dispatchEvent(new CustomEvent("onBlur",
{detail:{el:d}})),d.dispatchEvent(new CustomEvent("on-blur",{detail:{el:d}})),a.removeOneClassName(d,a._focusClassName),!a._formAutofocus||"INPUT"!==d.tagName.toLocaleUpperCase()&&"SELECT"!==d.tagName.toLocaleUpperCase()&&"TEXTAREA"!==d.tagName.toLocaleUpperCase()||d.blur());b.setAttribute(c,"");c===a.focusedAttrname&&(a.addClassName(b,a._focusClassName),a.changefn&&a.changefn(b,!0,a.globalKeyCode),b.dispatchEvent(new CustomEvent("onFocus",{detail:{el:b}})),b.dispatchEvent(new CustomEvent("on-focus",
{detail:{el:b}})))},a.inNode=function(b,c){return c!==b&&c.contains(b)},a.preventDefault=function(b){(b=b||window.event).preventDefault&&b.preventDefault();b.returnValue=!1},a.onEvent=function(b,c,d){return b.dispatchEvent(new CustomEvent(c,{detail:d}))},a.offEvent=function(b,c,d,e){return b.removeEventListener(c,d,void 0===e?!1:e)},a}return __extends(g,r),g.prototype.Scroll2=function(a){var b=this;if(!a.time)return a.setNumFn&&a.setNumFn(a.number),a.number;void 0===a.scrollTimer&&(null!=this.scrollTimer&&
(clearInterval(this.scrollTimer),this.lastOpt.setNumFn&&this.lastOpt.setNumFn(this.lastOpt.number)),this.lastOpt=a);var c=1>(c=a.time/this._spacingTime)?1:c,d=0,e=(a.getNumFn&&(d=a.getNumFn()),(a.number-d)/c),k=setInterval(function(){0<c?(c--,b.Scroll2({number:d+=e,getNumFn:a.getNumFn,setNumFn:a.setNumFn})):(clearInterval((void 0===a.scrollTimer?b:a).scrollTimer),void 0===a.scrollTimer?(b.scrollTimer=null,b.lastOpt=null):a.scrollTimer=null)},this._spacingTime);void 0===a.scrollTimer?this.scrollTimer=
k:a.scrollTimer=k},g.prototype.addFocusableListener=function(a,b,c){a.$on||(a.$on={});a.addEventListener(b,c);a.$on[b]=c},g.prototype.removeFocusableListener=function(a,b,c,d){a.removeEventListener(b,c,void 0===d?!1:d);a.$on&&a.$on[b]&&delete a.$on[b]},g}(FocusData),FocusCore=function(r){function g(){var a=null!==r&&r.apply(this,arguments)||this;return a.timedifX=0,a.timedifY=0,a.keyEvent=function(b,c){if(a.eventDisabled="event",c){if(0<a._scrollSpeedX||0<a._scrollSpeedY)if(b.event.type===eventType.LEFT||
b.event.type===eventType.RIGHT){if((d=Date.now())-a.timedifX<a._scrollSpeedX)return;a.timedifX=d}else if(b.event.type===eventType.UP||b.event.type===eventType.DOWN){var d;if((d=Date.now())-a.timedifY<a._scrollSpeedY)return;a.timedifY=d}c.$on&&c.$on[b.type]?c.dispatchEvent(new CustomEvent(b.type,{detail:{}})):a.setFocus(b.type)}else a.setFocus(b.type)},a.setFocus=function(b){var c=a.getNextFocusElement(b);if(null!==c&&null!==(c=a.parentfocusables(c,c))){for(var d=c.querySelectorAll("[".concat(a._itemAttrname,
"]")),e=0;e<d.length;e++)d[e].removeAttribute("".concat(a._itemAttrname));c&&(a.addAttrName(c,a.focusedAttrname),a._formAutofocus&&"SELECT"===c.tagName.toLocaleUpperCase()&&c.focus());a.doScroll(a._scrollEl,c,a._distanceToCenter,a._offsetDistance,a._smoothTime,!0,void 0,b)}},a.scrollFn=function(b,c,d,e,k,h){a.Scroll2({number:c,time:(k=void 0===k?!0:k)?e:0,scrollTimer:h=void 0===h?void 0:h,getNumFn:function(){return"scrollTop"===d?b?b.scrollTop:document.body.scrollTop||document.documentElement.scrollTop||
window.pageYOffset:"scrollLeft"===d?b?b.scrollLeft:document.body.scrollLeft||document.documentElement.scrollLeft||window.pageXOffset:void 0},setNumFn:function(l){"scrollTop"===d&&(b?b.scrollTop=l:document.body.scrollTop=document.documentElement.scrollTop=l);"scrollLeft"===d&&(b?b.scrollLeft=l:document.body.scrollLeft=document.documentElement.scrollLeft=l)}})},a.doScroll=function(b,c,d,e,k,h,l,v){var p,m,y,u,w,x,q,f,n,t;void 0===d&&(d=!1);void 0===e&&(e=50);void 0===k&&(k=a._smoothTime);void 0===h&&
(h=!0);void 0===l&&(l=void 0);c=c&&c.length&&c[0]||c;b&&!a.inNode(c,b)||c&&(v=c.getBoundingClientRect(),q=b?(f=b.getBoundingClientRect(),p=b.scrollTop,c=b.scrollLeft,m=b.scrollWidth,y=b.scrollHeight,u=f.height,w=f.width,x=v.left-f.left,v.top-f.top):(p=document.body.scrollTop||document.documentElement.scrollTop||window.pageYOffset,c=document.body.scrollLeft||document.documentElement.scrollLeft||window.pageXOffset,m=document.documentElement.scrollWidth,y=document.documentElement.scrollHeight,w=document.documentElement.clientWidth||
document.body.clientWidth,u=document.documentElement.clientHeight||document.body.clientHeight,x=v.left,v.top),f=x+v.width/2,n=q+v.height/2,d?(t=f+c-w/2,a.scrollFn(b,n+p-u/2,"scrollTop",k,h,w<m?null:l),a.scrollFn(b,t,"scrollLeft",k,h,u<y?null:l)):(u<(d=q+v.height)&&a.scrollFn(b,d-u+p+e,"scrollTop",k,h,l),0>q&&a.scrollFn(b,q+p-e,"scrollTop",k,h,l),w<(d=x+v.width)&&a.scrollFn(b,d-w+c+e,"scrollLeft",k,h,l),0>x&&a.scrollFn(b,x+c-e,"scrollLeft",k,h,l)))},a.scrollTo=function(b){var c=null!=b.scrollEl?b.scrollEl:
null,d=null!=b.isCenter&&b.isCenter,e=null!=b.offset?b.offset:50,k=null==b.smooth||b.smooth,h=null!=b.direction?b.direction:"",l=null!=b.duration?b.duration:a._smoothTime;b&&b.targetEl?a.doScroll(c,b.targetEl,d,e,l,k,null,h):console.warn("\u8bf7\u4f20\u5165\u9700\u8981\u6eda\u52a8\u7684targetEl")},a.calLineEl=function(b,c,d,e,k,h,l){if(1===h)return!1;h=0;return b===a.eventdata.UP||b===a.eventdata.DOWN?h=c:b!==a.eventdata.RIGHT&&b!==a.eventdata.LEFT||(h=d),h<=l&&(b=Math.min(c+d,e.dis))!=e.dis&&(e.dis=
b,e.el=k),e},a.getNextFocusElement=function(b){var c=document.querySelectorAll("[".concat(a._itemAttrname,"]:not([").concat(focusdisableAttrname,"]):not([").concat(a.focusedAttrname,"])")),d=document.querySelectorAll("[".concat(a.focusedAttrname,"]:not([").concat(focusdisableAttrname,"]):not(svg)")),e;if(!c||!c.length)return null;var k=null,h=Number.MAX_VALUE,l=Number.MAX_VALUE,v={el:null,dis:Number.MAX_VALUE,absDis:Number.MAX_VALUE};if(!d.length)return c[0];d=(e=d[d.length-1]).getBoundingClientRect();
var p=(d.width-e.offsetWidth||0)/2,m=(d.height-e.offsetHeight||0)/2,y=0,u=0,w=0,x=0,q=[d.top+m,d.right-p,d.bottom-m,d.left+p];d=(b===a.eventdata.UP&&(y=d.left+d.width/2,u=Math.round(d.bottom-m),w=d.left+p,x=d.left+d.width-p),b===a.eventdata.RIGHT&&(u=d.top+d.height/2,y=Math.round(d.left+p),w=d.top+m,x=d.top+d.height-m),b===a.eventdata.DOWN&&(y=d.left+d.width/2,u=Math.round(d.top+m),w=d.left+p,x=d.left+d.width-p),b===a.eventdata.LEFT&&(u=d.top+d.height/2,y=Math.round(d.right-p),w=d.top+m,x=d.top+d.height-
m),!1);for(p=0;p<c.length;p++){m=c[p];var f=m.getBoundingClientRect(),n=0,t=0,A=0,z=0;if(e!==m)if(m instanceof SVGElement)console.warn("Setting focusable on SVG is not supported. You can place the SVG tag in a HTML element and set the focusable attribute to that!");else{if(b===a.eventdata.UP){if(t=f.top+f.height,(f.right<q[3]||f.left>q[1])&&f.bottom>q[0])continue;if(Math.round(t)>=u)continue;n=f.left+f.width/2;A=f.left;z=f.left+f.width}else if(b===a.eventdata.RIGHT){if(n=f.left,(f.bottom<q[0]||f.top>
q[2])&&f.left<q[1])continue;if(Math.round(n)<=y)continue;t=f.top+f.height/2;A=f.top;z=f.top+f.height}else if(b===a.eventdata.DOWN){if(t=f.top,(f.right<q[3]||f.left>q[1])&&f.top<q[2])continue;if(Math.round(t)<=u)continue;n=f.left+f.width/2;A=f.left;z=f.left+f.width}else if(b===a.eventdata.LEFT){if(n=f.left+f.width,(f.bottom<q[0]||f.top>q[2])&&f.right>q[3])continue;if(Math.round(n)>=y)continue;t=f.top+f.height/2;A=f.top;z=f.top+f.height}var B;f=Math.abs(y-n);n=Math.abs(u-t);a.calLineEl(b,f,n,v,m,a._findFocusType,
a._initDis);w<=z&&A<=x?(d=!0,t=0,b===a.eventdata.UP||b===a.eventdata.DOWN?t=n:b!==a.eventdata.RIGHT&&b!==a.eventdata.LEFT||(t=f),l===t?(B=Math.min(Math.sqrt(f*f+n*n),h))!=h&&(h=B,k=m):(z=Math.min(l,t))!=l&&(l=z,h=Math.min(Math.sqrt(f*f+n*n),h),k=m)):d||(B=Math.min(Math.sqrt(f*f+n*n),h))!=h&&(h=B,k=m)}}return 1!==a._findFocusType&&v.el||k},a}return __extends(g,r),g}(FocusUtils),timerNum=0,timer=null,timerFirst=0,FocusAble=function(r){function g(){var a=null!==r&&r.apply(this,arguments)||this;return a.changefn=
null,a.setOnFocusChangeListener=function(b){a.changefn=b},a.focusKeyUpEvent=function(b){var c,d=window.event&&window.event.keyCode?window.event.keyCode:b.which,e=document.querySelectorAll("[".concat(a._itemAttrname,"]"));a._scrollSpeedX;a._scrollSpeedY;e.length&&(c=(c=document.querySelectorAll("[".concat(a.focusedAttrname,"]"))).length?c[c.length-1]:e[0],-1!==a._KEYS.KEY_ENTER.indexOf(d)&&(clearTimeout(timer),0===timerNum&&(a.preventDefault(b),c.click(),!a._formAutofocus||"INPUT"!==c.tagName.toLocaleUpperCase()&&
"TEXTAREA"!==c.tagName.toLocaleUpperCase()||c.focus(),timerNum=0)));timerNum=timerFirst=0},a.focusKeyDownEvent=function(b){var c=window.event&&window.event.keyCode?window.event.keyCode:b.which;if(a.globalKeyCode=c,document.querySelectorAll("[".concat(a._itemAttrname,"]")).length){var d=document.querySelectorAll("[".concat(a.focusedAttrname,"]")),e=d.length?d[d.length-1]:null;if(-1===a._KEYS.KEY_ENTER.indexOf(c))return-1!==a._KEYS.KEY_LEFT.indexOf(c)?(a.preventDefault(b),void a.keyEvent(a.leftEvent,
e)):-1!==a._KEYS.KEY_UP.indexOf(c)?(a.preventDefault(b),void a.keyEvent(a.upEvent,e)):-1!==a._KEYS.KEY_DOWN.indexOf(c)?(a.preventDefault(b),void a.keyEvent(a.downEvent,e)):void(-1!==a._KEYS.KEY_RIGHT.indexOf(c)&&(a.preventDefault(b),a.keyEvent(a.rightEvent,e)));0===timerFirst&&(timerFirst=1,timer=setTimeout(function(){timerNum++;e.dispatchEvent(new CustomEvent("longPress",{detail:{el:e}}));e.dispatchEvent(new CustomEvent("long-press",{detail:{el:e}}));clearTimeout(timer)},a._longPressTime))}},a.init=
function(b){a._focusClassName=b.focusClassName||a._focusClassName;a._initDis=b.initDis||a._initDis;a._findFocusType=void 0===b.findFocusType?a._findFocusType:b.findFocusType;a._scrollEl=void 0===b.scrollEl?a._scrollEl:b.scrollEl;a._KEYS.KEY_UP=b.KEYS&&b.KEYS.KEY_UP||a._KEYS.KEY_UP;a._KEYS.KEY_RIGHT=b.KEYS&&b.KEYS.KEY_RIGHT||a._KEYS.KEY_RIGHT;a._KEYS.KEY_DOWN=b.KEYS&&b.KEYS.KEY_DOWN||a._KEYS.KEY_DOWN;a._KEYS.KEY_LEFT=b.KEYS&&b.KEYS.KEY_LEFT||a._KEYS.KEY_LEFT;a._KEYS.KEY_ENTER=b.KEYS&&b.KEYS.KEY_ENTER||
a._KEYS.KEY_ENTER;a._offsetDistance=void 0===b.offsetDistance?a._offsetDistance:b.offsetDistance;a._longPressTime=void 0===b.longPressTime?a._longPressTime:b.longPressTime;a._distanceToCenter=void 0===b.distanceToCenter?a._distanceToCenter:b.distanceToCenter;a._limitingEl=void 0===b.limitingEl?a._limitingEl:b.limitingEl;a._formAutofocus=void 0===b.formAutofocus?a._formAutofocus:b.formAutofocus;a._focusableClassName=void 0===b.focusableClassName?a._focusableClassName:b.focusableClassName;void 0!==
b.scrollSpeed&&0<b.scrollSpeed&&(a._scrollSpeedX=b.scrollSpeed,a._scrollSpeedY=b.scrollSpeed);a._scrollSpeedX=void 0===b.scrollSpeedX?a._scrollSpeedX:b.scrollSpeedX;a._scrollSpeedY=void 0===b.scrollSpeedY?a._scrollSpeedY:b.scrollSpeedY;a._smoothTime=void 0===b.smoothTime?a._smoothTime:b.smoothTime;a._spacingTime=void 0===b.spacingTime?a._spacingTime:b.spacingTime;a.setFocusableAttr()},a.setFocusableAttr=function(){if(a._focusableClassName)for(var b=document.getElementsByClassName(a._focusableClassName)||
[],c=0;c<b.length;c++){var d=b[c];d.setAttribute("".concat(a._itemAttrname),"");-1!==(d.getAttribute("class")||"").split(" ").indexOf(a.focusClassName)&&d.setAttribute("".concat(a.focusedAttrname),"")}},a.removeFocusableAttr=function(b){if(a._focusableClassName){b=document.getElementsByClassName(b||"")||[];for(var c=0;c<b.length;c++)b[c].removeAttribute("".concat(a._itemAttrname))}},a.next=function(b,c){void 0===c&&(c=!0);a.setFocus?"left"===b||"right"===b||"up"===b||"down"===b?a.setFocus(b):"string"!=
typeof b&&a.requestFocus(b,c):console.warn("next\u51fd\u6570\u53c2\u6570\u4e0d\u53ef\u4ee5\u4e3a\u7a7a\uff01")},a.requestFocus=function(b,c){if(void 0===c&&(c=!0),a.eventDisabled=a.eventDisabled?"eventSkip":"initSkip",!(b=b&&b.length&&b[0]||b))throw Error("Element not found!");if((b=b.$el||b).hasAttribute("".concat(a._itemAttrname))){if(null!==b.getAttribute(a.focusedAttrname))return!1;for(var d=document.getElementsByClassName(a._focusClassName),e=0;e<d.length;e++)a.removeOneClassName(d[e],a._focusClassName);
a.addAttrName(b,a.focusedAttrname);"initSkip"!==a.eventDisabled||c?a.doScroll(a._scrollEl,b,a._distanceToCenter,a._offsetDistance,a._smoothTime,c,void 0):setTimeout(function(){a.doScroll(a._scrollEl,b,a._distanceToCenter,a._offsetDistance,a._smoothTime,c,void 0)},100)}},a.getElementByPath=a.getElementByPath,a.setfocusdisableAttrname=function(b){if(null!==b){for(var c=document.querySelectorAll("[".concat(a._itemAttrname,"]")),d=0;d<c.length;d++)(e=c[d]).setAttribute("".concat(focusdisableAttrname),
""),e.removeAttribute("".concat(a._itemAttrname));b=b.querySelectorAll("[".concat(focusdisableAttrname,"]"))}else{c=document.querySelectorAll("[".concat(a._itemAttrname,"]"));for(d=0;d<c.length;d++)c[d].removeAttribute("".concat(focusdisableAttrname));var e;b=document.querySelectorAll("[".concat(focusdisableAttrname,"]"))}for(d=0;d<b.length;d++)(e=b[d]).setAttribute("".concat(a._itemAttrname),""),e.removeAttribute("".concat(focusdisableAttrname))},a.reset=function(){a._KEYS=initData.KEYS;a._scrollEl=
initData.scrollEl;a._focusClassName=initData.focusClassName;a._initDis=initData.initDis;a._findFocusType=initData.findFocusType;a._offsetDistance=initData.offsetDistance;a._longPressTime=initData.longPressTime;a._distanceToCenter=initData.distanceToCenter;a._limitingEl=initData.limitingEl;a._formAutofocus=initData.formAutofocus;a._focusableClassName=initData.focusableClassName;a._scrollSpeedX=initData.scrollSpeedX;a._scrollSpeedY=initData.scrollSpeedY;a._smoothTime=initData.smoothTime;a._spacingTime=
initData.spacingTime},a.resetFocusClassName=function(){a._focusClassName=initData.focusClassName},a.resetInitDis=function(){a._initDis=initData.initDis},a.resetFindFocusType=function(){a._findFocusType=initData.findFocusType},a.resetKEYS=function(){a._KEYS=initData.KEYS},a.resetTheDis=function(){a._offsetDistance=initData.offsetDistance},a.resetOffsetDistance=function(){a._offsetDistance=initData.offsetDistance},a.resetLongPressTime=function(){a._longPressTime=initData.longPressTime},a.resetDistanceToCenter=
function(){a._distanceToCenter=initData.distanceToCenter},a.resetFormAutofocus=function(){a._formAutofocus=initData.formAutofocus},a.resetFocusableClassName=function(){a.removeFocusableAttr(a._focusableClassName);a._focusableClassName=initData.focusableClassName},a.setItemAttrname=function(b,c){for(var d=document.querySelectorAll("[".concat(c,"]"))||[],e=0;e<d.length;e++){var k=d[e];k.removeAttribute("".concat(c));k.setAttribute("".concat(b),"")}},a.resetScrollSpeed=function(){a._scrollSpeedX=initData.scrollSpeedX;
a._scrollSpeedY=initData.scrollSpeedY},a.resetScrollSpeedX=function(){a._scrollSpeedX=initData.scrollSpeedX},a.resetScrollSpeedY=function(){a._scrollSpeedY=initData.scrollSpeedY},a.resetLimitingEl=function(){a.setfocusdisableAttrname(initData.limitingEl);a._limitingEl=initData.limitingEl},a.resetScrollEl=function(){a._scrollEl=initData.scrollEl},a.setScrollEl=function(b){a._scrollEl=b||a._scrollEl},a}return __extends(g,r),Object.defineProperty(g.prototype,"focusClassName",{get:function(){return this._focusClassName},
set:function(a){this._focusClassName=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"initDis",{get:function(){return this._initDis},set:function(a){this._initDis=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"findFocusType",{get:function(){return this._findFocusType},set:function(a){this._findFocusType=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"KEYS",{get:function(){return this._KEYS},set:function(a){this._KEYS=a},enumerable:!1,
configurable:!0}),Object.defineProperty(g.prototype,"offsetDistance",{get:function(){return this._offsetDistance},set:function(a){this._offsetDistance=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"longPressTime",{get:function(){return this._longPressTime},set:function(a){this._longPressTime=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"distanceToCenter",{get:function(){return this._distanceToCenter},set:function(a){this._distanceToCenter=a},enumerable:!1,
configurable:!0}),Object.defineProperty(g.prototype,"formAutofocus",{get:function(){return this._formAutofocus},set:function(a){this._formAutofocus=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"focusableClassName",{get:function(){return this._focusableClassName},set:function(a){this.removeFocusableAttr(this._focusableClassName);this._focusableClassName=a;this.setFocusableAttr()},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"itemAttrname",{get:function(){return this._itemAttrname},
set:function(a){this.setItemAttrname(a,this._itemAttrname);this._itemAttrname=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"scrollSpeed",{set:function(a){0<a&&(this._scrollSpeedX=a,this._scrollSpeedY=a)},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"scrollSpeedX",{get:function(){return this._scrollSpeedX},set:function(a){this._scrollSpeedX=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"scrollSpeedY",{get:function(){return this._scrollSpeedY},
set:function(a){this._scrollSpeedY=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"limitingEl",{get:function(){return this.setfocusdisableAttrname(this._limitingEl),this._limitingEl},set:function(a){this.setfocusdisableAttrname(a);this._limitingEl=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"scrollEl",{get:function(){return this._scrollEl},set:function(a){this._scrollEl=a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"smoothTime",
{get:function(){return this._smoothTime&&10>this._smoothTime?0:this._smoothTime},set:function(a){this._smoothTime=a&&10>a?0:a},enumerable:!1,configurable:!0}),Object.defineProperty(g.prototype,"spacingTime",{get:function(){return this._spacingTime},set:function(a){this._spacingTime=a},enumerable:!1,configurable:!0}),g}(FocusCore),focusable=new FocusAble,$tv=focusable,tvCore=focusable;document.removeEventListener("keydown",focusable.focusKeyDownEvent,!1);document.addEventListener("keydown",focusable.focusKeyDownEvent);
document.removeEventListener("keyup",focusable.focusKeyUpEvent,!1);document.addEventListener("keyup",focusable.focusKeyUpEvent);