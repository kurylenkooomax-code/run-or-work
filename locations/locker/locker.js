/* Локація locker (v56) — роздягальня нагорі серпантину (90 м) і тераса з обривом (ledge, 60 м).
   У роздягальні на 45 м — кабінки з шторками: котик пробігає крізь них і виходить у плавках (seqTick у pool.js).
   Тераса закінчується обірваною дорогою: далі падіння в басейн, що внизу на SEA_H м. */
const LOCK_SWAP=46;
const lockTileTex=repT(texOf((x,w,h)=>{x.fillStyle="#d3edf3";x.fillRect(0,0,w,h);x.fillStyle="#9fd6e3";for(let r=0;r<4;r++)for(let q=0;q<4;q++)if((r+q)%2)x.fillRect(q*16,r*16,16,16);
  x.strokeStyle="#9fd3df";x.lineWidth=1.5;for(let i=0;i<=64;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.moveTo(0,i);x.lineTo(64,i);x.stroke()}},64,64),4,18);
const lockTileMat=new THREE.MeshToonMaterial({map:lockTileTex,gradientMap:grad});
const deckTex=repT(texOf((x,w,h)=>{x.fillStyle="#dcc9a8";x.fillRect(0,0,w,h);x.strokeStyle="#b9a27c";x.lineWidth=2;for(let i=0;i<=64;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.moveTo(0,i);x.lineTo(64,i);x.stroke()}},64,64),5,16);
const deckMat=new THREE.MeshToonMaterial({map:deckTex,gradientMap:grad});
const LOCK_C=["#3d7bff","#ff6a5c","#ffc531","#22b066","#8a63ff"];

function lockerWallRow(d,s,a,b,Lz){let c=ri(LOCK_C.length);
  for(let l=a+.5;l+.9<=b;l+=.92){const z=Lz(l+.45),col=LOCK_C[c%LOCK_C.length];if(ri(4)===0)c++;
    d.add(mesh(GEO.box,col,.55,2.1,.88,s*6.4,1.05,z));
    d.add(mesh(GEO.box,shade(col,-.3),.01,1.9,.02,s*6.12,1.05,z));
    d.add(mesh(GEO.box,"#e9eef7",.03,.18,.05,s*6.11,1.05,z+.28));
    for(let v=0;v<3;v++)d.add(mesh(GEO.box,shade(col,-.35),.01,.03,.4,s*6.12,1.8-v*.07,z))}
  d.add(mesh(GEO.box,"#dfe7ee",.6,.08,b-a,s*6.4,2.14,Lz((a+b)/2)))}
const showerMat=new THREE.MeshBasicMaterial({color:"#bfeaff",transparent:true,opacity:.45,depthWrite:false});
/* v61: душова посередині довшої роздягальні — щоб 180 м не були однаковими */
function showerRow(d,g,s,a,b,Lz,ci){d.add(mesh(GEO.box,lockTileMat,.2,3.2,b-a,s*6.62,1.6,Lz((a+b)/2)));
  for(let l=a+2;l<b-1;l+=3.4){const z=Lz(l);d.add(mesh(GEO.box,"#e9eef7",.6,2.4,.06,s*6.3,1.2,z+1.6));
    d.add(mesh(GEO.cyl,"#c4cdda",.035,1.0,.035,s*6.45,2.4,z));d.add(mesh(GEO.cyl,"#c4cdda",.035,.55,.035,s*6.2,2.9,z));d.children[d.children.length-1].rotation.z=Math.PI/2;
    d.add(mesh(GEO.cyl,"#9aa3b5",.16,.06,.16,s*5.95,2.85,z));d.add(mesh(GEO.cyl,"#8a8f9c",.12,.02,.12,s*5.95,.012,z));
    d.add(mesh(GEO.box,showerMat,.25,2.8,.25,s*5.95,1.42,z))}}
