/* Біжи або працюй — game.js
   Меню і забіг: вкладки й свайпи, гардероб-екран, компанія, рейтинг, магазин, логіка забігу, екран програшу, камера, головний цикл і запуск гри.
   Порядок завантаження: core.js, texts.js, wardrobe.js, world.js, game.js (див. index.html). */
"use strict";
/* ---------------- theme ---------------- */
function isNight(){return S.ui?S.ui==="night":!!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}
function applyTheme(){const n=isNight();document.documentElement.dataset.ui=n?"night":"day";$("#themeBtn").innerHTML=n?SUN_IC:MOON_IC}
$("#themeBtn").addEventListener("click",()=>{S.ui=isNight()?"day":"night";save();applyTheme()});

/* ---------------- tabs ---------------- */
let tab="cat", mode="menu";
const TABS=["ward","cat","company","rating","shop"],CATV=k=>k==="cat"||k==="ward";
function renderTabs(){$("#tabs").innerHTML=TABS.map(k=>`<button class="tab" role="tab" data-tab="${k}" aria-selected="${tab===k}">${TAB_IC[k]}<span>${t("tab"+k[0].toUpperCase()+k.slice(1))}</span></button>`).join("")}
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;setTab(b.dataset.tab)});
/* gestures: drag the cat to spin it; swipe anywhere else to slide between tabs (follows the finger) */
const ease=k=>1-Math.pow(1-k,3);
let G=null,slide=null,catShift=0,showCat=false,spinVel=0,spinHold=0,wardStop=false;const FRONT=Math.PI-.45;
function rendFor(k){if(k==="ward")renderCat();if(k==="company")renderCompany();if(k==="rating")renderRating();if(k==="shop")renderShop();if(k==="cat")renderCat()}
function onCatBody(x,y,target){if(!CATV(tab)||target.closest(".sheet,.stats,.infoBtn"))return false;const w=window.innerWidth;return x>w*.18&&x<w*.82}
function gStart(x,y,target){if(mode!=="menu"||slide||target.closest(".modal,#tabs,#top")){G=null;return}
  const row=target.closest(".chips,.items");
  const sp=onCatBody(x,y,target);if(sp){spinVel=0;spinHold=.6;if(tab==="ward")wardStop=true}
  G={x0:x,y0:y,x,t0:performance.now(),kind:null,row,rowS:row?row.scrollLeft:0,spin:sp,nb:null,dir:0,dx:0}}
function setX(el,x){el.style.transform=x?`translate3d(${x}px,0,0)`:""}
function gMove(x,y){if(!G)return;const dx=x-G.x0,dy=y-G.y0;
  if(!G.kind){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
    if(Math.abs(dy)>Math.abs(dx)){G=null;return}
    if(G.spin)G.kind="spin";else if(G.row&&G.row.scrollWidth>G.row.clientWidth+2)G.kind="row";else G.kind="tab"}
  if(G.kind==="row"){if(Math.abs(G.row.scrollLeft-G.rowS)>2){G=null}return}
  if(G.kind==="spin"){if(prevCat){prevCat.rotation.y+=(x-G.x)*.014;spinVel=(x-G.x)*.014*60;spinHold=1.4}G.x=x;return}
  const w=window.innerWidth,dir=dx<0?1:-1,i=TABS.indexOf(tab),nk=TABS[i+dir];
  if(G.dir!==dir){if(G.nb){$("#v-"+G.nb).hidden=true;setX($("#v-"+G.nb),0)}G.dir=dir;G.nb=nk||null;if(nk){rendFor(nk);$("#v-"+nk).hidden=false}}
  const d=G.nb?dx:dx*.25;G.dx=d;G.x=x;
  setX($("#v-"+tab),d);if(G.nb)setX($("#v-"+G.nb),d+dir*w);
  catShift=CATV(tab)&&G.nb&&CATV(G.nb)?0:CATV(tab)?d:(G.nb&&CATV(G.nb)?d+dir*w:0);showCat=CATV(tab)||!!(G.nb&&CATV(G.nb))}
function gEnd(x){if(!G)return;const g=G;G=null;
  if(g.kind==="spin"){spinHold=1.2;return}
  if(g.kind==="row"&&Math.abs(g.row.scrollLeft-g.rowS)<=2){const dx=x-g.x0,i=TABS.indexOf(tab)+(dx<0?1:-1);if(Math.abs(dx)>45&&i>=0&&i<TABS.length)setTab(TABS[i],dx<0?1:-1);return}
  if(g.kind!=="tab")return;
  const w=window.innerWidth,v=(x-g.x0)/Math.max(1,performance.now()-g.t0);
  const go=g.nb&&(Math.abs(g.dx)>w*.22||Math.abs(v)>.45)&&Math.sign(g.dx)===-g.dir;
  slide={from:g.dx,to:go?-g.dir*w:0,t0:performance.now(),dur:go?260:200,old:tab,nb:g.nb,dir:g.dir,go}}
function slideStep(now){if(!slide)return;const s=slide,w=window.innerWidth,k=Math.min(1,(now-s.t0)/s.dur),d=s.from+(s.to-s.from)*ease(k);
  setX($("#v-"+s.old),d);if(s.nb)setX($("#v-"+s.nb),d+s.dir*w);
  catShift=CATV(s.old)&&s.nb&&CATV(s.nb)?0:CATV(s.old)?d:(s.nb&&CATV(s.nb)?d+s.dir*w:0);showCat=CATV(s.old)||!!(s.nb&&CATV(s.nb));
  if(k>=1){slide=null;setX($("#v-"+s.old),0);if(s.nb)setX($("#v-"+s.nb),0);catShift=0;showCat=false;
    if(s.go){tab=s.nb;if(tab==="ward")wardStop=false;TABS.forEach(x=>$("#v-"+x).hidden=x!==tab);renderTabs();if(tab!=="ward"&&tryOn){tryOn=null;rebuildPreview()}}
    else if(s.nb)$("#v-"+s.nb).hidden=true}}
window.addEventListener("touchstart",e=>{const t0=e.changedTouches[0];gStart(t0.clientX,t0.clientY,e.target)},{passive:true});
window.addEventListener("touchmove",e=>{const t0=e.changedTouches[0];gMove(t0.clientX,t0.clientY)},{passive:true});
window.addEventListener("touchend",e=>{const t0=e.changedTouches[0];gEnd(t0.clientX)},{passive:true});
window.addEventListener("touchcancel",()=>{if(G&&G.kind==="tab")gEnd(G.x0);G=null},{passive:true});
window.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")gStart(e.clientX,e.clientY,e.target)});
window.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"&&e.buttons)gMove(e.clientX,e.clientY)});
window.addEventListener("pointerup",e=>{if(e.pointerType==="mouse")gEnd(e.clientX)});
function setTab(k,dir){if(slide)return;if(k==="ward"&&tab!=="ward")wardStop=false;const v=$("#v-"+k);if(dir&&k!==tab){v.classList.remove("in-l","in-r");void v.offsetWidth;v.classList.add(dir>0?"in-r":"in-l")}tab=k;TABS.forEach(x=>$("#v-"+x).hidden=x!==k);renderTabs();
  if(k!=="ward"&&tryOn){tryOn=null;rebuildPreview()}if(k==="company")renderCompany();if(k==="rating")renderRating();if(k==="shop")renderShop();if(CATV(k))renderCat()}

/* ---------------- buff info ---------------- */
const BUFF_IC={
coffee:'<svg viewBox="0 0 32 32"><path d="M7 11h15v9a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6z" fill="#fff" stroke="#6b3e22" stroke-width="2"/><path d="M22 13h2.5a3 3 0 0 1 0 6H22" fill="none" stroke="#6b3e22" stroke-width="2"/><path d="M7 11h15v3H7z" fill="#6b3e22"/><path d="M12 4c-1 2 1 3 0 5M17 4c-1 2 1 3 0 5" stroke="#ffc531" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
bed:'<svg viewBox="0 0 32 32"><rect x="3" y="17" width="26" height="5" rx="1.5" fill="#a0703d"/><rect x="3" y="9" width="3" height="16" rx="1" fill="#a0703d"/><rect x="26" y="20" width="3" height="5" rx="1" fill="#a0703d"/><rect x="6" y="13" width="6" height="4" rx="2" fill="#fff" stroke="#c4d5ef"/><rect x="12" y="13" width="17" height="5" rx="2" fill="#3d7bff"/></svg>',
laptop:'<svg viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="14" rx="2" fill="#eef3fb" stroke="#56618a" stroke-width="1.6"/><rect x="8.5" y="8.5" width="15" height="9" rx="1" fill="#5fe0f5"/><path d="M11 13h6" stroke="#22b066" stroke-width="2"/><path d="M3 22h26l-2 3H5z" fill="#c4cdda" stroke="#56618a" stroke-width="1.4" stroke-linejoin="round"/></svg>',
money:'<svg viewBox="0 0 32 32"><rect x="3" y="11" width="22" height="13" rx="2" fill="#3fae5a" transform="rotate(-8 14 17)"/><rect x="6" y="10" width="22" height="13" rx="2" fill="#56c96f" stroke="#2a8a44" stroke-width="1.4"/><circle cx="17" cy="16.5" r="3.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="24" cy="23" r="5" fill="#ffc531" stroke="#c98600" stroke-width="1.6"/></svg>',
magnet:'<svg viewBox="0 0 32 32"><path d="M8 5v11a8 8 0 0 0 16 0V5h-5v11a3 3 0 0 1-6 0V5z" fill="#ff4b3e" stroke="#b8261c" stroke-width="1.4" stroke-linejoin="round"/><rect x="8" y="5" width="5" height="5" fill="#dfe5ee"/><rect x="19" y="5" width="5" height="5" fill="#dfe5ee"/></svg>',
gem:GEM.replace('class="ic"',''),
gem3:'<svg viewBox="0 0 32 32"><g transform="translate(-1 9) scale(.62)">'+GEM.replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(17 9) scale(.62)">'+GEM.replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(7.5 1) scale(.7)">'+GEM.replace(/<\/?svg[^>]*>/g,'')+'</g></svg>',
mystery:'<svg viewBox="0 0 32 32"><rect x="5" y="12" width="22" height="16" rx="2" fill="#8a4fff"/><rect x="3" y="9" width="26" height="5" rx="1.5" fill="#a77bff"/><rect x="14" y="9" width="4" height="19" fill="#ffc531"/><path d="M16 9c-3-6-9-4-6 0zM16 9c3-6 9-4 6 0z" fill="#ffc531"/><text x="16" y="25" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="sans-serif">?</text></svg>'};
function renderBuffs(){const rows=[["coffee","f_random"],["bed","f_random"],["laptop","f_rare"],["money","f_min"],["magnet","f_min"],["gem","f_min"],["gem3","f_attic"],["mystery","f_vrare"],["start","f_menu"]];
  $("#buffList").innerHTML=rows.map(([k,f])=>`<div class="buff"><i>${BUFF_IC[k==="start"?"coffee":k]}</i><div><b>${t("b_"+k)}</b><p>${t("b_"+k+"D")}</p><em>${t(f)}</em></div></div>`).join("")}
