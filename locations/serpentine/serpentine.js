/* Локація serpentine (v56) — серпантин угору одразу після мосту.
   Після кожного мосту йде морська послідовність: серпантин (540 м, три шпильки по 180° радіусом 40 м — v60, підйом на SEA_H м) →
   роздягальня (90 м, котик перевдягається в плавки) → тераса (60 м, дорога обривається) → падіння в басейн →
   басейн (240 м, пливе з перешкодами) → пляж (600 м) → аеропорт і далі (v63, locations/airport) → парк.
   Логіка гри лишається прямою: повороти й висоту малює шейдер вигину (TURNS і ELEV у world.js). */
const SERP_KEEP_T=.48,SERP_KEEP_S=.8,SERPN=18,LOCKN=6,LEDGEN=2,POOLN=8,BEACHN=20,SEA_H=18,SERP_R=40,SERP_T=[25,196,367];
function addSeaSeq(c0,sg){
  const S0=c0*CH,L=SERP_R*Math.PI,turns=SERP_T.map((l,k)=>({a:l,b:l+L,sg:k%2?-sg:sg}));
  ZS.push({kind:"serp",c0,n:SERPN,id:ZS.length,turns});
  turns.forEach(T=>TURNS.push({s0:S0+T.a,R:SERP_R,sg:T.sg,L}));
  let c=c0+SERPN;
  ZS.push({kind:"locker",c0:c,n:LOCKN,id:ZS.length});c+=LOCKN;
  ZS.push({kind:"ledge",c0:c,n:LEDGEN,id:ZS.length});c+=LEDGEN;
  const sD=c*CH;
  ZS.push({kind:"pool",c0:c,n:POOLN,id:ZS.length});c+=POOLN;
  ZS.push({kind:"beach",c0:c,n:BEACHN,id:ZS.length});c+=BEACHN;
  ELEV.push({sA:S0,sB:S0+SERPN*CH,H:SEA_H,sD,fallen:false,bossFallen:false});
  /* v63: після пляжу — аеропорт, літак, туалет, труба, кран, стіл і ноутбук (locations/airport), потім парк */
  if(typeof addTripSeq==="function")c=addTripSeq(c);
  ZS.push({kind:"park",c0:c,n:PARKN,id:ZS.length,beach:true})}

/* ---------- середовище: небо, туман, ніч ---------- */
Object.assign(ENV,{
  serp:{bg:new THREE.Color("#86cdf5"),fog:new THREE.Color("#cfe9f7"),near:55,far:175},
  locker:{bg:new THREE.Color("#dff3f6"),fog:new THREE.Color("#dff3f6"),near:30,far:100},
  ledge:{bg:new THREE.Color("#7fd0fa"),fog:new THREE.Color("#cbedfb"),near:70,far:200},
  pool:{bg:new THREE.Color("#7fd0fa"),fog:new THREE.Color("#cbedfb"),near:55,far:175},
  beach:{bg:new THREE.Color("#7fd0fa"),fog:new THREE.Color("#e6f5fb"),near:55,far:175}});
Object.assign(ENVN,{
  serp:{bg:new THREE.Color("#0b1230"),fog:new THREE.Color("#18214a")},
  locker:{bg:new THREE.Color("#1d3346"),fog:new THREE.Color("#1d3346")},
  ledge:{bg:new THREE.Color("#0b1534"),fog:new THREE.Color("#16264e")},
  pool:{bg:new THREE.Color("#0b1534"),fog:new THREE.Color("#16264e")},
  beach:{bg:new THREE.Color("#0b1534"),fog:new THREE.Color("#1a2a52")}});
["serp","ledge","pool","beach"].forEach(z=>OUTDOOR.add(z));

