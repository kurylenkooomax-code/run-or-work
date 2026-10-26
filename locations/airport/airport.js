/* Локація airport (v63) — після пляжу котик забігає в аеропорт (знову в костюмі), далі рукав до літака.
   Тут також уся «подорож» після пляжу: аеропорт → рукав → салон літака (зліт) → туалет (засмоктує унітаз) →
   труба (котик крихітний, біжить угору) → кран (крапля переносить на стіл) → стіл → порт ноутбука → поки що назад у парк.
   Висоту доріг малює той самий шейдер вигину (ELEV у world.js). Для зльоту і труби обрив вимкнено (noFall):
   замість падіння котик проходить «портал» — спалах на весь екран, і світ під ним уже на висоті 0. */

/* ---------- ланцюжок зон ---------- */
const AIRN=16,JETN=2,CABN=15,WCN=2,PIPEN=10,TAPN=2,DESKN=12;
const PLANE_H=14,MINI_H=10,CAB_UP0=90,CAB_UP1=240,PIPE_UP0=90,PIPE_UP1=240;
/* відстані всередині зон (м від початку зони) */
const AIR_SEC=252,AIR_GATE=AIRN*CH-24,WC_SUCK=46,WC_GONE=57.6,TAP_OUT=12,TAP_HAND=20,TAP_FLING=23,TAP_LAND=52,DESK_PORT=DESKN*CH-2;
const TRIP_ZONES=new Set(["airport","jet","cabin","wc","pipe","tap","desk"]);
function addTripSeq(c){const add=(kind,n)=>{const Z={kind,c0:c,n,id:ZS.length};ZS.push(Z);c+=n;return Z};
  add("airport",AIRN);add("jet",JETN);const C=add("cabin",CABN);add("wc",WCN);const P=add("pipe",PIPEN);add("tap",TAPN);const D=add("desk",DESKN);
  ELEV.push({sA:C.c0*CH+CAB_UP0,sB:C.c0*CH+CAB_UP1,H:PLANE_H,sD:P.c0*CH,noFall:true,portal:"flush",fallen:false,bossFallen:false});
  ELEV.push({sA:P.c0*CH+PIPE_UP0,sB:P.c0*CH+PIPE_UP1,H:MINI_H,sD:D.c0*CH+DESK_PORT,noFall:true,portal:"port",fallen:false,bossFallen:false});
  return c}

/* ---------- середовище ---------- */
const C3=c=>new THREE.Color(c);
Object.assign(ENV,{airport:{bg:C3("#cfe8fb"),fog:C3("#e2f0fb"),near:55,far:170},jet:{bg:C3("#8cc6ef"),fog:C3("#cfe6f7"),near:45,far:150},
  cabin:{bg:C3("#e8edf5"),fog:C3("#e8edf5"),near:34,far:120},wc:{bg:C3("#e8edf5"),fog:C3("#e8edf5"),near:26,far:90},
  pipe:{bg:C3("#15221f"),fog:C3("#1b2e2a"),near:14,far:80},tap:{bg:C3("#d4e6f0"),fog:C3("#dce9f0"),near:60,far:220},desk:{bg:C3("#f2e4cc"),fog:C3("#f0e3cf"),near:70,far:240}});
Object.assign(ENVN,{airport:{bg:C3("#0b1534"),fog:C3("#1d2a52")},jet:{bg:C3("#2a3352"),fog:C3("#2a3352")},cabin:{bg:C3("#26304f"),fog:C3("#26304f")},wc:{bg:C3("#2b3456"),fog:C3("#2b3456")},
  pipe:{bg:C3("#0c1513"),fog:C3("#101d1a")},tap:{bg:C3("#3a4560"),fog:C3("#3a4560")},desk:{bg:C3("#3d3550"),fog:C3("#3d3550")}});

/* ---------- таблички (перемальовуються при зміні мови) ---------- */
/* v68: тексти для зрозумілих переходів (посадка в літак, черга в туалет) */
Object.assign(T.uk,{tripBoarding:"ПОСАДКА",tripFlight:"РЕЙС KA-404",wcVacant:"ВІЛЬНО",bossBoard:"Посадку закінчено? Тільки не для мене!",bossQueue:"Без черги?! Нахаба!"});
Object.assign(T.en,{tripBoarding:"BOARDING",tripFlight:"FLIGHT KA-404",wcVacant:"VACANT",bossBoard:"Boarding closed? Not for me!",bossQueue:"Skipping the line?! Rude!"});
const tripCv={airport:cnv(512,128),gate:cnv(256,96),board:cnv(512,256),sec:cnv(256,96),wc:cnv(128,96),air:cnv(256,96),usb:cnv(256,96),boarding:cnv(512,128),vacant:cnv(256,80),wc90:cnv(256,80),wc60:cnv(256,80),wc30:cnv(256,80)};
const tripTex={};for(const k in tripCv)tripTex[k]=new THREE.CanvasTexture(tripCv[k][0]);
const tripMat={};for(const k in tripTex)tripMat[k]=new THREE.MeshBasicMaterial({map:tripTex[k]});
function planeIcon(x,cx,cy,s,c){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle=c;x.beginPath();
  x.moveTo(-18,2);x.lineTo(14,2);x.quadraticCurveTo(22,0,14,-2);x.lineTo(-18,-2);x.closePath();x.fill();
  x.beginPath();x.moveTo(-2,-2);x.lineTo(-10,-16);x.lineTo(-5,-16);x.lineTo(6,-2);x.fill();x.beginPath();x.moveTo(-2,2);x.lineTo(-10,16);x.lineTo(-5,16);x.lineTo(6,2);x.fill();
  x.beginPath();x.moveTo(-18,-2);x.lineTo(-22,-9);x.lineTo(-18,-9);x.lineTo(-13,-2);x.fill();x.restore()}