$("#buffInfoBtn").addEventListener("click",()=>{renderBuffs();$("#buffM").hidden=false});
$("#buffClose").addEventListener("click",()=>{$("#buffM").hidden=true});
$("#buffM").addEventListener("click",e=>{if(e.target.id==="buffM")$("#buffM").hidden=true});

/* ---------------- cat tab ---------------- */
let wardCat="fur",tryOn=null;
const viewEq=()=>tryOn?Object.assign({},S.eq,{[tryOn.cat]:tryOn.id}):S.eq;
function renderTry(){const bar=$("#tryBar");if(!tryOn){bar.hidden=true;bar.innerHTML="";return}
  const it=ITEMS[tryOn.cat].find(i=>i.id===tryOn.id);bar.hidden=false;
  bar.innerHTML=`<div><span>${t("tryOn")}</span><b>${t(tryOn.cat+"_"+it.id)} <span class="price">${priceHTML(it)}</span></b></div><button class="btn y" id="tryBuy">${t("buyNow")}</button><button class="x" id="tryX" aria-label="${t("cancelTry")}">×</button>`}
function endTry(){if(!tryOn)return;tryOn=null;renderCat();rebuildPreview()}
function renderCat(){
  $("#stBest").textContent=fmt(S.best)+" "+t("m");
  $("#stTotal").textContent=(S.totalM/1000).toFixed(1)+" "+t("km");
  if(!CATS().includes(wardCat))wardCat="sex";
  $("#catChips").innerHTML=CATS().map(k=>`<button class="chip" data-wc="${k}" aria-pressed="${wardCat===k}">${t(k)}</button>`).join("");
  $("#catItems").innerHTML=ITEMS[wardCat].map(it=>{const key=wardCat+":"+it.id,own=S.owned.includes(key),on=S.eq[wardCat]===it.id;
    const sw=wardCat==="sex"?`<span class="sw">${SEX_IC[it.id]}</span>`:(wardCat==="style"||wardCat==="fstyle")?`<span class="sw">${STYLE_IC[wardCat+"_"+it.id]}</span>`:(wardCat==="acc"||wardCat==="facc")?`<span class="sw">${ACC_IC[it.id]}</span>`:wardCat==="bow"?`<span class="sw">${bowSVG(it)}</span>`:`<span class="sw" style="background:${it.c}"></span>`;
    const st=on?`<span class="state">${t("wearing")}</span>`:own?`<span class="state">${t("owned")}</span>`:`<span class="price">${priceHTML(it)}</span>`;
    const tr=tryOn&&tryOn.cat===wardCat&&tryOn.id===it.id;
    return `<button class="item${on?" on":""}${tr?" try":""}" data-item="${it.id}">${sw}<span>${t(wardCat+"_"+it.id)}</span>${st}</button>`}).join("");
  renderTry();
  const cb=$("#coffeeBtn");cb.setAttribute("aria-pressed",S.coffee);cb.innerHTML=`<span>${t("coffee")}</span><span class="price">${GEM}2</span>`;
}
$("#catChips").addEventListener("click",e=>{const b=e.target.closest("[data-wc]");if(!b)return;wardCat=b.dataset.wc;if(tryOn&&tryOn.cat!==wardCat){tryOn=null;rebuildPreview()}renderCat();$("#catItems").scrollTop=0});
$("#catItems").addEventListener("click",e=>{const b=e.target.closest("[data-item]");if(!b)return;const it=ITEMS[wardCat].find(i=>i.id===b.dataset.item);const key=wardCat+":"+it.id;
  if(!S.owned.includes(key)){tryOn=tryOn&&tryOn.cat===wardCat&&tryOn.id===it.id?null:{cat:wardCat,id:it.id};renderCat();rebuildPreview();return}
  tryOn=null;S.eq[wardCat]=it.id;save();renderCat();rebuildPreview()});
$("#tryBar").addEventListener("click",e=>{if(!tryOn)return;
  if(e.target.closest("#tryX")){endTry();return}
  if(e.target.closest("#tryBuy")){const it=ITEMS[tryOn.cat].find(i=>i.id===tryOn.id);if(!spend(it.p||0,it.g||0))return;
    S.owned.push(tryOn.cat+":"+it.id);S.eq[tryOn.cat]=it.id;tryOn=null;save();toast(t("bought"));renderCat();rebuildPreview()}});
$("#coffeeBtn").addEventListener("click",()=>{S.coffee=!S.coffee;save();renderCat();if(S.coffee)toast(t("coffeeOn"))});
$("#playBtn").addEventListener("click",()=>{if(tryOn){tryOn=null;renderCat();rebuildPreview()}startGame()});

/* ---------------- company tab ---------------- */
const BIZ_TYPES=["shop","factory","museum","pharmacy","social"];
function storeSVG(b){const L=b.lv,win=1+Math.min(3,Math.floor((L.showcase||0)/3)),staff=Math.min(L.staff||0,6),stripes=6+Math.min(6,L.marketing||0);
  let s=`<svg class="storefront" viewBox="0 0 320 170" role="img" aria-label="${t("shopName")}"><rect width="320" height="170" fill="#bfe8ff"/>`;
  s+=`<circle cx="276" cy="30" r="16" fill="#ffe27a"/><rect x="0" y="146" width="320" height="24" fill="#cfd5e0"/><rect x="0" y="146" width="320" height="4" fill="#b3bccd"/>`;
  s+=`<rect x="34" y="44" width="252" height="104" rx="4" fill="#ffd9b0"/><rect x="34" y="40" width="252" height="14" rx="3" fill="#1c2445"/>`;
  s+=`<text x="160" y="51" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="9" fill="#fff">${t("shopName").toUpperCase()}</text>`;
  const sw=252/stripes;for(let i=0;i<stripes;i++)s+=`<path d="M${34+i*sw} 54h${sw}v14a${sw/2} ${sw/2} 0 0 1-${sw} 0z" fill="${i%2?"#fff":"#ff4b3e"}"/>`;
  const ww=(252-40-46)/win;for(let i=0;i<win;i++){const x=46+i*ww+(i>=Math.ceil(win/2)?46:0);s+=`<rect x="${x}" y="80" width="${ww-10}" height="44" rx="3" fill="#9fd8f2" stroke="#1c2445" stroke-width="2.5"/><rect x="${x+6}" y="110" width="${ww-22}" height="8" fill="#ffc531"/>`}
  const dx=34+126-20;s+=`<rect x="${dx}" y="88" width="40" height="58" rx="3" fill="#1c2445"/><rect x="${dx+5}" y="94" width="30" height="24" fill="#9fd8f2"/>`;
  for(let i=0;i<staff;i++){const x=20+i*48+(i>2?60:0);s+=`<g transform="translate(${x} 128)"><circle cx="8" cy="5" r="6" fill="#f29a3c"/><path d="M3 1l1-5 3 4M13 1l-1-5-3 4" fill="#f29a3c"/><rect x="2" y="10" width="12" height="10" rx="3" fill="#24345e"/></g>`}
  return s+"</svg>"}
function spark(h){if(!h||h.length<2)h=[0,(h&&h[0])||0];const mx=Math.max(...h),mn=Math.min(...h),r=mx-mn||1;
  const pts=h.map((v,i)=>[i/(h.length-1)*126+2,40-(v-mn)/r*34]);const line=pts.map(p=>p.join(",")).join(" ");const last=pts[pts.length-1];
  return `<svg viewBox="0 0 130 44"><polygon points="2,42 ${line} ${last[0]},42" fill="#1fa860" opacity=".14"/><polyline points="${line}" fill="none" stroke="#1fa860" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="#1fa860"/></svg>`}
