/* Локація cafe — перенесено з world.js без змін логіки. */
/* v69: один спільний матеріал пари на всі кавові річки. Раніше кожна річка створювала власний і знищувала його разом
   з відрізком — шейдер пари компілювався заново в кожній кав'ярні (ривок). Цей матеріал також «прогрівається» в меню. */
let CAFE_STEAM=null;
function cafeSteamMat(){return CAFE_STEAM||(CAFE_STEAM=new THREE.ShaderMaterial({
    uniforms:{uTex:{value:steamTex}},
    vertexShader:`attribute float iOpacity; varying vec2 vUv; varying float vOpacity;
      void main(){vUv=uv;vOpacity=iOpacity;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform sampler2D uTex; varying vec2 vUv; varying float vOpacity;
      void main(){vec4 c=texture2D(uTex,vUv);c.a*=vOpacity;if(c.a<=0.001)discard;gl_FragColor=c;}`,
    transparent:true,depthWrite:false,side:THREE.DoubleSide}))}
const CAFE_BULB=[0,1,2,3].map(k=>{const m=new THREE.MeshBasicMaterial({color:"#fff1b0"});m.userData.ph=k*2.37+.5;return m});
/* ================= кав'ярня і події ================= */
/* Кав'ярня з'являється з ~1 км: офіс → вулиця → кав'ярня → офіс…  Зона 240 м (8 відрізків):
   1-й поверх: стільці, столи, собаки, мішки кави, кавова річка (з v55 без плаваючих столів — її оминають).
   75–89 м: сходи нагору на одній доріжці (за бажанням). 89–182 м: 2-й поверх (горище: павутина, павуки, старі коробки, скрині).
   182–196 м: сходи вниз на одній доріжці. Висоти перешкод абсолютні: база 2-го поверху H2. */
const H2=5.4,SL=14,CAFE={};
let hazards=[],evNext=1e9,cafeFullZ=1e9;
function resetWorldState(){for(const k in CAFE)delete CAFE[k];hazards=[];evNext=rand(1000,1100);ZS=[];zCyc=0;bridgeAt=1900;bendReset();waters=[];ROWP=null;cafeFullZ=1e9;BOOSTED.clear()}
const rowGap=ci=>ci<37?Math.max(7.8,11.5-ci*.1):Math.max(7.0,7.8-(ci-37)*.025);
const planeGeo=new THREE.PlaneGeometry(1,1);
function repT(tx,a,b){tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(a,b);return tx}
const woodTex=repT(texOf((x,w,h)=>{const cs=["#c48650","#cf965e","#bd7f4b","#d39c64"];for(let i=0;i<8;i++){x.fillStyle=cs[i%4];x.fillRect(i*16,0,16,h);x.fillStyle="rgba(70,35,10,.35)";x.fillRect(i*16,0,1.5,h);x.fillRect(i*16,(i*37)%h,16,1.5)}
  for(let i=0;i<300;i++){x.fillStyle="rgba(90,45,15,.12)";x.fillRect(Math.random()*w,Math.random()*h,1,4)}},128,128),3,6);
const atticTex=repT(texOf((x,w,h)=>{const cs=["#6e5038","#644830","#76583e","#5c422c"];for(let i=0;i<8;i++){x.fillStyle=cs[i%4];x.fillRect(i*16,0,16,h);x.fillStyle="rgba(20,10,5,.5)";x.fillRect(i*16,0,2,h);x.fillRect(i*16,(i*53)%h,16,2)}
  for(let i=0;i<400;i++){x.fillStyle=Math.random()<.5?"rgba(200,190,170,.12)":"rgba(20,10,5,.15)";x.fillRect(Math.random()*w,Math.random()*h,2,2)}},128,128),3,6);
const brickTex=repT(texOf((x,w,h)=>{x.fillStyle="#e7c9a8";x.fillRect(0,0,w,h);const cs=["#b85c3c","#c4683f","#a9533a","#bf6446"];
  for(let r=0;r<4;r++)for(let q=-1;q<4;q++){x.fillStyle=cs[(r*3+q+4)%4];x.fillRect(q*32+(r%2?16:0)+2,r*16+2,28,12)}},128,64),12,6);
const awningTex=texOf((x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?"#fff4e0":"#e53935";x.fillRect(i*16,0,16,h)}},128,32);
/* v62: вивіска над тротуаром — «БЕЗ ПРЕМІЇ» (було «−50%», гравцям було незрозуміло); перемальовується при зміні мови */
const saleCv=cnv(256,128),saleTex=new THREE.CanvasTexture(saleCv[0]);
function drawSale(){const x=saleCv[1],w=256,h=128;x.fillStyle="#ffc531";x.fillRect(0,0,w,h);x.fillStyle="#e53935";x.fillRect(0,0,w,14);x.fillRect(0,h-14,w,14);
  x.fillStyle="#1c2445";fitText(x,t("saleSign"),230,44,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(t("saleSign"),w/2,h/2+3);saleTex.needsUpdate=true}
drawSale();{const ds0=drawSigns;drawSigns=function(){ds0();drawSale()}}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawSale);
const tileTex=repT(texOf((x,w,h)=>{x.fillStyle="#bfc5d1";x.fillRect(0,0,w,h);x.fillStyle="#aab1c0";for(let r=0;r<4;r++)for(let q=0;q<4;q++)if((r+q)%2)x.fillRect(q*16,r*16,16,16);
  x.strokeStyle="#8d95a7";x.lineWidth=1.5;for(let i=0;i<=64;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.moveTo(0,i);x.lineTo(64,i);x.stroke()}},64,64),2,20);
const chalkTex=texOf((x,w,h)=>{x.fillStyle="#2c3a33";x.fillRect(0,0,w,h);x.strokeStyle="#8a5a34";x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);
  x.fillStyle="#f4f1e8";x.font="900 30px Arial Black, sans-serif";x.textAlign="center";x.fillText("COFFEE",w/2,48);
  x.strokeStyle="rgba(244,241,232,.85)";x.lineWidth=3;for(let i=0;i<4;i++){x.beginPath();x.moveTo(30,80+i*24);x.lineTo(150,80+i*24);x.stroke();x.beginPath();x.arc(200,78+i*24,7,0,7);x.stroke()}
  x.fillStyle="#ffc531";x.beginPath();x.arc(214,40,10,0,7);x.fill()},256,192);
