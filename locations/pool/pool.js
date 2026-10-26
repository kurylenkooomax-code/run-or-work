/* Локація pool (v56) — басейн під обривом (240 м): котик падає з тераси, пливе з перешкодами й виходить на пляж.
   Вода на висоті 0, котик пливе на SWIM_Y. Стрибок — вистрибнути з води (над кругом чи м'ячем),
   свайп униз — пірнути під будь-яку перешкоду (v63).
   Тут також уся логіка послідовності: падіння з обриву (котик і бос), перевдягання, пози плавання. */
const SWIM_Y=-.6,POOL_R0=226,POOL_R1=236,POOL_W=6.2;
const poolTileTex=repT(texOf((x,w,h)=>{x.fillStyle="#7fd8ef";x.fillRect(0,0,w,h);x.strokeStyle="#5fc3e0";x.lineWidth=2;for(let i=0;i<=64;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.moveTo(0,i);x.lineTo(64,i);x.stroke()}},64,64),6,14);
const poolTileMat=new THREE.MeshToonMaterial({map:poolTileTex,gradientMap:grad});
const poolWaterTex=repT(texOf((x,w,h)=>{x.fillStyle="#2fb8e6";x.fillRect(0,0,w,h);for(let i=0;i<46;i++){x.strokeStyle=Math.random()<.6?"rgba(255,255,255,.5)":"rgba(20,110,170,.35)";x.lineWidth=rand(1.5,3);
  const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.bezierCurveTo(x0+6,y-5,x0+12,y+5,x0+20,y);x.stroke()}},128,128),3,8);
/* v57: поплавці на бортиках — одна смугаста труба на відрізок замість сотень кульок (було ~170 тис. трикутників у кадрі) */
const floatTex=repT(texOf((x,w,h)=>{["#e53935","#ffffff","#2f6fed"].forEach((c,k)=>{x.fillStyle=c;x.fillRect(0,k*h/3,w,h/3)});x.fillStyle="rgba(0,0,0,.18)";for(let k=0;k<3;k++)x.fillRect(0,k*h/3,w,2)},8,48),1,17);
const floatMat=new THREE.MeshToonMaterial({map:floatTex,gradientMap:grad}),floatGeo=new THREE.CylinderGeometry(1,1,1,8,1,true);
const poolWaterMat=new THREE.MeshBasicMaterial({map:poolWaterTex,transparent:true,opacity:.72,depthWrite:false});
const sandTex=repT(texOf((x,w,h)=>{x.fillStyle="#f2d9a2";x.fillRect(0,0,w,h);for(let i=0;i<700;i++){x.fillStyle=pick(["rgba(200,160,100,.35)","rgba(255,245,220,.5)","rgba(170,130,80,.25)"]);x.fillRect(Math.random()*w,Math.random()*h,2,2)}},64,64),8,10);
const sandMat=new THREE.MeshToonMaterial({map:sandTex,gradientMap:grad});
function palm(d,x,z,h,lean){h=h||rand(4.2,6);lean=lean||rand(-.25,.25);let px=x,py=0;
  for(let q=0;q<7;q++){const sh=q/6;px+=lean*.25*sh;d.add(mesh(GEO.cyl,q%2?"#9b6b3f":"#8a5d35",.2-q*.012,h/7+.05,.2-q*.012,px,py+h/14,z));py+=h/7}
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2,lf=mesh(GEO.cone,k%2?"#3fae5a":"#2f9a4c",.22,2.2,.05,px+Math.cos(a)*.9,py-.25,z+Math.sin(a)*.9);lf.rotation.z=Math.cos(a)*1.9;lf.rotation.x=-Math.sin(a)*1.9;lf.rotation.y=0;d.add(lf)}
  [[.15,0],[-.1,.12],[0,-.15]].forEach(([dx,dz])=>d.add(mesh(GEO.sph,"#7a5130",.16,.16,.16,px+dx,py-.25,z+dz)))}