function renderCompany(){
  const el=$("#companyIn");
  if(!S.biz){el.innerHTML=`<div><h2>${t("chooseBiz")}</h2><p class="muted" style="margin:6px 0 0">${t("chooseSub")}</p></div><div class="types">`+
    BIZ_TYPES.map(k=>k==="shop"?`<button class="type" data-open="shop"><span class="tag go">${t("openFree")}</span><b>${t(k)}</b><span>${t(k+"D")}</span></button>`
    :`<div class="type lock"><span class="tag">${t("soon")}</span><b>${t(k)}</b><span>${t(k+"D")}</span></div>`).join("")+`</div>`;return}
  const b=S.biz,e=econ(b),p=pending(b),capH=Math.max(0,e.net)*SAFE_H,lvSum=UPG.reduce((a,u)=>a+(b.lv[u.id]||0),0);
  let h=`<div class="card">${storeSVG(b)}<div class="bizhead"><div><b>${t("shopName")}</b><div class="muted" style="font-size:12px">${t("bizShop")} · ${t("lvl")} ${lvSum+1}</div></div></div></div>`;
  h+=`<div class="card"><div class="kpis"><div class="kpi"><span>${t("rev")}</span><b class="num">${fmt(e.rev)}${t("perH")}</b></div><div class="kpi neg"><span>${t("exp")}</span><b class="num">${fmt(e.exp)}${t("perH")}</b></div><div class="kpi pos"><span>${t("net")}</span><b class="num">${fmt(e.net)}${t("perH")}</b></div></div>`;
  h+=`<div class="stock"><div><h3>${t("cap")}</h3><div class="big num">${fmt(e.cap)}</div><div class="muted num" style="font-size:12px">${t("share")}: ${e.price.toFixed(2)} · ${t("shares")}</div></div>${spark(b.hist)}</div></div>`;
  h+=`<div class="card"><div class="safe-row"><div><h3>${t("safe")}</h3><div class="safe-amt num" id="safeAmt">${COIN}${fmt(p)}</div></div><button class="btn y" id="collectBtn" ${p<1?"disabled":""}>${t("collect")}</button></div>
     <div class="bar"><i id="safeBar" style="width:${capH?Math.min(100,p/capH*100):0}%"></i></div>
     <div class="btnrow" style="justify-content:space-between;align-items:center"><span class="muted" style="font-size:12px">${t("safeNote")}</span><button class="btn g" id="boostBtn">${t("boost")} · ${GEM}5</button></div></div>`;
  h+=`<div class="card"><h3 style="margin-bottom:4px">${t("upgrades")}</h3>`+UPG.map(u=>{const l=b.lv[u.id]||0,mx=l>=MAXLV,c=upCost(u,l);
    const eff=u.id==="storage"?t("lessExp"):u.id==="marketing"?t("moreRev"):`+${u.rev} ${t("perH")}`;
    return `<div class="upg"><b>${t("up_"+u.id)} <span class="eff">${eff}</span></b><p>${t("up_"+u.id+"D")}</p><div class="lv">${Array.from({length:MAXLV},(_,i)=>`<i class="${i<l?"f":""}"></i>`).join("")}</div>
      <button class="btn ${mx?"ghost":"y"}" data-up="${u.id}" ${mx?"disabled":""}>${mx?t("max"):COIN+fmt(c)}</button></div>`}).join("")+`</div>`;
  h+=`<div><h3>${t("moreBiz")}</h3><p class="muted" style="margin:4px 0 10px;font-size:13px">${t("moreBizSub")}</p><div class="types">`+BIZ_TYPES.filter(k=>k!=="shop").map(k=>`<div class="type lock"><span class="tag">${t("soon")}</span><b>${t(k)}</b><span>${t(k+"D")}</span></div>`).join("")+`</div></div>`;
  el.innerHTML=h;
}
function bankSafe(){const b=S.biz;if(!b)return 0;const p=pending(b);S.coins+=p;b.last=Math.max(b.last||0,Date.now());return p}
function pushHist(){const b=S.biz;b.hist=b.hist||[];b.hist.push(+econ(b).price.toFixed(2));if(b.hist.length>24)b.hist.shift()}
$("#companyIn").addEventListener("click",e=>{
  const o=e.target.closest("[data-open]");if(o){S.biz={type:"shop",lv:{},last:Date.now(),hist:[]};pushHist();save();renderCompany();return}
  const u=e.target.closest("[data-up]");if(u){const up=UPG.find(x=>x.id===u.dataset.up),l=S.biz.lv[up.id]||0;if(l>=MAXLV)return;if(!spend(upCost(up,l)))return;
    bankSafe();S.biz.lv[up.id]=l+1;pushHist();save();renderWallet();renderCompany();return}
  if(e.target.closest("#collectBtn")){const p=bankSafe();save();renderWallet();renderCompany();toast(t("got")+": "+fmt(p));return}
  if(e.target.closest("#boostBtn")){if(!spend(0,5))return;const add=Math.floor(Math.max(0,econ(S.biz).net)*2);S.coins+=add;save();renderWallet();toast(t("got")+": "+fmt(add));return}
});
setInterval(()=>{if(mode==="menu"&&tab==="company"&&S.biz){const b=S.biz,p=pending(b),e=econ(b),capH=Math.max(0,e.net)*SAFE_H;const a=$("#safeAmt"),bar=$("#safeBar"),cb=$("#collectBtn");
  if(a)a.innerHTML=COIN+fmt(p);if(bar)bar.style.width=(capH?Math.min(100,p/capH*100):0)+"%";if(cb)cb.disabled=p<1}},1000);

/* ---------------- rating tab ---------------- */
function renderRating(){const v=S.biz?econ(S.biz).cap:0;
  $("#ratingIn").innerHTML=`<div class="seg"><span class="on">${t("world")}</span><span>${t("country")}</span></div>
  <div class="card soon">${TAB_IC.rating.replace("<svg",'<svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"')}<h2>${t("ratingSoon")}</h2><p class="muted" style="margin:0;max-width:34ch">${t("ratingText")}</p></div>
  <h3>${t("yours")}</h3><div class="myst"><div class="kpi"><span>${t("best")}</span><b class="num">${fmt(S.best)} ${t("m")}</b></div><div class="kpi"><span>${t("total")}</span><b class="num">${(S.totalM/1000).toFixed(1)} ${t("km")}</b></div><div class="kpi"><span>${t("bizValue")}</span><b class="num">${fmt(v)}</b></div></div>`}

/* ---------------- shop tab ---------------- */
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const adsLeft=()=>{const now=Date.now();if(S.ads.d!==today()&&now>=(S.ads.t||0))S.ads={d:today(),n:0,t:now};S.ads.t=Math.max(S.ads.t||0,now);return 10-S.ads.n};
function renderShop(){const left=adsLeft();
  $("#shopIn").innerHTML=`<div class="card offer"><span class="big-ic">${GEM}</span><div><b>${t("watchAd")}</b><span class="num">${t("watchAdSub")}: ${left}</span></div><button class="btn g" id="adBtn" ${left<=0?"disabled":""}>+5 ${GEM}</button></div>
  <h3>${t("exchange")}</h3><div class="grid3">${[[5,500],[20,2500],[50,7000]].map(([g,c])=>`<div class="deal"><span class="amt num">${COIN}${fmt(c)}</span><button class="btn y" data-ex="${g},${c}">${GEM}${g}</button></div>`).join("")}</div>
  <h3>${t("gemPacks")}</h3><div class="grid3">${[[50,"0,99 $"],[150,"2,49 $"],[500,"6,99 $"]].map(([g,p])=>`<div class="deal"><span class="amt num">${GEM}${g}</span><button class="btn" data-pay="1">${p}</button></div>`).join("")}</div>
  <p class="note">${t("testNote")}</p>`}
$("#shopIn").addEventListener("click",e=>{
  if(e.target.closest("#adBtn")){const ab=e.target.closest("#adBtn");if(ab.disabled||!$("#adM").hidden)return;if(adsLeft()<=0){toast(t("adLimit"));return}ab.disabled=true;showAd(()=>{S.ads.n++;S.gems+=5;save();renderWallet();renderShop();toast(t("got")+": +5")});return}
  const x=e.target.closest("[data-ex]");if(x){const[g,c]=x.dataset.ex.split(",").map(Number);if(!spend(0,g))return;S.coins+=c;save();renderWallet();toast(t("got")+": "+fmt(c));return}
  if(e.target.closest("[data-pay]"))toast(t("testNote"));
});
function showAd(cb){const m=$("#adM");m.hidden=false;let n=3;$("#adCount").textContent=n;const iv=setInterval(()=>{n--;$("#adCount").textContent=n;if(n<=0){clearInterval(iv);m.hidden=true;cb()}},1000)}

/* ---------------- static i18n ---------------- */
function applyI18n(){document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));$("#langBtn").textContent=S.lang==="uk"?"EN":"UA";document.documentElement.lang=S.lang==="uk"?"uk":"en";document.title=t("appName")}
$("#langBtn").addEventListener("click",()=>{S.lang=S.lang==="uk"?"en":"uk";save();applyI18n();renderTabs();setTab(tab);drawSigns()});

