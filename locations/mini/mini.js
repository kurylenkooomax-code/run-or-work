/* Локація mini (v63) — крихітний світ: труба (pipe, 300 м), кран (tap, 60 м) і стіл з ноутбуком (desk, 360 м).
   Котик лишається того ж розміру в грі, але все довкола величезне: волосина — як колода, бульбашка мила — вища за котика.
   Труба йде вгору на MINI_H м (шейдер вигину, ELEV з airport.js), кран і стіл — на тій самій висоті.
   У крані котик вилітає зі струменем, падає на долоні людини, що миє руки, і крапля дугою переносить його на стіл (tapPath в airport.js).
   Наприкінці столу — порт USB-C ноутбука: спалах, і поки що котик знову в парку (вміст ноутбука — наступна версія).
   Частини ноутбука за порталом (l > DESK_PORT) малюються на MINI_H вище і ховаються в момент порталу. */
const PIPE_R=5.8,PIPE_CY=2.6,SPOUT_R=4.6,SPOUT_CY=2.2;

/* ---------- матеріали ---------- */
const pipeTex=repT(texOf((x,w,h)=>{x.fillStyle="#5d6e68";x.fillRect(0,0,w,h);for(let i=0;i<18;i++){x.fillStyle=pick(["rgba(150,90,40,.35)","rgba(40,60,55,.4)","rgba(120,150,120,.25)"]);x.fillRect(Math.random()*w,0,rand(2,8),h)}
  x.fillStyle="rgba(20,30,28,.55)";for(let i=0;i<8;i++)x.beginPath(),x.arc(8+i*16,8,2.5,0,7),x.fill();
  for(let i=0;i<5;i++){x.fillStyle="rgba(140,200,90,.35)";x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,rand(4,10),rand(6,16),0,0,7);x.fill()}},128,128),6,3);
const pipeMat=new THREE.MeshToonMaterial({map:pipeTex,gradientMap:grad,side:THREE.BackSide});
const chromeTex=repT(texOf((x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"#d9e2ee");g.addColorStop(.3,"#ffffff");g.addColorStop(.55,"#a9b6c8");g.addColorStop(.8,"#eef3f9");g.addColorStop(1,"#c4cdda");x.fillStyle=g;x.fillRect(0,0,w,h)},128,32),4,2);
const chromeIn=new THREE.MeshToonMaterial({map:chromeTex,gradientMap:grad,side:THREE.BackSide}),chromeOut=new THREE.MeshToonMaterial({map:chromeTex,gradientMap:grad});
const deskWoodTex=repT(texOf((x,w,h)=>{x.fillStyle="#c98d52";x.fillRect(0,0,w,h);for(let i=0;i<26;i++){x.strokeStyle=pick(["rgba(120,70,30,.35)","rgba(230,180,120,.35)","rgba(150,90,40,.3)"]);x.lineWidth=rand(1,3);x.beginPath();let y=Math.random()*h;x.moveTo(0,y);for(let q=0;q<=w;q+=16)x.lineTo(q,y+Math.sin(q*.05+i)*rand(1,5));x.stroke()}
  x.fillStyle="rgba(90,50,20,.35)";x.fillRect(0,0,2,h)},128,128),8,3);
const deskWoodMat=new THREE.MeshToonMaterial({map:deskWoodTex,gradientMap:grad});
const marbleTex=repT(texOf((x,w,h)=>{x.fillStyle="#f3f5f8";x.fillRect(0,0,w,h);for(let i=0;i<9;i++){x.strokeStyle="rgba(150,160,175,.45)";x.lineWidth=rand(.6,1.8);x.beginPath();let px=Math.random()*w,py=0;x.moveTo(px,py);while(py<h){px+=rand(-12,12);py+=rand(6,16);x.lineTo(px,py)}x.stroke()}},128,128),6,6);
const marbleMat=new THREE.MeshToonMaterial({map:marbleTex,gradientMap:grad});
const ruledTex=repT(texOf((x,w,h)=>{x.fillStyle="#fbfdff";x.fillRect(0,0,w,h);x.fillStyle="#9fc2ea";for(let y=8;y<h;y+=16)x.fillRect(0,y,w,2);x.fillStyle="#ff9a9a";x.fillRect(10,0,2,h)},64,64),3,8);
const ruledMat=new THREE.MeshToonMaterial({map:ruledTex,gradientMap:grad});
const streamTex=repT(texOf((x,w,h)=>{x.fillStyle="#9fe6ff";x.fillRect(0,0,w,h);for(let i=0;i<14;i++){x.fillStyle=Math.random()<.5?"rgba(255,255,255,.7)":"rgba(40,140,210,.4)";x.fillRect(Math.random()*w,0,rand(2,5),h)}},64,64),2,1);
const streamMat=new THREE.MeshBasicMaterial({map:streamTex,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});
const bubbleMat=new THREE.MeshBasicMaterial({color:"#eaf8ff",transparent:true,opacity:.26,depthWrite:false});
const pipeWaterMat=new THREE.MeshBasicMaterial({color:"#7fc8d8",transparent:true,opacity:.35,depthWrite:false});
const glowLeakMat=new THREE.SpriteMaterial({map:lampTex,color:"#c9ffd9",transparent:true,opacity:.75,depthWrite:false});
const screenGlowMat=new THREE.SpriteMaterial({map:lampTex,color:"#7fd8ff",transparent:true,opacity:.6,depthWrite:false});
const alumMat=M("#c9ced8");
const pipeGeo=new THREE.CylinderGeometry(PIPE_R,PIPE_R,CH,26,12,true);pipeGeo.rotateX(Math.PI/2);
const spoutGeo=new THREE.CylinderGeometry(SPOUT_R,SPOUT_R,TAP_OUT,26,4,true);spoutGeo.rotateX(Math.PI/2);

