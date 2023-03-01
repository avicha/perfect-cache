(function(l,a){typeof exports=="object"&&typeof module!="undefined"?a(exports):typeof define=="function"&&define.amd?define(["exports"],a):(l=typeof globalThis!="undefined"?globalThis:l||self,a(l.PerfectCache={}))})(this,function(l){"use strict";var M=Object.defineProperty,G=Object.defineProperties;var J=Object.getOwnPropertyDescriptors;var T=Object.getOwnPropertySymbols;var U=Object.prototype.hasOwnProperty,L=Object.prototype.propertyIsEnumerable;var R=(l,a,f)=>a in l?M(l,a,{enumerable:!0,configurable:!0,writable:!0,value:f}):l[a]=f,y=(l,a)=>{for(var f in a||(a={}))U.call(a,f)&&R(l,f,a[f]);if(T)for(var f of T(a))L.call(a,f)&&R(l,f,a[f]);return l},_=(l,a)=>G(l,J(a));var d=(l,a,f)=>(R(l,typeof a!="symbol"?a+"":a,f),f);var a={driver:"memory"};function f(i){return{all:i=i||new Map,on:function(s,e){var r=i.get(s);r?r.push(e):i.set(s,[e])},off:function(s,e){var r=i.get(s);r&&(e?r.splice(r.indexOf(e)>>>0,1):i.set(s,[]))},emit:function(s,e){var r=i.get(s);r&&r.slice().map(function(t){t(e)}),(r=i.get("*"))&&r.slice().map(function(t){t(s,e)})}}}class D{constructor(){d(this,"mitt",new f)}$on(){return this.mitt.on.apply(this,arguments)}$off(){return this.mitt.off.apply(this,arguments)}$emit(){return this.mitt.emit.apply(this,arguments)}}class E extends D{constructor(e={}){super();d(this,"opts");d(this,"isReady",!1);this.opts=e,this.isReady=!1}existsKey(){throw new Error("please implement the existsKey method for this driver.")}get(){throw new Error("please implement the get method for this driver.")}set(){throw new Error("please implement the set method for this driver.")}}const m={OK:Symbol("OK"),KEY_NOT_EXISTS:Symbol("KEY_NOT_EXISTS"),KEY_EXPIRED:Symbol("KEY_EXPIRED"),JSON_PARSE_ERROR:Symbol("JSON_PARSE_ERROR"),NX_SET_NOT_PERFORMED:Symbol("NX_SET_NOT_PERFORMED"),XX_SET_NOT_PERFORMED:Symbol("XX_SET_NOT_PERFORMED")};class g extends E{constructor(s){super(s),this.isReady=!0,this.$emit("ready")}keyValueGet(){throw new Error("please implement the keyValueGet method for this driver.")}keyValueSet(){throw new Error("please implement the keyValueSet method for this driver.")}existsKey(){throw new Error("please implement the existsKey method for this driver.")}get(s){const e=this.keyValueGet(s);if(e)try{const r=JSON.parse(e);if(r.expiredAt){if(r.expiredAt>Date.now())return r.value;this.$emit("cacheExpired",s);return}else return r.value}catch(r){window.console.debug("get key json parse error",r);return}else return}set(s,e,r={}){const{expiredTime:t,expiredTimeAt:n,setOnlyNotExist:o=!1,setOnlyExist:u=!1}=r;let c,p;if(t&&typeof t=="number"&&t>0&&(c=Date.now()+t),n&&typeof n=="number"&&n>0&&(c=n),c&&(p=Math.max(c-Date.now(),0)),o||u){const h=this.existsKey(s);return o&&h?m.NX_SET_NOT_PERFORMED:u&&!h?m.XX_SET_NOT_PERFORMED:(this.keyValueSet(s,JSON.stringify({value:e,expiredAt:c,maxAge:p})),m.OK)}else return this.keyValueSet(s,JSON.stringify({value:e,expiredAt:c,maxAge:p})),m.OK}}class k extends g{keyValueGet(s){return localStorage.getItem(s)}keyValueSet(s,e){localStorage.setItem(s,e)}existsKey(s){return!!localStorage.getItem(s)}}d(k,"driver","localStorage");class j extends g{constructor(){super(...arguments);d(this,"data",new Map)}keyValueGet(e){return this.data.get(e)}keyValueSet(e,r){this.data.set(e,r)}existsKey(e){return!!this.data.has(e)}}d(j,"driver","memory");class C extends g{keyValueGet(s){return sessionStorage.getItem(s)}keyValueSet(s,e){sessionStorage.setItem(s,e)}existsKey(s){return!!sessionStorage.getItem(s)}}d(C,"driver","sessionStorage");/*! js-cookie v3.0.1 | MIT */function x(i){for(var s=1;s<arguments.length;s++){var e=arguments[s];for(var r in e)i[r]=e[r]}return i}var I={read:function(i){return i[0]==='"'&&(i=i.slice(1,-1)),i.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(i){return encodeURIComponent(i).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};function v(i,s){function e(t,n,o){if(typeof document!="undefined"){o=x({},s,o),typeof o.expires=="number"&&(o.expires=new Date(Date.now()+o.expires*864e5)),o.expires&&(o.expires=o.expires.toUTCString()),t=encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var u="";for(var c in o)!o[c]||(u+="; "+c,o[c]!==!0&&(u+="="+o[c].split(";")[0]));return document.cookie=t+"="+i.write(n,t)+u}}function r(t){if(!(typeof document=="undefined"||arguments.length&&!t)){for(var n=document.cookie?document.cookie.split("; "):[],o={},u=0;u<n.length;u++){var c=n[u].split("="),p=c.slice(1).join("=");try{var h=decodeURIComponent(c[0]);if(o[h]=i.read(p,h),t===h)break}catch{}}return t?o[t]:o}}return Object.create({set:e,get:r,remove:function(t,n){e(t,"",x({},n,{expires:-1}))},withAttributes:function(t){return v(this.converter,x({},this.attributes,t))},withConverter:function(t){return v(x({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(s)},converter:{value:Object.freeze(i)}})}var O=v(I,{path:"/"});class V extends g{keyValueGet(s){return O.get(s)}keyValueSet(s,e){O.set(s,e)}existsKey(s){return!!O.get(s)}}d(V,"driver","cookie");class F extends E{constructor(s){super(s)}keyValueGet(){return Promise.reject(new Error("please implement the keyValueGet method for this driver."))}keyValueSet(){return Promise.reject(new Error("please implement the keyValueSet method for this driver."))}existsKey(){return Promise.reject(new Error("please implement the existsKey method for this driver."))}get(s){return new Promise((e,r)=>{this.keyValueGet(s).then(t=>{if(t)try{const n=JSON.parse(t);n.expiredAt?n.expiredAt>Date.now()?e(n.value):(this.$emit("cacheExpired",s),e()):e(n.value)}catch(n){window.console.debug("get key json parse error",n),e()}else e()}).catch(t=>{r(t)})})}set(s,e,r={}){const{expiredTime:t,expiredTimeAt:n,setOnlyNotExist:o=!1,setOnlyExist:u=!1}=r;let c,p;return t&&typeof t=="number"&&t>0&&(c=Date.now()+t),n&&typeof n=="number"&&n>0&&(c=n),c&&(p=Math.max(c-Date.now(),0)),new Promise((h,b)=>{o||u?this.existsKey(s).then(w=>{if(o&&w)return h(m.NX_SET_NOT_PERFORMED);if(u&&!w)return h(m.XX_SET_NOT_PERFORMED);this.keyValueSet(s,JSON.stringify({value:e,expiredAt:c,maxAge:p})).then(()=>h(m.OK)).catch(B=>{b(B)})}).catch(w=>{b(w)}):this.keyValueSet(s,JSON.stringify({value:e,expiredAt:c,maxAge:p})).then(()=>h(m.OK)).catch(w=>{b(w)})})}}class P extends F{constructor(e){var r,t,n;super(e);d(this,"dbName","perfect-cache");d(this,"objectStoreName","perfect-cache");d(this,"dbVersion",1);d(this,"dbConnection");this.isReady=!1,(r=this.opts)!=null&&r.dbName&&(this.dbName=this.opts.dbName),(t=this.opts)!=null&&t.objectStoreName&&(this.objectStoreName=this.opts.objectStoreName),(n=this.opts)!=null&&n.dbVersion&&(this.dbVersion=this.opts.dbVersion),this.connectDB().then(()=>{this.initObjectStore()})}connectDB(){return new Promise((e,r)=>{const t=window.indexedDB.open(this.dbName,this.dbVersion);t.onerror=()=>{window.console.error(`Database ${this.dbName} init occurs error`,t.result),r(t.result)},t.onsuccess=()=>{this.dbConnection=t.result,window.console.debug(`Database ${this.dbName} initialised.`),e(this.dbConnection)},t.onupgradeneeded=n=>{this.dbConnection=n.target.result,window.console.debug("Database version upgraded success."),e(this.dbConnection)}})}initObjectStore(){return new Promise((e,r)=>{if(this.dbConnection)this.dbConnection.objectStoreNames.contains(this.objectStoreName)||this.dbConnection.createObjectStore(this.objectStoreName,{keyPath:"key"}),this.isReady=!0,this.$emit("ready"),e();else{const t=new Error(`Database ${this.dbName} connection is not initialised.`);window.console.error(t),r(t)}})}keyValueGet(e){return new Promise((r,t)=>{if(this.dbConnection){const n=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).get(e);n.onerror=()=>{window.console.error("Database keyValueGet occurs error",n.result),t(n.result)},n.onsuccess=()=>{var o;r((o=n.result)==null?void 0:o.value)}}else{const n=new Error(`Database ${this.dbName} connection is not initialised.`);window.console.error(n),t(n)}})}keyValueSet(e,r){return new Promise((t,n)=>{if(this.dbConnection){const o=this.dbConnection.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).put({key:e,value:r});o.onerror=()=>{window.console.error("Database keyValueSet occurs error",o.result),n(o.result)},o.onsuccess=()=>{var u;t((u=o.result)==null?void 0:u.value)}}else{const o=new Error(`Database ${this.dbName} connection is not initialised.`);window.console.error(o),n(o)}})}existsKey(e){return new Promise((r,t)=>{if(this.dbConnection){const n=this.dbConnection.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).count(e);n.onerror=()=>{window.console.error("Database existsKey occurs error",n.result),t(n.result)},n.onsuccess=()=>{r(!!n.result)}}else{const n=new Error(`Database ${this.dbName} connection is not initialised.`);window.console.error(n),t(n)}})}}d(P,"driver","indexedDB");const S={};for(const i of[j,k,C,V,P])S[i.driver]=i;const N={},A=i=>{if(Object.getPrototypeOf(i)===E)if(i.driver&&typeof i.driver=="string")N[i.driver]=i;else throw new Error("please input the driver name.")},K=()=>{var s;let i=["memory"];return(window==null?void 0:window.localStorage)&&S.localStorage&&i.push("localStorage"),(window==null?void 0:window.sessionStorage)&&S.sessionStorage&&i.push("sessionStorage"),((s=window==null?void 0:window.document)==null?void 0:s.cookie)&&S.cookie&&i.push("cookie"),(window==null?void 0:window.indexedDB)&&S.indexedDB&&i.push("indexedDB"),i=i.concat(Object.keys(N)),i},$=i=>S[i]||N[i];class X extends D{constructor(e,r){super();d(this,"opts");d(this,"__init",!1);d(this,"driver");d(this,"store");d(this,"keyFallbacks",[]);d(this,"keyRegexFallbacks",[]);const t=K();if(!e&&!r)r=y({},a);else if(e)if(t.includes(e))Object.prototype.toString.call(r)==="[object Object]"?r=y(_(y({},a),{driver:e}),r):r=_(y({},a),{driver:e});else if(Object.prototype.toString.call(e)==="[object Object]"&&t.includes(e.driver))r=y(y({},a),e);else throw new Error("please input the correct driver param as the first param or in the opts params.");else throw new Error("please input the driver as first param.");if(r&&r.driver)this.opts=r,this.initDriver();else throw new Error("please input the driver as first param.")}initDriver(){const e=K();if(this.opts&&this.opts.driver&&e.includes(this.opts.driver)){this.__init=!1;const r=$(this.opts.driver);this.store=new r(this.opts),this.store.$on("ready",()=>{this.__init=!0,this.driver=this.opts.driver,this.$emit("ready")}),this.store.$on("cacheExpired",t=>{this.$emit("cacheExpired",t)})}}setDriver(e){this.opts.driver=e,this.initDriver()}existsKey(){return this.store.existsKey.apply(this.store,arguments)}async get(e,r={}){const{defaultVal:t,withFallback:n=!0,refreshCache:o=!0}=r,u=await this.get(e),c=u==null||isNaN(u)||u==="";if(c&&n){const p=this.__getFallbackByKey(e);if(p){const h=await p.fallback(e),b=h==null||isNaN(h)||h==="";return o&&await this.set(e,h,{expiredTime:p.expiredTime}),b&&t!==void 0?t:h}else return t===void 0?u:t}else return c&&t!==void 0?t:u}set(){return this.store.set.apply(this.store,arguments)}fallbackKey(e,r,t){if(!t&&r instanceof Function&&(t=r,r=null),typeof e=="string"){if(t instanceof Function&&(!r||typeof r=="number"))return this.keyFallbacks.push({key:e,expiredTime:r,fallback:t});throw new Error("please input the expiredTime as type [number] and fallback as type [Function]")}if(e instanceof RegExp){if(t instanceof Function&&(!r||typeof r=="number"))return this.keyRegexFallbacks.push({regex:e,expiredTime:r,fallback:t});throw new Error("please input the expiredTime as type [number] and fallback as type [Function]")}}__getFallbackByKey(e){let r=this.keyFallbacks.find(t=>t.key===e&&t.fallback instanceof Function);return r||(r=this.keyRegexFallbacks.find(t=>t.regex.test(e)&&t.fallback instanceof Function),r)}}l.AsyncStore=F,l.BaseStore=E,l.PerfectCache=X,l.StoreResult=m,l.SyncStore=g,l.registerStore=A,Object.defineProperties(l,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