/* ---------- run state ---------- */
let st=null,paused=false,overShown=false;
function clearWorld(){if(world){gameScene.remove(world);disposeTree(world)}world=new THREE.Group();gameScene.add(world);puffs=[];streaks=[];chunks=[];obstacles=[];coins=[];pickups=[];lookers=[];doors=[];anims=[];nextChunk=0;resetWorldState()}
function startGame(){
  let coffee=0;if(S.coffee){if(S.gems>=2){S.gems-=2;coffee=5;renderWallet()}else toast(t("noGems"));S.coffee=false;save()}
  clearWorld();sayT=0;$("#bossSay").classList.remove("show");$("#vignette").style.opacity=0;
  addChunk(-1);
  startProps=noCull(buildStart());world.add(startProps);
  if(player)gameScene.remove(player);player=noCull(buildCat(S.eq));gameScene.add(player);player.userData.laptop.visible=false;
  const bf=S.eq.sex==="f";if(!boss||boss.userData.fem!==bf){if(boss)gameScene.remove(boss);boss=bf?buildBossF():buildBoss();boss.userData.fem=bf;gameScene.add(boss)}
  $("#bossSay b").textContent=t(bf?"bossNameF":"bossName");boss.userData.skinMat.color.copy(boss.userData.skin);boss.userData.armL.rotation.set(0,0,0);boss.rotation.set(0,0,0);
  if(!shadow){shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,24),new THREE.MeshBasicMaterial({color:"#1c2445",transparent:true,opacity:.22}));shadow.rotation.x=-Math.PI/2;gameScene.add(shadow)}
  if(!bubble){bubble=new THREE.Mesh(GEO.sph,new THREE.MeshBasicMaterial({color:"#19c6e6",transparent:true,opacity:.22,depthWrite:false}));bubble.scale.setScalar(1.15);gameScene.add(bubble)}
  st={z:.3,lane:1,prevLane:1,x:0,y:.32,vy:0,lvl:0,lvlOn:false,cb:0,bossY:0,hurtCD:0,pushCD:0,slide:0,slideQ:false,speed:0,top:13,danger:0,dist:0,coins:0,gems:0,t:0,runT:0,introT:0,camB:0,coffee:0,coffeeStart:coffee,magnet:0,bed:false,gnd:0,tangle:0,jumpQ:0,coyote:0,onTop:false,clearN:0,zapK:0,laptopT:0,tGem:12,tMoney:20,tBlock:28,tMystery:rand(35,70),mystery:0,myGiven:0,prizes:[],introSaid:false,bossHop:0,
    state:"intro",caughtT:0,continued:false,bossZ:16,bossX:.6,shake:0,banked:0,bankedM:0,doubled:false,lean:0,night:0,nPhase:0,wob:0,wobA:0,
    gemsAll:0,startBest:S.best,windT:2,bridgeTold:-1};
  updateBend(0);
  gHemi.intensity=.78;sun.intensity=.65;cityMat.map=cityTex;gameScene.background.copy(ENV.office.bg);gameScene.fog.color.copy(ENV.office.fog);gameScene.fog.near=ENV.office.near;gameScene.fog.far=ENV.office.far;
  paused=false;overShown=false;mode="game";$("#app").classList.add("ingame");$("#perf").hidden=!S.perf;
  $("#top").hidden=true;$("#tabs").hidden=true;TABS.forEach(x=>$("#v-"+x).hidden=true);
  $("#hud").hidden=false;$("#overM").hidden=true;$("#pauseM").hidden=true;$("#hint").style.opacity=0;
  while(nextChunk*CH<170)addChunk(nextChunk++);
  errRun=0;shaderChecked=false;
  hudCoins=-1;hudDist=-1;hudRec=-1;hudGems=0;$("#hGems").hidden=true;$("#hRec").classList.remove("beat");$("#hRec").innerHTML=TROPHY+t("best")+" "+fmt(S.best)+" "+t("m");
}
const TROPHY='<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="#ffc531" stroke="#c98600" stroke-width="1.6"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" fill="none" stroke="#ffc531" stroke-width="1.8"/><path d="M12 14v4M8 21h8" stroke="#ffc531" stroke-width="2.2" stroke-linecap="round"/></svg>';
function backToMenu(){mode="menu";bendReset();$("#app").classList.remove("ingame");$("#perf").hidden=true;sayT=0;$("#bossSay").classList.remove("show");$("#hud").hidden=true;$("#overM").hidden=true;$("#pauseM").hidden=true;$("#vignette").style.opacity=0;$("#top").hidden=false;$("#tabs").hidden=false;renderWallet();setTab(tab)}

const JH=1.93;function jumpT(){const v=st?Math.max(13,st.speed):13;return(9.6+(v-13)*.25)/v}
function gravG(){const T=jumpT();return 8*JH/(T*T)}
function jumpV(){return 4*JH/jumpT()}
function act(dir){if(!st||st.state!=="run"||paused)return;
  if((dir==="left"||dir==="right")&&st.z>-1.9)return;
  if(dir==="left"){if(st.lane>0){st.prevLane=st.lane;st.lane--}else st.shake=.15}
  else if(dir==="right"){if(st.lane<2){st.prevLane=st.lane;st.lane++}else st.shake=.15}
  else if(dir==="up"){if((st.y<=(st.gnd||0)+.001&&st.vy<=0)||st.coyote>0){st.vy=jumpV();st.slide=0;st.coyote=0;st.jumpQ=0}else st.jumpQ=.32}
  else if(dir==="down"){if(st.y>(st.gnd||0)+.001){st.vy=-16*Math.sqrt(gravG()/28.3);st.slideQ=true}else st.slide=.8}}
let sx=null,sy=null,swiped=false;
window.addEventListener("pointerdown",e=>{if(mode!=="game"||paused)return;sx=lmx=e.clientX;sy=lmy=e.clientY;swiped=false});
window.addEventListener("pointermove",e=>{if(mode!=="game"||paused||swiped||sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>20){swiped=true;act(Math.abs(dx)>Math.abs(dy)*1.15?(dx>0?"right":"left"):(dy>0?"down":"up"))}});
function swipeEnd(e){if(mode==="game"&&!paused&&!swiped&&sx!==null&&e){const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>12){swiped=true;act(Math.abs(dx)>Math.abs(dy)*1.15?(dx>0?"right":"left"):(dy>0?"down":"up"))}}sx=null}
let lmx=0,lmy=0;window.addEventListener("pointermove",e=>{lmx=e.clientX;lmy=e.clientY},{passive:true});
window.addEventListener("pointerup",swipeEnd);window.addEventListener("pointercancel",()=>swipeEnd({clientX:lmx,clientY:lmy}));
window.addEventListener("keydown",e=>{if(mode!=="game")return;const k=e.key;
  if(k==="ArrowLeft"||k==="a")act("left");else if(k==="ArrowRight"||k==="d")act("right");else if(k==="ArrowUp"||k==="w"||k===" ")act("up");else if(k==="ArrowDown"||k==="s")act("down");else if(k==="Escape")setPause(!paused);
  if(k.startsWith("Arrow")||k===" ")e.preventDefault()});
function setPause(p){if(!st||(st.state!=="run"&&st.state!=="intro"))return;paused=p;$("#pauseM").hidden=!p}
$("#pauseBtn").addEventListener("click",()=>setPause(true));
$("#resumeBtn").addEventListener("click",()=>setPause(false));
$("#quitBtn").addEventListener("click",()=>{finalize();const n=st.prizes.filter(p=>!p.shown).map(p=>{p.shown=true;return p.gems?"+"+p.gems+" "+t("gemsGot").toLowerCase():t(p.cat+"_"+p.id)});backToMenu();if(n.length)toast(t("mysteryTitle")+": "+n.join(", "))});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&mode==="game"&&st){if(st.state==="run"||st.state==="intro")setPause(true);finalize()}});
window.addEventListener("pagehide",()=>{if(mode==="game"&&st)finalize();else save()});

/* збите падає: люди падають, важкі речі перекидаються, легкі злітають і падають на підлогу */
function knock(o){if(o.dead&&o.kn)return;o.dead=true;const T=o.type,K={t:0,r0:o.m.rotation.x,y0:o.m.position.y};o.kn=K;
  if(KN_BUMP.has(T)){K.k="bump";K.x0=o.m.position.x}
  else if(KN_FALL.has(T)){K.k="fall";K.ppl=o.m.userData&&o.m.userData.ppl}
  else if(KN_TIP.has(T))K.k="tip";
  else{K.k="fly";o.vy=rand(5,7);o.vx=o.wind?Math.sign(o.wind.v)*6:(o.x<-.5?-1:o.x>.5?1:pick([-1,1]))*rand(1,2.5);o.vz=-(st?st.speed*.45:4);o.spin=rand(-9,9)}}
function knockStep(o,dt){const K=o.kn,m=o.m;K.t+=dt;const by=o.by||0;
  if(K.k==="bump"){m.position.x=K.x0+Math.sin(K.t*45)*.09*Math.max(0,1-K.t*3);return}
  if(K.k==="fall"||K.k==="tip"){const e=Math.min(1,K.t/(K.k==="tip"?.5:.42)),ee=e*e;
    if(K.ppl&&K.ppl.length)K.ppl.forEach((p,j)=>{const e2=Math.min(1,Math.max(0,K.t-j*.08)/.45);p.rotation.x=-e2*e2*1.45;p.position.y=e2*.12});
    else{m.rotation.x=K.r0-ee*1.5;m.position.y=K.y0+ee*(K.k==="tip"?.3:.12)}
    if(e<1)m.position.z-=dt*3*(1-e);return}
  if(K.rest){m.rotation.x+=(Math.round(m.rotation.x/(Math.PI/2))*(Math.PI/2)-m.rotation.x)*Math.min(1,dt*10);m.rotation.z+=(Math.round(m.rotation.z/(Math.PI/2))*(Math.PI/2)-m.rotation.z)*Math.min(1,dt*10);return}
  o.vy-=22*dt;m.position.x+=o.vx*dt;m.position.y+=o.vy*dt;m.position.z+=o.vz*dt;m.rotation.x+=o.spin*dt;m.rotation.z+=o.spin*.5*dt;
  const water=Math.abs(m.position.x)>4.9&&bridgeL(m.position.z)>=0,fy=water?-9.5:by;
  if(water&&m.position.y<-9){m.visible=false;return}
  if(m.position.y<=fy&&o.vy<0){if(!K.b){K.b=1;o.vy*=-.32;o.vx*=.5;o.vz*=.35;o.spin*=.5;m.position.y=fy}else{m.position.y=fy;K.rest=true}}}
function hit(o){
  knock(o);
  if(st.coffee>0){st.shake=.12;return}
  if(st.bed){st.bed=false;st.shake=.2;toast(t("bedUsed"));return}
  if(st.danger>0){caught();return}
  st.speed*=.6;st.danger=4.5;st.shake=.35;bossSay()}
/* a hit without an obstacle (hot coffee, stairs): same rules as hit, with a short cooldown */
function hurt(msg){if(st.hurtCD>0)return;st.hurtCD=1.0;
  if(st.bed){st.bed=false;st.shake=.2;toast(t("bedUsed"));return}
  if(st.danger>0){caught();return}
  st.speed*=.6;st.danger=4.5;st.shake=.35;if(msg)toast(msg);bossSay()}
function caught(){st.state="caught";st.caughtT=0;st.shake=.4;bossSay(t(S.eq.sex==="f"?"bossCaughtF":"bossCaught"),2.4)}
let sayT=0,lastSay=-1;
function bossSay(txt,dur){if(!txt){const L=t("bossSay");let i;do{i=ri(L.length)}while(i===lastSay&&L.length>1);lastSay=i;txt=L[i]}
  $("#bossTxt").textContent=txt;$("#bossSay").classList.add("show");sayT=dur||2.2}
function sayTick(dt){if(sayT>0){sayT-=dt;if(sayT<=0)$("#bossSay").classList.remove("show")}}