/* ---------- труба ---------- */
function pipeChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),last=k===Z.n-1;
  const sh=new THREE.Mesh(pipeGeo,pipeMat);sh.position.set(0,PIPE_CY,zc);d.add(sh);
  /* довгі деталі — boxZ, щоб рівно вигиналися на підйомі; на самому початку труби (межа порталу) нічого не стоїть перед l=0 */
  d.add(mesh(boxZ,"#3c4744",10.4,.3,CH,0,-.15,zc));for(let l=l0+1;l<l1;l+=2)d.add(mesh(GEO.box,"#4b5753",10.4,.04,.25,0,.01,Lz(l)));
  d.add(mesh(boxZ,pipeWaterMat,3.2,.03,CH,0,.03,zc));
  for(let l=Math.ceil((l0-3.75)/7.5)*7.5+3.75;l<l1;l+=7.5){const r=new THREE.Mesh(TG(PIPE_R-.12,.32,8,40),M("#7b8a84"));r.position.set(0,PIPE_CY,Lz(l));d.add(r);
    for(let q=0;q<10;q++){const a=q/10*Math.PI*2;d.add(mesh(GEO.sph,"#9aa8a2",.16,.16,.16,Math.cos(a)*(PIPE_R-.35),PIPE_CY+Math.sin(a)*(PIPE_R-.35),Lz(l)-.3))}}
  [-1,1].forEach(s=>{for(let l=l0+2.5;l<l1;l+=5)d.add(mesh(GEO.box,MB("#c9ffd9"),.2,.08,.6,s*4.7,.05,Lz(l)));d.add(mesh(boxZ,"#56635e",.6,.6,CH,s*5.0,.3,zc));
    for(let q=0;q<3;q++){const a=rand(.2,1.2),y=PIPE_CY+Math.sin(a)*(PIPE_R-.2),x=s*Math.cos(a)*(PIPE_R-.2);if(y<1)continue;d.add(mesh(GEO.sph,pick(["#6fae55","#8fcf5b","#4e8f45"]),rand(.6,1.2),rand(.4,.9),rand(.8,1.6),x,y,Lz(l0+rand(2,CH-2))))}});
  /* щілини, крізь які світить */
  if(k%2===1){const a=rand(.6,2.5),z=Lz(l0+rand(5,25));const sp=new THREE.Sprite(glowLeakMat);sp.scale.setScalar(3.2);sp.position.set(Math.cos(a)*(PIPE_R-.4),PIPE_CY+Math.sin(a)*(PIPE_R-.4),z);g.add(sp);
    d.add(mesh(GEO.box,MB("#eaffef"),.12,.9,.12,sp.position.x,sp.position.y,z))}
  /* на початку — бризки після падіння з унітаза */
  if(k===0)for(let q=0;q<10;q++)d.add(mesh(GEO.sph,"#9fe6ff",rand(.2,.5),.06,rand(.3,.6),rand(-4,4),.05,Lz(rand(1.2,8))));
  if(last){const r=new THREE.Mesh(TG(PIPE_R+.2,.7,10,44),chromeOut);r.position.set(0,PIPE_CY,Lz(l1-.4));d.add(r);
    const r2=new THREE.Mesh(TG(PIPE_R-.2,.45,10,44),chromeOut);r2.position.set(0,PIPE_CY,Lz(l1-1.2));d.add(r2)}
  freeze(d);g.add(d)}
Object.assign(OD,{hair:{half:.6,ymin:0,ymax:.72},pbubble:{half:1.0,ymin:0,ymax:2.5,soft:true},bolt:{half:.75,ymin:0,ymax:2.3},gush:{half:.35,ymin:1.05,ymax:2.3},
  wring:{half:.8,ymin:0,ymax:.46,top:.48}});