function lounger(d,x,z,c){d.add(mesh(GEO.box,"#f4f6fb",.8,.12,1.9,x,.62,z));const bk=mesh(GEO.box,"#f4f6fb",.8,.1,.8,x,.92,z-1.05);bk.rotation.x=.75;d.add(bk);
  d.add(mesh(GEO.box,c,.7,.04,1.6,x,.7,z+.05));[-.32,.32].forEach(q=>[-.75,.75].forEach(w=>d.add(mesh(GEO.box,"#9aa3b5",.05,.32,.05,x+q,.42,z+w))))}
function umbrella(d,x,z,c,y0){y0=y0||0;d.add(mesh(GEO.cyl,"#f4f6fb",.05,2.5,.05,x,y0+1.25,z));const tp=mesh(GEO.cone,c,1.35,.55,1.35,x,y0+2.6,z);d.add(tp);d.add(mesh(GEO.cone,"#ffffff",.5,.25,.5,x,y0+2.78,z));d.add(mesh(GEO.sph,c,.08,.08,.08,x,y0+2.92,z))}
/* v63: вихід з басейну. Широкий пологий пандус із плитки (раніше пісок був нахилений не в той бік: за котиком вгору, а попереду знову вниз,
   тож після виходу здавалося, що він біжить по глибокій воді). Далі — плиткова доріжка, душ і хвіртка «ПЛЯЖ». */
const POOL_RAMP0=218,POOL_RAMP_M=228;
const poolRampY=l=>l<=POOL_RAMP0?-2.4:l<POOL_RAMP_M?lerp(-2.4,-.75,(l-POOL_RAMP0)/(POOL_RAMP_M-POOL_RAMP0)):l<POOL_R1?lerp(-.75,-.02,(l-POOL_RAMP_M)/(POOL_R1-POOL_RAMP_M)):-.02;
/* похила плита: верхня поверхня йде від (la,ya) до (lb,yb); нахил угору — вперед по ходу бігу */
function slopeBox(d,mat,w,la,ya,lb,yb,x,Lz,th){th=th||.3;const len=Math.hypot(lb-la,yb-ya),a=Math.atan2(yb-ya,lb-la),m=mesh(GEO.box,mat,w,th,len,x||0,(ya+yb)/2-th/2/Math.cos(a),Lz((la+lb)/2));m.rotation.x=a;d.add(m);return m}
function poolExit(d,Lz,l1){
  slopeBox(d,poolTileMat,POOL_W*2,POOL_RAMP0,-2.4,POOL_RAMP_M,-.75,0,Lz);
  slopeBox(d,poolTileMat,POOL_W*2,POOL_RAMP_M,-.75,POOL_R1,-.02,0,Lz);
  /* сходинки-смужки на пандусі */
  for(let l=POOL_RAMP_M;l<POOL_R1;l+=1.6)d.add(mesh(GEO.box,"#1f5fa8",POOL_W*2-.4,.03,.12,0,poolRampY(l)+.01,Lz(l)));
  /* хромовані поручні з обох боків пандуса */
  [-1,1].forEach(s=>{const x=s*(POOL_W-.95),a=POOL_R0-1,b=POOL_R1-.3;
    [a,b].forEach(l=>d.add(mesh(GEO.cyl,"#d9e2ee",.06,1.1,.06,x,poolRampY(l)+.55,Lz(l))));
    const ya=poolRampY(a)+1.1,yb=poolRampY(b)+1.1,len=Math.hypot(b-a,yb-ya),r=mesh(GEO.cyl,"#e9eef7",.055,len,.055,x,(ya+yb)/2,Lz((a+b)/2));r.rotation.x=-Math.PI/2+Math.atan2(yb-ya,b-a);d.add(r)});
  /* плиткова доріжка після басейну */
  d.add(mesh(GEO.box,poolTileMat,POOL_W*2+.8,.2,l1-POOL_R1,0,-.1,Lz((POOL_R1+l1)/2)));
  d.add(mesh(GEO.box,"#ffffff",POOL_W*2+.8,.06,.25,0,.02,Lz(POOL_R1+.1)));
  for(let q=0;q<10;q++)d.add(mesh(GEO.sph,"#ffffff",rand(.2,.45),.05,rand(.15,.3),rand(-5.6,5.6),.03,Lz(POOL_R1-rand(.3,1.2))));
  /* килимок і вуличний душ */
  d.add(mesh(GEO.box,"#2fa86b",POOL_W*2-1,.03,1.2,0,.015,Lz(POOL_R1+1.4)));
  const sx=POOL_W+.6,sz=Lz(l1-2);d.add(mesh(GEO.cyl,"#c4cdda",.07,2.8,.07,sx,1.4,sz));d.add(mesh(GEO.box,"#c4cdda",.7,.07,.07,sx-.35,2.8,sz));
  d.add(mesh(GEO.cyl,"#9aa3b5",.18,.06,.18,sx-.7,2.75,sz));d.add(mesh(GEO.box,new THREE.MeshBasicMaterial({color:"#bfeaff",transparent:true,opacity:.45,depthWrite:false}),.22,2.6,.22,sx-.7,1.4,sz));
  d.add(mesh(GEO.cyl,"#8a8f9c",.35,.03,.35,sx-.7,.02,sz));
  /* хвіртка «ПЛЯЖ» з білим парканчиком */
  const gz=Lz(l1-.4);[-1,1].forEach(s=>{d.add(mesh(GEO.box,"#ffffff",.3,6.0,.3,s*4.9,3.0,gz));d.add(mesh(GEO.cone,"#ffffff",.25,.3,.25,s*4.9,6.15,gz));
    for(let x=5.4;x<POOL_W+10;x+=.45)d.add(mesh(GEO.box,"#ffffff",.12,1.0,.06,s*x,.5,gz));d.add(mesh(GEO.box,"#ffffff",POOL_W+5,.1,.08,s*(5.2+(POOL_W+5)/2),.75,gz))});
  d.add(mesh(GEO.box,"#ffffff",10.1,.25,.25,0,5.8,gz));
  const sg=new THREE.Mesh(GEO.box,faced(seaMat.beach,"#1c2445",4));sg.scale.set(2.6,1.0,.1);sg.position.set(0,6.55,gz+.05);d.add(sg)}
function poolChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),last=k===Z.n-1;
  const wEnd=last?POOL_R1+.2:l1,wl=wEnd-l0;
  /* вода, дно з доріжками, бортики */
  d.add(mesh(GEO.box,poolWaterMat,POOL_W*2,.02,wl,0,0,Lz(l0+wl/2)));
  const bEnd=last?POOL_RAMP0:l1;if(bEnd>l0){d.add(mesh(GEO.box,poolTileMat,POOL_W*2,.2,bEnd-l0,0,-2.5,Lz((l0+bEnd)/2)));
    LX.forEach(x=>d.add(mesh(GEO.box,"#1f5fa8",.3,.02,bEnd-l0-(k===0?4:0),x,-2.38,Lz((l0+bEnd)/2+(k===0?2:0)))))}
  [-1,1].forEach(s=>{
    /* v63: бортики й поплавці тягнуться до самого виходу з басейну */
    const wallEnd=last?POOL_R1:l1;if(wallEnd>l0){d.add(mesh(GEO.box,poolTileMat,.4,2.8,wallEnd-l0,s*(POOL_W+.2),-1.1,Lz((l0+wallEnd)/2)));
      d.add(mesh(GEO.box,"#ffffff",.6,.12,wallEnd-l0,s*(POOL_W+.3),.3,Lz((l0+wallEnd)/2)));
      /* поплавці вздовж бортика */
      const fe=last?POOL_RAMP0+6:wallEnd,fl=mesh(floatGeo,floatMat,.12,fe-l0,.12,s*(POOL_W-.35),.03,Lz((l0+fe)/2));fl.rotation.x=Math.PI/2;d.add(fl)}
    /* палуба з лежаками, парасолями й пальмами (v63: палуба до кінця зони, без піску) */
    d.add(mesh(GEO.box,deckMat,10,.3,l1-l0,s*(POOL_W+5.4),.1,Lz((l0+l1)/2)));
    for(let l=l0+4;l<Math.min(l1,220);l+=7.5){const c=pick(["#ff6a5c","#ffc531","#3d7bff","#22b066","#ff9fb5"]);lounger(d,s*(POOL_W+2.4),Lz(l),c);if((l|0)%3===0)umbrella(d,s*(POOL_W+3.6),Lz(l+1.6),c,.25)}
    for(let l=l0+2+rand(0,4);l<l1;l+=rand(9,14))palm(d,s*(POOL_W+rand(7.5,10)),Lz(l));
    if(k%3===1){const x=s*(POOL_W+1.3),z=Lz(l0+15);[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]].forEach(([a,b])=>d.add(mesh(GEO.cyl,"#f4f6fb",.05,2.2,.05,x+a,1.4,z+b)));
      d.add(mesh(GEO.box,"#e53935",1.1,.12,1.1,x,2.5,z));d.add(mesh(GEO.box,"#ffffff",.9,.6,.08,x,2.9,z+.5));d.add(mesh(GEO.box,"#ffc531",1.2,.08,1.2,x,3.5,z))}});
  /* готель і пагорби на тлі */
  if(k%2===0)[-1,1].forEach(s=>{const h=rand(12,22),b=new THREE.Mesh(GEO.box,pick(BLD));b.scale.set(9,h,14);b.position.set(s*24,h/2,z0-15);d.add(b);
    for(let q=0;q<4;q++)d.add(mesh(GEO.box,"#ffffff",.4,.15,12,s*19.3,2.5+q*3.2,z0-15))});
  if(last)poolExit(d,Lz,l1);
  freeze(d);g.add(d);
  if(k===0)fallCoins(g,i,Lz)}