function grantMystery(){const cats=S.eq.sex==="f"?["fur","fstyle","dress","bow","fshoes","facc"]:["fur","style","suit","tie","shoes","acc"];
  const pool=[];cats.forEach(c=>ITEMS[c].forEach(it=>{if(!S.owned.includes(c+":"+it.id))pool.push({cat:c,id:it.id})}));
  if(!pool.length){S.gems+=10;return{gems:10}}const pr=pick(pool);S.owned.push(pr.cat+":"+pr.id);return pr}
function swHTML(c,id){if(c==="style"||c==="fstyle")return`<span class="sw">${STYLE_IC[c+"_"+id]}</span>`;if(c==="acc"||c==="facc")return`<span class="sw">${ACC_IC[id]}</span>`;if(c==="bow")return`<span class="sw">${bowSVG(ITEMS.bow.find(i=>i.id===id)||ITEMS.bow[0])}</span>`;return`<span class="sw" style="background:${colorOf(c,id)}"></span>`}
function finalize(){if(!st)return;while(st.myGiven<st.mystery){st.prizes.push(grantMystery());st.myGiven++}const earned=st.coins+Math.floor(Math.max(0,st.dist)/10)-st.banked;S.coins+=Math.max(0,earned);st.banked+=Math.max(0,earned);
  S.gems+=st.gems;st.gems=0;const dm=Math.floor(Math.max(0,st.dist))-st.bankedM;S.totalM+=Math.max(0,dm);st.bankedM+=Math.max(0,dm);
  const nb=Math.floor(st.dist)>S.best;if(nb)S.best=Math.floor(st.dist);save();return nb}
function showOver(){overShown=true;const gemsRun=st.gemsAll;const nb=finalize();
  const canCont=!st.continued;const fresh=st.prizes.filter(p=>!p.shown);fresh.forEach(p=>p.shown=true);
  $("#overIn").innerHTML=`<h2>${t("caught")}</h2><p class="muted" style="margin:-6px 0 0">${t(S.eq.sex==="f"?"caughtSubF":"caughtSub")}</p>${nb?`<div class="newbest">${t("newBest")}</div>`:""}
  <div class="res"><div class="kpi"><span>${t("dist")}</span><b class="num">${Math.floor(Math.max(0,st.dist))} ${t("m")}</b></div><div class="kpi"><span>${t("earned")}</span><b class="num">${COIN}<span id="ovCoins">${fmt(st.banked)}</span></b></div></div>
  ${gemsRun?`<div class="muted">${t("gemsGot")}: +${gemsRun}</div>`:""}
  ${fresh.map(p=>p.gems?`<div class="prize"><span class="sw">${GEM}</span><div><span>${t("mysteryTitle")}</span><b>+${p.gems} ${t("gemsGot").toLowerCase()}</b></div></div>`:`<div class="prize">${swHTML(p.cat,p.id)}<div><span>${t("mysteryTitle")}</span><b>${t(p.cat+"_"+p.id)}</b></div><button class="btn y" data-wear="${p.cat}:${p.id}">${t("wearIt")}</button></div>`).join("")}
  ${canCont?`<button class="btn g" id="contBtn">${t("cont")} · ${GEM}3</button>`:""}
  ${st.doubled?"":`<button class="btn y" id="dblBtn">${t("dbl")} · ${t("watch")}</button>`}
  <div class="btnrow" style="margin-top:0;flex-wrap:nowrap"><button class="btn" id="againBtn">${t("again")}</button><button class="btn ghost" id="menuBtn">${t("menu")}</button></div>`;
  $("#overM").hidden=false}
$("#overIn").addEventListener("click",e=>{
  const w=e.target.closest("[data-wear]");if(w){const[c,id]=w.dataset.wear.split(":");S.eq[c]=id;save();w.textContent=t("wearing");w.disabled=true;if(player){const keep=player.userData.laptop.visible;gameScene.remove(player);const pp=player.position.clone(),pr=player.rotation.clone();player=buildCat(S.eq);player.position.copy(pp);player.rotation.copy(pr);player.userData.laptop.visible=keep;gameScene.add(player)}rebuildPreview();return}
  if(e.target.closest("#againBtn")){startGame();return}
  if(e.target.closest("#menuBtn")){backToMenu();return}
  if(e.target.closest("#dblBtn")){const b=e.target.closest("#dblBtn");b.disabled=true;showAd(()=>{if(st.doubled)return;st.doubled=true;S.coins+=st.banked;save();$("#ovCoins").textContent=fmt(st.banked*2);toast(t("got")+": +"+fmt(st.banked))});return}
  if(e.target.closest("#contBtn")){const cb=e.target.closest("#contBtn");if(cb.disabled)return;if(!spend(0,3))return;cb.disabled=true;safeLane();st.continued=true;st.state="run";st.danger=0;st.coffee=2.5;st.speed=Math.max(st.speed,st.top*.8);st.bossZ=st.z+14;player.rotation.x=0;
    obstacles.forEach(o=>{if(!o.dead&&!o.raft&&o.m.position.z<st.z+2&&o.m.position.z>st.z-30){o.dead=true;o.m.visible=false}});$("#overM").hidden=true;overShown=false}
});

/* ---------- update ---------- */
let hudCoins=-1,hudDist=-1,hudRec=-1,hudGems=0;
function update(dt){
  st.t+=dt;sayTick(dt);
  if(st.state==="intro")introUpdate(dt);
  else if(st.state==="caught")caughtUpdate(dt);
  else runUpdate(dt);
  worldAnim(dt);
  camUpdate(dt);
}
function introUpdate(dt){
  st.introT+=dt;const it=st.introT,u=player.userData,sp=startProps.userData;
  player.position.set(0,.32,.3);player.rotation.set(0,0,0);
  u.legL.rotation.x=u.legR.rotation.x=1.45;
  if(it<.7){u.armL.rotation.x=u.armR.rotation.x=1.15+Math.sin(it*34)*.12;u.head.rotation.y=0}
  else if(it<1.05){u.armL.rotation.x=u.armR.rotation.x=.4;u.head.rotation.y=lerp(u.head.rotation.y,2.4,Math.min(1,dt*12))}
  else{u.head.rotation.y=lerp(u.head.rotation.y,0,Math.min(1,dt*14));u.armR.rotation.x=1.0;if(it>1.2){sp.lap.visible=false;u.laptop.visible=true}}
  excl.visible=it>.75&&it<1.55;excl.position.set(0,2.65,.3);if(it>.55&&!st.introSaid){st.introSaid=true;bossSay(t("bossIntro"),2)}
  st.bossZ=lerp(st.bossZ,4.4,Math.min(1,dt*2.2));st.bossX=lerp(st.bossX,.6,Math.min(1,dt*2));
  boss.position.set(st.bossX,0,st.bossZ);const bu=boss.userData,bp=st.t*9;bu.legL.rotation.x=Math.sin(bp)*.7;bu.legR.rotation.x=-Math.sin(bp)*.7;bu.armL.rotation.x=-Math.sin(bp)*.7;
  shadow.position.set(0,.03,.3);bubble.visible=false;
  if(it>=1.45){st.state="run";st.runT=0;st.vy=8.6;st.speed=7;st.danger=2.4;st.coffee=st.coffeeStart;sp.chairV=4;u.head.rotation.y=0;
    const h=$("#hint");h.style.opacity=1;setTimeout(()=>{if(h)h.style.opacity=0},4200)}
}
/* після «Тікати далі» котик стає на доріжку без гарячої кави */
function safeLane(){const hot=l=>hazards.some(h=>Math.abs(h.x-LX[l])<.85&&st.z+2>=h.zF&&st.z-25<=h.zN);if(!hot(st.lane))return;
  const c=[st.lane-1,st.lane+1,st.lane-2,st.lane+2].filter(l=>l>=0&&l<3&&!hot(l));if(c.length){st.lane=c[0];st.x=LX[c[0]]}}
function caughtUpdate(dt){
  const bu=boss.userData;st.caughtT+=dt;st.bossZ+=(st.z+1.0-st.bossZ)*Math.min(1,dt*6);st.bossX+=(st.x-st.bossX)*Math.min(1,dt*6);
  player.rotation.x+=(0.35-player.rotation.x)*Math.min(1,dt*8);
  boss.position.set(st.bossX,st.bossY||0,st.bossZ);bu.armL.rotation.x=-1.3;bu.armL.rotation.z=0;bu.skinMat.color.copy(bu.angry);
  $("#vignette").style.opacity=.9;
  if(st.caughtT>1.0&&!overShown)showOver()}