/* ---------- таблички (перемальовуються при зміні мови) ---------- */
const seaCv={locker:cnv(256,96),pool:cnv(256,96),danger:cnv(256,128),beach:cnv(256,96),park:cnv(256,96)};
const seaTex={};for(const k in seaCv)seaTex[k]=new THREE.CanvasTexture(seaCv[k][0]);
const seaMat={};for(const k in seaTex)seaMat[k]=new THREE.MeshBasicMaterial({map:seaTex[k]});
function seaPlate(k,bg,frame,fg,txt,icon){const[c,x]=seaCv[k],w=c.width,h=c.height;x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=frame;x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);
  let tx=w/2,max=w-40;if(icon){icon(x,w,h);tx=w/2+28;max=w-96}
  x.fillStyle=fg;fitText(x,txt,max,42,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(txt,tx,h/2+2);seaTex[k].needsUpdate=true}
function drawSeaSigns(){
  seaPlate("locker","#2e8fd6","#ffffff","#ffffff",t("seaLocker"),(x,w,h)=>{x.fillStyle="#fff";x.beginPath();x.arc(40,30,8,0,7);x.fill();x.beginPath();x.moveTo(28,44);x.lineTo(52,44);x.lineTo(56,70);x.lineTo(24,70);x.fill();x.fillRect(30,70,6,14);x.fillRect(44,70,6,14)});
  seaPlate("pool","#14b3c9","#ffffff","#ffffff",t("seaPool"),(x,w,h)=>{x.strokeStyle="#fff";x.lineWidth=5;for(let r=0;r<3;r++){x.beginPath();for(let q=0;q<=40;q+=4)x.lineTo(20+q,30+r*16+Math.sin(q*.3)*4);x.stroke()}});
  const[dc,dx]=seaCv.danger;dx.fillStyle="#ffc531";dx.fillRect(0,0,256,128);dx.fillStyle="#1c2445";for(let i=-40;i<256;i+=32){dx.beginPath();dx.moveTo(i,0);dx.lineTo(i+16,0);dx.lineTo(i+6,14);dx.lineTo(i-10,14);dx.fill();dx.beginPath();dx.moveTo(i,114);dx.lineTo(i+16,114);dx.lineTo(i+6,128);dx.lineTo(i-10,128);dx.fill()}
  dx.fillStyle="#d4231a";fitText(dx,t("seaDanger"),228,40,FONT);dx.textAlign="center";dx.textBaseline="middle";dx.fillText(t("seaDanger"),128,64);seaTex.danger.needsUpdate=true;
  seaPlate("beach","#ff9f43","#fff4d6","#ffffff",t("seaBeach"),(x,w,h)=>{x.fillStyle="#ffe066";x.beginPath();x.arc(40,40,15,0,7);x.fill();x.strokeStyle="#ffe066";x.lineWidth=4;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;x.beginPath();x.moveTo(40+Math.cos(a)*20,40+Math.sin(a)*20);x.lineTo(40+Math.cos(a)*27,40+Math.sin(a)*27);x.stroke()}
    x.strokeStyle="#fff";x.lineWidth=4;x.beginPath();for(let q=0;q<=44;q+=4)x.lineTo(18+q,74+Math.sin(q*.35)*4);x.stroke()});
  seaPlate("park","#2f9e55","#e9ffe0","#ffffff",t("seaPark"),(x,w,h)=>{x.fillStyle="#8a5a34";x.fillRect(37,52,7,28);x.fillStyle="#bff0a8";x.beginPath();x.arc(40,40,20,0,7);x.fill()})}
{const ds0=drawSigns;drawSigns=function(){ds0();drawSeaSigns()}}
drawSeaSigns();
/* v57: перемалювати таблички, коли довантажиться шрифт (раніше лишався запасний шрифт до зміни мови) */
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawSeaSigns);
/* шеврони на шпильках і жовтий знак «серпантин» — без тексту */
const chevTex=[1,-1].map(dir=>texOf((x,w,h)=>{x.fillStyle="#e53935";x.fillRect(0,0,w,h);x.fillStyle="#ffffff";
  for(let k=0;k<2;k++){const cx=44+k*44;x.beginPath();if(dir>0){x.moveTo(cx-14,12);x.lineTo(cx+2,12);x.lineTo(cx+22,48);x.lineTo(cx+2,84);x.lineTo(cx-14,84);x.lineTo(cx+6,48)}else{x.moveTo(cx+14,12);x.lineTo(cx-2,12);x.lineTo(cx-22,48);x.lineTo(cx-2,84);x.lineTo(cx+14,84);x.lineTo(cx-6,48)}x.fill()}},128,96));