function lockerBench(d,s,z){d.add(mesh(GEO.box,"#c48a52",.55,.08,3,s*5.35,.48,z));[-1.2,1.2].forEach(q=>d.add(mesh(GEO.box,"#8a8f9c",.42,.44,.08,s*5.35,.22,z+q)))}
function lockerGate(d,z,face,thick){/* стіна з великим проходом: побачиш із серпантину або зсередини */
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#f3f8fa",10.7,9,thick,s*9.65,4.3,z)));
  d.add(mesh(GEO.box,"#f3f8fa",8.6,4.2,thick,0,6.7,z));d.add(mesh(GEO.box,"#2e8fd6",30,.5,thick+.05,0,8.6,z));d.add(mesh(GEO.box,"#2e8fd6",30,.3,thick+.05,0,.9,z));
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#2e8fd6",.4,4.6,thick+.1,s*4.3,2.3,z)));
  const sg=new THREE.Mesh(GEO.box,faced(face,"#1c2445",4));sg.scale.set(3.2,1.2,.12);sg.position.set(0,5.4,z+thick/2+.04);d.add(sg)}
function lockerChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  d.add(mesh(GEO.box,lockTileMat,13.4,.2,CH,0,-.1,zc));
  /* гора під роздягальнею: будівля стоїть на вершині серпантину */
  d.add(mesh(GEO.box,rockMat,40,30,CH,0,-15.25,zc));d.add(mesh(GEO.box,"#7cbf5e",40,.3,CH,0,-.35,zc));
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#f3f8fa",.3,5.6,CH,s*7.15,2.8,zc));d.add(mesh(GEO.box,"#2e8fd6",.32,.3,CH,s*7.15,.9,zc))});
  d.add(mesh(GEO.box,"#dfe7ee",14.6,.4,CH,0,5.5,zc));
  [-1.1,1.1].forEach(x=>d.add(mesh(GEO.box,"#7cc8dc",.06,.02,CH,x,.012,zc)));
  d.add(mesh(GEO.box,"#f4fbfc",13.4,.2,CH,0,5.2,zc));
  for(let q=0;q<3;q++)LX.forEach(x=>d.add(mesh(GEO.box,lightMat,1.1,.04,3.2,x,5.08,z0-5-q*10)));
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#eaf6f8",.4,5.2,CH,s*6.9,2.6,zc));d.add(mesh(GEO.box,"#7cc8dc",.42,.25,CH,s*6.88,2.6,zc));
    const a=Math.max(l0,1),b=Math.min(l1,Z.n*CH-1);
    if(k===1){lockerWallRow(d,s,a,40,Lz);lockerWallRow(d,s,52,b,Lz);
      /* зеркала біля кабінок */
      [42,48].forEach(l=>{d.add(mesh(GEO.box,"#bfe9ff",.04,1.6,1.4,s*6.66,1.6,Lz(l)));d.add(mesh(GEO.box,"#ffffff",.05,1.7,1.5,s*6.68,1.6,Lz(l)))})}
    else if(k===3)showerRow(d,g,s,a,b,Lz,i);
    else lockerWallRow(d,s,a,b,Lz);
    for(let l=l0+6;l<l1;l+=10)if(l<38||l>54)lockerBench(d,s,Lz(l));
    /* рушники на гачках над шафками */
    for(let l=l0+3;l<l1-2;l+=7.5)d.add(mesh(GEO.box,pick(["#ff9fb5","#7fd3ff","#ffe066","#b6f0a0"]),.06,.7,.5,s*6.08,2.7,Lz(l)))});
  if(k===0)lockerGate(d,Lz(0)+.3,seaMat.locker,.6);
  if(k===Z.n-1)lockerGate(d,Lz(Z.n*CH)+.2,seaMat.pool,.4);
  freeze(d);g.add(d);
  if(k===1)changeBooth(g,i,Lz(LOCK_SWAP-1))}