Object.assign(OB,{
  hair(){const g=new THREE.Group(),c=pick(["#3b2a20","#1c1c24","#8a3b2a","#c9a05a"]);for(let q=0;q<9;q++){const h=mesh(GEO.cyl,c,.09,rand(1.6,2.4),.09,rand(-.3,.3),rand(.12,.6),rand(-.4,.4));h.rotation.z=Math.PI/2+rand(-.5,.5);h.rotation.y=rand(-.8,.8);g.add(h)}
    for(let q=0;q<3;q++){const r=new THREE.Mesh(TG(rand(.25,.4),.06,6,14),M(c));r.position.set(rand(-.6,.6),.35,rand(-.3,.3));r.rotation.set(rand(0,3),rand(0,3),0);g.add(r)}return g},
  pbubble(){const g=new THREE.Group(),b=new THREE.Group();b.position.y=1.25;g.add(b);b.add(mesh(GEO.sph,bubbleMat,1.15,1.15,1.15));
    b.add(mesh(GEO.sph,MB("#ffffff"),.18,.12,.08,-.45,.55,-.95));const rr=new THREE.Mesh(TG(1.14,.03,6,32),new THREE.MeshBasicMaterial({color:pick(["#ff9fe0","#9fffe0","#ffe59f"]),transparent:true,opacity:.5,depthWrite:false}));rr.rotation.x=.4;b.add(rr);
    g.userData={b};return g},
  bolt(){const g=new THREE.Group();const h=mesh(GEO.cyl,"#8b939f",.85,.7,.85,0,1.95,0);h.geometry=CG(1,1,1,6);g.add(h);g.add(mesh(GEO.cyl,"#6b7380",.55,1.7,.55,0,.85,0));
    for(let q=0;q<5;q++)g.add(mesh(GEO.cyl,"#5b6270",.6,.06,.6,0,.25+q*.3,0));g.add(mesh(GEO.sph,"#a0522d",.4,.12,.3,.4,1.3,-.3));return g},
  gush(){const g=new THREE.Group(),j=new THREE.Group();g.add(j);const p=mesh(GEO.cyl,"#7b8a84",.4,1.2,.4,-1.6,1.65,0);p.rotation.z=Math.PI/2;g.add(p);
    const w=mesh(GEO.cyl,streamMat,.35,3.2,.35,0,1.65,0);w.rotation.z=Math.PI/2;j.add(w);for(let q=0;q<5;q++)j.add(mesh(GEO.sph,"#bfeeff",.12,.12,.12,rand(-1.2,1.4),1.65+rand(-.3,.3),rand(-.2,.2)));
    g.userData={j};return g},
  wring(){const g=new THREE.Group(),r=new THREE.Mesh(TG(.72,.2,10,28),M("#ffcf40","#5a3a00"));r.rotation.x=Math.PI/2;r.position.y=.21;g.add(r);
    g.add(mesh(GEO.sph,"#e9fbff",.22,.24,.22,0,.48,-.72));g.add(mesh(GEO.cyl,"#ffcf40",.14,.12,.14,0,.36,-.72));return g}});
["hair","bolt","wring"].forEach(x=>STATIC_OB.add(x));KN_TIP.add("bolt");
function populatePipe(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,16);while(l<Math.min(l0+CH-2,Z.n*CH-8)){if(keepRow(Z,"rk",.85))rows.push(Lz(l));l+=gap+rand(.5,3)}
  rows.forEach(z=>{
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.3)L[ri(3)]="tall";else if(q<.56){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;
      if(c==="tall"&&Math.random()<.45){const o=spawnObs(g,"pbubble",lane,z,ci,0),u=o.m.userData,ph=rand(0,6);o.web=true;o.slow=.8;o.onHit=()=>{o.pop=st.t;puff(o.m.position);puff({x:o.m.position.x,y:o.m.position.y+1,z:o.m.position.z})};
        anims.push({chunk:ci,z,f:t=>{if(o.pop){const e=t-o.pop;u.b.scale.setScalar(Math.max(.01,1+e*6));u.b.visible=e<.12;return}u.b.position.y=1.25+Math.sin(t*1.7+ph)*.12;u.b.rotation.y=t*.6}});return}
      const ty=c==="tall"?"bolt":c==="over"?"gush":pick(["hair","hair","wring"]);const o=spawnObs(g,ty,lane,z,ci,0);
      if(ty==="gush"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{u.j.scale.y=1+Math.sin(t*14+ph)*.12;u.j.position.x=Math.sin(t*9+ph)*.05}})}
      if(ty==="hair")o.m.rotation.y=rand(-.4,.4)})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.pipe=pipeChunk;POP_FN.pipe=populatePipe;

