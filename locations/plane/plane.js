/* Локація plane (v63) — салон літака (cabin, 450 м) і туалет (wc, 60 м).
   Салон: широкий прохід на три доріжки, крісла з пасажирами по боках, полиці для багажу, ілюмінатори.
   Зліт: між CAB_UP0 і CAB_UP1 підлога плавно йде вгору на PLANE_H м (шейдер вигину, ELEV з airport.js),
   у вікнах аеропорт → земля відходить униз → хмари. Туалет: унітаз засмоктує котика (і боса) — спалах — далі труба. */

/* ---------- ілюмінатори: що видно надворі ---------- */
function cabWinTex(kind){return texOf((x,w,h)=>{x.fillStyle="#eef1f5";x.fillRect(0,0,w,h);
  x.save();x.beginPath();const r=22,a=10,b=10,W=w-20,H=h-20;x.moveTo(a+r,b);x.lineTo(a+W-r,b);x.quadraticCurveTo(a+W,b,a+W,b+r);x.lineTo(a+W,b+H-r);x.quadraticCurveTo(a+W,b+H,a+W-r,b+H);x.lineTo(a+r,b+H);x.quadraticCurveTo(a,b+H,a,b+H-r);x.lineTo(a,b+r);x.quadraticCurveTo(a,b,a+r,b);x.clip();
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,kind==="cloud"?"#2f7fd6":"#6cc3ff");g.addColorStop(1,kind==="cloud"?"#9fd7ff":"#d8f1ff");x.fillStyle=g;x.fillRect(0,0,w,h);
  if(kind==="ground"){x.fillStyle="#7d8597";x.fillRect(0,h*.6,w,h);x.fillStyle="#6fae55";x.fillRect(0,h*.78,w,h);x.fillStyle="#ffc531";x.fillRect(0,h*.68,w,2);x.fillStyle="#c4cdda";x.fillRect(w*.15,h*.46,w*.5,h*.14);x.fillStyle="#1565c0";x.fillRect(w*.15,h*.46,w*.5,3)}
  else if(kind==="climb"){x.save();x.translate(w/2,h*.82);x.rotate(-.18);x.fillStyle="#7cbf5e";x.fillRect(-w,0,w*2,h);x.fillStyle="#8b939f";for(let q=0;q<9;q++)x.fillRect(-w*.6+q*9,-3-(q%3)*3,6,4+(q%3)*3);x.restore()}
  else{x.fillStyle="#ffffff";for(let q=0;q<7;q++){x.beginPath();x.arc(rand(0,w),h*rand(.62,.95),rand(8,16),0,7);x.fill()}x.fillStyle="rgba(255,255,255,.7)";x.beginPath();x.arc(rand(10,w-10),h*.3,6,0,7);x.fill()}
  x.restore();x.strokeStyle="#c4cdda";x.lineWidth=4;x.stroke()},64,96)}
const winMats={ground:new THREE.MeshBasicMaterial({map:cabWinTex("ground")}),climb:new THREE.MeshBasicMaterial({map:cabWinTex("climb")}),cloud:new THREE.MeshBasicMaterial({map:cabWinTex("cloud")})};
const beltSignTex=texOf((x,w,h)=>{x.fillStyle="#1c2445";x.fillRect(0,0,w,h);x.strokeStyle="#ffc531";x.fillStyle="#ffc531";x.lineWidth=5;
  x.beginPath();x.arc(36,22,7,0,7);x.fill();x.beginPath();x.moveTo(26,34);x.lineTo(46,34);x.lineTo(44,56);x.lineTo(28,56);x.fill();x.beginPath();x.moveTo(18,46);x.lineTo(54,46);x.stroke();
  x.beginPath();x.arc(92,22,7,0,7);x.fill();x.fillRect(84,34,16,22);x.lineWidth=4;x.beginPath();x.moveTo(74,10);x.lineTo(110,56);x.stroke()},128,64);