const chevMat=chevTex.map(tx=>new THREE.MeshBasicMaterial({map:tx}));
const serpSignTex=texOf((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#ffc531";x.strokeStyle="#1c2445";x.lineWidth=8;x.beginPath();x.moveTo(64,6);x.lineTo(122,64);x.lineTo(64,122);x.lineTo(6,64);x.closePath();x.fill();x.stroke();
  x.strokeStyle="#1c2445";x.lineWidth=9;x.lineCap="round";x.beginPath();x.moveTo(52,100);x.lineTo(52,82);x.quadraticCurveTo(52,70,64,70);x.quadraticCurveTo(78,70,78,58);x.quadraticCurveTo(78,46,64,46);x.quadraticCurveTo(52,46,52,36);x.lineTo(52,26);x.stroke()},128,128);
const serpSignMat=new THREE.MeshBasicMaterial({map:serpSignTex,transparent:true});
const rockTex=repT(texOf((x,w,h)=>{x.fillStyle="#9b8f80";x.fillRect(0,0,w,h);for(let i=0;i<90;i++){x.fillStyle=pick(["rgba(70,60,52,.35)","rgba(190,180,165,.35)","rgba(120,108,96,.5)"]);const r=rand(3,10);x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,r*1.6,r,rand(0,3),0,7);x.fill()}
  x.strokeStyle="rgba(60,50,44,.45)";x.lineWidth=2;for(let i=0;i<10;i++){x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let q=0;q<4;q++){px+=rand(-14,14);py+=rand(4,14);x.lineTo(px,py)}x.stroke()}},128,128),3,4);
const rockMat=new THREE.MeshToonMaterial({map:rockTex,gradientMap:grad});
const asphTex=repT(texOf((x,w,h)=>{x.fillStyle="#4a5163";x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=Math.random()<.5?"rgba(255,255,255,.06)":"rgba(0,0,0,.1)";x.fillRect(Math.random()*w,Math.random()*h,2,2)}},64,64),3,12);
const asphMat=new THREE.MeshToonMaterial({map:asphTex,gradientMap:grad});

/* ---------- серпантин ---------- */
/* сторона «в гору» — внутрішня сторона найближчої шпильки попереду (там скеля), інша сторона — огорожа і схил униз */
function serpUp(Z,l){for(const T of Z.turns)if(l<T.b)return -T.sg;return -Z.turns[Z.turns.length-1].sg}
function serpTurn(Z,l){return Z.turns.find(T=>l>=T.a-4&&l<=T.b+2)||null}
function pine(d,x,y,z,k){k=k||1;d.add(mesh(GEO.cyl,"#7a5134",.14*k,1.2*k,.14*k,x,y+.6*k,z));
  [[1.0,1.4,1.2],[.78,1.2,2.0],[.52,1.0,2.7]].forEach(([r,h,yy])=>d.add(mesh(GEO.cone,pick(["#2f7d4a","#3a8f55","#2b6e42"]),r*k,h*k,r*k,x,y+yy*k,z)))}
/* v62: охайний стик з мостом: деформаційний шов поперек дороги, тротуар моста закінчується пандусом,
   береговий укіс від води до дороги під обома схилами (раніше схили обривалися рівною лінією над водою) */