/* ---------- кран: носик, струмінь, долоні, раковина ---------- */
/* долоня людини: пальці дивляться вліво (до крана), передпліччя й рукав ідуть праворуч за кадр — людина стоїть збоку від раковини */
function limb(g,ax,ay,az,bx,by,bz,r,c){const dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dy,dz),m=mesh(GEO.cyl,c,r,L,r,(ax+bx)/2,(ay+by)/2,(az+bz)/2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));g.add(m);return m}
function hand(m,sleeve){const g=new THREE.Group(),skin="#e6a77c";g.add(mesh(GEO.sph,skin,3.0,1.15,2.6,0,0,0));
  for(let q=0;q<4;q++){const z=-1.8+q*1.2;limb(g,-1.8,.3,z,-5.4,.9-q*.05,z*1.15,.55,skin);g.add(mesh(GEO.sph,"#f3c9a8",.5,.32,.5,-5.45,1.15,z*1.15))}
  limb(g,-.6,.4,m*2.2,-3.6,1.2,m*3.9,.62,skin);
  limb(g,1.8,-.2,0,16,3.5,m*1.5,2.0,skin);const sl=limb(g,14,3.0,m*1.3,30,8,m*3,2.5,sleeve);
  g.add(mesh(GEO.cyl,"#1c2445",2.15,1.4,2.15,9,1.6,m*.7));g.children[g.children.length-1].rotation.z=Math.PI/2-.23;
  if(m>0){g.add(mesh(GEO.cyl,"#ffc531",1.0,.5,1.0,9,1.6,3.0));g.children[g.children.length-1].rotation.x=Math.PI/2}
  for(let q=0;q<7;q++)g.add(mesh(GEO.sph,"#ffffff",rand(.5,1.1),rand(.35,.7),rand(.5,1.1),rand(-4,2),1.0,rand(-2.4,2.4)));return g}
function tapChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  if(k===0){
    /* хромований носик крана зсередини, світло в кінці */
    const sp=new THREE.Mesh(spoutGeo,chromeIn);sp.position.set(0,SPOUT_CY,Lz(TAP_OUT/2));d.add(sp);d.add(mesh(GEO.box,"#b7c2d0",8.2,.3,TAP_OUT,0,-.15,Lz(TAP_OUT/2)));
    for(let l=1;l<TAP_OUT;l+=3){const r=new THREE.Mesh(TG(SPOUT_R-.1,.18,8,40),chromeOut);r.position.set(0,SPOUT_CY,Lz(l));d.add(r)}
    const lip=new THREE.Mesh(TG(SPOUT_R+.25,.55,10,44),chromeOut);lip.position.set(0,SPOUT_CY,Lz(TAP_OUT));d.add(lip);
    const out=mesh(GEO.cyl,chromeOut,SPOUT_R+.5,TAP_OUT+6,SPOUT_R+.5,0,SPOUT_CY,Lz(TAP_OUT/2-3));out.rotation.x=Math.PI/2;d.add(out);
    const col=mesh(GEO.cyl,chromeOut,3.4,16,3.4,0,-6,Lz(-4));d.add(col);
    /* сітка-аератор на виході */
    for(let q=-3;q<=3;q++)d.add(mesh(GEO.box,"#c4cdda",.06,.06,.4,q*1.1,-.1,Lz(TAP_OUT-.2)));
    /* струмінь води вниз і долоні під ним */
    const st0=mesh(GEO.box,streamMat,2.8,6.0,.7,0,-2.9,Lz(TAP_OUT+1.0));d.add(st0);
    /* раковина: стільниця навколо, біла чаша */
    const top=-4.2;[-1,1].forEach(s=>d.add(mesh(GEO.box,marbleMat,40,3,60,s*40,top-1.5,Lz(30))));
    d.add(mesh(GEO.box,marbleMat,40,3,14,0,top-1.5,Lz(-3)));
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(19,13,7,40,1,true),new THREE.MeshToonMaterial({color:"#f4f7fb",gradientMap:grad,side:THREE.BackSide}));bowl.scale.z=.75;bowl.position.set(0,top-3.4,Lz(22));d.add(bowl);
    d.add(mesh(GEO.cyl,"#e9eef7",13,.3,13*.75,0,top-6.9,Lz(22)));d.add(mesh(GEO.cyl,"#5b6270",1.6,.32,1.6,0,top-6.8,Lz(22)));
    const rim=new THREE.Mesh(TG(19,.7,8,48),M("#ffffff"));rim.rotation.x=Math.PI/2;rim.scale.y=.75;rim.position.set(0,top+.1,Lz(22));d.add(rim);
    /* мило і склянка з щітками на стільниці */
    d.add(mesh(GEO.cyl,"#ff9fb5",4,12,4,-26,top+6,Lz(18)));d.add(mesh(GEO.cyl,"#ffffff",1.2,3,1.2,-26,top+13.5,Lz(18)));d.add(mesh(GEO.box,"#ffffff",4,.8,1,-23.5,top+14.8,Lz(18)));
    d.add(mesh(GEO.cyl,"#7fd3ff",4.5,11,4.5,27,top+5.5,Lz(26)));[["#22b066",-1.4],["#ff6a5c",1.4]].forEach(([c,x])=>{const b=mesh(GEO.cyl,c,.8,22,.8,27+x,top+12,Lz(26));b.rotation.z=x*.08;d.add(b)})}
  /* передній край столу: на нього приземляється крапля */
  if(TAP_LAND>=l0&&TAP_LAND<l1){d.add(mesh(GEO.box,deskWoodMat,160,6,l1-TAP_LAND,0,-3,Lz((TAP_LAND+l1)/2)));d.add(mesh(GEO.box,"#a8723f",160,6,.6,0,-3,Lz(TAP_LAND+.3)));
    d.add(mesh(GEO.box,"#8a5a34",160,.4,.7,0,-.2,Lz(TAP_LAND+.35)))}
  if(k===1)d.add(mesh(GEO.box,marbleMat,40,3,TAP_LAND-36.5,0,-5.7,Lz((36.5+TAP_LAND)/2)));
  d.add(mesh(GEO.box,"#e8dcc4",400,.2,CH,0,-60,zc));
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#e9dfcf",4,120,CH,s*130,0,zc)));
  freeze(d);g.add(d);
  if(k===0){/* долоні миють руки: трутся одна об одну */
    const slv=pick(["#3d7bff","#e53935","#22b066","#8a63ff"]),hs=[-1,1].map(s=>{const h=hand(s,slv);h.position.set(.6,-6.9+(s>0?.35:0),Lz(21.5)+s*1.7);h.rotation.x=s*.12;g.add(h);return h});
    const fall=[];for(let q=0;q<12;q++){const sp=new THREE.Sprite(dropMat);sp.scale.setScalar(rand(.4,.8));g.add(sp);fall.push({sp,x:rand(-3.5,3.5),p:rand(0,1)})}
    anims.push({chunk:i,z:Lz(20),far:30,f:(t,dt)=>{streamTex.offset.y-=dt*2.5;hs.forEach((h,j)=>{const s=j?1:-1;h.position.x=.6+Math.sin(t*5+j*Math.PI)*.9;h.position.z=Lz(21.5)+s*1.7+Math.sin(t*5+j*Math.PI)*.35;h.rotation.y=Math.sin(t*5+j)*.06});
      fall.forEach(f=>{const k2=(t*1.2+f.p)%1;f.sp.position.set(f.x,-.2-k2*6,Lz(TAP_OUT+1.5));f.sp.material.opacity=1})}})}
  /* монети вздовж дуги польоту */
  if(k===1||k===0)for(let l=TAP_FLING+2;l<TAP_LAND-2;l+=2.4)if(l>=l0&&l<l1){const y=tapPath(l);LX.forEach((x,lane)=>{if(lane===1||Math.random()<.5)addCoin(g,i,x,y+.8,Lz(l))})}}