const webTex=texOf((x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.92)";x.lineWidth=2;const cx=w/2,cy=h/2;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*w,cy+Math.sin(a)*h);x.stroke()}
  for(let r=8;r<w*.72;r+=11){x.beginPath();for(let i=0;i<=12;i++){const a=i/12*Math.PI*2,rr=r*(i%2?1.06:.96);const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}},128,128);
const riverTex=repT(texOf((x,w,h)=>{x.fillStyle="#6e3b1c";x.fillRect(0,0,w,h);for(let i=0;i<26;i++){x.strokeStyle=i%3?"rgba(214,160,102,.55)":"rgba(255,226,180,.45)";x.lineWidth=rand(2,5);
  const y0=Math.random()*h;x.beginPath();x.moveTo(0,y0);x.bezierCurveTo(w*.3,y0-rand(-14,14),w*.7,y0+rand(-14,14),w,y0);x.stroke()}},64,128),1,6);
const steamTex=texOf((x)=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,"rgba(255,255,255,.9)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128)},128,128);
const talkTex=texOf((x)=>{x.fillStyle="#fff";x.beginPath();x.ellipse(64,54,58,40,0,0,7);x.fill();x.beginPath();x.moveTo(40,86);x.lineTo(30,118);x.lineTo(62,90);x.fill();
  x.fillStyle="#1c2445";[38,64,90].forEach(cx=>{x.beginPath();x.arc(cx,54,8,0,7);x.fill()})},128,128);
const woodMat=new THREE.MeshToonMaterial({map:woodTex,gradientMap:grad}),atticMat=new THREE.MeshToonMaterial({map:atticTex,gradientMap:grad});
const brickMat=new THREE.MeshToonMaterial({map:brickTex,gradientMap:grad}),awningMat=new THREE.MeshToonMaterial({map:awningTex,gradientMap:grad});
const saleMat=new THREE.MeshBasicMaterial({map:saleTex}),tileMat=new THREE.MeshToonMaterial({map:tileTex,gradientMap:grad}),puddleMat=new THREE.MeshBasicMaterial({color:"#9fd3ff",transparent:true,opacity:.75});
const chalkMat=new THREE.MeshBasicMaterial({map:chalkTex}),webMat=new THREE.MeshBasicMaterial({map:webTex,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide});
const riverMat=new THREE.MeshToonMaterial({map:riverTex,gradientMap:grad,emissive:"#3a1a08"}),creamMat=M("#f6ead6");

/* plan of one cafe zone: stair lanes and coffee rivers */
function cafePlan(Z){const zi=Z.id;if(CAFE[zi])return CAFE[zi];const Z0=-Z.c0*CH;
  const P={zi,Z0,lu:ri(3),ld:ri(3),zU0:Z0-75,zU1:Z0-89,zD0:Z0-182,zD1:Z0-196,rivers:[],told:false,g3:Math.random()<.5?rand(112,165):0,g3lane:ri(3)};
  /* річку будує відрізок, де вона закінчується, щоб вона не зникла, поки котик ще біжить по ній */
  const addR=(a,len,not)=>{let lane=ri(3);if(lane===not)lane=(lane+1+ri(2))%3;const b=a+len;P.rivers.push({lane,x:LX[lane],a,b,zN:Z0-a,zF:Z0-b,ci:Z.c0+Math.floor((b-1)/CH)})};
  addR(33,rand(30,40),P.lu);if(Math.random()<.75)addR(118,rand(32,45));if(Math.random()<.55)addR(200,rand(28,36),P.ld);
  CAFE[zi]=P;return P}
function planAt(z){const i=Math.floor(-z/CH);if(i<0)return null;const Z=zoneAt(i);return Z.kind==="cafe"?CAFE[Z.id]||null:null}
/* building ground under the cat: stairs and the 2nd floor (0 = floor 1) */
function structAt(x,z,y,keep){const P=planAt(z);if(!P)return 0;const tol=keep?1.3:.75;let g=0;
  if(z<=P.zU1&&z>=P.zD0&&y>=H2-tol)g=H2;
  if(Math.abs(x-LX[P.lu])<1.0&&z<=P.zU0&&z>=P.zU1){const h=(P.zU0-z)/SL*H2;if(y>=h-tol)g=Math.max(g,h)}
  if(Math.abs(x-LX[P.ld])<1.0&&z<=P.zD0&&z>=P.zD1){const h=(z-P.zD1)/SL*H2;if(y>=h-tol)g=Math.max(g,h)}
  return g}
/* bumping into the solid side of the stairs */
function structHit(x,z,bottom,top){const P=planAt(z);if(!P)return false;
  const chk=(lane,h)=>Math.abs(x-LX[lane])<.9&&bottom<h-.75&&(h<2.5||top>h-.3);
  if(z<=P.zU0&&z>=P.zU1&&chk(P.lu,(P.zU0-z)/SL*H2))return true;
  if(z<=P.zD0&&z>=P.zD1&&chk(P.ld,(z-P.zD1)/SL*H2))return true;
  return false}
function cafeTick(){const P=planAt(st.z-60);if(P&&!P.told&&st.z>P.zU0&&st.z-P.zU0<70){P.told=true;toast(t("stairsAhead"))}}
function cafeAnim(dt){riverTex.offset.y+=dt*.5}

/* ---------- cafe obstacles ---------- */
function dogModel(stand){const g=new THREE.Group(),c=pick(["#c8894e","#e8d3b0","#6b4a32","#f4f4f4","#34343c"]),dk=shade(c,-.3),u={};
  if(stand){g.add(mesh(GEO.sph,c,.46,.26,.24,.0,.66,0));
    u.legs=[[.28,1],[.28,-1],[-.28,1],[-.28,-1]].map(([lx,lz])=>{const p=new THREE.Group();p.position.set(lx,.52,lz*.13);p.add(mesh(GEO.cyl,c,.06,.48,.06,0,-.24,0));p.add(mesh(GEO.sph,dk,.08,.05,.09,.03,-.48,0));g.add(p);return p})}
  else{g.add(mesh(GEO.sph,c,.48,.19,.27,0,.2,0));[-1,1].forEach(s=>g.add(mesh(GEO.sph,c,.18,.07,.08,.5,.06,s*.12)))}
  const head=new THREE.Group();head.position.set(stand?.5:.55,stand?.9:.36,0);g.add(head);u.head=head;
  head.add(mesh(GEO.sph,c,.2,.19,.19));head.add(mesh(GEO.sph,shade(c,.15),.12,.09,.11,.17,-.05,0));head.add(mesh(GEO.sph,"#1c1c24",.04,.035,.04,.28,-.02,0));
  [-1,1].forEach(s=>{head.add(mesh(GEO.sph,"#15151c",.03,.035,.025,.12,.06,s*.1));const e=mesh(GEO.sph,dk,.06,.14,.04,-.02,-.02,s*.19);e.rotation.x=s*.3;head.add(e)});
  head.add(mesh(GEO.sph,"#ff7b8a",.05,.02,.04,.2,-.14,0));
  g.add(mesh(GEO.cyl,"#e53935",.11,.05,.11,stand?.42:.45,stand?.8:.3,0));
  const tail=new THREE.Group();tail.position.set(stand?-.44:-.47,stand?.74:.2,0);g.add(tail);u.tail=tail;tail.add(mesh(GEO.cyl,c,.04,.32,.04,0,.14,0));tail.rotation.z=stand?.7:1.3;
  g.userData=u;return mergeRig(g,[u.head,u.tail].concat(u.legs||[]))}
function spiderModel(){const g=new THREE.Group(),legs=[];
  g.add(mesh(GEO.sph,"#2e2e38",.3,.26,.34,0,.02,-.18));g.add(mesh(GEO.sph,"#ff4b3e",.12,.05,.18,0,.26,-.2));g.add(mesh(GEO.sph,"#24242c",.19,.17,.19,0,0,.16));
  [-1,1].forEach(s=>{g.add(mesh(GEO.sph,"#ffffff",.07,.07,.04,s*.08,.07,.32));g.add(mesh(GEO.sph,"#15151c",.035,.035,.02,s*.08,.07,.355));
    for(let k=0;k<4;k++){const L=new THREE.Group();L.position.set(s*.12,0,.14-k*.11);L.rotation.y=s*(k-1.5)*.35;
      const up=mesh(GEO.box,"#24242c",.34,.045,.045,s*.17,.1,0);up.rotation.z=s*.5;L.add(up);const dn=mesh(GEO.box,"#24242c",.045,.36,.045,s*.33,-.06,0);dn.rotation.z=s*.25;L.add(dn);g.add(L);legs.push(L)}});
  g.userData.legs=legs;return mergeRig(g,legs)}
function courierModel(){const g=new THREE.Group(),uni="#ff8a1f",skin=pick(SKINS),u={};
  const leg=x=>{const p=new THREE.Group();p.position.set(x,.86,0);p.add(mesh(GEO.cyl,"#2a3048",.12,.84,.12,0,-.42,0));p.add(mesh(GEO.box,"#1d1d24",.17,.1,.3,0,-.84,-.05));g.add(p);return p};
  u.legL=leg(-.15);u.legR=leg(.15);
  g.add(mesh(GEO.box,uni,.74,.84,.44,0,1.28,0));g.add(mesh(GEO.box,"#ffd21f",.76,.08,.46,0,1.1,0));
  const head=new THREE.Group();head.position.y=1.95;g.add(head);head.add(mesh(GEO.sph,skin,.27,.29,.27));
  head.add(mesh(GEO.sph,uni,.29,.14,.29,0,.14,0));head.add(mesh(GEO.box,uni,.3,.03,.22,0,.12,-.3));
  [-1,1].forEach(s=>{head.add(mesh(GEO.sph,"#15151c",.04,.05,.03,s*.09,.02,-.25));g.add(mesh(GEO.box,uni,.13,.13,.5,s*.36,1.42,-.25))});
  let y=1.3;[["#c9935a",.5],["#d6a066",.38],["#c08850",.3]].forEach(([c,h],k)=>{const b=mesh(GEO.box,c,.62-k*.06,h,.46,0,y+h/2,-.55);b.rotation.y=(k-1)*.12;g.add(b);g.add(mesh(GEO.box,"#e8c48a",.64-k*.06,.05,.1,0,y+h,-.55));y+=h});
  g.userData=u;return mergeRig(g,[u.legL,u.legR])}
Object.assign(OD,{cchair:{half:.36,ymin:0,ymax:.95,top:.56},ctable:{half:.55,ymin:0,ymax:.8,top:.82},bags:{half:.5,ymin:0,ymax:.95,top:.97},
  /* v55: зони собак і павуків розширено до розміру моделі, щоб удар збоку теж зараховувався */
  dogL:{half:.55,ymin:0,ymax:.5},dogR:{half:.4,hx:.95,ymin:0,ymax:.85},
  webL:{half:.15,ymin:0,ymax:.85,soft:true},webH:{half:.15,ymin:1.12,ymax:2.9,soft:true},
  spiderD:{half:.5,hx:.95,ymin:0,ymax:.7},spiderC:{half:.5,hx:.85,ymin:0,ymax:.45},oldbox:{half:.45,ymin:0,ymax:.98,top:.98},trunk:{half:.4,ymin:0,ymax:.78,top:.8},
  rail:{half:.15,ymin:0,ymax:2.6},courier:{half:.4,ymin:0,ymax:2.1}});
Object.assign(OB,{
  cchair(){const g=new THREE.Group(),w=pick(["#7a4a2a","#2a3048","#c0392b","#2f7d5b"]);g.add(mesh(GEO.cyl,w,.3,.06,.3,0,.52,0));
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.78;g.add(mesh(GEO.cyl,"#3a2a20",.03,.52,.03,Math.sin(a)*.2,.26,Math.cos(a)*.2))}
    [-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#3a2a20",.03,.3,.03,s*.2,.68,.24)));const back=new THREE.Mesh(TG(.2,.035,6,16,Math.PI),M("#3a2a20"));back.position.set(0,.8,.24);g.add(back);
    g.add(mesh(GEO.box,w,.36,.1,.04,0,.86,.24));g.rotation.y=rand(-.5,.5)+(Math.random()<.5?0:Math.PI);return g},
  ctable(){const g=new THREE.Group(),c=pick(["#f4f6fb","#d9b38c","#3a3f52","#e9d8c4"]);g.add(mesh(GEO.cyl,c,.58,.05,.58,0,.78,0));g.add(mesh(GEO.cyl,"#2a2a30",.6,.02,.6,0,.755,0));
    g.add(mesh(GEO.cyl,"#2a2a30",.05,.74,.05,0,.38,0));g.add(mesh(GEO.cyl,"#2a2a30",.3,.04,.3,0,.02,0));
    g.add(mesh(GEO.cyl,"#ffffff",.12,.015,.12,.22,.81,.12));g.add(mesh(GEO.cyl,"#ffffff",.07,.1,.07,.22,.86,.12));g.add(mesh(GEO.cyl,"#6b3e22",.06,.01,.06,.22,.91,.12));return g},
  bags(){const g=new THREE.Group(),sk=["#b48a5a","#a87d4f","#c29a6a"];for(let k=0;k<3;k++)g.add(mesh(GEO.sph,sk[k],.3,.22,.36,(k-1)*.34,.22,0));
    for(let k=0;k<2;k++)g.add(mesh(GEO.sph,sk[(k+1)%3],.3,.21,.34,(k-.5)*.36,.6,.03));g.add(mesh(GEO.sph,sk[0],.28,.18,.32,0,.82,0));
    g.add(mesh(GEO.box,"#5a2f17",.22,.14,.02,0,.24,.35));g.add(mesh(GEO.box,"#fff4e0",.08,.06,.025,0,.25,.355));
    for(let k=0;k<7;k++)g.add(mesh(GEO.sph,"#4a2510",.04,.025,.03,rand(-.6,.6),.02,rand(.35,.65)));return g},
  dogL(){const g=dogModel(false);if(Math.random()<.5)g.rotation.y=Math.PI;return g},
  dogR(){return dogModel(true)},
  webL(){const g=new THREE.Group(),w=new THREE.Mesh(planeGeo,webMat);w.scale.set(2.1,.95,1);w.position.y=.45;g.add(w);[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#8a6a52",.04,1.0,.04,s*1.08,.5,0)));return g},
  webH(){const g=new THREE.Group(),w=new THREE.Mesh(planeGeo,webMat);w.scale.set(2.2,1.75,1);w.position.y=2.05;g.add(w);[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#e9eef7",.008,2.3,.008,s*.9,4.05,0)));
    const sp=spiderModel();sp.scale.setScalar(.45);sp.position.set(.3,2.3,.05);g.add(sp);return g},
  spiderD(){const g=new THREE.Group(),sp=spiderModel();sp.scale.setScalar(1.25);sp.position.y=1.4;g.add(sp);const th=mesh(GEO.cyl,"#e9eef7",.012,1,.012,0,3,0);g.add(th);g.userData={sp,th,legs:sp.userData.legs};return g},
  spiderC(){const g=new THREE.Group(),sp=spiderModel();sp.scale.setScalar(.9);sp.position.y=.22;g.add(sp);g.userData={legs:sp.userData.legs};return g},
  oldbox(){const g=new THREE.Group();g.add(mesh(GEO.box,"#9c8468",.9,.55,.7,0,.28,0));g.add(mesh(GEO.box,"#b8a488",.92,.06,.12,0,.56,0));
    const b=mesh(GEO.box,"#8a7458",.6,.42,.5,.08,.77,-.05);b.rotation.y=.3;g.add(b);const w=new THREE.Mesh(planeGeo,webMat);w.scale.set(.6,.5,1);w.position.set(-.3,.75,.37);g.add(w);return g},
  trunk(){const g=new THREE.Group();g.add(mesh(GEO.box,"#7a4a2a",.95,.5,.62,0,.25,0));const lid=mesh(GEO.cyl,"#8a5a34",.31,.95,.31,0,.5,0);lid.rotation.z=Math.PI/2;g.add(lid);
    [-.3,.3].forEach(x=>{g.add(mesh(GEO.box,"#d4a017",.06,.52,.64,x,.26,0));const b=mesh(GEO.cyl,"#d4a017",.32,.06,.32,x,.5,0);b.rotation.z=Math.PI/2;g.add(b)});g.add(mesh(GEO.box,"#d4a017",.12,.14,.03,0,.42,.32));return g},
  rail(){const g=new THREE.Group(),p=new THREE.Mesh(GEO.box,glassMat);p.scale.set(2.15,2.4,.06);p.position.y=1.25;g.add(p);
    [2.48,.05].forEach(y=>g.add(mesh(GEO.box,"#7a4a2a",2.25,.1,.14,0,y,0)));[-1,1].forEach(s=>g.add(mesh(GEO.box,"#7a4a2a",.1,2.5,.14,s*1.08,1.25,0)));g.add(mesh(GEO.box,"#ff4b3e",1.6,.12,.07,0,1.3,.03));return g},
  courier(){const g=courierModel();g.rotation.y=Math.PI;return g}
});

/* ---------- coffee river (до v55 по ній пливли перевернуті столи; spawnRaft лишився, але не викликається) ---------- */
function spawnRaft(g,ci,R,z){const m=new THREE.Group(),c=pick(["#e9d8c4","#d9b38c","#f4f6fb"]);
  m.add(mesh(GEO.box,c,1.45,.12,1.45,0,.24,0));m.add(mesh(GEO.box,shade(c,-.2),1.45,.06,1.45,0,.15,0));
  [-1,1].forEach(a=>[-1,1].forEach(b=>m.add(mesh(GEO.cyl,"#7a4a2a",.05,.7,.05,a*.62,.65,b*.62))));m.add(mesh(GEO.cyl,"#a86a3c",.85,.01,.85,0,.08,0));mergeStatic(m);
  m.position.set(R.x,0,z);g.add(m);
  obstacles.push({m,type:"raft",x:R.x,half:.75,top:.32,ymin:-9,ymax:-9,chunk:ci,dead:false,vy:0,spin:0,by:0,raft:{zN:R.zN,zF:R.zF,v:rand(1.6,2.4)}})}
function riverBuild(g,ci,R){const len=R.zN-R.zF,zc=(R.zN+R.zF)/2,x=R.x,d=new THREE.Group();
  const liq=new THREE.Mesh(planeGeo,riverMat);liq.rotation.x=-Math.PI/2;liq.scale.set(2.0,len,1);liq.position.set(x,.03,zc);d.add(liq);
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#e9eef2",.16,.1,len+.3,x+s*1.08,.05,zc)));[R.zN,R.zF].forEach(z=>d.add(mesh(GEO.box,"#e9eef2",2.32,.1,.16,x,.05,z)));
  const top=R.a>89&&R.a<182?5.14:10.6,sg=new THREE.Mesh(GEO.box,faced(hotMat,"#3a3f52",4));sg.scale.set(1.5,.75,.06);sg.position.set(x,3.1,R.zN+.4);d.add(sg);
  [-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#3a3f52",.015,top-3.45,.015,x+s*.6,(top+3.45)/2,R.zN+.4)));
  freeze(d);g.add(d);hazards.push({chunk:ci,x,zN:R.zN,zF:R.zF});
  /* густа пара: клуби піднімаються, ростуть і тануть; кожен клуб у своєму місці річки */
  /* v32: пара одним draw call замість окремого Sprite на кожен клуб.
     Окрема прозорість збережена для кожного клубу, як у v31. */
  const nS=Math.round(len/1.6),sts=[];
  const steamGeo=ownGeo(new THREE.PlaneGeometry(1,1));
  steamGeo.setAttribute("iOpacity",new THREE.InstancedBufferAttribute(new Float32Array(nS),1));
  const steamMat=cafeSteamMat();
  const steam=new THREE.InstancedMesh(steamGeo,steamMat,nS);
  steam.frustumCulled=false;g.add(steam);
  const tmp=new THREE.Object3D();
  for(let k=0;k<nS;k++){const zz=R.zF+(k+.5)/nS*len;
    sts.push({ph:Math.random(),x0:x+rand(-.7,.7),z:zz,sp:rand(.35,.55)})}
  anims.push({chunk:ci,z:zc,far:len/2,f:t=>{
    const facing=gameCam.quaternion,opacity=steamGeo.attributes.iOpacity;
    for(let j=0;j<sts.length;j++){
      const q=sts[j],k=(t*q.sp+q.ph)%1;
      tmp.position.set(q.x0+Math.sin(t*1.3+q.ph*9)*.25*k,.15+k*2.7,q.z);
      tmp.quaternion.copy(facing);tmp.scale.setScalar(.6+k*1.9);
      tmp.updateMatrix();steam.setMatrixAt(j,tmp.matrix);
      opacity.setX(j,Math.sin(Math.min(1,k*1.3)*Math.PI)*.62);
    }
    steam.instanceMatrix.needsUpdate=true;opacity.needsUpdate=true;
  }});
  /* v55: столів-плотів і монет над річкою більше немає — річку треба оминати сусідньою доріжкою */
}

/* ---------- cafe rows ---------- */
function coinsBetween(g,ci,rows,zEnd,by,skipX,always){
  for(let k=0;k<rows.length;k++){const a=rows[k]-2.2,b=(k+1<rows.length?rows[k+1]:zEnd)+2.2;const len=a-b;if(len<3)continue;
    let lane=ri(3);if(skipX!==undefined&&LX[lane]===skipX)lane=(lane+1)%3;const x=LX[lane],r=Math.random();
    if(r<.035&&boostTake(ci))addPickup(g,ci,pick(["coffee","coffee","bed","bed","laptop"]),x,(a+b)/2,by);
    else{const fit=[3,5,10].filter(n=>(n-1)*1.4<=len);if(!fit.length)continue;const n=!always&&fit.length>1&&Math.random()<.35?fit[fit.length-2]:fit[fit.length-1];
      const s0=a-(len-(n-1)*1.4)/2;for(let q=0;q<n;q++)addCoin(g,ci,x,.8+by,s0-q*1.4)}}}
function populateCafe(g,ci,z0){
  const Z=zoneAt(ci),P=cafePlan(Z),k=ci-Z.c0,l0=k*CH,Lz=l=>P.Z0-l,gap=rowGap(ci);
  /* floor 1 */
  /* v61: на 5% менше рядів перешкод на обох поверхах */
  const rows=[];let l=k===0?l0+12:l0+5;while(l<l0+CH-2){if(keepRow(P,"rk1",.95))rows.push(l);l+=gap*1.45+rand(0,2.5)}
  const used=[];
  rows.forEach(rl=>{if(rl>174&&rl<202)return;const z=Lz(rl);used.push(z);
    const R=P.rivers.find(R=>rl>R.a-2&&rl<R.b+2),nearUp=rl>56&&rl<91;
    const L=[0,1,2].filter(q=>!(R&&q===R.lane)&&!(nearUp&&q===P.lu)).sort(()=>Math.random()-.5);
    if(!R&&!nearUp&&Math.random()<.13){const o=spawnObs(g,"dogR",1,z,ci,0);o.pp={p0:rand(0,9),v:rand(2.6,3.4),rot:0};return}
    const r=Math.random();let n=r<.6?1:r<.95?2:3;
    if(L.length<3)n=Math.min(n,L.length-(nearUp&&!(R&&R.lane===P.lu)?0:1));
    /* v55: два ряди поспіль без вільної доріжки не ставимо (на середній швидкості два стрибки поспіль майже неможливі) */
    if(n>=3&&cafeFullZ-z<=16)n=2;if(n>=3)cafeFullZ=z;
    for(let j=0;j<n;j++){const ty=pick(["cchair","cchair","ctable","ctable","bags","bags","dogL","dogL"]),o=spawnObs(g,ty,L[j],z,ci,0);
      if(ty==="dogL"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{u.tail.rotation.y=Math.sin(t*7+ph)*.7;u.head.rotation.z=Math.sin(t*1.3+ph)*.12}})}}});
  const rv=P.rivers.find(R=>R.ci===ci),rvs=P.rivers.find(R=>R.a<l0+CH+2&&R.b>l0-2);
  coinsBetween(g,ci,used,z0-CH-3,0,rvs?rvs.x:undefined,false);
  if(rv)riverBuild(g,ci,rv);
  /* floor 2 */
  const a=Math.max(l0,96),b=Math.min(l0+CH,175);
  if(a<b){let q=a+rand(2,5);const r2=[];while(q<b){if(keepRow(P,"rk2",.95))r2.push(Lz(q));q+=Math.max(20,gap*2.6)+rand(.5,3)}
    r2.forEach(z=>{const r=Math.random();
      if(r<.12){const o=spawnObs(g,"spiderC",1,z,ci,0,H2);o.pp={p0:rand(0,9),v:rand(2.2,3),rot:Math.PI/2};return}
      const lanes=[0,1,2].sort(()=>Math.random()-.5),n=r<.94?1:2;
      for(let j=0;j<n;j++){const ty=pick(["webL","webH","spiderD","oldbox","oldbox","trunk","trunk"]),o=spawnObs(g,ty,lanes[j],z,ci,0,H2);
        if(ty==="webL"||ty==="webH")o.web=true;if(ty==="spiderD")o.bob={p0:rand(0,6)}}});
    coinsBetween(g,ci,r2,Lz(b)-1,H2,undefined,true);
    /* унікальний баф горища: 3 кристали за раз (у половині кав'ярень) */
    if(P.g3&&P.g3>=a&&P.g3<b){const z=Lz(P.g3);clearArea(z+3,z-3,[P.g3lane],H2);addPickup(g,ci,"gem3",LX[P.g3lane],z,H2)}}
  if(l0<=178&&178<l0+CH)[0,1,2].filter(q=>q!==P.ld).forEach(q=>spawnObs(g,"rail",q,Lz(178),ci,0,H2));
}

/* ---------- v61: декор, щоб кав'ярню впізнавали з першого погляду ----------
   Великі вивіски «КАВ'ЯРНЯ» на стінах, смугасті маркізи над вікнами, великі чашки з парою на полицях,
   гірлянди з кавових зерен і лампочок під стелею (лише там, де немає горища). Усе поза доріжками. */
const beanGeo=new THREE.SphereGeometry(1,6,4);
function bigCup(d,s,x,y,z){const c=pick(["#e53935","#2f6fed","#22b066","#ffc531","#ff7fae"]);
  d.add(mesh(GEO.box,"#6b3e22",.5,.08,1.5,x+s*.05,y-.06,z));
  d.add(mesh(GEO.cyl,"#f7f3ec",.75,.06,.75,x-s*.35,y+.03,z));
  d.add(mesh(GEO.cyl,"#ffffff",.5,.7,.5,x-s*.35,y+.41,z));d.add(mesh(GEO.cyl,c,.505,.16,.505,x-s*.35,y+.45,z));
  d.add(mesh(GEO.cyl,"#5a3018",.44,.02,.44,x-s*.35,y+.77,z));d.add(mesh(GEO.cyl,"#d9b38c",.2,.022,.2,x-s*.35,y+.775,z));
  const h=new THREE.Mesh(TG(.2,.06,6,14),M("#ffffff"));h.position.set(x-s*.35,y+.42,z+.55);d.add(h);
  [[0,1.05,.12],[.1,1.35,.16],[-.06,1.65,.13]].forEach(([dx,dy,r])=>d.add(mesh(beanGeo,"#f4f6fb",r,r*1.2,r,x-s*.35+dx,y+dy,z)))}
function beanGarland(d,z,y){for(let k=0;k<=26;k++){const x=-6.5+k*.5,sag=.7*(1-Math.pow(x/6.5,2)),yy=y-sag;
    if(k%2)d.add(mesh(beanGeo,MB(pick(["#fff1b0","#ffd27a","#fff4c9"])),.09,.09,.09,x,yy-.08,z));
    else{const b=mesh(beanGeo,"#5a3018",.13,.09,.1,x,yy,z);b.rotation.z=.4;d.add(b)}}
  d.add(mesh(GEO.box,"#2a2a30",13,.02,.02,0,y-.35,z))}
function cafeDecor(d,_,k,l0,l1,Lz){
  [-1,1].forEach(s=>{const dir=s<0?0:1;
    for(let q=0;q<3;q++){const aw=new THREE.Mesh(GEO.box,awningMat);aw.scale.set(.95,.07,4.7);aw.position.set(s*6.28,4.35,Lz(l0+5+q*10));aw.rotation.z=s*.45;d.add(aw);
      d.add(mesh(GEO.box,"#e53935",.06,.22,4.7,s*5.86,4.12,Lz(l0+5+q*10)))}
    /* вивіска-«прапорець» поперек стіни: її видно прямо перед собою, а не збоку */
    if((k+(s>0?1:0))%2===0){const z=Lz(l0+20),sg=new THREE.Mesh(GEO.box,faced(cafeMat,"#3a2418",4));sg.scale.set(1.9,.71,.08);sg.position.set(s*5.6,4.05,z);d.add(sg);
      d.add(mesh(GEO.box,"#2a2a30",1.5,.05,.05,s*5.95,4.55,z));[-.7,.7].forEach(e=>d.add(mesh(GEO.cyl,"#2a2a30",.012,.15,.012,s*5.6+e,4.48,z)));
      [-1,1].forEach(e=>d.add(mesh(GEO.sph,MB("#fff1b0"),.06,.06,.06,s*5.6+e*1.02,4.05,z+.05)))}
    else bigCup(d,s,s*6.62,3.5,Lz(l0+20));
    bigCup(d,s,s*6.62,3.5,Lz(l0+10))});
  [10,20].forEach(q=>{const l=l0+q;if(l<86||l>186)beanGarland(d,Lz(l),7.4)})}
/* ---------- cafe building ---------- */
function stairsVis(d,lane,zA,up){const x=LX[lane],n=16,run=SL/n,rise=H2/n,ang=Math.atan2(H2,SL),Lg=Math.hypot(H2,SL);
  for(let k=0;k<n;k++){const zc=zA-(k+.5)*run,h=up?(k+1)*rise:H2-k*rise;
    if(h<2.6)d.add(mesh(GEO.box,"#5a3a26",2.0,h,run+.01,x,h/2,zc));
    d.add(mesh(GEO.box,"#8a5a34",2.04,.1,run+.02,x,h-.05,zc));d.add(mesh(GEO.box,"#d6a066",2.04,.03,.08,x,h-.005,zc+(up?run/2:-run/2)*.9));
    if(k%2===0)[-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#3a2418",.03,1.0,.03,x+s*1.06,h+.5,zc)))}
  [-1,1].forEach(s=>{const sg=mesh(GEO.box,"#5a3a26",.12,.45,Lg,x+s*1.06,H2/2,zA-SL/2);sg.rotation.x=up?ang:-ang;d.add(sg);
    const hr=mesh(GEO.box,"#3a2418",.08,.08,Lg,x+s*1.06,H2/2+1.0,zA-SL/2);hr.rotation.x=up?ang:-ang;d.add(hr)});
  const sg=new THREE.Mesh(GEO.box,faced(up?upMat:downMat,"#2a3048",4));sg.scale.set(1.7,.85,.08);
  const sy=up?3.3:H2+3.3,sz=up?zA+.6:zA+8;sg.position.set(x,sy,sz);d.add(sg);
  [-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#2a2a30",.012,10.6-sy-.4,.012,x+s*.6,(10.6+sy+.4)/2,sz)))}
function cafeSeat(d,g,s,z,ci){const tx=s*4.75;
  d.add(mesh(GEO.cyl,"#f4f6fb",.5,.05,.5,tx,.78,z));d.add(mesh(GEO.cyl,"#2a2a30",.05,.74,.05,tx,.38,z));d.add(mesh(GEO.cyl,"#2a2a30",.28,.04,.28,tx,.02,z));
  d.add(mesh(GEO.cyl,"#ffffff",.07,.1,.07,tx+s*.15,.86,z-.1));d.add(mesh(GEO.cyl,"#6b3e22",.06,.01,.06,tx+s*.15,.91,z-.1));
  if(Math.random()<.5)d.add(mesh(GEO.cyl,"#f7c8d8",.12,.1,.12,tx-s*.1,.86,z+.15));
  const w=seatedWorker(),r=s*Math.PI/2;w.position.set(s*5.6,0,z);w.rotation.y=r;g.add(w);lookers.push({head:w.userData.head,x:s*5.6,z,r,chunk:ci});
  const[aL,aR]=w.userData.arms,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{aL.rotation.x=.55;aR.rotation.x=.55-Math.max(0,Math.sin(t*.8+ph))*1.6}})}
function cafeCounter(d,g,s,z,ci){const x=s*5.55;
  d.add(mesh(GEO.box,"#6b3e22",1.2,1.1,8.6,x,.55,z));d.add(mesh(GEO.box,"#e9d8c4",1.35,.08,8.8,x,1.14,z));d.add(mesh(GEO.box,"#c9935a",.04,.8,8.4,x-s*.61,.55,z));
  d.add(mesh(GEO.box,"#c4cdda",.7,.6,.9,x+s*.1,1.48,z-2));d.add(mesh(GEO.box,"#e53935",.72,.12,.92,x+s*.1,1.82,z-2));d.add(mesh(GEO.box,"#2a2a30",.12,.12,.12,x-s*.3,1.3,z-2.2));
  for(let j=0;j<4;j++)d.add(mesh(GEO.cyl,"#ffffff",.06,.1,.06,x+s*.1,1.93,z-2.3+j*.18));
  const gb=new THREE.Mesh(GEO.box,glassMat);gb.scale.set(.8,.5,1.6);gb.position.set(x,1.43,z+2);d.add(gb);
  d.add(mesh(GEO.cyl,"#f7c8d8",.2,.16,.2,x,1.28,z+1.6));d.add(mesh(GEO.cyl,"#6b3e22",.2,.16,.2,x,1.28,z+2.35));
  const w=walker(),r=s>0?Math.PI/2:-Math.PI/2;w.position.set(s*6.3,0,z);w.rotation.y=r;g.add(w);lookers.push({head:w.userData.head,x:s*6.3,z,r,chunk:ci})}
function atticSide(d,g,s,z,ci){const x=s*5.75,y=H2,r=Math.random();
  if(r<.45){[0,.8,1.6,2.4].forEach(h=>d.add(mesh(GEO.box,"#6b4a32",.8,.06,2.4,x,y+h+.05,z)));[-1,1].forEach(q=>d.add(mesh(GEO.box,"#5a3a26",.8,2.6,.06,x,y+1.3,z+q*1.2)));
    for(let j=0;j<6;j++)d.add(mesh(GEO.box,pick(["#9c8468","#b8a488","#7a6a58","#a0703d"]),.5,.32,.42,x,y+.26+(j%3)*.8,z-.6+Math.floor(j/3)*1.1))}
  else if(r<.75){[-.6,.5].forEach(q=>{d.add(mesh(GEO.cyl,"#7a4a2a",.38,.9,.38,x,y+.45,z+q));[.18,.72].forEach(h=>d.add(mesh(GEO.cyl,"#3a3f52",.39,.05,.39,x,y+h,z+q)))})}
  else{d.add(mesh(GEO.sph,"#e9eef2",.6,.6,.6,x,y+.55,z));d.add(mesh(GEO.box,"#e9eef2",1.1,.5,1.0,x,y+.25,z))}
  if(Math.random()<.35){const w=new THREE.Mesh(planeGeo,webMat);w.scale.set(1.5,1.5,1);w.position.set(s*6.25,9.95,z+3);w.rotation.y=-s*Math.PI/2;d.add(w)}
  /* v69: лампочки мерехтять кожна у своєму ритмі (4 матеріали з різною фазою); раніше спільний матеріал блимав у всіх разом */
  const bm=CAFE_BULB[ri(4)];d.add(mesh(GEO.cyl,"#2a2a30",.012,1.3,.012,s*4.6,9.95,z));const bulb=new THREE.Mesh(GEO.sph,bm);bulb.scale.setScalar(.13);bulb.position.set(s*4.6,9.25,z);d.add(bulb);
  const ph=bm.userData.ph;anims.push({chunk:ci,z,f:t=>{bm.color.set(Math.sin(t*17+ph)>-.75&&Math.sin(t*2.3+ph*2)>-.65?"#fff1b0":"#4a4a40")}})}
function cafeChunk(g,i,z0,zc){
  const Z=zoneAt(i),P=cafePlan(Z),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>P.Z0-l,d=new THREE.Group();
  d.add(mesh(GEO.box,woodMat,13.4,.2,CH,0,-.1,zc));[-1.1,1.1].forEach(x=>d.add(mesh(GEO.box,"#8a5a34",.06,.02,CH,x,.012,zc)));
  d.add(mesh(GEO.box,"#4a3022",13.8,.2,CH,0,10.7,zc));for(let q=0;q<6;q++)d.add(mesh(GEO.box,"#3a2418",13.6,.35,.35,0,10.45,z0-2.5-q*5));
  [-1,1].forEach(s=>{const dir=s<0?0:1;
    d.add(mesh(GEO.box,brickMat,.4,10.8,CH,s*6.9,5.4,zc));d.add(mesh(GEO.box,"#6b3e22",.44,1.1,CH,s*6.88,.55,zc));d.add(mesh(GEO.box,"#4a2a18",.46,.1,CH,s*6.87,1.12,zc));
    for(let q=0;q<3;q++){const z=z0-5-q*10,sl=l0+5+q*10;
      d.add(mesh(GEO.box,"#4a2a18",.1,2.9,4.6,s*6.68,2.75,z));const gl=new THREE.Mesh(GEO.box,faced(cityMat,"#4a2a18",dir));gl.scale.set(.06,2.6,4.2);gl.position.set(s*6.63,2.75,z);d.add(gl);
      d.add(mesh(GEO.box,"#4a2a18",.12,2.7,.1,s*6.6,2.75,z));d.add(mesh(GEO.box,"#4a2a18",.12,.1,4.2,s*6.6,2.75,z));
      const rw=new THREE.Mesh(GEO.cyl,[M("#4a2a18"),cityMat,cityMat]);rw.scale.set(.8,.12,.8);rw.rotation.z=Math.PI/2;rw.position.set(s*6.66,7.9,z);d.add(rw);
      if(Math.random()<.5){const mb=new THREE.Mesh(GEO.box,faced(chalkMat,"#6b3e22",dir));mb.scale.set(.06,1.2,1.6);mb.position.set(s*6.66,2.7,z0-q*10-.1);d.add(mb)}
      /* v61: третя барна стійка посередині кав'ярні (4-й відрізок, праворуч) */
      const ctr=(k===0&&s===1)||(k===4&&s===1)||(k===7&&s===-1);
      if(ctr&&q===1)cafeCounter(d,g,s,z,i);
      else if(!(ctr&&q!==1)){const r=Math.random();
        if(r<.5)cafeSeat(d,g,s,z,i);
        else if(r<.75){d.add(mesh(GEO.cyl,"#d4774a",.32,.6,.32,s*5.4,.3,z));d.add(mesh(GEO.sph,"#3fae5a",.55,.75,.55,s*5.4,1.15,z));d.add(mesh(GEO.sph,"#4cc56a",.38,.5,.38,s*5.4+.15,1.7,z-.1))}
        else{const b=OB.bags();b.position.set(s*5.4,0,z);b.rotation.y=Math.PI/2;d.add(b)}}
      if(sl>90&&sl<181)atticSide(d,g,s,z,i);
      if(sl<58||sl>200)[-1.1,1.1].forEach(x=>{d.add(mesh(GEO.cyl,"#2a2a30",.012,3.7,.012,x,8.75,z));d.add(mesh(GEO.cone,"#2f6b5b",.42,.4,.42,x,6.7,z));
        d.add(mesh(GEO.sph,MB("#fff1b0"),.12,.12,.12,x,6.48,z));const sp=new THREE.Sprite(lampGlowMat);sp.scale.setScalar(2.2);sp.position.set(x,6.4,z);g.add(sp)})}});
  const a=Math.max(l0,89),b=Math.min(l1,182);
  if(a<b){const len=b-a,zm=Lz((a+b)/2),dk=M("#5a3a26");const sb=new THREE.Mesh(GEO.box,[dk,dk,atticMat,creamMat,dk,dk]);sb.scale.set(13.4,.26,len);sb.position.set(0,H2-.13,zm);d.add(sb);
    d.add(mesh(GEO.box,"#7a3b3b",6.6,.02,len,0,H2+.012,zm));[-1.1,1.1].forEach(x=>d.add(mesh(GEO.box,"#5a2a2a",.05,.025,len,x,H2+.02,zm)));
    for(let l=a+3;l<b;l+=10)LX.forEach(x=>d.add(mesh(GEO.box,lightMat,1.0,.04,2.4,x,5.11,Lz(l))));
    if(a===89){const ze=Lz(89);d.add(mesh(GEO.box,"#3a2418",13.4,.32,.3,0,H2-.16,ze));const gx=LX[P.lu];
      [[-6.6,gx-1.15],[gx+1.15,6.6]].forEach(([x1,x2])=>{if(x2-x1<.3)return;d.add(mesh(GEO.box,"#3a2418",x2-x1,.08,.08,(x1+x2)/2,H2+.95,ze-.12));
        for(let x=x1+.15;x<x2;x+=.5)d.add(mesh(GEO.cyl,"#e9d8c4",.035,.9,.035,x,H2+.48,ze-.12))})}
    if(b===182)d.add(mesh(GEO.box,"#3a2418",13.4,.32,.3,0,H2-.16,Lz(182)))}
  cafeDecor(d,s=>0,k,l0,l1,Lz);
  if(l0<=75&&75<l1)stairsVis(d,P.lu,Lz(75),true);
  if(l0<=182&&182<l1)stairsVis(d,P.ld,Lz(182),false);
  freeze(d);g.add(d)}