const beltSignOn=new THREE.MeshBasicMaterial({map:beltSignTex}),beltSignOff=new THREE.MeshBasicMaterial({map:beltSignTex,color:"#6a7186"});
const cabSeatC=["#1e3a7a","#22468f"];
function cabSeat(d,x,z,c){d.add(mesh(GEO.box,c,.92,.2,.8,x,.55,z));d.add(mesh(GEO.box,c,.92,1.05,.2,x,1.05,z+.42));d.add(mesh(GEO.box,"#f4f6fb",.7,.32,.21,x,1.42,z+.42));
  d.add(mesh(GEO.box,"#3a3f52",.1,.5,.7,x-.46,.3,z))}
/* пасажири спрощені: голова й зачіска з низькополігональних сфер (у салоні їх сотні; v63: 466 тис. → ~120 тис. трикутників у кадрі) */
const LOSPH=new THREE.SphereGeometry(1,8,6),LOCAP=new THREE.SphereGeometry(1,8,4,0,Math.PI*2,0,Math.PI/2);
function cabPassenger(d,x,z){const skin=pick(SKINS),hair=pick(HAIR2),y=1.72,zz=z+.12;d.add(mesh(LOSPH,skin,.24,.26,.24,x,y,zz));
  const st0=Math.random();if(st0<.8)d.add(mesh(LOCAP,hair,.26,.22,.27,x,y+.04,zz+.02));if(st0<.3)d.add(mesh(LOSPH,hair,.17,.2,.12,x,y-.1,zz+.22));else if(st0>.8&&st0<.9)d.add(mesh(LOSPH,hair,.12,.12,.12,x,y+.27,zz+.12));
  d.add(mesh(GEO.box,pick(SHIRTS),.6,.6,.36,x,1.12,z+.15));if(Math.random()<.2)d.add(mesh(GEO.box,"#ffffff",.6,.42,.03,x,1.3,z-.25))}
function cabinChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  /* довгі деталі — boxZ (24 поділки), щоб рівно вигиналися на підйомі */
  d.add(mesh(boxZ,carpetBlueMat,7.4,.2,CH,0,-.1,zc));[-1,1].forEach(s=>{d.add(mesh(boxZ,"#8b939f",3.9,.2,CH,s*5.65,-.08,zc));d.add(mesh(boxZ,"#c4cdda",.12,.05,CH,s*3.72,.02,zc))});
  [-1,1].forEach(s=>{
    /* крісла по два з кожного боку, пасажири */
    for(let l=l0+.6;l<l1;l+=1.05){const z=Lz(l),c=cabSeatC[(Math.floor(l/1.05))%2];[4.45,5.55].forEach(xx=>{cabSeat(d,s*xx,z,c);if(Math.random()<.32)cabPassenger(d,s*xx,z)})}
    /* стінка фюзеляжу з ілюмінаторами */
    d.add(mesh(boxZ,"#eef1f5",.3,4.6,CH,s*7.55,2.1,zc));d.add(mesh(boxZ,"#dfe4ec",.32,.5,CH,s*7.5,.25,zc));
    for(let l=l0+.6;l<l1;l+=1.05){const kind=l<CAB_UP0+30?"ground":l<CAB_UP1-30?"climb":"cloud";d.add(mesh(GEO.box,winMats[kind],.04,.75,.55,s*7.38,1.75,Lz(l)))}
    /* полиці для багажу */
    d.add(mesh(boxZ,"#f4f6fb",3.6,1.05,CH,s*5.45,4.3,zc));d.add(mesh(boxZ,"#dfe4ec",3.62,.12,CH,s*5.45,3.77,zc));
    for(let l=Math.ceil(l0/1.6)*1.6;l<l1;l+=1.6)d.add(mesh(GEO.box,"#c4cdda",.04,.9,.05,s*3.64,4.3,Lz(l)));
    // Lightweight luggage: two meshes per case, spaced out to reduce merge/build spikes.
    // Keep visible luggage on both sides without extra handles, rims and supports.
    for(let l=Math.ceil((l0+.3)/6)*6;l<l1-.35;l+=6){
      const z=Lz(l),c=SUITC[(Math.floor(l/6)+(s>0?2:0))%SUITC.length];
      d.add(mesh(GEO.box,c,1.2,.66,1.35,s*4.7,4.24,z));
      d.add(mesh(GEO.box,"#343b50",.16,.12,.55,s*4.7,4.64,z));
    }
    for(let l=l0+.6;l<l1;l+=2.1)d.add(mesh(GEO.box,lightMat,.4,.05,.25,s*4.4,3.7,Lz(l)));
    const cv=mesh(boxZ,"#eef1f5",2.6,.25,CH,s*4.35,5.3,zc);cv.rotation.z=s*.38;d.add(cv)});
  d.add(mesh(boxZ,"#dde3ec",7.4,.25,CH,0,5.75,zc));d.add(mesh(boxZ,lightMat,.5,.05,CH,0,5.6,zc));
  for(let l=l0+5;l<l1;l+=10)[-1,1].forEach(s=>d.add(mesh(GEO.box,l<CAB_UP1+20?beltSignOn:beltSignOff,.6,.3,.04,s*2.4,5.4,Lz(l))));
  // A clearly open WC entrance at the end of the cabin, not a solid wall.
  // The next zone continues seamlessly behind this illuminated doorway.
  if(k===CABN-1){
    const z=Lz(CABN*CH-.8),blue=MB("#20caff"),green=MB("#50ff9c");
    [-1,1].forEach(s=>{
      d.add(mesh(GEO.box,"#e6edf7",3.95,5.65,.48,s*5.48,2.83,z));
      d.add(mesh(GEO.box,blue,.16,4.75,.16,s*3.38,2.45,z+.16));
      d.add(mesh(GEO.box,green,.32,.13,1.8,s*2.55,.08,z+2.0));
    });
    d.add(mesh(GEO.box,"#e6edf7",6.95,.75,.5,0,5.25,z));
    d.add(signBox(tripMat.wc,2.6,1.5,0,4.7,z+1.2,.1));
    for(let q=0;q<5;q++){
      const zz=z+3+q*2.6;
      d.add(mesh(GEO.box,green,1.9,.035,.52,0,.055,zz));
      d.add(mesh(GEO.box,blue,.26,.045,.52,-.7,.07,zz));
      d.add(mesh(GEO.box,blue,.26,.045,.52,.7,.07,zz));
    }
  }
  /* на початку — кухня бортпровідників і стюардеса, що махає */
  if(k===0){[-1,1].forEach(s=>{d.add(mesh(GEO.box,"#c4cdda",3.6,3.4,4,s*5.6,1.7,Lz(4)));for(let q=0;q<3;q++)d.add(mesh(GEO.box,"#9aa3b5",.05,3.2,1.1,s*3.78,1.7,Lz(2.8+q*1.2)))});
    const w=walker(true);w.position.set(3.2,0,Lz(7));w.rotation.y=Math.PI*.8;g.add(w);w.add(mesh(GEO.cyl,"#e53935",.2,.16,.2,0,2.25,0));const a=w.userData.arm;
    anims.push({chunk:i,z:Lz(7),f:t=>{a.rotation.x=-2.7+Math.sin(t*8)*.35;a.rotation.z=Math.sin(t*8)*.3}})}
  freeze(d);g.add(d)}
/* ---------- перешкоди салону ---------- */
Object.assign(OD,{trolley:{half:.6,ymin:0,ymax:2.1},stretch:{half:.45,ymin:0,ymax:2.2},carry:{half:.32,ymin:0,ymax:.58,top:.6},
  npillow:{half:.4,ymin:0,ymax:.42,top:.44},overbag:{half:.25,ymin:1.05,ymax:2.6},kid:{half:.35,ymin:0,ymax:1.15}});