CHUNK_FN.tap=tapChunk;POP_FN.tap=()=>{};

/* ---------- стіл ---------- */
let deskFar=null;
function deskProps(d,g,i,k,l0,l1,Lz){
  /* величезний олівець уздовж доріжок праворуч */
  const P0=30,P1=170;const a=Math.max(l0,P0),b=Math.min(l1,P1);
  if(b>a){const pc=mesh(GEO.cyl,"#ffc531",2.6,b-a,2.6,10,2.6,Lz((a+b)/2));pc.geometry=CG(1,1,1,6);pc.rotation.x=Math.PI/2;d.add(pc);
    d.add(mesh(GEO.box,"#e0a800",.3,.3,b-a,10,5.2,Lz((a+b)/2)))}
  if(P0>=l0&&P0<l1){const z=Lz(P0);const ti=mesh(GEO.cone,"#e8c38a",2.6,6,2.6,10,2.6,z+3);ti.rotation.x=Math.PI/2;d.add(ti);const gr=mesh(GEO.cone,"#3a3f52",.9,2,.9,10,2.6,z+5.5);gr.rotation.x=Math.PI/2;d.add(gr)}
  if(P1>=l0&&P1<l1){const z=Lz(P1);const f=mesh(GEO.cyl,"#c4cdda",2.7,3,2.7,10,2.6,z-1.5);f.rotation.x=Math.PI/2;d.add(f);const e=mesh(GEO.cyl,"#ff9fb5",2.6,4,2.6,10,2.6,z-5);e.rotation.x=Math.PI/2;d.add(e)}
  /* монета, жовтий блок стікерів, телефон, кухоль, книжки */
  if(k===2){d.add(mesh(GEO.cyl,"#d9a441",9,.9,9,-17,.45,Lz(l0+15)));d.add(mesh(GEO.cyl,"#b8862e",7,.92,7,-17,.46,Lz(l0+15)))}
  if(k===4){d.add(mesh(GEO.box,"#ffe066",28,4,28,-27,2,Lz(l0+14)));for(let q=0;q<6;q++)d.add(mesh(GEO.box,"#f5d34f",28.1,.1,28.1,-27,.6+q*.6,Lz(l0+14)))}
  if(k===7){d.add(mesh(GEO.box,"#1c2445",26,2.4,52,31,1.2,Lz(l0+15)));d.add(mesh(GEO.box,MB("#5ab8ff"),23,.05,46,31,2.43,Lz(l0+15)))}
  if(k===6){d.add(mesh(GEO.cyl,"#ffffff",32,70,32,-50,35,Lz(l0+15)));d.add(mesh(GEO.cyl,"#e53935",32.3,8,32.3,-50,52,Lz(l0+15)));const hd=new THREE.Mesh(TG(13,4,10,24),M("#ffffff"));hd.position.set(-50,35,Lz(l0+15)+33);d.add(hd)}
  if(k%3===0){for(let q=0;q<4;q++)d.add(mesh(GEO.box,pick(["#e53935","#3d7bff","#22b066","#ffc531","#8a63ff"]),30,7,40,62,3.5+q*7.1,Lz(l0+15)))}
  /* крихти й порошинки довкола (декор) */
  for(let q=0;q<10;q++){const s=pick([-1,1]);d.add(mesh(GEO.sph,pick(["#b5793c","#d9a46a","#f4efe6"]),rand(.2,.6),rand(.15,.4),rand(.2,.6),s*rand(4.5,38),.1,Lz(rand(l0+.7,l1-.7))))}}