function runUpdate(dt){
  const u=player.userData,bu=boss.userData;
  st.runT+=dt;
  st.top=Math.min(13+st.runT*.22,30);
  const d=st.top-st.speed;st.speed+=Math.sign(d)*Math.min(Math.abs(d),(d>0?(st.speed<12?9:2.4):8)*dt);
  const v=st.speed;
  const pz=st.z;st.z-=v*dt;st.dist=-st.z;const zLo=st.z,zHi=pz;
  st.coffee=Math.max(0,st.coffee-dt);st.magnet=Math.max(0,st.magnet-dt);st.danger=Math.max(0,st.danger-dt);st.slide=Math.max(0,st.slide-dt);
  st.tangle=Math.max(0,(st.tangle||0)-dt);st.x+=(LX[st.lane]-st.x)*Math.min(1,dt*(st.tangle>0?9:24));
  st.hurtCD=Math.max(0,st.hurtCD-dt);st.pushCD=Math.max(0,st.pushCD-dt);
  const lvl=structAt(st.x,st.z,st.y,st.lvlOn);st.lvl=lvl;
  let gnd=lvl;for(const o of obstacles){if(o.dead||o.top===undefined)continue;if(Math.abs(o.m.position.z-st.z)<Math.max(o.half-.05,1.1)&&Math.abs(o.x-st.x)<(o.hx?o.hx-.15:.95)&&st.y>=o.top-.38)gnd=Math.max(gnd,o.top)}
  st.gnd=gnd;if(st.lvlOn&&st.vy<=0&&st.y>gnd&&st.y-gnd<.6)st.y=gnd;
  const wasUp=st.onTop;st.jumpQ=Math.max(0,st.jumpQ-dt);st.coyote=Math.max(0,st.coyote-dt);
  if(st.y>gnd||st.vy>0){st.vy-=gravG()*dt;st.y+=st.vy*dt;if(st.y<=gnd&&st.vy<=0){st.y=gnd;st.vy=0;if(st.slideQ){st.slide=.7;st.slideQ=false}}}else{st.y=gnd;st.vy=0}
  const grounded=st.y<=gnd+.001&&st.vy<=0;st.onTop=grounded&&gnd>0;st.lvlOn=grounded&&lvl>0&&gnd===lvl;
  if(grounded&&st.jumpQ>0){st.vy=jumpV();st.slide=0;st.jumpQ=0;st.coyote=0}
  else if(wasUp&&!st.onTop&&!grounded&&st.vy<=0)st.coyote=.2;
  while(nextChunk*CH<st.dist+150)addChunk(nextChunk++);
  cafeTick();
  /* міст: вітер кидає сміття */
  const bl=bridgeL(st.z);
  if(bl>=0&&bl<12){const bk=Math.round(-st.z-bl);if(st.bridgeTold!==bk){st.bridgeTold=bk;toast(t("bridgeOn"))}}
  if(bl>=14&&bl<=392){st.windT-=dt;if(st.windT<=0){st.windT=rand(4.5,7);const dir=Math.random()<.5?-1:1;toast(t("wind")+" "+(dir>0?"→":"←"));windGust(dir);st.shake=Math.max(st.shake,.12)}}else st.windT=rand(2,3);
  waters=waters.filter(w=>{if(-st.z>w.end){world.remove(w.m);disposeTree(w.m);return false}return true});
  st.tGem-=dt;st.tMoney-=dt;st.tBlock-=dt;st.laptopT=Math.max(0,st.laptopT-dt);
  if(st.tGem<=0&&spawnTimed("gem"))st.tGem+=60;
  if(st.tMoney<=0&&spawnTimed("money"))st.tMoney+=60;
  if(st.tBlock<=0&&spawnTimed("block"))st.tBlock+=60;
  st.tMystery-=dt;if(st.tMystery<=0&&spawnTimed("mystery"))st.tMystery+=150;
  if(st.clearN>0){const cand=obstacles.filter(o=>!o.dead&&!o.zapping&&!o.raft&&Math.abs((o.by||0)-st.lvl)<2&&o.m.position.z<st.z+.5).sort((a,b)=>b.m.position.z-a.m.position.z);
    for(const o of cand){if(st.clearN<=0)break;o.zapping=true;o.zapT=.05+st.zapK*.1;st.zapK++;st.clearN--}}
  while(chunks.length&&chunks[0].z0-CH>st.z+16){const c=chunks.shift();world.remove(c.g);disposeTree(c.g);const ci=c.i;
    obstacles=obstacles.filter(o=>o.chunk!==ci);coins=coins.filter(o=>o.chunk!==ci);pickups=pickups.filter(o=>o.chunk!==ci);lookers=lookers.filter(o=>o.chunk!==ci);doors=doors.filter(o=>o.chunk!==ci);anims=anims.filter(o=>o.chunk!==ci);hazards=hazards.filter(o=>o.chunk!==ci)}
  const bottom=st.y,topY=st.y+(st.slide>0?.72:1.65);
  for(const o of obstacles){
    if(o.raft){const R=o.raft;let z=o.m.position.z+R.v*dt;if(z>R.zN-.7)z-=R.zN-R.zF-1.4;o.m.position.z=z;
      o.m.scale.setScalar(Math.max(.25,Math.min(1,Math.min(z-R.zF-.7,R.zN-.7-z)/1.2)));o.m.position.y=Math.sin(st.t*2+z)*.03;o.m.rotation.y=Math.sin(st.t*.7+z)*.15;continue}
    if(o.zapping&&!o.dead){o.zapT-=dt;if(o.zapT<=0){o.dead=true;o.zapped=true;o.life=0;o.vy=8;o.vx=(o.x<-.5?-1:o.x>.5?1:pick([-1,1]))*7;o.spin=rand(-9,9);puff(o.m.position)}continue}
    if(o.dead){if(o.m.visible&&o.zapped){o.life+=dt;o.m.position.x+=o.vx*dt;o.m.rotation.y+=o.spin*dt;const sc=1-o.life*1.5;if(sc<=.02)o.m.visible=false;else o.m.scale.setScalar(sc)}
      else if(o.m.visible&&o.kn){if(Math.abs(o.m.position.z-st.z)<80)knockStep(o,dt)}
      else if(o.m.visible){o.vy-=22*dt;o.m.position.y+=o.vy*dt;o.m.rotation.x+=o.spin*dt;o.m.position.z-=v*.4*dt;if(o.m.position.y<-4)o.m.visible=false}continue}
    const oz=o.m.position.z;
    if(o.warn&&!o.warned&&st.z-oz<55&&st.z-oz>0){o.warned=true;toast(t(o.warn))}
    if(o.toss){o.toss.t+=dt;const k=Math.min(1,o.toss.t/.35);o.m.position.x=lerp(o.toss.x0,o.x,k);o.m.position.y=Math.sin(k*Math.PI)*1.3;if(k>=1)o.toss=null}
    if(o.pp){const Q=o.pp,sp=4.4,q=((Q.p0+Q.v*st.t)%(2*sp)+2*sp)%(2*sp),fw=q<sp,x=fw?-2.2+q:2.2-(q-sp);o.x=x;o.m.position.x=x;o.m.rotation.y=(fw?0:Math.PI)+Q.rot;
      if(Math.abs(oz-st.z)<70){const u=o.m.userData;if(u.legs)u.legs.forEach((l,k)=>{if(Q.rot)l.rotation.x=Math.sin(st.t*20+k)*.3;else l.rotation.z=Math.sin(st.t*16+(k%2?Math.PI:0)+(k>1?.8:0))*.6});if(u.tail)u.tail.rotation.x=Math.sin(st.t*14)*.5}}
    if(o.bob){const ry=1.45+Math.sin(st.t*2.2+o.bob.p0)*1.25,u=o.m.userData,th=5.2-ry-.25;u.sp.position.y=ry;u.th.scale.y=Math.max(.05,th);u.th.position.y=ry+.25+th/2;
      o.ymin=o.by+ry-.35;o.ymax=o.by+ry+.35;if(Math.abs(oz-st.z)<50)u.legs.forEach((l,k)=>l.rotation.x=Math.sin(st.t*9+k)*.2)}
    if(o.cour){const C=o.cour,ah=st.z-oz;if(!C.go&&ah<75)C.go=true;
      if(C.go){o.m.position.z+=C.v*dt;const u=o.m.userData,w2=st.t*9;u.legL.rotation.x=Math.sin(w2)*.7;u.legR.rotation.x=-Math.sin(w2)*.7;
        C.tt-=dt;if(C.tt<=0&&C.n<5&&ah>9){C.tt=.55;C.n++;let L=C.lane+C.side;if(L<0||L>2)L=C.lane-C.side;C.side*=-1;const c=findChunk(oz);if(c){const b=spawnObs(c.g,"boxes",L,oz-.3,c.i,0);b.toss={t:0,x0:o.x}}}}}
    if(o.wind){const W=o.wind,x=o.m.position.x+W.v*dt;o.m.position.x=x;o.x=x;o.m.position.y=W.y0+Math.sin(st.t*5+W.ph)*.12;o.ymin=o.m.position.y-.3;o.ymax=o.m.position.y+.3;
      o.m.rotation.x+=dt*4;o.m.rotation.z+=dt*W.v*.8;if(Math.abs(x)>7.5){o.dead=true;o.m.visible=false;continue}}
    if(o.walk&&st.z-oz<70){o.m.position.z+=o.walk.v*dt;const u=o.m.userData,w2=st.t*6;u.w.legL.rotation.x=Math.sin(w2)*.5;u.w.legR.rotation.x=-Math.sin(w2)*.5;u.w.arm.rotation.x=-.8+Math.sin(w2)*.2;
      if(u.d.legs)u.d.legs.forEach((l,k)=>l.rotation.z=Math.sin(st.t*14+(k%2?Math.PI:0))*.5);if(u.d.tail)u.d.tail.rotation.y=Math.sin(st.t*9)*.6}
    if(o.ride){const R=o.ride;if(!R.go&&st.z-oz<75)R.go=true;if(R.go){o.m.position.z+=R.v*dt;const u=o.m.userData.u,w2=st.t*9;u.legL.rotation.x=-1.0+Math.sin(w2)*.7;u.legR.rotation.x=-1.0-Math.sin(w2)*.7}}
    if(o.lat){const L=o.lat,x=((L.p0+L.v*st.t)%L.L+L.L)%L.L+L.c;o.x=x;o.m.position.x=x;o.m.position.y=Math.abs(x)>4.3?.26:0;o.m.scale.setScalar(Math.max(0,Math.min(1,(-L.c-Math.abs(x))/.6)));
      if(Math.abs(oz-st.z)<70){const w=o.m.userData,w2=st.t*7+L.p0;w.legL.rotation.x=Math.sin(w2)*.6;w.legR.rotation.x=-Math.sin(w2)*.6;w.arm.rotation.x=-Math.sin(w2)*.5}}
    if(o.car){const C=o.car,ah=st.z-oz;if(!C.go&&ah<38)C.go=true;if(C.go&&ah>6){C.v=Math.max(-9,Math.min(9,(C.xa-o.m.position.x)/(ah/Math.max(st.speed,8))))}
      if(C.go){let x=o.m.position.x+C.v*dt;if((C.v>0&&x>C.xe)||(C.v<0&&x<C.xe))x=C.xe;o.m.position.x=x;o.x=x;o.m.position.y=Math.abs(x)>4.3?.26:0}}
    if(o.move&&st.z-oz<24){const mv=o.move;const tx=mv.x0+mv.dir*2.2;if(Math.abs(o.m.position.x-tx)>.02){o.m.position.x+=Math.sign(tx-o.m.position.x)*Math.min(Math.abs(tx-o.m.position.x),3.6*dt);o.m.rotation.y+=dt*5}o.x=o.m.position.x}
    if(o.soft){if(!o.used&&(o.web?topY>o.ymin&&bottom<o.ymax:bottom<(o.type==="dump"?.42:.15))&&oz>zLo-o.half&&oz<zHi+o.half&&Math.abs(o.x-st.x)<.9){o.used=true;
      if(o.type==="puddle"){puff(o.m.position);if(st.coffee<=0){st.speed*=.86;st.wob=.6;st.wobA=.35;st.shake=.12;toast(t("puddleHit"))}}
      else if(o.web){o.m.visible=false;puff(o.m.position);if(st.coffee<=0){st.tangle=1.6;st.speed*=.72;st.shake=.3;st.wob=1.4;st.wobA=.9;toast(t("webHit"))}}else if(st.coffee<=0){if(o.type==="dump"){st.speed*=.74;st.wob=.9;st.wobA=.5;st.shake=.2;toast(t("dumpHit"));puff(o.m.position)}else{st.tangle=1.6;st.speed*=.72;st.shake=.35;st.wob=1.6;st.wobA=1;toast(t("tangled"));bossSay(t("bossTangle"),1.8)}}}continue}
    if(oz<zLo-o.half-.3||oz>zHi+o.half+.3)continue;if(Math.abs(o.x-st.x)>(o.hx||1.0))continue;
    if(o.top!==undefined&&bottom>=o.top-.38)continue;
    if(topY>o.ymin&&bottom<o.ymax){hit(o);if(st.state!=="run")break}}
  /* cafe: solid sides of the stairs, hot coffee river */
  if(st.state==="run"){
    if(st.pushCD<=0&&structHit(st.x,st.z,bottom,topY)){st.pushCD=.5;if(st.coffee<=0)hurt();else st.shake=.12;const L=st.lane;st.lane=L===1?(st.prevLane===0||st.prevLane===2?st.prevLane:pick([0,2])):1;st.prevLane=L}
    const hz=hazards.find(h=>st.z<=h.zN&&st.z>=h.zF&&Math.abs(st.x-h.x)<.85);
    if(hz&&st.y<.1&&st.gnd<.1&&st.state==="run"){if(st.coffee>0)st.coffee=Math.max(0,st.coffee-dt*4);else if(st.hurtCD<=0){hurt(t("burned"));puff(player.position);if(st.state==="run"){st.vy=jumpV()*.6;st.slide=0}}}}
  const cy=st.y+.8;
  for(const c of coins){if(c.taken)continue;const p=c.m.position;const dz=p.z-st.z;if(dz>3||dz<-60)continue;c.m.rotation.z=st.t*4;
    if(st.magnet>0&&dz>-12&&Math.abs(p.y-cy)<3){p.x+=(st.x-p.x)*Math.min(1,dt*7);p.y+=(cy-p.y)*Math.min(1,dt*7);p.z+=(st.z-p.z)*Math.min(1,dt*5)}
    if(Math.abs(p.z-st.z)<.8&&Math.abs(p.x-st.x)<.9&&Math.abs(p.y-cy)<1.2){c.taken=true;c.m.visible=false;st.coins++}}
  for(const pk of pickups){if(pk.taken)continue;const p=pk.m.position;pk.m.rotation.y=st.t*2.5;p.y=(pk.by||0)+1.15+Math.sin(st.t*4)*.15;
    pk.gl.position.y=p.y;pk.gl.material.opacity=.55+Math.sin(st.t*6)*.2;pk.ring.scale.setScalar(1.3+Math.sin(st.t*5)*.2);
    if(Math.abs(p.z-st.z)<.9&&Math.abs(p.x-st.x)<1&&Math.abs(p.y-cy)<1.3){pk.taken=true;pk.m.visible=false;pk.gl.visible=false;pk.ring.visible=false;pk.beam.visible=false;
      if(pk.kind==="coffee")st.coffee=5;else if(pk.kind==="magnet")st.magnet=8;else if(pk.kind==="bed")st.bed=true;
      else if(pk.kind==="laptop"){st.clearN=10;st.zapK=0;st.laptopT=2;toast(t("laptopUsed"))}
      else if(MONEY[pk.kind]){const n=MONEY[pk.kind];st.coins+=n;toast(t("coinsGot").replace("{n}",fmt(n)));if(n>=500)st.shake=Math.max(st.shake,.15)}
      else if(pk.kind==="gem"){st.gems++;st.gemsAll++;toast(t("gemGot"))}
      else if(pk.kind==="gem3"){st.gems+=3;st.gemsAll+=3;toast(t("gem3Got"))}
      else if(pk.kind==="mystery"){st.mystery++;toast(t("mysteryGot"))}}}
  /* cat animation */
  const ph=st.t*(6+v*.35),sw=Math.sin(ph);
  const air=st.y>st.gnd+.02,tg=st.tangle>0&&!air;
  if(air){u.legL.rotation.x=-1.0;u.legR.rotation.x=.5;u.armL.rotation.x=-1.2}else{u.legL.rotation.x=sw*.95;u.legR.rotation.x=-sw*.95;u.armL.rotation.x=-sw*.8}
  u.legL.rotation.z=tg?.38+Math.sin(st.t*20)*.15:0;u.legR.rotation.z=tg?-.38-Math.sin(st.t*20)*.15:0;if(tg){u.armL.rotation.x=-2.4+Math.sin(st.t*16)*.5;u.armR.rotation.z=.25+Math.sin(st.t*14)*.6}else u.armR.rotation.z=.25;
  u.armR.rotation.x=sw*.25;animExtras(u,st.t);u.tail.rotation.x=-.4+Math.sin(ph*.5)*.25;u.tail.rotation.z=Math.sin(ph*.5)*.3;
  const leanT=st.slide>0?1.15:0;st.lean+=(leanT-st.lean)*Math.min(1,dt*16);
  player.rotation.set(st.lean,0,(st.x-LX[st.lane])*.12);
  if(tg)player.rotation.z+=Math.sin(st.t*18)*.14;
  player.position.set(st.x,st.y+(air?0:Math.abs(sw)*.07),st.z);
  shadow.position.set(st.x,st.gnd+.03,st.z);shadow.scale.setScalar(Math.max(.4,1-(st.y-st.gnd)*.3));
  bubble.visible=st.coffee>0;bubble.material.color.set("#ffc531");bubble.material.opacity=st.coffee>0&&st.coffee<1.5?(.12+Math.abs(Math.sin(st.t*12))*.18):.24;bubble.position.set(st.x,st.y+.95,st.z);
  excl.visible=false;
  /* boss */
  const bTarget=st.danger>0?st.z+3.4:st.tangle>0?st.z+8:st.z+16;st.bossZ+=(bTarget-st.bossZ)*Math.min(1,dt*(st.danger>0?4:1.5));st.bossX+=(st.x+.3-st.bossX)*Math.min(1,dt*3);
  const bp=st.t*11,near=st.danger>0||st.tangle>0;st.bossHop=Math.max(0,(st.bossHop||0)-dt);st.bossY+=(st.lvl-st.bossY)*Math.min(1,dt*5);
  boss.position.set(st.bossX,st.bossY+Math.abs(Math.sin(bp))*.12+(st.bossHop>0?Math.sin(st.bossHop/.45*Math.PI)*.9:0),st.bossZ);boss.rotation.z=Math.sin(bp)*.06;
  bu.legL.rotation.x=Math.sin(bp)*1.05;bu.legR.rotation.x=-Math.sin(bp)*1.05;
  bu.armL.rotation.x=near?-1.55+Math.sin(st.t*14)*.25:-Math.sin(bp)*.9;bu.armL.rotation.z=near?.15:0;
  bu.tie.rotation.x=.35+Math.abs(Math.sin(bp))*.3;bu.tie.rotation.z=near?.95+Math.sin(st.t*16)*.3:.25+Math.sin(bp)*.15;
  bu.skinMat.color.copy(bu.skin).lerp(bu.angry,near?.85:.25);
  for(const o of obstacles){if(o.dead||o.soft||o.raft||Math.abs((o.by||0)-st.bossY)>1.5)continue;const dz=o.m.position.z-st.bossZ;if(Math.abs(dz)<.9&&Math.abs(o.x-st.bossX)<1.1){if(o.top!==undefined&&o.top-(o.by||0)<1.3)knock(o);else if(st.bossHop<=0)st.bossHop=.45}}
  $("#vignette").style.opacity=st.danger>0?(.45+Math.sin(st.t*10)*.2):0;
  /* HUD */
  const di=Math.max(0,Math.floor(st.dist));if(di!==hudDist){hudDist=di;$("#hDist").textContent=di+" "+t("m")}
  if(st.coins!==hudCoins){hudCoins=st.coins;$("#hCoins").innerHTML=COIN+st.coins}
  const rec=Math.max(st.startBest,di);if(rec!==hudRec){hudRec=rec;$("#hRec").innerHTML=TROPHY+t("best")+" "+fmt(rec)+" "+t("m");$("#hRec").classList.toggle("beat",st.startBest>0&&di>st.startBest)}
  if(st.gemsAll!==hudGems){const el=$("#hGems");el.hidden=st.gemsAll<=0;el.innerHTML=GEM+st.gemsAll;if(st.gemsAll>hudGems){el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")}hudGems=st.gemsAll}
  const pw=[];if(st.coffee>0)pw.push([t("pwCoffee"),Math.min(1,st.coffee/5)]);if(st.magnet>0)pw.push([t("pwMagnet"),st.magnet/8]);if(st.bed)pw.push([t("pwBed"),1]);if(st.laptopT>0)pw.push([t("pwLaptop"),st.laptopT/2]);if(st.mystery>st.myGiven)pw.push([t("pwMystery")+(st.mystery-st.myGiven>1?" ×"+(st.mystery-st.myGiven):""),1]);
  const h=$("#hPw"),key=pw.map(p=>p[0]).join("|");if(h._last!==key){h.innerHTML=pw.map(p=>`<div class="pw">${p[0]}<i><u></u></i></div>`).join("");h._last=key;h._bars=[...h.querySelectorAll("u")]}
  pw.forEach((p,i)=>{const w=Math.round(p[1]*100)+"%",b=h._bars[i];if(b&&b.style.width!==w)b.style.width=w});
}
function worldAnim(dt){
  for(const p of puffs){p.t+=dt;p.sp.scale.setScalar(.5+p.t*4);p.sp.material.opacity=Math.max(0,1-p.t*2);if(p.t>.5){world.remove(p.sp);p.sp.material.dispose()}}
  puffs=puffs.filter(p=>p.t<=.5);
  const bu=boss.userData;
  const hot=st.danger>0||st.state==="caught"||st.state==="intro";bu.sign.rotation.z=Math.sin(st.t*(hot?9:5.5))*(hot?.2:.12);bu.steam.forEach(p=>{const k=(st.t*(hot?2.6:1.4)+p.k/3)%1;p.m.position.set(p.s*(.44+k*.14),.08+k*.36,0);p.m.scale.setScalar((hot?.05:.035)+k*(hot?.1:.07))});
  for(const a of anims){if(Math.abs(a.z-st.z)<60+(a.far||0))a.f(st.t,dt)}
  cafeAnim(dt);streakAnim(dt);waterTex.offset.x+=dt*.01;waterTex.offset.y+=dt*.02;
  for(const L of lookers){if(Math.abs(L.z-st.z)>24)continue;const dx=st.x-L.x,dz=st.z-L.z;let h=Math.atan2(-dx,-dz)-L.r;h=Math.atan2(Math.sin(h),Math.cos(h));h=Math.max(-1.4,Math.min(1.4,h));L.head.rotation.y+=(h-L.head.rotation.y)*Math.min(1,dt*6)}
  for(const D of doors){const dd=st.z-D.z;const tgt=dd<40&&dd>-10?1:0;D.o+=(tgt-D.o)*Math.min(1,dt*4);D.L.position.x=-.9-D.o*3.7;D.R.position.x=.9+D.o*3.7}
  if(startProps){const sp=startProps.userData;if(sp.chairV>0){sp.chair.position.z+=sp.chairV*dt;sp.chair.rotation.y+=sp.chairV*dt*1.5;sp.chairV=Math.max(0,sp.chairV-dt*4)}}
  const zone=zoneOf(Math.floor(Math.max(-1,st.dist)/CH)),E=ENV[zone],k=Math.min(1,dt*2.5),f=gameScene.fog;
  applyNight(zone,E,k,dt);f.near+=(E.near-f.near)*k;f.far+=(E.far-f.far)*k;
}
const camP=new THREE.Vector3(),camT=new THREE.Vector3();
function camUpdate(dt){
  if(st.state==="run")st.camB=Math.min(1,st.camB+dt/1.2);
  st.cb+=((st.lvl||0)-st.cb)*Math.min(1,dt*6);
  st.shake=Math.max(0,st.shake-dt);st.wob=Math.max(0,(st.wob||0)-dt);
  const e=st.camB*st.camB*(3-2*st.camB),sh=st.shake>0?(Math.random()-.5)*st.shake:0,wa=(st.wobA||0)*Math.min(1,st.wob/.6);
  const px=st.x*.6+sh+Math.sin(st.t*13)*.32*wa,py=4.1+st.cb+(st.y-st.cb)*.3+Math.sin(st.t*19)*.12*wa,pz=st.z+6.8,lx=st.x*.35,ly=1.25+st.cb+(st.y-st.cb)*.25,lz=st.z-7;
  updateBend(-st.z);
  bendPt(lerp(2.1,px,e),lerp(2.3,py,e),lerp(3.7,pz,e),camP);bendPt(lerp(-.1,lx,e),lerp(1.15,ly,e),lerp(-.7,lz,e),camT);
  gameCam.position.copy(camP);gameCam.lookAt(camT);
  if(wa>0)gameCam.rotateZ(Math.sin(st.t*9)*.11*wa)}

/* ---------- loop ---------- */
let prevKey="",camD=0,camOff=0;
function layoutPreview(dt){const w=window.innerWidth,h=window.innerHeight,sh=document.querySelector("#v-"+(CATV(tab)?tab:"cat")+" .sheet");
  const topH=$("#top").offsetHeight||58,botH=$("#tabs").offsetHeight+(sh?sh.offsetHeight:250)+8,freeH=Math.max(120,h-topH-botH);
  const fov=34,tn=Math.tan(fov*Math.PI/360),catH=2.9,fit=.8;
  let d=catH*h/(fit*freeH*2*tn);const dW=1.9*h/(w*.8*2*tn);d=Math.max(d,dW,3.5);const off=h/2-(topH+freeH/2);
  if(!camD||!dt){camD=d;camOff=off}else{const k=Math.min(1,dt*9);camD+=(d-camD)*k;camOff+=(off-camOff)*k}
  const key=w+"x"+h+":"+camD.toFixed(3)+":"+camOff.toFixed(1)+":"+catShift;if(key===prevKey)return;prevKey=key;
  prevCam.fov=fov;prevCam.aspect=w/h;prevCam.position.set(0,1.45,camD);prevCam.lookAt(0,1.1,0);
  prevCam.setViewOffset(w,h,-catShift,camOff,w,h);prevCam.updateProjectionMatrix()}
function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);
  gameCam.aspect=w/h;gameCam.updateProjectionMatrix();prevCam.aspect=w/h;
  prevKey="";layoutPreview()}