Object.assign(OB,{
  trolley(){const g=new THREE.Group();g.add(mesh(GEO.box,"#c4cdda",.8,1.05,1.0,0,.6,0));for(let q=0;q<3;q++)g.add(mesh(GEO.box,"#9aa3b5",.82,.03,1.02,0,.32+q*.3,0));
    g.add(mesh(GEO.box,"#e53935",.82,.12,1.02,0,1.06,0));[-1,1].forEach(a=>[-1,1].forEach(b=>g.add(mesh(GEO.cyl,"#1d1d24",.06,.08,.06,a*.32,.04,b*.4))));
    [["#ffffff",-.2],["#ff9f43",0],["#3d7bff",.2]].forEach(([c,x])=>g.add(mesh(GEO.cyl,c,.07,.22,.07,x,1.24,-.2)));g.add(mesh(GEO.box,"#3a3f52",.5,.05,.4,0,1.14,.2));
    const w=walker(true);w.position.set(0,0,.85);g.add(w);w.add(mesh(GEO.cyl,"#e53935",.2,.16,.2,0,2.25,0));w.userData.arm.rotation.x=-1.0;g.rotation.y=Math.PI;return mergeRig(g,[])},
  stretch(){const g=new THREE.Group(),w=walker(true);g.add(w);const u=w.userData;u.arm.rotation.set(-2.9,0,-.3);
    const a2=new THREE.Group();a2.position.set(.44,1.6,0);a2.add(mesh(GEO.cyl,"#5aa9e6",.09,.6,.09,0,-.3,0));a2.add(mesh(GEO.sph,pick(SKINS),.09,.09,.09,0,-.62,0));a2.rotation.set(-2.9,0,.3);w.add(a2);
    g.rotation.y=Math.PI;g.userData={u,a2};return mergeRig(g,[a2])},
  carry(){const g=new THREE.Group(),c=pick(SUITC);g.add(mesh(GEO.box,c,.7,.5,.42,0,.3,0));g.add(mesh(GEO.box,shade(c,-.25),.72,.06,.44,0,.42,0));g.add(mesh(GEO.box,"#3a3f52",.3,.06,.06,0,.59,0));
    [-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#1d1d24",.05,.08,.05,s*.28,.04,.12)));return g},
  npillow(){const g=new THREE.Group(),c=pick(["#ff9fb5","#7fd3ff","#ffe066","#b6f0a0"]);g.add(mesh(GEO.box,pick(["#2f6fed","#8a63ff","#e53935"]),1.2,.12,.8,0,.06,0));
    const p=new THREE.Mesh(TG(.3,.13,8,16,Math.PI*1.5),M(c));p.rotation.x=-Math.PI/2;p.position.set(.15,.25,0);g.add(p);return g},
  overbag(){const g=new THREE.Group(),c=pick(SUITC);[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#3a3f52",.03,3.4,.03,s*.35,3.7,0)));
    g.add(mesh(GEO.box,c,1.0,.8,.5,0,1.6,0));g.add(mesh(GEO.box,shade(c,-.25),1.02,.1,.52,0,1.9,0));g.add(mesh(GEO.box,"#c4cdda",.2,.06,.53,0,1.6,0));return g},
  kid(){const g=new THREE.Group(),w=walker(true);w.scale.setScalar(.58);g.add(w);w.add(mesh(GEO.box,pick(["#ffc531","#22b066","#ff6a5c"]),.5,.55,.25,0,1.3,.32));g.userData={u:w.userData};return mergeRig(g,[])}});
["carry","npillow","overbag"].forEach(x=>STATIC_OB.add(x));KN_TIP.add("trolley");KN_FALL.add("stretch");KN_FALL.add("kid");
function populateCabin(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,14);while(l<l0+CH-2){if(keepRow(Z,"rk",l>CAB_UP0&&l<CAB_UP1?.72:.88))rows.push(Lz(l));l+=gap+rand(.5,3)}
  let skip=false;
  rows.forEach(z=>{if(skip){skip=false;return}
    if(Math.random()<.09){clearArea(z+6,z-6);const o=spawnObs(g,"kid",1,z,ci,0),u=o.m.userData.u,ph=rand(0,6);
      anims.push({chunk:ci,z,far:10,f:t=>{if(o.dead)return;const x=Math.sin(t*1.3+ph)*2.4;o.x=x;o.m.position.x=x;o.m.rotation.y=Math.cos(t*1.3+ph)>0?-Math.PI/2:Math.PI/2;const w=t*14;u.legL.rotation.x=Math.sin(w)*.8;u.legR.rotation.x=-Math.sin(w)*.8}});skip=true;ROWP=null;return}
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.32)L[ri(3)]="tall";else if(q<.56){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;const ty=c==="tall"?pick(["trolley","trolley","stretch"]):c==="over"?"overbag":pick(["carry","carry","npillow"]);
      const o=spawnObs(g,ty,lane,z,ci,0);
      if(ty==="stretch"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{if(o.dead)return;const e=Math.sin(t*2+ph)*.25;u.u.arm.rotation.x=-2.9+e;u.a2.rotation.x=-2.9-e}})}})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.cabin=cabinChunk;POP_FN.cabin=populateCabin;

/* ---------- туалет ---------- */
const wcTileTex=repT(texOf((x,w,h)=>{x.fillStyle="#e2eef5";x.fillRect(0,0,w,h);x.fillStyle="#a9d2e6";for(let r=0;r<4;r++)for(let q=0;q<4;q++)if((r+q)%2)x.fillRect(q*16,r*16,16,16);
  x.strokeStyle="#b8d4e3";x.lineWidth=1.5;for(let i=0;i<=64;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.moveTo(0,i);x.lineTo(64,i);x.stroke()}},64,64),3,10);
const wcTileMat=new THREE.MeshToonMaterial({map:wcTileTex,gradientMap:grad});
const swirlTex=texOf((x,w,h)=>{x.fillStyle="#5fc3ef";x.fillRect(0,0,w,h);x.translate(w/2,h/2);for(let k=0;k<4;k++){x.rotate(Math.PI/2);x.strokeStyle=k%2?"#e9fbff":"#2a8fe0";x.lineWidth=7;x.beginPath();
  for(let a=0;a<6;a+=.2){const r=a*9;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.stroke()}},128,128);
const swirlMat=new THREE.MeshBasicMaterial({map:swirlTex});
/* усе в туалеті закінчується до WC_END: на межі порталу (кінець зони) висота дороги стрибає на PLANE_H униз,
   і деталь, що її перетинає, розтягнулася б на 14 м */
const WC_END=WCN*CH-.1;
function wcChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=Math.min(l0+CH,WC_END),Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),WALL=21;
  const a=l0,b=Math.min(l1,WALL);
  if(b>a){/* задня кухня */const len=b-a,zm=Lz((a+b)/2);d.add(mesh(GEO.box,"#b7bdc9",15,.2,len,0,-.1,zm));d.add(mesh(GEO.box,"#f4f6fb",15,.25,len,0,5.75,zm));
    [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#c4cdda",3.4,3.8,len,s*5.8,1.9,zm));for(let l=a+1;l<b;l+=1.2)d.add(mesh(GEO.box,"#9aa3b5",.05,3.4,1.0,s*4.08,1.9,Lz(l+.5)));
      d.add(mesh(GEO.box,"#eef1f5",.3,5.8,len,s*7.55,2.9,zm));d.add(mesh(GEO.box,"#f4f6fb",3.6,1.0,len,s*5.45,4.6,zm))});
    for(let l=a+3;l<b;l+=6)d.add(mesh(GEO.box,lightMat,.5,.05,3,0,5.6,Lz(l)))}
  if(WALL>=l0&&WALL<l1){const z=Lz(WALL),wO=3.4,hO=5.2;[-1,1].forEach(s=>d.add(mesh(GEO.box,"#eef1f5",7.6-wO,6,.4,s*(wO+(7.6-wO)/2),3,z)));d.add(mesh(GEO.box,"#eef1f5",wO*2,6-hO,.4,0,hO+(6-hO)/2,z));
    d.add(mesh(GEO.box,"#1f6fd1",wO*2+.4,.3,.5,0,hO,z));[-1,1].forEach(s=>{d.add(mesh(GEO.box,"#1f6fd1",.3,hO,.5,s*wO,hO/2,z));d.add(signBox(tripMat.wc,1.3,1.0,s*5.2,3.6,z+.3,.08));
      d.add(mesh(GEO.box,MB("#3bd27f"),.5,.18,.06,s*5.2,2.8,z+.25))})}
  const ra=Math.max(l0,WALL),rb=l1;
  if(rb>ra){/* сама вбиральня */const len=rb-ra,zm=Lz((ra+rb)/2);d.add(mesh(GEO.box,wcTileMat,10,.2,len,0,-.1,zm));d.add(mesh(GEO.box,"#f4f6fb",10.4,.25,len,0,5.75,zm));
    [-1,1].forEach(s=>{d.add(mesh(GEO.box,wcTileMat,.3,5.8,len,s*5.1,2.9,zm));d.add(mesh(GEO.box,"#2a8fe0",.32,.2,len,s*5.08,1.2,zm))});
    for(let l=ra+4;l<rb;l+=8)d.add(mesh(GEO.box,lightMat,2,.05,1.2,0,5.6,Lz(l)));
    if(ra<=30&&rb>30){const z=Lz(32),x=4.4;d.add(mesh(GEO.box,"#f4f6fb",1.2,.25,1.6,x,1.6,z));d.add(mesh(GEO.cyl,"#cfe6f2",.45,.2,.45,x-.1,1.68,z));d.add(mesh(GEO.cyl,"#c4cdda",.05,.5,.05,x+.35,1.9,z));
      d.add(mesh(GEO.box,"#bfe9ff",.05,1.6,2.0,4.93,3.2,z));d.add(mesh(GEO.box,"#ffffff",.06,1.7,2.1,4.95,3.2,z));d.add(mesh(GEO.cyl,"#ff9fb5",.12,.4,.12,x+.3,1.95,z-.5))}
    if(rb>=WC_END&&l0<=WCN*CH){/* унітаз посередині, бачок біля задньої стіни */const zt=Lz(57),zb=Lz(59.1);
      d.add(mesh(GEO.box,wcTileMat,10.4,6,.4,0,3,Lz(WC_END-.25)));
      d.add(mesh(GEO.cyl,"#f4f6fb",1.25,1.0,1.5,0,.5,zt));d.add(mesh(GEO.cyl,"#f4f6fb",.75,.3,.9,0,.12,zt+.2));
      const ring=new THREE.Mesh(TG(1.18,.16,8,28),M("#4fb3e8"));ring.rotation.x=Math.PI/2;ring.scale.set(1,1.2,1);ring.position.set(0,1.02,zt);d.add(ring);
      d.add(mesh(GEO.box,"#eef3f8",2.7,2.2,1.0,0,2.1,zb));d.add(mesh(GEO.box,"#4fb3e8",2.72,.25,1.02,0,1.2,zb));d.add(mesh(GEO.box,"#e9eef7",2.8,.15,1.05,0,3.25,zb));d.add(mesh(GEO.cyl,"#c4cdda",.25,.08,.25,0,3.32,zb));
      const lid=mesh(GEO.cyl,"#4fb3e8",1.25,.12,1.45,0,2.0,zb+.62);lid.rotation.x=Math.PI/2-.15;d.add(lid)}}
  freeze(d);g.add(d);
  if(l1>=WC_END){const zt=Lz(57);const sw=new THREE.Mesh(new THREE.CircleGeometry(1.05,28),swirlMat);sw.rotation.x=-Math.PI/2;sw.position.set(0,.95,zt);g.add(sw);
    const bub=[];for(let q=0;q<10;q++){const sp=new THREE.Sprite(ownMat(new THREE.SpriteMaterial({map:poofTex,color:"#d8f6ff",transparent:true,depthWrite:false})));sp.scale.setScalar(rand(.2,.45));g.add(sp);bub.push({sp,a:rand(0,6),r:rand(.3,1.0),p:rand(0,1)})}
    anims.push({chunk:i,z:zt,f:(t,dt)=>{sw.rotation.z=-t*6;bub.forEach(b=>{const k=(t*.6+b.p)%1,a=b.a-t*5;b.sp.position.set(Math.cos(a)*b.r*(1-k),1.0+k*1.6,zt+Math.sin(a)*b.r*(1-k));b.sp.material.opacity=1-k})}})}}
function populateWc(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l;if(k>0)return;
  const rows=[Lz(rand(5,7)),Lz(rand(13,15))];rows.forEach(z=>{const L=rowPick(()=>{const L=[null,null,null];L[ri(3)]=pick(["tall","low"]);return L},z);rowMark(L,z);
    L.forEach((c,lane)=>{if(c)spawnObs(g,c==="tall"?"trolley":pick(["carry","npillow"]),lane,z,ci,0)})});
  for(let q=0;q<8;q++)addCoin(g,ci,LX[1],.8,Lz(26+q*2.2))}
CHUNK_FN.wc=wcChunk;POP_FN.wc=populateWc;