function laptop(d,g,Lz){const F=DESK_PORT-6,zF=Lz(F),zB=Lz(DESK_END),dep=DESK_END-F,H=12,wO=3.3,hO=2.6,LW=75;
  /* бік ноутбука з портом; усе це до порталу (на висоті столу) */
  [-1,1].forEach(s=>d.add(mesh(GEO.box,alumMat,LW-wO,H,dep,s*(wO+(LW-wO)/2),H/2,Lz(F+dep/2))));d.add(mesh(GEO.box,alumMat,wO*2,H-hO,dep,0,hO+(H-hO)/2,Lz(F+dep/2)));
  d.add(mesh(GEO.box,"#9aa3b5",LW*2,.6,.2,0,.3,zF+.12));d.add(mesh(GEO.box,"#e9eef7",LW*2,.25,.2,0,H-.15,zF+.12));
  d.add(mesh(GEO.box,"#3a3f52",wO*2+.6,.35,.3,0,hO+.1,zF+.1));[-1,1].forEach(s=>{d.add(mesh(GEO.box,"#3a3f52",.35,hO,.3,s*(wO+.1),hO/2,zF+.1));d.add(mesh(GEO.cyl,"#3a3f52",.5,.32,.5,s*(wO-.3),hO-.3,zF+.1))});
  d.add(signBox(tripMat.usb,3.4,1.25,0,5,zF+.15,.1));
  [[-14,"#1c2445",5,2],[-22,"#1c2445",2.4,2.4],[14,"#1c2445",4.4,1.8],[22,"#1c2445",4.4,1.8]].forEach(([x,c,w,h])=>d.add(mesh(GEO.box,c,w,h,.3,x,3.2,zF+.05)));
  /* тунель порту: темні стінки, золоті контакти на задній стінці */
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#2a2f3a",.3,hO,dep,s*(wO-.15),hO/2,Lz(F+dep/2))));d.add(mesh(GEO.box,"#2a2f3a",wO*2,.3,dep,0,hO-.15,Lz(F+dep/2)));d.add(mesh(GEO.box,"#1c1f28",wO*2,.1,dep,0,.02,Lz(F+dep/2)));
  d.add(mesh(GEO.box,"#151820",wO*2,hO,.3,0,hO/2,zB+.2));for(let q=-5;q<=5;q++)d.add(mesh(GEO.box,MB("#ffcf40"),.28,.9,.05,q*.5,1.3,zB+.38));
  const gl=new THREE.Sprite(screenGlowMat);gl.scale.setScalar(5);gl.position.set(0,1.3,zB+.6);g.add(gl);
  /* решта ноутбука — за порталом: на MINI_H вище, бо там висота дороги вже 0; ховається в момент порталу */
  const far=new THREE.Group(),Y=MINI_H,FL=240;
  far.add(mesh(GEO.box,deskWoodMat,160,6,FL,0,Y-3,Lz(DESK_PORT+FL/2)));far.add(mesh(GEO.box,"#e8dcc4",400,.2,FL,0,Y-60,Lz(DESK_PORT+FL/2)));[-1,1].forEach(s=>far.add(mesh(GEO.box,"#e9dfcf",4,140,FL,s*130,Y+10,Lz(DESK_PORT+FL/2))));
  far.add(mesh(GEO.box,alumMat,LW*2,H,170,0,Y+H/2,Lz(DESK_PORT+85)));far.add(mesh(GEO.box,"#e9eef7",LW*2-2,.3,168,0,Y+H+.1,Lz(DESK_PORT+85)));
  const lid=new THREE.Group();lid.position.set(LW-2,Y+H,Lz(DESK_PORT+86));lid.rotation.z=.22;lid.add(mesh(GEO.box,alumMat,3,160,164,0,80,0));lid.add(mesh(GEO.box,MB("#4aa8ff"),.2,140,150,-1.6,82,0));far.add(lid);
  const sg=new THREE.Sprite(screenGlowMat);sg.scale.setScalar(140);sg.position.set(LW-40,Y+60,Lz(DESK_PORT+86));far.add(sg);
  freeze(far);g.add(far);deskFar=far}
