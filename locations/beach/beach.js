/* Локація beach (v56) — пляж після басейну (600 м): пісок, море ліворуч, парасолі й пальми праворуч.
   Котик біжить у плавках; наприкінці — вхід в аеропорт (v63), за дверима котик знову в костюмі (seqTick у pool.js). */
const BEACH_KEEP=.65;
const seaWaveTex=repT(texOf((x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"#1f8fd0");g.addColorStop(1,"#3cb6e8");x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<50;i++){x.strokeStyle=Math.random()<.6?"rgba(255,255,255,.45)":"rgba(10,70,130,.3)";x.lineWidth=2;const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0+8,y-4,x0+16,y);x.stroke()}},128,128),12,4);
const seaMatB=new THREE.MeshToonMaterial({map:seaWaveTex,gradientMap:grad});seaMatB.userData.base=seaMatB.color.clone();
function gull(g,ci,z){const b=new THREE.Group();b.add(mesh(GEO.sph,"#ffffff",.18,.14,.32,0,0,0));b.add(mesh(GEO.sph,"#ffffff",.1,.1,.1,0,.08,-.28));b.add(mesh(GEO.cone,"#ffb020",.03,.12,.03,0,.06,-.4));b.children[2].rotation.x=-Math.PI/2;
  const wl=new THREE.Group(),wr=new THREE.Group();[wl,wr].forEach((w,k)=>{const s=k?1:-1;w.add(mesh(GEO.box,"#e9eef7",.7,.03,.22,s*.35,0,0));w.add(mesh(GEO.box,"#4a4f5c",.15,.035,.2,s*.72,0,0));b.add(w)});
  g.add(b);const cx=rand(-14,10),cy=rand(6,10),r=rand(4,8),sp=rand(.3,.6)*pick([-1,1]),ph=rand(0,6);
  anims.push({chunk:ci,z,far:40,f:t=>{const a=t*sp+ph;b.position.set(cx+Math.cos(a)*r,cy+Math.sin(t*1.3+ph)*.4,z+Math.sin(a)*r);b.rotation.y=-a-(sp>0?0:Math.PI);const f=Math.sin(t*7+ph)*.5;wl.rotation.z=f;wr.rotation.z=-f}})}
function boat(d,x,z){d.add(mesh(GEO.box,"#ffffff",1.6,.6,4.2,x,0,z));d.add(mesh(GEO.box,"#e53935",1.65,.15,4.25,x,.15,z));d.add(mesh(GEO.cyl,"#8a5a34",.06,4,.06,x,2.2,z));
  const sl=mesh(GEO.cone,"#fff4d6",.05,3.2,1.4,x+.1,2.4,z+.6);d.add(sl)}
/* v63: на початку пляжу море далеко від доріжок (широкий сухий пісок і дерев'яний настил),
   ближче підходить лише після 75 м — щоб після басейну не здавалося, що котик знову біжить у воду */