/* кабінки зі шторками на всю ширину: котик пробігає крізь шторку, вона розлітається */
function changeBooth(g,ci,z){const d=new THREE.Group();
  [-3.45,-1.1,1.1,3.45].forEach(x=>d.add(mesh(GEO.box,"#dfe7ee",.14,3,.14,x,1.5,z)));
  d.add(mesh(GEO.box,"#2e8fd6",7.2,.18,.18,0,3.0,z));
  /* v62: табличка не над доріжками, а збоку на стовпчиках — камера більше не пролітає крізь неї */
  [-1,1].forEach(s=>{const sg=new THREE.Mesh(GEO.box,faced(seaMat.locker,"#1c2445",4));sg.scale.set(2.0,.75,.08);sg.position.set(s*5.0,3.3,z);d.add(sg);
    d.add(mesh(GEO.box,"#dfe7ee",.12,3.7,.12,s*5.0,1.0,z-.05))});
  freeze(d);g.add(d);
  const strips=[];LX.forEach((x,lane)=>{const c=["#ff6a5c","#ffc531","#3d7bff"][lane];
    for(let q=0;q<4;q++){const p=new THREE.Group();p.position.set(x-.84+q*.56,2.9,z);p.add(mesh(GEO.box,q%2?c:shade(c,.35),.54,2.25,.05,0,-1.12,0));
      p.add(mesh(GEO.sph,"#ffffff",.05,.05,.05,0,0,0));g.add(p);strips.push({p,x:p.position.x,sw:0})}});
  anims.push({chunk:ci,z,f:(t,dt)=>{const near=st&&Math.abs(st.z-z)<1.3;strips.forEach(S=>{if(near&&Math.abs(S.x-st.x)<1.1)S.sw=1;S.sw=Math.max(0,S.sw-dt*1.1);
    S.p.rotation.x=-S.sw*1.25*Math.abs(Math.sin(t*5+S.x))-Math.sin(t*1.3+S.x*3)*.03})}})}
/* ---------- перешкоди роздягальні ---------- */
Object.assign(OD,{lbench:{half:.3,ymin:0,ymax:.55,top:.56},towels:{half:.36,ymin:0,ymax:.72,top:.74},laundry:{half:.5,ymin:0,ymax:1.2,top:1.22},
  bather:{half:.4,ymin:0,ymax:2.1},towelLine:{half:.2,ymin:1.15,ymax:2.6}});