/* дуга монет у повітрі: котик пролітає крізь неї, коли падає з тераси */
function fallCoins(g,ci,Lz){for(let q=1;q<=14;q++){const l=q*2.5,y=SEA_H+.3-.0125*l*l;if(y<.6)break;LX.forEach(x=>addCoin(g,ci,x,y+.8,Lz(l)))}}
/* ---------- надувні перешкоди ---------- */
/* v63: під УСІМА перешкодами басейну можна пропливти (свайп униз — пірнути): нижня межа кожної на .13 — вище за пірнання (.12),
   але нижче за котика, що пливе (-.6…1.05). Круг і м'яч, як і раніше, можна й перестрибнути */
Object.assign(OD,{ring:{half:.6,ymin:.13,ymax:.4},pball:{half:.5,ymin:.13,ymax:.5},duck:{half:.8,ymin:.13,ymax:1.9},flamingo:{half:.7,ymin:.15,ymax:2.0},parch:{half:.35,ymin:.15,ymax:2.7}});
Object.assign(OB,{
  ring(){const g=new THREE.Group(),r=new THREE.Mesh(TG(.55,.2,10,24),M(pick(["#ff5a5f","#ff9f43","#3d7bff","#22b066"])));r.rotation.x=Math.PI/2;g.add(r);
    for(let k=0;k<4;k++){const a=new THREE.Mesh(TG(.55,.205,10,6,Math.PI/5),M("#ffffff"));a.rotation.x=Math.PI/2;a.rotation.z=k*Math.PI/2;g.add(a)}
    g.position.y=.05;return g},
  pball(){const g=new THREE.Group();g.add(mesh(GEO.sph,"#ffffff",.5,.5,.5,0,.15,0));
    ["#e53935","#ffc531","#2f6fed"].forEach((c,k)=>{const b=mesh(GEO.sph,c,.505,.505,.18,0,.15,0);b.rotation.y=k*Math.PI/3;g.add(b)});g.add(mesh(GEO.sph,"#ffffff",.12,.12,.12,0,.64,0));return g},
  duck(){const g=new THREE.Group(),y="#ffd23f";g.add(mesh(GEO.sph,y,.85,.62,1.05,0,.2,0));g.add(mesh(GEO.sph,y,.55,.55,.55,0,1.1,-.55));
    g.add(mesh(GEO.cone,"#ff8a1f",.22,.45,.12,0,1.0,-1.1));g.children[2].rotation.x=-Math.PI/2;
    [-1,1].forEach(s=>{g.add(mesh(GEO.sph,"#15151c",.08,.1,.05,s*.24,1.25,-1.0));g.add(mesh(GEO.sph,"#ffffff",.03,.03,.02,s*.24+.02,1.28,-1.04))});
    const t=mesh(GEO.cone,y,.35,.5,.2,0,.55,.95);t.rotation.x=-.9;g.add(t);[-1,1].forEach(s=>g.add(mesh(GEO.sph,"#f5c22c",.2,.32,.6,s*.78,.3,.1)));return g},
  flamingo(){const g=new THREE.Group(),p="#ff8fb3";g.add(mesh(GEO.sph,p,.75,.45,1.0,0,.15,.1));
    for(let k=0;k<6;k++)g.add(mesh(GEO.sph,p,.16,.2,.16,0,.55+k*.22,-.55-Math.sin(k*.5)*.15));
    g.add(mesh(GEO.sph,p,.26,.24,.3,0,1.85,-.75));const bk=mesh(GEO.cone,"#1c1c24",.09,.3,.09,0,1.75,-1.08);bk.rotation.x=-2.2;g.add(bk);
    [-1,1].forEach(s=>{g.add(mesh(GEO.sph,"#15151c",.05,.06,.04,s*.14,1.92,-.92));g.add(mesh(GEO.sph,"#ff6f9c",.12,.3,.75,s*.62,.4,.2))});
    const tl=mesh(GEO.cone,p,.25,.45,.15,0,.5,1.05);tl.rotation.x=-1.0;g.add(tl);return g},
  parch(){const g=new THREE.Group(),c=pick(["#22b066","#3d7bff","#ff6a5c"]);
    [-1,1].forEach(s=>{g.add(mesh(GEO.cyl,c,.22,2.5,.22,s*1.0,1.0,0));g.add(mesh(GEO.cyl,"#ffffff",.225,.25,.225,s*1.0,1.5,0))});
    const top=new THREE.Mesh(TG(1.0,.24,10,20,Math.PI),M(c));top.position.y=2.2;g.add(top);
    const fl=mesh(GEO.box,"#ffc531",.9,.45,.05,0,2.3,-.05);g.add(fl);g.add(mesh(GEO.box,"#e53935",.7,.12,.06,0,2.32,-.07));return g}});
