/* Локація bridge — перенесено з world.js без змін логіки. */
/* ================= міст ================= */
/* Зона мосту 420 м: 10 м під'їзду, 400 м мосту, 10 м з'їзду. Поворот на 90° між 170 і 241 м (TURNS).
   Усе довге будується з дрібно поділених коробок (boxZ), щоб на повороті рівно вигиналося. */
const waterTex=repT(texOf((x,w,h)=>{x.fillStyle="#3f8fd0";x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=Math.random()<.5?"rgba(255,255,255,.35)":"rgba(20,60,120,.35)";x.lineWidth=2;
  const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0+8,y-4,x0+16,y);x.stroke()}},128,128),40,40);
const waterMat=noBend(new THREE.MeshToonMaterial({map:waterTex,gradientMap:grad}));waterMat.userData.base=waterMat.color.clone();
// Shared GPU geometry for bridge water: avoid allocating a new CircleGeometry on each crossing.
const bridgeWaterGeo=new THREE.CircleGeometry(250,48);
let waters=[];
const BR_DECK0=10,BR_DECK1=410,cableY=l=>2.2+15.5*Math.pow((l-210)/190,2);
function bridgeChunk(g,i,z0,zc){const Z=zoneAt(i),k=i-Z.c0,l0=k*CH,l1=l0+CH,Z0=-Z.c0*CH,Lz=l=>Z0-l,d=new THREE.Group();
  d.add(mesh(boxZ,"#4d566b",5.45,.2,CH,-1.575,-.1,zc));sidewalkLane(d,zc,boxZ);
  for(let q=0;q<CH;q+=4)d.add(mesh(GEO.box,"#f4f6fb",.12,.02,1.6,-1.1,.01,z0-q-1));
  [-1,1].forEach(sd=>d.add(mesh(boxZ,"#b9b2a6",.6,.34,CH,sd*4.6,.07,zc)));
  const a=Math.max(l0,BR_DECK0),b=Math.min(l1,BR_DECK1);
  if(a<b){const len=b-a,zm=Lz((a+b)/2);
    d.add(mesh(boxZ,"#8a8f9c",9.8,.8,len,0,-.6,zm));d.add(mesh(boxZ,"#2e5fd6",9.9,.25,len,0,-1.05,zm));
    [-1,1].forEach(sd=>{const x=sd*4.78;[1.15,.6].forEach(y=>d.add(mesh(boxZ,"#2e5fd6",.1,.1,len,x,y,zm)));
      for(let l=Math.ceil(a/3)*3;l<b;l+=3)d.add(mesh(GEO.box,"#1f4aa8",.1,1.2,.1,x,.6,Lz(l)));
      for(let l=Math.ceil(a/5)*5;l<b;l+=5){if(l<20||l>400)continue;const y=cableY(l);if(y>1.6)d.add(mesh(GEO.cyl,"#e9eef2",.025,y-1.15,.025,sd*5.2,(y+1.15)/2,Lz(l)))}
      for(let l=Math.max(20,Math.floor(a/5)*5);l<Math.min(400,b);l+=5){const l2=Math.min(l+5,400),y1=cableY(l),y2=cableY(l2),z1=Lz(l),z2=Lz(l2),ln=Math.hypot(y2-y1,z2-z1);
        const c=mesh(GEO.cyl,"#d4231a",.1,ln+.05,.1,sd*5.2,(y1+y2)/2,(z1+z2)/2);c.rotation.x=Math.atan2(z2-z1,y2-y1);d.add(c)}});
    for(let l=Math.ceil(a/30)*30+15;l<b;l+=30)[-1,1].forEach(sd=>streetLamp(d,g,sd,Lz(l)));
    for(let l=60;l<=380;l+=40)if(l>=a&&l<b)[-1,1].forEach(sd=>{d.add(mesh(GEO.box,"#a39b8e",2.4,8.6,2.4,sd*3,-5.3,Lz(l)));d.add(mesh(GEO.cyl,"#8a8f9c",1.5,.6,1.5,sd*3,-9.4,Lz(l)))})}
  [20,400].forEach(l=>{if(l>=l0&&l<l1){const z=Lz(l);[-1,1].forEach(sd=>{d.add(mesh(GEO.box,"#d4231a",1.0,27,1.0,sd*5.4,4.5,z));d.add(mesh(GEO.box,"#b01c14",1.3,.6,1.3,sd*5.4,18.2,z))});
    [17.2,8.2].forEach(y=>d.add(mesh(GEO.box,"#d4231a",11.8,.9,.9,0,y,z)));d.add(mesh(GEO.box,"#ffc531",3.2,.5,.95,0,y0Sign,z))}});
  if(l0===0)d.add(mesh(GEO.box,"#a39b8e",13,9,10,0,-4.7,Lz(5)));if(l1>=BR_DECK1)d.add(mesh(GEO.box,"#a39b8e",13,9,10,0,-4.7,Lz(415)));
  freeze(d);g.add(d);
  if(k===0){updateBend(st?-st.z:0);const c=bendPt(0,-9,Lz(210)),w=new THREE.Mesh(bridgeWaterGeo,waterMat);w.rotation.x=-Math.PI/2;w.position.copy(c);w.frustumCulled=false;world.add(w);waters.push({m:w,end:Z.c0*CH+BR_DECK1+60})}}
const y0Sign=8.2;
function populateBridge(g,ci,z0){const Z=zoneAt(ci),k=ci-Z.c0,l0=k*CH,Z0=-Z.c0*CH,Lz=l=>Z0-l,gap=rowGap(ci);
  const rows=[];let l=Math.max(l0+5,BR_DECK0+6);while(l<Math.min(l0+CH-2,BR_DECK1-6)){rows.push(Lz(l));l+=gap+rand(.5,3)}
  let skip=false;
  rows.forEach(z=>{if(skip){skip=false;return}const r=Math.random();
    if(r<.1){const lane=ri(3);clearArea(z+32,z-3);const o=spawnObs(g,"cyclist",lane,z,ci,0);o.ride={v:4.5,go:false};skip=true;return}
    const L=[null,null,null],q=Math.random();
    if(q<.35)L[ri(3)]="tall";else if(q<.6){const f=ri(3);for(let j=0;j<3;j++)if(j!==f)L[j]=Math.random()<.5?"tall":"low"}else if(q<.8){for(let j=0;j<3;j++)L[j]="low";L[ri(3)]=Math.random()<.5?"low2":null}else L[ri(3)]="low";
    L.forEach((c,lane)=>{if(!c)return;let ty;
      if(c==="tall")ty=lane===1?"tourist":"fisher";else if(c==="low2")ty="puddle";else ty=pick(["cones","cones","puddle"]);
      const o=spawnObs(g,ty,lane,z,ci,0);if(ty==="fisher")o.m.rotation.y=lane===0?Math.PI/2:-Math.PI/2;if(ty==="tourist")o.m.rotation.y=Math.PI})});
  coinsBetween(g,ci,rows,z0-CH-3,0,undefined,false)}

