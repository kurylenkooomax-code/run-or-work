/* Біжи або працюй — core.js
   Основа: допоміжні функції, збереження прогресу, загальні іконки, економіка бізнесу, повідомлення і гаманець.
   Порядок завантаження: core.js, texts.js, wardrobe.js, world.js, game.js (див. index.html). */
"use strict";
const $=s=>document.querySelector(s);
const rand=(a,b)=>a+Math.random()*(b-a);
const ri=n=>Math.floor(Math.random()*n);
const pick=a=>a[ri(a.length)];
const lerp=(a,b,k)=>a+(b-a)*k;
/* спільні геометрії: однакові кільця й циліндри створюються один раз (менше пам'яті відеокарти) */
const GCACHE={};
const TG=(...a)=>GCACHE["t"+a.join()]||(GCACHE["t"+a.join()]=new THREE.TorusGeometry(...a));
const CG=(...a)=>GCACHE["c"+a.join()]||(GCACHE["c"+a.join()]=new THREE.CylinderGeometry(...a));

/* ---------------- save ---------------- */
const KEY="run-or-work-v1";
function load(){let raw=null;try{raw=localStorage.getItem(KEY)}catch(e){return null}
  try{const v=JSON.parse(raw||"null");if(raw&&v&&typeof v==="object"){try{localStorage.setItem(KEY+"-bak",raw)}catch(e){}}return v}
  catch(e){try{return JSON.parse(localStorage.getItem(KEY+"-bak")||"null")}catch(e2){return null}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const DEF={coins:300,gems:10,best:0,totalM:0,lang:"uk",ui:null,owned:["sex:m","sex:f","fur:ginger","style:classic","fstyle:dress","suit:navy","tie:red","acc:none","dress:rose","bow:pink","facc:none","shoes:black","fshoes:pink"],eq:{sex:"m",fur:"ginger",style:"classic",fstyle:"dress",suit:"navy",tie:"red",acc:"none",dress:"rose",bow:"pink",facc:"none",shoes:"black",fshoes:"pink"},biz:null,ads:{d:"",n:0},coffee:false};
const S=Object.assign({},DEF,load()||{});
S.eq=Object.assign({},DEF.eq,S.eq||{});S.owned=S.owned||[];["sex:m","sex:f","style:classic","fstyle:dress","dress:rose","bow:pink","facc:none","shoes:black","fshoes:pink"].forEach(k=>{if(!S.owned.includes(k))S.owned.push(k)});

/* ---------------- icons ---------------- */
const COIN='<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc531" stroke="#c98600" stroke-width="2"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#c98600" stroke-width="1.7"/></svg>';
const GEM='<svg class="ic" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#19c6e6" stroke="#0a7f97" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 9h20M9 3l3 18 3-18" fill="none" stroke="#0a7f97" stroke-width="1.1"/></svg>';
const SUN_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const MOON_IC='<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>';
const TAB_IC={
cat:'<svg viewBox="0 0 24 24"><path d="M4 4l4 4h8l4-4v9a8 8 0 0 1-16 0z"/><circle cx="9" cy="13" r=".9"/><circle cx="15" cy="13" r=".9"/></svg>',
ward:'<svg viewBox="0 0 24 24"><path d="M12 7.5a2 2 0 1 1 2-2c0 1.2-2 1.5-2 3v.5M12 9 3 16.5c-.7.6-.3 1.5.6 1.5h16.8c.9 0 1.3-.9.6-1.5z"/></svg>',
company:'<svg viewBox="0 0 24 24"><path d="M4 21V5l8-3v19M12 9h8v12M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/></svg>',
rating:'<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/></svg>',
shop:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg>'};
/* ---------------- business data ---------------- */
const UPG=[{id:"showcase",rev:12,exp:0,c:100},{id:"range",rev:20,exp:6,c:180},{id:"checkout",rev:25,exp:4,c:250},{id:"staff",rev:38,exp:14,c:320},{id:"storage",c:380},{id:"marketing",c:480}];
const MAXLV=10, SAFE_H=8;
const upCost=(u,l)=>Math.round(u.c*Math.pow(1.55,l)/10)*10;
function econ(b){let rev=40,exp=15;for(const u of UPG){const l=b.lv[u.id]||0;if(u.rev){rev+=u.rev*l;exp+=u.exp*l}}
  rev*=1+.1*(b.lv.marketing||0);exp*=1-.06*(b.lv.storage||0);const net=rev-exp;const cap=Math.max(0,net)*24*365*8;return{rev,exp,net,cap,price:cap/100000}}
/* годинник телефона перевели назад: дохід рахується від нового часу, втрачаються лише ці години */
function pending(b){const e=econ(b);if(Date.now()<b.last)b.last=Date.now();const h=(Date.now()-b.last)/3.6e6;return Math.floor(Math.max(0,e.net)*Math.min(Math.max(h,0),SAFE_H))}
const fmt=n=>{n=Math.floor(n);if(n>=1e9)return(n/1e9).toFixed(1).replace(/\.0$/,"")+"B";if(n>=1e6)return(n/1e6).toFixed(1).replace(/\.0$/,"")+"M";if(n>=1e5)return Math.round(n/1e3)+"K";return String(n).replace(/\B(?=(\d{3})+(?!\d))/g," ")};

/* ---------------- toast & wallet ---------------- */
let toastT;
function toast(msg){if(typeof mode!=="undefined"&&mode==="game")return;const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("show"),1800)}
function renderWallet(){$("#wCoins").innerHTML=COIN+fmt(S.coins);$("#wGems").innerHTML=GEM+fmt(S.gems)}
function spend(coins,gems){if(coins&&S.coins<coins){toast(t("noCoins"));return false}if(gems&&S.gems<gems){toast(t("noGems"));return false}S.coins-=coins||0;S.gems-=gems||0;save();renderWallet();return true}
const priceHTML=it=>it.g?GEM+it.g:COIN+fmt(it.p);