["ring","pball","duck","flamingo","parch"].forEach(x=>STATIC_OB.add(x));
function populatePool(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci)*1.15;
  const rows=[];let l=Math.max(l0+5,56);while(l<Math.min(l0+CH-2,214)){rows.push(Lz(l));l+=gap+rand(.5,3)}
  rows.forEach(z=>{
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.3)L[ri(3)]="tall";else if(q<.55){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.55?"low":"over";L[ri(3)]=null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;/* v63: під усім можна пропливти (пірнути) */
      const ty=c==="tall"?"duck":c==="over"?pick(["parch","flamingo"]):pick(["ring","ring","pball"]);
      const o=spawnObs(g,ty,lane,z,ci,0);o.m.rotation.y=ty==="ring"||ty==="pball"?rand(0,6):rand(-.4,.4);
      const ph=rand(0,6),y0=o.m.position.y;anims.push({chunk:ci,z,f:t=>{if(o.dead)return;o.m.position.y=y0+Math.sin(t*2.2+ph)*.06;o.m.rotation.z=Math.sin(t*1.6+ph)*.05}})})});
  coinsBetween(g,ci,rows,z0-CH-3,-.5,undefined,false)}
CHUNK_FN.pool=poolChunk;POP_FN.pool=populatePool;

/* ---------- логіка послідовності ---------- */
/* «підлога» під котиком: у басейні — поверхня плавання, наприкінці плавно піднімається на пісок */
function seqGround(z){const i=Math.floor(-z/CH);if(i<0)return 0;const Z=zoneAt(i);if(Z.kind!=="pool")return 0;const l=-z-Z.c0*CH;
  if(l<POOL_R0)return SWIM_Y;if(l>=POOL_R1)return 0;return lerp(SWIM_Y,0,(l-POOL_R0)/(POOL_R1-POOL_R0))}