const SERP_RAMP=18;
function serpJunction(d,Lz){
  d.add(mesh(GEO.box,"#8b939f",8.8,.03,.5,0,.012,Lz(.3)));for(let x=-4.2;x<=4.2;x+=.3)d.add(mesh(GEO.box,"#5b6270",.08,.035,.5,x,.014,Lz(.3)));
  d.add(mesh(GEO.box,tileMat,3.15,.2,7,2.725,-.1,Lz(4)));d.add(mesh(GEO.box,"#e9edf3",.2,.12,6,1.15,.04,Lz(3.5)));d.add(mesh(GEO.box,"#aab3c4",.22,.02,6,1.15,.105,Lz(3.5)));
  const rp=mesh(GEO.box,tileMat,3.15,.2,1.4,2.725,-.16,Lz(7.9));rp.rotation.x=.08;d.add(rp);
  [-1,1].forEach(s=>{const bank=mesh(boxZ,rockMat,26,.8,16,s*(5.2+13),-.35-4.6,Lz(-6.6));bank.rotation.x=.6;d.add(bank);
    const top=mesh(boxZ,"#6fae55",26,.3,3,s*(5.2+13),-.3,Lz(-.9));d.add(top)});
  for(let q=0;q<9;q++){const r=rand(.6,1.5);d.add(mesh(GEO.sph,"#8d8173",r*1.4,r,r,(Math.random()<.5?-1:1)*rand(6,22),-rand(2,7),Lz(-rand(3,11))))}}
function serpChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  /* ділянки між кінцями шпильок: на кожній своя сторона скелі */
  const cuts=[l0];Z.turns.forEach(T=>{if(T.b>l0&&T.b<l1)cuts.push(T.b)});cuts.push(l1);
  for(let q=0;q+1<cuts.length;q++){const a=cuts[q],b=cuts[q+1],len=b-a,zm=Lz((a+b)/2),u=serpUp(Z,(a+b)/2),dn=-u;
    d.add(mesh(boxZ,asphMat,8.8,.2,len,0,-.1,zm));
    [-4.05,4.05].forEach(x=>d.add(mesh(boxZ,"#f4f6fb",.14,.02,len,x,.012,zm)));
    d.add(mesh(boxZ,"#c7b08a",.9,.18,len,dn*4.85,-.08,zm));
    /* скеля і пагорб у гору */
    /* v62: на перших SERP_RAMP м після мосту скеля виростає поступово, а не починається кубом */
    if(a<SERP_RAMP){for(let q=a;q<Math.min(b,SERP_RAMP);q+=1.5){const q2=Math.min(q+1.5,b,SERP_RAMP),hh=.3+2.9*Math.pow((q2)/SERP_RAMP,1.4),w=1.2+1.4*q2/SERP_RAMP;
        d.add(mesh(boxZ,rockMat,w,hh,q2-q,u*(4.4+w/2),hh/2-.1,Lz((q+q2)/2)));d.add(mesh(boxZ,"#6fae55",w+.2,.28,q2-q,u*(4.4+w/2),hh-.1,Lz((q+q2)/2)))}}
    const wa=Math.max(a,SERP_RAMP);
    if(wa<b){const wl=b-wa,wz=Lz((wa+b)/2);d.add(mesh(boxZ,rockMat,2.6,3.2,wl,u*5.7,1.5,wz));
      d.add(mesh(boxZ,"#6fae55",2.8,.28,wl,u*5.7,3.15,wz));
      const hill=mesh(boxZ,"#7cbf5e",12,.5,wl,u*(7+6*Math.cos(.3)),3.1+6*Math.sin(.3),wz);hill.rotation.z=u*.3;d.add(hill)}
    /* огорожа і схил униз */
    d.add(mesh(boxZ,"#d9dde3",.08,.26,len,dn*5.15,.62,zm));d.add(mesh(boxZ,"#e53935",.085,.06,len,dn*5.15,.62,zm));
    for(let l=Math.ceil(a/3)*3;l<b;l+=3)d.add(mesh(GEO.box,"#8b939f",.12,.75,.12,dn*5.15,.36,Lz(l)));
    const sl=mesh(boxZ,"#79b85a",16,.4,len,dn*(5.4+8*Math.cos(.5)),-.25-8*Math.sin(.5),zm);sl.rotation.z=u*.5;d.add(sl);
    /* нижче схил стає крутою скелею: збоку серпантин виглядає горою, а не стрічкою в повітрі */
    const ex=5.4+16*Math.cos(.5),ey=-.25-16*Math.sin(.5),sl2=mesh(boxZ,rockMat,26,.6,len,dn*(ex+13*Math.cos(1.0)),ey-13*Math.sin(1.0),zm);sl2.rotation.z=u*1.0;d.add(sl2);
    for(let l=a+rand(2,6);l<b;l+=rand(5,9)){const q2=rand(3,13);pine(d,dn*(5.6+q2*Math.cos(.5)),-q2*Math.sin(.5)-.1,Lz(l),rand(.9,1.4))}
    for(let l=a+rand(3,8);l<b;l+=rand(7,12)){const q2=rand(1.5,6.5);pine(d,u*(7.2+q2*Math.cos(.3)),3.3+q2*Math.sin(.3),Lz(l),rand(.8,1.2))}
    /* v57: ліхтарі на боці огорожі, щоб уночі серпантин не був темним */
    for(let l=Math.ceil((a-15)/30)*30+15;l<b;l+=30)if(l>=a)streetLamp(d,g,dn,Lz(l));
    for(let l=a+rand(4,10);l<b;l+=rand(9,15)){const r=rand(.5,1.1);d.add(mesh(GEO.sph,"#a39888",r*1.3,r,r*1.1,u*rand(4.6,4.9),.2,Lz(l)))}
    /* шеврони на зовнішньому боці шпильки, стрілка — куди повертає дорога */
    const T=serpTurn(Z,(a+b)/2);if(T)for(let l=Math.ceil(Math.max(a,T.a-4)/6)*6;l<Math.min(b,T.b+2);l+=6){const bd=new THREE.Mesh(GEO.box,faced(chevMat[T.sg<0?0:1],"#1c2445",4));bd.scale.set(1.1,.82,.06);bd.position.set(dn*5.65,1.25,Lz(l));d.add(bd);d.add(mesh(GEO.box,"#8b939f",.08,.85,.08,dn*5.65,.42,Lz(l)))}}
  if(k===0)serpJunction(d,Lz);
  if(k===0){const z=Lz(8),x=4.9;const sg=new THREE.Mesh(planeGeo,serpSignMat);sg.scale.set(1.3,1.3,1);sg.position.set(x,2.3,z);d.add(sg);d.add(mesh(GEO.box,"#8b939f",.08,1.7,.08,x,.85,z-.02))}
  freeze(d);g.add(d)}
/* ---------- перешкоди серпантину ---------- */
Object.assign(OD,{rock:{half:.5,ymin:0,ymax:.85,top:.9},goat:{half:.55,ymin:0,ymax:1.55},
  /* v62: низький дорожній шлагбаум — можна і перестрибнути, і проскочити підкатом */
  sgate:{half:.25,ymin:1.0,ymax:1.26}});