const BEACH_SEA0=30,BEACH_SEA1=75,BEACH_FAR=-34;
const beachSeaX=l=>l<BEACH_SEA0?BEACH_FAR:l<BEACH_SEA1?lerp(BEACH_FAR,-9,(l-BEACH_SEA0)/(BEACH_SEA1-BEACH_SEA0)):-9;
function beachChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Lz=l=>-Z.c0*CH-l,d=new THREE.Group(),last=k===Z.n-1;
  d.add(mesh(GEO.box,sandMat,35,.3,CH,8.5,-.15,zc));
  if(l0<BEACH_SEA1){for(let l=l0;l<l1;l+=5){const e=beachSeaX(l+2.5),w=-9-e;
      if(w>.05)d.add(mesh(GEO.box,sandMat,w,.3,5,e+w/2,-.15,Lz(l+2.5)));d.add(mesh(GEO.box,seaMatB,120,.2,5,e-60,-.2,Lz(l+2.5)))}}
  else d.add(mesh(GEO.box,seaMatB,120,.2,CH,-69,-.2,zc));
  d.add(mesh(GEO.box,"#d9bb84",2.6,.02,CH,-7.8,.005,zc));
  for(let l=l0;l<l1;l+=1.7)d.add(mesh(GEO.sph,"#ffffff",.5,.05,rand(.6,1.0),beachSeaX(l)-.1+Math.sin(l*.7)*.3,-.07,Lz(l)));
  /* дерев'яний настил від хвіртки басейну */
  if(k===0){d.add(mesh(GEO.box,"#c9a06a",9.2,.08,22,0,.03,Lz(11)));for(let l=.5;l<22;l+=1.1)d.add(mesh(GEO.box,"#a87c4c",9.2,.09,.06,0,.035,Lz(l)));
    [-1,1].forEach(s=>{for(let l=6;l<22;l+=4)d.add(mesh(GEO.cyl,"#8a5d35",.1,.7,.1,s*4.75,.35,Lz(l)));d.add(mesh(GEO.box,"#8a5d35",.08,.08,16,s*4.75,.68,Lz(14)))})}
  /* праворуч: парасолі, лежаки, пальми, бар; ліворуч біля води — рушники й вежа рятувальника */
  for(let l=l0+3;l<l1;l+=8){const c=pick(["#ff6a5c","#ffc531","#3d7bff","#22b066","#ff9fb5"]);umbrella(d,rand(6.5,8),Lz(l),c);lounger(d,rand(9,10.5),Lz(l+1),c);
    if(Math.random()<.6){const tc=pick(["#ff9fb5","#7fd3ff","#ffe066","#b6f0a0"]);d.add(mesh(GEO.box,tc,1.0,.02,1.9,-5.6+rand(-.4,.4),.012,Lz(l+4)))}}
  for(let l=l0+rand(1,5);l<l1;l+=rand(8,12))palm(d,rand(13,19),Lz(l));
  if(k%4===2){const x=11.5,z=Lz(l0+15);d.add(mesh(GEO.box,"#c48a52",3.2,1.1,2.2,x,.55,z));d.add(mesh(GEO.box,"#f4e3b8",3.4,.12,2.4,x,1.15,z));
    [-1.4,1.4].forEach(q=>d.add(mesh(GEO.cyl,"#8a5a34",.07,1.6,.07,x+q,1.9,z-.9)));d.add(mesh(GEO.cone,"#e8c36a",2.6,1.0,2.0,x,3.1,z));}
  if(k===3){const x=-6.9,z=Lz(l0+10);[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]].forEach(([a,b])=>d.add(mesh(GEO.cyl,"#f4f6fb",.06,2.4,.06,x+a,1.2,z+b)));
    d.add(mesh(GEO.box,"#e53935",1.2,1.0,1.2,x,2.9,z));d.add(mesh(GEO.box,"#ffffff",1.25,.25,1.25,x,2.6,z));d.add(mesh(GEO.cone,"#ffc531",1.0,.5,1.0,x,3.7,z))}
  if(k%2===0)boat(d,rand(-58,Math.min(-30,beachSeaX(l0)-10)),Lz(l0+rand(5,25)));
  if(k%2===1){const h=rand(14,24),b=new THREE.Mesh(GEO.box,pick(BLD));b.scale.set(10,h,16);b.position.set(32,h/2,z0-15);d.add(b)}
  if(k===0){const x=4.9,z=Lz(3);const sg=new THREE.Mesh(GEO.box,faced(seaMat.beach,"#1c2445",4));sg.scale.set(2.2,.82,.08);sg.position.set(x,2.1,z);d.add(sg);d.add(mesh(GEO.box,"#c48a52",.12,1.8,.12,x,.9,z-.06))}
  /* v63: у кінці пляжу — вхід в аеропорт (раніше арка «Парк») */
  if(last&&typeof airportFacade==="function")airportFacade(d,g,Lz(Z.n*CH),i);
  else if(last){const z=Lz(Z.n*CH-.6);[-1,1].forEach(s=>{d.add(mesh(GEO.box,"#7b5a3a",.5,6.2,.5,s*4.9,3.1,z));d.add(mesh(GEO.sph,"#3fae5a",.8,.7,.8,s*4.9,6.3,z));
      for(let q=1;q<6;q++)d.add(mesh(GEO.box,"#3f9a4f",1.1,1.1,1.6,s*(5.6+q*1.2),.55,z-.2))});
    d.add(mesh(GEO.box,"#7b5a3a",10.3,.5,.5,0,6.0,z));const sg=new THREE.Mesh(GEO.box,faced(seaMat.park,"#1c2445",4));sg.scale.set(2.6,1.0,.1);sg.position.set(0,6.75,z+.05);d.add(sg)}
  freeze(d);g.add(d);
  for(let q=0;q<2;q++)gull(g,i,Lz(l0+rand(0,CH)))}