function seqZone(z){const i=Math.max(0,Math.floor(-z/CH)),Z=zoneAt(i);return{Z,l:-z-Z.c0*CH}}
const SWIM_ZONES=new Set(["locker","ledge","pool","beach"]);
let splashes=[],seqHintT=0;
/* v57: на початку забігу прибрати сліди попереднього: бризки, слід на воді, сховану тінь, текст підказки */
function seqReset(){splashes=[];if(wake)wake.visible=false;if(shadow)shadow.visible=true;clearTimeout(seqHintT);const h=$("#hint");if(h)h.textContent=t("hint")}
const dropMat=new THREE.SpriteMaterial({map:poofTex,color:"#d8f6ff",transparent:true,depthWrite:false});
function splash(x,z,big){for(let q=0;q<(big?3:1);q++)puff({x:x+rand(-.6,.6),y:-.4,z:z+rand(-.6,.6)});
  for(let q=0;q<(big?18:8);q++){const sp=new THREE.Sprite(dropMat);sp.scale.setScalar(rand(.25,.5));sp.position.set(x,.1,z);world.add(sp);
    const a=rand(0,Math.PI*2),v=rand(1.5,4);splashes.push({sp,vx:Math.cos(a)*v,vz:Math.sin(a)*v-2,vy:rand(4,8),t:0})}}
function setSwim(on){st.swim=on;const keep=player.userData.laptop.visible,pp=player.position.clone(),pr=player.rotation.clone();
  gameScene.remove(player);disposeTree(player);player=noCull(buildCat(S.eq,on));player.position.copy(pp);player.rotation.copy(pr);player.userData.laptop.visible=keep;gameScene.add(player);
  puff(pp);puff({x:pp.x,y:pp.y+.7,z:pp.z-.6});st.shake=Math.max(st.shake,.12)}
function seqTick(dt){
  const{Z,l}=seqZone(st.z),s=-st.z;
  st.topK=Z.kind==="pool"&&l<POOL_R1?.82:1;
  /* слова боса на вході в нові місця */
  const key=Z.kind+Z.id;if(st.seqTold!==key){st.seqTold=key;if(Z.kind==="serp")bossSay(t("bossSerp"),2.2);else if(Z.kind==="beach")bossSay(t("bossBeach"),2.4)}
  /* обрив: котик зберігає висоту, а світ під ним опускається на H — далі звичайна гравітація, але легша */
  const E=ELEV.find(e=>s<e.sD+70);
  if(E&&!E.fallen&&!E.noFall&&s>=E.sD){E.fallen=true;const H=BENDOK?E.H:0;if(H>0){st.y+=H;st.cb+=H;st.vy=Math.max(0,st.vy);st.fall=1;st.slide=0;st.slideQ=false}}
  if(st.fall&&st.y<=st.gnd+.001&&st.vy<=0){st.fall=0;splash(st.x,st.z,true);st.shake=.3}
  st.fallK=st.fall?.25:1;
  /* v57: бос падає щоразу, коли перетинає обрив (і після «Тікати далі», якщо його поставило позаду обриву) */
  const bs=-st.bossZ,pb=st.bossPrevS===undefined?bs:st.bossPrevS;st.bossPrevS=bs;
  if(E&&!E.noFall&&pb<E.sD&&bs>=E.sD&&!(st.bossFallY>0)){const H=BENDOK?E.H:0;if(H>0){st.bossFallY=H;st.bossFallV=0;if(!E.bossFallen)bossSay(t("bossDive"),2.2);E.bossFallen=true}}
  /* підказка про пірнання — один раз за забіг, коли котик уже у воді */
  if(Z.kind==="pool"&&l>45&&l<POOL_R0&&!st.diveHint){st.diveHint=true;const h=$("#hint");h.textContent=t("seaDiveHint");h.style.opacity=1;
    clearTimeout(seqHintT);seqHintT=setTimeout(()=>{h.style.opacity=0;seqHintT=setTimeout(()=>{h.textContent=t("hint")},700)},3800)}
  /* перевдягання: кабінки в роздягальні → плавки; вхід у парк → знову костюм */
  if(Z.kind==="locker"&&l>=LOCK_SWAP&&!st.swim)setSwim(true);
  else if(st.swim&&!SWIM_ZONES.has(Z.kind)&&!(Z.kind==="park"&&l<1))setSwim(false);
  /* бризки */
  splashes=splashes.filter(p=>{p.t+=dt;p.vy-=18*dt;p.sp.position.x+=p.vx*dt;p.sp.position.y+=p.vy*dt;p.sp.position.z+=p.vz*dt;p.sp.material.opacity=1;
    if(p.t>1.1||p.sp.position.y<-.3){world.remove(p.sp);return false}return true})}