Object.assign(OB,{
  sgate(){const g=new THREE.Group();g.add(mesh(GEO.box,"#e9eef2",.22,1.25,.22,-1.05,.62,0));g.add(mesh(GEO.box,"#e53935",.26,.12,.26,-1.05,1.3,0));
    const bm=new THREE.Mesh(GEO.box,stripeMat);bm.scale.set(2.1,.16,.1);bm.position.set(0,1.18,0);g.add(bm);g.add(mesh(GEO.sph,MB("#ff4b3e"),.07,.07,.07,1.02,1.18,0));
    g.add(mesh(GEO.box,"#e9eef2",.1,1.1,.1,1.0,.55,0));return g},
  rock(){const g=new THREE.Group();g.add(mesh(GEO.sph,"#9a948a",.62,.48,.55,0,.38,0));g.add(mesh(GEO.sph,"#b3ab9f",.42,.36,.42,.32,.42,-.1));g.add(mesh(GEO.sph,"#857e74",.34,.3,.36,-.38,.3,.12));
    g.add(mesh(GEO.sph,"#5f9c4a",.2,.08,.18,-.1,.82,.05));g.rotation.y=rand(0,6);return g},
  goat(){const g=new THREE.Group(),w="#f4f1ea",dk="#3a3530";
    g.add(mesh(GEO.sph,w,.32,.34,.62,0,.98,0));
    const legs=[];[[-.17,-.38],[.17,-.38],[-.17,.38],[.17,.38]].forEach(([x,z])=>{const p=new THREE.Group();p.position.set(x,.78,z);p.add(mesh(GEO.cyl,w,.06,.7,.06,0,-.35,0));p.add(mesh(GEO.cyl,dk,.065,.1,.065,0,-.72,0));g.add(p);legs.push(p)});
    const head=new THREE.Group();head.position.set(0,1.28,-.58);g.add(head);head.add(mesh(GEO.sph,w,.17,.2,.24,0,0,-.08));head.add(mesh(GEO.sph,"#ffb3b3",.08,.06,.05,0,-.06,-.3));
    [-1,1].forEach(s=>{const h=mesh(GEO.cone,"#a08d6e",.05,.3,.05,s*.08,.24,.04);h.rotation.x=.6;head.add(h);const e=mesh(GEO.sph,w,.1,.04,.05,s*.18,.06,0);e.rotation.z=s*.4;head.add(e);head.add(mesh(GEO.sph,"#15151c",.03,.035,.02,s*.09,.06,-.27))});
    head.add(mesh(GEO.cone,w,.05,.16,.05,0,-.2,-.2));
    const tail=mesh(GEO.sph,w,.06,.12,.06,0,1.12,.6);g.add(tail);
    g.userData={legs,head,tail};return mergeRig(g,[head].concat(legs))}});
STATIC_OB.add("rock");STATIC_OB.add("sgate");KN_FALL.add("goat");
function populateSerp(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,12);while(l<Math.min(l0+CH-2,SERPN*CH-8)){
    /* v59: лишається частка рядів від звичайної кількості: на шпильках 48% (v58: 60%, ще −20%), на прямих 80% (−20%).
       Окремий лічильник для шпильок і прямих, тож частка рівна, а не випадкова */
    const inT=Z.turns.some(T=>l>=T.a&&l<=T.b),key=inT?"tk":"sk",a=Z[key]||0;Z[key]=a+(inT?SERP_KEEP_T:SERP_KEEP_S);if(Math.floor(Z[key])>Math.floor(a))rows.push(Lz(l));
    l+=gap+rand(.5,3)}
  let skip=false;
  rows.forEach(z=>{if(skip){skip=false;return}
    if(Math.random()<.08){const lane=ri(3);clearArea(z+32,z-3);const o=spawnObs(g,"cyclist",lane,z,ci,0);o.ride={v:4.5,go:false};skip=true;ROWP=null;return}
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.32)L[ri(3)]="tall";else if(q<.58){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=Math.random()<.5?"low2":null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;const ty=c==="tall"?pick(["goat","goat","tourist"]):c==="over"?"sgate":c==="low2"?"puddle":pick(["rock","rock","cones"]);
      const o=spawnObs(g,ty,lane,z,ci,0);
      if(ty==="tourist")o.m.rotation.y=Math.PI;
      if(ty==="goat"){o.m.rotation.y=pick([Math.PI/2,-Math.PI/2,0]);const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{if(o.dead)return;u.head.rotation.x=.35+Math.sin(t*2+ph)*.35;u.tail.rotation.x=Math.sin(t*9+ph)*.4}})}})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.serp=serpChunk;POP_FN.serp=populateSerp;
