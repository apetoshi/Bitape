(()=>{var e={};e.id=8974,e.ids=[8974],e.modules={2044:(e,t)=>{t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2},t.isValid=function(e){return e&&void 0!==e.bit&&e.bit>=0&&e.bit<4},t.from=function(e,n){if(t.isValid(e))return e;try{if("string"!=typeof e)throw Error("Param is not a string");switch(e.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw Error("Unknown EC Level: "+e)}}catch(e){return n}}},2808:e=>{e.exports=function(){return"function"==typeof Promise&&Promise.prototype&&Promise.prototype.then}},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4018:(e,t,n)=>{"use strict";e.exports=n(64543)},4672:(e,t,n)=>{let a=n(56953);function r(e){this.mode=a.NUMERIC,this.data=e.toString()}r.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t,n,a;for(t=0;t+3<=this.data.length;t+=3)a=parseInt(this.data.substr(t,3),10),e.put(a,10);let r=this.data.length-t;r>0&&(a=parseInt(this.data.substr(t),10),e.put(a,3*r+1))},e.exports=r},7247:(e,t,n)=>{let a=n(86217);function r(e,t){let n=e.a/255,a=t+'="'+e.hex+'"';return n<1?a+" "+t+'-opacity="'+n.toFixed(2).slice(1)+'"':a}function o(e,t,n){let a=e+t;return void 0!==n&&(a+=" "+n),a}t.render=function(e,t,n){let i=a.getOptions(t),l=e.modules.size,s=e.modules.data,c=l+2*i.margin,u=i.color.light.a?"<path "+r(i.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",d="<path "+r(i.color.dark,"stroke")+' d="'+function(e,t,n){let a="",r=0,i=!1,l=0;for(let s=0;s<e.length;s++){let c=Math.floor(s%t),u=Math.floor(s/t);c||i||(i=!0),e[s]?(l++,s>0&&c>0&&e[s-1]||(a+=i?o("M",c+n,.5+u+n):o("m",r,0),r=0,i=!1),c+1<t&&e[s+1]||(a+=o("h",l),l=0)):r++}return a}(s,l,i.margin)+'"/>',p='<svg xmlns="http://www.w3.org/2000/svg" '+(i.width?'width="'+i.width+'" height="'+i.width+'" ':"")+('viewBox="0 0 '+c+" ")+c+'" shape-rendering="crispEdges">'+u+d+"</svg>\n";return"function"==typeof n&&n(null,p),p}},8086:e=>{"use strict";e.exports=require("module")},9304:(e,t,n)=>{let a=n(56953),r=n(4672),o=n(54522),i=n(71469),l=n(60508),s=n(51655),c=n(95061),u=n(7233);function d(e){return unescape(encodeURIComponent(e)).length}function p(e,t,n){let a,r=[];for(;null!==(a=e.exec(n));)r.push({data:a[0],index:a.index,mode:t,length:a[0].length});return r}function m(e){let t,n,r=p(s.NUMERIC,a.NUMERIC,e),o=p(s.ALPHANUMERIC,a.ALPHANUMERIC,e);return c.isKanjiModeEnabled()?(t=p(s.BYTE,a.BYTE,e),n=p(s.KANJI,a.KANJI,e)):(t=p(s.BYTE_KANJI,a.BYTE,e),n=[]),r.concat(o,t,n).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function f(e,t){switch(t){case a.NUMERIC:return r.getBitsLength(e);case a.ALPHANUMERIC:return o.getBitsLength(e);case a.KANJI:return l.getBitsLength(e);case a.BYTE:return i.getBitsLength(e)}}function h(e,t){let n,s=a.getBestModeForData(e);if((n=a.from(t,s))!==a.BYTE&&n.bit<s.bit)throw Error('"'+e+'" cannot be encoded with mode '+a.toString(n)+".\n Suggested mode is: "+a.toString(s));switch(n===a.KANJI&&!c.isKanjiModeEnabled()&&(n=a.BYTE),n){case a.NUMERIC:return new r(e);case a.ALPHANUMERIC:return new o(e);case a.KANJI:return new l(e);case a.BYTE:return new i(e)}}t.fromArray=function(e){return e.reduce(function(e,t){return"string"==typeof t?e.push(h(t,null)):t.data&&e.push(h(t.data,t.mode)),e},[])},t.fromString=function(e,n){let r=function(e,t){let n={},r={start:{}},o=["start"];for(let i=0;i<e.length;i++){let l=e[i],s=[];for(let e=0;e<l.length;e++){let c=l[e],u=""+i+e;s.push(u),n[u]={node:c,lastCount:0},r[u]={};for(let e=0;e<o.length;e++){let i=o[e];n[i]&&n[i].node.mode===c.mode?(r[i][u]=f(n[i].lastCount+c.length,c.mode)-f(n[i].lastCount,c.mode),n[i].lastCount+=c.length):(n[i]&&(n[i].lastCount=c.length),r[i][u]=f(c.length,c.mode)+4+a.getCharCountIndicator(c.mode,t))}}o=s}for(let e=0;e<o.length;e++)r[o[e]].end=0;return{map:r,table:n}}(function(e){let t=[];for(let n=0;n<e.length;n++){let r=e[n];switch(r.mode){case a.NUMERIC:t.push([r,{data:r.data,mode:a.ALPHANUMERIC,length:r.length},{data:r.data,mode:a.BYTE,length:r.length}]);break;case a.ALPHANUMERIC:t.push([r,{data:r.data,mode:a.BYTE,length:r.length}]);break;case a.KANJI:t.push([r,{data:r.data,mode:a.BYTE,length:d(r.data)}]);break;case a.BYTE:t.push([{data:r.data,mode:a.BYTE,length:d(r.data)}])}}return t}(m(e,c.isKanjiModeEnabled())),n),o=u.find_path(r.map,"start","end"),i=[];for(let e=1;e<o.length-1;e++)i.push(r.table[o[e]].node);return t.fromArray(i.reduce(function(e,t){let n=e.length-1>=0?e[e.length-1]:null;return n&&n.mode===t.mode?e[e.length-1].data+=t.data:e.push(t),e},[]))},t.rawSplit=function(e){return t.fromArray(m(e,c.isKanjiModeEnabled()))}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:e=>{"use strict";e.exports=require("punycode")},12412:e=>{"use strict";e.exports=require("assert")},13521:e=>{function t(e){if(!e||e<1)throw Error("BitMatrix size must be defined and greater than 0");this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}t.prototype.set=function(e,t,n,a){let r=e*this.size+t;this.data[r]=n,a&&(this.reservedBit[r]=!0)},t.prototype.get=function(e,t){return this.data[e*this.size+t]},t.prototype.xor=function(e,t,n){this.data[e*this.size+t]^=n},t.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},e.exports=t},18567:function(e,t,n){var a;!function(r,o){"use strict";var i="function",l="undefined",s="object",c="string",u="major",d="model",p="name",m="type",f="vendor",h="version",g="architecture",v="console",b="mobile",w="tablet",y="smarttv",C="wearable",x="embedded",j="Amazon",E="Apple",k="ASUS",B="BlackBerry",I="Browser",T="Chrome",R="Firefox",N="Google",S="Huawei",A="Microsoft",D="Motorola",W="Opera",O="Samsung",_="Sharp",F="Sony",L="Xiaomi",M="Zebra",U="Facebook",P="Chromium OS",q="Mac OS",z=" Browser",$=function(e,t){var n={};for(var a in e)t[a]&&t[a].length%2==0?n[a]=t[a].concat(e[a]):n[a]=e[a];return n},H=function(e){for(var t={},n=0;n<e.length;n++)t[e[n].toUpperCase()]=e[n];return t},Y=function(e,t){return typeof e===c&&-1!==K(t).indexOf(K(e))},K=function(e){return e.toLowerCase()},V=function(e,t){if(typeof e===c)return e=e.replace(/^\s\s*/,""),typeof t===l?e:e.substring(0,500)},X=function(e,t){for(var n,a,r,l,c,u,d=0;d<t.length&&!c;){var p=t[d],m=t[d+1];for(n=a=0;n<p.length&&!c&&p[n];)if(c=p[n++].exec(e))for(r=0;r<m.length;r++)u=c[++a],typeof(l=m[r])===s&&l.length>0?2===l.length?typeof l[1]==i?this[l[0]]=l[1].call(this,u):this[l[0]]=l[1]:3===l.length?typeof l[1]!==i||l[1].exec&&l[1].test?this[l[0]]=u?u.replace(l[1],l[2]):void 0:this[l[0]]=u?l[1].call(this,u,l[2]):void 0:4===l.length&&(this[l[0]]=u?l[3].call(this,u.replace(l[1],l[2])):o):this[l]=u||o;d+=2}},G=function(e,t){for(var n in t)if(typeof t[n]===s&&t[n].length>0){for(var a=0;a<t[n].length;a++)if(Y(t[n][a],e))return"?"===n?o:n}else if(Y(t[n],e))return"?"===n?o:n;return t.hasOwnProperty("*")?t["*"]:e},Z={ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2","8.1":"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"},Q={browser:[[/\b(?:crmo|crios)\/([\w\.]+)/i],[h,[p,"Chrome"]],[/edg(?:e|ios|a)?\/([\w\.]+)/i],[h,[p,"Edge"]],[/(opera mini)\/([-\w\.]+)/i,/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i],[p,h],[/opios[\/ ]+([\w\.]+)/i],[h,[p,W+" Mini"]],[/\bop(?:rg)?x\/([\w\.]+)/i],[h,[p,W+" GX"]],[/\bopr\/([\w\.]+)/i],[h,[p,W]],[/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i],[h,[p,"Baidu"]],[/\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i],[h,[p,"Maxthon"]],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,/(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,/(?:ms|\()(ie) ([\w\.]+)/i,/(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,/(heytap|ovi|115)browser\/([\d\.]+)/i,/(weibo)__([\d\.]+)/i],[p,h],[/quark(?:pc)?\/([-\w\.]+)/i],[h,[p,"Quark"]],[/\bddg\/([\w\.]+)/i],[h,[p,"DuckDuckGo"]],[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],[h,[p,"UC"+I]],[/microm.+\bqbcore\/([\w\.]+)/i,/\bqbcore\/([\w\.]+).+microm/i,/micromessenger\/([\w\.]+)/i],[h,[p,"WeChat"]],[/konqueror\/([\w\.]+)/i],[h,[p,"Konqueror"]],[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],[h,[p,"IE"]],[/ya(?:search)?browser\/([\w\.]+)/i],[h,[p,"Yandex"]],[/slbrowser\/([\w\.]+)/i],[h,[p,"Smart Lenovo "+I]],[/(avast|avg)\/([\w\.]+)/i],[[p,/(.+)/,"$1 Secure "+I],h],[/\bfocus\/([\w\.]+)/i],[h,[p,R+" Focus"]],[/\bopt\/([\w\.]+)/i],[h,[p,W+" Touch"]],[/coc_coc\w+\/([\w\.]+)/i],[h,[p,"Coc Coc"]],[/dolfin\/([\w\.]+)/i],[h,[p,"Dolphin"]],[/coast\/([\w\.]+)/i],[h,[p,W+" Coast"]],[/miuibrowser\/([\w\.]+)/i],[h,[p,"MIUI"+z]],[/fxios\/([\w\.-]+)/i],[h,[p,R]],[/\bqihoobrowser\/?([\w\.]*)/i],[h,[p,"360"]],[/\b(qq)\/([\w\.]+)/i],[[p,/(.+)/,"$1Browser"],h],[/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],[[p,/(.+)/,"$1"+z],h],[/samsungbrowser\/([\w\.]+)/i],[h,[p,O+" Internet"]],[/metasr[\/ ]?([\d\.]+)/i],[h,[p,"Sogou Explorer"]],[/(sogou)mo\w+\/([\d\.]+)/i],[[p,"Sogou Mobile"],h],[/(electron)\/([\w\.]+) safari/i,/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,/m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i],[p,h],[/(lbbrowser|rekonq)/i,/\[(linkedin)app\]/i],[p],[/ome\/([\w\.]+) \w* ?(iron) saf/i,/ome\/([\w\.]+).+qihu (360)[es]e/i],[h,p],[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],[[p,U],h],[/(Klarna)\/([\w\.]+)/i,/(kakao(?:talk|story))[\/ ]([\w\.]+)/i,/(naver)\(.*?(\d+\.[\w\.]+).*\)/i,/safari (line)\/([\w\.]+)/i,/\b(line)\/([\w\.]+)\/iab/i,/(alipay)client\/([\w\.]+)/i,/(twitter)(?:and| f.+e\/([\w\.]+))/i,/(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i],[p,h],[/\bgsa\/([\w\.]+) .*safari\//i],[h,[p,"GSA"]],[/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],[h,[p,"TikTok"]],[/headlesschrome(?:\/([\w\.]+)| )/i],[h,[p,T+" Headless"]],[/ wv\).+(chrome)\/([\w\.]+)/i],[[p,T+" WebView"],h],[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],[h,[p,"Android "+I]],[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],[p,h],[/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],[h,[p,"Mobile Safari"]],[/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],[h,p],[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],[p,[h,G,{"1.0":"/8","1.2":"/1","1.3":"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}]],[/(webkit|khtml)\/([\w\.]+)/i],[p,h],[/(navigator|netscape\d?)\/([-\w\.]+)/i],[[p,"Netscape"],h],[/(wolvic|librewolf)\/([\w\.]+)/i],[p,h],[/mobile vr; rv:([\w\.]+)\).+firefox/i],[h,[p,R+" Reality"]],[/ekiohf.+(flow)\/([\w\.]+)/i,/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,/(firefox)\/([\w\.]+)/i,/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,/(links) \(([\w\.]+)/i],[p,[h,/_/g,"."]],[/(cobalt)\/([\w\.]+)/i],[p,[h,/master.|lts./,""]]],cpu:[[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],[[g,"amd64"]],[/(ia32(?=;))/i],[[g,K]],[/((?:i[346]|x)86)[;\)]/i],[[g,"ia32"]],[/\b(aarch64|arm(v?8e?l?|_?64))\b/i],[[g,"arm64"]],[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],[[g,"armhf"]],[/windows (ce|mobile); ppc;/i],[[g,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],[[g,/ower/,"",K]],[/(sun4\w)[;\)]/i],[[g,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],[[g,K]]],device:[[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],[d,[f,O],[m,w]],[/\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,/samsung[- ]((?!sm-[lr])[-\w]+)/i,/sec-(sgh\w+)/i],[d,[f,O],[m,b]],[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],[d,[f,E],[m,b]],[/\((ipad);[-\w\),; ]+apple/i,/applecoremedia\/[\w\.]+ \((ipad)/i,/\b(ipad)\d\d?,\d\d?[;\]].+ios/i],[d,[f,E],[m,w]],[/(macintosh);/i],[d,[f,E]],[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],[d,[f,_],[m,b]],[/(?:honor)([-\w ]+)[;\)]/i],[d,[f,"Honor"],[m,b]],[/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],[d,[f,S],[m,w]],[/(?:huawei)([-\w ]+)[;\)]/i,/\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],[d,[f,S],[m,b]],[/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,/\b; (\w+) build\/hm\1/i,/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,/oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i],[[d,/_/g," "],[f,L],[m,b]],[/oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],[[d,/_/g," "],[f,L],[m,w]],[/; (\w+) bui.+ oppo/i,/\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],[d,[f,"OPPO"],[m,b]],[/\b(opd2\d{3}a?) bui/i],[d,[f,"OPPO"],[m,w]],[/vivo (\w+)(?: bui|\))/i,/\b(v[12]\d{3}\w?[at])(?: bui|;)/i],[d,[f,"Vivo"],[m,b]],[/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],[d,[f,"Realme"],[m,b]],[/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,/\bmot(?:orola)?[- ](\w*)/i,/((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i],[d,[f,D],[m,b]],[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],[d,[f,D],[m,w]],[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],[d,[f,"LG"],[m,w]],[/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,/\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,/\blg-?([\d\w]+) bui/i],[d,[f,"LG"],[m,b]],[/(ideatab[-\w ]+)/i,/lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i],[d,[f,"Lenovo"],[m,w]],[/(?:maemo|nokia).*(n900|lumia \d+)/i,/nokia[-_ ]?([-\w\.]*)/i],[[d,/_/g," "],[f,"Nokia"],[m,b]],[/(pixel c)\b/i],[d,[f,N],[m,w]],[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],[d,[f,N],[m,b]],[/droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[d,[f,F],[m,b]],[/sony tablet [ps]/i,/\b(?:sony)?sgp\w+(?: bui|\))/i],[[d,"Xperia Tablet"],[f,F],[m,w]],[/ (kb2005|in20[12]5|be20[12][59])\b/i,/(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],[d,[f,"OnePlus"],[m,b]],[/(alexa)webm/i,/(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,/(kf[a-z]+)( bui|\)).+silk\//i],[d,[f,j],[m,w]],[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],[[d,/(.+)/g,"Fire Phone $1"],[f,j],[m,b]],[/(playbook);[-\w\),; ]+(rim)/i],[d,f,[m,w]],[/\b((?:bb[a-f]|st[hv])100-\d)/i,/\(bb10; (\w+)/i],[d,[f,B],[m,b]],[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],[d,[f,k],[m,w]],[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],[d,[f,k],[m,b]],[/(nexus 9)/i],[d,[f,"HTC"],[m,w]],[/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,/(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i],[f,[d,/_/g," "],[m,b]],[/droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i],[d,[f,"TCL"],[m,w]],[/(itel) ((\w+))/i],[[f,K],d,[m,G,{tablet:["p10001l","w7001"],"*":"mobile"}]],[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],[d,[f,"Acer"],[m,w]],[/droid.+; (m[1-5] note) bui/i,/\bmz-([-\w]{2,})/i],[d,[f,"Meizu"],[m,b]],[/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i],[d,[f,"Ulefone"],[m,b]],[/; (energy ?\w+)(?: bui|\))/i,/; energizer ([\w ]+)(?: bui|\))/i],[d,[f,"Energizer"],[m,b]],[/; cat (b35);/i,/; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i],[d,[f,"Cat"],[m,b]],[/((?:new )?andromax[\w- ]+)(?: bui|\))/i],[d,[f,"Smartfren"],[m,b]],[/droid.+; (a(?:015|06[35]|142p?))/i],[d,[f,"Nothing"],[m,b]],[/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,/; (imo) ((?!tab)[\w ]+?)(?: bui|\))/i,/(hp) ([\w ]+\w)/i,/(asus)-?(\w+)/i,/(microsoft); (lumia[\w ]+)/i,/(lenovo)[-_ ]?([-\w]+)/i,/(jolla)/i,/(oppo) ?([\w ]+) bui/i],[f,d,[m,b]],[/(imo) (tab \w+)/i,/(kobo)\s(ereader|touch)/i,/(archos) (gamepad2?)/i,/(hp).+(touchpad(?!.+tablet)|tablet)/i,/(kindle)\/([\w\.]+)/i,/(nook)[\w ]+build\/(\w+)/i,/(dell) (strea[kpr\d ]*[\dko])/i,/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,/(trinity)[- ]*(t\d{3}) bui/i,/(gigaset)[- ]+(q\w{1,9}) bui/i,/(vodafone) ([\w ]+)(?:\)| bui)/i],[f,d,[m,w]],[/(surface duo)/i],[d,[f,A],[m,w]],[/droid [\d\.]+; (fp\du?)(?: b|\))/i],[d,[f,"Fairphone"],[m,b]],[/(u304aa)/i],[d,[f,"AT&T"],[m,b]],[/\bsie-(\w*)/i],[d,[f,"Siemens"],[m,b]],[/\b(rct\w+) b/i],[d,[f,"RCA"],[m,w]],[/\b(venue[\d ]{2,7}) b/i],[d,[f,"Dell"],[m,w]],[/\b(q(?:mv|ta)\w+) b/i],[d,[f,"Verizon"],[m,w]],[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],[d,[f,"Barnes & Noble"],[m,w]],[/\b(tm\d{3}\w+) b/i],[d,[f,"NuVision"],[m,w]],[/\b(k88) b/i],[d,[f,"ZTE"],[m,w]],[/\b(nx\d{3}j) b/i],[d,[f,"ZTE"],[m,b]],[/\b(gen\d{3}) b.+49h/i],[d,[f,"Swiss"],[m,b]],[/\b(zur\d{3}) b/i],[d,[f,"Swiss"],[m,w]],[/\b((zeki)?tb.*\b) b/i],[d,[f,"Zeki"],[m,w]],[/\b([yr]\d{2}) b/i,/\b(dragon[- ]+touch |dt)(\w{5}) b/i],[[f,"Dragon Touch"],d,[m,w]],[/\b(ns-?\w{0,9}) b/i],[d,[f,"Insignia"],[m,w]],[/\b((nxa|next)-?\w{0,9}) b/i],[d,[f,"NextBook"],[m,w]],[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],[[f,"Voice"],d,[m,b]],[/\b(lvtel\-)?(v1[12]) b/i],[[f,"LvTel"],d,[m,b]],[/\b(ph-1) /i],[d,[f,"Essential"],[m,b]],[/\b(v(100md|700na|7011|917g).*\b) b/i],[d,[f,"Envizen"],[m,w]],[/\b(trio[-\w\. ]+) b/i],[d,[f,"MachSpeed"],[m,w]],[/\btu_(1491) b/i],[d,[f,"Rotor"],[m,w]],[/(shield[\w ]+) b/i],[d,[f,"Nvidia"],[m,w]],[/(sprint) (\w+)/i],[f,d,[m,b]],[/(kin\.[onetw]{3})/i],[[d,/\./g," "],[f,A],[m,b]],[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],[d,[f,M],[m,w]],[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],[d,[f,M],[m,b]],[/smart-tv.+(samsung)/i],[f,[m,y]],[/hbbtv.+maple;(\d+)/i],[[d,/^/,"SmartTV"],[f,O],[m,y]],[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],[[f,"LG"],[m,y]],[/(apple) ?tv/i],[f,[d,E+" TV"],[m,y]],[/crkey/i],[[d,T+"cast"],[f,N],[m,y]],[/droid.+aft(\w+)( bui|\))/i],[d,[f,j],[m,y]],[/\(dtv[\);].+(aquos)/i,/(aquos-tv[\w ]+)\)/i],[d,[f,_],[m,y]],[/(bravia[\w ]+)( bui|\))/i],[d,[f,F],[m,y]],[/(mitv-\w{5}) bui/i],[d,[f,L],[m,y]],[/Hbbtv.*(technisat) (.*);/i],[f,d,[m,y]],[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,/hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i],[[f,V],[d,V],[m,y]],[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],[[m,y]],[/(ouya)/i,/(nintendo) ([wids3utch]+)/i],[f,d,[m,v]],[/droid.+; (shield) bui/i],[d,[f,"Nvidia"],[m,v]],[/(playstation [345portablevi]+)/i],[d,[f,F],[m,v]],[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],[d,[f,A],[m,v]],[/\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i],[d,[f,O],[m,C]],[/((pebble))app/i],[f,d,[m,C]],[/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],[d,[f,E],[m,C]],[/droid.+; (glass) \d/i],[d,[f,N],[m,C]],[/droid.+; (wt63?0{2,3})\)/i],[d,[f,M],[m,C]],[/droid.+; (glass) \d/i],[d,[f,N],[m,C]],[/(pico) (4|neo3(?: link|pro)?)/i],[f,d,[m,C]],[/; (quest( \d| pro)?)/i],[d,[f,U],[m,C]],[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],[f,[m,x]],[/(aeobc)\b/i],[d,[f,j],[m,x]],[/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i],[d,[m,b]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],[d,[m,w]],[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],[[m,w]],[/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],[[m,b]],[/(android[-\w\. ]{0,9});.+buil/i],[d,[f,"Generic"]]],engine:[[/windows.+ edge\/([\w\.]+)/i],[h,[p,"EdgeHTML"]],[/(arkweb)\/([\w\.]+)/i],[p,h],[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],[h,[p,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,/ekioh(flow)\/([\w\.]+)/i,/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,/(icab)[\/ ]([23]\.[\d\.]+)/i,/\b(libweb)/i],[p,h],[/rv\:([\w\.]{1,9})\b.+(gecko)/i],[h,p]],os:[[/microsoft (windows) (vista|xp)/i],[p,h],[/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i],[p,[h,G,Z]],[/windows nt 6\.2; (arm)/i,/windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,/(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i],[[h,G,Z],[p,"Windows"]],[/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,/(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,/cfnetwork\/.+darwin/i],[[h,/_/g,"."],[p,"iOS"]],[/(mac os x) ?([\w\. ]*)/i,/(macintosh|mac_powerpc\b)(?!.+haiku)/i],[[p,q],[h,/_/g,"."]],[/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],[h,p],[/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish|openharmony)[-\/ ]?([\w\.]*)/i,/(blackberry)\w*\/([\w\.]*)/i,/(tizen|kaios)[\/ ]([\w\.]+)/i,/\((series40);/i],[p,h],[/\(bb(10);/i],[h,[p,B]],[/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],[h,[p,"Symbian"]],[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],[h,[p,R+" OS"]],[/web0s;.+rt(tv)/i,/\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],[h,[p,"webOS"]],[/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],[h,[p,"watchOS"]],[/crkey\/([\d\.]+)/i],[h,[p,T+"cast"]],[/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],[[p,P],h],[/panasonic;(viera)/i,/(netrange)mmh/i,/(nettv)\/(\d+\.[\w\.]+)/i,/(nintendo|playstation) ([wids345portablevuch]+)/i,/(xbox); +xbox ([^\);]+)/i,/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,/(mint)[\/\(\) ]?(\w*)/i,/(mageia|vectorlinux)[; ]/i,/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,/(hurd|linux) ?([\w\.]*)/i,/(gnu) ?([\w\.]*)/i,/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,/(haiku) (\w+)/i],[p,h],[/(sunos) ?([\w\.\d]*)/i],[[p,"Solaris"],h],[/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,/(unix) ?([\w\.]*)/i],[p,h]]},J=function(e,t){if(typeof e===s&&(t=e,e=o),!(this instanceof J))return new J(e,t).getResult();var n=typeof r!==l&&r.navigator?r.navigator:o,a=e||(n&&n.userAgent?n.userAgent:""),v=n&&n.userAgentData?n.userAgentData:o,y=t?$(Q,t):Q,C=n&&n.userAgent==a;return this.getBrowser=function(){var e,t={};return t[p]=o,t[h]=o,X.call(t,a,y.browser),t[u]=typeof(e=t[h])===c?e.replace(/[^\d\.]/g,"").split(".")[0]:o,C&&n&&n.brave&&typeof n.brave.isBrave==i&&(t[p]="Brave"),t},this.getCPU=function(){var e={};return e[g]=o,X.call(e,a,y.cpu),e},this.getDevice=function(){var e={};return e[f]=o,e[d]=o,e[m]=o,X.call(e,a,y.device),C&&!e[m]&&v&&v.mobile&&(e[m]=b),C&&"Macintosh"==e[d]&&n&&typeof n.standalone!==l&&n.maxTouchPoints&&n.maxTouchPoints>2&&(e[d]="iPad",e[m]=w),e},this.getEngine=function(){var e={};return e[p]=o,e[h]=o,X.call(e,a,y.engine),e},this.getOS=function(){var e={};return e[p]=o,e[h]=o,X.call(e,a,y.os),C&&!e[p]&&v&&v.platform&&"Unknown"!=v.platform&&(e[p]=v.platform.replace(/chrome os/i,P).replace(/macos/i,q)),e},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return a},this.setUA=function(e){return a=typeof e===c&&e.length>500?V(e,500):e,this},this.setUA(a),this};J.VERSION="1.0.40",J.BROWSER=H([p,h,u]),J.CPU=H([g]),J.DEVICE=H([d,f,m,v,b,y,w,C,x]),J.ENGINE=J.OS=H([p,h]),typeof t!==l?(e.exports&&(t=e.exports=J),t.UAParser=J):n.amdO?o===(a=(function(){return J}).call(t,n,t,e))||(e.exports=a):typeof r!==l&&(r.UAParser=J);var ee=typeof r!==l&&(r.jQuery||r.Zepto);if(ee&&!ee.ua){var et=new J;ee.ua=et.getResult(),ee.ua.get=function(){return et.getUA()},ee.ua.set=function(e){et.setUA(e);var t=et.getResult();for(var n in t)ee.ua[n]=t[n]}}}("object"==typeof window?window:this)},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21204:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>a});let a=(0,n(12907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/alexalaniz/Downloads/bitape-ui/src/app/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/alexalaniz/Downloads/bitape-ui/src/app/page.tsx","default")},21820:e=>{"use strict";e.exports=require("os")},23463:(e,t)=>{let n="\x1b[37m",a="\x1b[30m",r="\x1b[0m",o="\x1b[47m"+a,i="\x1b[40m"+n,l=function(e,t,n,a){let r=t+1;return n>=r||a>=r||a<-1||n<-1?"0":n>=t||a>=t||a<0||n<0?"1":e[a*t+n]?"2":"1"},s=function(e,t,n,a){return l(e,t,n,a)+l(e,t,n,a+1)};t.render=function(e,t,l){var c,u;let d=e.modules.size,p=e.modules.data,m=!!(t&&t.inverse),f=t&&t.inverse?i:o,h={"00":r+" "+f,"01":r+(c=m?a:n)+"▄"+f,"02":r+(u=m?n:a)+"▄"+f,10:r+c+"▀"+f,11:" ",12:"▄",20:r+u+"▀"+f,21:"▀",22:"█"},g=r+"\n"+f,v=f;for(let e=-1;e<d+1;e+=2){for(let t=-1;t<d;t++)v+=h[s(p,d,t,e)];v+=h[s(p,d,d,e)]+g}return v+=r,"function"==typeof l&&l(null,v),v}},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},29510:(e,t,n)=>{Promise.resolve().then(n.bind(n,65503))},30405:(e,t)=>{t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};let n={N1:3,N2:3,N3:40,N4:10};t.isValid=function(e){return null!=e&&""!==e&&!isNaN(e)&&e>=0&&e<=7},t.from=function(e){return t.isValid(e)?parseInt(e,10):void 0},t.getPenaltyN1=function(e){let t=e.size,a=0,r=0,o=0,i=null,l=null;for(let s=0;s<t;s++){r=o=0,i=l=null;for(let c=0;c<t;c++){let t=e.get(s,c);t===i?r++:(r>=5&&(a+=n.N1+(r-5)),i=t,r=1),(t=e.get(c,s))===l?o++:(o>=5&&(a+=n.N1+(o-5)),l=t,o=1)}r>=5&&(a+=n.N1+(r-5)),o>=5&&(a+=n.N1+(o-5))}return a},t.getPenaltyN2=function(e){let t=e.size,a=0;for(let n=0;n<t-1;n++)for(let r=0;r<t-1;r++){let t=e.get(n,r)+e.get(n,r+1)+e.get(n+1,r)+e.get(n+1,r+1);(4===t||0===t)&&a++}return a*n.N2},t.getPenaltyN3=function(e){let t=e.size,a=0,r=0,o=0;for(let n=0;n<t;n++){r=o=0;for(let i=0;i<t;i++)r=r<<1&2047|e.get(n,i),i>=10&&(1488===r||93===r)&&a++,o=o<<1&2047|e.get(i,n),i>=10&&(1488===o||93===o)&&a++}return a*n.N3},t.getPenaltyN4=function(e){let t=0,a=e.data.length;for(let n=0;n<a;n++)t+=e.data[n];return Math.abs(Math.ceil(100*t/a/5)-10)*n.N4},t.applyMask=function(e,n){let a=n.size;for(let r=0;r<a;r++)for(let o=0;o<a;o++)n.isReserved(o,r)||n.xor(o,r,function(e,n,a){switch(e){case t.Patterns.PATTERN000:return(n+a)%2==0;case t.Patterns.PATTERN001:return n%2==0;case t.Patterns.PATTERN010:return a%3==0;case t.Patterns.PATTERN011:return(n+a)%3==0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(a/3))%2==0;case t.Patterns.PATTERN101:return n*a%2+n*a%3==0;case t.Patterns.PATTERN110:return(n*a%2+n*a%3)%2==0;case t.Patterns.PATTERN111:return(n*a%3+(n+a)%2)%2==0;default:throw Error("bad maskPattern:"+e)}}(e,o,r))},t.getBestMask=function(e,n){let a=Object.keys(t.Patterns).length,r=0,o=1/0;for(let i=0;i<a;i++){n(i),t.applyMask(i,e);let a=t.getPenaltyN1(e)+t.getPenaltyN2(e)+t.getPenaltyN3(e)+t.getPenaltyN4(e);t.applyMask(i,e),a<o&&(o=a,r=i)}return r}},30501:(e,t,n)=>{let a=n(74284);function r(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}r.prototype.initialize=function(e){this.degree=e,this.genPoly=a.generateECPolynomial(this.degree)},r.prototype.encode=function(e){if(!this.genPoly)throw Error("Encoder not initialized");let t=new Uint8Array(e.length+this.degree);t.set(e);let n=a.mod(t,this.genPoly),r=this.degree-n.length;if(r>0){let e=new Uint8Array(this.degree);return e.set(n,r),e}return n},e.exports=r},31270:e=>{function t(){this.buffer=[],this.length=0}t.prototype={get:function(e){let t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)==1},put:function(e,t){for(let n=0;n<t;n++)this.putBit((e>>>t-n-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(e){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},e.exports=t},31344:(e,t,n)=>{let a=n(95061),r=n(31761),o=n(2044),i=n(56953),l=n(95525),s=a.getBCHDigit(7973);function c(e,t){return i.getCharCountIndicator(e,t)+4}t.from=function(e,t){return l.isValid(e)?parseInt(e,10):t},t.getCapacity=function(e,t,n){if(!l.isValid(e))throw Error("Invalid QR Code version");void 0===n&&(n=i.BYTE);let o=(a.getSymbolTotalCodewords(e)-r.getTotalCodewordsCount(e,t))*8;if(n===i.MIXED)return o;let s=o-c(n,e);switch(n){case i.NUMERIC:return Math.floor(s/10*3);case i.ALPHANUMERIC:return Math.floor(s/11*2);case i.KANJI:return Math.floor(s/13);case i.BYTE:default:return Math.floor(s/8)}},t.getBestVersionForData=function(e,n){let a,r=o.from(n,o.M);if(Array.isArray(e)){if(e.length>1){for(let n=1;n<=40;n++)if(function(e,t){let n=0;return e.forEach(function(e){let a=c(e.mode,t);n+=a+e.getBitsLength()}),n}(e,n)<=t.getCapacity(n,r,i.MIXED))return n;return}if(0===e.length)return 1;a=e[0]}else a=e;return function(e,n,a){for(let r=1;r<=40;r++)if(n<=t.getCapacity(r,a,e))return r}(a.mode,a.getLength(),r)},t.getEncodedBits=function(e){if(!l.isValid(e)||e<7)throw Error("Invalid QR Code version");let t=e<<12;for(;a.getBCHDigit(t)-s>=0;)t^=7973<<a.getBCHDigit(t)-s;return e<<12|t}},31761:(e,t,n)=>{let a=n(2044),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],o=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];t.getBlocksCount=function(e,t){switch(t){case a.L:return r[(e-1)*4+0];case a.M:return r[(e-1)*4+1];case a.Q:return r[(e-1)*4+2];case a.H:return r[(e-1)*4+3];default:return}},t.getTotalCodewordsCount=function(e,t){switch(t){case a.L:return o[(e-1)*4+0];case a.M:return o[(e-1)*4+1];case a.Q:return o[(e-1)*4+2];case a.H:return o[(e-1)*4+3];default:return}}},33873:e=>{"use strict";e.exports=require("path")},34082:(e,t,n)=>{let a=n(2808),r=n(44384),o=n(45150),i=n(7247);function l(e,t,n,o,i){let l=[].slice.call(arguments,1),s=l.length,c="function"==typeof l[s-1];if(!c&&!a())throw Error("Callback required as last argument");if(c){if(s<2)throw Error("Too few arguments provided");2===s?(i=n,n=t,t=o=void 0):3===s&&(t.getContext&&void 0===i?(i=o,o=void 0):(i=o,o=n,n=t,t=void 0))}else{if(s<1)throw Error("Too few arguments provided");return 1===s?(n=t,t=o=void 0):2!==s||t.getContext||(o=n,n=t,t=void 0),new Promise(function(a,i){try{let i=r.create(n,o);a(e(i,t,o))}catch(e){i(e)}})}try{let a=r.create(n,o);i(null,e(a,t,o))}catch(e){i(e)}}r.create,t.toCanvas=l.bind(null,o.render),l.bind(null,o.renderToDataURL),l.bind(null,function(e,t,n){return i.render(e,n)})},41204:e=>{"use strict";e.exports=require("string_decoder")},44384:(e,t,n)=>{let a=n(95061),r=n(2044),o=n(31270),i=n(13521),l=n(65358),s=n(48049),c=n(30405),u=n(31761),d=n(30501),p=n(31344),m=n(89958),f=n(56953),h=n(9304);function g(e,t,n){let a,r,o=e.size,i=m.getEncodedBits(t,n);for(a=0;a<15;a++)r=(i>>a&1)==1,a<6?e.set(a,8,r,!0):a<8?e.set(a+1,8,r,!0):e.set(o-15+a,8,r,!0),a<8?e.set(8,o-a-1,r,!0):a<9?e.set(8,15-a-1+1,r,!0):e.set(8,15-a-1,r,!0);e.set(o-8,8,1,!0)}t.create=function(e,t){let n,m;if(void 0===e||""===e)throw Error("No input text");let v=r.M;return void 0!==t&&(v=r.from(t.errorCorrectionLevel,r.M),n=p.from(t.version),m=c.from(t.maskPattern),t.toSJISFunc&&a.setToSJISFunction(t.toSJISFunc)),function(e,t,n,r){let m;if(Array.isArray(e))m=h.fromArray(e);else if("string"==typeof e){let a=t;if(!a){let t=h.rawSplit(e);a=p.getBestVersionForData(t,n)}m=h.fromString(e,a||40)}else throw Error("Invalid data");let v=p.getBestVersionForData(m,n);if(!v)throw Error("The amount of data is too big to be stored in a QR Code");if(t){if(t<v)throw Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: "+v+".\n")}else t=v;let b=function(e,t,n){let r=new o;n.forEach(function(t){r.put(t.mode.bit,4),r.put(t.getLength(),f.getCharCountIndicator(t.mode,e)),t.write(r)});let i=(a.getSymbolTotalCodewords(e)-u.getTotalCodewordsCount(e,t))*8;for(r.getLengthInBits()+4<=i&&r.put(0,4);r.getLengthInBits()%8!=0;)r.putBit(0);let l=(i-r.getLengthInBits())/8;for(let e=0;e<l;e++)r.put(e%2?17:236,8);return function(e,t,n){let r,o,i=a.getSymbolTotalCodewords(t),l=i-u.getTotalCodewordsCount(t,n),s=u.getBlocksCount(t,n),c=i%s,p=s-c,m=Math.floor(i/s),f=Math.floor(l/s),h=f+1,g=m-f,v=new d(g),b=0,w=Array(s),y=Array(s),C=0,x=new Uint8Array(e.buffer);for(let e=0;e<s;e++){let t=e<p?f:h;w[e]=x.slice(b,b+t),y[e]=v.encode(w[e]),b+=t,C=Math.max(C,t)}let j=new Uint8Array(i),E=0;for(r=0;r<C;r++)for(o=0;o<s;o++)r<w[o].length&&(j[E++]=w[o][r]);for(r=0;r<g;r++)for(o=0;o<s;o++)j[E++]=y[o][r];return j}(r,e,t)}(t,n,m),w=new i(a.getSymbolSize(t));!function(e,t){let n=e.size,a=s.getPositions(t);for(let t=0;t<a.length;t++){let r=a[t][0],o=a[t][1];for(let t=-1;t<=7;t++)if(!(r+t<=-1)&&!(n<=r+t))for(let a=-1;a<=7;a++)o+a<=-1||n<=o+a||(t>=0&&t<=6&&(0===a||6===a)||a>=0&&a<=6&&(0===t||6===t)||t>=2&&t<=4&&a>=2&&a<=4?e.set(r+t,o+a,!0,!0):e.set(r+t,o+a,!1,!0))}}(w,t);let y=w.size;for(let e=8;e<y-8;e++){let t=e%2==0;w.set(e,6,t,!0),w.set(6,e,t,!0)}return!function(e,t){let n=l.getPositions(t);for(let t=0;t<n.length;t++){let a=n[t][0],r=n[t][1];for(let t=-2;t<=2;t++)for(let n=-2;n<=2;n++)-2===t||2===t||-2===n||2===n||0===t&&0===n?e.set(a+t,r+n,!0,!0):e.set(a+t,r+n,!1,!0)}}(w,t),g(w,n,0),t>=7&&function(e,t){let n,a,r,o=e.size,i=p.getEncodedBits(t);for(let t=0;t<18;t++)n=Math.floor(t/3),a=t%3+o-8-3,r=(i>>t&1)==1,e.set(n,a,r,!0),e.set(a,n,r,!0)}(w,t),!function(e,t){let n=e.size,a=-1,r=n-1,o=7,i=0;for(let l=n-1;l>0;l-=2)for(6===l&&l--;;){for(let n=0;n<2;n++)if(!e.isReserved(r,l-n)){let a=!1;i<t.length&&(a=(t[i]>>>o&1)==1),e.set(r,l-n,a),-1==--o&&(i++,o=7)}if((r+=a)<0||n<=r){r-=a,a=-a;break}}}(w,b),isNaN(r)&&(r=c.getBestMask(w,g.bind(null,w,n))),c.applyMask(r,w),g(w,n,r),{modules:w,version:t,errorCorrectionLevel:n,maskPattern:r,segments:m}}(e,n,v,m)}},44862:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>i.a,__next_app__:()=>d,pages:()=>u,routeModule:()=>p,tree:()=>c});var a=n(65239),r=n(48088),o=n(88170),i=n.n(o),l=n(30893),s={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(s[e]=()=>l[e]);n.d(t,s);let c=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,21204)),"/Users/alexalaniz/Downloads/bitape-ui/src/app/page.tsx"]}]},{layout:[()=>Promise.resolve().then(n.bind(n,94431)),"/Users/alexalaniz/Downloads/bitape-ui/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,57398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(n.t.bind(n,89999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(n.t.bind(n,65284,23)),"next/dist/client/components/unauthorized-error"]}],u=["/Users/alexalaniz/Downloads/bitape-ui/src/app/page.tsx"],d={require:n,loadChunk:()=>Promise.resolve()},p=new a.AppPageRouteModule({definition:{kind:r.RouteKind.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},45150:(e,t,n)=>{let a=n(86217);t.render=function(e,t,n){var r;let o=n,i=t;void 0!==o||t&&t.getContext||(o=t,t=void 0),t||(i=function(){try{return document.createElement("canvas")}catch(e){throw Error("You need to specify a canvas element")}}()),o=a.getOptions(o);let l=a.getImageWidth(e.modules.size,o),s=i.getContext("2d"),c=s.createImageData(l,l);return a.qrToImageData(c.data,e,o),r=i,s.clearRect(0,0,r.width,r.height),r.style||(r.style={}),r.height=l,r.width=l,r.style.height=l+"px",r.style.width=l+"px",s.putImageData(c,0,0),i},t.renderToDataURL=function(e,n,a){let r=a;void 0!==r||n&&n.getContext||(r=n,n=void 0),r||(r={});let o=t.render(e,n,r),i=r.type||"image/png",l=r.rendererOpts||{};return o.toDataURL(i,l.quality)}},47526:(e,t,n)=>{t.render=n(7247).render,t.renderToFile=function(e,a,r,o){void 0===o&&(o=r,r=void 0);let i=n(29021),l=t.render(a,r);i.writeFile(e,'<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+l,o)}},48049:(e,t,n)=>{let a=n(95061).getSymbolSize;t.getPositions=function(e){let t=a(e);return[[0,0],[t-7,0],[0,t-7]]}},51655:(e,t)=>{let n="[0-9]+",a="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+",r="(?:(?![A-Z0-9 $%*+\\-./:]|"+(a=a.replace(/u/g,"\\u"))+")(?:.|[\r\n]))+";t.KANJI=RegExp(a,"g"),t.BYTE_KANJI=RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),t.BYTE=RegExp(r,"g"),t.NUMERIC=RegExp(n,"g"),t.ALPHANUMERIC=RegExp("[A-Z $%*+\\-./:]+","g");let o=RegExp("^"+a+"$"),i=RegExp("^"+n+"$"),l=RegExp("^[A-Z0-9 $%*+\\-./:]+$");t.testKanji=function(e){return o.test(e)},t.testNumeric=function(e){return i.test(e)},t.testAlphanumeric=function(e){return l.test(e)}},54522:(e,t,n)=>{let a=n(56953),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function o(e){this.mode=a.ALPHANUMERIC,this.data=e}o.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(e){let t;for(t=0;t+2<=this.data.length;t+=2){let n=45*r.indexOf(this.data[t]);n+=r.indexOf(this.data[t+1]),e.put(n,11)}this.data.length%2&&e.put(r.indexOf(this.data[t]),6)},e.exports=o},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},56953:(e,t,n)=>{let a=n(95525),r=n(51655);t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(e,t){if(!e.ccBits)throw Error("Invalid mode: "+e);if(!a.isValid(t))throw Error("Invalid version: "+t);return t>=1&&t<10?e.ccBits[0]:t<27?e.ccBits[1]:e.ccBits[2]},t.getBestModeForData=function(e){return r.testNumeric(e)?t.NUMERIC:r.testAlphanumeric(e)?t.ALPHANUMERIC:r.testKanji(e)?t.KANJI:t.BYTE},t.toString=function(e){if(e&&e.id)return e.id;throw Error("Invalid mode")},t.isValid=function(e){return e&&e.bit&&e.ccBits},t.from=function(e,n){if(t.isValid(e))return e;try{if("string"!=typeof e)throw Error("Param is not a string");switch(e.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw Error("Unknown mode: "+e)}}catch(e){return n}}},60508:(e,t,n)=>{let a=n(56953),r=n(95061);function o(e){this.mode=a.KANJI,this.data=e}o.getBitsLength=function(e){return 13*e},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(e){let t;for(t=0;t<this.data.length;t++){let n=r.toSJIS(this.data[t]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error("Invalid SJIS character: "+this.data[t]+"\nMake sure your charset is UTF-8");n=(n>>>8&255)*192+(255&n),e.put(n,13)}},e.exports=o},61678:(e,t,n)=>{"use strict";n.d(t,{n:()=>a});var a=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "argent": {
      "qr_code": {
        "step1": {
          "description": "Put Argent on your home screen for faster access to your wallet.",
          "title": "Open the Argent app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "xdefi": {
      "extension": {
        "step1": {
          "title": "Install the XDEFI Wallet extension",
          "description": "We recommend pinning XDEFI Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    }
  }
}
`},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64543:(e,t,n)=>{let a=n(2808),r=n(44384),o=n(80871),i=n(88677),l=n(93798),s=n(47526);function c(e,t,n){if(void 0===e)throw Error("String required as first argument");if(void 0===n&&(n=t,t={}),"function"!=typeof n)if(a())t=n||{},n=null;else throw Error("Callback required as last argument");return{opts:t,cb:n}}function u(e){switch(e){case"svg":return s;case"txt":case"utf8":return i;default:return o}}function d(e,t,n){if(!n.cb)return new Promise(function(a,o){try{let i=r.create(t,n.opts);return e(i,n.opts,function(e,t){return e?o(e):a(t)})}catch(e){o(e)}});try{let a=r.create(t,n.opts);return e(a,n.opts,n.cb)}catch(e){n.cb(e)}}t.create=r.create,t.toCanvas=n(34082).toCanvas,t.toString=function(e,t,n){let a=c(e,t,n);return d(function(e){switch(e){case"svg":return s;case"terminal":return l;default:return i}}(a.opts?a.opts.type:void 0).render,e,a)},t.toDataURL=function(e,t,n){let a=c(e,t,n);return d(u(a.opts.type).renderToDataURL,e,a)},t.toBuffer=function(e,t,n){let a=c(e,t,n);return d(u(a.opts.type).renderToBuffer,e,a)},t.toFile=function(e,t,n,r){if("string"!=typeof e||"string"!=typeof t&&"object"!=typeof t)throw Error("Invalid argument");if(arguments.length<3&&!a())throw Error("Too few arguments provided");let o=c(t,n,r);return d(u(o.opts.type||e.slice((e.lastIndexOf(".")-1>>>0)+2).toLowerCase()).renderToFile.bind(null,e),t,o)},t.toFileStream=function(e,t,n){if(arguments.length<2)throw Error("Too few arguments provided");let a=c(t,n,e.emit.bind(e,"error"));d(u("png").renderToFileStream.bind(null,e),t,a)}},65358:(e,t,n)=>{let a=n(95061).getSymbolSize;t.getRowColCoords=function(e){if(1===e)return[];let t=Math.floor(e/7)+2,n=a(e),r=145===n?26:2*Math.ceil((n-13)/(2*t-2)),o=[n-7];for(let e=1;e<t-1;e++)o[e]=o[e-1]-r;return o.push(6),o.reverse()},t.getPositions=function(e){let n=[],a=t.getRowColCoords(e),r=a.length;for(let e=0;e<r;e++)for(let t=0;t<r;t++)(0!==e||0!==t)&&(0!==e||t!==r-1)&&(e!==r-1||0!==t)&&n.push([a[e],a[t]]);return n}},65503:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>ax});var a,r=n(60687),o=n(89160),i=n(43210),l=n(21578),s=n(85814),c=n.n(s),u=n(30474),d='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',p={rounded:`SFRounded, ui-rounded, "SF Pro Rounded", ${d}`,system:d},m={large:{actionButton:"9999px",connectButton:"12px",modal:"24px",modalMobile:"28px"},medium:{actionButton:"10px",connectButton:"8px",modal:"16px",modalMobile:"18px"},none:{actionButton:"0px",connectButton:"0px",modal:"0px",modalMobile:"0px"},small:{actionButton:"4px",connectButton:"4px",modal:"8px",modalMobile:"8px"}},f={large:{modalOverlay:"blur(20px)"},none:{modalOverlay:"blur(0px)"},small:{modalOverlay:"blur(4px)"}},h=({borderRadius:e="large",fontStack:t="rounded",overlayBlur:n="none"})=>({blurs:{modalOverlay:f[n].modalOverlay},fonts:{body:p[t]},radii:{actionButton:m[e].actionButton,connectButton:m[e].connectButton,menuButton:m[e].connectButton,modal:m[e].modal,modalMobile:m[e].modalMobile}}),g={blue:{accentColor:"#0E76FD",accentColorForeground:"#FFF"},green:{accentColor:"#1DB847",accentColorForeground:"#FFF"},orange:{accentColor:"#FF801F",accentColorForeground:"#FFF"},pink:{accentColor:"#FF5CA0",accentColorForeground:"#FFF"},purple:{accentColor:"#5F5AFA",accentColorForeground:"#FFF"},red:{accentColor:"#FA423C",accentColorForeground:"#FFF"}},v=g.blue,b=({accentColor:e=v.accentColor,accentColorForeground:t=v.accentColorForeground,...n}={})=>({...h(n),colors:{accentColor:e,accentColorForeground:t,actionButtonBorder:"rgba(0, 0, 0, 0.04)",actionButtonBorderMobile:"rgba(0, 0, 0, 0.06)",actionButtonSecondaryBackground:"rgba(0, 0, 0, 0.06)",closeButton:"rgba(60, 66, 66, 0.8)",closeButtonBackground:"rgba(0, 0, 0, 0.06)",connectButtonBackground:"#FFF",connectButtonBackgroundError:"#FF494A",connectButtonInnerBackground:"linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06))",connectButtonText:"#25292E",connectButtonTextError:"#FFF",connectionIndicator:"#30E000",downloadBottomCardBackground:"linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #FFFFFF",downloadTopCardBackground:"linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #FFFFFF",error:"#FF494A",generalBorder:"rgba(0, 0, 0, 0.06)",generalBorderDim:"rgba(0, 0, 0, 0.03)",menuItemBackground:"rgba(60, 66, 66, 0.1)",modalBackdrop:"rgba(0, 0, 0, 0.3)",modalBackground:"#FFF",modalBorder:"transparent",modalText:"#25292E",modalTextDim:"rgba(60, 66, 66, 0.3)",modalTextSecondary:"rgba(60, 66, 66, 0.6)",profileAction:"#FFF",profileActionHover:"rgba(255, 255, 255, 0.5)",profileForeground:"rgba(60, 66, 66, 0.06)",selectedOptionBorder:"rgba(60, 66, 66, 0.1)",standby:"#FFD641"},shadows:{connectButton:"0px 4px 12px rgba(0, 0, 0, 0.1)",dialog:"0px 8px 32px rgba(0, 0, 0, 0.32)",profileDetailsAction:"0px 2px 6px rgba(37, 41, 46, 0.04)",selectedOption:"0px 2px 6px rgba(0, 0, 0, 0.24)",selectedWallet:"0px 2px 6px rgba(0, 0, 0, 0.12)",walletLogo:"0px 2px 16px rgba(0, 0, 0, 0.16)"}});b.accentColors=g;var w=n(61678),y=function(e,t){return Object.defineProperty(e,"__recipe__",{value:t,writable:!1}),e};function C(e){var{conditions:t}=e;if(!t)throw Error("Styles have no conditions");return y(function(e){if("string"==typeof e||"number"==typeof e||"boolean"==typeof e){if(!t.defaultCondition)throw Error("No default condition");return{[t.defaultCondition]:e}}if(Array.isArray(e)){if(!("responsiveArray"in t))throw Error("Responsive arrays are not supported");var n={};for(var a in t.responsiveArray)null!=e[a]&&(n[t.responsiveArray[a]]=e[a]);return n}return e},{importPath:"@vanilla-extract/sprinkles/createUtils",importName:"createNormalizeValueFn",args:[{conditions:e.conditions}]})}function x(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,a)}return n}function j(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?x(Object(n),!0).forEach(function(t){!function(e,t,n){var a;(t="symbol"==typeof(a=function(e,t){if("object"!=typeof e||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var a=n.call(e,t||"default");if("object"!=typeof a)return a;throw TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(t,"string"))?a:String(a))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):x(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var E=e=>function(){for(var t=arguments.length,n=Array(t),a=0;a<t;a++)n[a]=arguments[a];var r=Object.assign({},...n.map(e=>e.styles)),o=Object.keys(r),i=o.filter(e=>"mappings"in r[e]);return Object.assign(t=>{var n=[],a={},o=j({},t),l=!1;for(var s of i){var c=t[s];if(null!=c)for(var u of(l=!0,r[s].mappings))a[u]=c,null==o[u]&&delete o[u]}var d=l?j(j({},a),o):t;for(var p in d)if(function(){var e=d[p],t=r[p];try{if(t.mappings)return 1;if("string"==typeof e||"number"==typeof e)n.push(t.values[e].defaultClass);else if(Array.isArray(e))for(var a=0;a<e.length;a++){var o=e[a];if(null!=o){var i=t.responsiveArray[a];n.push(t.values[o].conditions[i])}}else for(var l in e){var s=e[l];null!=s&&n.push(t.values[s].conditions[l])}}catch(e){throw e}}())continue;return e(n.join(" "))},{properties:new Set(o)})},k=e=>e;let B=function(){for(var e,t,n=0,a="",r=arguments.length;n<r;n++)(e=arguments[n])&&(t=function e(t){var n,a,r="";if("string"==typeof t||"number"==typeof t)r+=t;else if("object"==typeof t)if(Array.isArray(t)){var o=t.length;for(n=0;n<o;n++)t[n]&&(a=e(t[n]))&&(r&&(r+=" "),r+=a)}else for(a in t)t[a]&&(r&&(r+=" "),r+=a);return r}(e))&&(a&&(a+=" "),a+=t);return a};var I=n(29140),T=n(6996),R=n(34704),N=n(86405),S=n(30038),A=n(57334),D=n(50956),W=n(3798),O=n(29494),_=n(36962),F=n(55925);n(51215);var L=n(54050),M=n(49138),U=n(90319),P=n(94588);let q=[];function z(e){let t=e.connectors;return(0,P.b)(q,t)?q:(q=t,t)}var $=n(18567),H=n(4018);n(94736);var Y=function(e){var{conditions:t}=e;if(!t)throw Error("Styles have no conditions");var n=C(e);return y(function(e,a){if("string"==typeof e||"number"==typeof e||"boolean"==typeof e){if(!t.defaultCondition)throw Error("No default condition");return a(e,t.defaultCondition)}var r=Array.isArray(e)?n(e):e,o={};for(var i in r)null!=r[i]&&(o[i]=a(r[i],i));return o},{importPath:"@vanilla-extract/sprinkles/createUtils",importName:"createMapValueFn",args:[{conditions:e.conditions}]})}({conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0}}),K=C({conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0}}),V=function(){return E(k)(...arguments)}({conditions:{defaultCondition:"base",conditionNames:["base","hover","active"],responsiveArray:void 0},styles:{background:{values:{accentColor:{conditions:{base:"ju367v9i",hover:"ju367v9j",active:"ju367v9k"},defaultClass:"ju367v9i"},accentColorForeground:{conditions:{base:"ju367v9l",hover:"ju367v9m",active:"ju367v9n"},defaultClass:"ju367v9l"},actionButtonBorder:{conditions:{base:"ju367v9o",hover:"ju367v9p",active:"ju367v9q"},defaultClass:"ju367v9o"},actionButtonBorderMobile:{conditions:{base:"ju367v9r",hover:"ju367v9s",active:"ju367v9t"},defaultClass:"ju367v9r"},actionButtonSecondaryBackground:{conditions:{base:"ju367v9u",hover:"ju367v9v",active:"ju367v9w"},defaultClass:"ju367v9u"},closeButton:{conditions:{base:"ju367v9x",hover:"ju367v9y",active:"ju367v9z"},defaultClass:"ju367v9x"},closeButtonBackground:{conditions:{base:"ju367va0",hover:"ju367va1",active:"ju367va2"},defaultClass:"ju367va0"},connectButtonBackground:{conditions:{base:"ju367va3",hover:"ju367va4",active:"ju367va5"},defaultClass:"ju367va3"},connectButtonBackgroundError:{conditions:{base:"ju367va6",hover:"ju367va7",active:"ju367va8"},defaultClass:"ju367va6"},connectButtonInnerBackground:{conditions:{base:"ju367va9",hover:"ju367vaa",active:"ju367vab"},defaultClass:"ju367va9"},connectButtonText:{conditions:{base:"ju367vac",hover:"ju367vad",active:"ju367vae"},defaultClass:"ju367vac"},connectButtonTextError:{conditions:{base:"ju367vaf",hover:"ju367vag",active:"ju367vah"},defaultClass:"ju367vaf"},connectionIndicator:{conditions:{base:"ju367vai",hover:"ju367vaj",active:"ju367vak"},defaultClass:"ju367vai"},downloadBottomCardBackground:{conditions:{base:"ju367val",hover:"ju367vam",active:"ju367van"},defaultClass:"ju367val"},downloadTopCardBackground:{conditions:{base:"ju367vao",hover:"ju367vap",active:"ju367vaq"},defaultClass:"ju367vao"},error:{conditions:{base:"ju367var",hover:"ju367vas",active:"ju367vat"},defaultClass:"ju367var"},generalBorder:{conditions:{base:"ju367vau",hover:"ju367vav",active:"ju367vaw"},defaultClass:"ju367vau"},generalBorderDim:{conditions:{base:"ju367vax",hover:"ju367vay",active:"ju367vaz"},defaultClass:"ju367vax"},menuItemBackground:{conditions:{base:"ju367vb0",hover:"ju367vb1",active:"ju367vb2"},defaultClass:"ju367vb0"},modalBackdrop:{conditions:{base:"ju367vb3",hover:"ju367vb4",active:"ju367vb5"},defaultClass:"ju367vb3"},modalBackground:{conditions:{base:"ju367vb6",hover:"ju367vb7",active:"ju367vb8"},defaultClass:"ju367vb6"},modalBorder:{conditions:{base:"ju367vb9",hover:"ju367vba",active:"ju367vbb"},defaultClass:"ju367vb9"},modalText:{conditions:{base:"ju367vbc",hover:"ju367vbd",active:"ju367vbe"},defaultClass:"ju367vbc"},modalTextDim:{conditions:{base:"ju367vbf",hover:"ju367vbg",active:"ju367vbh"},defaultClass:"ju367vbf"},modalTextSecondary:{conditions:{base:"ju367vbi",hover:"ju367vbj",active:"ju367vbk"},defaultClass:"ju367vbi"},profileAction:{conditions:{base:"ju367vbl",hover:"ju367vbm",active:"ju367vbn"},defaultClass:"ju367vbl"},profileActionHover:{conditions:{base:"ju367vbo",hover:"ju367vbp",active:"ju367vbq"},defaultClass:"ju367vbo"},profileForeground:{conditions:{base:"ju367vbr",hover:"ju367vbs",active:"ju367vbt"},defaultClass:"ju367vbr"},selectedOptionBorder:{conditions:{base:"ju367vbu",hover:"ju367vbv",active:"ju367vbw"},defaultClass:"ju367vbu"},standby:{conditions:{base:"ju367vbx",hover:"ju367vby",active:"ju367vbz"},defaultClass:"ju367vbx"}}},borderColor:{values:{accentColor:{conditions:{base:"ju367vc0",hover:"ju367vc1",active:"ju367vc2"},defaultClass:"ju367vc0"},accentColorForeground:{conditions:{base:"ju367vc3",hover:"ju367vc4",active:"ju367vc5"},defaultClass:"ju367vc3"},actionButtonBorder:{conditions:{base:"ju367vc6",hover:"ju367vc7",active:"ju367vc8"},defaultClass:"ju367vc6"},actionButtonBorderMobile:{conditions:{base:"ju367vc9",hover:"ju367vca",active:"ju367vcb"},defaultClass:"ju367vc9"},actionButtonSecondaryBackground:{conditions:{base:"ju367vcc",hover:"ju367vcd",active:"ju367vce"},defaultClass:"ju367vcc"},closeButton:{conditions:{base:"ju367vcf",hover:"ju367vcg",active:"ju367vch"},defaultClass:"ju367vcf"},closeButtonBackground:{conditions:{base:"ju367vci",hover:"ju367vcj",active:"ju367vck"},defaultClass:"ju367vci"},connectButtonBackground:{conditions:{base:"ju367vcl",hover:"ju367vcm",active:"ju367vcn"},defaultClass:"ju367vcl"},connectButtonBackgroundError:{conditions:{base:"ju367vco",hover:"ju367vcp",active:"ju367vcq"},defaultClass:"ju367vco"},connectButtonInnerBackground:{conditions:{base:"ju367vcr",hover:"ju367vcs",active:"ju367vct"},defaultClass:"ju367vcr"},connectButtonText:{conditions:{base:"ju367vcu",hover:"ju367vcv",active:"ju367vcw"},defaultClass:"ju367vcu"},connectButtonTextError:{conditions:{base:"ju367vcx",hover:"ju367vcy",active:"ju367vcz"},defaultClass:"ju367vcx"},connectionIndicator:{conditions:{base:"ju367vd0",hover:"ju367vd1",active:"ju367vd2"},defaultClass:"ju367vd0"},downloadBottomCardBackground:{conditions:{base:"ju367vd3",hover:"ju367vd4",active:"ju367vd5"},defaultClass:"ju367vd3"},downloadTopCardBackground:{conditions:{base:"ju367vd6",hover:"ju367vd7",active:"ju367vd8"},defaultClass:"ju367vd6"},error:{conditions:{base:"ju367vd9",hover:"ju367vda",active:"ju367vdb"},defaultClass:"ju367vd9"},generalBorder:{conditions:{base:"ju367vdc",hover:"ju367vdd",active:"ju367vde"},defaultClass:"ju367vdc"},generalBorderDim:{conditions:{base:"ju367vdf",hover:"ju367vdg",active:"ju367vdh"},defaultClass:"ju367vdf"},menuItemBackground:{conditions:{base:"ju367vdi",hover:"ju367vdj",active:"ju367vdk"},defaultClass:"ju367vdi"},modalBackdrop:{conditions:{base:"ju367vdl",hover:"ju367vdm",active:"ju367vdn"},defaultClass:"ju367vdl"},modalBackground:{conditions:{base:"ju367vdo",hover:"ju367vdp",active:"ju367vdq"},defaultClass:"ju367vdo"},modalBorder:{conditions:{base:"ju367vdr",hover:"ju367vds",active:"ju367vdt"},defaultClass:"ju367vdr"},modalText:{conditions:{base:"ju367vdu",hover:"ju367vdv",active:"ju367vdw"},defaultClass:"ju367vdu"},modalTextDim:{conditions:{base:"ju367vdx",hover:"ju367vdy",active:"ju367vdz"},defaultClass:"ju367vdx"},modalTextSecondary:{conditions:{base:"ju367ve0",hover:"ju367ve1",active:"ju367ve2"},defaultClass:"ju367ve0"},profileAction:{conditions:{base:"ju367ve3",hover:"ju367ve4",active:"ju367ve5"},defaultClass:"ju367ve3"},profileActionHover:{conditions:{base:"ju367ve6",hover:"ju367ve7",active:"ju367ve8"},defaultClass:"ju367ve6"},profileForeground:{conditions:{base:"ju367ve9",hover:"ju367vea",active:"ju367veb"},defaultClass:"ju367ve9"},selectedOptionBorder:{conditions:{base:"ju367vec",hover:"ju367ved",active:"ju367vee"},defaultClass:"ju367vec"},standby:{conditions:{base:"ju367vef",hover:"ju367veg",active:"ju367veh"},defaultClass:"ju367vef"}}},boxShadow:{values:{connectButton:{conditions:{base:"ju367vei",hover:"ju367vej",active:"ju367vek"},defaultClass:"ju367vei"},dialog:{conditions:{base:"ju367vel",hover:"ju367vem",active:"ju367ven"},defaultClass:"ju367vel"},profileDetailsAction:{conditions:{base:"ju367veo",hover:"ju367vep",active:"ju367veq"},defaultClass:"ju367veo"},selectedOption:{conditions:{base:"ju367ver",hover:"ju367ves",active:"ju367vet"},defaultClass:"ju367ver"},selectedWallet:{conditions:{base:"ju367veu",hover:"ju367vev",active:"ju367vew"},defaultClass:"ju367veu"},walletLogo:{conditions:{base:"ju367vex",hover:"ju367vey",active:"ju367vez"},defaultClass:"ju367vex"}}},color:{values:{accentColor:{conditions:{base:"ju367vf0",hover:"ju367vf1",active:"ju367vf2"},defaultClass:"ju367vf0"},accentColorForeground:{conditions:{base:"ju367vf3",hover:"ju367vf4",active:"ju367vf5"},defaultClass:"ju367vf3"},actionButtonBorder:{conditions:{base:"ju367vf6",hover:"ju367vf7",active:"ju367vf8"},defaultClass:"ju367vf6"},actionButtonBorderMobile:{conditions:{base:"ju367vf9",hover:"ju367vfa",active:"ju367vfb"},defaultClass:"ju367vf9"},actionButtonSecondaryBackground:{conditions:{base:"ju367vfc",hover:"ju367vfd",active:"ju367vfe"},defaultClass:"ju367vfc"},closeButton:{conditions:{base:"ju367vff",hover:"ju367vfg",active:"ju367vfh"},defaultClass:"ju367vff"},closeButtonBackground:{conditions:{base:"ju367vfi",hover:"ju367vfj",active:"ju367vfk"},defaultClass:"ju367vfi"},connectButtonBackground:{conditions:{base:"ju367vfl",hover:"ju367vfm",active:"ju367vfn"},defaultClass:"ju367vfl"},connectButtonBackgroundError:{conditions:{base:"ju367vfo",hover:"ju367vfp",active:"ju367vfq"},defaultClass:"ju367vfo"},connectButtonInnerBackground:{conditions:{base:"ju367vfr",hover:"ju367vfs",active:"ju367vft"},defaultClass:"ju367vfr"},connectButtonText:{conditions:{base:"ju367vfu",hover:"ju367vfv",active:"ju367vfw"},defaultClass:"ju367vfu"},connectButtonTextError:{conditions:{base:"ju367vfx",hover:"ju367vfy",active:"ju367vfz"},defaultClass:"ju367vfx"},connectionIndicator:{conditions:{base:"ju367vg0",hover:"ju367vg1",active:"ju367vg2"},defaultClass:"ju367vg0"},downloadBottomCardBackground:{conditions:{base:"ju367vg3",hover:"ju367vg4",active:"ju367vg5"},defaultClass:"ju367vg3"},downloadTopCardBackground:{conditions:{base:"ju367vg6",hover:"ju367vg7",active:"ju367vg8"},defaultClass:"ju367vg6"},error:{conditions:{base:"ju367vg9",hover:"ju367vga",active:"ju367vgb"},defaultClass:"ju367vg9"},generalBorder:{conditions:{base:"ju367vgc",hover:"ju367vgd",active:"ju367vge"},defaultClass:"ju367vgc"},generalBorderDim:{conditions:{base:"ju367vgf",hover:"ju367vgg",active:"ju367vgh"},defaultClass:"ju367vgf"},menuItemBackground:{conditions:{base:"ju367vgi",hover:"ju367vgj",active:"ju367vgk"},defaultClass:"ju367vgi"},modalBackdrop:{conditions:{base:"ju367vgl",hover:"ju367vgm",active:"ju367vgn"},defaultClass:"ju367vgl"},modalBackground:{conditions:{base:"ju367vgo",hover:"ju367vgp",active:"ju367vgq"},defaultClass:"ju367vgo"},modalBorder:{conditions:{base:"ju367vgr",hover:"ju367vgs",active:"ju367vgt"},defaultClass:"ju367vgr"},modalText:{conditions:{base:"ju367vgu",hover:"ju367vgv",active:"ju367vgw"},defaultClass:"ju367vgu"},modalTextDim:{conditions:{base:"ju367vgx",hover:"ju367vgy",active:"ju367vgz"},defaultClass:"ju367vgx"},modalTextSecondary:{conditions:{base:"ju367vh0",hover:"ju367vh1",active:"ju367vh2"},defaultClass:"ju367vh0"},profileAction:{conditions:{base:"ju367vh3",hover:"ju367vh4",active:"ju367vh5"},defaultClass:"ju367vh3"},profileActionHover:{conditions:{base:"ju367vh6",hover:"ju367vh7",active:"ju367vh8"},defaultClass:"ju367vh6"},profileForeground:{conditions:{base:"ju367vh9",hover:"ju367vha",active:"ju367vhb"},defaultClass:"ju367vh9"},selectedOptionBorder:{conditions:{base:"ju367vhc",hover:"ju367vhd",active:"ju367vhe"},defaultClass:"ju367vhc"},standby:{conditions:{base:"ju367vhf",hover:"ju367vhg",active:"ju367vhh"},defaultClass:"ju367vhf"}}}}},{conditions:{defaultCondition:"smallScreen",conditionNames:["smallScreen","largeScreen"],responsiveArray:void 0},styles:{alignItems:{values:{"flex-start":{conditions:{smallScreen:"ju367v0",largeScreen:"ju367v1"},defaultClass:"ju367v0"},"flex-end":{conditions:{smallScreen:"ju367v2",largeScreen:"ju367v3"},defaultClass:"ju367v2"},center:{conditions:{smallScreen:"ju367v4",largeScreen:"ju367v5"},defaultClass:"ju367v4"}}},display:{values:{none:{conditions:{smallScreen:"ju367v6",largeScreen:"ju367v7"},defaultClass:"ju367v6"},block:{conditions:{smallScreen:"ju367v8",largeScreen:"ju367v9"},defaultClass:"ju367v8"},flex:{conditions:{smallScreen:"ju367va",largeScreen:"ju367vb"},defaultClass:"ju367va"},inline:{conditions:{smallScreen:"ju367vc",largeScreen:"ju367vd"},defaultClass:"ju367vc"}}}}},{conditions:void 0,styles:{margin:{mappings:["marginTop","marginBottom","marginLeft","marginRight"]},marginX:{mappings:["marginLeft","marginRight"]},marginY:{mappings:["marginTop","marginBottom"]},padding:{mappings:["paddingTop","paddingBottom","paddingLeft","paddingRight"]},paddingX:{mappings:["paddingLeft","paddingRight"]},paddingY:{mappings:["paddingTop","paddingBottom"]},alignSelf:{values:{"flex-start":{defaultClass:"ju367ve"},"flex-end":{defaultClass:"ju367vf"},center:{defaultClass:"ju367vg"}}},backgroundSize:{values:{cover:{defaultClass:"ju367vh"}}},borderRadius:{values:{1:{defaultClass:"ju367vi"},6:{defaultClass:"ju367vj"},10:{defaultClass:"ju367vk"},13:{defaultClass:"ju367vl"},actionButton:{defaultClass:"ju367vm"},connectButton:{defaultClass:"ju367vn"},menuButton:{defaultClass:"ju367vo"},modal:{defaultClass:"ju367vp"},modalMobile:{defaultClass:"ju367vq"},"25%":{defaultClass:"ju367vr"},full:{defaultClass:"ju367vs"}}},borderStyle:{values:{solid:{defaultClass:"ju367vt"}}},borderWidth:{values:{0:{defaultClass:"ju367vu"},1:{defaultClass:"ju367vv"},2:{defaultClass:"ju367vw"},4:{defaultClass:"ju367vx"}}},cursor:{values:{pointer:{defaultClass:"ju367vy"},none:{defaultClass:"ju367vz"}}},pointerEvents:{values:{none:{defaultClass:"ju367v10"},all:{defaultClass:"ju367v11"}}},minHeight:{values:{8:{defaultClass:"ju367v12"},44:{defaultClass:"ju367v13"}}},flexDirection:{values:{row:{defaultClass:"ju367v14"},column:{defaultClass:"ju367v15"}}},fontFamily:{values:{body:{defaultClass:"ju367v16"}}},fontSize:{values:{12:{defaultClass:"ju367v17"},13:{defaultClass:"ju367v18"},14:{defaultClass:"ju367v19"},16:{defaultClass:"ju367v1a"},18:{defaultClass:"ju367v1b"},20:{defaultClass:"ju367v1c"},23:{defaultClass:"ju367v1d"}}},fontWeight:{values:{regular:{defaultClass:"ju367v1e"},medium:{defaultClass:"ju367v1f"},semibold:{defaultClass:"ju367v1g"},bold:{defaultClass:"ju367v1h"},heavy:{defaultClass:"ju367v1i"}}},gap:{values:{0:{defaultClass:"ju367v1j"},1:{defaultClass:"ju367v1k"},2:{defaultClass:"ju367v1l"},3:{defaultClass:"ju367v1m"},4:{defaultClass:"ju367v1n"},5:{defaultClass:"ju367v1o"},6:{defaultClass:"ju367v1p"},8:{defaultClass:"ju367v1q"},10:{defaultClass:"ju367v1r"},12:{defaultClass:"ju367v1s"},14:{defaultClass:"ju367v1t"},16:{defaultClass:"ju367v1u"},18:{defaultClass:"ju367v1v"},20:{defaultClass:"ju367v1w"},24:{defaultClass:"ju367v1x"},28:{defaultClass:"ju367v1y"},32:{defaultClass:"ju367v1z"},36:{defaultClass:"ju367v20"},44:{defaultClass:"ju367v21"},64:{defaultClass:"ju367v22"},"-1":{defaultClass:"ju367v23"}}},height:{values:{1:{defaultClass:"ju367v24"},2:{defaultClass:"ju367v25"},4:{defaultClass:"ju367v26"},8:{defaultClass:"ju367v27"},12:{defaultClass:"ju367v28"},20:{defaultClass:"ju367v29"},24:{defaultClass:"ju367v2a"},28:{defaultClass:"ju367v2b"},30:{defaultClass:"ju367v2c"},32:{defaultClass:"ju367v2d"},34:{defaultClass:"ju367v2e"},36:{defaultClass:"ju367v2f"},40:{defaultClass:"ju367v2g"},44:{defaultClass:"ju367v2h"},48:{defaultClass:"ju367v2i"},54:{defaultClass:"ju367v2j"},60:{defaultClass:"ju367v2k"},200:{defaultClass:"ju367v2l"},full:{defaultClass:"ju367v2m"},max:{defaultClass:"ju367v2n"}}},justifyContent:{values:{"flex-start":{defaultClass:"ju367v2o"},"flex-end":{defaultClass:"ju367v2p"},center:{defaultClass:"ju367v2q"},"space-between":{defaultClass:"ju367v2r"},"space-around":{defaultClass:"ju367v2s"}}},textAlign:{values:{left:{defaultClass:"ju367v2t"},center:{defaultClass:"ju367v2u"},inherit:{defaultClass:"ju367v2v"}}},marginBottom:{values:{0:{defaultClass:"ju367v2w"},1:{defaultClass:"ju367v2x"},2:{defaultClass:"ju367v2y"},3:{defaultClass:"ju367v2z"},4:{defaultClass:"ju367v30"},5:{defaultClass:"ju367v31"},6:{defaultClass:"ju367v32"},8:{defaultClass:"ju367v33"},10:{defaultClass:"ju367v34"},12:{defaultClass:"ju367v35"},14:{defaultClass:"ju367v36"},16:{defaultClass:"ju367v37"},18:{defaultClass:"ju367v38"},20:{defaultClass:"ju367v39"},24:{defaultClass:"ju367v3a"},28:{defaultClass:"ju367v3b"},32:{defaultClass:"ju367v3c"},36:{defaultClass:"ju367v3d"},44:{defaultClass:"ju367v3e"},64:{defaultClass:"ju367v3f"},"-1":{defaultClass:"ju367v3g"}}},marginLeft:{values:{0:{defaultClass:"ju367v3h"},1:{defaultClass:"ju367v3i"},2:{defaultClass:"ju367v3j"},3:{defaultClass:"ju367v3k"},4:{defaultClass:"ju367v3l"},5:{defaultClass:"ju367v3m"},6:{defaultClass:"ju367v3n"},8:{defaultClass:"ju367v3o"},10:{defaultClass:"ju367v3p"},12:{defaultClass:"ju367v3q"},14:{defaultClass:"ju367v3r"},16:{defaultClass:"ju367v3s"},18:{defaultClass:"ju367v3t"},20:{defaultClass:"ju367v3u"},24:{defaultClass:"ju367v3v"},28:{defaultClass:"ju367v3w"},32:{defaultClass:"ju367v3x"},36:{defaultClass:"ju367v3y"},44:{defaultClass:"ju367v3z"},64:{defaultClass:"ju367v40"},"-1":{defaultClass:"ju367v41"}}},marginRight:{values:{0:{defaultClass:"ju367v42"},1:{defaultClass:"ju367v43"},2:{defaultClass:"ju367v44"},3:{defaultClass:"ju367v45"},4:{defaultClass:"ju367v46"},5:{defaultClass:"ju367v47"},6:{defaultClass:"ju367v48"},8:{defaultClass:"ju367v49"},10:{defaultClass:"ju367v4a"},12:{defaultClass:"ju367v4b"},14:{defaultClass:"ju367v4c"},16:{defaultClass:"ju367v4d"},18:{defaultClass:"ju367v4e"},20:{defaultClass:"ju367v4f"},24:{defaultClass:"ju367v4g"},28:{defaultClass:"ju367v4h"},32:{defaultClass:"ju367v4i"},36:{defaultClass:"ju367v4j"},44:{defaultClass:"ju367v4k"},64:{defaultClass:"ju367v4l"},"-1":{defaultClass:"ju367v4m"}}},marginTop:{values:{0:{defaultClass:"ju367v4n"},1:{defaultClass:"ju367v4o"},2:{defaultClass:"ju367v4p"},3:{defaultClass:"ju367v4q"},4:{defaultClass:"ju367v4r"},5:{defaultClass:"ju367v4s"},6:{defaultClass:"ju367v4t"},8:{defaultClass:"ju367v4u"},10:{defaultClass:"ju367v4v"},12:{defaultClass:"ju367v4w"},14:{defaultClass:"ju367v4x"},16:{defaultClass:"ju367v4y"},18:{defaultClass:"ju367v4z"},20:{defaultClass:"ju367v50"},24:{defaultClass:"ju367v51"},28:{defaultClass:"ju367v52"},32:{defaultClass:"ju367v53"},36:{defaultClass:"ju367v54"},44:{defaultClass:"ju367v55"},64:{defaultClass:"ju367v56"},"-1":{defaultClass:"ju367v57"}}},maxWidth:{values:{1:{defaultClass:"ju367v58"},2:{defaultClass:"ju367v59"},4:{defaultClass:"ju367v5a"},8:{defaultClass:"ju367v5b"},12:{defaultClass:"ju367v5c"},20:{defaultClass:"ju367v5d"},24:{defaultClass:"ju367v5e"},28:{defaultClass:"ju367v5f"},30:{defaultClass:"ju367v5g"},32:{defaultClass:"ju367v5h"},34:{defaultClass:"ju367v5i"},36:{defaultClass:"ju367v5j"},40:{defaultClass:"ju367v5k"},44:{defaultClass:"ju367v5l"},48:{defaultClass:"ju367v5m"},54:{defaultClass:"ju367v5n"},60:{defaultClass:"ju367v5o"},200:{defaultClass:"ju367v5p"},full:{defaultClass:"ju367v5q"},max:{defaultClass:"ju367v5r"}}},minWidth:{values:{1:{defaultClass:"ju367v5s"},2:{defaultClass:"ju367v5t"},4:{defaultClass:"ju367v5u"},8:{defaultClass:"ju367v5v"},12:{defaultClass:"ju367v5w"},20:{defaultClass:"ju367v5x"},24:{defaultClass:"ju367v5y"},28:{defaultClass:"ju367v5z"},30:{defaultClass:"ju367v60"},32:{defaultClass:"ju367v61"},34:{defaultClass:"ju367v62"},36:{defaultClass:"ju367v63"},40:{defaultClass:"ju367v64"},44:{defaultClass:"ju367v65"},48:{defaultClass:"ju367v66"},54:{defaultClass:"ju367v67"},60:{defaultClass:"ju367v68"},200:{defaultClass:"ju367v69"},full:{defaultClass:"ju367v6a"},max:{defaultClass:"ju367v6b"}}},overflow:{values:{hidden:{defaultClass:"ju367v6c"}}},paddingBottom:{values:{0:{defaultClass:"ju367v6d"},1:{defaultClass:"ju367v6e"},2:{defaultClass:"ju367v6f"},3:{defaultClass:"ju367v6g"},4:{defaultClass:"ju367v6h"},5:{defaultClass:"ju367v6i"},6:{defaultClass:"ju367v6j"},8:{defaultClass:"ju367v6k"},10:{defaultClass:"ju367v6l"},12:{defaultClass:"ju367v6m"},14:{defaultClass:"ju367v6n"},16:{defaultClass:"ju367v6o"},18:{defaultClass:"ju367v6p"},20:{defaultClass:"ju367v6q"},24:{defaultClass:"ju367v6r"},28:{defaultClass:"ju367v6s"},32:{defaultClass:"ju367v6t"},36:{defaultClass:"ju367v6u"},44:{defaultClass:"ju367v6v"},64:{defaultClass:"ju367v6w"},"-1":{defaultClass:"ju367v6x"}}},paddingLeft:{values:{0:{defaultClass:"ju367v6y"},1:{defaultClass:"ju367v6z"},2:{defaultClass:"ju367v70"},3:{defaultClass:"ju367v71"},4:{defaultClass:"ju367v72"},5:{defaultClass:"ju367v73"},6:{defaultClass:"ju367v74"},8:{defaultClass:"ju367v75"},10:{defaultClass:"ju367v76"},12:{defaultClass:"ju367v77"},14:{defaultClass:"ju367v78"},16:{defaultClass:"ju367v79"},18:{defaultClass:"ju367v7a"},20:{defaultClass:"ju367v7b"},24:{defaultClass:"ju367v7c"},28:{defaultClass:"ju367v7d"},32:{defaultClass:"ju367v7e"},36:{defaultClass:"ju367v7f"},44:{defaultClass:"ju367v7g"},64:{defaultClass:"ju367v7h"},"-1":{defaultClass:"ju367v7i"}}},paddingRight:{values:{0:{defaultClass:"ju367v7j"},1:{defaultClass:"ju367v7k"},2:{defaultClass:"ju367v7l"},3:{defaultClass:"ju367v7m"},4:{defaultClass:"ju367v7n"},5:{defaultClass:"ju367v7o"},6:{defaultClass:"ju367v7p"},8:{defaultClass:"ju367v7q"},10:{defaultClass:"ju367v7r"},12:{defaultClass:"ju367v7s"},14:{defaultClass:"ju367v7t"},16:{defaultClass:"ju367v7u"},18:{defaultClass:"ju367v7v"},20:{defaultClass:"ju367v7w"},24:{defaultClass:"ju367v7x"},28:{defaultClass:"ju367v7y"},32:{defaultClass:"ju367v7z"},36:{defaultClass:"ju367v80"},44:{defaultClass:"ju367v81"},64:{defaultClass:"ju367v82"},"-1":{defaultClass:"ju367v83"}}},paddingTop:{values:{0:{defaultClass:"ju367v84"},1:{defaultClass:"ju367v85"},2:{defaultClass:"ju367v86"},3:{defaultClass:"ju367v87"},4:{defaultClass:"ju367v88"},5:{defaultClass:"ju367v89"},6:{defaultClass:"ju367v8a"},8:{defaultClass:"ju367v8b"},10:{defaultClass:"ju367v8c"},12:{defaultClass:"ju367v8d"},14:{defaultClass:"ju367v8e"},16:{defaultClass:"ju367v8f"},18:{defaultClass:"ju367v8g"},20:{defaultClass:"ju367v8h"},24:{defaultClass:"ju367v8i"},28:{defaultClass:"ju367v8j"},32:{defaultClass:"ju367v8k"},36:{defaultClass:"ju367v8l"},44:{defaultClass:"ju367v8m"},64:{defaultClass:"ju367v8n"},"-1":{defaultClass:"ju367v8o"}}},position:{values:{absolute:{defaultClass:"ju367v8p"},fixed:{defaultClass:"ju367v8q"},relative:{defaultClass:"ju367v8r"}}},WebkitUserSelect:{values:{none:{defaultClass:"ju367v8s"}}},right:{values:{0:{defaultClass:"ju367v8t"}}},transition:{values:{default:{defaultClass:"ju367v8u"},transform:{defaultClass:"ju367v8v"}}},userSelect:{values:{none:{defaultClass:"ju367v8w"}}},width:{values:{1:{defaultClass:"ju367v8x"},2:{defaultClass:"ju367v8y"},4:{defaultClass:"ju367v8z"},8:{defaultClass:"ju367v90"},12:{defaultClass:"ju367v91"},20:{defaultClass:"ju367v92"},24:{defaultClass:"ju367v93"},28:{defaultClass:"ju367v94"},30:{defaultClass:"ju367v95"},32:{defaultClass:"ju367v96"},34:{defaultClass:"ju367v97"},36:{defaultClass:"ju367v98"},40:{defaultClass:"ju367v99"},44:{defaultClass:"ju367v9a"},48:{defaultClass:"ju367v9b"},54:{defaultClass:"ju367v9c"},60:{defaultClass:"ju367v9d"},200:{defaultClass:"ju367v9e"},full:{defaultClass:"ju367v9f"},max:{defaultClass:"ju367v9g"}}},backdropFilter:{values:{modalOverlay:{defaultClass:"ju367v9h"}}}}}),X={colors:{accentColor:"var(--rk-colors-accentColor)",accentColorForeground:"var(--rk-colors-accentColorForeground)",actionButtonBorder:"var(--rk-colors-actionButtonBorder)",actionButtonBorderMobile:"var(--rk-colors-actionButtonBorderMobile)",actionButtonSecondaryBackground:"var(--rk-colors-actionButtonSecondaryBackground)",closeButton:"var(--rk-colors-closeButton)",closeButtonBackground:"var(--rk-colors-closeButtonBackground)",connectButtonBackground:"var(--rk-colors-connectButtonBackground)",connectButtonBackgroundError:"var(--rk-colors-connectButtonBackgroundError)",connectButtonInnerBackground:"var(--rk-colors-connectButtonInnerBackground)",connectButtonText:"var(--rk-colors-connectButtonText)",connectButtonTextError:"var(--rk-colors-connectButtonTextError)",connectionIndicator:"var(--rk-colors-connectionIndicator)",downloadBottomCardBackground:"var(--rk-colors-downloadBottomCardBackground)",downloadTopCardBackground:"var(--rk-colors-downloadTopCardBackground)",error:"var(--rk-colors-error)",generalBorder:"var(--rk-colors-generalBorder)",generalBorderDim:"var(--rk-colors-generalBorderDim)",menuItemBackground:"var(--rk-colors-menuItemBackground)",modalBackdrop:"var(--rk-colors-modalBackdrop)",modalBackground:"var(--rk-colors-modalBackground)",modalBorder:"var(--rk-colors-modalBorder)",modalText:"var(--rk-colors-modalText)",modalTextDim:"var(--rk-colors-modalTextDim)",modalTextSecondary:"var(--rk-colors-modalTextSecondary)",profileAction:"var(--rk-colors-profileAction)",profileActionHover:"var(--rk-colors-profileActionHover)",profileForeground:"var(--rk-colors-profileForeground)",selectedOptionBorder:"var(--rk-colors-selectedOptionBorder)",standby:"var(--rk-colors-standby)"},fonts:{body:"var(--rk-fonts-body)"},radii:{actionButton:"var(--rk-radii-actionButton)",connectButton:"var(--rk-radii-connectButton)",menuButton:"var(--rk-radii-menuButton)",modal:"var(--rk-radii-modal)",modalMobile:"var(--rk-radii-modalMobile)"},shadows:{connectButton:"var(--rk-shadows-connectButton)",dialog:"var(--rk-shadows-dialog)",profileDetailsAction:"var(--rk-shadows-profileDetailsAction)",selectedOption:"var(--rk-shadows-selectedOption)",selectedWallet:"var(--rk-shadows-selectedWallet)",walletLogo:"var(--rk-shadows-walletLogo)"},blurs:{modalOverlay:"var(--rk-blurs-modalOverlay)"}},G={shrink:"_12cbo8i6",shrinkSm:"_12cbo8i7"},Z={grow:"_12cbo8i4",growLg:"_12cbo8i5"};function Q({active:e,hover:t}){return["_12cbo8i3 ju367v8r",t&&Z[t],G[e]]}var J=(0,i.createContext)(null);function ee(){let e=(0,i.useContext)(J);return e?.status??null}function et(){let e=ee(),{isConnected:t}=(0,o.F)();return t?e&&("loading"===e||"unauthenticated"===e)?e:"connected":"disconnected"}function en(){return"undefined"!=typeof navigator&&/android/i.test(navigator.userAgent)}function ea(){return"undefined"!=typeof navigator&&/iPhone|iPod/.test(navigator.userAgent)||"undefined"!=typeof navigator&&(/iPad/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)}function er(){return en()||ea()}var eo={a:"iekbcca",blockquote:"iekbcc2",button:"iekbcc9",input:"iekbcc8 iekbcc5 iekbcc4",mark:"iekbcc6",ol:"iekbcc1",q:"iekbcc2",select:"iekbcc7 iekbcc5 iekbcc4",table:"iekbcc3",textarea:"iekbcc5 iekbcc4",ul:"iekbcc1"},ei=({reset:e,...t})=>e?B("iekbcc0",eo[e],V(t)):V(t),el=i.forwardRef(({as:e="div",className:t,testId:n,...a},r)=>{let o={},l={};for(let e in a)V.properties.has(e)?o[e]=a[e]:l[e]=a[e];let s=ei({reset:"string"==typeof e?e:"div",...o});return i.createElement(e,{className:B(s,t),...l,"data-testid":n?`rk-${n.replace(/^rk-/,"")}`:void 0,ref:r})});el.displayName="Box";var es=new Map,ec=new Map;async function eu(e){let t=ec.get(e);if(t)return t;let n=async()=>e().then(async t=>(es.set(e,t),t)),a=n().catch(t=>n().catch(t=>{ec.delete(e)}));return ec.set(e,a),a}async function ed(...e){return await Promise.all(e.map(e=>"function"==typeof e?eu(e):e))}function ep(e){let t="function"==typeof e?es.get(e):void 0;return!function(){let[,e]=(0,i.useReducer)(e=>e+1,0)}(),"function"==typeof e?t:e}function em({alt:e,background:t,borderColor:n,borderRadius:a,useAsImage:r,boxShadow:o,height:l,src:s,width:c,testId:u}){let d=ea(),p=ep(s),m=p&&/^http/.test(p),[f,h]=(0,i.useReducer)(()=>!0,!1);return i.createElement(el,{"aria-label":e,borderRadius:a,boxShadow:o,height:"string"==typeof l?l:void 0,overflow:"hidden",position:"relative",role:"img",style:{background:t,height:"number"==typeof l?l:void 0,width:"number"==typeof c?c:void 0},width:"string"==typeof c?c:void 0,testId:u},i.createElement(el,{...m?{"aria-hidden":!0,as:"img",onLoad:h,src:p}:{"aria-hidden":!0,as:"img",src:p},height:"full",position:"absolute",...d?{WebkitUserSelect:"none"}:{},style:{WebkitTouchCallout:"none",transition:"opacity .15s linear",userSelect:"none",...!r&&m?{opacity:+!!f}:{}},width:"full"}),n?i.createElement(el,{..."object"==typeof n&&"custom"in n?{style:{borderColor:n.custom}}:{borderColor:n},borderRadius:a,borderStyle:"solid",borderWidth:"1",height:"full",position:"relative",width:"full"}):null)}var ef=e=>(0,i.useMemo)(()=>`${e}_${Math.round(1e9*Math.random())}`,[e]),eh=({height:e=21,width:t=21})=>{let n=ef("spinner");return i.createElement("svg",{className:"_1luule42",fill:"none",height:e,viewBox:"0 0 21 21",width:t,xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Loading"),i.createElement("clipPath",{id:n},i.createElement("path",{d:"M10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C11.3284 18 12 18.6716 12 19.5C12 20.3284 11.3284 21 10.5 21C4.70101 21 0 16.299 0 10.5C0 4.70101 4.70101 0 10.5 0C16.299 0 21 4.70101 21 10.5C21 11.3284 20.3284 12 19.5 12C18.6716 12 18 11.3284 18 10.5C18 6.35786 14.6421 3 10.5 3Z"})),i.createElement("foreignObject",{clipPath:`url(#${n})`,height:"21",width:"21",x:"0",y:"0"},i.createElement("div",{className:"_1luule43"})))},eg=[{color:"#FC5C54",emoji:"\uD83C\uDF36"},{color:"#FFD95A",emoji:"\uD83E\uDD11"},{color:"#E95D72",emoji:"\uD83D\uDC19"},{color:"#6A87C8",emoji:"\uD83E\uDED0"},{color:"#5FD0F3",emoji:"\uD83D\uDC33"},{color:"#FC5C54",emoji:"\uD83E\uDD36"},{color:"#75C06B",emoji:"\uD83C\uDF32"},{color:"#FFDD86",emoji:"\uD83C\uDF1E"},{color:"#5FC6D4",emoji:"\uD83D\uDC12"},{color:"#FF949A",emoji:"\uD83D\uDC35"},{color:"#FF8024",emoji:"\uD83E\uDD8A"},{color:"#9BA1A4",emoji:"\uD83D\uDC3C"},{color:"#EC66FF",emoji:"\uD83E\uDD84"},{color:"#FF8CBC",emoji:"\uD83D\uDC37"},{color:"#FF9A23",emoji:"\uD83D\uDC27"},{color:"#FF949A",emoji:"\uD83E\uDDA9"},{color:"#C5DADB",emoji:"\uD83D\uDC7D"},{color:"#FC5C54",emoji:"\uD83C\uDF88"},{color:"#FF949A",emoji:"\uD83C\uDF49"},{color:"#FFD95A",emoji:"\uD83C\uDF89"},{color:"#A8CE63",emoji:"\uD83D\uDC32"},{color:"#71ABFF",emoji:"\uD83C\uDF0E"},{color:"#FFE279",emoji:"\uD83C\uDF4A"},{color:"#B6B1B6",emoji:"\uD83D\uDC2D"},{color:"#FF6780",emoji:"\uD83C\uDF63"},{color:"#FFD95A",emoji:"\uD83D\uDC25"},{color:"#A575FF",emoji:"\uD83D\uDC7E"},{color:"#A8CE63",emoji:"\uD83E\uDD66"},{color:"#FC5C54",emoji:"\uD83D\uDC79"},{color:"#FFE279",emoji:"\uD83D\uDE40"},{color:"#5FD0F3",emoji:"⛱"},{color:"#4D82FF",emoji:"⛵️"},{color:"#FFE279",emoji:"\uD83E\uDD73"},{color:"#FF949A",emoji:"\uD83E\uDD2F"},{color:"#FFB35A",emoji:"\uD83E\uDD20"}],ev=(0,i.createContext)(({address:e,ensImage:t,size:n})=>{let[a,r]=(0,i.useState)(!1);(0,i.useEffect)(()=>{if(t){let e=new Image;e.src=t,e.onload=()=>r(!0)}},[t]);let{color:o,emoji:l}=(0,i.useMemo)(()=>(function(e){let t=Math.abs(function(e){let t=0;if(0===e.length)return t;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n)|0;return t}(("string"==typeof e?e:"").toLowerCase())%eg.length);return eg[t??0]})(e),[e]);return t?a?i.createElement(el,{backgroundSize:"cover",borderRadius:"full",position:"absolute",style:{backgroundImage:`url(${t})`,backgroundPosition:"center",height:n,width:n}}):i.createElement(el,{alignItems:"center",backgroundSize:"cover",borderRadius:"full",color:"modalText",display:"flex",justifyContent:"center",position:"absolute",style:{height:n,width:n}},i.createElement(eh,null)):i.createElement(el,{alignItems:"center",display:"flex",justifyContent:"center",overflow:"hidden",style:{...!t&&{backgroundColor:o},height:n,width:n}},l)});function eb({address:e,imageUrl:t,loading:n,size:a}){let r=(0,i.useContext)(ev);return i.createElement(el,{"aria-hidden":!0,borderRadius:"full",overflow:"hidden",position:"relative",style:{height:`${a}px`,width:`${a}px`},userSelect:"none"},i.createElement(el,{alignItems:"center",borderRadius:"full",display:"flex",justifyContent:"center",overflow:"hidden",position:"absolute",style:{fontSize:`${Math.round(.55*a)}px`,height:`${a}px`,transform:n?"scale(0.72)":void 0,transition:".25s ease",transitionDelay:n?void 0:".1s",width:`${a}px`,willChange:"transform"},userSelect:"none"},i.createElement(r,{address:e,ensImage:t,size:a})),n&&i.createElement(el,{color:"accentColor",display:"flex",height:"full",position:"absolute",width:"full"},i.createElement(eh,{height:"100%",width:"100%"})))}var ew=()=>i.createElement("svg",{fill:"none",height:"7",width:"14",xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Dropdown"),i.createElement("path",{d:"M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2.5",xmlns:"http://www.w3.org/2000/svg"})),ey={defaultLocale:"en",locale:"en"},eC=new class{constructor(e){for(let[t,n]of(this.listeners=new Set,this.defaultLocale=ey.defaultLocale,this.enableFallback=!1,this.locale=ey.locale,this.cachedLocales=[],this.translations={},Object.entries(e)))this.cachedLocales=[...this.cachedLocales,t],this.translations={...this.translations,...this.flattenTranslation(n,t)}}missingMessage(e){return`[missing: "${this.locale}.${e}" translation]`}flattenTranslation(e,t){let n={},a=(e,t)=>{for(let r of Object.keys(e)){let o=`${t}.${r}`,i=e[r];"object"==typeof i&&null!==i?a(i,o):n[o]=i}};return a(e,t),n}translateWithReplacements(e,t={}){let n=e;for(let e in t){let a=t[e];n=n.replace(`%{${e}}`,a)}return n}t(e,t,n){let a=`${this.locale}.${e}`,r=this.translations[a];if(!r){if(this.enableFallback){let n=`${this.defaultLocale}.${e}`,a=this.translations[n];if(a)return this.translateWithReplacements(a,t)}return n?.rawKeyIfTranslationMissing?e:this.missingMessage(e)}return this.translateWithReplacements(r,t)}isLocaleCached(e){return this.cachedLocales.includes(e)}updateLocale(e){this.locale=e,this.notifyListeners()}setTranslations(e,t){this.isLocaleCached(e)||(this.cachedLocales=[...this.cachedLocales,e],this.translations={...this.translations,...this.flattenTranslation(t,e)}),this.locale=e,this.notifyListeners()}notifyListeners(){for(let e of this.listeners)e()}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}}({en:JSON.parse(w.n),"en-US":JSON.parse(w.n)});eC.defaultLocale="en-US",eC.locale="en-US",eC.enableFallback=!0;var ex=async e=>{switch(e){case"ar":case"ar-AR":return(await n.e(277).then(n.bind(n,80277))).default;case"de":case"de-DE":return(await n.e(4176).then(n.bind(n,84176))).default;case"en":case"en-US":default:return(await n.e(6301).then(n.bind(n,6301))).default;case"es":case"es-419":return(await n.e(128).then(n.bind(n,30128))).default;case"fr":case"fr-FR":return(await n.e(3327).then(n.bind(n,23327))).default;case"hi":case"hi-IN":return(await n.e(526).then(n.bind(n,60526))).default;case"id":case"id-ID":return(await n.e(4817).then(n.bind(n,24817))).default;case"ja":case"ja-JP":return(await n.e(6711).then(n.bind(n,56711))).default;case"ko":case"ko-KR":return(await n.e(2418).then(n.bind(n,82418))).default;case"ms":case"ms-MY":return(await n.e(376).then(n.bind(n,70376))).default;case"pt":case"pt-BR":return(await n.e(4663).then(n.bind(n,14663))).default;case"ru":case"ru-RU":return(await n.e(3538).then(n.bind(n,73538))).default;case"th":case"th-TH":return(await n.e(4922).then(n.bind(n,64922))).default;case"tr":case"tr-TR":return(await n.e(8021).then(n.bind(n,18021))).default;case"ua":case"uk-UA":return(await n.e(2453).then(n.bind(n,32453))).default;case"vi":case"vi-VN":return(await n.e(6620).then(n.bind(n,86620))).default;case"zh":case"zh-CN":case"zh-Hans":return(await n.e(4800).then(n.bind(n,54800))).default;case"zh-HK":return(await n.e(7900).then(n.bind(n,77900))).default;case"zh-Hant":case"zh-TW":return(await n.e(4655).then(n.bind(n,34655))).default}};async function ej(e){if(eC.isLocaleCached(e))return void eC.updateLocale(e);let t=await ex(e);eC.setTranslations(e,JSON.parse(t))}var eE=()=>{},ek=(0,i.createContext)({i18n:eC}),eB={iconBackground:"#7290CC",iconUrl:async()=>(await n.e(3086).then(n.bind(n,43086))).default},eI={iconBackground:"#96bedc",iconUrl:async()=>(await n.e(3472).then(n.bind(n,43472))).default},eT={iconBackground:"#e84141",iconUrl:async()=>(await n.e(3310).then(n.bind(n,13310))).default},eR={iconBackground:"#0052ff",iconUrl:async()=>(await n.e(8907).then(n.bind(n,38907))).default},eN={iconBackground:"#814625",iconUrl:async()=>(await n.e(4732).then(n.bind(n,14732))).default},eS={iconBackground:"#000000",iconUrl:async()=>(await n.e(2679).then(n.bind(n,72679))).default},eA={iconBackground:"#ebac0e",iconUrl:async()=>(await n.e(1114).then(n.bind(n,11114))).default},eD={iconBackground:"#FCFF52",iconUrl:async()=>(await n.e(1408).then(n.bind(n,71408))).default},eW={iconBackground:"#002D74",iconUrl:async()=>(await n.e(5952).then(n.bind(n,75952))).default},eO={iconBackground:"#484c50",iconUrl:async()=>(await n.e(8039).then(n.bind(n,48039))).default},e_={iconBackground:"transparent",iconUrl:async()=>(await n.e(1520).then(n.bind(n,31520))).default},eF={iconBackground:"#000000",iconUrl:async()=>(await n.e(2153).then(n.bind(n,52153))).default},eL={iconBackground:"#7132F5",iconUrl:async()=>(await n.e(3922).then(n.bind(n,53922))).default},eM={iconBackground:"transparent",iconUrl:async()=>(await n.e(66).then(n.bind(n,50066))).default},eU={iconBackground:"#ffffff",iconUrl:async()=>(await n.e(6054).then(n.bind(n,66054))).default},eP={iconBackground:"#ffffff",iconUrl:async()=>(await n.e(1626).then(n.bind(n,21626))).default},eq={iconBackground:"#000000",iconUrl:async()=>(await n.e(5348).then(n.bind(n,5348))).default},ez={iconBackground:"#ff5a57",iconUrl:async()=>(await n.e(1020).then(n.bind(n,21020))).default},e$={iconBackground:"#9f71ec",iconUrl:async()=>(await n.e(1028).then(n.bind(n,11028))).default},eH={iconBackground:"#FFEEDA",iconUrl:async()=>(await n.e(2195).then(n.bind(n,22195))).default},eY={iconBackground:"#F50DB4",iconUrl:async()=>(await n.e(5497).then(n.bind(n,15497))).default},eK={iconBackground:"#f9f7ec",iconUrl:async()=>(await n.e(4635).then(n.bind(n,4635))).default},eV={iconBackground:"#000000",iconUrl:async()=>(await n.e(4602).then(n.bind(n,84602))).default},eX={iconBackground:"#f9f7ec",iconUrl:async()=>(await n.e(4060).then(n.bind(n,14060))).default},eG={iconBackground:"#000000",iconUrl:async()=>(await n.e(6699).then(n.bind(n,76699))).default},eZ=Object.fromEntries(Object.values({apechain:{chainId:33139,name:"ApeChain",...eB},apechainCurtis:{chainId:33111,name:"ApeChain Curtis",...eB},arbitrum:{chainId:42161,name:"Arbitrum",...eI},arbitrumGoerli:{chainId:421613,...eI},arbitrumSepolia:{chainId:421614,...eI},avalanche:{chainId:43114,...eT},avalancheFuji:{chainId:43113,...eT},base:{chainId:8453,name:"Base",...eR},baseGoerli:{chainId:84531,...eR},baseSepolia:{chainId:84532,...eR},berachain:{chainId:80094,name:"Berachain",...eN},berachainArtio:{chainId:80085,name:"Berachain Artio",...eN},berachainBArtio:{chainId:80084,name:"Berachain bArtio",...eN},blast:{chainId:81457,name:"Blast",...eS},blastSepolia:{chainId:0xa0c71fd,...eS},bsc:{chainId:56,name:"BSC",...eA},bscTestnet:{chainId:97,...eA},celo:{chainId:42220,name:"Celo",...eD},celoAlfajores:{chainId:44787,name:"Celo Alfajores",...eD},cronos:{chainId:25,...eW},cronosTestnet:{chainId:338,...eW},degen:{chainId:0x27bc86aa,name:"Degen",iconBackground:"#A36EFD",iconUrl:async()=>(await n.e(4300).then(n.bind(n,94300))).default},flow:{chainId:747,...e_},flowTestnet:{chainId:545,...e_},gnosis:{chainId:100,name:"Gnosis",iconBackground:"#04795c",iconUrl:async()=>(await n.e(332).then(n.bind(n,50332))).default},goerli:{chainId:5,...eO},gravity:{chainId:1625,name:"Gravity",...eF},gravitySepolia:{chainId:13505,name:"Gravity Sepolia",...eF},hardhat:{chainId:31337,iconBackground:"#f9f7ec",iconUrl:async()=>(await n.e(5730).then(n.bind(n,25730))).default},holesky:{chainId:17e3,...eO},hyperevm:{chainId:999,iconBackground:"#000000",iconUrl:async()=>(await n.e(6101).then(n.bind(n,66101))).default},ink:{chainId:57073,...eL},inkSepolia:{chainId:763373,...eL},kaia:{chainId:8217,name:"Kaia",...eM},kairos:{chainId:1001,name:"Kairos",...eM},kovan:{chainId:42,...eO},linea:{chainId:59144,name:"Linea",...eU},lineaGoerli:{chainId:59140,name:"Linea Goerli",...eU},lineaSepolia:{chainId:59141,name:"Linea Sepolia",...eU},localhost:{chainId:1337,...eO},mainnet:{chainId:1,name:"Ethereum",...eO},manta:{chainId:169,name:"Manta",...eP},mantaSepolia:{chainId:3441006,...eP},mantaTestnet:{chainId:3441005,...eP},mantle:{chainId:5e3,...eq},mantleTestnet:{chainId:5001,...eq},optimism:{chainId:10,name:"Optimism",...ez},optimismGoerli:{chainId:420,...ez},optimismKovan:{chainId:69,...ez},optimismSepolia:{chainId:0xaa37dc,...ez},polygon:{chainId:137,name:"Polygon",...e$},polygonAmoy:{chainId:80002,...e$},polygonMumbai:{chainId:80001,...e$},rinkeby:{chainId:4,...eO},ronin:{chainId:2020,iconBackground:"#1273EA",iconUrl:async()=>(await n.e(4231).then(n.bind(n,34231))).default},ropsten:{chainId:3,...eO},sanko:{chainId:1996,name:"Sanko",iconBackground:"#000000",iconUrl:async()=>(await n.e(1659).then(n.bind(n,61659))).default},scroll:{chainId:534352,...eH},scrollSepolia:{chainId:534351,...eH},sepolia:{chainId:0xaa36a7,...eO},unichain:{chainId:130,...eY},unichainSepolia:{chainId:1301,...eY},xdc:{chainId:50,name:"XinFin",...eK},xdcTestnet:{chainId:51,...eK},zetachain:{chainId:7e3,name:"ZetaChain",...eV},zetachainAthensTestnet:{chainId:7001,name:"Zeta Athens",...eV},zkSync:{chainId:324,name:"zkSync",...eX},zkSyncTestnet:{chainId:280,...eX},zora:{chainId:7777777,name:"Zora",...eG},zoraSepolia:{chainId:0x3b9ac9ff,...eG},zoraTestnet:{chainId:999,...eG}}).filter(function(e){return null!=e}).map(({chainId:e,...t})=>[e,t])),eQ=e=>e.map(e=>{let t=eZ[e.id]??{};return{...e,name:t.name??e.name,iconUrl:e.iconUrl??t.iconUrl,iconBackground:e.iconBackground??t.iconBackground}}),eJ=(0,i.createContext)({chains:[]}),e1=()=>(0,i.useContext)(eJ).chains,e0=()=>(0,i.useContext)(eJ).initialChainId,e3=()=>{let e=e1();return(0,i.useMemo)(()=>{let t={};for(let n of e)t[n.id]=n;return t},[e])},e6=(0,i.createContext)({showBalance:void 0,setShowBalance:()=>{}}),e7=()=>(0,i.useContext)(e6);function e2(){let[e,t]=(0,i.useState)(!1);return(0,i.useCallback)(()=>e,[e])}function e4(){let e=e1(),t=W.r.id;return e.some(e=>e.id===t)}async function e8(e,t){var n;if(t={headers:{},method:"get",...t,timeout:t.timeout??1e4},!e)throw Error("rainbowFetch: Missing url argument");let a=new AbortController,r=setTimeout(()=>a.abort(),t.timeout),{body:o,params:i,headers:l,...s}=t,c=o&&"object"==typeof o?JSON.stringify(t.body):t.body,u=await fetch(`${e}${(n=i)&&Object.keys(n).length?`?${new URLSearchParams(n)}`:""}`,{...s,body:c,headers:{Accept:"application/json","Content-Type":"application/json",...l},signal:a.signal});clearTimeout(r);let d=await function(e){let t=e.headers.get("Content-Type");return t?.startsWith("application/json")?e.json():e.text()}(u);if(u.ok){let{headers:e,status:t}=u;return{data:d,headers:e,status:t}}throw function({requestBody:e,response:t,responseBody:n}){let a=Error(n?.error||t?.statusText||"There was an error with the request.");return a.response=t,a.responseBody=n,a.requestBody=e,a}({requestBody:o,response:u,responseBody:"string"==typeof d?{error:d}:d})}var e5=class{constructor(e={}){let{baseUrl:t="",...n}=e;this.baseUrl=t,this.opts=n}get(e,t){return e8(`${this.baseUrl}${e}`,{...this.opts,...t||{},method:"get"})}delete(e,t){return e8(`${this.baseUrl}${e}`,{...this.opts,...t||{},method:"delete"})}head(e,t){return e8(`${this.baseUrl}${e}`,{...this.opts,...t||{},method:"head"})}options(e,t){return e8(`${this.baseUrl}${e}`,{...this.opts,...t||{},method:"options"})}post(e,t,n){return e8(`${this.baseUrl}${e}`,{...this.opts,...n||{},body:t,method:"post"})}put(e,t,n){return e8(`${this.baseUrl}${e}`,{...this.opts,...n||{},body:t,method:"put"})}patch(e,t,n){return e8(`${this.baseUrl}${e}`,{...this.opts,...n||{},body:t,method:"patch"})}},e9=!!("undefined"!=typeof process&&void 0!==process.env&&process.env.RAINBOW_PROVIDER_API_KEY),te=function({baseUrl:e,headers:t,params:n,timeout:a}){return new e5({baseUrl:e,headers:t,params:n,timeout:a})}({baseUrl:"https://enhanced-provider.rainbow.me",headers:{"x-api-key":"undefined"!=typeof process&&void 0!==process.env&&process.env.RAINBOW_PROVIDER_API_KEY||"LzbasoBiLqltex3VkcQ7LRmL4PtfiiZ1EMJrizrgfonWN6byJReu/l6yrUoo3zLW"}});function tt(e){return`rk-ens-name-${e}`}async function tn({address:e}){let t=function(e){let t=function(e){try{let t=e?JSON.parse(e):null;return"object"==typeof t?t:null}catch{return null}}(localStorage.getItem(tt(e)));if(!t)return null;let{ensName:n,expires:a}=t;return"string"!=typeof n||Number.isNaN(Number(a))||new Date().getTime()>Number(a)?(localStorage.removeItem(tt(e)),null):n}(e);if(t)return t;let n=(await te.get("/v1/resolve-ens",{params:{address:e}})).data.data;return n&&function(e,t){if(!(0,F.P)(e))return;let n=new Date(new Date().getTime()+180*6e4);localStorage.setItem(tt(e),JSON.stringify({ensName:t,expires:n.getTime()}))}(e,n),n}function ta({address:e,includeBalance:t}){let n=function(e){let t=e4(),{data:n}=function(e={}){let{address:t,query:n={}}=e,a=(0,I.U)(e),r=(0,D.i)({config:a}),o=function(e,t={}){return{async queryFn({queryKey:t}){let{address:n,scopeKey:a,...r}=t[1];if(!n)throw Error("address is required");return(0,_.s)(e,{...r,address:n})},queryKey:function(e={}){return["ensName",(0,S.xO)(e)]}(t)}}(a,{...e,chainId:e.chainId??r}),i=!!(t&&(n.enabled??!0));return(0,A.IT)({...n,...o,enabled:i})}({chainId:W.r.id,address:e,query:{enabled:t}}),{data:a}=(0,O.I)({queryKey:function(e,t,n={}){return[e,t,n]}("address",e),queryFn:()=>tn({address:e}),enabled:!t&&!!e&&e9,staleTime:6e5,retry:1});return n||a}(e),a=function(e){let t=e4(),{data:n}=function(e={}){let{name:t,query:n={}}=e,a=(0,I.U)(e),r=(0,D.i)({config:a}),o=function(e,t={}){return{async queryFn({queryKey:t}){let{name:n,scopeKey:a,...r}=t[1];if(!n)throw Error("name is required");return(0,N.i)(e,{...r,name:n})},queryKey:function(e={}){return["ensAvatar",(0,S.xO)(e)]}(t)}}(a,{...e,chainId:e.chainId??r}),i=!!(t&&(n.enabled??!0));return(0,A.IT)({...n,...o,enabled:i})}({chainId:W.r.id,name:e?(e=>{try{return(0,R.S)(e)}catch{}})(e):void 0,query:{enabled:t}});return n}(n),{data:r}=(0,T.A)({address:t?e:void 0});return{ensName:n,ensAvatar:a,balance:r}}function tr(){let{chain:e}=(0,o.F)();return e?.id??null}var to="rk-transactions";function ti(){var e="undefined"!=typeof localStorage?localStorage.getItem(to):null;try{let t=e?JSON.parse(e):{};return"object"==typeof t?t:{}}catch{return{}}}var tl=/^0x([A-Fa-f0-9]{64})$/,ts=i.createContext(null);function tc(){let e=i.useContext(ts);if(!e)throw Error("Transaction hooks must be used within RainbowKitProvider");return e}function tu(){let e=tc(),{address:t}=(0,o.F)(),n=tr(),[a,r]=(0,i.useState)(()=>e&&t&&n?e.getTransactions(t,n):[]);return a}var td=e=>"function"==typeof e?e():e,tp=(0,i.createContext)({appName:void 0,disclaimer:void 0,learnMoreUrl:"https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"}),tm=(0,i.createContext)(!1),tf=()=>{let[e,t]=(0,i.useState)({height:void 0,width:void 0});return(0,i.useEffect)(()=>{let e=function(e,t){let n;return()=>{n&&clearTimeout(n),n=setTimeout(()=>{n=null,e()},500)}}(()=>{t({height:window.innerHeight,width:window.innerWidth})},0);return window.addEventListener("resize",e),e(),()=>window.removeEventListener("resize",e)},[]),e},th=(0,i.createContext)({connector:null,setConnector:()=>{}}),tg={COMPACT:"compact",WIDE:"wide"},tv=(0,i.createContext)(tg.WIDE),tb=(0,i.createContext)(!1);function tw(){return"undefined"!=typeof navigator&&void 0!==navigator.userAgent&&/Version\/([0-9._]+).*Safari/.test(navigator.userAgent)}function ty(){if("undefined"==typeof navigator)return"Browser";let e=navigator.userAgent?.toLowerCase();return navigator.brave?.isBrave?"Brave":e?.indexOf("edg/")>-1?"Edge":e?.indexOf("op")>-1?"Opera":"undefined"!=typeof document&&""!==getComputedStyle(document.body).getPropertyValue("--arc-palette-focus")?"Arc":e?.indexOf("chrome")>-1?"Chrome":e?.indexOf("firefox")>-1?"Firefox":tw()?"Safari":"Browser"}var{os:tC}=(0,$.UAParser)();function tx(){return"Windows"===tC.name?"Windows":"Mac OS"===tC.name?"macOS":["Ubuntu","Mint","Fedora","Debian","Arch","Linux"].includes(tC.name)?"Linux":"Desktop"}var tj=e=>{let t=ty();return({Arc:e?.downloadUrls?.chrome,Brave:e?.downloadUrls?.chrome,Chrome:e?.downloadUrls?.chrome,Edge:e?.downloadUrls?.edge||e?.downloadUrls?.chrome,Firefox:e?.downloadUrls?.firefox,Opera:e?.downloadUrls?.opera||e?.downloadUrls?.chrome,Safari:e?.downloadUrls?.safari,Browser:e?.downloadUrls?.browserExtension})[t]??e?.downloadUrls?.browserExtension},tE=e=>(ea()?e?.downloadUrls?.ios:e?.downloadUrls?.android)??e?.downloadUrls?.mobile,tk=e=>{let t=tx();return({Windows:e?.downloadUrls?.windows,macOS:e?.downloadUrls?.macos,Linux:e?.downloadUrls?.linux,Desktop:e?.downloadUrls?.desktop})[t]??e?.downloadUrls?.desktop},tB=(e,t)=>e.some(e=>e.id===t),tI=e=>!!e.isRainbowKitConnector,tT=e=>!!(!e.isRainbowKitConnector&&e.icon?.replace(/\n/g,"").startsWith("data:image")&&e.uid&&e.name),tR=(e,t)=>"walletConnect"===e.id&&t?{...e,walletConnectModalConnector:t}:e,tN=({wallets:e,recentWallets:t})=>[...t,...e.filter(e=>!tB(t,e.id))],tS="rk-recent";function tA(){return"undefined"!=typeof localStorage?function(e){try{let t=e?JSON.parse(e):[];return Array.isArray(t)?t:[]}catch{return[]}}(localStorage.getItem(tS)):[]}function tD(e=!1){let t=e1(),n=e0(),{connectAsync:a,connectors:r}=function(e={}){let{mutation:t}=e,n=(0,I.U)(e),a={mutationFn:e=>(0,M.N)(n,e),mutationKey:["connect"]},{mutate:r,mutateAsync:o,...l}=(0,L.n)({...t,...a});return{...l,connect:r,connectAsync:o,connectors:function(e={}){let t=(0,I.U)(e);return(0,i.useSyncExternalStore)(e=>(0,U.O)(t,{onChange:e}),()=>z(t),()=>z(t))}({config:n})}}(),{setIsWalletConnectModalOpen:o}=n2(),l=r.map(e=>({...e,...e.rkDetails||{}}));async function s(e){let r=await e.getChainId(),o=await a({chainId:n??t.find(({id:e})=>e===r)?.id??t[0]?.id,connector:e});return o&&function(e){let t=[...new Set([e,...tA()])];localStorage.setItem(tS,JSON.stringify(t))}(e.id),o}async function c(e){try{o(!0),await s(e),o(!1)}catch(t){let e="UserRejectedRequestError"===t.name||"Connection request reset. Please try again."===t.message;if(o(!1),!e)throw t}}let u=async(e,t)=>{let n=await e.getProvider();return"coinbase"===e.id?n.qrUrl:new Promise(e=>n.once("display_uri",n=>{e(t(n))}))},d=l.find(e=>"walletConnect"===e.id&&e.isWalletConnectModalConnector),p=l.filter(tT).map(e=>({...e,groupIndex:0})),m=l.filter(tI).filter(e=>!e.isWalletConnectModalConnector).filter(t=>!e||!p.some(e=>e.id===t.rdns)).map(e=>tR(e,d)),f=[...p,...m],h=function(e,t){let n={};for(let a of e){let e=t(a);e&&(n[e]=a)}return n}(f,e=>e.id),g=tA().map(e=>h[e]).filter(Boolean).slice(0,3),v=[];for(let e of tN({wallets:f,recentWallets:g})){if(!e)continue;let t=tT(e),n=tB(g,e.id);if(t){v.push({...e,iconUrl:e.icon,ready:!0,connect:()=>s(e),groupName:"Installed",recent:n});continue}v.push({...e,ready:e.installed??!0,connect:()=>s(e),desktopDownloadUrl:tk(e),extensionDownloadUrl:tj(e),groupName:e.groupName,mobileDownloadUrl:tE(e),getQrCodeUri:e.qrCode?.getUri?()=>u(e,e.qrCode.getUri):void 0,getDesktopUri:e.desktop?.getUri?()=>u(e,e.desktop.getUri):void 0,getMobileUri:e.mobile?.getUri?()=>u(e,e.mobile?.getUri):void 0,recent:n,showWalletConnectModal:e.walletConnectModalConnector?()=>c(e.walletConnectModalConnector):void 0})}return v}var tW=async()=>(await n.e(1652).then(n.bind(n,61652))).default,tO=()=>i.createElement(em,{background:"#d0d5de",borderRadius:"10",height:"48",src:tW,width:"48"}),t_=async()=>(await n.e(9771).then(n.bind(n,79771))).default,tF=()=>i.createElement(em,{background:"#d0d5de",borderRadius:"10",height:"48",src:t_,width:"48"}),tL=i.forwardRef(({as:e="div",children:t,className:n,color:a,display:r,font:o="body",id:l,size:s="16",style:c,tabIndex:u,textAlign:d="inherit",weight:p="regular",testId:m},f)=>i.createElement(el,{as:e,className:n,color:a,display:r,fontFamily:o,fontSize:s,fontWeight:p,id:l,ref:f,style:c,tabIndex:u,textAlign:d,testId:m},t));tL.displayName="Text";var tM={large:{fontSize:"16",paddingX:"24",paddingY:"10"},medium:{fontSize:"14",height:"28",paddingX:"12",paddingY:"4"},small:{fontSize:"14",paddingX:"10",paddingY:"5"}};function tU({disabled:e=!1,href:t,label:n,onClick:a,rel:r="noreferrer noopener",size:o="medium",target:l="_blank",testId:s,type:c="primary"}){let u="primary"===c,d="large"!==o,p=er(),m=e?"actionButtonSecondaryBackground":u?"accentColor":d?"actionButtonSecondaryBackground":null,{fontSize:f,height:h,paddingX:g,paddingY:v}=tM[o];return i.createElement(el,{...t?!e?{as:"a",href:t,rel:r,target:l}:{}:{as:"button",type:"button"},onClick:e?void 0:a,...!p||!d?{borderColor:!p||d||u?"actionButtonBorder":"actionButtonBorderMobile",borderStyle:"solid",borderWidth:"1"}:{},borderRadius:"actionButton",className:!e&&Q({active:"shrinkSm",hover:"grow"}),display:"block",paddingX:g,paddingY:v,style:{willChange:"transform"},testId:s,textAlign:"center",transition:"transform",...m?{background:m}:{},...h?{height:h}:{}},i.createElement(tL,{color:e?"modalTextSecondary":u?"accentColorForeground":"accentColor",size:f,weight:"bold"},n))}var tP=()=>er()?i.createElement("svg",{"aria-hidden":!0,fill:"none",height:"11.5",viewBox:"0 0 11.5 11.5",width:"11.5",xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Close"),i.createElement("path",{d:"M2.13388 0.366117C1.64573 -0.122039 0.854272 -0.122039 0.366117 0.366117C-0.122039 0.854272 -0.122039 1.64573 0.366117 2.13388L3.98223 5.75L0.366117 9.36612C-0.122039 9.85427 -0.122039 10.6457 0.366117 11.1339C0.854272 11.622 1.64573 11.622 2.13388 11.1339L5.75 7.51777L9.36612 11.1339C9.85427 11.622 10.6457 11.622 11.1339 11.1339C11.622 10.6457 11.622 9.85427 11.1339 9.36612L7.51777 5.75L11.1339 2.13388C11.622 1.64573 11.622 0.854272 11.1339 0.366117C10.6457 -0.122039 9.85427 -0.122039 9.36612 0.366117L5.75 3.98223L2.13388 0.366117Z",fill:"currentColor"})):i.createElement("svg",{"aria-hidden":!0,fill:"none",height:"10",viewBox:"0 0 10 10",width:"10",xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Close"),i.createElement("path",{d:"M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z",fill:"currentColor"})),tq=({"aria-label":e="Close",onClose:t})=>{let n=er();return i.createElement(el,{alignItems:"center","aria-label":e,as:"button",background:"closeButtonBackground",borderColor:"actionButtonBorder",borderRadius:"full",borderStyle:"solid",borderWidth:n?"0":"1",className:Q({active:"shrinkSm",hover:"growLg"}),color:"closeButton",display:"flex",height:n?"30":"28",justifyContent:"center",onClick:t,style:{willChange:"transform"},transition:"default",type:"button",width:n?"30":"28"},i.createElement(tP,null))},tz=async()=>(await n.e(9669).then(n.bind(n,79669))).default;function t$({onClose:e,onCloseModal:t}){let{i18n:n}=useContext6(ek),[{status:a,...r},o]=React20.useState({status:"idle"}),i=function(){let{adapter:e}=useContext(J)??{};if(!e)throw Error("No authentication adapter found");return e}(),l=useCallback3(async()=>{try{let e=await i.getNonce();o(t=>({...t,nonce:e}))}catch{o(e=>({...e,errorMessage:n.t("sign_in.message.preparing_error"),status:"idle"}))}},[i,n.t]),s=useRef(!1);React20.useEffect(()=>{s.current||(s.current=!0,l())},[l]);let c=er(),{address:u,chain:d}=useAccount6(),{signMessageAsync:p}=useSignMessage(),m=async()=>{try{let e,a=d?.id,{nonce:l}=r;if(!u||!a||!l)return;o(e=>({...e,errorMessage:void 0,status:"signing"}));let s=i.createMessage({address:u,chainId:a,nonce:l});try{e=await p({message:s})}catch(e){if(e instanceof UserRejectedRequestError)return o(e=>({...e,status:"idle"}));return o(e=>({...e,errorMessage:n.t("sign_in.signature.signing_error"),status:"idle"}))}o(e=>({...e,status:"verifying"}));try{if(await i.verify({message:s,signature:e}))return void t();throw Error()}catch{return o(e=>({...e,errorMessage:n.t("sign_in.signature.verifying_error"),status:"idle"}))}}catch{o({errorMessage:n.t("sign_in.signature.oops_error"),status:"idle"})}};return React20.createElement(el,{position:"relative"},React20.createElement(el,{display:"flex",paddingRight:"16",paddingTop:"16",position:"absolute",right:"0"},React20.createElement(tq,{onClose:e})),React20.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:c?"32":"24",padding:"24",paddingX:"18",style:{paddingTop:c?"60px":"36px"}},React20.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:c?"6":"4",style:{maxWidth:c?320:280}},React20.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:c?"32":"16"},React20.createElement(em,{height:40,src:tz,width:40}),React20.createElement(tL,{color:"modalText",size:c?"20":"18",textAlign:"center",weight:"heavy"},n.t("sign_in.label"))),React20.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:c?"16":"12"},React20.createElement(tL,{color:"modalTextSecondary",size:c?"16":"14",textAlign:"center"},n.t("sign_in.description")),"idle"===a&&r.errorMessage?React20.createElement(tL,{color:"error",size:c?"16":"14",textAlign:"center",weight:"bold"},r.errorMessage):null)),React20.createElement(el,{alignItems:c?void 0:"center",display:"flex",flexDirection:"column",gap:"8",width:"full"},React20.createElement(tU,{disabled:!r.nonce||"signing"===a||"verifying"===a,label:r.nonce?"signing"===a?n.t("sign_in.signature.waiting"):"verifying"===a?n.t("sign_in.signature.verifying"):n.t("sign_in.message.send"):n.t("sign_in.message.preparing"),onClick:m,size:c?"large":"medium",testId:"auth-message-button"}),c?React20.createElement(tU,{label:"Cancel",onClick:e,size:"large",type:"secondary"}):React20.createElement(el,{as:"button",borderRadius:"full",className:Q({active:"shrink",hover:"grow"}),display:"block",onClick:e,paddingX:"10",paddingY:"5",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},React20.createElement(tL,{color:"closeButton",size:c?"16":"14",weight:"bold"},n.t("sign_in.message.cancel"))))))}var tH="WALLETCONNECT_DEEPLINK_CHOICE",tY=(0,i.createContext)(void 0),tK="data-rk",tV=e=>({[tK]:e||""}),tX=()=>tV(useContext7(tY)),tG=(b(),(e,t)=>{let n=e.querySelectorAll("button:not(:disabled), a[href]");0!==n.length&&n["end"===t?n.length-1:0].focus()});function tZ(e){let t=useRef2(null);return React22.createElement(React22.Fragment,null,React22.createElement("div",{onFocus:useCallback5(()=>t.current&&tG(t.current,"end"),[]),tabIndex:0}),React22.createElement("div",{ref:t,style:{outline:"none"},tabIndex:-1,...e}),React22.createElement("div",{onFocus:useCallback5(()=>t.current&&tG(t.current,"start"),[]),tabIndex:0}))}var tQ=e=>e.stopPropagation();function tJ({children:e,onClose:t,open:n,titleId:a}){useEffect11(()=>{let e=e=>n&&"Escape"===e.key&&t();return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[n,t]);let[r,o]=useState9(!0);useEffect11(()=>{o("hidden"!==getComputedStyle(window.document.body).overflow)},[]);let i=useCallback6(()=>t(),[t]),l=tX(),s=er();return React23.createElement(React23.Fragment,null,n?createPortal(React23.createElement(RemoveScroll,{enabled:r},React23.createElement(el,{...l},React23.createElement(el,{...l,alignItems:s?"flex-end":"center","aria-labelledby":a,"aria-modal":!0,className:"_9pm4ki3 ju367v9h ju367vb3 ju367va ju367v2q ju367v8q",onClick:i,position:"fixed",role:"dialog"},React23.createElement(tZ,{className:"_9pm4ki5 ju367va ju367v15 ju367v8r",onClick:tQ,role:"document"},e)))),document.body):null)}function t1({bottomSheetOnMobile:e=!1,children:t,marginTop:n,padding:a="16",paddingBottom:r,wide:o=!1}){let i=er(),l=useContext8(tv)===tg.COMPACT;return React24.createElement(el,{marginTop:n},React24.createElement(el,{className:[o?i?"_1ckjpok2 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":l?"_1ckjpok4 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":"_1ckjpok3 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r":"_1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r",i?"_1ckjpok6 ju367vq":null,i&&e?"_1ckjpok7":null].join(" ")},React24.createElement(el,{padding:a,paddingBottom:r??a},t)))}var t0=["k","m","b","t"];function t3(e,t=1){return e.toString().replace(RegExp(`(.+\\.\\d{${t}})\\d+`),"$1").replace(/(\.[1-9]*)0+$/,"$1").replace(/\.$/,"")}function t6(e){if(e<1)return t3(e,3);if(e<100)return t3(e,2);if(e<1e4)return new Intl.NumberFormat().format(Number.parseFloat(t3(e,1)));let t=String(e);for(let n=t0.length-1;n>=0;n--){let a=10**((n+1)*3);if(a<=e){t=t3(e=10*e/a/10,1)+t0[n];break}}return t}function t7(e){return e.length<8?e:`${e.substring(0,4)}\u2026${e.substring(e.length-4)}`}function t2(e){if(!e)return"";let t=e.split("."),n=t.pop();return t.join(".").length>24?`${t.join(".").substring(0,24)}...`:`${t.join(".")}.${n}`}var t4=()=>React25.createElement("svg",{fill:"none",height:"13",viewBox:"0 0 13 13",width:"13",xmlns:"http://www.w3.org/2000/svg"},React25.createElement("title",null,"Copied"),React25.createElement("path",{d:"M4.94568 12.2646C5.41052 12.2646 5.77283 12.0869 6.01892 11.7109L12.39 1.96973C12.5677 1.69629 12.6429 1.44336 12.6429 1.2041C12.6429 0.561523 12.1644 0.0966797 11.5082 0.0966797C11.057 0.0966797 10.7767 0.260742 10.5033 0.691406L4.9115 9.50977L2.07458 5.98926C1.82166 5.68848 1.54822 5.55176 1.16541 5.55176C0.502319 5.55176 0.0238037 6.02344 0.0238037 6.66602C0.0238037 6.95312 0.112671 7.20605 0.358765 7.48633L3.88611 11.7588C4.18005 12.1074 4.50818 12.2646 4.94568 12.2646Z",fill:"currentColor"})),t8=()=>React26.createElement("svg",{fill:"none",height:"16",viewBox:"0 0 17 16",width:"17",xmlns:"http://www.w3.org/2000/svg"},React26.createElement("title",null,"Copy"),React26.createElement("path",{d:"M3.04236 12.3027H4.18396V13.3008C4.18396 14.8525 5.03845 15.7002 6.59705 15.7002H13.6244C15.183 15.7002 16.0375 14.8525 16.0375 13.3008V6.24609C16.0375 4.69434 15.183 3.84668 13.6244 3.84668H12.4828V2.8418C12.4828 1.29688 11.6283 0.442383 10.0697 0.442383H3.04236C1.48376 0.442383 0.629272 1.29004 0.629272 2.8418V9.90332C0.629272 11.4551 1.48376 12.3027 3.04236 12.3027ZM3.23376 10.5391C2.68689 10.5391 2.39294 10.2656 2.39294 9.68457V3.06055C2.39294 2.47949 2.68689 2.21289 3.23376 2.21289H9.8783C10.4252 2.21289 10.7191 2.47949 10.7191 3.06055V3.84668H6.59705C5.03845 3.84668 4.18396 4.69434 4.18396 6.24609V10.5391H3.23376ZM6.78845 13.9365C6.24158 13.9365 5.94763 13.6699 5.94763 13.0889V6.45801C5.94763 5.87695 6.24158 5.61035 6.78845 5.61035H13.433C13.9799 5.61035 14.2738 5.87695 14.2738 6.45801V13.0889C14.2738 13.6699 13.9799 13.9365 13.433 13.9365H6.78845Z",fill:"currentColor"})),t5=()=>React27.createElement("svg",{fill:"none",height:"16",viewBox:"0 0 18 16",width:"18",xmlns:"http://www.w3.org/2000/svg"},React27.createElement("title",null,"Disconnect"),React27.createElement("path",{d:"M2.67834 15.5908H9.99963C11.5514 15.5908 12.399 14.7432 12.399 13.1777V10.2656H10.6354V12.9863C10.6354 13.5332 10.3688 13.8271 9.78772 13.8271H2.89026C2.3092 13.8271 2.0426 13.5332 2.0426 12.9863V3.15625C2.0426 2.60254 2.3092 2.30859 2.89026 2.30859H9.78772C10.3688 2.30859 10.6354 2.60254 10.6354 3.15625V5.89746H12.399V2.95801C12.399 1.39941 11.5514 0.544922 9.99963 0.544922H2.67834C1.12659 0.544922 0.278931 1.39941 0.278931 2.95801V13.1777C0.278931 14.7432 1.12659 15.5908 2.67834 15.5908ZM7.43616 8.85059H14.0875L15.0924 8.78906L14.566 9.14453L13.6842 9.96484C13.5406 10.1016 13.4586 10.2861 13.4586 10.4844C13.4586 10.8398 13.7321 11.168 14.1217 11.168C14.3199 11.168 14.4635 11.0928 14.6002 10.9561L16.7809 8.68652C16.986 8.48145 17.0543 8.27637 17.0543 8.06445C17.0543 7.85254 16.986 7.64746 16.7809 7.43555L14.6002 5.17285C14.4635 5.03613 14.3199 4.9541 14.1217 4.9541C13.7321 4.9541 13.4586 5.27539 13.4586 5.6377C13.4586 5.83594 13.5406 6.02734 13.6842 6.15723L14.566 6.98438L15.0924 7.33984L14.0875 7.27148H7.43616C7.01917 7.27148 6.65686 7.62012 6.65686 8.06445C6.65686 8.50195 7.01917 8.85059 7.43616 8.85059Z",fill:"currentColor"})),t9=e=>e?.blockExplorers?.default?.url,ne=()=>React28.createElement("svg",{fill:"none",height:"19",viewBox:"0 0 20 19",width:"20",xmlns:"http://www.w3.org/2000/svg"},React28.createElement("title",null,"Link"),React28.createElement("path",{d:"M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM12.7158 12.1416C13.2432 12.1416 13.5684 11.7549 13.5684 11.1836V7.19336C13.5684 6.44629 13.1377 6.05957 12.417 6.05957H8.40918C7.8291 6.05957 7.45117 6.38477 7.45117 6.91211C7.45117 7.43945 7.8291 7.77344 8.40918 7.77344H9.69238L10.7207 7.63281L9.53418 8.67871L6.73047 11.4912C6.53711 11.6758 6.41406 11.9395 6.41406 12.2031C6.41406 12.7832 6.85352 13.1699 7.39844 13.1699C7.68848 13.1699 7.92578 13.0732 8.1543 12.8623L10.9316 10.0762L11.9775 8.89844L11.8545 9.98828V11.1836C11.8545 11.7725 12.1885 12.1416 12.7158 12.1416Z",fill:"currentColor"})),nt=()=>React29.createElement("svg",{fill:"none",height:"19",viewBox:"0 0 20 19",width:"20",xmlns:"http://www.w3.org/2000/svg"},React29.createElement("title",null,"Cancel"),React29.createElement("path",{d:"M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM7.29297 13.3018C7.58301 13.3018 7.81152 13.2139 7.99609 13.0205L10 11.0166L12.0127 13.0205C12.1973 13.2051 12.4258 13.3018 12.707 13.3018C13.2432 13.3018 13.6562 12.8887 13.6562 12.3525C13.6562 12.0977 13.5508 11.8691 13.3662 11.6934L11.3535 9.67188L13.375 7.6416C13.5596 7.44824 13.6562 7.22852 13.6562 6.98242C13.6562 6.44629 13.2432 6.0332 12.7158 6.0332C12.4346 6.0332 12.2148 6.12109 12.0215 6.31445L10 8.32715L7.9873 6.32324C7.80273 6.12988 7.58301 6.04199 7.29297 6.04199C6.76562 6.04199 6.35254 6.45508 6.35254 6.99121C6.35254 7.2373 6.44922 7.46582 6.63379 7.6416L8.65527 9.67188L6.63379 11.6934C6.44922 11.8691 6.35254 12.1064 6.35254 12.3525C6.35254 12.8887 6.76562 13.3018 7.29297 13.3018Z",fill:"currentColor"})),nn=()=>React30.createElement("svg",{fill:"none",height:"20",viewBox:"0 0 20 20",width:"20",xmlns:"http://www.w3.org/2000/svg"},React30.createElement("title",null,"Success"),React30.createElement("path",{d:"M10 19.4443C15.0977 19.4443 19.2812 15.252 19.2812 10.1543C19.2812 5.06543 15.0889 0.873047 10 0.873047C4.90234 0.873047 0.71875 5.06543 0.71875 10.1543C0.71875 15.252 4.91113 19.4443 10 19.4443ZM10 17.1328C6.1416 17.1328 3.03906 14.0215 3.03906 10.1543C3.03906 6.2959 6.13281 3.18457 10 3.18457C13.8584 3.18457 16.9697 6.2959 16.9697 10.1543C16.9785 14.0215 13.8672 17.1328 10 17.1328ZM9.07715 14.3379C9.4375 14.3379 9.7627 14.1533 9.97363 13.8369L13.7441 8.00977C13.8848 7.79883 13.9814 7.5791 13.9814 7.36816C13.9814 6.84961 13.5244 6.48926 13.0322 6.48926C12.707 6.48926 12.4258 6.66504 12.2148 7.0166L9.05957 12.0967L7.5918 10.2949C7.37207 10.0225 7.13477 9.9082 6.84473 9.9082C6.33496 9.9082 5.92188 10.3125 5.92188 10.8223C5.92188 11.0684 6.00098 11.2793 6.18555 11.5078L8.1543 13.8545C8.40918 14.1709 8.70801 14.3379 9.07715 14.3379Z",fill:"currentColor"})),na=e=>{switch(e){case"pending":default:return eh;case"confirmed":return nn;case"failed":return nt}};function nr({tx:e}){let t=er(),n=na(e.status),a="failed"===e.status?"error":"accentColor",{chain:r}=useAccount8(),o="confirmed"===e.status?"Confirmed":"failed"===e.status?"Failed":"Pending",i=t9(r);return React31.createElement(React31.Fragment,null,React31.createElement(el,{...i?{as:"a",background:{hover:"profileForeground"},borderRadius:"menuButton",className:Q({active:"shrink"}),href:`${i}/tx/${e.hash}`,rel:"noreferrer noopener",target:"_blank",transition:"default"}:{},color:"modalText",display:"flex",flexDirection:"row",justifyContent:"space-between",padding:"8",width:"full"},React31.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:t?"16":"14"},React31.createElement(el,{color:a},React31.createElement(n,null)),React31.createElement(el,{display:"flex",flexDirection:"column",gap:t?"3":"1"},React31.createElement(el,null,React31.createElement(tL,{color:"modalText",font:"body",size:t?"16":"14",weight:"bold"},e?.description)),React31.createElement(el,null,React31.createElement(tL,{color:"pending"===e.status?"modalTextSecondary":a,font:"body",size:"14",weight:t?"medium":"regular"},o)))),i&&React31.createElement(el,{alignItems:"center",color:"modalTextDim",display:"flex"},React31.createElement(ne,null))))}function no({address:e}){let t=tu(),n=function(){let e=tc(),{address:t}=useAccount7(),n=tr();return useCallback7(()=>{if(!t||!n)throw Error("No address or chain ID found");e.clearTransactions(t,n)},[e,t,n])}(),{chain:a}=useAccount9(),r=t9(a),o=t.slice(0,3),i=o.length>0,l=er(),{appName:s}=useContext9(tp),{i18n:c}=useContext9(ek);return React32.createElement(React32.Fragment,null,React32.createElement(el,{display:"flex",flexDirection:"column",gap:"10",paddingBottom:"2",paddingTop:"16",paddingX:l?"8":"18"},i&&React32.createElement(el,{paddingBottom:l?"4":"0",paddingTop:"8",paddingX:l?"12":"6"},React32.createElement(el,{display:"flex",justifyContent:"space-between"},React32.createElement(tL,{color:"modalTextSecondary",size:l?"16":"14",weight:"semibold"},c.t("profile.transactions.recent.title")),React32.createElement(el,{style:{marginBottom:-6,marginLeft:-10,marginRight:-10,marginTop:-6}},React32.createElement(el,{as:"button",background:{hover:"profileForeground"},borderRadius:"actionButton",className:Q({active:"shrink"}),onClick:n,paddingX:l?"8":"12",paddingY:l?"4":"5",transition:"default",type:"button"},React32.createElement(tL,{color:"modalTextSecondary",size:l?"16":"14",weight:"semibold"},c.t("profile.transactions.clear.label")))))),React32.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i?o.map(e=>React32.createElement(nr,{key:e.hash,tx:e})):React32.createElement(React32.Fragment,null,React32.createElement(el,{padding:l?"12":"8"},React32.createElement(tL,{color:"modalTextDim",size:l?"16":"14",weight:l?"medium":"bold"},s?c.t("profile.transactions.description",{appName:s}):c.t("profile.transactions.description_fallback"))),l&&React32.createElement(el,{background:"generalBorderDim",height:"1",marginX:"12",marginY:"8"})))),r&&React32.createElement(el,{paddingBottom:"18",paddingX:l?"8":"18"},React32.createElement(el,{alignItems:"center",as:"a",background:{hover:"profileForeground"},borderRadius:"menuButton",className:Q({active:"shrink"}),color:"modalTextDim",display:"flex",flexDirection:"row",href:`${r}/address/${e}`,justifyContent:"space-between",paddingX:"8",paddingY:"12",rel:"noreferrer noopener",style:{willChange:"transform"},target:"_blank",transition:"default",width:"full",...l?{paddingLeft:"12"}:{}},React32.createElement(tL,{color:"modalText",font:"body",size:l?"16":"14",weight:l?"semibold":"bold"},c.t("profile.explorer.label")),React32.createElement(ne,null))))}function ni({action:e,icon:t,label:n,testId:a,url:r}){let o=er();return React33.createElement(el,{...r?{as:"a",href:r,rel:"noreferrer noopener",target:"_blank"}:{as:"button",type:"button"},background:{base:"profileAction",...!o?{hover:"profileActionHover"}:{}},borderRadius:"menuButton",boxShadow:"profileDetailsAction",className:Q({active:"shrinkSm",hover:o?void 0:"grow"}),display:"flex",onClick:e,padding:o?"6":"8",style:{willChange:"transform"},testId:a,transition:"default",width:"full"},React33.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"1",justifyContent:"center",paddingTop:"2",width:"full"},React33.createElement(el,{color:"modalText",height:"max"},t),React33.createElement(el,null,React33.createElement(tL,{color:"modalText",size:o?"12":"13",weight:"semibold"},n))))}function nl({address:e,ensAvatar:t,ensName:n,balance:a,onClose:r,onDisconnect:o}){let i=useContext10(tb),[l,s]=useState10(!1),c=useCallback8(()=>{e&&(navigator.clipboard.writeText(e),s(!0))},[e]);if(!e)return null;let u=n?t2(n):t7(e),d=a?.formatted,p=d?t6(Number.parseFloat(d)):void 0,m="rk_profile_title",f=er(),{i18n:h}=useContext10(ek);return React34.createElement(React34.Fragment,null,React34.createElement(el,{display:"flex",flexDirection:"column"},React34.createElement(el,{background:"profileForeground",padding:"16"},React34.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:f?"16":"12",justifyContent:"center",margin:"8",style:{textAlign:"center"}},React34.createElement(el,{style:{position:"absolute",right:16,top:16,willChange:"transform"}},React34.createElement(tq,{onClose:r}))," ",React34.createElement(el,{marginTop:f?"24":"0"},React34.createElement(eb,{address:e,imageUrl:t,size:f?82:74})),React34.createElement(el,{display:"flex",flexDirection:"column",gap:f?"4":"0",textAlign:"center"},React34.createElement(el,{textAlign:"center"},React34.createElement(tL,{as:"h1",color:"modalText",id:m,size:f?"20":"18",weight:"heavy"},u)),!!a&&React34.createElement(el,{textAlign:"center"},React34.createElement(tL,{as:"h1",color:"modalTextSecondary",id:m,size:f?"16":"14",weight:"semibold"},p," ",a.symbol)))),React34.createElement(el,{display:"flex",flexDirection:"row",gap:"8",margin:"2",marginTop:"16"},React34.createElement(ni,{action:c,icon:l?React34.createElement(t4,null):React34.createElement(t8,null),label:l?h.t("profile.copy_address.copied"):h.t("profile.copy_address.label")}),React34.createElement(ni,{action:o,icon:React34.createElement(t5,null),label:h.t("profile.disconnect.label"),testId:"disconnect-button"}))),i&&React34.createElement(React34.Fragment,null,React34.createElement(el,{background:"generalBorder",height:"1",marginTop:"-1"}),React34.createElement(el,null,React34.createElement(no,{address:e})))))}function ns({onClose:e,open:t}){let{address:n}=useAccount10(),{balance:a,ensAvatar:r,ensName:o}=ta({address:n,includeBalance:t}),{disconnect:i}=useDisconnect();return n?React35.createElement(React35.Fragment,null,n&&React35.createElement(tJ,{onClose:e,open:t,titleId:"rk_account_modal_title"},React35.createElement(t1,{bottomSheetOnMobile:!0,padding:"0"},React35.createElement(nl,{address:n,ensAvatar:r,ensName:o,balance:a,onClose:e,onDisconnect:i})))):null}var nc=({size:e})=>React36.createElement("svg",{fill:"none",height:e,viewBox:"0 0 28 28",width:e,xmlns:"http://www.w3.org/2000/svg"},React36.createElement("title",null,"Disconnect"),React36.createElement("path",{d:"M6.742 22.195h8.367c1.774 0 2.743-.968 2.743-2.758V16.11h-2.016v3.11c0 .625-.305.96-.969.96H6.984c-.664 0-.968-.335-.968-.96V7.984c0-.632.304-.968.968-.968h7.883c.664 0 .969.336.969.968v3.133h2.016v-3.36c0-1.78-.97-2.757-2.743-2.757H6.742C4.97 5 4 5.977 4 7.758v11.68c0 1.789.969 2.757 2.742 2.757Zm5.438-7.703h7.601l1.149-.07-.602.406-1.008.938a.816.816 0 0 0-.258.593c0 .407.313.782.758.782.227 0 .39-.086.547-.243l2.492-2.593c.235-.235.313-.47.313-.711 0-.242-.078-.477-.313-.719l-2.492-2.586c-.156-.156-.32-.25-.547-.25-.445 0-.758.367-.758.781 0 .227.094.446.258.594l1.008.945.602.407-1.149-.079H12.18a.904.904 0 0 0 0 1.805Z",fill:"currentColor"})),nu=i.forwardRef(({children:e,currentlySelected:t=!1,onClick:n,testId:a,...r},o)=>{let l=er();return i.createElement(el,{as:"button",borderRadius:"menuButton",disabled:t,display:"flex",onClick:n,ref:o,testId:a,type:"button"},i.createElement(el,{borderRadius:"menuButton",className:[l?"v9horb0":void 0,!t&&Q({active:"shrink"})],padding:l?"8":"6",transition:"default",width:"full",...t?{background:"accentColor",borderColor:"selectedOptionBorder",borderStyle:"solid",borderWidth:"1",boxShadow:"selectedOption",color:"accentColorForeground"}:{background:{hover:"menuItemBackground"},color:"modalText",transition:"default"},...r},e))});function nd({onClose:e,open:t}){let{chainId:n}=useAccount11(),{chains:a}=useConfig2(),[r,o]=useState11(null),{switchChain:i}=useSwitchChain({mutation:{onMutate:({chainId:e})=>{o(e)},onSuccess:()=>{r&&o(null)},onError:()=>{r&&o(null)},onSettled:()=>{e()}}}),{i18n:l}=useContext12(ek),{disconnect:s}=useDisconnect2(),c="rk_chain_modal_title",u=er(),d=a.some(e=>e.id===n),p=u?"36":"28",m=e1();return n?React39.createElement(tJ,{onClose:e,open:t,titleId:c},React39.createElement(t1,{bottomSheetOnMobile:!0,paddingBottom:"0"},React39.createElement(el,{display:"flex",flexDirection:"column",gap:"14"},React39.createElement(el,{display:"flex",flexDirection:"row",justifyContent:"space-between"},u&&React39.createElement(el,{width:"30"}),React39.createElement(el,{paddingBottom:"0",paddingLeft:"8",paddingTop:"4"},React39.createElement(tL,{as:"h1",color:"modalText",id:c,size:u?"20":"18",weight:"heavy"},l.t("chains.title"))),React39.createElement(tq,{onClose:e})),!d&&React39.createElement(el,{marginX:"8",textAlign:u?"center":"left"},React39.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},l.t("chains.wrong_network"))),React39.createElement(el,{className:u?"_18dqw9x1":"_18dqw9x0",display:"flex",flexDirection:"column",gap:"4",padding:"2",paddingBottom:"16"},m.map(({iconBackground:e,iconUrl:t,id:a,name:o},l)=>React39.createElement(null,{key:a,chainId:a,currentChainId:n,switchChain:i,chainIconSize:p,isLoading:r===a,src:t,name:o,iconBackground:e,idx:l})),!d&&React39.createElement(React39.Fragment,null,React39.createElement(el,{background:"generalBorderDim",height:"1",marginX:"8"}),React39.createElement(nu,{onClick:()=>s(),testId:"chain-option-disconnect"},React39.createElement(el,{color:"error",fontFamily:"body",fontSize:"16",fontWeight:"bold"},React39.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",justifyContent:"space-between"},React39.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"4",height:p},React39.createElement(el,{alignItems:"center",color:"error",height:p,justifyContent:"center",marginRight:"8"},React39.createElement(nc,{size:Number(p)})),React39.createElement("div",null,l.t("chains.disconnect"))))))))))):null}nu.displayName="MenuButton";var np=({children:e,href:t})=>i.createElement(el,{as:"a",color:"accentColor",href:t,rel:"noreferrer",target:"_blank"},e),nm=({children:e})=>i.createElement(tL,{color:"modalTextSecondary",size:"12",weight:"medium"},e);function nf({compactModeEnabled:e=!1,getWallet:t}){let{disclaimer:n,learnMoreUrl:a}=(0,i.useContext)(tp),{i18n:r}=(0,i.useContext)(ek);return i.createElement(i.Fragment,null,i.createElement(el,{alignItems:"center",color:"accentColor",display:"flex",flexDirection:"column",height:"full",justifyContent:"space-around"},i.createElement(el,{marginBottom:"10"},!e&&i.createElement(tL,{color:"modalText",size:"18",weight:"heavy"},r.t("intro.title"))),i.createElement(el,{display:"flex",flexDirection:"column",gap:"32",justifyContent:"center",marginY:"20",style:{maxWidth:312}},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},i.createElement(el,{borderRadius:"6",height:"48",minWidth:"48",width:"48"},i.createElement(tO,null)),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},r.t("intro.digital_asset.title")),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},r.t("intro.digital_asset.description")))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},i.createElement(el,{borderRadius:"6",height:"48",minWidth:"48",width:"48"},i.createElement(tF,null)),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},r.t("intro.login.title")),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},r.t("intro.login.description"))))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",margin:"10"},i.createElement(tU,{label:r.t("intro.get.label"),onClick:t}),i.createElement(el,{as:"a",className:Q({active:"shrink",hover:"grow"}),display:"block",href:a,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},i.createElement(tL,{color:"accentColor",size:"14",weight:"bold"},r.t("intro.learn_more.label")))),n&&!e&&i.createElement(el,{marginBottom:"8",marginTop:"12",textAlign:"center"},i.createElement(n,{Link:np,Text:nm}))))}var nh=()=>i.createElement("svg",{fill:"none",height:"17",viewBox:"0 0 11 17",width:"11",xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Back"),i.createElement("path",{d:"M0.99707 8.6543C0.99707 9.08496 1.15527 9.44531 1.51562 9.79688L8.16016 16.3096C8.43262 16.5732 8.74902 16.7051 9.13574 16.7051C9.90918 16.7051 10.5508 16.0811 10.5508 15.3076C10.5508 14.9121 10.3838 14.5605 10.0938 14.2705L4.30176 8.64551L10.0938 3.0293C10.3838 2.74805 10.5508 2.3877 10.5508 2.00098C10.5508 1.23633 9.90918 0.603516 9.13574 0.603516C8.74902 0.603516 8.43262 0.735352 8.16016 0.999023L1.51562 7.51172C1.15527 7.85449 1.00586 8.21484 0.99707 8.6543Z",fill:"currentColor"})),ng=()=>i.createElement("svg",{fill:"none",height:"12",viewBox:"0 0 8 12",width:"8",xmlns:"http://www.w3.org/2000/svg"},i.createElement("title",null,"Info"),i.createElement("path",{d:"M3.64258 7.99609C4.19336 7.99609 4.5625 7.73828 4.68555 7.24609C4.69141 7.21094 4.70312 7.16406 4.70898 7.13477C4.80859 6.60742 5.05469 6.35547 6.04492 5.76367C7.14648 5.10156 7.67969 4.3457 7.67969 3.24414C7.67969 1.39844 6.17383 0.255859 3.95898 0.255859C2.32422 0.255859 1.05859 0.894531 0.548828 1.86719C0.396484 2.14844 0.320312 2.44727 0.320312 2.74023C0.314453 3.37305 0.742188 3.79492 1.42188 3.79492C1.91406 3.79492 2.33594 3.54883 2.53516 3.11523C2.78711 2.47656 3.23242 2.21289 3.83594 2.21289C4.55664 2.21289 5.10742 2.65234 5.10742 3.29102C5.10742 3.9707 4.7793 4.29883 3.81836 4.87891C3.02148 5.36523 2.50586 5.92773 2.50586 6.76562V6.90039C2.50586 7.55664 2.96289 7.99609 3.64258 7.99609ZM3.67188 11.4473C4.42773 11.4473 5.04297 10.8672 5.04297 10.1406C5.04297 9.41406 4.42773 8.83984 3.67188 8.83984C2.91602 8.83984 2.30664 9.41406 2.30664 10.1406C2.30664 10.8672 2.91602 11.4473 3.67188 11.4473Z",fill:"currentColor"})),nv=({"aria-label":e="Info",onClick:t})=>{let n=er();return i.createElement(el,{alignItems:"center","aria-label":e,as:"button",background:"closeButtonBackground",borderColor:"actionButtonBorder",borderRadius:"full",borderStyle:"solid",borderWidth:n?"0":"1",className:Q({active:"shrinkSm",hover:"growLg"}),color:"closeButton",display:"flex",height:n?"30":"28",justifyContent:"center",onClick:t,style:{willChange:"transform"},transition:"default",type:"button",width:n?"30":"28"},i.createElement(ng,null))},nb=e=>{let t=(0,i.useRef)(null),n=(0,i.useContext)(tm),a=ep(e);return(0,i.useEffect)(()=>{if(n&&t.current&&a)return function(e,t){let n;ny++;let a=[15,20,25,35,45],r=[],o=!1,i=0,l=0,s=nw();!function e(){for(let e of(o&&r.length<35&&function(){let e=a[Math.floor(Math.random()*a.length)],n=10*Math.random(),o=25*Math.random(),c=360*Math.random(),u=35*Math.random()*(.5>=Math.random()?-1:1),d=l-e/2,p=i-e/2,m=.5>=Math.random()?-1:1,f=document.createElement("div");f.innerHTML=`<img src="${t}" width="${e}" height="${e}" style="border-radius: 25%">`,f.setAttribute("style",`position:absolute;will-change:transform;top:${d}px;left:${p}px;transform:rotate(${c}deg)`),s.appendChild(f),r.push({direction:m,element:f,left:p,size:e,speedHorz:n,speedUp:o,spinSpeed:u,spinVal:c,top:d})}(),r))e.left=e.left-e.speedHorz*e.direction,e.top=e.top-e.speedUp,e.speedUp=Math.min(e.size,e.speedUp-1),e.spinVal=e.spinVal+e.spinSpeed,e.top>=Math.max(window.innerHeight,document.body.clientHeight)+e.size&&(r=r.filter(t=>t!==e),e.element.remove()),e.element.setAttribute("style",`position:absolute;will-change:transform;top:${e.top}px;left:${e.left}px;transform:rotate(${e.spinVal}deg)`);n=requestAnimationFrame(e)}();let c="ontouchstart"in window||navigator.msMaxTouchPoints,u=c?"touchstart":"mousedown",d=c?"touchend":"mouseup",p=c?"touchmove":"mousemove",m=e=>{"touches"in e?(i=e.touches?.[0].clientX,l=e.touches?.[0].clientY):(i=e.clientX,l=e.clientY)},f=e=>{m(e),o=!0},h=()=>{o=!1};return e.addEventListener(p,m,{passive:!1}),e.addEventListener(u,f),e.addEventListener(d,h),e.addEventListener("mouseleave",h),()=>{e.removeEventListener(p,m),e.removeEventListener(u,f),e.removeEventListener(d,h),e.removeEventListener("mouseleave",h);let t=setInterval(()=>{n&&0===r.length&&(cancelAnimationFrame(n),clearInterval(t),0==--ny&&s.remove())},500)}}(t.current,a)},[n,a]),t},nw=()=>{let e="_rk_coolMode",t=document.getElementById(e);if(t)return t;let n=document.createElement("div");return n.setAttribute("id",e),n.setAttribute("style","overflow:hidden;position:fixed;height:100%;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2147483647"),document.body.appendChild(n),n},ny=0,nC=({as:e="button",currentlySelected:t=!1,iconBackground:n,iconUrl:a,name:r,onClick:o,ready:l,recent:s,testId:c,isRainbowKitConnector:u,...d})=>{let p=nb(a),[m,f]=i.useState(!1),{i18n:h}=i.useContext(ek);return i.createElement(el,{display:"flex",flexDirection:"column",onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),ref:p},i.createElement(el,{as:e,borderRadius:"menuButton",borderStyle:"solid",borderWidth:"1",className:t?void 0:["g5kl0l0",Q({active:"shrink"})],disabled:t,onClick:o,padding:"5",style:{willChange:"transform"},testId:c,transition:"default",width:"full",...t?{background:"accentColor",borderColor:"selectedOptionBorder",boxShadow:"selectedWallet"}:{background:{hover:"menuItemBackground"}},...d},i.createElement(el,{color:t?"accentColorForeground":"modalText",disabled:!l,fontFamily:"body",fontSize:"16",fontWeight:"bold",transition:"default"},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"12"},i.createElement(em,{background:n,...!m&&u?{borderColor:"actionButtonBorder"}:{},useAsImage:!u,borderRadius:"6",height:"28",src:a,width:"28"}),i.createElement(el,null,i.createElement(el,{style:{marginTop:s?-2:void 0},maxWidth:"200"},r),s&&i.createElement(tL,{color:t?"accentColorForeground":"accentColor",size:"12",style:{lineHeight:1,marginTop:-1},weight:"medium"},h.t("connect.recent")))))))};nC.displayName="ModalSelection";var nx="rk-latest-id";function nj(e){localStorage.setItem(nx,e)}function nE(){localStorage.removeItem(nx)}var nk=(e,t=1)=>{let n=e.replace("#","");3===n.length&&(n=`${n[0]}${n[0]}${n[1]}${n[1]}${n[2]}${n[2]}`);let a=Number.parseInt(n.substring(0,2),16),r=Number.parseInt(n.substring(2,4),16),o=Number.parseInt(n.substring(4,6),16);return t>1&&t<=100&&(t/=100),`rgba(${a},${r},${o},${t})`},nB=e=>e?[nk(e,.2),nk(e,.14),nk(e,.1)]:null,nI=e=>/^#([0-9a-f]{3}){1,2}$/i.test(e),nT=async()=>(await n.e(441).then(n.bind(n,80441))).default,nR=()=>i.createElement(em,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:nT,width:"48"}),nN=async()=>(await n.e(4435).then(n.bind(n,54435))).default,nS=()=>i.createElement(em,{background:"#e3a5e8",borderColor:"generalBorder",borderRadius:"10",height:"48",src:nN,width:"48"}),nA=async()=>(await n.e(1736).then(n.bind(n,81736))).default,nD=()=>i.createElement(em,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:nA,width:"48"}),nW=async()=>(await n.e(3060).then(n.bind(n,43060))).default,nO=()=>i.createElement(em,{background:"#515a70",borderColor:"generalBorder",borderRadius:"10",height:"48",src:nW,width:"48"}),n_=(e,t)=>{let n=Array.prototype.slice.call(H.create(e,{errorCorrectionLevel:t}).modules.data,0),a=Math.sqrt(n.length);return n.reduce((e,t,n)=>(n%a==0?e.push([t]):e[e.length-1].push(t))&&e,[])};function nF({ecl:e="M",logoBackground:t,logoMargin:n=10,logoSize:a=50,logoUrl:r,size:o=200,uri:l}){let s=o-2*Number.parseInt("20",10),c=(0,i.useMemo)(()=>{let t=[],n=n_(l,e),r=s/n.length;[{x:0,y:0},{x:1,y:0},{x:0,y:1}].forEach(({x:e,y:a})=>{let o=(n.length-7)*r*e,l=(n.length-7)*r*a;for(let n=0;n<3;n++)t.push(i.createElement("rect",{fill:n%2!=0?"white":"black",height:r*(7-2*n),key:`${n}-${e}-${a}`,rx:-((n-2)*5)+2*(0===n),ry:-((n-2)*5)+2*(0===n),width:r*(7-2*n),x:o+r*n,y:l+r*n}))});let o=Math.floor((a+25)/r),c=n.length/2-o/2,u=n.length/2+o/2-1;return n.forEach((e,a)=>{e.forEach((e,o)=>{!n[a][o]||a<7&&o<7||a>n.length-8&&o<7||a<7&&o>n.length-8||a>c&&a<u&&o>c&&o<u||t.push(i.createElement("circle",{cx:a*r+r/2,cy:o*r+r/2,fill:"black",key:`circle-${a}-${o}`,r:r/3}))})}),t},[e,a,s,l]),u=s/2-a/2,d=a+2*n;return i.createElement(el,{borderColor:"generalBorder",borderRadius:"menuButton",borderStyle:"solid",borderWidth:"1",className:"_1vwt0cg0",padding:"20",width:"max"},i.createElement(el,{style:{height:s,userSelect:"none",width:s},userSelect:"none"},i.createElement(el,{display:"flex",justifyContent:"center",position:"relative",style:{height:0,top:u,width:s},width:"full"},i.createElement(em,{background:t,borderColor:{custom:"rgba(0, 0, 0, 0.06)"},borderRadius:"13",height:a,src:r,width:a})),i.createElement("svg",{height:s,style:{all:"revert"},width:s},i.createElement("title",null,"QR Code"),i.createElement("defs",null,i.createElement("clipPath",{id:"clip-wrapper"},i.createElement("rect",{height:d,width:d})),i.createElement("clipPath",{id:"clip-logo"},i.createElement("rect",{height:a,width:a}))),i.createElement("rect",{fill:"transparent",height:s,width:s}),c)))}var nL=async()=>{switch(ty()){case"Arc":return(await n.e(7191).then(n.bind(n,67191))).default;case"Brave":return(await n.e(9934).then(n.bind(n,9934))).default;case"Chrome":return(await n.e(5825).then(n.bind(n,35825))).default;case"Edge":return(await n.e(3161).then(n.bind(n,63161))).default;case"Firefox":return(await n.e(4847).then(n.bind(n,54847))).default;case"Opera":return(await n.e(7251).then(n.bind(n,87251))).default;case"Safari":return(await n.e(7449).then(n.bind(n,57449))).default;default:return(await n.e(6862).then(n.bind(n,96862))).default}},nM=async()=>{switch(tx()){case"Windows":return(await n.e(4656).then(n.bind(n,54656))).default;case"macOS":return(await n.e(6320).then(n.bind(n,36320))).default;default:return(await n.e(4206).then(n.bind(n,4206))).default}};function nU({getWalletDownload:e,compactModeEnabled:t}){let n=tD().filter(e=>e.isRainbowKitConnector).splice(0,5),{i18n:a}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",marginTop:"18",width:"full"},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"28",height:"full",width:"full"},n?.filter(e=>e.extensionDownloadUrl||e.desktopDownloadUrl||e.qrCode&&e.downloadUrls?.qrCode).map(t=>{let{downloadUrls:n,iconBackground:r,iconUrl:o,id:l,name:s,qrCode:c}=t,u=n?.qrCode&&c,d=!!t.extensionDownloadUrl,p=n?.qrCode&&d,m=n?.qrCode&&!!t.desktopDownloadUrl;return i.createElement(el,{alignItems:"center",display:"flex",gap:"16",justifyContent:"space-between",key:t.id,width:"full"},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16"},i.createElement(em,{background:r,borderColor:"actionButtonBorder",borderRadius:"10",height:"48",src:o,width:"48"}),i.createElement(el,{display:"flex",flexDirection:"column",gap:"2"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},s),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},p?a.t("get.mobile_and_extension.description"):m?a.t("get.mobile_and_desktop.description"):u?a.t("get.mobile.description"):d?a.t("get.extension.description"):null))),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tU,{label:a.t("get.action.label"),onClick:()=>e(l),type:"secondary"})))})),i.createElement(el,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"column",gap:"8",justifyContent:"space-between",marginBottom:"4",paddingY:"8",style:{maxWidth:275,textAlign:"center"}},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},a.t("get.looking_for.title")),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},t?a.t("get.looking_for.desktop.compact_description"):a.t("get.looking_for.desktop.wide_description"))))}function nP({changeWalletStep:e,compactModeEnabled:t,connectionError:n,onClose:a,qrCodeUri:r,reconnect:o,wallet:l}){let{downloadUrls:s,iconBackground:c,iconUrl:u,name:d,qrCode:p,ready:m,showWalletConnectModal:f,getDesktopUri:h}=l,g=!!h,v=tw(),{i18n:b}=(0,i.useContext)(ek),w=!!l.extensionDownloadUrl,y=s?.qrCode&&w,C=s?.qrCode&&!!l.desktopDownloadUrl,x=p&&r,j=async()=>{let e=await h?.();window.open(e,v?"_blank":"_self")},E=f?{description:t?b.t("connect.walletconnect.description.compact"):b.t("connect.walletconnect.description.full"),label:b.t("connect.walletconnect.open.label"),onClick:()=>{a(),f()}}:x?{description:b.t("connect.secondary_action.get.description",{wallet:d}),label:b.t("connect.secondary_action.get.label"),onClick:()=>e(y||C?"DOWNLOAD_OPTIONS":"DOWNLOAD")}:null,{width:k}=tf();return i.createElement(el,{display:"flex",flexDirection:"column",height:"full",width:"full"},x?i.createElement(el,{alignItems:"center",display:"flex",height:"full",justifyContent:"center"},i.createElement(nF,{logoBackground:c,logoSize:t?60:72,logoUrl:u,size:t?318:k&&k<768?Math.max(280,Math.min(k-308,382)):382,uri:r})):i.createElement(el,{alignItems:"center",display:"flex",justifyContent:"center",style:{flexGrow:1}},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"8"},i.createElement(el,{borderRadius:"10",height:"44",overflow:"hidden"},i.createElement(em,{useAsImage:!l.isRainbowKitConnector,height:"44",src:u,width:"44"})),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"4",paddingX:"32",style:{textAlign:"center"}},i.createElement(tL,{color:"modalText",size:"18",weight:"bold"},m?b.t("connect.status.opening",{wallet:d}):w?b.t("connect.status.not_installed",{wallet:d}):b.t("connect.status.not_available",{wallet:d})),!m&&w?i.createElement(el,{paddingTop:"20"},i.createElement(tU,{href:l.extensionDownloadUrl,label:b.t("connect.secondary_action.install.label"),type:"secondary"})):null,m&&!x&&i.createElement(i.Fragment,null,i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",justifyContent:"center"},i.createElement(tL,{color:"modalTextSecondary",size:"14",textAlign:"center",weight:"medium"},b.t("connect.status.confirm"))),i.createElement(el,{alignItems:"center",color:"modalText",display:"flex",flexDirection:"row",height:"32",marginTop:"8"},n?i.createElement(tU,{label:b.t("connect.secondary_action.retry.label"),onClick:async()=>{g&&j(),o(l)}}):i.createElement(el,{color:"modalTextSecondary"},i.createElement(eh,null))))))),i.createElement(el,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"row",gap:"8",height:"28",justifyContent:"space-between",marginTop:"12"},m&&E&&i.createElement(i.Fragment,null,i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},E.description),i.createElement(tU,{label:E.label,onClick:E.onClick,type:"secondary"}))))}var nq=({actionLabel:e,description:t,iconAccent:n,iconBackground:a,iconUrl:r,isCompact:o,onAction:l,title:s,url:c,variant:u})=>{let d="browser"===u,p=!d&&n&&nB(n);return i.createElement(el,{alignItems:"center",borderRadius:"13",display:"flex",justifyContent:"center",overflow:"hidden",paddingX:o?"18":"44",position:"relative",style:{flex:1,isolation:"isolate"},width:"full"},i.createElement(el,{borderColor:"actionButtonBorder",borderRadius:"13",borderStyle:"solid",borderWidth:"1",style:{bottom:"0",left:"0",position:"absolute",right:"0",top:"0",zIndex:1}}),d&&i.createElement(el,{background:"downloadTopCardBackground",height:"full",position:"absolute",style:{zIndex:0},width:"full"},i.createElement(el,{display:"flex",flexDirection:"row",justifyContent:"space-between",style:{bottom:"0",filter:"blur(20px)",left:"0",position:"absolute",right:"0",top:"0",transform:"translate3d(0, 0, 0)"}},i.createElement(el,{style:{filter:"blur(100px)",marginLeft:-27,marginTop:-20,opacity:.6,transform:"translate3d(0, 0, 0)"}},i.createElement(em,{borderRadius:"full",height:"200",src:r,width:"200"})),i.createElement(el,{style:{filter:"blur(100px)",marginRight:0,marginTop:105,opacity:.6,overflow:"auto",transform:"translate3d(0, 0, 0)"}},i.createElement(em,{borderRadius:"full",height:"200",src:r,width:"200"})))),!d&&p&&i.createElement(el,{background:"downloadBottomCardBackground",style:{bottom:"0",left:"0",position:"absolute",right:"0",top:"0"}},i.createElement(el,{position:"absolute",style:{background:`radial-gradient(50% 50% at 50% 50%, ${p[0]} 0%, ${p[1]} 25%, rgba(0,0,0,0) 100%)`,height:564,left:-215,top:-197,transform:"translate3d(0, 0, 0)",width:564}}),i.createElement(el,{position:"absolute",style:{background:`radial-gradient(50% 50% at 50% 50%, ${p[2]} 0%, rgba(0, 0, 0, 0) 100%)`,height:564,left:-1,top:-76,transform:"translate3d(0, 0, 0)",width:564}})),i.createElement(el,{alignItems:"flex-start",display:"flex",flexDirection:"row",gap:"24",height:"max",justifyContent:"center",style:{zIndex:1}},i.createElement(el,null,i.createElement(em,{height:"60",src:r,width:"60",...a?{background:a,borderColor:"generalBorder",borderRadius:"10"}:null})),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4",style:{flex:1},width:"full"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},s),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},t),i.createElement(el,{marginTop:"14",width:"max"},i.createElement(tU,{href:c,label:e,onClick:l,size:"medium"})))))};function nz({changeWalletStep:e,wallet:t}){let n=ty(),a=tx(),r="compact"===(0,i.useContext)(tv),{desktop:o,desktopDownloadUrl:l,extension:s,extensionDownloadUrl:c,mobileDownloadUrl:u}=t,{i18n:d}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"24",height:"full",marginBottom:"8",marginTop:"4",width:"full"},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"8",height:"full",justifyContent:"center",width:"full"},c&&i.createElement(nq,{actionLabel:d.t("get_options.extension.download.label",{browser:n}),description:d.t("get_options.extension.description"),iconUrl:nL,isCompact:r,onAction:()=>e(s?.instructions?"INSTRUCTIONS_EXTENSION":"CONNECT"),title:d.t("get_options.extension.title",{wallet:t.name,browser:n}),url:c,variant:"browser"}),l&&i.createElement(nq,{actionLabel:d.t("get_options.desktop.download.label",{platform:a}),description:d.t("get_options.desktop.description"),iconUrl:nM,isCompact:r,onAction:()=>e(o?.instructions?"INSTRUCTIONS_DESKTOP":"CONNECT"),title:d.t("get_options.desktop.title",{wallet:t.name,platform:a}),url:l,variant:"desktop"}),u&&i.createElement(nq,{actionLabel:d.t("get_options.mobile.download.label",{wallet:t.name}),description:d.t("get_options.mobile.description"),iconAccent:t.iconAccent,iconBackground:t.iconBackground,iconUrl:t.iconUrl,isCompact:r,onAction:()=>{e("DOWNLOAD")},title:d.t("get_options.mobile.title",{wallet:t.name}),variant:"app"})))}function n$({changeWalletStep:e,wallet:t}){let{downloadUrls:n,qrCode:a}=t,{i18n:r}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"24",height:"full",width:"full"},i.createElement(el,{style:{maxWidth:220,textAlign:"center"}},i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"semibold"},r.t("get_mobile.description"))),i.createElement(el,{height:"full"},n?.qrCode?i.createElement(nF,{logoSize:0,size:268,uri:n.qrCode}):null),i.createElement(el,{alignItems:"center",borderRadius:"10",display:"flex",flexDirection:"row",gap:"8",height:"34",justifyContent:"space-between",marginBottom:"12",paddingY:"8"},i.createElement(tU,{label:r.t("get_mobile.continue.label"),onClick:()=>e(a?.instructions?"INSTRUCTIONS_MOBILE":"CONNECT")})))}var nH={connect:()=>i.createElement(nR,null),create:()=>i.createElement(nS,null),install:e=>i.createElement(em,{background:e.iconBackground,borderColor:"generalBorder",borderRadius:"10",height:"48",src:e.iconUrl,width:"48"}),refresh:()=>i.createElement(nD,null),scan:()=>i.createElement(nO,null)};function nY({connectWallet:e,wallet:t}){let{i18n:n}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},i.createElement(el,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},t?.qrCode?.instructions?.steps.map((e,a)=>i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:a},i.createElement(el,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},nH[e.step]?.(t)),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},n.t(e.title,void 0,{rawKeyIfTranslationMissing:!0})),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},n.t(e.description,void 0,{rawKeyIfTranslationMissing:!0})))))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},i.createElement(tU,{label:n.t("get_instructions.mobile.connect.label"),onClick:()=>e(t)}),i.createElement(el,{as:"a",className:Q({active:"shrink",hover:"grow"}),display:"block",href:t?.qrCode?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},i.createElement(tL,{color:"accentColor",size:"14",weight:"bold"},n.t("get_instructions.mobile.learn_more.label")))))}function nK({wallet:e}){let{i18n:t}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},i.createElement(el,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},e?.extension?.instructions?.steps.map((n,a)=>i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:a},i.createElement(el,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},nH[n.step]?.(e)),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},t.t(n.title,void 0,{rawKeyIfTranslationMissing:!0})),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},t.t(n.description,void 0,{rawKeyIfTranslationMissing:!0})))))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},i.createElement(tU,{label:t.t("get_instructions.extension.refresh.label"),onClick:window.location.reload.bind(window.location)}),i.createElement(el,{as:"a",className:Q({active:"shrink",hover:"grow"}),display:"block",href:e?.extension?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},i.createElement(tL,{color:"accentColor",size:"14",weight:"bold"},t.t("get_instructions.extension.learn_more.label")))))}function nV({connectWallet:e,wallet:t}){let{i18n:n}=(0,i.useContext)(ek);return i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",width:"full"},i.createElement(el,{display:"flex",flexDirection:"column",gap:"28",height:"full",justifyContent:"center",paddingY:"32",style:{maxWidth:320}},t?.desktop?.instructions?.steps.map((e,a)=>i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"16",key:a},i.createElement(el,{borderRadius:"10",height:"48",minWidth:"48",overflow:"hidden",position:"relative",width:"48"},nH[e.step]?.(t)),i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},i.createElement(tL,{color:"modalText",size:"14",weight:"bold"},n.t(e.title,void 0,{rawKeyIfTranslationMissing:!0})),i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},n.t(e.description,void 0,{rawKeyIfTranslationMissing:!0})))))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"12",justifyContent:"center",marginBottom:"16"},i.createElement(tU,{label:n.t("get_instructions.desktop.connect.label"),onClick:()=>e(t)}),i.createElement(el,{as:"a",className:Q({active:"shrink",hover:"grow"}),display:"block",href:t?.desktop?.instructions?.learnMoreUrl,paddingX:"12",paddingY:"4",rel:"noreferrer",style:{willChange:"transform"},target:"_blank",transition:"default"},i.createElement(tL,{color:"accentColor",size:"14",weight:"bold"},n.t("get_instructions.desktop.learn_more.label")))))}function nX({onClose:e}){let t,[n,a]=(0,i.useState)(),[r,o]=(0,i.useState)(),[l,s]=(0,i.useState)(),c=!!r?.qrCode&&l,[u,d]=(0,i.useState)(!1),p=(0,i.useContext)(tv)===tg.COMPACT,{disclaimer:m}=(0,i.useContext)(tp),{i18n:f}=(0,i.useContext)(ek),h=tw(),g=(0,i.useRef)(!1),{connector:v}=(0,i.useContext)(th),b=tD(!v).filter(e=>e.ready||!!e.extensionDownloadUrl).sort((e,t)=>e.groupIndex-t.groupIndex),w=tD(),y=function(e,t){let n={};for(let a of e){let e=t(a);e&&(n[e]||(n[e]=[]),n[e].push(a))}return n}(b,e=>e.groupName),C=["Recommended","Other","Popular","More","Others","Installed"];(0,i.useEffect)(()=>{v&&!g.current&&(I("CONNECT"),k(v),g.current=!0)},[v]);let x=e=>{d(!1),e.ready&&e?.connect?.()?.catch(()=>{d(!0)})},j=async e=>{let t=b.find(t=>e.id===t.id);t?.getDesktopUri&&setTimeout(async()=>{let e=await t?.getDesktopUri?.();e&&window.open(e,h?"_blank":"_self")},0)},E=async e=>{let t=b.find(t=>e.id===t.id),n=await t?.getQrCodeUri?.();s(n),setTimeout(()=>{o(t),I("CONNECT")},50*!n)},k=async e=>{nj(e.id),e.ready&&(E(e),j(e)),x(e),a(e.id),e.ready||(o(e),I(e?.extensionDownloadUrl?"DOWNLOAD_OPTIONS":"CONNECT"))},B=()=>{a(void 0),o(void 0),s(void 0)},I=(e,t=!1)=>{t&&"GET"===e&&"GET"===T?B():t||"GET"!==e?t||"CONNECT"!==e||R("CONNECT"):R("GET"),S(e)},[T,R]=(0,i.useState)("NONE"),[N,S]=(0,i.useState)("NONE"),A=null,D=null,W=null;(0,i.useEffect)(()=>{d(!1)},[N,r]);let O=!!(r?.extensionDownloadUrl&&r?.mobileDownloadUrl);switch(N){case"NONE":A=i.createElement(nf,{getWallet:()=>I("GET")});break;case"LEARN_COMPACT":A=i.createElement(nf,{compactModeEnabled:p,getWallet:()=>I("GET")}),D=f.t("intro.title"),W="NONE";break;case"GET":A=i.createElement(nU,{getWalletDownload:e=>{let t=w.find(t=>e===t.id),n=t?.downloadUrls?.qrCode,a=!!t?.desktopDownloadUrl,r=!!t?.extensionDownloadUrl;o(t),n&&(r||a)?I("DOWNLOAD_OPTIONS"):n?I("DOWNLOAD"):a?I("INSTRUCTIONS_DESKTOP"):I("INSTRUCTIONS_EXTENSION")},compactModeEnabled:p}),D=f.t("get.title"),W=p?"LEARN_COMPACT":"NONE";break;case"CONNECT":A=r&&i.createElement(nP,{changeWalletStep:I,compactModeEnabled:p,connectionError:u,onClose:e,qrCodeUri:l,reconnect:x,wallet:r}),D=c&&("WalletConnect"===r.name?f.t("connect_scan.fallback_title"):f.t("connect_scan.title",{wallet:r.name})),W=p?v?null:"NONE":null,t=p?v?()=>{}:B:()=>{};break;case"DOWNLOAD_OPTIONS":A=r&&i.createElement(nz,{changeWalletStep:I,wallet:r}),D=r&&f.t("get_options.short_title",{wallet:r.name}),W=v?"CONNECT":p?"NONE":T;break;case"DOWNLOAD":A=r&&i.createElement(n$,{changeWalletStep:I,wallet:r}),D=r&&f.t("get_mobile.title",{wallet:r.name}),W=O?"DOWNLOAD_OPTIONS":T;break;case"INSTRUCTIONS_MOBILE":A=r&&i.createElement(nY,{connectWallet:k,wallet:r}),D=r&&f.t("get_options.title",{wallet:p&&r.shortName||r.name}),W="DOWNLOAD";break;case"INSTRUCTIONS_EXTENSION":A=r&&i.createElement(nK,{wallet:r}),D=r&&f.t("get_options.title",{wallet:p&&r.shortName||r.name}),W="DOWNLOAD_OPTIONS";break;case"INSTRUCTIONS_DESKTOP":A=r&&i.createElement(nV,{connectWallet:k,wallet:r}),D=r&&f.t("get_options.title",{wallet:p&&r.shortName||r.name}),W="DOWNLOAD_OPTIONS"}return i.createElement(el,{display:"flex",flexDirection:"row",style:{maxHeight:p?468:504}},(!p||"NONE"===N)&&i.createElement(el,{className:p?"_1vwt0cg4":"_1vwt0cg3",display:"flex",flexDirection:"column",marginTop:"16"},i.createElement(el,{display:"flex",justifyContent:"space-between"},p&&m&&i.createElement(el,{marginLeft:"16",width:"28"},i.createElement(nv,{onClick:()=>I("LEARN_COMPACT")})),p&&!m&&i.createElement(el,{marginLeft:"16",width:"28"}),i.createElement(el,{marginLeft:p?"0":"6",paddingBottom:"8",paddingTop:"2",paddingX:"18"},i.createElement(tL,{as:"h1",color:"modalText",id:"rk_connect_title",size:"18",weight:"heavy",testId:"connect-header-label"},f.t("connect.title"))),p&&i.createElement(el,{marginRight:"16"},i.createElement(tq,{onClose:e}))),i.createElement(el,{className:"_1vwt0cg2 ju367v7a ju367v7v",paddingBottom:"18"},Object.entries(y).map(([e,t],a)=>t.length>0&&i.createElement(i.Fragment,{key:a},e?i.createElement(el,{marginBottom:"8",marginTop:"16",marginX:"6"},i.createElement(tL,{color:"Installed"===e?"accentColor":"modalTextSecondary",size:"14",weight:"bold"},C.includes(e)?f.t(`connector_group.${e.toLowerCase()}`):e)):null,i.createElement(el,{display:"flex",flexDirection:"column",gap:"4"},t.map(e=>i.createElement(nC,{currentlySelected:e.id===n,iconBackground:e.iconBackground,iconUrl:e.iconUrl,key:e.id,name:e.name,onClick:()=>k(e),ready:e.ready,recent:e.recent,testId:`wallet-option-${e.id}`,isRainbowKitConnector:e.isRainbowKitConnector})))))),p&&i.createElement(i.Fragment,null,i.createElement(el,{background:"generalBorder",height:"1",marginTop:"-1"}),m?i.createElement(el,{paddingX:"24",paddingY:"16",textAlign:"center"},i.createElement(m,{Link:np,Text:nm})):i.createElement(el,{alignItems:"center",display:"flex",justifyContent:"space-between",paddingX:"24",paddingY:"16"},i.createElement(el,{paddingY:"4"},i.createElement(tL,{color:"modalTextSecondary",size:"14",weight:"medium"},f.t("connect.new_to_ethereum.description"))),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"row",gap:"4",justifyContent:"center"},i.createElement(el,{className:Q({active:"shrink",hover:"grow"}),cursor:"pointer",onClick:()=>I("LEARN_COMPACT"),paddingY:"4",style:{willChange:"transform"},transition:"default"},i.createElement(tL,{color:"accentColor",size:"14",weight:"bold"},f.t("connect.new_to_ethereum.learn_more.label"))))))),(!p||"NONE"!==N)&&i.createElement(i.Fragment,null,!p&&i.createElement(el,{background:"generalBorder",minWidth:"1",width:"1"}),i.createElement(el,{display:"flex",flexDirection:"column",margin:"16",style:{flexGrow:1}},i.createElement(el,{alignItems:"center",display:"flex",justifyContent:"space-between",marginBottom:"12"},i.createElement(el,{width:"28"},W&&i.createElement(el,{as:"button",className:Q({active:"shrinkSm",hover:"growLg"}),color:"accentColor",onClick:()=>{W&&I(W,!0),t?.()},paddingX:"8",paddingY:"4",style:{boxSizing:"content-box",height:17,willChange:"transform"},transition:"default",type:"button"},i.createElement(nh,null))),i.createElement(el,{display:"flex",justifyContent:"center",style:{flexGrow:1}},D&&i.createElement(tL,{color:"modalText",size:"18",textAlign:"center",weight:"heavy"},D)),i.createElement(tq,{onClose:e})),i.createElement(el,{display:"flex",flexDirection:"column",style:{minHeight:p?396:432}},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"6",height:"full",justifyContent:"center",marginX:"8"},A)))))}var nG=({wallet:e})=>i.createElement("svg",{className:"_1am14413",viewBox:"0 0 86 86",width:"86",height:"86"},i.createElement("title",null,"Loading"),i.createElement("rect",{x:"3",y:"3",width:80,height:80,rx:20,ry:20,strokeDasharray:`${53.333333333333336} ${320/3}`,strokeDashoffset:160,className:"_1am14412",style:{stroke:e?.iconAccent||"#0D3887"}}));function nZ({onClose:e,wallet:t,connecting:n}){let{connect:a,iconBackground:r,iconUrl:o,id:l,name:s,getMobileUri:c,ready:u,shortName:d,showWalletConnectModal:p}=t,m=nb(o);(0,i.useRef)(!1);let{i18n:f}=(0,i.useContext)(ek),h=(0,i.useCallback)(async()=>{let t=async()=>{let e=await c?.();if(e)if(e&&function({mobileUri:e,name:t}){localStorage.setItem(tH,JSON.stringify({href:e.split("?")[0],name:t}))}({mobileUri:e,name:s}),e.startsWith("http")){let t=document.createElement("a");t.href=e,t.target="_blank",t.rel="noreferrer noopener",t.click()}else window.location.href=e};if("walletConnect"!==l&&t(),p){p(),e?.();return}a?.()},[a,c,p,e,s,l]);return i.createElement(el,{as:"button",color:u?"modalText":"modalTextSecondary",disabled:!u,fontFamily:"body",key:l,onClick:h,ref:m,style:{overflow:"visible",textAlign:"center"},testId:`wallet-option-${l}`,type:"button",width:"full"},i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",justifyContent:"center"},i.createElement(el,{display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:"8",paddingTop:"10",position:"relative"},n?i.createElement(nG,{wallet:t}):null,i.createElement(em,{background:r,borderRadius:"13",boxShadow:"walletLogo",height:"60",src:o,width:"60"})),n?null:i.createElement(el,{display:"flex",flexDirection:"column",textAlign:"center"},i.createElement(tL,{as:"h2",color:t.ready?"modalText":"modalTextSecondary",size:"13",weight:"medium"},i.createElement(el,{as:"span",position:"relative"},d??s,!t.ready&&" (unsupported)")),t.recent&&i.createElement(tL,{color:"accentColor",size:"12",weight:"medium"},f.t("connect.recent")))))}function nQ({onClose:e}){let t=tD().filter(e=>e.isRainbowKitConnector),{disclaimer:n,learnMoreUrl:a}=(0,i.useContext)(tp),r=null,o=null,l=!1,s=null,[c,u]=(0,i.useState)("CONNECT"),{i18n:d}=(0,i.useContext)(ek),p=ea();switch(c){case"CONNECT":r=d.t("connect.title"),l=!0,o=i.createElement(el,null,i.createElement(el,{background:"profileForeground",className:"_1am14410",display:"flex",paddingBottom:"20",paddingTop:"6"},i.createElement(el,{display:"flex",style:{margin:"0 auto"}},t.filter(e=>e.ready).map(t=>i.createElement(el,{key:t.id,paddingX:"20"},i.createElement(el,{width:"60"},i.createElement(nZ,{onClose:e,wallet:t})))))),i.createElement(el,{background:"generalBorder",height:"1",marginBottom:"32",marginTop:"-1"}),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"32",paddingX:"32",style:{textAlign:"center"}},i.createElement(el,{display:"flex",flexDirection:"column",gap:"8",textAlign:"center"},i.createElement(tL,{color:"modalText",size:"16",weight:"bold"},d.t("intro.title")),i.createElement(tL,{color:"modalTextSecondary",size:"16"},d.t("intro.description")))),i.createElement(el,{paddingTop:"32",paddingX:"20"},i.createElement(el,{display:"flex",gap:"14",justifyContent:"center"},i.createElement(tU,{label:d.t("intro.get.label"),onClick:()=>u("GET"),size:"large",type:"secondary"}),i.createElement(tU,{href:a,label:d.t("intro.learn_more.label"),size:"large",type:"secondary"}))),n&&i.createElement(el,{marginTop:"28",marginX:"32",textAlign:"center"},i.createElement(n,{Link:np,Text:nm})));break;case"GET":{r=d.t("get.title"),s="CONNECT";let e=t?.filter(e=>e.downloadUrls?.ios||e.downloadUrls?.android||e.downloadUrls?.mobile)?.splice(0,3);o=i.createElement(el,null,i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",height:"full",marginBottom:"36",marginTop:"5",paddingTop:"12",width:"full"},e.map((t,n)=>{let{downloadUrls:a,iconBackground:r,iconUrl:o,name:l}=t;return a?.ios||a?.android||a?.mobile?i.createElement(el,{display:"flex",gap:"16",key:t.id,paddingX:"20",width:"full"},i.createElement(el,{style:{minHeight:48,minWidth:48}},i.createElement(em,{background:r,borderColor:"generalBorder",borderRadius:"10",height:"48",src:o,width:"48"})),i.createElement(el,{display:"flex",flexDirection:"column",width:"full"},i.createElement(el,{alignItems:"center",display:"flex",height:"48"},i.createElement(el,{width:"full"},i.createElement(tL,{color:"modalText",size:"18",weight:"bold"},l)),i.createElement(tU,{href:(p?a?.ios:a?.android)||a?.mobile,label:d.t("get.action.label"),size:"small",type:"secondary"})),n<e.length-1&&i.createElement(el,{background:"generalBorderDim",height:"1",marginY:"10",width:"full"}))):null})),i.createElement(el,{style:{marginBottom:"42px"}}),i.createElement(el,{alignItems:"center",display:"flex",flexDirection:"column",gap:"36",paddingX:"36",style:{textAlign:"center"}},i.createElement(el,{display:"flex",flexDirection:"column",gap:"12",textAlign:"center"},i.createElement(tL,{color:"modalText",size:"16",weight:"bold"},d.t("get.looking_for.title")),i.createElement(tL,{color:"modalTextSecondary",size:"16"},d.t("get.looking_for.mobile.description")))))}}return i.createElement(el,{display:"flex",flexDirection:"column",paddingBottom:"36"},i.createElement(el,{background:l?"profileForeground":"modalBackground",display:"flex",flexDirection:"column",paddingBottom:"4",paddingTop:"14"},i.createElement(el,{display:"flex",justifyContent:"center",paddingBottom:"6",paddingX:"20",position:"relative"},s&&i.createElement(el,{display:"flex",position:"absolute",style:{left:0,marginBottom:-20,marginTop:-20}},i.createElement(el,{alignItems:"center",as:"button",className:Q({active:"shrinkSm",hover:"growLg"}),color:"accentColor",display:"flex",marginLeft:"4",marginTop:"20",onClick:()=>u(s),padding:"16",style:{height:17,willChange:"transform"},transition:"default",type:"button"},i.createElement(nh,null))),i.createElement(el,{marginTop:"4",textAlign:"center",width:"full"},i.createElement(tL,{as:"h1",color:"modalText",id:"rk_connect_title",size:"20",weight:"bold"},r)),i.createElement(el,{alignItems:"center",display:"flex",height:"32",paddingRight:"14",position:"absolute",right:"0"},i.createElement(el,{style:{marginBottom:-20,marginTop:-20}},i.createElement(tq,{onClose:e}))))),i.createElement(el,{display:"flex",flexDirection:"column"},o))}var nJ=({onClose:e})=>{let{connector:t}=useContext18(th),{i18n:n}=useContext18(ek),a=t?.name||"";return React55.createElement(el,null,React55.createElement(el,{display:"flex",paddingBottom:"32",justifyContent:"center",alignItems:"center",background:"profileForeground",flexDirection:"column"},React55.createElement(el,{width:"full",display:"flex",justifyContent:"flex-end",marginTop:"18",marginRight:"24"},React55.createElement(tq,{onClose:e})),React55.createElement(el,{width:"60"},React55.createElement(nZ,{onClose:e,wallet:t,connecting:!0})),React55.createElement(el,{marginTop:"20"},React55.createElement(tL,{textAlign:"center",color:"modalText",size:"18",weight:"semibold"},n.t("connect.status.connect_mobile",{wallet:a}))),React55.createElement(el,{maxWidth:"full",marginTop:"8"},React55.createElement(tL,{textAlign:"center",color:"modalText",size:"16",weight:"medium"},n.t("connect.status.confirm_mobile",{wallet:a})))))};function n1({onClose:e}){let{connector:t}=useContext19(th);return er()?t?React56.createElement(nJ,{onClose:e}):React56.createElement(nQ,{onClose:e}):React56.createElement(nX,{onClose:e})}function n0({onClose:e,open:t}){let n="rk_connect_title",a=et(),{disconnect:r}=useDisconnect3(),{isConnecting:o}=useAccount12(),i=React57.useCallback(()=>{e(),r()},[e,r]),l=React57.useCallback(()=>{o&&r(),e()},[e,r,o]);return"disconnected"===a?React57.createElement(tJ,{onClose:l,open:t,titleId:n},React57.createElement(t1,{bottomSheetOnMobile:!0,padding:"0",wide:!0},React57.createElement(n1,{onClose:l}))):"unauthenticated"===a?React57.createElement(tJ,{onClose:i,open:t,titleId:n},React57.createElement(t1,{bottomSheetOnMobile:!0,padding:"0"},React57.createElement(t$,{onClose:i,onCloseModal:e}))):null}function n3(){let[e,t]=useState14(!1);return{closeModal:useCallback10(()=>t(!1),[]),isModalOpen:e,openModal:useCallback10(()=>t(!0),[])}}var n6=(0,i.createContext)({accountModalOpen:!1,chainModalOpen:!1,connectModalOpen:!1,isWalletConnectModalOpen:!1,setIsWalletConnectModalOpen:()=>{}});function n7(){let{accountModalOpen:e,chainModalOpen:t,connectModalOpen:n}=(0,i.useContext)(n6);return{accountModalOpen:e,chainModalOpen:t,connectModalOpen:n}}function n2(){let{isWalletConnectModalOpen:e,setIsWalletConnectModalOpen:t}=(0,i.useContext)(n6);return{isWalletConnectModalOpen:e,setIsWalletConnectModalOpen:t}}function n4(){let{connectModalOpen:e,openConnectModal:t}=(0,i.useContext)(n6),{isWalletConnectModalOpen:n}=n2();return{connectModalOpen:e||n,openConnectModal:t}}var n8=()=>{};function n5({children:e}){let t=e2(),{address:n}=(0,o.F)(),{chainId:a}=(0,o.F)(),{chains:r}=(0,I.U)(),l=r.some(e=>e.id===a),s=e3(),c=ee()??void 0,u=a?s[a]:void 0,d=u?.name??void 0,p=u?.iconUrl??void 0,m=u?.iconBackground??void 0,f=ep(p),h=(0,i.useContext)(tb),g=tu().some(({status:e})=>"pending"===e)&&h,{showBalance:v}=e7(),{balance:b,ensAvatar:w,ensName:y}=ta({address:n,includeBalance:"boolean"==typeof v?v:!v||K(v)[er()?"smallScreen":"largeScreen"]}),C=b?`${t6(Number.parseFloat(b.formatted))} ${b.symbol}`:void 0,{openConnectModal:x}=n4(),{openChainModal:j}=function(){let{chainModalOpen:e,openChainModal:t}=(0,i.useContext)(n6);return{chainModalOpen:e,openChainModal:t}}(),{openAccountModal:E}=function(){let{accountModalOpen:e,openAccountModal:t}=(0,i.useContext)(n6);return{accountModalOpen:e,openAccountModal:t}}(),{accountModalOpen:k,chainModalOpen:B,connectModalOpen:T}=n7();return i.createElement(i.Fragment,null,e({account:n?{address:n,balanceDecimals:b?.decimals,balanceFormatted:b?.formatted,balanceSymbol:b?.symbol,displayBalance:C,displayName:y?t2(y):t7(n),ensAvatar:w??void 0,ensName:y??void 0,hasPendingTransactions:g}:void 0,accountModalOpen:k,authenticationStatus:c,chain:a?{hasIcon:!!p,iconBackground:m,iconUrl:f,id:a,name:d,unsupported:!l}:void 0,chainModalOpen:B,connectModalOpen:T,mounted:t(),openAccountModal:E??n8,openChainModal:j??n8,openConnectModal:x??n8}))}n5.displayName="ConnectButton.Custom";var n9={accountStatus:"full",chainStatus:{largeScreen:"full",smallScreen:"icon"},label:"Connect Wallet",showBalance:{largeScreen:!0,smallScreen:!1}};function ae({accountStatus:e=n9.accountStatus,chainStatus:t=n9.chainStatus,label:n=n9.label,showBalance:a=n9.showBalance}){let r=e1(),o=et(),{setShowBalance:l}=e7(),[s,c]=(0,i.useState)(!1),{i18n:u}=(0,i.useContext)(ek);return(0,i.useEffect)(()=>{l(a),s||c(!0)},[a,l]),s?i.createElement(n5,null,({account:l,chain:s,mounted:c,openAccountModal:d,openChainModal:p,openConnectModal:m})=>{let f=c&&"loading"!==o,h=s?.unsupported??!1;return i.createElement(el,{display:"flex",gap:"12",...!f&&{"aria-hidden":!0,style:{opacity:0,pointerEvents:"none",userSelect:"none"}}},f&&l&&"connected"===o?i.createElement(i.Fragment,null,s&&(r.length>1||h)&&i.createElement(el,{alignItems:"center","aria-label":"Chain Selector",as:"button",background:h?"connectButtonBackgroundError":"connectButtonBackground",borderRadius:"connectButton",boxShadow:"connectButton",className:Q({active:"shrink",hover:"grow"}),color:h?"connectButtonTextError":"connectButtonText",display:Y(t,e=>"none"===e?"none":"flex"),fontFamily:"body",fontWeight:"bold",gap:"6",key:h?"unsupported":"supported",onClick:p,paddingX:"10",paddingY:"8",testId:h?"wrong-network-button":"chain-button",transition:"default",type:"button"},h?i.createElement(el,{alignItems:"center",display:"flex",height:"24",paddingX:"4"},u.t("connect_wallet.wrong_network.label")):i.createElement(el,{alignItems:"center",display:"flex",gap:"6"},s.hasIcon?i.createElement(el,{display:Y(t,e=>"full"===e||"icon"===e?"block":"none"),height:"24",width:"24"},i.createElement(em,{alt:s.name??"Chain icon",background:s.iconBackground,borderRadius:"full",height:"24",src:s.iconUrl,width:"24"})):null,i.createElement(el,{display:Y(t,e=>"icon"!==e||s.iconUrl?"full"===e||"name"===e?"block":"none":"block")},s.name??s.id)),i.createElement(ew,null)),!h&&i.createElement(el,{alignItems:"center",as:"button",background:"connectButtonBackground",borderRadius:"connectButton",boxShadow:"connectButton",className:Q({active:"shrink",hover:"grow"}),color:"connectButtonText",display:"flex",fontFamily:"body",fontWeight:"bold",onClick:d,testId:"account-button",transition:"default",type:"button"},l.displayBalance&&i.createElement(el,{display:Y(a,e=>e?"block":"none"),padding:"8",paddingLeft:"12"},l.displayBalance),i.createElement(el,{background:K(a)[er()?"smallScreen":"largeScreen"]?"connectButtonInnerBackground":"connectButtonBackground",borderColor:"connectButtonBackground",borderRadius:"connectButton",borderStyle:"solid",borderWidth:"2",color:"connectButtonText",fontFamily:"body",fontWeight:"bold",paddingX:"8",paddingY:"6",transition:"default"},i.createElement(el,{alignItems:"center",display:"flex",gap:"6",height:"24"},i.createElement(el,{display:Y(e,e=>"full"===e||"avatar"===e?"block":"none")},i.createElement(eb,{address:l.address,imageUrl:l.ensAvatar,loading:l.hasPendingTransactions,size:24})),i.createElement(el,{alignItems:"center",display:"flex",gap:"6"},i.createElement(el,{display:Y(e,e=>"full"===e||"address"===e?"block":"none")},l.displayName),i.createElement(ew,null)))))):i.createElement(el,{as:"button",background:"accentColor",borderRadius:"connectButton",boxShadow:"connectButton",className:Q({active:"shrink",hover:"grow"}),color:"accentColorForeground",fontFamily:"body",fontWeight:"bold",height:"40",key:"connect",onClick:m,paddingX:"14",testId:"connect-button",transition:"default",type:"button"},c&&"Connect Wallet"===n?u.t("connect_wallet.label"):n))}):i.createElement(i.Fragment,null)}ae.__defaultProps=n9,ae.Custom=n5;var at=({appName:e,appDescription:t,appUrl:n,appIcon:a})=>({name:e,description:t??e,url:n??"",icons:[...a?[a]:[]]}),an=new Map,aa=({projectId:e,walletConnectParameters:t,rkDetailsShowQrModal:n})=>{let a={...t||{},projectId:e,showQrModal:!1};n&&(a={...a,showQrModal:!0});let r=JSON.stringify(a),o=an.get(r);if(o)return o;let i=walletConnect(a);return an.set(r,i),i};function ar({projectId:e,walletConnectParameters:t}){if(!e||""===e)throw Error("No projectId found. Every dApp must now provide a WalletConnect Cloud projectId to enable WalletConnect v2 https://www.rainbowkit.com/docs/installation#configure");return"YOUR_PROJECT_ID"===e&&(e="21fef48091f12692cad574a6f7753643"),n=>(function({projectId:e,walletDetails:t,walletConnectParameters:n}){return createConnector(a=>({...aa({projectId:e,walletConnectParameters:n,rkDetailsShowQrModal:t.rkDetails.showQrModal})(a),...t}))})({projectId:e,walletDetails:n,walletConnectParameters:t})}function ao(e){let t=void 0;if(void 0===t||void 0===t.ethereum)return;let n=t.ethereum.providers;return n?n.find(t=>t[e]):t.ethereum[e]?t.ethereum:void 0}function ai(e){}function al({flag:e,namespace:t}){return!!t&&void 0!==ai(t)||!!e&&void 0!==ao(e)}function as({flag:e,namespace:t,target:n}){var a;return a=n||function({flag:e,namespace:t}){let n=void 0;if(void 0===n)return;if(t){let e=ai(t);if(e)return e}let a=n.ethereum?.providers;if(e){let t=ao(e);if(t)return t}return void 0!==a&&a.length>0?a[0]:n.ethereum}({flag:e,namespace:t}),e=>{let t=a?{target:()=>({id:e.rkDetails.id,name:e.rkDetails.name,provider:a})}:{};return createConnector2(n=>({...injected(t)(n),...e}))}}let ac=()=>(0,r.jsxs)("header",{className:"bg-royal py-4 px-6 flex justify-between items-center",children:[(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(c(),{href:"/",className:"flex items-center",children:(0,r.jsx)(u.default,{src:"/bitape.png",alt:"BitApe Logo",width:80,height:80,className:"hover:opacity-80 transition-opacity",priority:!0})}),(0,r.jsxs)("nav",{className:"hidden md:flex ml-12",children:[(0,r.jsx)(c(),{href:"/about",className:"font-press-start text-white mx-3 hover:text-banana",children:"ABOUT"}),(0,r.jsx)(c(),{href:"/trade",className:"font-press-start text-white mx-3 hover:text-banana",children:"TRADE $BIT"}),(0,r.jsx)(c(),{href:"/leaderboard",className:"font-press-start text-white mx-3 hover:text-banana",children:"LEADERBOARD"})]})]}),(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(c(),{href:"/announcements",className:"pixel-button mr-2 hidden md:block",children:"ANNOUNCEMENTS"}),(0,r.jsx)(c(),{href:"/refer",className:"pixel-button mr-2 hidden md:block",children:"REFER A FRIEND"}),(0,r.jsx)(ae,{})]})]});var au=n(98243);let ad=({miningRate:e,hashRate:t,blocksUntilHalving:n,networkHashRatePercentage:a,totalNetworkHashRate:o,totalMinedBit:l,burnedBit:s,rewardPerBlock:c})=>{let[u,d]=(0,i.useState)("SIMPLE");return(0,r.jsxs)("div",{className:"game-panel",children:[(0,r.jsxs)("div",{className:"flex justify-between items-center mb-6",children:[(0,r.jsx)("h2",{className:"game-text text-lg",children:"STATS"}),(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)("button",{onClick:()=>d("SIMPLE"),className:`game-button border-r-0 ${"SIMPLE"===u?"bg-banana text-royal":""}`,children:"SIMPLE"}),(0,r.jsx)("div",{className:"game-text px-2",children:"/"}),(0,r.jsx)("button",{onClick:()=>d("PRO"),className:`game-button border-l-0 ${"PRO"===u?"bg-banana text-royal":""}`,children:"PRO"})]})]}),"SIMPLE"===u?(0,r.jsxs)("div",{className:"space-y-3",children:[(0,r.jsxs)("p",{className:"game-text",children:["- YOU ARE MINING ",(0,r.jsx)("span",{className:"game-value",children:e})," $BIT A DAY"]}),(0,r.jsxs)("p",{className:"game-text",children:["- YOUR HASH RATE IS ",(0,r.jsx)("span",{className:"game-value",children:t})," GH/S"]}),(0,r.jsxs)("p",{className:"game-text",children:["- ",(0,r.jsx)("span",{className:"game-value",children:n})," BLOCKS UNTIL NEXT HALVENING"]}),(0,r.jsxs)("p",{className:"game-text",children:["- YOU HAVE ",(0,r.jsxs)("span",{className:"game-value",children:[a,"%"]})," OF THE TOTAL NETWORK HASH RATE (",(0,r.jsx)("span",{className:"game-value",children:o})," GH/S)"]})]}):(0,r.jsxs)("div",{className:"space-y-3",children:[(0,r.jsxs)("p",{className:"game-text",children:["- ",(0,r.jsx)("span",{className:"game-value",children:c})," TOTAL $BIT MINED PER BLOCK"]}),(0,r.jsxs)("p",{className:"game-text",children:["- ",(0,r.jsx)("span",{className:"game-value",children:l})," $BIT HAS EVER BEEN MINED."]}),(0,r.jsxs)("p",{className:"game-text",children:["- ",(0,r.jsx)("span",{className:"game-value",children:s})," $BIT HAS BEEN BURNED."]})]})]})},ap=({minedBit:e,onClaimReward:t,isClaimingReward:n})=>(0,r.jsx)("div",{className:"stats-panel",children:(0,r.jsxs)("div",{className:"flex flex-col items-center justify-center py-4",children:[(0,r.jsxs)("p",{className:"pixel-text mb-4",children:["YOU HAVE MINED ",(0,r.jsxs)("span",{className:"text-banana-yellow",children:[e," $BIT"]})]}),(0,r.jsx)("button",{className:"claim-button",onClick:t,disabled:n||0>=parseFloat(e),children:n?"CLAIMING...":"CLAIM MINED $BIT"})]})});var am=n(75858),af=n(97519);let ah=()=>{let e=(0,l.v)(),[t,n]=(0,i.useState)("RESOURCES"),[a,o]=(0,i.useState)(!1),s=async()=>(o(!0),Promise.resolve()),c=async()=>{await e.purchaseFacility(),o(!1)},u=async()=>{e.claimReward&&await e.claimReward()};return(0,r.jsxs)("div",{className:"min-h-screen flex flex-col bg-royal",children:[(0,r.jsx)(ac,{}),(0,r.jsx)("main",{className:"flex-grow p-4 md:p-6 lg:p-8",children:(0,r.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto",children:[(0,r.jsxs)("div",{className:"flex flex-col space-y-6",children:[(0,r.jsx)("div",{className:"flex space-x-2",children:["RESOURCES","SPACE","SELECTED_TILE"].map(e=>(0,r.jsx)("button",{onClick:()=>n(e),className:`game-button ${t===e?"bg-banana text-royal":""}`,children:e.replace("_"," ")},e))}),(()=>{switch(t){case"RESOURCES":return(0,r.jsx)(au.q,{apeBalance:e.apeBalance,bitBalance:e.bitBalance,spacesLeft:e.spacesLeft,gigawattsAvailable:e.gigawattsAvailable});case"SPACE":return(0,r.jsxs)("div",{className:"game-panel",children:[(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsxs)("p",{className:"game-text",children:["- ",e.hasFacility?"MINING SPACE ACTIVE":"NO MINING SPACE"]}),(0,r.jsxs)("p",{className:"game-text",children:["- ",e.spacesLeft," TOTAL SPACES"]}),(0,r.jsxs)("p",{className:"game-text",children:["- ",e.gigawattsAvailable," TOTAL GIGAWATTS"]}),!e.hasFacility&&(0,r.jsx)("p",{className:"game-text",children:"- CANT MINE WITHOUT SPACE, BUDDY"})]}),e.hasFacility&&(0,r.jsx)("button",{onClick:e.upgradeFacility,disabled:e.isUpgradingFacility,className:"game-button mt-4",children:"UPGRADE"})]});case"SELECTED_TILE":return(0,r.jsx)("div",{className:"game-panel",children:(0,r.jsx)("div",{className:"space-y-2",children:e.hasFacility?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("p",{className:"game-text",children:["- FACILITY LEVEL: ",(0,r.jsx)("span",{className:"game-value",children:e.facilityData?.level||0})]}),(0,r.jsxs)("p",{className:"game-text",children:["- POWER OUTPUT: ",(0,r.jsx)("span",{className:"game-value",children:e.facilityData?.power||0})," WATTS"]}),(0,r.jsxs)("p",{className:"game-text",children:["- EFFICIENCY: ",(0,r.jsxs)("span",{className:"game-value",children:[((e.facilityData?.power||0)/20*100).toFixed(1),"%"]})]})]}):(0,r.jsx)("p",{className:"game-text",children:"- NO TILE SELECTED"})})});default:return null}})(),(0,r.jsx)(ad,{miningRate:e.miningRate,hashRate:e.hashRate,blocksUntilHalving:e.blocksUntilHalving,networkHashRatePercentage:e.networkHashRatePercentage,totalNetworkHashRate:e.totalNetworkHashRate,totalMinedBit:e.totalMinedBit||"2,211,552.572",burnedBit:e.burnedBit||"1,238,626.5",rewardPerBlock:e.rewardPerBlock||"2.5"}),(0,r.jsx)(ap,{minedBit:e.minedBit,onClaimReward:u,isClaimingReward:e.isClaimingReward})]}),(0,r.jsx)("div",{className:"flex flex-col",children:(0,r.jsx)(am.e,{hasFacility:e.hasFacility,onPurchaseFacility:s,onGetStarterMiner:e.getStarterMiner,onUpgradeFacility:e.upgradeFacility,isPurchasingFacility:e.isPurchasingFacility,isGettingStarterMiner:e.isGettingStarterMiner,isUpgradingFacility:e.isUpgradingFacility})})]})}),(0,r.jsx)(af.A,{isOpen:a,onClose:()=>o(!1),onPurchase:c,isPurchasing:e.isPurchasingFacility})]})};var ag=n(16189),av=n(63862),ab=n(1592),aw=n(95078);let ay=({className:e})=>{let{open:t}=(0,av.o1)(),{isConnected:n,address:a}=(0,o.F)(),l=(0,ag.useRouter)(),[s,c]=(0,i.useState)(!1),{apeBalance:u,bitBalance:d}=(0,aw.n)();(0,i.useEffect)(()=>{n&&a&&l.push(`/room/${a}`)},[n,a,l]);let p=async()=>{if(n)c(!0);else try{await t()}catch(e){console.error("Failed to connect wallet:",e)}};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{onClick:p,className:`bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors font-press-start ${e}`,children:n?"PROFILE":"CONNECT WALLET"}),n&&a&&(0,r.jsx)(ab.A,{isOpen:s,onClose:()=>c(!1),address:a,apeBalance:u,bitBalance:d})]})},aC=()=>{let e=(0,ag.useRouter)(),{isConnected:t,address:n}=(0,o.F)();return(0,i.useEffect)(()=>{t&&n&&e.push(`/room/${n}`)},[t,n,e]),(0,r.jsxs)("div",{className:"min-h-screen flex flex-col bg-royal",children:[(0,r.jsxs)("header",{className:"nav-bar flex justify-between items-center px-6 py-4",children:[(0,r.jsxs)("div",{className:"flex items-center gap-8",children:[(0,r.jsx)("div",{className:"flex items-center",children:(0,r.jsx)(u.default,{src:"/bitape.png",alt:"BitApe Logo",width:100,height:100,className:"hover:opacity-80 transition-opacity",priority:!0})}),(0,r.jsxs)("nav",{className:"flex gap-8",children:[(0,r.jsx)(c(),{href:"/about",className:"font-press-start text-white hover:text-banana",children:"ABOUT"}),(0,r.jsx)(c(),{href:"/trade",className:"font-press-start text-white hover:text-banana",children:"TRADE $BIT"}),(0,r.jsx)(c(),{href:"/leaderboard",className:"font-press-start text-[#4A5568] hover:text-banana",children:"LEADERBOARD"})]})]}),(0,r.jsxs)("div",{className:"flex gap-4",children:[(0,r.jsx)("button",{className:"font-press-start text-banana border-2 border-banana px-4 py-2 hover:bg-banana hover:text-royal pixel-button",children:"ANNOUNCEMENTS"}),(0,r.jsx)("button",{className:"font-press-start text-banana border-2 border-banana px-4 py-2 hover:bg-banana hover:text-royal pixel-button",children:"REFER A FRIEND"}),(0,r.jsx)(ay,{className:"px-4 py-2"})]})]}),(0,r.jsxs)("main",{className:"flex-grow flex flex-col items-center justify-center p-4 relative",children:[(0,r.jsx)("div",{className:"absolute inset-0",style:{backgroundImage:`
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,backgroundSize:"24px 24px",imageRendering:"pixelated"}}),(0,r.jsxs)("div",{className:"relative z-10 max-w-4xl mx-auto text-center space-y-8",children:[(0,r.jsxs)("h1",{className:"text-4xl md:text-6xl font-press-start text-banana pixel-text",children:[(0,r.jsx)("span",{className:"text-banana",children:"BITAPE:"})," A PEER-TO-PEER APE CASH SYSTEM"]}),(0,r.jsx)("p",{className:"text-2xl md:text-3xl font-press-start text-banana pixel-text",children:"971,753 $BIT HAS ALREADY BEEN MINED."}),(0,r.jsx)("p",{className:"text-xl md:text-2xl font-press-start text-white pixel-text",children:"START EARNING TODAY."}),(0,r.jsx)("div",{className:"mb-12",children:(0,r.jsx)("div",{className:"relative w-[200px] h-[200px] mx-auto border-2 border-banana",children:(0,r.jsx)(u.default,{src:"/globe.svg",alt:"Globe Animation",fill:!0,priority:!0,className:"object-contain"})})}),(0,r.jsx)("div",{className:"w-full max-w-md mx-auto",children:(0,r.jsx)(ay,{className:"w-full font-press-start text-xl py-4 px-8 bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors pixel-button"})})]})]})]})};function ax(){let{isConnected:e}=(0,o.F)();return e?(0,r.jsx)(ah,{}):(0,r.jsx)(aC,{})}},71469:(e,t,n)=>{let a=n(56953);function r(e){this.mode=a.BYTE,"string"==typeof e?this.data=new TextEncoder().encode(e):this.data=new Uint8Array(e)}r.getBitsLength=function(e){return 8*e},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){for(let t=0,n=this.data.length;t<n;t++)e.put(this.data[t],8)},e.exports=r},73566:e=>{"use strict";e.exports=require("worker_threads")},74075:e=>{"use strict";e.exports=require("zlib")},74284:(e,t,n)=>{let a=n(80206);t.mul=function(e,t){let n=new Uint8Array(e.length+t.length-1);for(let r=0;r<e.length;r++)for(let o=0;o<t.length;o++)n[r+o]^=a.mul(e[r],t[o]);return n},t.mod=function(e,t){let n=new Uint8Array(e);for(;n.length-t.length>=0;){let e=n[0];for(let r=0;r<t.length;r++)n[r]^=a.mul(t[r],e);let r=0;for(;r<n.length&&0===n[r];)r++;n=n.slice(r)}return n},t.generateECPolynomial=function(e){let n=new Uint8Array([1]);for(let r=0;r<e;r++)n=t.mul(n,new Uint8Array([1,a.exp(r)]));return n}},75501:(e,t)=>{t.render=function(e,t,n){let a=e.modules.size,r=e.modules.data,o="\x1b[47m  \x1b[0m",i="",l=Array(a+3).join(o),s=[,,].join(o);i+=l+"\n";for(let e=0;e<a;++e){i+=o;for(let t=0;t<a;t++)i+=r[e*a+t]?"\x1b[40m  \x1b[0m":o;i+=s+"\n"}return i+=l+"\n","function"==typeof n&&n(null,i),i}},77598:e=>{"use strict";e.exports=require("node:crypto")},79428:e=>{"use strict";e.exports=require("buffer")},79551:e=>{"use strict";e.exports=require("url")},80206:(e,t)=>{let n=new Uint8Array(512),a=new Uint8Array(256);!function(){let e=1;for(let t=0;t<255;t++)n[t]=e,a[e]=t,256&(e<<=1)&&(e^=285);for(let e=255;e<512;e++)n[e]=n[e-255]}(),t.log=function(e){if(e<1)throw Error("log("+e+")");return a[e]},t.exp=function(e){return n[e]},t.mul=function(e,t){return 0===e||0===t?0:n[a[e]+a[t]]}},80871:(e,t,n)=>{let a=n(29021),r=n(97425).O,o=n(86217);t.render=function(e,t){let n=o.getOptions(t),a=n.rendererOpts,i=o.getImageWidth(e.modules.size,n);a.width=i,a.height=i;let l=new r(a);return o.qrToImageData(l.data,e,n),l},t.renderToDataURL=function(e,n,a){void 0===a&&(a=n,n=void 0),t.renderToBuffer(e,n,function(e,t){e&&a(e);let n="data:image/png;base64,";n+=t.toString("base64"),a(null,n)})},t.renderToBuffer=function(e,n,a){void 0===a&&(a=n,n=void 0);let r=t.render(e,n),o=[];r.on("error",a),r.on("data",function(e){o.push(e)}),r.on("end",function(){a(null,Buffer.concat(o))}),r.pack()},t.renderToFile=function(e,n,r,o){void 0===o&&(o=r,r=void 0);let i=!1,l=(...e)=>{i||(i=!0,o.apply(null,e))},s=a.createWriteStream(e);s.on("error",l),s.on("close",l),t.renderToFileStream(s,n,r)},t.renderToFileStream=function(e,n,a){t.render(n,a).pack().pipe(e)}},81630:e=>{"use strict";e.exports=require("http")},83997:e=>{"use strict";e.exports=require("tty")},86217:(e,t)=>{function n(e){if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw Error("Color should be defined as hex string");let t=e.slice().replace("#","").split("");if(t.length<3||5===t.length||t.length>8)throw Error("Invalid hex color: "+e);(3===t.length||4===t.length)&&(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),6===t.length&&t.push("F","F");let n=parseInt(t.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:255&n,hex:"#"+t.slice(0,6).join("")}}t.getOptions=function(e){e||(e={}),e.color||(e.color={});let t=void 0===e.margin||null===e.margin||e.margin<0?4:e.margin,a=e.width&&e.width>=21?e.width:void 0,r=e.scale||4;return{width:a,scale:a?4:r,margin:t,color:{dark:n(e.color.dark||"#000000ff"),light:n(e.color.light||"#ffffffff")},type:e.type,rendererOpts:e.rendererOpts||{}}},t.getScale=function(e,t){return t.width&&t.width>=e+2*t.margin?t.width/(e+2*t.margin):t.scale},t.getImageWidth=function(e,n){let a=t.getScale(e,n);return Math.floor((e+2*n.margin)*a)},t.qrToImageData=function(e,n,a){let r=n.modules.size,o=n.modules.data,i=t.getScale(r,a),l=Math.floor((r+2*a.margin)*i),s=a.margin*i,c=[a.color.light,a.color.dark];for(let t=0;t<l;t++)for(let n=0;n<l;n++){let u=(t*l+n)*4,d=a.color.light;t>=s&&n>=s&&t<l-s&&n<l-s&&(d=c[+!!o[Math.floor((t-s)/i)*r+Math.floor((n-s)/i)]]),e[u++]=d.r,e[u++]=d.g,e[u++]=d.b,e[u]=d.a}}},88677:(e,t,n)=>{let a=n(86217),r={WW:" ",WB:"▄",BB:"█",BW:"▀"},o={BB:" ",BW:"▄",WW:"█",WB:"▀"};t.render=function(e,t,n){let i=a.getOptions(t),l=r;("#ffffff"===i.color.dark.hex||"#000000"===i.color.light.hex)&&(l=o);let s=e.modules.size,c=e.modules.data,u="",d=Array(s+2*i.margin+1).join(l.WW);d=Array(i.margin/2+1).join(d+"\n");let p=Array(i.margin+1).join(l.WW);u+=d;for(let e=0;e<s;e+=2){u+=p;for(let t=0;t<s;t++){var m;let n=c[e*s+t],a=c[(e+1)*s+t];u+=(m=l,n&&a?m.BB:n&&!a?m.BW:!n&&a?m.WB:m.WW)}u+=p+"\n"}return u+=d.slice(0,-1),"function"==typeof n&&n(null,u),u},t.renderToFile=function(e,a,r,o){void 0===o&&(o=r,r=void 0);let i=n(29021),l=t.render(a,r);i.writeFile(e,l,o)}},89342:(e,t,n)=>{Promise.resolve().then(n.bind(n,21204))},89958:(e,t,n)=>{let a=n(95061),r=a.getBCHDigit(1335);t.getEncodedBits=function(e,t){let n=e.bit<<3|t,o=n<<10;for(;a.getBCHDigit(o)-r>=0;)o^=1335<<a.getBCHDigit(o)-r;return(n<<10|o)^21522}},93798:(e,t,n)=>{let a=n(75501),r=n(23463);t.render=function(e,t,n){return t&&t.small?r.render(e,t,n):a.render(e,t,n)}},94735:e=>{"use strict";e.exports=require("events")},95061:(e,t)=>{let n,a=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];t.getSymbolSize=function(e){if(!e)throw Error('"version" cannot be null or undefined');if(e<1||e>40)throw Error('"version" should be in range from 1 to 40');return 4*e+17},t.getSymbolTotalCodewords=function(e){return a[e]},t.getBCHDigit=function(e){let t=0;for(;0!==e;)t++,e>>>=1;return t},t.setToSJISFunction=function(e){if("function"!=typeof e)throw Error('"toSJISFunc" is not a valid function.');n=e},t.isKanjiModeEnabled=function(){return void 0!==n},t.toSJIS=function(e){return n(e)}},95525:(e,t)=>{t.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}}};var t=require("../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),a=t.X(0,[3407,7715,5400,9133,6935],()=>n(44862));module.exports=a})();