var wake=null;
function seqAnim(u,dt){
  const{Z,l}=seqZone(st.z),inPool=Z.kind==="pool"&&l<POOL_R0+4&&!st.fall,air=st.y>st.gnd+.02;
  if(!wake){wake=new THREE.Mesh(new THREE.RingGeometry(.55,.85,28),new THREE.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:.5,depthWrite:false}));wake.rotation.x=-Math.PI/2;gameScene.add(wake)}
  wake.visible=false;shadow.visible=!inPool;u.head.rotation.x=0;
  if(st.fall){const f=Math.sin(st.t*14);u.armL.rotation.x=-2.7+f*.4;u.armR.rotation.x=-2.7-f*.4;u.armR.rotation.z=.5;u.legL.rotation.x=Math.sin(st.t*12)*.8;u.legR.rotation.x=-Math.sin(st.t*12)*.8;
    player.rotation.x=-.15+Math.sin(st.t*3)*.1;return}
  if(!inPool)return;
  if(air){player.rotation.x=Math.max(-1.2,Math.min(.4,-.35-st.vy*.05));u.armL.rotation.x=u.armR.rotation.x=-2.9;u.legL.rotation.x=u.legR.rotation.x=.3;return}
  const dive=st.slide>0,ph=st.t*7.5;
  u.armL.rotation.x=-(ph%(Math.PI*2));u.armR.rotation.x=-((ph+Math.PI)%(Math.PI*2));u.armR.rotation.z=.2;
  u.legL.rotation.x=Math.sin(st.t*18)*.4;u.legR.rotation.x=-Math.sin(st.t*18)*.4;u.tail.rotation.x=1.5+Math.sin(st.t*6)*.15;u.tail.rotation.z=Math.sin(st.t*4)*.3;
  player.rotation.x=dive?-1.62:-1.38;u.head.rotation.x=dive?.4:1.05;
  player.position.y=(dive?-.95:-.18)+Math.sin(st.t*5)*.04;player.position.z=st.z+.85;
  wake.visible=!dive;wake.position.set(st.x,.03,st.z-.3);wake.scale.setScalar(1+Math.sin(st.t*9)*.12);wake.material.opacity=.35+Math.sin(st.t*9)*.12}
function seqBoss(dt,bu){
  if(st.bossFallY>0){st.bossFallV-=gravG()*.25*dt;st.bossFallY=Math.max(0,st.bossFallY+st.bossFallV*dt);
    bu.armL.rotation.x=-2.8+Math.sin(st.t*12)*.4;boss.position.y+=st.bossFallY;if(st.bossFallY<=0)splash(st.bossX,st.bossZ,true);return}
  const{Z,l}=seqZone(st.bossZ);
  if(Z.kind==="pool"&&l<POOL_R0+2&&l>8){boss.position.y-=.45;bu.armL.rotation.x=-2.3+Math.sin(st.t*8)*.8;boss.rotation.z=Math.sin(st.t*4)*.08}}