function tripPlate(k,bg,fg,txt,icon,fs){const[c,x]=tripCv[k],w=c.width,h=c.height;x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=fg;x.lineWidth=5;x.strokeRect(7,7,w-14,h-14);
  let tx=w/2,max=w-40;if(icon){icon(x,w,h);tx=w/2+h*.32;max=w-h*.64-40}
  x.fillStyle=fg;fitText(x,txt,max,fs||h*.42,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(txt,tx,h/2+2);tripTex[k].needsUpdate=true}
function drawTripSigns(){
  tripPlate("airport","#1565c0","#ffffff",t("tripAirport"),(x,w,h)=>planeIcon(x,64,h/2,1.9,"#ffffff"),58);
  tripPlate("gate","#ffc531","#1c2445",t("tripGate"),(x,w,h)=>{x.fillStyle="#1c2445";x.beginPath();x.moveTo(30,36);x.lineTo(54,36);x.lineTo(54,24);x.lineTo(76,48);x.lineTo(54,72);x.lineTo(54,60);x.lineTo(30,60);x.fill()});
  tripPlate("sec","#3a4152","#ffffff",t("tripSecurity"),(x,w,h)=>{x.fillStyle="#7fd3ff";x.beginPath();x.moveTo(44,18);x.lineTo(68,26);x.quadraticCurveTo(68,62,44,78);x.quadraticCurveTo(20,62,20,26);x.closePath();x.fill()});
  tripPlate("air","#ffffff","#e53935","KOT-AIR",(x,w,h)=>planeIcon(x,48,h/2,1.3,"#e53935"));
  {const[c,x]=tripCv.wc;x.fillStyle="#1f6fd1";x.fillRect(0,0,128,96);x.fillStyle="#fff";x.font="900 44px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText("WC",64,50);tripTex.wc.needsUpdate=true}
  /* табло над входом у рукав: «ПОСАДКА · РЕЙС KA-404» */
  {const[c,x]=tripCv.boarding,w=512,h=128;x.fillStyle="#0e1630";x.fillRect(0,0,w,h);x.strokeStyle="#3bd27f";x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);
    x.fillStyle="#3bd27f";x.beginPath();x.arc(44,h/2,16,0,7);x.fill();fitText(x,t("tripBoarding"),200,52,FONT);x.textAlign="left";x.textBaseline="middle";x.fillText(t("tripBoarding"),74,h/2+2);
    x.fillStyle="#ffc531";fitText(x,t("tripFlight"),180,30,FONT);x.textAlign="right";x.fillText(t("tripFlight"),w-24,h/2+2);tripTex.boarding.needsUpdate=true}
  {const[c,x]=tripCv.vacant,w=256,h=80;x.fillStyle="#1fa860";x.fillRect(0,0,w,h);x.strokeStyle="#fff";x.lineWidth=5;x.strokeRect(5,5,w-10,h-10);x.fillStyle="#fff";fitText(x,t("wcVacant"),200,40,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(t("wcVacant"),w/2,h/2+2);tripTex.vacant.needsUpdate=true}
  /* вказівники в салоні: «WC ↑ 90 м», «60 м», «30 м» */
  [90,60,30].forEach(n=>{const[c,x]=tripCv["wc"+n],w=256,h=80;x.fillStyle="#1f6fd1";x.fillRect(0,0,w,h);x.strokeStyle="#fff";x.lineWidth=5;x.strokeRect(5,5,w-10,h-10);x.fillStyle="#fff";
    x.font="900 40px "+FONT;x.textAlign="left";x.textBaseline="middle";x.fillText("WC",22,h/2+2);x.beginPath();x.moveTo(118,18);x.lineTo(138,40);x.lineTo(126,40);x.lineTo(126,62);x.lineTo(110,62);x.lineTo(110,40);x.lineTo(98,40);x.fill();
    const tx=n+" "+t("m");fitText(x,tx,90,36,FONT);x.textAlign="right";x.fillText(tx,w-20,h/2+2);tripTex["wc"+n].needsUpdate=true});
  {const[c,x]=tripCv.usb;x.fillStyle="#1c2445";x.fillRect(0,0,256,96);x.fillStyle="#5ff0ff";x.font="900 40px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText("USB-C ⚡",128,50);tripTex.usb.needsUpdate=true}
  {const[c,x]=tripCv.board,w=512,h=256;x.fillStyle="#0e1630";x.fillRect(0,0,w,h);x.fillStyle="#ffc531";fitText(x,t("tripDepart"),300,34,FONT);x.textAlign="left";x.textBaseline="middle";x.fillText(t("tripDepart"),24,32);
    planeIcon(x,w-50,32,1.1,"#ffc531");x.fillStyle="#2d3868";x.fillRect(16,58,w-32,3);
    const rows=t("tripBoard");rows.forEach((r,k)=>{const y=88+k*42,[a,b,c2]=r.split("|");x.font="800 26px ui-monospace,Menlo,monospace";x.fillStyle="#e9eef7";x.textAlign="left";x.fillText(a,24,y);x.fillText(b,120,y);
      x.fillStyle=k===0?"#ff6a5c":k===1?"#3bd27f":"#ffc531";x.textAlign="right";x.fillText(c2,w-24,y)});tripTex.board.needsUpdate=true}}
{const ds0=drawSigns;drawSigns=function(){ds0();drawTripSigns()}}
drawTripSigns();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawTripSigns);
const signBox=(mat,w,h,x,y,z,th)=>{const m=new THREE.Mesh(GEO.box,faced(mat,"#1c2445",4));m.scale.set(w,h,th||.1);m.position.set(x,y,z);return m};

/* ---------- матеріали ---------- */
const airFloorTex=repT(texOf((x,w,h)=>{x.fillStyle="#dde3ea";x.fillRect(0,0,w,h);x.fillStyle="#cbd3dd";x.fillRect(0,0,w/2,h/2);x.fillRect(w/2,h/2,w/2,h/2);
  x.strokeStyle="#cdd5df";x.lineWidth=2;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke();
  x.fillStyle="rgba(255,255,255,.55)";x.beginPath();x.moveTo(10,0);x.lineTo(30,0);x.lineTo(0,30);x.lineTo(0,10);x.fill()},128,128),4.5,7.5);
const airFloorMat=new THREE.MeshToonMaterial({map:airFloorTex,gradientMap:grad});
const airGlassMat=new THREE.MeshBasicMaterial({color:"#bfe3ff",transparent:true,opacity:.26,depthWrite:false});
const tarmacTex=repT(texOf((x,w,h)=>{x.fillStyle="#7d8597";x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=Math.random()<.5?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)";x.fillRect(Math.random()*w,Math.random()*h,2,2)}},64,64),10,6);
const tarmacMat=new THREE.MeshToonMaterial({map:tarmacTex,gradientMap:grad});
const carpetBlueTex=repT(texOf((x,w,h)=>{x.fillStyle="#2b4a8a";x.fillRect(0,0,w,h);x.fillStyle="#335aa3";for(let r=0;r<4;r++)for(let q=0;q<4;q++)if((r+q)%2)x.fillRect(q*16+4,r*16+4,8,8)},64,64),4,14);
const carpetBlueMat=new THREE.MeshToonMaterial({map:carpetBlueTex,gradientMap:grad});
const beltTex=repT(texOf((x,w,h)=>{x.fillStyle="#3a3f52";x.fillRect(0,0,w,h);x.fillStyle="#4c5368";for(let i=0;i<h;i+=8)x.fillRect(0,i,w,3)},32,64),1,6);
const beltMat=new THREE.MeshToonMaterial({map:beltTex,gradientMap:grad});

/* ---------- літак (вид з вікон і перону) ---------- */
function planeModel(liv){const g=new THREE.Group(),w="#f4f6fb";liv=liv||pick(["#e53935","#1565c0","#22b066","#ff9f43"]);
  const f=mesh(GEO.cyl,w,1.6,22,1.6,0,2.7,0);f.rotation.x=Math.PI/2;g.add(f);g.add(mesh(GEO.sph,w,1.6,1.6,3.0,0,2.7,-11));
  const tl=mesh(GEO.cone,w,1.6,5,1.6,0,2.9,13.4);tl.rotation.x=Math.PI/2;g.add(tl);
  g.add(mesh(GEO.box,liv,.28,4.4,3.2,0,5.5,13.4));g.add(mesh(GEO.box,w,8,.16,1.8,0,3.2,14.2));
  g.add(mesh(GEO.box,w,24,.3,4,0,1.9,1));[-1,1].forEach(s=>{const e=mesh(GEO.cyl,"#c4cdda",.8,3,.8,s*5,1.1,.2);e.rotation.x=Math.PI/2;g.add(e);g.add(mesh(GEO.cyl,"#3a3f52",.62,.05,.62,s*5,1.1,-1.3));g.children[g.children.length-1].rotation.x=Math.PI/2});
  g.add(mesh(GEO.box,"#1c2445",3.24,.26,17,0,3.15,0));g.add(mesh(GEO.box,liv,3.26,.36,20,0,2.2,.6));g.add(mesh(GEO.box,"#1c2445",1.6,.4,.6,0,3.5,-11.6));
  [[0,-9],[-1.4,1.5],[1.4,1.5]].forEach(([x,z])=>{g.add(mesh(GEO.cyl,"#3a3f52",.08,1.2,.08,x,.6,z));g.add(mesh(GEO.cyl,"#1d1d24",.32,.25,.32,x,.3,z));g.children[g.children.length-1].rotation.z=Math.PI/2});return g}

/* ---------- фасад терміналу в кінці пляжу ---------- */
function airportFacade(d,g,z,ci){
  /* площа перед входом */
  d.add(mesh(GEO.box,"#c9ced8",40,.32,16,0,-.14,z+8));for(let x=-18;x<=18;x+=1.6)d.add(mesh(GEO.box,"#b7bdc9",.08,.33,16,x,-.13,z+8));
  /* скляна стіна з проходом 9,6 × 5,8 м */
  const H=13,wO=4.8,hO=5.8;[-1,1].forEach(s=>{d.add(mesh(GEO.box,airGlassMat,40-wO,H,.2,s*(wO+(40-wO)/2),H/2,z));
    for(let x=wO;x<=40;x+=3.2)d.add(mesh(GEO.box,"#5b6475",.18,H,.3,s*x,H/2,z));for(const y of [hO,9.6])d.add(mesh(GEO.box,"#5b6475",40-wO,.2,.3,s*(wO+(40-wO)/2),y,z))});
  d.add(mesh(GEO.box,airGlassMat,wO*2,H-hO,.2,0,(H+hO)/2,z));d.add(mesh(GEO.box,"#5b6475",wO*2,.3,.32,0,hO,z));d.add(mesh(GEO.box,"#5b6475",wO*2,.2,.3,0,9.6,z));
  d.add(mesh(GEO.box,"#e9eef7",82,.6,4,0,H+.3,z-1.5));
  /* навіс над входом, вивіска */
  d.add(mesh(GEO.box,"#ffffff",12,.35,6,0,7.3,z+3));[-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#c4cdda",.14,7.3,.14,s*5.6,3.65,z+5.6)));
  d.add(signBox(tripMat.airport,8,2,0,10.9,z+.25,.25));
  [-1,1].forEach(s=>{for(let q=0;q<3;q++)palm(d,s*rand(9,17),z+rand(4,13));d.add(mesh(GEO.cyl,"#d4774a",.5,.6,.5,s*6.2,.3,z+1.4));d.add(mesh(GEO.sph,"#3fae5a",.7,.7,.7,s*6.2,1.0,z+1.4))});
  /* хвіст літака над дахом */
  const pl=planeModel("#e53935");pl.scale.setScalar(1.3);pl.position.set(-26,6,z-48);pl.rotation.y=-Math.PI/2;d.add(pl);
  /* розсувні двері: роз'їжджаються, коли котик підбігає */
  const doors=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*2.4,0,z+.05);p.add(mesh(GEO.box,airGlassMat,4.6,5.6,.08,0,2.8,0));p.add(mesh(GEO.box,"#5b6475",4.6,.14,.12,0,5.55,0));p.add(mesh(GEO.box,"#5b6475",.12,5.6,.12,-s*2.25,2.8,0));p.add(mesh(GEO.box,"#c4cdda",.06,.8,.1,-s*2.0,1.2,0));g.add(p);return p});
  let o=0;anims.push({chunk:ci,z,far:40,f:(t,dt)=>{const near=st&&st.z-z<26&&st.z-z>-8;o+=((near?1:0)-o)*Math.min(1,dt*5);doors.forEach((p,k)=>p.position.x=(k?1:-1)*(2.4+o*4.6))}})}

/* ---------- аеропорт ---------- */
/* v69: нерухомі люди аеропорту (пасажири в кріслах, реєстрація, охорона) зливаються з декором — без окремих рухомих частин */
function travelerFig(sit){const w=walker(true);if(sit){w.userData.legL.rotation.x=-1.4;w.userData.legR.rotation.x=-1.4;w.position.y=-.35}w.traverse(o=>{o.userData.dyn=false});return w}
function seatRow(d,x,z,n,c,rot){for(let q=0;q<n;q++){const zz=z+q*.75;d.add(mesh(GEO.box,c,.66,.12,.62,x,.48,zz));const bk=mesh(GEO.box,c,.12,.62,.62,x+(rot||1)*.3,.82,zz);d.add(bk);d.add(mesh(GEO.box,"#8b939f",.08,.42,.08,x,.22,zz))}
  d.add(mesh(GEO.box,"#8b939f",.1,.06,n*.75,x,.4,z+(n-1)*.375))}
function checkin(d,s,z){const x=s*7.3;d.add(mesh(GEO.box,"#e9eef7",1.4,1.1,3.2,x,.55,z));d.add(mesh(GEO.box,"#1565c0",1.42,.25,3.22,x,1.0,z));
  d.add(mesh(GEO.box,"#3a3f52",1.0,.12,2.6,x-s*1.1,.42,z));d.add(mesh(GEO.box,"#2a3048",.08,.5,.7,x+s*.3,1.45,z-.6));d.add(mesh(GEO.box,"#7fd3ff",.02,.42,.6,x+s*.25,1.45,z-.6));
  const w=travelerFig();w.position.set(x+s*.5,0,z+.8);w.rotation.y=s*Math.PI/2;d.add(w)}
function shopFront(d,s,z,c){const x=s*7.6;d.add(mesh(GEO.box,c,2.6,4.2,7,x+s*.4,2.1,z));d.add(mesh(GEO.box,"#ffffff",.08,2.4,5.6,x-s*.92,1.5,z));
  d.add(mesh(GEO.box,airGlassMat,.06,2.3,5.4,x-s*.97,1.5,z));for(let q=0;q<3;q++)d.add(mesh(GEO.box,pick(["#ff6a5c","#ffc531","#3d7bff","#22b066","#ff9fb5"]),.5,.4,.8,x-s*.4,.6+q*.6,z-2+q*1.8));
  d.add(mesh(GEO.box,"#1c2445",.12,.8,6.6,x-s*.95,3.6,z))}
function airportChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),last=k===Z.n-1;
  d.add(mesh(GEO.box,airFloorMat,18,.2,CH,0,-.1,zc));d.add(mesh(GEO.box,"#b9c6d6",7.6,.02,CH,0,.006,zc));[-1,1].forEach(s=>d.add(mesh(GEO.box,"#1565c0",.12,.025,CH,s*3.8,.008,zc)));
  [-1,1].forEach(s=>{
    /* скляні стіни, стеля */
    d.add(mesh(GEO.box,"#5b6475",.4,.5,CH,s*9.1,.25,zc));d.add(mesh(GEO.box,airGlassMat,.1,9.2,CH,s*9.1,5.1,zc));
    for(let l=Math.ceil(l0/3)*3;l<l1;l+=3)d.add(mesh(GEO.box,"#5b6475",.2,9.6,.16,s*9.1,4.8,Lz(l)));
    [3.2,6.4,9.5].forEach(y=>d.add(mesh(GEO.box,"#5b6475",.22,.14,CH,s*9.1,y,zc)));
    /* перон за склом: асфальт, жовта розмітка, літаки ліворуч, злітна смуга праворуч */
    d.add(mesh(GEO.box,tarmacMat,60,.2,CH,s*39.4,-.2,zc));d.add(mesh(GEO.box,"#ffc531",.25,.02,CH,s*16,-.08,zc));
    if(s<0&&k%2===0){const pl=planeModel();pl.position.set(-31,0,Lz(l0+15));pl.rotation.y=-Math.PI/2;d.add(pl);
      d.add(mesh(GEO.box,"#ffc531",1.6,1.2,2.6,-14.5,.6,Lz(l0+rand(4,26))));d.add(mesh(GEO.box,"#e9eef7",1.8,1.4,4.4,-17.5,.7,Lz(l0+rand(4,26))))}
    if(s>0){d.add(mesh(GEO.box,"#5c6375",18,.02,CH,32,-.07,zc));for(let l=l0;l<l1;l+=6)d.add(mesh(GEO.box,"#ffffff",.5,.02,3,32,-.05,Lz(l)))}});
  if(k===6){const x=46,z=Lz(l0+15);d.add(mesh(GEO.cyl,"#e9eef7",1.6,22,1.6,x,11,z));d.add(mesh(GEO.cyl,"#1c2445",3.2,2.6,3.2,x,23.3,z));d.add(mesh(GEO.cyl,"#7fd3ff",3.25,1.6,3.25,x,23.3,z));d.add(mesh(GEO.cone,"#e9eef7",3.4,1.4,3.4,x,25.3,z))}
  if(k%3===1){const pl=planeModel("#1565c0");pl.position.set(34,9+k,Lz(l0+10));pl.rotation.set(-.18,Math.PI,0);d.add(pl)}
  d.add(mesh(GEO.box,"#f4f7fb",18.6,.3,CH,0,9.75,zc));
  for(let l=l0+3;l<l1;l+=6){d.add(mesh(GEO.box,"#ffffff",18.2,.35,.35,0,9.4,Lz(l)));d.add(mesh(GEO.box,lightMat,2.6,.06,4,-4.4,9.55,Lz(l+3)));d.add(mesh(GEO.box,lightMat,2.6,.06,4,4.4,9.55,Lz(l+3)))}
  /* біля стін: реєстрація, крісла, рослини, магазини */
  [-1,1].forEach(s=>{
    if(k>=1&&k<=4&&s<0)for(let l=l0+5;l<l1;l+=10)checkin(d,s,Lz(l));
    else if(k>=9&&k<=12&&s>0){shopFront(d,s,Lz(l0+8),pick(["#ffc531","#ff6a5c","#8a63ff"]));shopFront(d,s,Lz(l0+22),pick(["#22b066","#3d7bff","#ff9fb5"]))}
    else for(let l=l0+4;l<l1-3;l+=9){seatRow(d,s*6.9,Lz(l),5,s<0?"#2f6fed":"#1fa860",s);if(Math.random()<.45){const w=travelerFig(true);w.position.set(s*6.9,0,Lz(l)+rand(0,3));w.rotation.y=s*Math.PI/2;d.add(w)}}
    for(let l=l0+2+rand(0,3);l<l1;l+=rand(9,13)){d.add(mesh(GEO.cyl,"#e9eef7",.45,.7,.45,s*8.4,.35,Lz(l)));d.add(mesh(GEO.sph,"#3fae5a",.65,.9,.65,s*8.4,1.25,Lz(l)))}});
  /* табло вильотів */
  if(k%4===0){[-1,1].forEach(s=>{const z=Lz(l0+15);d.add(signBox(tripMat.board,3.6,1.8,s*6.4,5.8,z,.15));d.add(mesh(GEO.box,"#3a3f52",.15,3.8,.15,s*6.4,7.6,z-.1))})}
  /* огляд безпеки: три рамки металошукача на доріжках, по боках інтроскопи */
  if(AIR_SEC>=l0&&AIR_SEC<l1){const z=Lz(AIR_SEC);
    d.add(signBox(tripMat.sec,3.4,1.25,0,6.8,Lz(AIR_SEC-6),.12));[-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#3a3f52",.04,2.6,.04,s*1.4,8.4,Lz(AIR_SEC-6))));
    LX.forEach(x=>{[-1,1].forEach(q=>d.add(mesh(GEO.box,"#c4cdda",.16,2.5,.5,x+q*.98,1.25,z)));d.add(mesh(GEO.box,"#9aa3b5",2.12,.3,.55,x,2.6,z))});
    [-1,1].forEach(s=>{const x=s*6.4;d.add(mesh(GEO.box,"#e9eef7",1.5,1.4,3.4,x,.7,z));d.add(mesh(GEO.box,"#3a3f52",1.45,.05,7,x,1.0,z+.5));
      for(let q=0;q<4;q++)d.add(mesh(GEO.box,"#8b939f",.9,.12,.6,x,1.1,z+2.2+q*.9));const gd=travelerFig();gd.position.set(s*4.6,0,z-2.5);gd.rotation.y=Math.PI;d.add(gd);
      d.add(mesh(GEO.box,"#1c2445",.6,.5,.5,s*4.6,1.6,z-2.5))});
    const lamps=LX.map(x=>{const r=mesh(GEO.box,MB("#ff4b3e"),.5,.14,.6,x,2.85,z),gr=mesh(GEO.box,MB("#3bd27f"),.5,.14,.6,x,2.85,z);r.visible=false;g.add(r);g.add(gr);return{r,gr,x,t:0}});
    anims.push({chunk:i,z,f:(t,dt)=>{lamps.forEach(L=>{if(st&&Math.abs(st.z-z)<.8&&Math.abs(st.x-L.x)<1)L.t=.9;L.t=Math.max(0,L.t-dt);const on=L.t>0&&Math.sin(L.t*30)>0;L.r.visible=on;L.gr.visible=!on})}})}
  /* вихід на посадку і стіна з проходом у рукав */
  if(last){const z=Lz(AIR_GATE);d.add(signBox(tripMat.gate,3.4,1.25,0,6.6,z,.12));[-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#3a3f52",.04,2.6,.04,s*1.4,8.3,z)));
    const ze=Lz(l1)+.25,wO=4.4,hO=5.6;[-1,1].forEach(s=>d.add(mesh(GEO.box,"#dfe6ef",9.2-wO,9.8,.5,s*(wO+(9.2-wO)/2),4.9,ze)));d.add(mesh(GEO.box,"#dfe6ef",wO*2,9.8-hO,.5,0,hO+(9.8-hO)/2,ze));
    d.add(mesh(GEO.box,"#1565c0",wO*2+.4,.4,.6,0,hO,ze));[-1,1].forEach(s=>d.add(mesh(GEO.box,"#1565c0",.4,hO,.6,s*wO,hO/2,ze)));
    d.add(signBox(tripMat.boarding,5.6,1.4,0,8.1,ze+.3,.12));d.add(signBox(tripMat.air,2.4,.8,0,6.4,ze+.3,.1));
    /* v68: посадка. Стійки з працівниками авіакомпанії, турнікети посадкових талонів на кожній доріжці (блимають зеленим),
       а за склом ліворуч — той самий літак, до якого веде рукав */
    [-1,1].forEach(s=>{const zd=Lz(AIR_GATE+3);d.add(mesh(GEO.box,"#e9eef7",1.3,1.1,3.4,s*6.5,.55,zd));d.add(mesh(GEO.box,"#1565c0",1.32,.22,3.42,s*6.5,1.0,zd));
      d.add(mesh(GEO.box,"#2a3048",.08,.5,.8,s*6.0,1.45,zd));d.add(mesh(GEO.box,MB("#3bd27f"),.03,.36,.66,s*5.95,1.45,zd));
      const ag=walker(true);ag.position.set(s*7.5,0,zd);ag.rotation.y=s*Math.PI/2;g.add(ag);ag.add(mesh(GEO.cyl,"#1565c0",.22,.14,.22,0,2.25,0));const a=ag.userData.arm,ph=s;
      anims.push({chunk:i,z:zd,f:t=>{a.rotation.x=-2.6+Math.sin(t*6+ph)*.35}})});
    const zs=Lz(AIR_GATE+10),gates=LX.map(x=>{[-1,1].forEach(q=>{d.add(mesh(GEO.box,"#3a3f52",.22,1.1,.6,x+q*.98,.55,zs));d.add(mesh(GEO.box,"#c4cdda",.24,.06,.62,x+q*.98,1.12,zs))});
      const fl=[-1,1].map(q=>{const p=new THREE.Group();p.position.set(x+q*.87,.75,zs);const pn=mesh(GEO.box,airGlassMat,.66,.55,.05,-q*.33,0,0);p.add(pn);p.add(mesh(GEO.box,"#e53935",.66,.06,.06,-q*.33,.28,0));g.add(p);return p});
      const r=mesh(GEO.box,MB("#ff4b3e"),.2,.1,.3,x-.98,1.2,zs),gr=mesh(GEO.box,MB("#3bd27f"),.2,.1,.3,x-.98,1.2,zs);gr.visible=false;g.add(r);g.add(gr);return{x,fl,r,gr,o:0}});
    anims.push({chunk:i,z:zs,f:(t,dt)=>{gates.forEach(G=>{const near=st&&st.z-zs<7&&st.z-zs>-3&&Math.abs(st.x-G.x)<1.2;G.o+=((near?1:0)-G.o)*Math.min(1,dt*9);
      G.fl.forEach((p,q)=>p.rotation.y=(q?-1:1)*G.o*1.5);G.r.visible=G.o<.3;G.gr.visible=!G.r.visible})}});
    const pl=planeModel("#e53935");pl.scale.setScalar(1.6);pl.position.set(-36,0,Lz(l0+12));pl.rotation.y=-Math.PI/2;d.add(pl);
    d.add(mesh(GEO.box,"#c9ced8",9.2,2.8,2.6,-13.9,4.3,Lz(l0+12)));d.add(mesh(GEO.box,MB("#7fd3ff"),9.22,.5,2.4,-13.9,4.5,Lz(l0+12)));
    d.add(mesh(GEO.cyl,"#8b939f",.25,3,.25,-15,1.5,Lz(l0+12)));d.add(mesh(GEO.box,"#3a3f52",1.4,3.2,3,-18.2,4.3,Lz(l0+12)))}
  freeze(d);g.add(d)}

/* ---------- перешкоди аеропорту ---------- */
Object.assign(OD,{suitcase:{half:.3,ymin:0,ymax:.95,top:.98},bagpile:{half:.5,ymin:0,ymax:.72,top:.75},lugcart:{half:.85,ymin:0,ymax:2.3},
  traveler:{half:.45,ymin:0,ymax:2.1},qrope:{half:.2,ymin:0,ymax:1.0},hboard:{half:.2,ymin:1.05,ymax:2.8},scrubber:{half:.75,ymin:0,ymax:2.0},
  travel:{half:5.5,ymin:0,ymax:.1,soft:true}});
const SUITC=["#e53935","#2f6fed","#ffc531","#22b066","#8a63ff","#ff9fb5","#1c2445"];
function suitcaseMesh(c,h){h=h||.85;const g=new THREE.Group();g.add(mesh(GEO.box,c,.62,h,.38,0,h/2+.1,0));for(let q=-1;q<=1;q++)g.add(mesh(GEO.box,shade(c,-.18),.64,h-.1,.02,q*.18,h/2+.1,-.19));
  g.add(mesh(GEO.box,"#3a3f52",.3,.05,.06,0,h+.13,0));[-1,1].forEach(a=>[-1,1].forEach(b=>g.add(mesh(GEO.cyl,"#1d1d24",.05,.1,.05,a*.24,.05,b*.13))));
  if(Math.random()<.6)g.add(mesh(GEO.box,pick(["#ffffff","#ffe066","#7fd3ff"]),.2,.14,.01,.1,h*.6,-.2));return g}
Object.assign(OB,{
  suitcase(){return suitcaseMesh(pick(SUITC))},
  bagpile(){const g=new THREE.Group();[[-.45,0,.2],[.4,0,-.1],[0,.36,.05]].forEach(([x,y,z])=>{const c=pick(SUITC),b=mesh(GEO.cyl,c,.3,1.0,.3,x,.3+y,z);b.rotation.z=Math.PI/2;b.rotation.y=rand(-.3,.3);g.add(b);g.add(mesh(GEO.box,"#3a3f52",.06,.5,.05,x,.62+y,z))});
    g.add(mesh(GEO.box,pick(["#ff9f43","#22b066"]),.5,.55,.3,.75,.3,.3));return g},
  lugcart(){const g=new THREE.Group();g.add(mesh(GEO.box,"#9aa3b5",1.2,.08,1.6,0,.25,0));[-1,1].forEach(a=>[-1,1].forEach(b=>g.add(mesh(GEO.cyl,"#1d1d24",.1,.12,.1,a*.5,.1,b*.65))));
    [-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#9aa3b5",.04,1.4,.04,s*.55,.95,.78)));g.add(mesh(GEO.cyl,"#3a3f52",.05,1.2,.05,0,1.65,.78));g.children[g.children.length-1].rotation.z=Math.PI/2;
    let y=.29;[[1.0,.4],[.9,.35],[.8,.45]].forEach(([w,h])=>{const c=pick(SUITC);g.add(mesh(GEO.box,c,w,h,1.3,rand(-.05,.05),y+h/2,0));g.add(mesh(GEO.box,shade(c,-.25),w+.01,.05,1.31,0,y+h*.5,0));y+=h});
    const b=mesh(GEO.cyl,pick(SUITC),.25,.9,.25,0,y+.25,0);b.rotation.z=Math.PI/2;g.add(b);return g},
  traveler(){const g=new THREE.Group(),w=walker(true);g.add(w);const sc=suitcaseMesh(pick(SUITC),.75);sc.position.set(.62,0,.55);sc.rotation.x=-.25;g.add(sc);
    g.add(mesh(GEO.cyl,"#3a3f52",.03,.8,.03,.55,1.1,.25));g.children[g.children.length-1].rotation.x=.6;g.rotation.y=Math.PI;g.userData={u:w.userData};return mergeRig(g,[])},
  qrope(){const g=new THREE.Group(),c=pick(["#e53935","#1565c0"]);[-1,1].forEach(s=>{g.add(mesh(GEO.cyl,"#c4cdda",.05,1.0,.05,s*.95,.5,0));g.add(mesh(GEO.cyl,"#8b939f",.22,.05,.22,s*.95,.02,0));g.add(mesh(GEO.sph,"#e9eef7",.08,.08,.08,s*.95,1.02,0))});
    for(let q=0;q<8;q++){const x=-.9+q*.257,y=.9-Math.sin((q+.5)/8*Math.PI)*.12;g.add(mesh(GEO.box,c,.27,.07,.05,x+.13,y,0))}return g},
  hboard(){const g=new THREE.Group();[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#3a3f52",.03,7.2,.03,s*.9,5.85,0)));
    g.add(mesh(GEO.box,"#1c2445",2.1,1.3,.16,0,1.85,0));const sc=new THREE.Mesh(GEO.box,faced(tripMat.board,"#1c2445",4));sc.scale.set(1.95,1.12,.17);sc.position.set(0,1.85,0);g.add(sc);return g},
  scrubber(){const g=new THREE.Group(),c="#ffc531";g.add(mesh(GEO.box,c,1.2,.8,1.6,0,.55,0));g.add(mesh(GEO.box,"#1c2445",1.22,.15,1.62,0,.2,0));
    const br=new THREE.Group();br.position.set(0,.12,-.75);br.add(mesh(GEO.cyl,"#3d7bff",.55,.12,.55));g.add(br);
    g.add(mesh(GEO.box,"#3a3f52",.7,.5,.5,0,1.1,.35));const w=walker(true);w.scale.setScalar(.85);w.position.set(0,.45,.45);w.userData.legL.rotation.x=w.userData.legR.rotation.x=-1.3;g.add(w);
    g.add(mesh(GEO.cyl,"#3a3f52",.04,.6,.04,0,1.2,-.45));g.add(mesh(GEO.box,"#3a3f52",.5,.05,.05,0,1.5,-.45));
    const bc=mesh(GEO.sph,MB("#ff9f43"),.14,.14,.14,0,2.1,.4);g.add(bc);g.rotation.y=Math.PI;g.userData={br,bc};return mergeRig(g,[br,bc])},
  travel(){const g=new THREE.Group();const b=mesh(GEO.box,beltMat,1.9,.08,11,0,.04,0);b.userData.dyn=true;g.add(b);[-1,1].forEach(s=>{g.add(mesh(GEO.box,"#ffc531",2.0,.09,.3,0,.045,s*5.4));g.add(mesh(GEO.box,"#c4cdda",.12,.12,11,s*1.0,.06,0))});
    for(let q=-2;q<=2;q++){const a=mesh(GEO.cone,MB("#3bd27f"),.25,.5,.04,0,.1,q*2);a.rotation.x=-Math.PI/2;g.add(a)}return g}});
["suitcase","bagpile","lugcart","qrope","hboard"].forEach(x=>STATIC_OB.add(x));KN_TIP.add("lugcart");KN_TIP.add("suitcase");KN_TIP.add("scrubber");KN_FALL.add("traveler");
/* траволатор: прискорює на 3 с (поле o.boost обробляється в game.js) */
function travelator(g,ci,lane,z){const o=spawnObs(g,"travel",lane,z-5.5,ci,0);o.boost=3;o.onHit=()=>{if(!st.travTold){st.travTold=true;bossSay(t("bossTravel"),2)}};
  for(let q=0;q<6;q++)addCoin(g,ci,LX[lane],.8,z-1.5-q*1.6)}
function scrubberRow(g,ci,z){clearArea(z+8,z-8);const o=spawnObs(g,"scrubber",1,z,ci,0),u=o.m.userData,ph=rand(0,6),dir=pick([-1,1]);
  anims.push({chunk:ci,z,far:20,f:(t,dt)=>{if(o.dead)return;const x=Math.sin(t*.9+ph)*2.3*dir;o.x=x;o.m.position.x=x;u.br.rotation.y=t*12;u.bc.visible=Math.sin(t*10)>0}})}
function populateAirport(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,14);while(l<Math.min(l0+CH-2,AIR_GATE-6)){if(l<AIR_SEC-16||l>AIR_SEC+12)rows.push(Lz(l));l+=gap+rand(.5,3)}
  let skip=false;
  rows.forEach(z=>{if(skip){skip=false;return}const r=Math.random();
    if(r<.1){travelator(g,ci,ri(3),z);skip=true;ROWP=null;return}
    if(r<.17){scrubberRow(g,ci,z);skip=true;ROWP=null;return}
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.32)L[ri(3)]="tall";else if(q<.58){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;const ty=c==="tall"?pick(["lugcart","traveler","traveler"]):c==="over"?"hboard":pick(["suitcase","suitcase","bagpile","qrope"]);
      const o=spawnObs(g,ty,lane,z,ci,0);
      if(ty==="traveler"){const u=o.m.userData.u,ph=rand(0,6);anims.push({chunk:ci,z,f:(t,dt)=>{if(o.dead)return;const ah=st?st.z-o.m.position.z:99;if(ah<45&&ah>3)o.m.position.z+=1.3*dt;const w=t*6+ph;u.legL.rotation.x=Math.sin(w)*.5;u.legR.rotation.x=-Math.sin(w)*.5}})}})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.airport=airportChunk;POP_FN.airport=populateAirport;

/* ---------- рукав до літака ---------- */
function jetChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),last=k===Z.n-1;
  /* v68: рукав скляний (стіни й дах), а камера в ньому трохи дивиться вгору (st.camUp):
     попереду видно сам літак — круглий ніс з вікнами кабіни, крила, хвіст */
  const gl=l0,oz=Lz((l0+gl)/2),olen=gl-l0,gz=Lz((gl+l1)/2),glen=l1-gl;
  d.add(mesh(GEO.box,carpetBlueMat,8.8,.2,CH,0,-.1,zc));
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#dfe6ef",.3,1.2,CH,s*4.5,.6,zc));
    if(olen>0){d.add(mesh(GEO.box,airGlassMat,.08,1.6,olen,s*4.5,2.0,oz));d.add(mesh(GEO.box,"#dfe6ef",.3,2.6,olen,s*4.5,4.1,oz));for(let l=l0;l<gl;l+=2.5)d.add(mesh(GEO.box,"#b7bdc9",.34,1.7,.12,s*4.5,2.0,Lz(l)))}
    if(glen>0){d.add(mesh(GEO.box,airGlassMat,.08,4.2,glen,s*4.5,3.3,gz));for(let l=gl+5;l<l1;l+=5)d.add(mesh(GEO.box,"#b7bdc9",.14,4.2,.1,s*4.5,3.3,Lz(l)));d.add(mesh(GEO.box,"#b7bdc9",.34,.2,glen,s*4.5,5.4,gz))}
    d.add(mesh(GEO.box,tarmacMat,40,.2,CH,s*24,-6,zc));if(s<0&&k===1&&!last){const pl=planeModel("#e53935");pl.scale.setScalar(1.1);pl.position.set(-14,-6,Lz(l0+20));pl.rotation.y=Math.PI;d.add(pl)}});
  if(olen>0){d.add(mesh(GEO.box,"#eef1f5",9.2,.3,olen,0,5.55,oz));for(let l=l0+4;l<gl;l+=8)d.add(mesh(GEO.box,lightMat,3,.05,1.2,0,5.38,Lz(l)))}
  if(glen>0){d.add(mesh(GEO.box,airGlassMat,9.2,.1,glen,0,5.55,gz));d.add(mesh(GEO.box,"#b7bdc9",.14,.12,glen,0,5.55,gz))}
  for(let l=l0+10;l<l1;l+=10)d.add(mesh(GEO.box,"#b7bdc9",9.4,.25,.6,0,5.5,Lz(l)));
  for(let l=l0+10;l<l1;l+=10)[-1,1].forEach(s=>d.add(mesh(GEO.box,"#b7bdc9",.6,5.6,.6,s*4.6,2.8,Lz(l))));
  if(last){const ze=Lz(l1)+.15,R=8.6,CY=3.2,wO=3.3,hO=5.2,white=M("#f4f6fb");
    /* гармошка на стику з літаком */
    for(let q=0;q<5;q++)d.add(mesh(GEO.box,"#3a3f52",9.6-q*.15,.25,.25,0,5.3-q*.05,Lz(l1-2.6+q*.5)));
    [-1,1].forEach(s=>{for(let q=0;q<5;q++)d.add(mesh(GEO.box,"#3a3f52",.25,5.4,.25,s*(4.6-q*.07),2.7,Lz(l1-2.6+q*.5)))});
    /* ніс літака: круглий білий борт з отвором дверей, обідок, фюзеляж-труба назад */
    const sh=new THREE.Shape();sh.absarc(0,CY,R,0,Math.PI*2,false);const hole=new THREE.Path();hole.moveTo(-wO,-.3);hole.lineTo(wO,-.3);hole.lineTo(wO,hO);hole.lineTo(-wO,hO);hole.lineTo(-wO,-.3);sh.holes.push(hole);
    const face=new THREE.Mesh(ownGeo(new THREE.ShapeGeometry(sh,32)),white);face.position.z=ze;d.add(face);
    const rim=new THREE.Mesh(TG(R,.45,8,48),white);rim.position.set(0,CY,ze-.2);d.add(rim);
    const tube=new THREE.Mesh(ownGeo(new THREE.CylinderGeometry(R+.2,R+.2,46,40,1,true)),white);tube.rotation.x=Math.PI/2;tube.position.set(0,CY,ze-23.3);d.add(tube);
    /* смуги ліврії, вікна кабіни пілотів, логотип */
    [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#e53935",R-wO-.1,.55,.12,s*(wO+(R-wO)/2),1.1,ze+.08));d.add(mesh(GEO.box,"#1565c0",R-wO-.3,.3,.12,s*(wO+(R-wO)/2),.35,ze+.08))});
    d.add(mesh(GEO.box,"#3a3f52",8.4,1.7,.08,0,7.25,ze+.06));
    [[-3.0,.22],[-1.0,0],[1.0,0],[3.0,-.22]].forEach(([x,r])=>{const w=mesh(GEO.box,MB("#0e2a4d"),1.85,1.2,.1,x,7.3+Math.abs(x)*-.1,ze+.1);w.rotation.z=r;d.add(w);
      d.add(mesh(GEO.box,MB("#8fc8f0"),.6,.2,.11,x-.35,7.6+Math.abs(x)*-.1,ze+.12))});
    d.add(signBox(tripMat.air,3.4,1.25,0,9.7,ze+.2,.1));
    d.add(mesh(GEO.box,"#c4cdda",wO*2+.3,.25,.4,0,hO,ze+.1));[-1,1].forEach(s=>d.add(mesh(GEO.box,"#c4cdda",.25,hO,.4,s*wO,hO/2,ze+.1)));
    /* відчинені двері літака з круглим віконцем */
    const dr=new THREE.Group();dr.position.set(wO,0,ze+.1);dr.rotation.y=-1.35;dr.add(mesh(GEO.box,"#eef1f5",2.0,5.0,.25,1.0,2.5,0));dr.add(mesh(GEO.cyl,MB("#9fd3ff"),.3,.27,.3,1.0,3.4,0));dr.children[1].rotation.x=Math.PI/2;dr.add(mesh(GEO.box,"#e53935",2.0,.3,.27,1.0,1.1,0));d.add(dr);
    /* крила з двигунами і хвіст — їх видно крізь скляні стіни рукава */
    [-1,1].forEach(s=>{const w=mesh(GEO.box,white,22,.45,7,s*(R+10),1.2,ze-12);w.rotation.y=s*.28;d.add(w);const e=mesh(GEO.cyl,"#c4cdda",1.3,4.5,1.3,s*(R+6),-.4,ze-11);e.rotation.x=Math.PI/2;d.add(e);
      d.add(mesh(GEO.cyl,"#3a3f52",1.0,.1,1.0,s*(R+6),-.4,ze-8.7));d.children[d.children.length-1].rotation.x=Math.PI/2});
    d.add(mesh(GEO.box,"#e53935",.6,8,7,0,CY+R+3.6,ze-40));
    /* під літаком — перон, щоб він не висів у повітрі */
    d.add(mesh(GEO.box,tarmacMat,60,.2,60,0,-6,ze-20))}
  freeze(d);g.add(d)}
function populateJet(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci)*1.2;
  const rows=[];let l=Math.max(l0+5,10);while(l<Math.min(l0+CH-2,44)){rows.push(Lz(l));l+=gap+rand(.5,3)}
  rows.forEach(z=>{const L=rowPick(()=>{const L=[null,null,null],q=Math.random();if(q<.5)L[ri(3)]="low";else{const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"low":"tall"}return L},z);
    rowMark(L,z);L.forEach((c,lane)=>{if(!c)return;spawnObs(g,c==="tall"?"lugcart":pick(["suitcase","bagpile"]),lane,z,ci,0)})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.jet=jetChunk;POP_FN.jet=populateJet;

/* ---------- логіка подорожі: репліки, портали, крапля, засмоктування ---------- */
const tripFlash=document.createElement("div");tripFlash.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .5s";$("#app").appendChild(tripFlash);
let flashT=0;
function flashIn(kind){tripFlash.style.transition="none";
  tripFlash.style.background=kind==="flush"?"radial-gradient(circle at 50% 56%,#f2fdff 0%,#8fdcff 30%,#2a8fe0 62%,#0b3f7a 100%)":"radial-gradient(circle at 50% 50%,#ffffff 0%,#e3fbff 45%,#7ff3ff 100%)";
  tripFlash.style.opacity=1;void tripFlash.offsetWidth;clearTimeout(flashT);flashT=setTimeout(flashOut,1500)}
function flashOut(){clearTimeout(flashT);tripFlash.style.transition="opacity .6s";tripFlash.style.opacity=0}
function tripHint(key,ms){const h=$("#hint");h.textContent=t(key);h.style.opacity=1;clearTimeout(seqHintT);seqHintT=setTimeout(()=>{h.style.opacity=0;seqHintT=setTimeout(()=>{h.textContent=t("hint")},700)},ms||3200)}
/* v66: зрозуміла навігація між епізодами. Повідомлення показує напрямок ДО переходу,
   а не пояснює телепортацію заднім числом. Не залежить від таймерів/частоти кадрів. */
const tripGuide=document.createElement("div");
tripGuide.setAttribute("role","status");tripGuide.setAttribute("aria-live","polite");
tripGuide.style.cssText="position:absolute;left:50%;top:15%;transform:translateX(-50%);width:max-content;max-width:86%;box-sizing:border-box;padding:12px 18px;border-radius:16px;background:rgba(13,29,53,.84);border:1px solid rgba(255,255,255,.28);color:white;font:700 clamp(13px,2.8vw,20px) system-ui,sans-serif;text-align:center;text-shadow:0 1px 3px #17283d;pointer-events:none;z-index:6;opacity:0;transition:opacity .3s";
$("#app").appendChild(tripGuide);
let tripGuideKey="",tripGuideUntil=0;
const TRIP_GUIDES={
  uk:{gate:"✈ ВИХІД A1 → на посадку",jet:"✈ Рукав веде прямо до літака",cabin:"✈ Ти в літаку! Біжи через салон",wc:"🚻 Попереду туалет WC → зайди всередину",suck:"🌀 Унітаз засмоктує котика!",pipe:"💧 Через злив — у водопровідну трубу. Котик став крихітним!",tap:"🚰 Труба виходить у кран над раковиною",hand:"💦 Струмінь води несе котика на долоню",drop:"💧 Крапля підкидає котика на стіл",desk:"🪵 Ти на столі! Попереду ноутбук",port:"💻 USB-C порт → всередину ноутбука",park:"🌳 Котик вибрався з ноутбука до парку"},
  en:{gate:"✈ GATE A1 → board the plane",jet:"✈ This jet bridge leads to the aircraft",cabin:"✈ You're aboard! Run through the cabin",wc:"🚻 Restroom WC ahead → go inside",suck:"🌀 The toilet is pulling the cat in!",pipe:"💧 Down the drain and into a pipe. You're tiny!",tap:"🚰 The pipe leads to a faucet above a sink",hand:"💦 Water carries the cat onto a hand",drop:"💧 A droplet launches the cat onto a desk",desk:"🪵 You're on a desk! Laptop ahead",port:"💻 USB-C port → into the laptop",park:"🌳 The cat emerges into the park"}};
function tripGuideShow(key,now,duration=3.8){
  if(key!==tripGuideKey){tripGuideKey=key;tripGuide.textContent=(TRIP_GUIDES[S.lang]||TRIP_GUIDES.uk)[key]||key;tripGuide.style.opacity=1;tripGuideUntil=now+duration}
}
function tripGuideTick(q){
  if(!q){tripGuide.style.opacity=0;tripGuideKey="";return}
  const {Z,l}=q,k=Z.kind;let msg="";
  if(k==="airport"&&l>AIR_GATE-70)msg="gate";
  else if(k==="jet")msg="jet";
  else if(k==="cabin"&&l<32)msg="cabin";
  else if(k==="cabin"&&l>CABN*CH-52)msg="wc";
  else if(k==="wc"&&l<21)msg="queue";
  else if(k==="wc"&&l<WC_SUCK-10)msg="wc";
  else if(k==="wc")msg="suck";
  else if(k==="pipe"&&l<35)msg="pipe";
  else if(k==="pipe"&&l>PIPEN*CH-50)msg="tap";
  else if(k==="tap"&&l<TAP_OUT)msg="tap";
  else if(k==="tap"&&l<TAP_FLING)msg="hand";
  else if(k==="tap"&&l<TAP_LAND)msg="drop";
  else if(k==="desk"&&l<30)msg="desk";
  else if(k==="desk"&&l>DESK_PORT-50)msg="port";
  if(msg)tripGuideShow(msg,st.t);
  if(st.t>tripGuideUntil)tripGuide.style.opacity=0;
}
/* «земля» в кадрі польоту з крана: падає в долоні, крапля злітає дугою і приземляється на стіл */
function tapPath(l){if(l<TAP_OUT||l>=TAP_LAND)return null;
  if(l<TAP_HAND){const p=(l-TAP_OUT)/(TAP_HAND-TAP_OUT);return -5.5*p*p}
  if(l<TAP_FLING)return -5.5+Math.sin((l-TAP_HAND)/(TAP_FLING-TAP_HAND)*Math.PI)*.35;
  const p=(l-TAP_FLING)/(TAP_LAND-TAP_FLING);return -5.5*(1-p)+28*p*(1-p)}
function tripZone(z){const i=Math.floor(-z/CH);if(i<0)return null;const Z=zoneAt(i);return TRIP_ZONES.has(Z.kind)?{Z,l:-z-Z.c0*CH}:null}
{const g0=seqGround;seqGround=function(z){const q=tripZone(z);if(q&&q.Z.kind==="tap"){const y=tapPath(q.l);if(y!==null)return y}return g0(z)}}
/* у переходах — без бафів і монетних блоків за таймером */
function tripNoSpawn(Z,l){const k=Z.kind;return(k==="airport"&&l>AIR_SEC-14&&l<AIR_SEC+12)||(k==="airport"&&l>AIR_GATE-4)||(k==="jet"&&l>44)||(k==="cabin"&&l<12)||(k==="wc"&&l>14)||(k==="pipe"&&l<14)||k==="tap"||(k==="desk"&&l>DESK_PORT-34)}
{const f=spawnTimed;spawnTimed=function(kind){const zt=st.z-115,i=Math.max(0,Math.floor(-zt/CH)),Z=zoneAt(i);if(tripNoSpawn(Z,-zt-Z.c0*CH))return false;return f(kind)}}
{const r0=seqReset;seqReset=function(){r0();flashOut();tripGuide.style.opacity=0;tripGuideKey="";tripGuideUntil=0;if(dropC)dropC.visible=false;if(dropB)dropB.visible=false;if(boss)boss.scale.setScalar(1);deskFar=null}}
let dropC=null,dropB=null;
const dropMatC=new THREE.MeshBasicMaterial({color:"#9fe6ff",transparent:true,opacity:.38,depthWrite:false});
function tripTick(dt){const q=tripZone(st.z);tripGuideTick(q);st.flyCam=false;
  {const cu=q&&((q.Z.kind==="jet"&&q.l<JETN*CH-9)||(q.Z.kind==="airport"&&q.l>AIRN*CH-8))?1:0;st.camUp=(st.camUp||0)+(cu-(st.camUp||0))*Math.min(1,dt*2.2)}
  {const ck=q&&q.Z.kind==="tap"&&q.l>TAP_OUT-4&&q.l<TAP_FLING+6?1:0;st.camK=(st.camK||0)+(ck-(st.camK||0))*Math.min(1,dt*2.5)}
  /* траволатор: +22% до межі швидкості, на найбільшій швидкості — +12% */
  if(st.boostT>0){st.boostT-=dt;st.topK=(st.topK||1)*(st.runT>70?1.12:1.22)}
  beltTex.offset.y-=dt*1.6;
  /* портали (ELEV з noFall): унітаз і порт ноутбука */
  const s=-st.z,E=ELEV.find(e=>s<e.sD+70);
  if(E&&E.portal&&!E.fallen&&s>=E.sD){E.fallen=true;st.cb=st.lvl||0;
    if(E.portal==="flush"){flashIn("flush");tripGuideShow("pipe",st.t,4);setTimeout(()=>{if(mode==="game"&&st&&st.state==="run"){bossSay(t("bossSmall"),2.4);tripHint("tinyHint",3000)}},900)}
    else{flashIn("port");tripGuideShow("park",st.t,3.5);setTimeout(()=>{if(mode==="game"&&st)tripHint("portHint",3600)},700)}}
  if(!q)return;const{Z,l}=q,key=Z.kind+Z.id;st.tripTold=st.tripTold||{};
  const say=(k,txt,d)=>{if(!st.tripTold[k]){st.tripTold[k]=true;bossSay(t(txt),d||2.3)}};
  if(Z.kind==="airport"&&l>6)say(key,"bossAirport");
  if(Z.kind==="airport"&&l>AIR_SEC-1)say(key+"s","bossScan",2);
  if(Z.kind==="airport"&&l>AIR_GATE+9)say(key+"b","bossBoard",2.2);
  if(Z.kind==="wc"&&l>13&&l<WC_SUCK-8)say(key+"q","bossQueue",1.8);
  if(Z.kind==="cabin"&&l>CAB_UP0-6)say(key,"bossTakeoff",2.6);
  if(Z.kind==="cabin"&&l>CAB_UP0-12&&l<CAB_UP1)st.shake=Math.max(st.shake,l<CAB_UP0+30?.1:.05);
  if(Z.kind==="wc"&&l>WC_SUCK-4)say(key,"bossFlush",2);
  if(Z.kind==="tap"&&l>TAP_HAND)say(key,"bossDrop",2.2);
  if(Z.kind==="desk"&&l>14)say(key,"bossDesk",2.4);
  /* засмоктування: тягне на середню доріжку, спалах ховає перехід у трубу */
  if(Z.kind==="wc"&&l>=WC_SUCK){st.lane=1;st.slide=0;if(l>=WC_GONE&&!st.flushFx){st.flushFx=true;tripGuideShow("suck",st.t,2)}}else st.flushFx=false;
  if(Z.kind==="desk"&&l>=DESK_PORT-3.5&&!st.portFx){st.portFx=true;tripGuideShow("port",st.t,3)}else if(Z.kind!=="desk")st.portFx=false;
  /* політ у краплі: котик іде точно по дузі (земля = дуга), камера — за ним */
  if(Z.kind==="tap"&&l>=TAP_OUT&&l<TAP_LAND){st.y=st.gnd;st.vy=0;st.slide=0;st.flyCam=true;if(!st.splashT||st.t-st.splashT>1){if(l>TAP_HAND-1&&l<TAP_FLING){st.splashT=st.t;splash(st.x,st.z,true);st.shake=.2}}}
  if(Z.kind==="desk"&&l<2.5&&st.lastTap){st.lastTap=false;splash(st.x,st.z,true);st.shake=.25}
  if(Z.kind==="tap"&&l>TAP_FLING)st.lastTap=true}
{const f=seqTick;seqTick=function(dt){f(dt);tripTick(dt)}}
function tripAnim(u,dt){const q=tripZone(st.z);player.scale.setScalar(1);
  if(!dropC){dropC=new THREE.Mesh(GEO.sph,dropMatC);gameScene.add(dropC);dropB=new THREE.Mesh(GEO.sph,dropMatC);gameScene.add(dropB)}
  dropC.visible=false;
  if(!q)return;const{Z,l}=q;
  if(Z.kind==="wc"&&l>=WC_SUCK){const k=Math.min(1,(l-WC_SUCK)/(WC_GONE-WC_SUCK)),e=k*k;
    player.scale.setScalar(Math.max(.04,1-e*.96));player.rotation.y=e*18;player.position.y=st.y-e*1.4;player.position.x=lerp(st.x,0,e);u.armL.rotation.x=u.armR.rotation.x=-2.6;shadow.visible=k<.6}
  if(Z.kind==="tap"&&l>=TAP_OUT&&l<TAP_LAND){const sp=st.t;u.armL.rotation.x=-2.5+Math.sin(sp*9)*.3;u.armR.rotation.x=-2.5-Math.sin(sp*9)*.3;u.legL.rotation.x=-1.2;u.legR.rotation.x=-1.0;
    player.rotation.x=Math.sin(sp*3)*.35;player.rotation.z=Math.sin(sp*2.3)*.25;shadow.visible=false;
    if(l>=TAP_FLING||l<TAP_HAND){dropC.visible=true;const w=1+Math.sin(sp*11)*.05;dropC.scale.set(1.25*w,1.35/w,1.25*w);dropC.position.set(st.x,st.y+.85,st.z)}}}
{const f=seqAnim;seqAnim=function(u,dt){f(u,dt);tripAnim(u,dt)}}
function tripBoss(dt,bu){boss.scale.setScalar(1);if(dropB)dropB.visible=false;const q=tripZone(st.bossZ);if(!q)return;const{Z,l}=q;
  if(Z.kind==="wc"&&l>=WC_SUCK){const k=Math.min(1,(l-WC_SUCK)/(WC_GONE-WC_SUCK)),e=k*k;boss.scale.setScalar(Math.max(.04,1-e*.96));boss.rotation.y=e*16;boss.position.x=lerp(boss.position.x,0,e);boss.position.y-=e*1.4}
  if(Z.kind==="tap"&&(l>=TAP_FLING&&l<TAP_LAND||l>=TAP_OUT&&l<TAP_HAND)&&dropB){dropB.visible=true;dropB.scale.set(1.5,1.7,1.5);dropB.position.set(boss.position.x,boss.position.y+1.1,boss.position.z);bu.armL.rotation.x=-2.6+Math.sin(st.t*12)*.4}}
{const f=seqBoss;seqBoss=function(dt,bu){f(dt,bu);tripBoss(dt,bu)}}

/* v68: зрозуміліші підказки на переходах аеропорт → літак → туалет */
Object.assign(TRIP_GUIDES.uk,{gate:"🎫 ВИХІД A1 — посадка на рейс KA-404",jet:"✈ Рукав веде до літака — забігай у двері!",cabin:"✈ Ти в літаку! Біжи через салон",wc:"🚻 Туалет WC попереду — забігай!",queue:"🚻 Черга до туалету… біжи без черги!"});
Object.assign(TRIP_GUIDES.en,{gate:"🎫 GATE A1 — boarding flight KA-404",jet:"✈ The jet bridge leads to the plane — run in!",cabin:"✈ You're aboard! Run through the cabin",wc:"🚻 Restroom WC ahead — run in!",queue:"🚻 A queue for the restroom… skip it!"});