Object.assign(OB,{
  lbench(){const g=new THREE.Group();g.add(mesh(GEO.box,"#c48a52",1.9,.09,.5,0,.5,0));g.add(mesh(GEO.box,"#a8723f",1.9,.05,.08,0,.44,-.2));
    [-.75,.75].forEach(x=>g.add(mesh(GEO.box,"#8a8f9c",.08,.46,.42,x,.23,0)));g.add(mesh(GEO.box,pick(["#ff9fb5","#7fd3ff","#ffe066"]),.6,.06,.45,rand(-.5,.5),.57,0));return g},
  towels(){const g=new THREE.Group();for(let k=0;k<5;k++){const c=pick(["#ff9fb5","#7fd3ff","#ffe066","#ffffff","#b6f0a0"]);const b=mesh(GEO.box,c,.82,.13,.55,rand(-.04,.04),.07+k*.14,0);b.rotation.y=rand(-.2,.2);g.add(b);g.add(mesh(GEO.cyl,c,.07,.82,.07,0,.07+k*.14,-.27))}
    g.children.filter(c=>c.geometry===GEO.cyl).forEach(c=>c.rotation.z=Math.PI/2);g.add(mesh(GEO.sph,"#ffd84a",.1,.08,.1,.15,.78,0));return g},
  laundry(){const g=new THREE.Group();g.add(mesh(GEO.box,"#c4cdda",1.1,.08,.75,0,.32,0));
    [[0,.75,.36],[0,.75,-.36]].forEach(([x,y,z])=>g.add(mesh(GEO.box,"#9aa3b5",1.1,.9,.04,x,y,z)));[-1,1].forEach(s=>g.add(mesh(GEO.box,"#9aa3b5",.04,.9,.75,s*.55,.75,0)));
    for(let k=0;k<6;k++)g.add(mesh(GEO.sph,pick(["#ff9fb5","#7fd3ff","#ffffff","#ffe066"]),.3,.2,.25,rand(-.3,.3),1.12+rand(0,.08),rand(-.2,.2)));
    [-1,1].forEach(a=>[-1,1].forEach(b=>g.add(mesh(GEO.cyl,"#1d1d24",.07,.08,.07,a*.45,.07,b*.3))));return g},
  bather(){const g=new THREE.Group(),skin=pick(SKINS),tw=pick(["#ff9fb5","#7fd3ff","#ffe066","#b6f0a0"]);
    [-1,1].forEach(s=>g.add(mesh(GEO.cyl,skin,.11,.8,.11,s*.15,.4,0)));
    g.add(mesh(GEO.cyl,tw,.42,.55,.3,0,.85,0));g.add(mesh(GEO.box,skin,.66,.62,.38,0,1.38,0));
    [-1,1].forEach(s=>{const a=mesh(GEO.cyl,skin,.09,.6,.09,s*.42,1.35,0);a.rotation.z=s*.25;g.add(a)});
    const head=new THREE.Group();head.position.y=1.98;g.add(head);head.add(mesh(GEO.sph,skin,.26,.28,.26));head.add(mesh(HEMI,pick(["#e53935","#2f6fed","#ffffff","#ffc531"]),.28,.24,.28,0,.06,0));
    head.add(mesh(GEO.box,"#1c2445",.42,.06,.06,0,.06,-.25));[-1,1].forEach(s=>head.add(mesh(GEO.cyl,"#7fd3ff",.08,.05,.08,s*.1,.06,-.27)));
    g.add(mesh(GEO.box,tw,.7,.12,.12,0,1.62,-.18));g.rotation.y=Math.PI;g.userData={head};return mergeRig(g,[head])},
  towelLine(){const g=new THREE.Group();[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#8a8f9c",.05,2.7,.05,s*1.05,1.35,0)));g.add(mesh(GEO.cyl,"#e9eef7",.02,2.1,.02,0,2.55,0));g.children[2].rotation.z=Math.PI/2;
    for(let k=0;k<4;k++){const c=pick(["#ff9fb5","#7fd3ff","#ffe066","#ffffff","#b6f0a0","#ff6a5c"]);g.add(mesh(GEO.box,c,.44,1.2+rand(0,.15),.04,-.75+k*.5,1.95,0));g.add(mesh(GEO.box,"#ffffff",.06,.06,.06,-.75+k*.5,2.55,0))}return g}});
["lbench","towels","laundry","towelLine"].forEach(x=>STATIC_OB.add(x));KN_FALL.add("bather");KN_TIP.add("lbench");KN_TIP.add("laundry");
function populateLocker(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,12);while(l<Math.min(l0+CH-2,Z.n*CH-6)){if(l<LOCK_SWAP-9||l>LOCK_SWAP+7)rows.push(Lz(l));l+=gap+rand(.5,2.5)}
  rows.forEach(z=>{
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.3)L[ri(3)]="tall";else if(q<.55){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.55?"low":"over";L[ri(3)]=Math.random()<.5?"low2":null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;const ty=c==="tall"?pick(["bather","laundry"]):c==="over"?"towelLine":c==="low2"?"puddle":pick(["lbench","towels","wetfloor","towels"]);
      const o=spawnObs(g,ty,lane,z,ci,0);if(ty==="bather"){const h=o.m.userData.head,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{if(!o.dead)h.rotation.y=Math.sin(t*1.2+ph)*.5}})}})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.locker=lockerChunk;POP_FN.locker=populateLocker;