/* ---------- пляжні перешкоди ---------- */
Object.assign(OD,{castle:{half:.55,ymin:0,ymax:.85,top:.9},bball:{half:.45,ymin:0,ymax:1.0},icebox:{half:.35,ymin:0,ymax:.6,top:.62},crab:{half:.35,ymin:0,ymax:.35,top:.38},
  bumb:{half:.7,ymin:0,ymax:2.6},surf:{half:.3,ymin:0,ymax:2.1},vnet:{half:.2,ymin:1.05,ymax:2.7}});
Object.assign(OB,{
  castle(){const g=new THREE.Group(),s="#e9c98a",s2="#d8b574";g.add(mesh(GEO.box,s,1.3,.42,.9,0,.21,0));
    [[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]].forEach(([x,z])=>{g.add(mesh(GEO.cyl,s2,.17,.6,.17,x,.3,z));g.add(mesh(GEO.cone,s,.2,.22,.2,x,.71,z))});
    g.add(mesh(GEO.cyl,s,.28,.75,.28,0,.6,0));g.add(mesh(GEO.cone,s2,.32,.3,.32,0,1.12,0));g.add(mesh(GEO.box,"#e53935",.22,.14,.02,.1,1.4,0));g.add(mesh(GEO.cyl,"#5a4a40",.015,.35,.015,0,1.35,0));
    g.add(mesh(GEO.box,"#7a5130",.24,.3,.02,0,.15,-.46));return g},
  bball(){const g=new THREE.Group(),b=new THREE.Group();b.position.y=.45;g.add(b);b.add(mesh(GEO.sph,"#ffffff",.45,.45,.45));
    ["#e53935","#ffc531","#2f6fed"].forEach((c,k)=>{const q=mesh(GEO.sph,c,.455,.455,.16);q.rotation.y=k*Math.PI/3;b.add(q)});g.userData={b};return mergeRig(g,[b])},
  icebox(){const g=new THREE.Group();g.add(mesh(GEO.box,"#2f6fed",.9,.5,.55,0,.25,0));g.add(mesh(GEO.box,"#ffffff",.94,.1,.6,0,.55,0));g.add(mesh(GEO.box,"#ffffff",.5,.05,.05,0,.63,0));return g},
  crab(){const g=new THREE.Group(),c="#ff5a3c";g.add(mesh(GEO.sph,c,.32,.15,.24,0,.17,0));
    const cl=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.32,.2,-.15);p.add(mesh(GEO.sph,c,.11,.08,.13,s*.08,0,-.08));g.add(p);return p});
    for(let k=0;k<3;k++)[-1,1].forEach(s=>{const l=mesh(GEO.cyl,c,.025,.25,.025,s*.33,.08,.05+k*.08);l.rotation.z=s*1.1;g.add(l)});
    [-1,1].forEach(s=>{g.add(mesh(GEO.cyl,c,.02,.14,.02,s*.08,.33,-.12));g.add(mesh(GEO.sph,"#15151c",.04,.04,.04,s*.08,.41,-.12))});
    g.userData={cl};return mergeRig(g,cl)},
  bumb(){const g=new THREE.Group(),c=pick(["#ff6a5c","#ffc531","#3d7bff","#22b066","#ff9fb5"]);g.add(mesh(GEO.cyl,"#f4f6fb",.05,2.4,.05,0,1.2,0));
    g.add(mesh(GEO.cone,c,1.3,.55,1.3,0,2.5,0));g.add(mesh(GEO.cone,"#ffffff",.45,.24,.45,0,2.66,0));
    g.add(mesh(GEO.box,c,.75,.1,1.6,.15,.35,.2));g.add(mesh(GEO.box,"#f4f6fb",.75,.06,1.6,.15,.28,.2));return g},
  surf(){const g=new THREE.Group(),c=pick(["#ff6a5c","#22b066","#3d7bff","#ffc531"]);const b=mesh(GEO.sph,c,.32,1.05,.07,0,1.0,0);b.rotation.z=.12;g.add(b);
    const st=mesh(GEO.box,"#ffffff",.06,1.9,.075,.1,1.0,0);st.rotation.z=.12;g.add(st);g.add(mesh(GEO.cyl,"#d8b574",.35,.12,.35,0,.06,0));return g},
  vnet(){const g=new THREE.Group();[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#e9eef7",.05,2.8,.05,s*1.1,1.4,0)));
    g.add(mesh(GEO.box,"#1c2445",2.2,.85,.02,0,2.1,0));g.add(mesh(GEO.box,"#ffffff",2.2,.08,.05,0,2.55,0));
    for(let k=-5;k<=5;k++)g.add(mesh(GEO.box,"#e9eef7",.015,.85,.03,k*.2,2.1,0));for(let k=0;k<4;k++)g.add(mesh(GEO.box,"#e9eef7",2.2,.015,.03,0,1.75+k*.2,0));return g}});
