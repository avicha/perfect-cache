(function(h,f){typeof exports=="object"&&typeof module!="undefined"?f(exports):typeof define=="function"&&define.amd?define(["exports"],f):(h=typeof globalThis!="undefined"?globalThis:h||self,f(h.PerfectCache={}))})(this,function(h){"use strict";var pe=Object.defineProperty,ge=Object.defineProperties;var ye=Object.getOwnPropertyDescriptors;var H=Object.getOwnPropertySymbols;var Ce=Object.prototype.hasOwnProperty,be=Object.prototype.propertyIsEnumerable;var J=(h,f,g)=>f in h?pe(h,f,{enumerable:!0,configurable:!0,writable:!0,value:g}):h[f]=g,_=(h,f)=>{for(var g in f||(f={}))Ce.call(f,g)&&J(h,g,f[g]);if(H)for(var g of H(f))be.call(f,g)&&J(h,g,f[g]);return h},X=(h,f)=>ge(h,ye(f));var m=(h,f,g)=>(J(h,typeof f!="symbol"?f+"":f,g),g);var f={driver:"memory",prefix:"cache:"};function g(n){return{all:n=n||new Map,on:function(s,e){var t=n.get(s);t?t.push(e):n.set(s,[e])},off:function(s,e){var t=n.get(s);t&&(e?t.splice(t.indexOf(e)>>>0,1):n.set(s,[]))},emit:function(s,e){var t=n.get(s);t&&t.slice().map(function(r){r(e)}),(t=n.get("*"))&&t.slice().map(function(r){r(s,e)})}}}class K{constructor(){m(this,"mitt",new g)}$on(){return this.mitt.on.apply(this,arguments)}$off(){return this.mitt.off.apply(this,arguments)}$emit(){return this.mitt.emit.apply(this,arguments)}}const P={OK:Symbol("OK"),KEY_NOT_EXISTS:Symbol("KEY_NOT_EXISTS"),KEY_EXPIRED:Symbol("KEY_EXPIRED"),JSON_PARSE_ERROR:Symbol("JSON_PARSE_ERROR"),NX_SET_NOT_PERFORMED:Symbol("NX_SET_NOT_PERFORMED"),XX_SET_NOT_PERFORMED:Symbol("XX_SET_NOT_PERFORMED")};class v extends K{constructor(e={}){super();m(this,"opts");m(this,"isReady",!1);m(this,"prefix","cache:");this.opts=e,this.opts.prefix&&(this.prefix=this.opts.prefix),this.isReady=!1}__getRealKey(e){return`${this.prefix}${e}`}ready(e){setTimeout(()=>{this.isReady=!0,this.$emit("ready"),e&&typeof e=="function"&&e()},0)}keyValueGet(){throw new Error("please implement the keyValueGet method for this driver.")}keyValueSet(){throw new Error("please implement the keyValueSet method for this driver.")}existsKey(){throw new Error("please implement the existsKey method for this driver.")}removeItem(){throw new Error("please implement the removeItem method for this driver.")}async clear(){const e=await this.keys();for(const t of e)await this.removeItem(t);return Promise.resolve()}keys(){throw new Error("please implement the keys method for this driver.")}length(){return new Promise((e,t)=>{this.keys().then(r=>{e(r.length)}).catch(r=>{t(r)})})}getItem(e){return new Promise((t,r)=>{this.keyValueGet(e).then(o=>{o?o.expiredTimeAt?o.expiredTimeAt>Date.now()?o.maxAge?(o.expiredTimeAt=Date.now()+o.maxAge,this.keyValueSet(e,o).then(()=>t(o.value)).catch(i=>{r(i)})):t(o.value):(this.$emit("cacheExpired",e),t()):t(o.value):t()}).catch(o=>{r(o)})})}setItem(e,t,r={}){const{expiredTime:o,expiredTimeAt:i,maxAge:l,setOnlyNotExist:u=!1,setOnlyExist:p=!1}=r;let a,c;return o&&typeof o=="number"&&o>0&&(a=Date.now()+o),i&&typeof i=="number"&&i>0&&(a=i),a?a=Math.max(a,Date.now()):l&&typeof l=="number"&&l>0&&(a=Date.now()+l,c=l),new Promise((d,b)=>{u||p?this.existsKey(e).then(S=>{if(u&&S)return d(P.NX_SET_NOT_PERFORMED);if(p&&!S)return d(P.XX_SET_NOT_PERFORMED);this.keyValueSet(e,{value:t,expiredTimeAt:a,maxAge:c}).then(()=>d(P.OK)).catch(y=>{b(y)})}).catch(S=>{b(S)}):this.keyValueSet(e,{value:t,expiredTimeAt:a,maxAge:c}).then(()=>d(P.OK)).catch(S=>{b(S)})})}}class G extends v{constructor(s){super(s),this.ready()}keyValueGet(s){const e=localStorage.getItem(this.__getRealKey(s));return new Promise(t=>{if(e)try{const r=JSON.parse(e);t(r)}catch{D(`get key ${s} json parse error`,e),t()}else t()})}keyValueSet(s,e){return new Promise((t,r)=>{try{localStorage.setItem(this.__getRealKey(s),JSON.stringify(e)),t()}catch(o){r(o)}})}existsKey(s){return localStorage.getItem(this.__getRealKey(s))?Promise.resolve(!0):Promise.resolve(!1)}removeItem(s){return new Promise((e,t)=>{try{localStorage.removeItem(this.__getRealKey(s)),e()}catch(r){t(r)}})}keys(){const s=[];for(const e of Object.keys(localStorage))e.startsWith(this.prefix)&&s.push(e.replace(this.prefix,""));return Promise.resolve(s)}}m(G,"driver","localStorage");class U extends v{constructor(e){super(e);m(this,"data",new Map);this.ready()}keyValueGet(e){const t=this.data.get(this.__getRealKey(e));return new Promise(r=>{if(t)try{const o=JSON.parse(t);r(o)}catch{D(`get key ${e} json parse error`,t),r()}else r()})}keyValueSet(e,t){return this.data.set(this.__getRealKey(e),JSON.stringify(t)),Promise.resolve()}existsKey(e){return this.data.has(this.__getRealKey(e))?Promise.resolve(!0):Promise.resolve(!1)}removeItem(e){return new Promise((t,r)=>{try{this.data.delete(this.__getRealKey(e)),t()}catch(o){r(o)}})}keys(){const e=Array.from(this.data.keys()).map(t=>t.replace(this.prefix,""));return Promise.resolve(e)}clear(){return this.data.clear(),Promise.resolve()}length(){return Promise.resolve(this.data.size)}}m(U,"driver","memory");class z extends v{constructor(s){super(s),this.ready()}keyValueGet(s){const e=sessionStorage.getItem(this.__getRealKey(s));return new Promise(t=>{if(e)try{const r=JSON.parse(e);t(r)}catch{D(`get key ${s} json parse error`,e),t()}else t()})}keyValueSet(s,e){return new Promise((t,r)=>{try{sessionStorage.setItem(this.__getRealKey(s),JSON.stringify(e)),t()}catch(o){r(o)}})}existsKey(s){return sessionStorage.getItem(this.__getRealKey(s))?Promise.resolve(!0):Promise.resolve(!1)}removeItem(s){return new Promise((e,t)=>{try{sessionStorage.removeItem(this.__getRealKey(s)),e()}catch(r){t(r)}})}keys(){const s=[];for(const e of Object.keys(sessionStorage))e.startsWith(this.prefix)&&s.push(e.replace(this.prefix,""));return Promise.resolve(s)}}m(z,"driver","sessionStorage");/*! js-cookie v3.0.1 | MIT */function O(n){for(var s=1;s<arguments.length;s++){var e=arguments[s];for(var t in e)n[t]=e[t]}return n}var Q={read:function(n){return n[0]==='"'&&(n=n.slice(1,-1)),n.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(n){return encodeURIComponent(n).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};function T(n,s){function e(r,o,i){if(typeof document!="undefined"){i=O({},s,i),typeof i.expires=="number"&&(i.expires=new Date(Date.now()+i.expires*864e5)),i.expires&&(i.expires=i.expires.toUTCString()),r=encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var l="";for(var u in i)!i[u]||(l+="; "+u,i[u]!==!0&&(l+="="+i[u].split(";")[0]));return document.cookie=r+"="+n.write(o,r)+l}}function t(r){if(!(typeof document=="undefined"||arguments.length&&!r)){for(var o=document.cookie?document.cookie.split("; "):[],i={},l=0;l<o.length;l++){var u=o[l].split("="),p=u.slice(1).join("=");try{var a=decodeURIComponent(u[0]);if(i[a]=n.read(p,a),r===a)break}catch{}}return r?i[r]:i}}return Object.create({set:e,get:t,remove:function(r,o){e(r,"",O({},o,{expires:-1}))},withAttributes:function(r){return T(this.converter,O({},this.attributes,r))},withConverter:function(r){return T(O({},this.converter,r),this.attributes)}},{attributes:{value:Object.freeze(s)},converter:{value:Object.freeze(n)}})}var j=T(Q,{path:"/"});class W extends v{constructor(s){super(s),this.ready()}keyValueGet(s){const e=j.get(this.__getRealKey(s));return new Promise(t=>{if(e)try{const r=JSON.parse(e);t(r)}catch{D(`get key ${s} json parse error`,e),t()}else t()})}keyValueSet(s,e){return new Promise((t,r)=>{try{j.set(this.__getRealKey(s),JSON.stringify(e)),t()}catch(o){r(o)}})}existsKey(s){return j.get(this.__getRealKey(s))?Promise.resolve(!0):Promise.resolve(!1)}removeItem(s){return new Promise((e,t)=>{try{j.remove(this.__getRealKey(s)),e()}catch(r){t(r)}})}keys(){const s=j.get(),e=[];for(const t of Object.keys(s))t.startsWith(this.prefix)&&e.push(t.replace(this.prefix,""));return Promise.resolve(e)}}m(W,"driver","cookie");class q extends v{constructor(e){var t,r,o,i;super(e);m(this,"dbName","perfect-cache");m(this,"objectStoreName","perfect-cache");m(this,"dbVersion");m(this,"dbConnection");(t=this.opts)!=null&&t.dbName&&(this.dbName=this.opts.dbName),(r=this.opts)!=null&&r.objectStoreName&&(this.objectStoreName=this.opts.objectStoreName),(o=this.opts)!=null&&o.dbVersion&&(this.dbVersion=this.opts.dbVersion),(i=this.opts)!=null&&i.dbConnection&&(this.dbConnection=this.opts.dbConnection),this.dbConnection?(this.dbVersion=this.dbConnection.version,this.ready()):this.init().then(()=>{this.ready()}).catch(()=>{this.dbConnection?this.upgradeToVersion(this.dbConnection.version+1):this.upgradeToVersion()})}init(){return this.connectDB().then(()=>this.initObjectStore())}upgradeToVersion(e){this.dbVersion=e,w(`Database ${this.dbName} store ${this.objectStoreName} is upgrading to version ${this.dbVersion}...`),this.init().then(()=>{w(`Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} success.`),this.ready()}).catch(t=>{window.console.error(`Database ${this.dbName} store ${this.objectStoreName} version upgraded to ${this.dbVersion} failed.`,t)})}waitForConnectionReady(e,{timeout:t=void 0,interval:r=100,readyLog:o=!1}={}){this.isReady&&this.dbConnection?(o&&w(`Database connection ${this.dbName} store ${this.objectStoreName} is ready.(^v^)`),e&&typeof e=="function"&&e()):(w(`Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready...`),t>0||t===void 0?setTimeout(()=>{this.waitForConnectionReady(e,{timeout:t?t-r:void 0,interval:r,readyLog:!0})},r):e&&typeof e=="function"&&e(new Error(`Waiting for the database connection ${this.dbName} store ${this.objectStoreName} ready timeout.`)))}connectDB(){return this.dbConnection&&(this.dbConnection.close(),this.dbConnection.onversionchange=null,this.dbConnection=null,this.isReady=!1),Y(this.dbName,this.dbVersion).then(e=>{this.dbConnection=e,this.dbVersion=e.version,e.onversionchange=t=>{w(`The version of this database ${this.dbName} store ${this.objectStoreName} has changed from ${t.oldVersion} to ${t.newVersion}`),this.upgradeToVersion(t.newVersion)}})}initObjectStore(){return new Promise((e,t)=>{if(this.dbConnection)if(this.dbConnection.objectStoreNames.contains(this.objectStoreName))e();else{w(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);const r=this.dbConnection.createObjectStore(this.objectStoreName,{keyPath:"key"});r.transaction.oncomplete=o=>{w(`ObjectStore ${this.objectStoreName} is created now.`),e()}}else{const r=new Error(`Database ${this.dbName} connection is not initialised.`);t(r)}})}keyValueGet(e){return new Promise((t,r)=>{this.waitForConnectionReady(o=>{if(o)r(o);else{const i=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).get(this.__getRealKey(e));i.onerror=()=>{window.console.error("Database get occurs error",i.result),r(i.result)},i.onsuccess=()=>{var l;t((l=i.result)==null?void 0:l.value)}}})})}keyValueSet(e,t){return new Promise((r,o)=>{this.waitForConnectionReady(i=>{if(i)o(i);else{const l=this.dbConnection.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).put({key:this.__getRealKey(e),value:t});l.onerror=()=>{window.console.error("Database put occurs error",l.result),o(l.result)},l.onsuccess=()=>{var u;r((u=l.result)==null?void 0:u.value)}}})})}existsKey(e){return new Promise((t,r)=>{this.waitForConnectionReady(o=>{if(o)r(o);else{const i=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).count(this.__getRealKey(e));i.onerror=()=>{window.console.error("Database count occurs error",i.result),r(i.result)},i.onsuccess=()=>{t(!!i.result)}}})})}removeItem(e){return new Promise((t,r)=>{this.waitForConnectionReady(o=>{if(o)r(o);else{const i=this.dbConnection.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).delete(this.__getRealKey(e));i.onerror=()=>{window.console.error("Database delete occurs error",i.result),r(i.result)},i.onsuccess=()=>{t()}}})})}keys(){const e=[];return new Promise((t,r)=>{this.waitForConnectionReady(o=>{if(o)r(o);else{const i=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).openCursor();i.onerror=()=>{window.console.error("Database openCursor occurs error",i.result),r(i.result)},i.onsuccess=l=>{var u=l.target.result;u?(u.key.startsWith(this.prefix)&&e.push(u.key.replace(this.prefix,"")),u.continue()):t(e)}}})})}}m(q,"driver","indexedDB");const R={};for(const n of[U,G,z,W,q])R[n.driver]=n;const V={},ee=n=>{if(n instanceof v.constructor)if(n.driver&&typeof n.driver=="string")V[n.driver]=n;else throw new Error("please input the driver name.");else throw new Error("the store driver class must be subclass of BaseStore.")};var B={exports:{}},E=1e3,k=E*60,N=k*60,F=N*24,te=F*7,re=F*365.25,se=function(n,s){s=s||{};var e=typeof n;if(e==="string"&&n.length>0)return ne(n);if(e==="number"&&isFinite(n))return s.long?ie(n):oe(n);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(n))};function ne(n){if(n=String(n),!(n.length>100)){var s=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(n);if(!!s){var e=parseFloat(s[1]),t=(s[2]||"ms").toLowerCase();switch(t){case"years":case"year":case"yrs":case"yr":case"y":return e*re;case"weeks":case"week":case"w":return e*te;case"days":case"day":case"d":return e*F;case"hours":case"hour":case"hrs":case"hr":case"h":return e*N;case"minutes":case"minute":case"mins":case"min":case"m":return e*k;case"seconds":case"second":case"secs":case"sec":case"s":return e*E;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return e;default:return}}}}function oe(n){var s=Math.abs(n);return s>=F?Math.round(n/F)+"d":s>=N?Math.round(n/N)+"h":s>=k?Math.round(n/k)+"m":s>=E?Math.round(n/E)+"s":n+"ms"}function ie(n){var s=Math.abs(n);return s>=F?I(n,s,F,"day"):s>=N?I(n,s,N,"hour"):s>=k?I(n,s,k,"minute"):s>=E?I(n,s,E,"second"):n+" ms"}function I(n,s,e,t){var r=s>=e*1.5;return Math.round(n/e)+" "+t+(r?"s":"")}function ae(n){e.debug=e,e.default=e,e.coerce=u,e.disable=o,e.enable=r,e.enabled=i,e.humanize=se,e.destroy=p,Object.keys(n).forEach(a=>{e[a]=n[a]}),e.names=[],e.skips=[],e.formatters={};function s(a){let c=0;for(let d=0;d<a.length;d++)c=(c<<5)-c+a.charCodeAt(d),c|=0;return e.colors[Math.abs(c)%e.colors.length]}e.selectColor=s;function e(a){let c,d=null,b,S;function y(...C){if(!y.enabled)return;const x=y,$=Number(new Date),he=$-(c||$);x.diff=he,x.prev=c,x.curr=$,c=$,C[0]=e.coerce(C[0]),typeof C[0]!="string"&&C.unshift("%O");let A=0;C[0]=C[0].replace(/%([a-zA-Z%])/g,(L,fe)=>{if(L==="%%")return"%";A++;const Z=e.formatters[fe];if(typeof Z=="function"){const me=C[A];L=Z.call(x,me),C.splice(A,1),A--}return L}),e.formatArgs.call(x,C),(x.log||e.log).apply(x,C)}return y.namespace=a,y.useColors=e.useColors(),y.color=e.selectColor(a),y.extend=t,y.destroy=e.destroy,Object.defineProperty(y,"enabled",{enumerable:!0,configurable:!1,get:()=>d!==null?d:(b!==e.namespaces&&(b=e.namespaces,S=e.enabled(a)),S),set:C=>{d=C}}),typeof e.init=="function"&&e.init(y),y}function t(a,c){const d=e(this.namespace+(typeof c=="undefined"?":":c)+a);return d.log=this.log,d}function r(a){e.save(a),e.namespaces=a,e.names=[],e.skips=[];let c;const d=(typeof a=="string"?a:"").split(/[\s,]+/),b=d.length;for(c=0;c<b;c++)!d[c]||(a=d[c].replace(/\*/g,".*?"),a[0]==="-"?e.skips.push(new RegExp("^"+a.slice(1)+"$")):e.names.push(new RegExp("^"+a+"$")))}function o(){const a=[...e.names.map(l),...e.skips.map(l).map(c=>"-"+c)].join(",");return e.enable(""),a}function i(a){if(a[a.length-1]==="*")return!0;let c,d;for(c=0,d=e.skips.length;c<d;c++)if(e.skips[c].test(a))return!1;for(c=0,d=e.names.length;c<d;c++)if(e.names[c].test(a))return!0;return!1}function l(a){return a.toString().substring(2,a.toString().length-2).replace(/\.\*\?$/,"*")}function u(a){return a instanceof Error?a.stack||a.message:a}function p(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")}return e.enable(e.load()),e}var ce=ae;(function(n,s){s.formatArgs=t,s.save=r,s.load=o,s.useColors=e,s.storage=i(),s.destroy=(()=>{let u=!1;return()=>{u||(u=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),s.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"];function e(){return typeof window!="undefined"&&window.process&&(window.process.type==="renderer"||window.process.__nwjs)?!0:typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)?!1:typeof document!="undefined"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window!="undefined"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}function t(u){if(u[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+u[0]+(this.useColors?"%c ":" ")+"+"+n.exports.humanize(this.diff),!this.useColors)return;const p="color: "+this.color;u.splice(1,0,p,"color: inherit");let a=0,c=0;u[0].replace(/%[a-zA-Z%]/g,d=>{d!=="%%"&&(a++,d==="%c"&&(c=a))}),u.splice(c,0,p)}s.log=console.debug||console.log||(()=>{});function r(u){try{u?s.storage.setItem("debug",u):s.storage.removeItem("debug")}catch{}}function o(){let u;try{u=s.storage.getItem("debug")}catch{}return!u&&typeof process!="undefined"&&"env"in process&&(u={}.DEBUG),u}function i(){try{return localStorage}catch{}}n.exports=ce(s);const{formatters:l}=n.exports;l.j=function(u){try{return JSON.stringify(u)}catch(p){return"[UnexpectedJSONParseError]: "+p.message}}})(B,B.exports);var ue=B.exports;const D=ue("perfect-cache"),w=D.extend("indexedDB"),M=()=>{let n=["memory"];return(window==null?void 0:window.localStorage)&&R.localStorage&&n.push("localStorage"),(window==null?void 0:window.sessionStorage)&&R.sessionStorage&&n.push("sessionStorage"),(window==null?void 0:window.document)&&"cookie"in(window==null?void 0:window.document)&&R.cookie&&n.push("cookie"),(window==null?void 0:window.indexedDB)&&R.indexedDB&&n.push("indexedDB"),n=n.concat(Object.keys(V)),n},le=n=>R[n]||V[n],Y=(n,s)=>new Promise((e,t)=>{const r=window.indexedDB.open(n,s);r.onerror=o=>{window.console.error(`Database ${n} version ${s} initialised error.`,o),t(o)},r.onsuccess=()=>{const o=r.result,i=o.version;w(`Database ${n} version ${i} initialised success.`),e(o)},r.onupgradeneeded=o=>{const i=o.target.result;w(`Database ${n} upgrade needed as oldVersion is ${o.oldVersion} and newVersion is ${o.newVersion}.`),e(i)}});class de extends K{constructor(e,t){super();m(this,"opts");m(this,"__init",!1);m(this,"driver");m(this,"store");m(this,"keyFallbacks",[]);m(this,"keyRegexFallbacks",[]);const r=M();if(!e&&!t)t=_({},f);else if(e)if(r.includes(e))Object.prototype.toString.call(t)==="[object Object]"?t=_(X(_({},f),{driver:e}),t):t=X(_({},f),{driver:e});else if(Object.prototype.toString.call(e)==="[object Object]"&&r.includes(e.driver))t=_(_({},f),e);else throw new Error("please input the correct driver param as the first param or in the opts params.");else throw new Error("please input the driver as first param.");if(t&&t.driver)this.opts=t,this.initDriver();else throw new Error("please input the driver as first param.")}initDriver(){const e=M();if(this.opts&&this.opts.driver&&e.includes(this.opts.driver)){this.__init=!1;const t=le(this.opts.driver);this.store=new t(this.opts),this.store.$on("ready",()=>{this.__init=!0,this.driver=this.opts.driver,this.$emit("ready")}),this.store.$on("cacheExpired",r=>{this.$emit("cacheExpired",r)})}}setDriver(e){this.opts.driver=e,this.initDriver()}existsKey(){return this.store.existsKey.apply(this.store,arguments)}getItem(e,t={}){const{defaultVal:r,withFallback:o=!0,refreshCache:i=!0}=t;return new Promise(async(l,u)=>{const p=await this.store.getItem(e),a=p==null||p==="";if(a&&o){const c=this.__getFallbackByKey(e);if(c){const d=await c.fallback(e),b=d==null||d==="";i&&!b&&await this.store.setItem(e,d,{expiredTime:c.expiredTime,maxAge:c.maxAge}),l(b&&r!==void 0?r:d)}else l(r===void 0?p:r)}else l(a&&r!==void 0?r:p)})}setItem(){return this.store.setItem.apply(this.store,arguments)}removeItem(){return this.store.removeItem.apply(this.store,arguments)}clear(){return this.store.clear.apply(this.store,arguments)}keys(){return this.store.keys.apply(this.store,arguments)}length(){return this.store.length.apply(this.store,arguments)}async getItemList(e,t){let r;const o={};Array.isArray(e)?r=e:e instanceof RegExp?r=(await this.keys()).filter(i=>e.test(i)):r=[];for(const i of r){const l=await this.getItem(i,t);o[i]=l}return o}async removeItemList(e){let t;Array.isArray(e)?t=e:e instanceof RegExp?t=(await this.keys()).filter(r=>e.test(r)):t=[];for(const r of t)await this.removeItem(r)}fallbackKey(e,t,r={}){const{expiredTime:o,maxAge:i}=r;if(typeof e=="string"){if(t instanceof Function)return this.keyFallbacks.push({key:e,expiredTime:o,maxAge:i,fallback:t});throw new Error("please input the fallback as type [Function]")}if(e instanceof RegExp){if(t instanceof Function)return this.keyRegexFallbacks.push({regex:e,expiredTime:o,maxAge:i,fallback:t});throw new Error("please input the fallback as type [Function]")}}__getFallbackByKey(e){let t=this.keyFallbacks.find(r=>r.key===e);return t||(t=this.keyRegexFallbacks.find(r=>r.regex.test(e)),t)}}h.BaseStore=v,h.EventListener=K,h.PerfectCache=de,h.StoreResult=P,h.cacheDebugger=D,h.connectToIndexedDB=Y,h.getSupportedDriverList=M,h.indexedDBDebugger=w,h.registerStore=ee,Object.defineProperties(h,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