/* ---------- тераса над басейном, дорога обривається ---------- */
const LEDGE_EDGE=[59.2,59.75,59.4];
function ledgeChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,E=Z.n*CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  const a=l0,b=Math.min(l1,57);if(b>a){d.add(mesh(GEO.box,deckMat,9.6,.3,b-a,0,-.15,Lz((a+b)/2)))}
  if(l1>=E){LEDGE_EDGE.forEach((e,lane)=>{const len=e-57;d.add(mesh(GEO.box,deckMat,3.2,.3,len,LX[lane],-.15,Lz(57+len/2)));
      for(let q=0;q<3;q++)d.add(mesh(GEO.box,"#e2dccf",rand(.3,.7),.3,rand(.2,.5),LX[lane]+rand(-1.2,1.2),-.15,Lz(e-rand(0,.3))))});
    /* уламки, що висять на краю, і тріщини */
    for(let q=0;q<5;q++){const c=mesh(GEO.box,"#3a3f52",rand(.4,1.4),.02,.05,rand(-3.5,3.5),.012,Lz(rand(52,58)));c.rotation.y=rand(-.8,.8);d.add(c)}}
  /* скельна основа під терасою */
  const rb=Math.min(l1,58.6);if(rb>a){d.add(mesh(GEO.box,rockMat,30,24,rb-a,0,-12.3,Lz((a+rb)/2)));d.add(mesh(GEO.box,"#6fae55",30,.3,rb-a,0,-.33,Lz((a+rb)/2)))}
  if(l1>=E)for(let q=0;q<7;q++){const r=rand(.8,2.2);d.add(mesh(GEO.sph,"#8d8173",r*1.5,r,r,rand(-12,12),rand(-18,-3),Lz(58.6+rand(-.3,.6))))}
  /* скляні перила: обриваються разом із терасою */
  [-1,1].forEach(s=>{const re=l1>=E?Math.min(l1,52):l1;
    for(let l=Math.ceil(l0/2.5)*2.5;l<re;l+=2.5){d.add(mesh(GEO.box,"#c4cdda",.1,1.15,.1,s*4.75,.58,Lz(l)))}
    if(re>l0){d.add(mesh(GEO.box,"#e9eef7",.12,.08,re-l0,s*4.75,1.15,Lz((l0+re)/2)));d.add(mesh(GEO.box,glassMat,.04,.95,re-l0,s*4.75,.6,Lz((l0+re)/2)))}
    for(let l=l0+4;l<Math.min(l1,50);l+=9){d.add(mesh(GEO.cyl,"#d4774a",.32,.55,.32,s*4.1,.27,Lz(l)));d.add(mesh(GEO.sph,"#3fae5a",.45,.55,.45,s*4.1,.85,Lz(l)))}});
  if(l1>=E){const bk=mesh(GEO.box,"#c4cdda",.1,1.15,.1,4.75,.58,Lz(53));bk.rotation.z=.6;d.add(bk);const bk2=mesh(GEO.box,"#c4cdda",.1,1.15,.1,-4.75,.4,Lz(53.5));bk2.rotation.x=.9;d.add(bk2)}
  [18,42].forEach((l,q)=>{if(l>=l0&&l<l1){const x=q?-4.2:4.2,z=Lz(l);const sg=new THREE.Mesh(GEO.box,faced(seaMat.danger,"#1c2445",4));sg.scale.set(1.7,.85,.06);sg.position.set(x,1.9,z);d.add(sg);d.add(mesh(GEO.box,"#8b939f",.08,1.5,.08,x,.75,z-.05))}});
  freeze(d);g.add(d)}
function populateLedge(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l;
  /* лише монети: тераса — момент «вау», дорога веде до обриву */
  for(let l=Math.max(l0+3,6);l<Math.min(l0+CH,54);l+=1.6)addCoin(g,ci,LX[1],.8,Lz(l));
  if(k===0)[0,2].forEach(lane=>{for(let q=0;q<5;q++)addCoin(g,ci,LX[lane],.8,Lz(14+q*1.4))})}
CHUNK_FN.ledge=ledgeChunk;POP_FN.ledge=populateLedge;
