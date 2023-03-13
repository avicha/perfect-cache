(function(u,l){typeof exports=="object"&&typeof module!="undefined"?l(exports):typeof define=="function"&&define.amd?define(["exports"],l):(u=typeof globalThis!="undefined"?globalThis:u||self,l(u.PerfectCache={}))})(this,function(u){"use strict";var M=Object.defineProperty,G=Object.defineProperties;var J=Object.getOwnPropertyDescriptors;var A=Object.getOwnPropertySymbols;var U=Object.prototype.hasOwnProperty,L=Object.prototype.propertyIsEnumerable;var D=(u,l,m)=>l in u?M(u,l,{enumerable:!0,configurable:!0,writable:!0,value:m}):u[l]=m,S=(u,l)=>{for(var m in l||(l={}))U.call(l,m)&&D(u,m,l[m]);if(A)for(var m of A(l))L.call(l,m)&&D(u,m,l[m]);return u},N=(u,l)=>G(u,J(l));var d=(u,l,m)=>(D(u,typeof l!="symbol"?l+"":l,m),m);var l={driver:"memory",prefix:"cache:"};function m(i){return{all:i=i||new Map,on:function(s,e){var r=i.get(s);r?r.push(e):i.set(s,[e])},off:function(s,e){var r=i.get(s);r&&(e?r.splice(r.indexOf(e)>>>0,1):i.set(s,[]))},emit:function(s,e){var r=i.get(s);r&&r.slice().map(function(t){t(e)}),(r=i.get("*"))&&r.slice().map(function(t){t(s,e)})}}}class K{constructor(){d(this,"mitt",new m)}$on(){return this.mitt.on.apply(this,arguments)}$off(){return this.mitt.off.apply(this,arguments)}$emit(){return this.mitt.emit.apply(this,arguments)}}class x extends K{constructor(e={}){super();d(this,"opts");d(this,"isAsync",!1);d(this,"isReady",!1);d(this,"prefix","cache:");this.opts=e,this.opts.prefix&&(this.prefix=this.opts.prefix),this.isReady=!1}__getRealKey(e){return`${this.prefix}${e}`}existsKey(){throw new Error("please implement the existsKey method for this driver.")}get(){throw new Error("please implement the get method for this driver.")}set(){throw new Error("please implement the set method for this driver.")}}const g={OK:Symbol("OK"),KEY_NOT_EXISTS:Symbol("KEY_NOT_EXISTS"),KEY_EXPIRED:Symbol("KEY_EXPIRED"),JSON_PARSE_ERROR:Symbol("JSON_PARSE_ERROR"),NX_SET_NOT_PERFORMED:Symbol("NX_SET_NOT_PERFORMED"),XX_SET_NOT_PERFORMED:Symbol("XX_SET_NOT_PERFORMED")};class w extends x{constructor(s){super(s),this.isAsync=!1,setTimeout(()=>{this.isReady=!0,this.$emit("ready")},0)}keyValueGet(){throw new Error("please implement the keyValueGet method for this driver.")}keyValueSet(){throw new Error("please implement the keyValueSet method for this driver.")}existsKey(){throw new Error("please implement the existsKey method for this driver.")}get(s){const e=this.keyValueGet(s);if(e)if(e.expiredAt){if(e.expiredAt>Date.now())return e.maxAge&&(e.expiredAt=Date.now()+e.maxAge,this.keyValueSet(s,e)),e.value;this.$emit("cacheExpired",s);return}else return e.value;else return}set(s,e,r={}){const{expiredTime:t,expiredTimeAt:n,maxAge:o,setOnlyNotExist:c=!1,setOnlyExist:p=!1}=r;let a;if(t&&typeof t=="number"&&t>0&&(a=Date.now()+t),n&&typeof n=="number"&&n>0&&(a=n),a?a=Math.max(a,Date.now()):o&&typeof o=="number"&&o>0&&(a=Date.now()+o),c||p){const f=this.existsKey(s);return c&&f?g.NX_SET_NOT_PERFORMED:p&&!f?g.XX_SET_NOT_PERFORMED:(this.keyValueSet(s,{value:e,expiredAt:a,maxAge:o}),g.OK)}else return this.keyValueSet(s,{value:e,expiredAt:a,maxAge:o}),g.OK}}class j extends w{keyValueGet(s){const e=localStorage.getItem(this.__getRealKey(s));if(e)try{return JSON.parse(e)}catch(r){window.console.debug(`get key ${s} json parse error`,r);return}}keyValueSet(s,e){localStorage.setItem(this.__getRealKey(s),JSON.stringify(e))}existsKey(s){return!!localStorage.getItem(this.__getRealKey(s))}}d(j,"driver","localStorage");class k extends w{constructor(){super(...arguments);d(this,"data",new Map)}keyValueGet(e){const r=this.data.get(this.__getRealKey(e));if(r)try{return JSON.parse(r)}catch(t){window.console.debug(`get key ${e} json parse error`,t);return}}keyValueSet(e,r){this.data.set(this.__getRealKey(e),JSON.stringify(r))}existsKey(e){return!!this.data.has(this.__getRealKey(e))}}d(k,"driver","memory");class V extends w{keyValueGet(s){const e=sessionStorage.getItem(this.__getRealKey(s));if(e)try{return JSON.parse(e)}catch(r){window.console.debug(`get key ${s} json parse error`,r);return}}keyValueSet(s,e){sessionStorage.setItem(this.__getRealKey(s),JSON.stringify(e))}existsKey(s){return!!sessionStorage.getItem(this.__getRealKey(s))}}d(V,"driver","sessionStorage");/*! js-cookie v3.0.1 | MIT */function E(i){for(var s=1;s<arguments.length;s++){var e=arguments[s];for(var r in e)i[r]=e[r]}return i}var $={read:function(i){return i[0]==='"'&&(i=i.slice(1,-1)),i.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(i){return encodeURIComponent(i).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};function R(i,s){function e(t,n,o){if(typeof document!="undefined"){o=E({},s,o),typeof o.expires=="number"&&(o.expires=new Date(Date.now()+o.expires*864e5)),o.expires&&(o.expires=o.expires.toUTCString()),t=encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var c="";for(var p in o)!o[p]||(c+="; "+p,o[p]!==!0&&(c+="="+o[p].split(";")[0]));return document.cookie=t+"="+i.write(n,t)+c}}function r(t){if(!(typeof document=="undefined"||arguments.length&&!t)){for(var n=document.cookie?document.cookie.split("; "):[],o={},c=0;c<n.length;c++){var p=n[c].split("="),a=p.slice(1).join("=");try{var f=decodeURIComponent(p[0]);if(o[f]=i.read(a,f),t===f)break}catch{}}return t?o[t]:o}}return Object.create({set:e,get:r,remove:function(t,n){e(t,"",E({},n,{expires:-1}))},withAttributes:function(t){return R(this.converter,E({},this.attributes,t))},withConverter:function(t){return R(E({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(s)},converter:{value:Object.freeze(i)}})}var v=R($,{path:"/"});class C extends w{keyValueGet(s){const e=v.get(this.__getRealKey(s));if(e)try{return JSON.parse(e)}catch(r){window.console.debug(`get key ${s} json parse error`,r);return}}keyValueSet(s,e){v.set(this.__getRealKey(s),JSON.stringify(e))}existsKey(s){return!!v.get(this.__getRealKey(s))}}d(C,"driver","cookie");class F extends x{constructor(s){super(s),this.isAsync=!0}keyValueGet(){return Promise.reject(new Error("please implement the keyValueGet method for this driver."))}keyValueSet(){return Promise.reject(new Error("please implement the keyValueSet method for this driver."))}existsKey(){return Promise.reject(new Error("please implement the existsKey method for this driver."))}get(s){return new Promise((e,r)=>{this.keyValueGet(s).then(t=>{t?t.expiredAt?t.expiredAt>Date.now()?t.maxAge?(t.expiredAt=Date.now()+t.maxAge,this.keyValueSet(s,t).then(()=>e(t.value)).catch(n=>{r(n)})):e(t.value):(this.$emit("cacheExpired",s),e()):e(t.value):e()}).catch(t=>{r(t)})})}set(s,e,r={}){const{expiredTime:t,expiredTimeAt:n,maxAge:o,setOnlyNotExist:c=!1,setOnlyExist:p=!1}=r;let a;return t&&typeof t=="number"&&t>0&&(a=Date.now()+t),n&&typeof n=="number"&&n>0&&(a=n),a?a=Math.max(a,Date.now()):o&&typeof o=="number"&&o>0&&(a=Date.now()+o),new Promise((f,y)=>{c||p?this.existsKey(s).then(h=>{if(c&&h)return f(g.NX_SET_NOT_PERFORMED);if(p&&!h)return f(g.XX_SET_NOT_PERFORMED);this.keyValueSet(s,{value:e,expiredAt:a,maxAge:o}).then(()=>f(g.OK)).catch(_=>{y(_)})}).catch(h=>{y(h)}):this.keyValueSet(s,{value:e,expiredAt:a,maxAge:o}).then(()=>f(g.OK)).catch(h=>{y(h)})})}}class P extends F{constructor(e){var r,t,n;super(e);d(this,"dbName","perfect-cache");d(this,"objectStoreName","perfect-cache");d(this,"dbVersion",1);d(this,"dbConnection");this.isReady=!1,(r=this.opts)!=null&&r.dbName&&(this.dbName=this.opts.dbName),(t=this.opts)!=null&&t.objectStoreName&&(this.objectStoreName=this.opts.objectStoreName),(n=this.opts)!=null&&n.dbVersion&&(this.dbVersion=this.opts.dbVersion),this.connectDB().then(()=>{this.initObjectStore()})}connectDB(){return new Promise((e,r)=>{const t=window.indexedDB.open(this.dbName,this.dbVersion);t.onerror=()=>{window.console.error(`Database ${this.dbName} init occurs error`,t.result),r(t.result)},t.onsuccess=()=>{this.dbConnection=t.result,window.console.debug(`Database ${this.dbName} initialised.`),e(this.dbConnection)},t.onupgradeneeded=n=>{this.dbConnection=n.target.result,window.console.debug("Database version upgraded success."),e(this.dbConnection)}})}initObjectStore(){return new Promise((e,r)=>{if(this.dbConnection)if(this.dbConnection.objectStoreNames.contains(this.objectStoreName))this.isReady=!0,this.$emit("ready"),e();else{window.console.debug(`ObjectStore ${this.objectStoreName} is not exists, now creating it!`);const t=this.dbConnection.createObjectStore(this.objectStoreName,{keyPath:"key"});t.transaction.oncomplete=n=>{window.console.debug(`ObjectStore ${this.objectStoreName} is created now.`),this.isReady=!0,this.$emit("ready"),e()}}else{const t=new Error(`Database ${this.dbName} connection is not initialised.`);r(t)}})}keyValueGet(e){return new Promise((r,t)=>{if(this.dbConnection){const n=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).get(this.__getRealKey(e));n.onerror=()=>{window.console.error("Database keyValueGet occurs error",n.result),t(n.result)},n.onsuccess=()=>{var o;r((o=n.result)==null?void 0:o.value)}}else{const n=new Error(`Database ${this.dbName} connection is not initialised.`);t(n)}})}keyValueSet(e,r){return new Promise((t,n)=>{if(this.dbConnection){const o=this.dbConnection.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).put({key:this.__getRealKey(e),value:r});o.onerror=()=>{window.console.error("Database keyValueSet occurs error",o.result),n(o.result)},o.onsuccess=()=>{var c;t((c=o.result)==null?void 0:c.value)}}else{const o=new Error(`Database ${this.dbName} connection is not initialised.`);n(o)}})}existsKey(e){return new Promise((r,t)=>{if(this.dbConnection){const n=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).count(this.__getRealKey(e));n.onerror=()=>{window.console.error("Database existsKey occurs error",n.result),t(n.result)},n.onsuccess=()=>{r(!!n.result)}}else{const n=new Error(`Database ${this.dbName} connection is not initialised.`);t(n)}})}}d(P,"driver","indexedDB");const b={};for(const i of[k,j,V,C,P])b[i.driver]=i;const O={},I=i=>{if(Object.getPrototypeOf(i)===x)if(i.driver&&typeof i.driver=="string")O[i.driver]=i;else throw new Error("please input the driver name.")},T=()=>{let i=["memory"];return(window==null?void 0:window.localStorage)&&b.localStorage&&i.push("localStorage"),(window==null?void 0:window.sessionStorage)&&b.sessionStorage&&i.push("sessionStorage"),(window==null?void 0:window.document)&&"cookie"in(window==null?void 0:window.document)&&b.cookie&&i.push("cookie"),(window==null?void 0:window.indexedDB)&&b.indexedDB&&i.push("indexedDB"),i=i.concat(Object.keys(O)),i},B=i=>b[i]||O[i];class X extends K{constructor(e,r){super();d(this,"opts");d(this,"__init",!1);d(this,"driver");d(this,"store");d(this,"keyFallbacks",[]);d(this,"keyRegexFallbacks",[]);const t=T();if(!e&&!r)r=S({},l);else if(e)if(t.includes(e))Object.prototype.toString.call(r)==="[object Object]"?r=S(N(S({},l),{driver:e}),r):r=N(S({},l),{driver:e});else if(Object.prototype.toString.call(e)==="[object Object]"&&t.includes(e.driver))r=S(S({},l),e);else throw new Error("please input the correct driver param as the first param or in the opts params.");else throw new Error("please input the driver as first param.");if(r&&r.driver)this.opts=r,this.initDriver();else throw new Error("please input the driver as first param.")}initDriver(){const e=T();if(this.opts&&this.opts.driver&&e.includes(this.opts.driver)){this.__init=!1;const r=B(this.opts.driver);this.store=new r(this.opts),this.store.$on("ready",()=>{this.__init=!0,this.driver=this.opts.driver,this.$emit("ready")}),this.store.$on("cacheExpired",t=>{this.$emit("cacheExpired",t)})}}setDriver(e){this.opts.driver=e,this.initDriver()}existsKey(){return this.store.existsKey.apply(this.store,arguments)}get(e,r={}){const{defaultVal:t,withFallback:n=!0,refreshCache:o=!0}=r;if(this.store.isAsync)return new Promise(async(c,p)=>{const a=await this.store.get(e),f=a==null||a==="";if(f&&n){const y=this.__getFallbackByKey(e);if(y){const h=await y.fallback(e),_=h==null||h==="";o&&await this.store.set(e,h,{expiredTime:y.expiredTime}),c(_&&t!==void 0?t:h)}else c(t===void 0?a:t)}else c(f&&t!==void 0?t:a)});{const c=this.store.get(e),p=c==null||c==="";if(p&&n){const a=this.__getFallbackByKey(e);if(a){const f=a.fallback(e);let y;if(f instanceof Promise)return f().then(h=>{const _=h==null||h==="";return o&&this.store.set(e,h,{expiredTime:a.expiredTime}),_&&t!==void 0?t:h});{y=f;const h=y==null||y==="";return o&&this.store.set(e,y,{expiredTime:a.expiredTime}),h&&t!==void 0?t:y}}else return t===void 0?c:t}else return p&&t!==void 0?t:c}}set(){return this.store.set.apply(this.store,arguments)}fallbackKey(e,r,t){if(!t&&r instanceof Function&&(t=r,r=null),typeof e=="string"){if(t instanceof Function&&(!r||typeof r=="number"))return this.keyFallbacks.push({key:e,expiredTime:r,fallback:t});throw new Error("please input the expiredTime as type [number] and fallback as type [Function]")}if(e instanceof RegExp){if(t instanceof Function&&(!r||typeof r=="number"))return this.keyRegexFallbacks.push({regex:e,expiredTime:r,fallback:t});throw new Error("please input the expiredTime as type [number] and fallback as type [Function]")}}__getFallbackByKey(e){let r=this.keyFallbacks.find(t=>t.key===e&&t.fallback instanceof Function);return r||(r=this.keyRegexFallbacks.find(t=>t.regex.test(e)&&t.fallback instanceof Function),r)}}u.AsyncStore=F,u.BaseStore=x,u.PerfectCache=X,u.StoreResult=g,u.SyncStore=w,u.registerStore=I,Object.defineProperties(u,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