/* останній відрізок столу закінчується до порталу (DESK_END): за ним висота дороги вже 0, тож продовження столу, стін і підлоги
   малюється в групі deskFar на MINI_H вище */
const DESK_END=DESK_PORT-.05;
function deskChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,last=k===Z.n-1,l1=last?DESK_END:l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group();
  zc=Lz((l0+l1)/2);const len=l1-l0;
  d.add(mesh(GEO.box,deskWoodMat,160,6,len,0,-3,zc));
  if(k>=4&&k<=6)d.add(mesh(GEO.box,ruledMat,26,.04,Math.min(l1,200)-Math.max(l0,120),0,.02,Lz((Math.max(l0,120)+Math.min(l1,200))/2)));
  if(k===9)d.add(mesh(GEO.box,"#ffe066",14,.05,14,0,.03,Lz(l0+15)));
  d.add(mesh(GEO.box,"#e8dcc4",400,.2,len,0,-60,zc));[-1,1].forEach(s=>d.add(mesh(GEO.box,"#e9dfcf",4,140,len,s*130,10,zc)));
  if(k%4===2){const w=mesh(GEO.box,MB("#bfe6ff"),2,60,26,129,32,Lz(l0+15));d.add(w);d.add(mesh(GEO.box,"#ffffff",2.2,2,28,128.8,62,Lz(l0+15)))}
  deskProps(d,g,i,k,l0,l1,Lz);
  if(last)laptop(d,g,Lz);
  freeze(d);g.add(d)}
/* ---------- перешкоди столу ---------- */
Object.assign(OD,{crumb:{half:.5,ymin:0,ymax:.8,top:.82},sugar:{half:.4,ymin:0,ymax:.75,top:.78},clip:{half:.9,ymin:0,ymax:.32,top:.34},shaving:{half:.55,ymin:0,ymax:.7},
  staple:{half:.2,ymin:1.05,ymax:1.5},cdrop:{half:.8,ymin:0,ymax:.15,soft:true},ant:{half:1.1,ymin:0,ymax:1.0},dropw:{half:.9,ymin:0,ymax:2.2},bigcrumb:{half:.9,ymin:0,ymax:2.2}});