["castle","icebox","bumb","surf","vnet"].forEach(x=>STATIC_OB.add(x));KN_TIP.add("bumb");KN_TIP.add("icebox");
/* ---------- v60: нові пляжні перешкоди ----------
   icecart — візок з морозивом і продавцем: тільки оминати.
   sunbather — засмагає на рушнику поперек ряду: перестрибнути (стати на нього не можна).
   wave — хвиля з моря час від часу набігає на ліву доріжку: перестрибнути або перейти правіше; якщо зачепити — сповільнює.
   gulls — зграя чайок пікірує і зависає над доріжкою: підкат; якщо зачепити — сповільнює і розлітається. */
Object.assign(OD,{icecart:{half:.7,ymin:0,ymax:2.5},sunbather:{half:1.0,ymin:0,ymax:.45},
  wave:{half:.9,ymin:0,ymax:.12,soft:true},gulls:{half:.6,ymin:1.05,ymax:2.3,soft:true}});
Object.assign(OB,{
  icecart(){const g=new THREE.Group(),c=pick(["#ff9fb5","#7fd3ff","#ffe066"]);
    g.add(mesh(GEO.box,"#ffffff",1.5,.9,.85,0,.75,0));g.add(mesh(GEO.box,c,1.52,.25,.87,0,.95,0));g.add(mesh(GEO.box,"#c4cdda",1.55,.06,.9,0,1.22,0));
    [-1,1].forEach(s=>{const w=mesh(GEO.cyl,"#3a3f52",.28,.12,.28,s*.55,.3,.43);w.rotation.x=Math.PI/2;g.add(w);const w2=mesh(GEO.cyl,"#3a3f52",.28,.12,.28,s*.55,.3,-.43);w2.rotation.x=Math.PI/2;g.add(w2)});
    [["#ff6fae",-.4],["#ffe066",0],["#9be7a0",.4]].forEach(([k,x])=>{g.add(mesh(GEO.cone,"#e0a860",.11,.3,.11,x,1.38,0));g.children[g.children.length-1].rotation.x=Math.PI;g.add(mesh(GEO.sph,k,.13,.13,.13,x,1.58,0))});
    g.add(mesh(GEO.cyl,"#f4f6fb",.04,1.6,.04,.6,2.0,.25));g.add(mesh(GEO.cone,c,1.0,.45,1.0,.6,2.85,.25));g.add(mesh(GEO.cone,"#ffffff",.35,.2,.35,.6,3.0,.25));
    const skin=pick(SKINS);g.add(mesh(GEO.box,"#ffffff",.5,.6,.32,-.15,1.55,.75));g.add(mesh(GEO.sph,skin,.2,.22,.2,-.15,2.05,.75));g.add(mesh(GEO.cyl,"#ffffff",.2,.12,.2,-.15,2.27,.75));
    [-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#3b4254",.09,.9,.09,-.15+s*.12,.85,.75)));return g},
  sunbather(){const g=new THREE.Group(),skin=pick(SKINS),tw=pick(["#ff6a5c","#3d7bff","#ffc531","#22b066","#ff9fb5"]);
    g.add(mesh(GEO.box,tw,1.0,.03,2.1,0,.015,0));for(let k=-4;k<=4;k+=2)g.add(mesh(GEO.box,"#ffffff",1.0,.032,.12,0,.016,k*.22));
    g.add(mesh(GEO.sph,skin,.24,.16,.42,0,.18,-.15));g.add(mesh(GEO.box,pick(["#e53935","#2f6fed","#1c2445"]),.42,.17,.36,0,.17,.22));
    [-1,1].forEach(s=>{g.add(mesh(GEO.cyl,skin,.07,.75,.07,s*.11,.1,.68));g.children[g.children.length-1].rotation.x=Math.PI/2;g.add(mesh(GEO.cyl,skin,.06,.55,.06,s*.3,.12,-.2));g.children[g.children.length-1].rotation.x=Math.PI/2});
    g.add(mesh(GEO.sph,skin,.17,.15,.18,0,.2,-.68));g.add(mesh(GEO.box,"#15151c",.3,.06,.04,0,.27,-.84));g.add(mesh(GEO.sph,pick(HAIR),.18,.1,.19,0,.3,-.64));return g},
  wave(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);b.add(mesh(GEO.box,seaMatB,2.8,.1,1.8,0,.05,0));
    for(let k=0;k<7;k++)b.add(mesh(GEO.sph,"#ffffff",rand(.25,.4),.1,rand(.3,.5),1.25+rand(-.1,.1),.11,-.8+k*.27));
    for(let k=0;k<4;k++)b.add(mesh(GEO.sph,"#e9f8ff",.2,.06,.25,rand(-1,1),.11,rand(-.7,.7)));g.userData={b};return mergeRig(g,[b])},
  gulls(){const g=new THREE.Group(),birds=[];
    for(let k=0;k<3;k++){const b=new THREE.Group();b.position.set((k-1)*.65,k===1?.25:0,k===1?-.3:0);b.add(mesh(GEO.sph,"#ffffff",.2,.15,.34));b.add(mesh(GEO.sph,"#ffffff",.12,.12,.12,0,.08,-.3));
      const bk=mesh(GEO.cone,"#ffb020",.035,.14,.035,0,.06,-.44);bk.rotation.x=-Math.PI/2;b.add(bk);[-1,1].forEach(s=>b.add(mesh(GEO.sph,"#15151c",.025,.025,.02,s*.06,.12,-.38)));
      const wl=new THREE.Group(),wr=new THREE.Group();[wl,wr].forEach((w,j)=>{const s=j?1:-1;w.add(mesh(GEO.box,"#e9eef7",.75,.03,.24,s*.38,0,0));w.add(mesh(GEO.box,"#4a4f5c",.16,.035,.22,s*.78,0,0));b.add(w)});
      b.userData={wl,wr};mergeRig(b,[wl,wr]);g.add(b);birds.push(b)}
    g.scale.setScalar(1.4);g.userData={birds};return g}});
KN_TIP.add("icecart");KN_BUMP.add("sunbather");STATIC_OB.add("icecart");STATIC_OB.add("sunbather");
function beachWave(g,ci,z){const o=spawnObs(g,"wave",0,z,ci,0),b=o.m.userData.b,T=rand(3.6,4.6),ph=rand(0,T);o.slow=.8;
  anims.push({chunk:ci,z,f:t=>{const q=((t+ph)%T)/T,k=q<.45?Math.sin(q/.45*Math.PI/2):q<.6?1:Math.cos((q-.6)/.4*Math.PI/2);
    const x=-9.6+(LX[0]+9.6)*k;o.m.position.x=x;o.x=o.used?99:x;b.scale.x=.7+.3*k;b.position.y=.02*Math.sin(t*6)}})}
function beachGulls(g,ci,lane,z){const o=spawnObs(g,"gulls",lane,z,ci,0),u=o.m.userData,ph=rand(0,6);o.web=true;o.slow=.82;
  o.onHit=()=>{o.scat=st.t;o.x=99};o.m.position.y=1.45;
  anims.push({chunk:ci,z,far:30,f:(t,dt)=>{const ah=st?st.z-z:99;
    if(o.scat){const e=t-o.scat;o.m.position.y=1.45+e*6;o.m.position.x=LX[lane]+e*4*(lane===0?-1:1);if(e>2)o.m.visible=false}
    else o.m.position.y=ah>42?7:ah>16?1.45+(ah-16)/26*5.5:1.45+Math.sin(t*3+ph)*.08;
    u.birds.forEach((b,j)=>{const f=Math.sin(t*(o.scat?22:12)+j*1.3+ph)*.7;b.userData.wl.rotation.z=f;b.userData.wr.rotation.z=-f;b.rotation.x=ah>16&&ah<42&&!o.scat?.5:0})}})}
function populateBeach(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Lz=l=>-Z.c0*CH-l,gap=rowGap(ci);
  /* v61: на 35% менше рядів перешкод */
  const rows=[];let l=Math.max(l0+5,12);while(l<Math.min(l0+CH-2,Z.n*CH-12)){if(keepRow(Z,"rk",BEACH_KEEP))rows.push(Lz(l));l+=gap+rand(.5,3)}
  rows.forEach(z=>{
    const L=rowPick(()=>{const L=[null,null,null],q=Math.random();
      if(q<.32)L[ri(3)]="tall";else if(q<.56){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}
      else if(q<.8){for(let j=0;j<3;j++)L[j]=Math.random()<.6?"low":"over";L[ri(3)]=null}else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},z);
    /* v60: хвиля на лівій доріжці (її можна пробігти, але вона сповільнює) */
    if(!L[0]&&-z-Z.c0*CH>BEACH_SEA1+8&&Math.random()<.28)L[0]="wave";
    rowMark(L.map(c=>c==="wave"?"low2":c),z);
    L.forEach((c,lane)=>{if(!c)return;if(c==="wave"){beachWave(g,ci,z);return}
      if(c==="over"&&Math.random()<.5){beachGulls(g,ci,lane,z);return}
      const ty=c==="tall"?pick(["bumb","surf","icecart","icecart","bumb"]):c==="over"?"vnet":pick(["castle","bball","icebox","crab","sunbather","sunbather"]);
      const o=spawnObs(g,ty,lane,z,ci,0);if(ty==="surf")o.m.rotation.y=rand(-.3,.3);
      const u=o.m.userData,ph=rand(0,6);
      if(ty==="bball")anims.push({chunk:ci,z,f:t=>{if(o.dead)return;const k2=Math.abs(Math.sin(t*3.2+ph));u.b.position.y=.45+k2*.55;u.b.rotation.x=t*2;u.b.scale.y=k2<.12?.85:1}});
      if(ty==="crab")anims.push({chunk:ci,z,f:t=>{if(o.dead)return;u.cl.forEach((p,j)=>p.rotation.x=Math.max(0,Math.sin(t*6+ph+j))*.6);o.m.position.x=LX[lane]+Math.sin(t*1.4+ph)*.25}})})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}
CHUNK_FN.beach=beachChunk;POP_FN.beach=populateBeach;