window.addEventListener("resize",resize);
let last=performance.now();
let loopErr=0,errRun=0;
/* лічильник FPS (5 тапів по «Рекорд» на вкладці «Котик») і журнал помилок у localStorage */
const PF={n:0,t:0,fps:0,last:""};
function perfTick(raw){if(!S.perf||mode!=="game")return;PF.n++;PF.t+=raw;if(PF.t<.5)return;PF.fps=Math.round(PF.n/PF.t);PF.n=0;PF.t=0;
  const r=renderer.info.render,m=renderer.info.memory;$("#perf").textContent=`FPS ${PF.fps}\nвиклики ${r.calls} · трикутн. ${Math.round(r.triangles/1000)}k\nгеометрії ${m.geometries} · текстури ${m.textures}`+(PF.last?`\n⚠ ${PF.last}`:"")}
function logErr(e,where){try{const L=JSON.parse(localStorage.getItem(KEY+"-errors")||"[]");const msg=String(e&&e.message||e).slice(0,160);
  L.push({t:new Date().toISOString(),v:document.querySelector("script:not([src])")?"20":"",where,msg,stack:String(e&&e.stack||"").split("\n").slice(0,3).join(" | ").slice(0,300),dist:st?Math.floor(st.dist):0});
  while(L.length>15)L.shift();localStorage.setItem(KEY+"-errors",JSON.stringify(L));PF.last=msg.slice(0,60)}catch(x){}}