Object.assign(OB,{
  crumb(){const g=new THREE.Group();[[0,.35,0,.55],[.35,.25,.2,.35],[-.3,.22,-.15,.32]].forEach(([x,y,z,r])=>g.add(mesh(GEO.sph,pick(["#b5793c","#c98d52","#a0662f"]),r*1.2,r,r*1.1,x,y,z)));
    for(let q=0;q<4;q++)g.add(mesh(GEO.sph,"#5a3a20",.08,.08,.08,rand(-.4,.4),rand(.4,.7),rand(-.3,.3)));return g},
  sugar(){const g=new THREE.Group(),m=mesh(GEO.box,new THREE.MeshToonMaterial({color:"#f7fbff",gradientMap:grad,transparent:true,opacity:.85}),.7,.7,.7,0,.36,0);m.rotation.y=rand(0,1);g.add(m);g.add(mesh(GEO.box,MB("#ffffff"),.2,.05,.2,.15,.72,.1));return g},
  clip(){const g=new THREE.Group(),c=pick(["#c4cdda","#ff6a5c","#3d7bff","#22b066"]);[[1.6,.9],[1.2,.6],[.8,.3]].forEach(([l,w],q)=>{[-1,1].forEach(s=>g.add(mesh(GEO.box,c,.12,.14,l,s*w,.07,(q-1)*.15)))});
    [[.9,-.8],[.6,.6],[.3,-.45]].forEach(([w,z])=>g.add(mesh(GEO.box,c,w*2+.12,.14,.12,0,.07,z)));g.rotation.y=Math.PI/2*Math.round(Math.random());return g},
  shaving(){const g=new THREE.Group();for(let q=0;q<3;q++){const r=new THREE.Mesh(TG(.5-q*.1,.13,6,20,Math.PI*1.6),M(q?"#e8c38a":"#ffc531"));r.position.set(q*.15,.45-q*.05,0);r.rotation.y=q*.6;g.add(r)}return g},
  staple(){const g=new THREE.Group(),c="#c4cdda";[-1,1].forEach(s=>g.add(mesh(GEO.box,c,.16,1.5,.16,s*1.0,.75,0)));g.add(mesh(GEO.box,c,2.16,.18,.18,0,1.42,0));return g},
  cdrop(){const g=new THREE.Group();g.add(mesh(HEMI,new THREE.MeshToonMaterial({color:"#6b3e22",gradientMap:grad,transparent:true,opacity:.85}),.85,.16,.95,0,0,0));g.add(mesh(GEO.sph,MB("#d9a46a"),.15,.03,.2,-.3,.12,-.3));return g},
  ant(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const c="#2a1a14";b.add(mesh(GEO.sph,c,.42,.36,.6,0,.55,.7));b.add(mesh(GEO.sph,c,.25,.25,.35,0,.55,0));b.add(mesh(GEO.sph,c,.32,.3,.32,0,.62,-.55));
    [-1,1].forEach(s=>{b.add(mesh(GEO.sph,"#ffffff",.08,.08,.06,s*.15,.72,-.8));const an=mesh(GEO.cyl,c,.03,.6,.03,s*.15,.95,-.75);an.rotation.x=-.6;an.rotation.z=s*.4;b.add(an)});
    const legs=[];for(let q=0;q<3;q++)[-1,1].forEach(s=>{const p=new THREE.Group();p.position.set(s*.2,.55,-.15+q*.25);const l=mesh(GEO.cyl,c,.04,.8,.04,s*.3,-.25,0);l.rotation.z=s*1.0;p.add(l);b.add(p);legs.push(p)});
    g.userData={legs};return mergeRig(g,legs)},
  dropw(){const g=new THREE.Group();g.add(mesh(HEMI,new THREE.MeshToonMaterial({color:"#9fe6ff",gradientMap:grad,transparent:true,opacity:.72}),1.1,2.1,1.1,0,0,0));g.add(mesh(GEO.sph,MB("#ffffff"),.2,.35,.12,-.45,1.3,-.8));return g},
  bigcrumb(){const g=new THREE.Group();[[0,1.0,0,1.0],[.5,.6,.3,.7],[-.4,.7,-.2,.75],[0,1.7,0,.55]].forEach(([x,y,z,r])=>g.add(mesh(GEO.sph,pick(["#c98d52","#b5793c"]),r*1.1,r,r,x,y,z)));
    for(let q=0;q<6;q++)g.add(mesh(GEO.sph,"#4a2a18",.15,.15,.15,rand(-.6,.6),rand(.6,1.9),rand(-.6,.6)));return g}});
["crumb","sugar","clip","shaving","staple","dropw","bigcrumb"].forEach(x=>STATIC_OB.add(x));KN_FALL.add("ant");KN_TIP.add("bigcrumb");
function populateDesk(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,12);while(l<Math.min(l0+CH-2,DESK_PORT-30)){rows.push(Lz(l));l+=gap+rand(.5,3)}
  let skip=false;
  rows.forEach(z=>{if(skip){skip=false;return}
    if(Math.random()<.1){clearArea(z+5,z-5);const o=spawnObs(g,"ant",1,z,ci,0),u=o.m.userData,ph=rand(0,6);
      anims.push({chunk:ci,z,far:10,f:t=>{if(o.dead)return;const x=Math.sin(t*1.1+ph)*2.4;o.x=x;o.m.position.x=x;o.m.rotation.y=Math.cos(t*1.1+ph)>0?-Math.PI/2:Math.PI/2;u.legs.forEach((p,j)=>p.rotation.x=Math.sin(t*16+j*1.7)*.5)}});skip=true;ROWP=null;return}
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.3)L[ri(3)]="tall";else if(q<.56){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=Math.random()<.5?"low2":null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    rowMark(L,z);
    L.forEach((c,lane)=>{if(!c)return;const ty=c==="tall"?pick(["dropw","bigcrumb"]):c==="over"?"staple":c==="low2"?"cdrop":pick(["crumb","sugar","clip","shaving"]);
      const o=spawnObs(g,ty,lane,z,ci,0);if(ty==="cdrop")o.slow=.84})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false);
  if(k===Z.n-1)for(let q=0;q<8;q++)addCoin(g,ci,LX[1],.8,Lz(DESK_PORT-28+q*2.6))}
CHUNK_FN.desk=deskChunk;POP_FN.desk=populateDesk;
/* прогрів шейдерів нових матеріалів під час завантаження гри (щоб не було підвисання, коли труба вперше з'являється) */
{const sc=new THREE.Scene();[pipeMat,chromeIn,chromeOut,streamMat,new THREE.MeshToonMaterial({color:"#f4f7fb",gradientMap:grad,side:THREE.BackSide})].forEach(m=>sc.add(new THREE.Mesh(GEO.box,m)));
  try{renderer.compile(sc,gameCam)}catch(e){}}
/* портал порту: сховати частини ноутбука, що «за» порталом */
{const f=tripTick;tripTick=function(dt){const E=ELEV.find(e=>e.portal==="port"&&!e.fallen);f(dt);if(E&&E.fallen&&deskFar){deskFar.visible=false;deskFar=null}}}