window.addEventListener("error",e=>logErr(e.error||e.message,"window"));
function showErr(){if(!$("#errM").hidden)return;try{if(mode==="game"&&st)finalize()}catch(x){}save();$("#errM").hidden=false}
$("#errBtn").addEventListener("click",()=>{save();location.reload()});
let tapN=0,tapT=0;
$("#stBest").parentElement.addEventListener("click",()=>{const n=performance.now();tapN=n-tapT<600?tapN+1:1;tapT=n;if(tapN>=5){tapN=0;S.perf=!S.perf;save();toast(t(S.perf?"perfOn":"perfOff"))}});
function loop(now){requestAnimationFrame(loop);const raw=(now-last)/1000,dt=Math.min(raw,.05);last=now;if(glLost)return;perfTick(raw);
  try{
  if(bendBroken){bendBroken=false;bendReset();[prevScene,gameScene].forEach(sc=>sc.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>m.needsUpdate=true)}))}
  slideStep(now);
  if(mode==="game"&&st){if(!paused)update(dt);renderer.render(gameScene,gameCam)}
  else if(mode==="menu"&&(CATV(tab)||showCat)&&prevCat){layoutPreview(dt);const k=now/1000;
    if(!(G&&G.kind==="spin")){spinHold=Math.max(0,spinHold-dt);const auto=tab==="ward"&&!wardStop;
      if(spinHold>0)spinVel*=Math.pow(.08,dt);else if(auto)spinVel+=(.55-spinVel)*Math.min(1,dt*2.5);else spinVel*=Math.pow(.03,dt);
      prevCat.rotation.y+=spinVel*dt;
      if(tab==="cat"&&spinHold<=0&&Math.abs(spinVel)<.08){const r=prevCat.rotation.y,tg=FRONT+Math.PI*2*Math.round((r-FRONT)/(Math.PI*2));prevCat.rotation.y+=(tg-r)*Math.min(1,dt*2.2)}}
    const u=prevCat.userData;
    animExtras(u,k);u.tail.rotation.z=Math.sin(k*2)*.35;u.head.rotation.z=Math.sin(k*.9)*.08;u.armL.rotation.x=Math.sin(k*1.4)*.12;prevCat.position.y=Math.sin(k*2.2)*.02;
    renderer.render(prevScene,prevCam)}
  else renderer.clear()
  /* перевірка шейдерів: якщо програма вигину не скомпілювалась, вимикаємо вигин (міст стане прямим) */
  if(BENDOK&&mode==="game"&&!shaderChecked){shaderChecked=true;for(const p of renderer.info.programs){if(p.diagnostics&&p.diagnostics.runnable===false){BENDOK=false;bendBroken=true;logErr("shader program failed","shader");break}}}
  }catch(e){if(loopErr++<5)console.error(e);logErr(e,"loop");if(mode==="game"&&++errRun>=3)showErr()}}
let shaderChecked=false;

/* ---------- boot ---------- */
applyTheme();
if(window.matchMedia){const mq=window.matchMedia("(prefers-color-scheme: dark)");const f=()=>{if(!S.ui)applyTheme()};if(mq.addEventListener)mq.addEventListener("change",f)}
applyI18n();renderWallet();renderTabs();renderCat();rebuildPreview();resize();requestAnimationFrame(loop);
