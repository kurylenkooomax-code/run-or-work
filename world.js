/* Біжи або працюй — world.js
   Світ забігу: 3D-сцена, текстури, бос і начальниця, колеги, офіс, вулиця і кав'ярня (два поверхи, кавова річка, сходи), перешкоди, бафи, перехід і перехрестя, події після 1 км (нарада, кур'єр), день і ніч, стартовий стіл.
   Порядок завантаження: core.js, texts.js, wardrobe.js, world.js, game.js (див. index.html). */
"use strict";
/* ================= 3D ================= */
const canvas=$("#gl");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
let glLost=false;canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();glLost=true;if(mode==="game"&&st&&(st.state==="run"||st.state==="intro"))setPause(true)},false);
canvas.addEventListener("webglcontextrestored",()=>{glLost=false;drawSigns();scene3dTextures().forEach(x=>x.needsUpdate=true);resize()},false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setClearColor(0x000000,0);
const gradData=new Uint8Array([95,95,95,255,175,175,175,255,255,255,255,255]);
const grad=new THREE.DataTexture(gradData,3,1,THREE.RGBAFormat);grad.minFilter=grad.magFilter=THREE.NearestFilter;grad.needsUpdate=true;
const MC={};
const M=(c,em)=>{const k=c+(em||"");if(!MC[k])MC[k]=new THREE.MeshToonMaterial({color:c,gradientMap:grad,emissive:em||"#000000"});return MC[k]};
const BM={};
const MB=c=>{if(!BM[c])BM[c]=new THREE.MeshBasicMaterial({color:c});return BM[c]};
const GEO={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,14,10),cyl:new THREE.CylinderGeometry(1,1,1,18),cone:new THREE.ConeGeometry(1,1,16)};
const HEMI=new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2);
function mesh(geo,mat,sx,sy,sz,x,y,z){const m=new THREE.Mesh(geo,typeof mat==="string"?M(mat):mat);m.scale.set(sx,sy,sz);m.position.set(x||0,y||0,z||0);return m}
function freeze(o){mergeStatic(o);o.traverse(n=>{if(!n.userData.dyn)n.matrixAutoUpdate=false})}
/* Злиття нерухомих деталей: усі нерухомі сітки з однаковим матеріалом усередині групи стають однією сіткою.
   Так відеокарта малює відрізок світу за десятки викликів замість тисяч. Рухомі частини (userData.dyn), спрайти
   і сітки з кількома матеріалами не зливаються. Злиті геометрії позначені own і звільняються разом з відрізком. */
const _mm=new THREE.Matrix4(),_nm=new THREE.Matrix3(),_mv=new THREE.Vector3();
/* звичайні однотонні мультяшні матеріали зливаються в один: колір записується у вершини */
let VC_TOON=null;const plainToon=m=>m.isMeshToonMaterial&&!m.map&&!m.transparent&&m.emissive&&m.emissive.getHex()===0&&!m.vertexColors;
function mergeStatic(root){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),G=new Map();
  (function walk(n){for(const c of n.children.slice()){if(c.userData.dyn)continue;
    if(c.isMesh&&!c.isInstancedMesh&&!Array.isArray(c.material)&&c.geometry&&c.geometry.isBufferGeometry&&c.geometry.attributes.position&&c.geometry.attributes.normal){
      const vc=plainToon(c.material),k=vc?"VC":c.material.uuid;if(!G.has(k))G.set(k,{mat:vc?(VC_TOON||(VC_TOON=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:grad}))):c.material,items:[],vc});G.get(k).items.push(c)}
    walk(c)}})(root);
  G.forEach(({mat,items,vc})=>{if(items.length<2&&!(vc&&items.length))return;let nv=0,ni=0,uv=true;
    items.forEach(c=>{const g=c.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;if(!g.attributes.uv)uv=false});
    const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=uv?new Float32Array(nv*2):null,C=vc?new Float32Array(nv*3):null,I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
    items.forEach(c=>{const g=c.geometry,pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,n=pa.count;const cc=vc?c.material.color:null,cr=cc?cc.r:0,cg=cc?cc.g:0,cb=cc?cc.b:0;_mm.multiplyMatrices(inv,c.matrixWorld);_nm.getNormalMatrix(_mm);
      for(let i=0;i<n;i++){_mv.fromBufferAttribute(pa,i).applyMatrix4(_mm);P[(vo+i)*3]=_mv.x;P[(vo+i)*3+1]=_mv.y;P[(vo+i)*3+2]=_mv.z;
        _mv.fromBufferAttribute(na,i).applyMatrix3(_nm).normalize();N[(vo+i)*3]=_mv.x;N[(vo+i)*3+1]=_mv.y;N[(vo+i)*3+2]=_mv.z;
        if(U){U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
        if(C){C[(vo+i)*3]=cr;C[(vo+i)*3+1]=cg;C[(vo+i)*3+2]=cb}}
      if(g.index){const ix=g.index.array;for(let j=0;j<ix.length;j++)I[io+j]=ix[j]+vo;io+=ix.length}else{for(let j=0;j<n;j++)I[io+j]=vo+j;io+=n}
      vo+=n;c.parent.remove(c)});
    const mg=new THREE.BufferGeometry();mg.setAttribute("position",new THREE.BufferAttribute(P,3));mg.setAttribute("normal",new THREE.BufferAttribute(N,3));if(U)mg.setAttribute("uv",new THREE.BufferAttribute(U,2));if(C)mg.setAttribute("color",new THREE.BufferAttribute(C,3));
    mg.setIndex(new THREE.BufferAttribute(I,1));mg.computeBoundingSphere();mg.userData.own=true;const m=new THREE.Mesh(mg,mat);root.add(m)});
  return root}
/* звільнити пам'ять відеокарти: власні (злиті) геометрії і власні матеріали спрайтів */
function disposeTree(o){o.traverse(n=>{if(n.geometry&&n.geometry.userData.own)n.geometry.dispose();if(n.material&&n.material.userData&&n.material.userData.own)n.material.dispose()})}
const ownMat=m=>{m.userData.own=true;return m},ownGeo=g=>{g.userData.own=true;return g};
/* людина чи тварина: рухомі частини позначаються dyn і зливаються кожна окремо, решта тіла — в одне */
function mergeRig(root,parts){parts.forEach(p=>{if(p){p.userData.dyn=true;mergeStatic(p)}});mergeStatic(root);return root}
/* Вигин світу для мосту з поворотом. Світ будується прямим (бігти вздовж −z), а шейдер вигинає його по дузі.
   Логіка гри (доріжки, зіткнення) лишається прямою. Якщо шейдер не скомпілюється, міст просто буде прямим.
   v56: шейдер рахує до NT поворотів одночасно (серпантин) і висоту дороги uE: (початок підйому, кінець підйому, висота, обрив).
   До обриву дорога піднята на висоту H, після обриву — знову на рівні 0 (басейн унизу). */
const NT=4;
const BEND={uView:{value:new THREE.Matrix4()},uB:{value:new THREE.Vector4(0,0,0,0)},uT:{value:Array.from({length:NT},()=>new THREE.Vector4(0,1,1,0))},uE:{value:new THREE.Vector4(0,1,0,0)},uOn:{value:0}};
let BENDOK=true,bendBroken=false,TURNS=[],turnI=0,ELEV=[];
const BEND_GLSL=`
uniform mat4 uView;uniform vec4 uB;uniform vec4 uT[${NT}];uniform vec4 uE;uniform float uOn;
float bendH;
vec2 bendF(float h){return vec2(-sin(h),-cos(h));}
float bendE(float s){if(uE.z==0.0||s>=uE.w)return 0.0;return uE.z*smoothstep(uE.x,uE.y,s);}
vec4 bendW(vec4 w){
  float s=-w.z;vec2 p=uB.xy;float h=uB.z;float sr=uB.w;
  for(int i=0;i<${NT};i++){vec4 T=uT[i];
    if(T.w>0.0&&s>T.x){p+=bendF(h)*(T.x-sr);float d=min(s-T.x,T.w);float ph=d/T.y;float sg=T.z;
      p+=vec2(sg*T.y*(cos(h+sg*ph)-cos(h)),-sg*T.y*(sin(h+sg*ph)-sin(h)));h+=sg*ph;sr=T.x+d;}}
  p+=bendF(h)*(s-sr);bendH=h;
  return vec4(p.x+w.x*cos(h),w.y+bendE(s),p.y-w.x*sin(h),w.w);
}
`;
/* поки моста поруч немає (uOn=0), рахуємо рівно як звичайний three.js — без великих чисел */
const BEND_PROJ=`
vec4 mvPosition = vec4( transformed, 1.0 );
if(uOn>0.5){mvPosition = uView * bendW( modelMatrix * mvPosition );}else{mvPosition = modelViewMatrix * mvPosition;bendH=0.0;}
gl_Position = projectionMatrix * mvPosition;
`;
const BEND_NRM=`
#ifndef FLAT_SHADED
if(uOn>0.5){vec3 bn=normalize(mat3(modelMatrix)*objectNormal);float bc=cos(bendH),bs=sin(bendH);vNormal=normalize(mat3(uView)*vec3(bn.x*bc+bn.z*bs,bn.y,-bn.x*bs+bn.z*bc));}
#endif
`;
const BEND_SPRITE=/vec4\s+mvPosition\s*=\s*modelViewMatrix\s*\*\s*vec4\(\s*0\.0\s*,\s*0\.0\s*,\s*0\.0\s*,\s*1\.0\s*\)\s*;/;
THREE.Material.prototype.onBeforeCompile=function(sh){
  if(!BENDOK||(this.userData&&this.userData.noBend))return;
  let v=sh.vertexShader;if(v.indexOf("#include <common>")<0)return;let ok=false;
  if(v.indexOf("#include <project_vertex>")>=0){const nrm=v.indexOf("vNormal = normalize( transformedNormal );")>=0&&v.indexOf("#include <beginnormal_vertex>")>=0;v=v.replace("#include <project_vertex>",BEND_PROJ+(nrm?BEND_NRM:""));ok=true}
  else if(BEND_SPRITE.test(v)){v=v.replace(BEND_SPRITE,"vec4 mvPosition = uOn>0.5 ? uView * bendW( modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) ) : modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );");ok=true}
  if(!ok)return;
  sh.vertexShader=v.replace("#include <common>","#include <common>\n"+BEND_GLSL);sh.uniforms.uView=BEND.uView;sh.uniforms.uB=BEND.uB;sh.uniforms.uT=BEND.uT;sh.uniforms.uE=BEND.uE;sh.uniforms.uOn=BEND.uOn};
THREE.Material.prototype.customProgramCacheKey=function(){return(!BENDOK||(this.userData&&this.userData.noBend))?"flat":"bend3"};
const noBend=m=>{m.userData.noBend=true;return m};
{const ce=console.error.bind(console);console.error=function(){try{if(BENDOK&&String(arguments[0]).indexOf("shader error")>=0){BENDOK=false;bendBroken=true}}catch(e){}ce.apply(null,arguments)}}
/* та сама формула в JS: точка прямого світу → точка вигнутого.
   es — відстань, за якою брати висоту (камера бере висоту котика, щоб не стрибати на обриві) */
const bendF=h=>[-Math.sin(h),-Math.cos(h)];
function elevAt(s){const E=BEND.uE.value;if(!E.z||s>=E.w||s<=E.x)return 0;if(s>=E.y)return E.z;const k=(s-E.x)/(E.y-E.x);return E.z*k*k*(3-2*k)}
function bendPt(x,y,z,out,es){out=out||new THREE.Vector3();if(!BENDOK||!BEND.uOn.value){out.h=0;return out.set(x,y,z)}
  const s=-z,B=BEND.uB.value;let px=B.x,pz=B.y,h=B.z,sr=B.w;
  for(let ti=0;ti<NT;ti++){const T=BEND.uT.value[ti];if(T.w>0&&s>T.x){const f=bendF(h);px+=f[0]*(T.x-sr);pz+=f[1]*(T.x-sr);const d=Math.min(s-T.x,T.w),ph=d/T.y,sg=T.z;
    px+=sg*T.y*(Math.cos(h+sg*ph)-Math.cos(h));pz+=-sg*T.y*(Math.sin(h+sg*ph)-Math.sin(h));h+=sg*ph;sr=T.x+d}}
  const f=bendF(h);px+=f[0]*(s-sr);pz+=f[1]*(s-sr);out.set(px+x*Math.cos(h),y+elevAt(es===undefined?s:es),pz-x*Math.sin(h));out.h=h;return out}
function setTurnU(){BEND.uT.value.forEach((u,k)=>{const T=TURNS[turnI+k];if(T)u.set(T.s0,T.R,T.sg,T.L);else u.set(0,1,1,0)})}
/* висота: береться перша ділянка підйому, обрив якої ще не лишився далеко позаду */
function setElevU(s){const E=ELEV.find(e=>s<e.sD+70);if(E&&BENDOK)BEND.uE.value.set(E.sA,E.sB,E.H,E.sD);else BEND.uE.value.set(0,1,0,0)}
function bendReset(){TURNS=[];ELEV=[];turnI=0;BEND.uOn.value=0;BEND.uB.value.set(0,0,0,0);setTurnU();BEND.uE.value.set(0,1,0,0)}
/* пройдений поворот «впікається» в базу, щоб шейдер завжди рахував не більше NT поворотів */
function updateBend(s){if(!BENDOK){BEND.uOn.value=0;BEND.uB.value.set(0,0,0,0);BEND.uT.value.forEach(u=>u.w=0);BEND.uE.value.z=0;return}
  /* вигин вмикається за 500 м до першого повороту чи підйому і після нього вже лишається (світ повернутий) */
  if(!BEND.uOn.value&&((TURNS.length&&s>TURNS[0].s0-500)||(ELEV.length&&s>ELEV[0].sA-500)))BEND.uOn.value=1;
  setElevU(s);
  while(turnI<TURNS.length&&s>TURNS[turnI].s0+TURNS[turnI].L+80){
    const testZ=-(s+20),before=bendPt(0,0,testZ);
    const T=TURNS[turnI],e=T.s0+T.L,p=bendPt(0,0,-e);
    BEND.uB.value.set(p.x,p.z,p.h,e);turnI++;BEND.uT.value.forEach(u=>u.w=0);setTurnU();
    const after=bendPt(0,0,testZ),gap=Math.hypot(before.x-after.x,before.y-after.y,before.z-after.z);
    if(typeof PERF49!=="undefined")p49log(PERF49.rebases,`${Math.round(s)}м, turnI ${turnI}, Δ світу ${gap.toFixed(6)}м`);
  }
  setTurnU()}
/* вигнуті об'єкти не можна відсікати за прямими межами, тому вимикаємо відсікання */
const noCull=o=>o;
/* відсікання невидимого з урахуванням вигину: центр межової кулі об'єкта переноситься тією ж формулою, що й шейдер */
{const F=THREE.Frustum.prototype,io=F.intersectsObject,is=F.intersectsSprite,sp=new THREE.Sphere(),bv=new THREE.Vector3();
  const bent=(fr,r)=>{bendPt(sp.center.x,sp.center.y,sp.center.z,bv);sp.center.copy(bv);sp.radius=sp.radius*1.1+r;return fr.intersectsSphere(sp)};
  F.intersectsObject=function(o){if(!BEND.uOn.value||!BENDOK||(o.material&&o.material.userData&&o.material.userData.noBend))return io.call(this,o);const g=o.geometry;if(!g)return true;
    if(g.boundingSphere===null)g.computeBoundingSphere();sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);return bent(this,2)};
  F.intersectsSprite=function(o){if(!BEND.uOn.value||!BENDOK||(o.material&&o.material.userData&&o.material.userData.noBend))return is.call(this,o);sp.center.set(0,0,0);sp.radius=.7072;sp.applyMatrix4(o.matrixWorld);return bent(this,1)}}
const boxZ=new THREE.BoxGeometry(1,1,1,1,1,24);
/* box material that shows `face` on +x (side=-1 wall faces +x) or -x */
/* Повторно використовуємо набори матеріалів для однакових вікон/вивісок.
   Картинка та шейдер не змінюються; менше короткоживучих масивів при побудові кав’ярні. */
const FACE_CACHE=new Map();
const faced=(face,base,dir)=>{const b=typeof base==="string"?M(base):base;
  const key=face.uuid+"/"+b.uuid+"/"+dir;
  let a=FACE_CACHE.get(key);if(!a){a=[b,b,b,b,b,b];a[dir]=face;FACE_CACHE.set(key,a)}return a};

/* canvas textures */
function cnv(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return[c,c.getContext("2d")]}
function texOf(draw,w,h){const[c,x]=cnv(w,h);draw(x,w,h);return new THREE.CanvasTexture(c)}
const signCanvas=cnv(512,256);const signTex=new THREE.CanvasTexture(signCanvas[0]);
const exitCanvas=cnv(256,96);const exitTex=new THREE.CanvasTexture(exitCanvas[0]);
const offCanvas=cnv(256,96);const offTex=new THREE.CanvasTexture(offCanvas[0]);
const cafeCanvas=cnv(256,96);const cafeTex=new THREE.CanvasTexture(cafeCanvas[0]);
const upCanvas=cnv(256,128);const upTex=new THREE.CanvasTexture(upCanvas[0]);
const downCanvas=cnv(256,128);const downTex=new THREE.CanvasTexture(downCanvas[0]);
const hotCanvas=cnv(256,128);const hotTex=new THREE.CanvasTexture(hotCanvas[0]);
function arrowSign(cv,tex,bg,up,txt){const x=cv[1];x.fillStyle=bg;x.fillRect(0,0,256,128);x.strokeStyle="#fff";x.lineWidth=6;x.strokeRect(6,6,244,116);
  x.fillStyle="#fff";x.beginPath();if(up){x.moveTo(46,20);x.lineTo(80,58);x.lineTo(58,58);x.lineTo(58,106);x.lineTo(34,106);x.lineTo(34,58);x.lineTo(12,58)}else{x.moveTo(46,108);x.lineTo(80,70);x.lineTo(58,70);x.lineTo(58,22);x.lineTo(34,22);x.lineTo(34,70);x.lineTo(12,70)}x.fill();
  fitText(x,txt,150,40,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(txt,170,66);tex.needsUpdate=true}
function fitText(x,txt,max,fs,font){x.font=`900 ${fs}px ${font}`;while(x.measureText(txt).width>max&&fs>16){fs-=3;x.font=`900 ${fs}px ${font}`}}
const FONT='Unbounded, "Arial Black", sans-serif';
function drawSigns(){
  let[c,x]=signCanvas;x.fillStyle="#fff";x.fillRect(0,0,512,256);x.fillStyle="#ff4b3e";x.fillRect(0,0,512,22);x.fillRect(0,234,512,22);
  x.fillStyle="#d4231a";fitText(x,t("deadline"),470,96,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(t("deadline"),256,132);signTex.needsUpdate=true;
  [c,x]=exitCanvas;x.fillStyle="#1fa860";x.fillRect(0,0,256,96);x.strokeStyle="#fff";x.lineWidth=6;x.strokeRect(6,6,244,84);
  x.fillStyle="#fff";x.beginPath();x.moveTo(26,48);x.lineTo(56,26);x.lineTo(56,38);x.lineTo(78,38);x.lineTo(78,58);x.lineTo(56,58);x.lineTo(56,70);x.fill();
  fitText(x,t("exit"),150,44,FONT);x.textAlign="left";x.textBaseline="middle";x.fillText(t("exit"),92,50);exitTex.needsUpdate=true;
  [c,x]=offCanvas;x.fillStyle="#2e5fd6";x.fillRect(0,0,256,96);x.strokeStyle="#ffc531";x.lineWidth=6;x.strokeRect(6,6,244,84);
  x.fillStyle="#fff";fitText(x,t("officeSign"),220,46,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(t("officeSign"),128,50);offTex.needsUpdate=true;
  [c,x]=cafeCanvas;x.fillStyle="#5a2f17";x.fillRect(0,0,256,96);x.strokeStyle="#ffd9a0";x.lineWidth=6;x.strokeRect(6,6,244,84);
  x.fillStyle="#fff";x.fillRect(22,42,32,28);x.strokeStyle="#fff";x.lineWidth=5;x.beginPath();x.arc(56,55,8,-Math.PI/2,Math.PI/2);x.stroke();
  x.strokeStyle="#ffd9a0";x.lineWidth=3;x.beginPath();x.moveTo(30,36);x.quadraticCurveTo(25,28,31,20);x.moveTo(44,36);x.quadraticCurveTo(39,28,45,20);x.stroke();
  x.fillStyle="#ffd9a0";fitText(x,t("cafeSign"),160,38,FONT);x.textAlign="left";x.textBaseline="middle";x.fillText(t("cafeSign"),78,50);cafeTex.needsUpdate=true;
  arrowSign(upCanvas,upTex,"#1fa860",true,t("floor2Sign"));arrowSign(downCanvas,downTex,"#2e5fd6",false,t("downSign"));
  [c,x]=hotCanvas;x.fillStyle="#ffc531";x.fillRect(0,0,256,128);x.strokeStyle="#1c2445";x.lineWidth=8;x.strokeRect(5,5,246,118);
  x.strokeStyle="#d4231a";x.lineWidth=5;x.lineCap="round";[30,48].forEach(q=>{x.beginPath();x.moveTo(q,100);x.bezierCurveTo(q-12,80,q+12,60,q,30);x.stroke()});
  x.fillStyle="#d4231a";fitText(x,t("hotSign"),170,52,FONT);x.textAlign="center";x.textBaseline="middle";x.fillText(t("hotSign"),150,68);hotTex.needsUpdate=true}
const stripes=(a,b)=>texOf((x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.fillStyle=b;for(let i=-64;i<w;i+=48){x.beginPath();x.moveTo(i,h);x.lineTo(i+24,h);x.lineTo(i+88,0);x.lineTo(i+64,0);x.fill()}},256,64);
const stripeTex=stripes("#fff","#1c2445");
const winTex=texOf((x)=>{x.fillStyle="#fff";x.fillRect(0,0,64,128);for(let r=0;r<8;r++)for(let q=0;q<4;q++){x.fillStyle=Math.random()<.25?"#fff1b8":"#8fb6dc";x.fillRect(4+q*15,6+r*15,10,10)}},64,128);
winTex.wrapS=winTex.wrapT=THREE.RepeatWrapping;winTex.repeat.set(2,3);
const carpetTex=texOf((x)=>{x.fillStyle="#b4c3dc";x.fillRect(0,0,128,128);x.fillStyle="#a6b6d2";x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);
  for(let i=0;i<500;i++){x.fillStyle=Math.random()<.5?"rgba(255,255,255,.07)":"rgba(10,20,60,.06)";x.fillRect(Math.random()*128,Math.random()*128,2,2)}},128,128);
carpetTex.wrapS=carpetTex.wrapT=THREE.RepeatWrapping;carpetTex.repeat.set(4,9);
const cityTex=texOf((x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#79c4ff");g.addColorStop(1,"#d9f1ff");x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){const bw=rand(14,30),bh=rand(30,105),bx=i*17-8;x.fillStyle=pick(["#6d86b8","#7f97c7","#5b73a6","#8aa2cf"]);x.fillRect(bx,h-bh,bw,bh);
    x.fillStyle="rgba(255,255,255,.55)";for(let yy=h-bh+5;yy<h-4;yy+=8)for(let xx=bx+3;xx<bx+bw-3;xx+=6)if(Math.random()<.6)x.fillRect(xx,yy,3,4)}},256,128);
const boardTex=texOf((x,w,h)=>{x.fillStyle="#fbfdff";x.fillRect(0,0,w,h);x.strokeStyle="#1c2445";x.lineWidth=3;x.beginPath();x.moveTo(22,18);x.lineTo(22,140);x.lineTo(236,140);x.stroke();
  [32,52,44,78,104].forEach((v,i)=>{x.fillStyle=i===4?"#ff4b3e":"#3d7bff";x.fillRect(38+i*38,140-v,22,v)});
  x.strokeStyle="#22b066";x.lineWidth=4;x.beginPath();x.moveTo(42,118);x.lineTo(110,96);x.lineTo(150,106);x.lineTo(222,28);x.stroke();
  x.fillStyle="#1c2445";x.font="900 24px Arial Black, sans-serif";x.fillText("Q4",188,58)},256,160);
const posterTex=texOf((x,w,h)=>{x.fillStyle="#ffd36b";x.fillRect(0,0,w,h);x.fillStyle="#ff8a5b";x.beginPath();x.arc(92,60,26,0,7);x.fill();
  x.fillStyle="#3d5a99";x.beginPath();x.moveTo(0,h);x.lineTo(50,70);x.lineTo(84,110);x.lineTo(118,52);x.lineTo(w,h);x.fill();
  x.fillStyle="#fff";x.beginPath();x.moveTo(108,68);x.lineTo(118,52);x.lineTo(128,68);x.fill()},128,180);
const kpiTex=texOf((x,w,h)=>{x.fillStyle="#ffc531";x.fillRect(0,0,w,h);x.fillStyle="#1c2445";x.fillRect(0,0,w,14);x.fillRect(0,h-14,w,14);
  x.font="900 74px Arial Black, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("KPI",w/2-34,h/2+4);
  x.strokeStyle="#ff4b3e";x.lineWidth=12;x.lineCap="round";x.beginPath();x.moveTo(176,96);x.lineTo(212,52);x.stroke();x.fillStyle="#ff4b3e";x.beginPath();x.moveTo(196,40);x.lineTo(230,34);x.lineTo(222,68);x.fill()},256,128);
const paperTex=texOf((x,w,h)=>{x.fillStyle="#ffffff";x.fillRect(0,0,w,h);x.fillStyle="#9fb3d6";for(let y=14;y<h-8;y+=8)x.fillRect(8,y,w-16-((y*7)%20),2);x.fillStyle="#ff6b5e";x.fillRect(8,4,24,4)},64,96);
const crumpleGeo=new THREE.IcosahedronGeometry(1,0);
const exclTex=texOf((x)=>{x.fillStyle="#ff4b3e";x.beginPath();x.arc(64,64,58,0,7);x.fill();x.fillStyle="#fff";x.font="900 92px Arial Black, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("!",64,70)},128,128);

const BLD=["#f2a65a","#7bc4c4","#e57a77","#a0a7e8","#f6d06f","#8fcf8b"].map(c=>new THREE.MeshToonMaterial({color:c,map:winTex,gradientMap:grad}));
const stripeMat=new THREE.MeshToonMaterial({map:stripeTex,gradientMap:grad});
const signMat=new THREE.MeshBasicMaterial({map:signTex});
const exitMat=new THREE.MeshBasicMaterial({map:exitTex});
const offMat=new THREE.MeshBasicMaterial({map:offTex});
const cafeMat=new THREE.MeshBasicMaterial({map:cafeTex}),upMat=new THREE.MeshBasicMaterial({map:upTex}),downMat=new THREE.MeshBasicMaterial({map:downTex}),hotMat=new THREE.MeshBasicMaterial({map:hotTex});
const carpetMat=new THREE.MeshToonMaterial({map:carpetTex,gradientMap:grad});
const cityMat=new THREE.MeshBasicMaterial({map:cityTex});
const boardMat=new THREE.MeshBasicMaterial({map:boardTex});
const posterMat=new THREE.MeshBasicMaterial({map:posterTex});
const kpiMat=new THREE.MeshToonMaterial({map:kpiTex,gradientMap:grad});
const paperMat=new THREE.MeshToonMaterial({map:paperTex,gradientMap:grad});
const glassMat=new THREE.MeshBasicMaterial({color:"#cfefff",transparent:true,opacity:.38,depthWrite:false});
const lightMat=MB("#ffffff");
function scene3dTextures(){const out=[];[prevScene,gameScene].forEach(sc=>sc.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{["map","emissiveMap"].forEach(k=>{if(m[k]&&m[k].isCanvasTexture&&!out.includes(m[k]))out.push(m[k])})})}));return out}
drawSigns();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawSigns);

/* ---------- boss model ---------- */
function buildBoss(){
  const g=new THREE.Group(),u={},suit="#3d414c",skin="#f0a383",shirt="#f4f6fb";
  const skinMat=new THREE.MeshToonMaterial({color:skin,gradientMap:grad});u.skinMat=skinMat;u.skin=new THREE.Color(skin);u.angry=new THREE.Color("#ff6a55");
  const sk=(sx,sy,sz,x,y,z)=>{const m=new THREE.Mesh(GEO.sph,skinMat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);return m};
  const leg=x=>{const p=new THREE.Group();p.position.set(x,.8,0);p.add(mesh(GEO.cyl,suit,.17,.74,.17,0,-.37,0));p.add(mesh(GEO.box,"#121217",.3,.16,.46,0,-.74,-.08));p.add(mesh(GEO.box,"#2c2c34",.31,.04,.47,0,-.66,-.08));g.add(p);return p};
  u.legL=leg(-.24);u.legR=leg(.24);
  g.add(mesh(GEO.cyl,"#1b1b20",.5,.12,.4,0,.86,0));g.add(mesh(GEO.box,"#d4a017",.14,.1,.04,0,.86,-.4));
  g.add(mesh(GEO.box,suit,1.08,.92,.62,0,1.34,.04));
  g.add(mesh(GEO.sph,suit,.5,.42,.2,0,1.22,-.27));g.add(mesh(GEO.sph,shirt,.22,.42,.12,0,1.27,-.4));
  [-1,1].forEach(s=>{const l=mesh(GEO.box,shade(suit,-.25),.12,.62,.05,s*.2,1.45,-.36);l.rotation.z=s*-.35;g.add(l)});
  g.add(mesh(GEO.sph,suit,.62,.32,.4,0,1.74,.02));
  g.add(mesh(GEO.cyl,shirt,.2,.14,.2,0,1.86,0));
  const tie=new THREE.Group();tie.position.set(0,1.8,-.4);g.add(tie);u.tie=tie;
  tie.add(mesh(GEO.box,"#e53935",.12,.1,.06,0,-.03,0));tie.add(mesh(GEO.box,"#e53935",.15,.62,.04,0,-.38,0));tie.add(mesh(GEO.box,"#ffc531",.15,.05,.045,0,-.3,0));tie.add(mesh(GEO.box,"#ffc531",.15,.05,.045,0,-.48,0));
  const head=new THREE.Group();head.position.set(0,2.18,0);g.add(head);u.head=head;
  head.add(sk(.38,.4,.38,0,0,0));head.add(sk(.09,.12,.06,-.38,0,0));head.add(sk(.09,.12,.06,.38,0,0));
  head.add(mesh(GEO.sph,"#5a3d2a",.395,.25,.39,0,-.09,.05));
  for(let k=0;k<3;k++){const h=mesh(GEO.box,"#5a3d2a",.5,.02,.03,0,.35-k*.02,-.12+k*.11);h.rotation.z=.08;head.add(h)}
  head.add(mesh(GEO.sph,"#fff6ea",.07,.05,.03,.12,.33,-.06));
  [-1,1].forEach(s=>{head.add(mesh(GEO.sph,"#ffffff",.085,.07,.04,s*.14,.06,-.34));head.add(mesh(GEO.sph,"#15151c",.035,.035,.03,s*.13,.05,-.37));
    const br=mesh(GEO.box,"#3b2a20",.17,.045,.04,s*.14,.17,-.36);br.rotation.z=s*-.42;head.add(br)});
  head.add(mesh(GEO.sph,"#e88d72",.07,.06,.06,0,-.03,-.38));
  head.add(mesh(GEO.sph,"#3b2a20",.2,.05,.05,0,-.12,-.35));head.add(mesh(GEO.sph,"#7a1f1f",.1,.07,.04,0,-.22,-.33));
  u.steam=[];[-1,1].forEach(s=>{for(let k=0;k<3;k++){const p=mesh(GEO.sph,"#ffffff",.12,.12,.12,s*.46,.1,0);head.add(p);u.steam.push({m:p,s,k})}});
  const arm=(x)=>{const p=new THREE.Group();p.position.set(x,1.72,0);p.add(mesh(GEO.cyl,suit,.13,.66,.13,0,-.33,0));p.add(mesh(GEO.cyl,shirt,.12,.06,.12,0,-.67,0));p.add(sk(.13,.13,.13,0,-.74,0));g.add(p);return p};
  u.armL=arm(-.62);u.armR=arm(.62);u.armR.rotation.z=-2.5;
  const sign=new THREE.Group();sign.position.set(1.15,2.62,.05);g.add(sign);u.sign=sign;
  sign.add(mesh(GEO.cyl,"#a0703d",.045,1.15,.045,0,-.52,0));
  const wood=M("#a0703d");const board=new THREE.Mesh(GEO.box,[wood,wood,wood,wood,signMat,signMat]);board.scale.set(1.3,.65,.07);board.position.y=.12;sign.add(board);
  g.userData=u;return g}

/* female boss: chases the she-cat */
function buildBossF(){
  const g=new THREE.Group(),u={},suit="#7a2e52",skin="#f2b393",shirt="#f4f6fb",hair="#6b3220";
  const skinMat=new THREE.MeshToonMaterial({color:skin,gradientMap:grad});u.skinMat=skinMat;u.skin=new THREE.Color(skin);u.angry=new THREE.Color("#ff6a55");
  const sk=(geo,sx,sy,sz,x,y,z)=>{const m=new THREE.Mesh(geo,skinMat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);return m};
  const leg=x=>{const p=new THREE.Group();p.position.set(x,.82,0);p.add(sk(GEO.cyl,.1,.76,.1,0,-.38,0));
    p.add(mesh(GEO.box,"#c62f3a",.18,.1,.34,0,-.73,-.08));p.add(mesh(GEO.cyl,"#c62f3a",.035,.16,.035,0,-.74,.07));g.add(p);return p};
  u.legL=leg(-.17);u.legR=leg(.17);
  const skt=new THREE.Mesh(CG(.42,.4,.56,20),M(shade(suit,-.15)));skt.position.y=.7;g.add(skt);
  g.add(mesh(GEO.cyl,"#1b1b20",.43,.08,.4,0,.98,0));g.add(mesh(GEO.box,"#d4a017",.12,.09,.04,0,.98,-.41));
  g.add(mesh(GEO.box,suit,.92,.82,.56,0,1.4,.02));
  g.add(mesh(GEO.sph,shirt,.2,.38,.1,0,1.46,-.27));
  [-1,1].forEach(s=>{const l=mesh(GEO.box,shade(suit,-.25),.11,.56,.05,s*.18,1.5,-.29);l.rotation.z=s*-.32;g.add(l)});
  for(let k=0;k<2;k++)g.add(mesh(GEO.sph,"#d4a017",.03,.03,.02,.2,1.26-k*.14,-.29));
  g.add(mesh(GEO.sph,suit,.56,.28,.36,0,1.78,.02));
  g.add(sk(GEO.cyl,.14,.16,.14,0,1.9,0));
  const tie=new THREE.Group();tie.position.set(0,1.86,-.3);g.add(tie);u.tie=tie;
  tie.add(mesh(GEO.sph,"#e53935",.09,.07,.06,0,-.02,0));[-1,1].forEach(s=>{const e=mesh(GEO.box,"#e53935",.1,.34,.03,s*.06,-.2,0);e.rotation.z=s*.25;tie.add(e)});
  const head=new THREE.Group();head.position.set(0,2.22,0);g.add(head);u.head=head;
  head.add(sk(GEO.sph,.34,.38,.35,0,0,0));head.add(sk(GEO.sph,.07,.1,.05,-.34,0,0));head.add(sk(GEO.sph,.07,.1,.05,.34,0,0));
  head.add(mesh(GEO.sph,hair,.37,.3,.37,0,.13,.06));head.add(mesh(GEO.sph,hair,.19,.17,.19,0,.36,.22));
  const fr=mesh(GEO.sph,hair,.24,.09,.12,-.1,.27,-.22);fr.rotation.z=.35;head.add(fr);
  [-1,1].forEach(s=>{head.add(mesh(GEO.sph,"#ffffff",.075,.065,.04,s*.13,.05,-.32));head.add(mesh(GEO.sph,"#15151c",.032,.032,.03,s*.12,.04,-.35));
    const gl=new THREE.Mesh(TG(.09,.016,8,20),M("#1c1c24"));gl.position.set(s*.13,.05,-.37);head.add(gl);
    const br=mesh(GEO.box,"#4a2a1a",.15,.04,.04,s*.13,.17,-.34);br.rotation.z=s*-.42;head.add(br);
    head.add(mesh(GEO.sph,"#ffc531",.04,.04,.04,s*.36,-.13,0));head.add(mesh(GEO.sph,"#ff8f8f",.06,.03,.02,s*.2,-.08,-.31))});
  head.add(mesh(GEO.box,"#1c1c24",.08,.016,.016,0,.06,-.38));
  head.add(sk(GEO.sph,.05,.05,.05,0,-.04,-.36));
  head.add(mesh(GEO.sph,"#d42a4a",.09,.045,.04,0,-.17,-.31));
  u.steam=[];[-1,1].forEach(s=>{for(let k=0;k<3;k++){const p=mesh(GEO.sph,"#ffffff",.12,.12,.12,s*.42,.1,0);head.add(p);u.steam.push({m:p,s,k})}});
  const arm=x=>{const p=new THREE.Group();p.position.set(x,1.72,0);p.add(mesh(GEO.cyl,suit,.11,.62,.11,0,-.31,0));p.add(mesh(GEO.cyl,shirt,.1,.06,.1,0,-.63,0));p.add(sk(GEO.sph,.12,.12,.12,0,-.7,0));g.add(p);return p};
  u.armL=arm(-.56);u.armR=arm(.56);u.armR.rotation.z=-2.5;
  const sign=new THREE.Group();sign.position.set(1.08,2.58,.05);g.add(sign);u.sign=sign;
  sign.add(mesh(GEO.cyl,"#a0703d",.045,1.15,.045,0,-.52,0));
  const wood=M("#a0703d");const board=new THREE.Mesh(GEO.box,[wood,wood,wood,wood,signMat,signMat]);board.scale.set(1.3,.65,.07);board.position.y=.12;sign.add(board);
  g.userData=u;return g}

/* ---------- people ---------- */
const SHIRTS=["#5aa9e6","#f7a072","#9bc53d","#e86a92","#ffd166","#b28dff"],SKINS=["#f0c8a0","#c98b5e","#8d5a3b","#e8b48f"],HAIR=["#3b2a20","#c9a05a","#1c1c24","#8a3b2a"];
function officeChair(c){const g=new THREE.Group();c=c||"#2a3048";g.add(mesh(GEO.box,c,.66,.1,.62,0,.66,0));g.add(mesh(GEO.box,c,.66,.72,.1,0,1.08,.3));
  g.add(mesh(GEO.cyl,"#7b8094",.05,.55,.05,0,.36,0));for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const l=mesh(GEO.box,"#4a4f60",.07,.05,.36,Math.sin(a)*.17,.07,Math.cos(a)*.17);l.rotation.y=a;g.add(l);g.add(mesh(GEO.sph,"#1d1d24",.05,.05,.05,Math.sin(a)*.34,.05,Math.cos(a)*.34))}return g}
/* зовнішність людей: зачіски, окуляри, борода, навушники */
const HAIR2=HAIR.concat(["#e8c48a","#5a3d2a","#9a9aa3"]);
function personLook(head,r,o){o=o||{};const col=pick(HAIR2),st=o.style||pick(["short","short","long","pony","bun","bald","curly"]);
  const cap=()=>head.add(mesh(GEO.sph,col,r+.01,r*.68,r+.01,0,r*.4,.02));
  if(st==="short")cap();
  else if(st==="long"){cap();head.add(mesh(GEO.box,col,r*1.9,r*1.7,r*.5,0,-r*.25,r*.62));[-1,1].forEach(q=>head.add(mesh(GEO.box,col,r*.35,r*1.4,r*.9,q*r*.88,-r*.15,r*.1)))}
  else if(st==="pony"){cap();head.add(mesh(GEO.sph,col,r*.42,r*.42,r*.42,0,r*.25,r*.95));const tl=mesh(GEO.cyl,col,r*.24,r*1.3,r*.24,0,-r*.35,r*1.12);tl.rotation.x=.35;head.add(tl);head.add(mesh(GEO.sph,"#ff5fa2",r*.2,r*.2,r*.2,0,r*.3,r*1.25))}
  else if(st==="bun"){cap();head.add(mesh(GEO.sph,col,r*.5,r*.48,r*.5,0,r*1.0,r*.35))}
  else if(st==="bald"){[-1,1].forEach(q=>head.add(mesh(GEO.sph,col,r*.3,r*.45,r*.6,q*r*.86,-r*.05,r*.25)));head.add(mesh(GEO.sph,"#ffffff",r*.18,r*.1,r*.08,r*.3,r*.75,-r*.3))}
  else{for(let k=0;k<8;k++){const a=k/8*Math.PI*2;head.add(mesh(GEO.sph,col,r*.42,r*.42,r*.42,Math.sin(a)*r*.7,r*.55+Math.cos(a*2)*r*.08,Math.cos(a)*r*.6+r*.15))}head.add(mesh(GEO.sph,col,r*.5,r*.5,r*.5,0,r*.85,r*.1))}
  if(Math.random()<(o.glasses||.3)){[-1,1].forEach(q=>{const gl=new THREE.Mesh(TG(r*.24,r*.05,6,14),M("#1c1c24"));gl.position.set(q*r*.36,r*.06,-r*.93);head.add(gl)});head.add(mesh(GEO.box,"#1c1c24",r*.25,r*.05,r*.05,0,r*.08,-r*.97))}
  if(st!=="long"&&st!=="pony"&&st!=="bun"&&Math.random()<.2)head.add(mesh(GEO.sph,col,r*.62,r*.42,r*.45,0,-r*.62,-r*.62));
  if(Math.random()<.08){const b=new THREE.Mesh(TG(r*1.02,r*.1,6,18,Math.PI),M("#1c2445"));b.position.z=.01;head.add(b);[-1,1].forEach(q=>{const c=mesh(GEO.cyl,"#ff4b3e",r*.38,r*.25,r*.38,q*r*1.02,0,0);c.rotation.z=Math.PI/2;head.add(c)})}}
const SUITS=["#2a3048","#3d414c","#24345e","#5a4a40","#4a2a3a"];
const zzzTex=texOf((x)=>{x.fillStyle="#fff";x.strokeStyle="#1c2445";x.lineWidth=6;x.font="900 52px Arial Black, sans-serif";x.textAlign="center";x.textBaseline="middle";
  [["Z",44,86,52],["z",80,52,38],["z",104,26,28]].forEach(([c,a,b,f])=>{x.font=`900 ${f}px Arial Black, sans-serif`;x.strokeText(c,a,b);x.fillText(c,a,b)})},128,128);
function seatedWorker(suit){const g=new THREE.Group(),shirt=suit?pick(SUITS):pick(SHIRTS),skin=pick(SKINS);
  g.add(officeChair());
  g.add(mesh(GEO.box,"#3b4254",.42,.16,.5,0,.8,-.18));[-1,1].forEach(s=>g.add(mesh(GEO.box,"#3b4254",.16,.62,.16,s*.12,.42,-.42)));
  g.add(mesh(GEO.box,shirt,.62,.68,.36,0,1.15,.06));
  if(suit||Math.random()<.3){const v=mesh(GEO.cone,"#f4f6fb",.12,.3,.02,0,1.36,-.125);v.rotation.z=Math.PI;g.add(v);g.add(mesh(GEO.box,pick(["#e53935","#2f6fed","#ffc531","#22b066"]),.07,.36,.03,0,1.2,-.13))}
  const arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.36,1.36,-.02);a.userData.dyn=true;a.add(mesh(GEO.box,shirt,.14,.14,.5,0,-.28,-.16));a.add(mesh(GEO.sph,skin,.08,.08,.08,0,-.28,-.44));a.rotation.x=.55;g.add(a);return a});
  g.userData.arms=arms;
  const head=new THREE.Group();head.position.set(0,1.72,0);head.userData.dyn=true;g.add(head);
  head.add(mesh(GEO.sph,skin,.25,.27,.25));personLook(head,.25);
  [-1,1].forEach(s=>head.add(mesh(GEO.sph,"#15151c",.035,.045,.03,s*.09,.02,-.23)));
  g.userData.head=head;return mergeRig(g,[head].concat(arms))}

/* ---------- preview scene ---------- */
const prevScene=new THREE.Scene();
prevScene.add(new THREE.HemisphereLight(0xffffff,0x8899bb,.8));
const pl=new THREE.DirectionalLight(0xffffff,.7);pl.position.set(3,6,5);prevScene.add(pl);
const prevCam=new THREE.PerspectiveCamera(36,1,.1,60);
const podium=new THREE.Group();podium.add(mesh(GEO.cyl,"#ffffff",1.05,.22,1.05,0,-.11,0));podium.add(mesh(GEO.cyl,"#ffc531",1.1,.08,1.1,0,-.26,0));prevScene.add(podium);
let prevCat=null;
function rebuildPreview(){const ry=prevCat?prevCat.rotation.y:Math.PI-.45;if(prevCat)prevScene.remove(prevCat);prevCat=buildCat(viewEq());prevCat.rotation.y=ry;prevScene.add(prevCat)}

/* ---------- game scene ---------- */
const ENV={office:{bg:new THREE.Color("#dce6f4"),fog:new THREE.Color("#dce6f4"),near:26,far:92},street:{bg:new THREE.Color("#8fd6ff"),fog:new THREE.Color("#c4ebff"),near:45,far:140},bridge:{bg:new THREE.Color("#8fd6ff"),fog:new THREE.Color("#c4ebff"),near:50,far:160},park:{bg:new THREE.Color("#a8dcfa"),fog:new THREE.Color("#c5e9db"),near:40,far:130},cafe:{bg:new THREE.Color("#f2dfc4"),fog:new THREE.Color("#f2dfc4"),near:26,far:95}};
const gameScene=new THREE.Scene();
/* матриця камери для вигину: three.js не передає viewMatrix спрайтам, тому даємо її шейдеру самі (інакше спрайти після мосту заливали екран) */
gameScene.onBeforeRender=(r,sc,cam)=>{BEND.uView.value.copy(cam.matrixWorldInverse)};
gameScene.background=ENV.office.bg.clone();
gameScene.fog=new THREE.Fog(ENV.office.fog.clone(),ENV.office.near,ENV.office.far);
const gHemi=new THREE.HemisphereLight(0xffffff,0x8090b0,.78);gameScene.add(gHemi);
const sun=new THREE.DirectionalLight(0xffffff,.65);sun.position.set(4,10,6);gameScene.add(sun);
const gameCam=new THREE.PerspectiveCamera(62,1,.1,300);
// v26 MAIN: далекі гори парку. Окрема декорація без вигину BEND,
// прив'язана до камери, щоб горизонт не обривався під час забігу.
const parkMountains=new THREE.Group();parkMountains.visible=false;gameScene.add(parkMountains);
const mountainColors=["#a5cde1","#89b9d4","#73a5c2","#689ba5"];
for(let layer=0;layer<4;layer++){
  const mat=new THREE.MeshBasicMaterial({color:mountainColors[layer],fog:false,depthWrite:false,side:THREE.DoubleSide});
  mat.userData.noBend=true;
  const points=[];const depth=-125+layer*12;
  // Силует складається з трикутних вершин, що плавно переходять у нижню смугу.
  for(let j=0;j<13;j++){
    const x=-190+j*32;
    const peak=7+((j*7+layer*11)%5)*3+(j%3===0?6:0);
    points.push(x,-22,depth,x,peak-layer*2,depth,x+32,-22,depth);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.renderOrder=-10+layer;parkMountains.add(m);
}

const excl=new THREE.Sprite(new THREE.SpriteMaterial({map:exclTex,depthTest:false}));excl.scale.set(.6,.6,1);excl.visible=false;gameScene.add(excl);
let world=null,player=null,boss=null,shadow=null,bubble=null,startProps=null;
const LX=[-2.2,0,2.2],CH=30,ZONE=8,START_CLEAR=52;
let chunks=[],obstacles=[],coins=[],pickups=[],lookers=[],doors=[],anims=[],nextChunk=0;
/* zones of 240 m: office, street, office, street, then (from ~1 km) cafe, office, street, cafe… */
/* Зони йдуть одна за одною: офіс, вулиця, офіс, вулиця, далі по колу кав'ярня, офіс, вулиця.
   Звичайна зона — 8 відрізків (240 м). Раз на ~2 км після вулиці вставляється міст (14 відрізків, 420 м: 400 м мосту),
   а за ним знову звичайна вулиця. На мосту дорога повертає ліворуч або праворуч (TURNS). */
const BRN=14,PARKN=27,ZBASE=["office","street","office","street"],ZCYC=["cafe","office","street"];
let ZS=[],zCyc=0,bridgeAt=1900;
function nextZone(){const L=ZS[ZS.length-1],c0=L?L.c0+L.n:0;
  if(L&&L.pre){ZS.push({kind:"bridge",c0,n:BRN,id:ZS.length});
    /* повороти чергуються: перший міст праворуч, другий ліворуч, далі знову праворуч… */
    const R=45,nb=ZS.filter(z=>z.kind==="bridge").length-1,bsg=nb%2===0?-1:1;TURNS.push({s0:c0*CH+170,R,sg:bsg,L:R*Math.PI/2});
    /* v56: після мосту — серпантин угору, роздягальня, тераса з обривом, басейн, пляж і парк (locations/serpentine, pool) */
    if(typeof addSeaSeq==="function")addSeaSeq(c0+BRN,-bsg);
    else ZS.push({kind:"street",c0:c0+BRN,n:ZONE,id:ZS.length,after:true});
    bridgeAt=c0*CH+2000;return}
  const kind=zCyc>0&&(!L||L.kind!=="park")&&Math.random()<.22?"park":zCyc<4?ZBASE[zCyc]:ZCYC[(zCyc-4)%3];if(kind!=="park")zCyc++;const Z={kind,c0,n:kind==="park"?PARKN:ZONE,id:ZS.length};
  if(kind==="street"&&(c0+ZONE)*CH>=bridgeAt)Z.pre=true;ZS.push(Z)}
/* тротуар на правій доріжці починається за 100 м до мосту (з 140 м вулиці перед мостом) і йде по мосту */
const SW0=140;
function zoneAt(i){if(i<0)return null;while(!ZS.length||ZS[ZS.length-1].c0+ZS[ZS.length-1].n<=i)nextZone();for(let k=ZS.length-1;k>=0;k--)if(ZS[k].c0<=i)return ZS[k];return ZS[0]}
const zoneOf=i=>i<0?"office":zoneAt(i).kind;
function doorway(g,z0,kind,ci){
  const d=new THREE.Group(),inSide=kind==="exit"?1:-1,top=kind==="cafe"?10.7:5.2,z=z0+inSide*.35;
  const sign=new THREE.Mesh(GEO.box,faced(kind==="exit"?exitMat:kind==="cafe"?cafeMat:offMat,"#2c3a63",4));sign.scale.set(2.3,.86,.12);sign.position.set(0,4.35,z);d.add(sign);
  [-1,1].forEach(s=>d.add(mesh(GEO.cyl,"#2c3a63",.02,top-4.78,.02,s*.9,(top+4.78)/2,z)));
  /* верх фасаду над стелею приміщення: прохід не закриває */
  if(kind==="enter"){const f=new THREE.Mesh(GEO.box,BLD[0]);f.scale.set(24,6,.6);f.position.set(0,8.3,z0);d.add(f)}
  if(kind==="cafe"){const f=new THREE.Mesh(GEO.box,brickMat);f.scale.set(24,4,.6);f.position.set(0,12.85,z0);d.add(f)}
  if(kind==="fromCafe")d.add(mesh(GEO.box,"#b5643f",13.8,5.6,.5,0,8.0,z0));
  freeze(d);g.add(d);
}
const GEN_DIAG={last:0,max:0,count:0,slow:0,zone:""};
/* v56: нові локації реєструють тут свої функції побудови відрізка і розстановки перешкод */
const CHUNK_FN={},POP_FN={},OUTDOOR=new Set(["street","bridge","park"]);
/* v61: рівна частка рядів перешкод для локації: keepRow(обʼєкт,"ключ",0.9) пропускає рівно 10% рядів, а не випадкові */
function keepRow(o,key,f){const a=o[key]===undefined?.5:o[key];o[key]=a+f;return Math.floor(o[key])>Math.floor(a)}
function addChunk(i){
  const g=new THREE.Group(),z0=-i*CH,zc=z0-CH/2,theme=zoneOf(i);
  if(CHUNK_FN[theme])CHUNK_FN[theme](g,i,z0,zc);else if(theme==="office")officeChunk(g,i,z0,zc);else if(theme==="cafe")cafeChunk(g,i,z0,zc);else if(theme==="bridge")bridgeChunk(g,i,z0,zc);else if(theme==="park")parkChunk(g,i,z0,zc);else streetChunk(g,i,z0,zc);
  if(i>0&&i===zoneAt(i).c0){const prev=zoneOf(i-1),kind=theme==="street"?(prev==="bridge"?null:"exit"):theme==="cafe"?"cafe":theme==="office"?(prev==="cafe"?"fromCafe":"enter"):null;if(kind)doorway(g,z0,kind,i)}
  if(i>=1)populate(g,i,theme,z0);
  else if(i>=0)for(let k=0;k<10;k++)addCoin(g,i,LX[1],.8,z0-(i===0?6:4)-k*1.6);
  noCull(g);world.add(g);chunks.push({i,g,z0});
}

/* obstacles */
const OD={bin:{half:.38,ymin:0,ymax:.92,top:.95},papers:{half:.36,ymin:0,ymax:.82,top:.84},printer:{half:.4,ymin:0,ymax:.8,top:.8},boxes:{half:.45,ymin:0,ymax:.98,top:.98},wetfloor:{half:.32,ymin:0,ymax:.9,top:.92},spill:{half:.75,ymin:0,ymax:.12,soft:true},chair:{half:.36,ymin:0,ymax:1.15,top:1.18},
  colleague:{half:.35,ymin:0,ymax:2.1},colleagueP:{half:.4,ymin:0,ymax:2.1},taxi:{half:1.8,ymin:0,ymax:1.7,top:1.64},hangkpi:{half:.2,ymin:1.15,ymax:5.2},barrier:{half:.2,ymin:1.15,ymax:2.6},
  copier:{half:.5,ymin:0,ymax:1.24,top:1.26},cooler:{half:.36,ymin:0,ymax:1.08,top:1.1},shredder:{half:.38,ymin:0,ymax:.86,top:.88},dump:{half:.9,ymin:0,ymax:.4,soft:true,dump:true}};
function colleagueBase(){const g=new THREE.Group(),shirt=pick(SHIRTS),skin=pick(SKINS);
  [-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#3b4254",.12,.85,.12,s*.15,.43,0)));g.add(mesh(GEO.box,shirt,.72,.82,.42,0,1.25,0));
  const head=new THREE.Group();head.position.y=1.92;g.add(head);head.add(mesh(GEO.sph,skin,.27,.29,.27));personLook(head,.27);
  [-1,1].forEach(s=>head.add(mesh(GEO.sph,"#15151c",.04,.05,.03,s*.09,.03,-.25)));
  if(Math.random()<.3){const v=mesh(GEO.cone,"#f4f6fb",.13,.3,.02,0,1.54,-.215);v.rotation.z=Math.PI;g.add(v);g.add(mesh(GEO.box,pick(["#e53935","#2f6fed","#ffc531"]),.08,.4,.03,0,1.4,-.22))}
  return[g,shirt,skin]}
const OB={
  bin(){const g=new THREE.Group();g.add(mesh(GEO.cyl,"#4c8c6a",.34,.85,.34,0,.43,0));g.add(mesh(GEO.cyl,"#356b4f",.38,.08,.38,0,.88,0));g.add(mesh(GEO.box,"#fff",.25,.2,.02,0,.5,.34));
    for(let k=0;k<2;k++)g.add(mesh(GEO.sph,"#ffffff",.12,.1,.12,rand(-.15,.15),.95,rand(-.15,.15)));return g},
  papers(){const g=new THREE.Group();for(let k=0;k<4;k++){const p=mesh(GEO.box,k===2?"#fff4c2":"#ffffff",.85,.19,.62,rand(-.05,.05),.1+k*.2,0);p.rotation.y=rand(-.25,.25);g.add(p)}g.add(mesh(GEO.box,"#ff4b3e",.3,.03,.3,0,.82,0));return g},
  printer(){const g=new THREE.Group();g.add(mesh(GEO.box,"#e3e7ee",1.0,.6,.74,0,.3,0));g.add(mesh(GEO.box,"#3a3f52",1.0,.14,.62,0,.67,-.04));g.add(mesh(GEO.box,"#ffffff",.6,.02,.5,0,.76,.2));g.add(mesh(GEO.box,"#22b066",.08,.05,.02,.36,.5,.375));return g},
  boxes(){const g=new THREE.Group();g.add(mesh(GEO.box,"#c9935a",.9,.55,.7,0,.28,0));g.add(mesh(GEO.box,"#e8c48a",.92,.06,.12,0,.56,0));const b=mesh(GEO.box,"#d6a066",.6,.42,.5,.08,.77,-.05);b.rotation.y=.3;g.add(b);return g},
  spill(){const g=new THREE.Group(),c=M("#7a4526");const a=new THREE.Mesh(GEO.cyl,c);a.scale.set(.62,.02,.5);a.position.y=.012;g.add(a);
    const b=new THREE.Mesh(GEO.cyl,c);b.scale.set(.38,.02,.32);b.position.set(.42,.012,-.38);g.add(b);g.add(mesh(GEO.cyl,"#a8673d",.3,.022,.18,-.15,.014,.1));
    g.add(mesh(GEO.sph,"#ffffff",.07,.01,.05,-.25,.03,.05));
    const cup=mesh(GEO.cyl,"#ffffff",.13,.28,.13,.62,.13,.3);cup.rotation.z=Math.PI/2;cup.rotation.y=.6;g.add(cup);g.add(mesh(GEO.cyl,"#e53935",.135,.06,.135,.62,.13,.3));g.children[g.children.length-1].rotation.z=Math.PI/2;g.children[g.children.length-1].rotation.y=.6;
    g.rotation.y=rand(0,6);return g},
  wetfloor(){const g=new THREE.Group();[-1,1].forEach(s=>{const p=mesh(GEO.box,"#ffd21f",.6,.9,.04,0,.44,s*.14);p.rotation.x=s*.3;g.add(p)});g.add(mesh(GEO.box,"#1c2445",.06,.36,.02,0,.5,.3));g.add(mesh(GEO.sph,"#1c2445",.04,.04,.02,0,.25,.29));return g},
  chair(){const g=officeChair(pick(["#ff4b3e","#2f6fed","#22b066"]));g.rotation.y=rand(0,6);return g},
  colleague(){const[g,shirt]=colleagueBase();g.add(mesh(GEO.cyl,shirt,.09,.5,.09,.42,1.3,-.15));g.add(mesh(GEO.cyl,"#ffffff",.1,.22,.1,.42,1.55,-.3));g.add(mesh(GEO.cyl,"#7a4a2a",.105,.03,.105,.42,1.67,-.3));g.rotation.y=Math.PI;return g},
  colleagueP(){const[g,shirt]=colleagueBase();[-1,1].forEach(s=>g.add(mesh(GEO.box,shirt,.13,.13,.45,s*.3,1.35,-.3)));for(let k=0;k<6;k++)g.add(mesh(GEO.box,"#ffffff",.6,.1,.45,rand(-.04,.04),1.42+k*.11,-.5));g.rotation.y=Math.PI;return g},
  taxi(){const g=new THREE.Group(),y="#ffc531";g.add(mesh(GEO.box,y,1.75,.75,3.6,0,.62,0));g.add(mesh(GEO.box,"#2a3048",1.55,.55,1.9,0,1.27,-.1));g.add(mesh(GEO.box,y,1.6,.1,1.7,0,1.58,-.1));
    g.add(mesh(GEO.box,"#1c2445",1.77,.14,3.62,0,.72,0));g.add(mesh(GEO.box,"#fff",.5,.18,.3,0,1.72,-.1));
    [-1,1].forEach(a=>[-1,1].forEach(b=>{const w=mesh(GEO.cyl,"#1d1d24",.33,.26,.33,a*.82,.33,b*1.2);w.rotation.z=Math.PI/2;g.add(w)}));
    [-1,1].forEach(a=>g.add(mesh(GEO.box,"#fffbe0",.32,.16,.04,a*.6,.72,1.8)));return g},
  hangkpi(){const g=new THREE.Group();[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#5a6487",.02,3.1,.02,s*.85,3.6,0)));const k=M("#1c2445");const b=new THREE.Mesh(GEO.box,[k,k,k,k,kpiMat,kpiMat]);b.scale.set(2.05,1.0,.1);b.position.y=1.68;g.add(b);return g},
  barrier(){const g=new THREE.Group();[-1,1].forEach(s=>{g.add(mesh(GEO.cyl,"#c8955a",.08,2.6,.08,s*1.0,1.3,0));g.add(mesh(GEO.sph,"#ff4b3e",.12,.12,.12,s*1.0,2.65,0))});
    [1.4,1.85,2.3].forEach(y=>{const b=new THREE.Mesh(GEO.box,stripeMat);b.scale.set(2.2,.32,.1);b.position.y=y;g.add(b)});return g},
  copier(){const g=new THREE.Group();g.add(mesh(GEO.box,"#d9dee8",1.1,.78,.8,0,.39,0));[.2,.46].forEach(y=>g.add(mesh(GEO.box,"#a9b2c4",.9,.03,.02,0,y,.405)));
    g.add(mesh(GEO.box,"#eef1f6",1.1,.4,.8,0,.98,0));g.add(mesh(GEO.box,"#3a3f52",1.12,.07,.82,0,1.215,0));
    g.add(mesh(GEO.box,"#2a3048",.34,.04,.16,.3,1.25,.3));g.add(mesh(GEO.box,"#7fd3ff",.16,.01,.08,.26,1.272,.3));g.add(mesh(GEO.sph,"#22b066",.03,.03,.03,.43,1.27,.33));
    g.add(mesh(GEO.box,"#c4cdda",.3,.04,.52,.72,.88,0));g.add(mesh(GEO.box,"#ffffff",.27,.02,.44,.72,.91,0));const sh=mesh(GEO.box,"#ffffff",.28,.01,.4,.66,.97,0);sh.rotation.z=-.25;g.add(sh);
    g.add(mesh(GEO.box,"#1c2445",.5,.05,.02,-.2,.75,.405));return g},
  cooler(){const g=new THREE.Group();g.add(mesh(GEO.box,"#f4f6fb",.52,.62,.5,0,.31,0));g.add(mesh(GEO.box,"#c4cdda",.4,.16,.04,0,.44,.26));
    g.add(mesh(GEO.box,"#3d7bff",.06,.06,.07,-.1,.48,.3));g.add(mesh(GEO.box,"#ff4b3e",.06,.06,.07,.1,.48,.3));g.add(mesh(GEO.box,"#9aa3b5",.34,.03,.2,0,.34,.28));
    g.add(mesh(GEO.cyl,"#9aa3b5",.16,.05,.16,0,.645,0));g.add(mesh(GEO.cyl,"#8fd0ff",.21,.36,.21,0,.85,0));g.add(mesh(GEO.sph,"#8fd0ff",.21,.08,.21,0,1.03,0));
    g.add(mesh(GEO.cyl,"#5aa9e6",.22,.035,.22,0,.78,0));g.add(mesh(GEO.cyl,"#5aa9e6",.22,.035,.22,0,.95,0));
    g.add(mesh(GEO.cyl,"#ffffff",.055,.24,.055,.33,.5,.1));g.add(mesh(GEO.cyl,"#3d7bff",.06,.035,.06,.33,.63,.1));return g},
  shredder(){const g=new THREE.Group();g.add(mesh(GEO.box,"#3a3f52",.72,.68,.52,0,.34,0));g.add(mesh(GEO.box,"#e9eef7",.5,.36,.02,0,.34,.265));
    for(let k=0;k<6;k++)g.add(mesh(GEO.box,"#ffffff",.03,.28,.01,-.18+k*.07,.32,.278));
    g.add(mesh(GEO.box,"#c4cdda",.76,.16,.56,0,.76,0));g.add(mesh(GEO.box,"#15151c",.5,.02,.08,0,.845,0));g.add(mesh(GEO.sph,"#22b066",.03,.03,.03,.28,.8,.285));
    for(let k=0;k<5;k++){const p=mesh(GEO.box,"#ffffff",.06,.26,.01,-.14+k*.07,.98,0);p.rotation.z=(k-2)*.06;g.add(p)}return g},
  dump(){const g=new THREE.Group();
    /* перекинута коробка, з якої висипались папери */
    const bx=new THREE.Group();bx.position.set(-.45,0,-.25);bx.rotation.y=.5;g.add(bx);
    bx.add(mesh(GEO.box,"#c9935a",.62,.42,.5,0,.21,0));bx.add(mesh(GEO.box,"#b07a44",.62,.03,.5,0,.43,0));const fl=mesh(GEO.box,"#d6a066",.62,.03,.36,0,.34,.42);fl.rotation.x=-.9;bx.add(fl);
    bx.add(mesh(GEO.box,"#1c2445",.2,.08,.01,0,.25,-.255));
    /* акуратні стоси й розкидані аркуші з рядками тексту */
    [[.35,.3,.25],[.55,-.35,.15],[-.1,.45,.1]].forEach(([x,z,h])=>{for(let k=0;k<Math.round(h/.05);k++){const p=new THREE.Mesh(GEO.box,paperMat);p.scale.set(.42,.05,.56);p.position.set(x+rand(-.03,.03),.025+k*.05,z);p.rotation.y=rand(-.15,.15);g.add(p)}});
    for(let k=0;k<14;k++){const p=new THREE.Mesh(GEO.box,paperMat);p.scale.set(.42,.012,.56);p.position.set(rand(-.85,.85),.01+rand(0,.06),rand(-.85,.85));p.rotation.set(rand(-.12,.12),rand(0,6),rand(-.12,.12));g.add(p)}
    /* зім'яті кульки паперу й кольорові папки */
    for(let k=0;k<7;k++){const b=new THREE.Mesh(crumpleGeo,M("#f4f6fb"));b.scale.setScalar(rand(.1,.15));b.position.set(rand(-.8,.8),.1,rand(-.8,.8));b.rotation.set(rand(0,6),rand(0,6),0);g.add(b)}
    ["#ff4b3e","#3d7bff","#22b066"].forEach((c,k)=>{const f=mesh(GEO.box,c,.44,.03,.58,rand(-.5,.5),.04+k*.01,rand(-.5,.5));f.rotation.y=rand(0,6);g.add(f)});
    return g},
  car(){const g=new THREE.Group(),c=pick(["#e53945","#2f6fed","#22b066","#f4f6fb","#8a4fff","#ff8a3d","#1d1f26"]);
    g.add(mesh(GEO.box,c,1.8,.68,3.4,0,.6,0));g.add(mesh(GEO.box,"#2a3048",1.55,.5,1.8,0,1.18,-.1));g.add(mesh(GEO.box,c,1.62,.08,1.65,0,1.46,-.1));
    g.add(mesh(GEO.box,"#1c2445",1.82,.1,3.42,0,.42,0));
    [-1,1].forEach(a=>[-1,1].forEach(b=>{const w=mesh(GEO.cyl,"#1d1d24",.33,.26,.33,a*.82,.33,b*1.15);w.rotation.z=Math.PI/2;g.add(w)}));
    [-1,1].forEach(a=>{g.add(mesh(GEO.box,MB("#fffbe0"),.32,.16,.04,a*.6,.72,1.71));g.add(mesh(GEO.box,MB("#ff4b3e"),.3,.14,.04,a*.62,.72,-1.71))});return g}
};
/* by = floor height (0, or H2 on the cafe's 2nd floor); heights are stored absolute */
const STATIC_OB=new Set(["colleague","colleagueP","bin","papers","printer","boxes","wetfloor","chair","spill","taxi","hangkpi","barrier","copier","cooler","shredder","dump","car","cchair","ctable","bags","oldbox","trunk","rail","hydrant","bench","planter","bike","kiosk","awning","cones","puddle","trash","parkLog","parkToy","parkCafe","parkScooter","parkTrash","parkBike","parkBigLog","parkTerrace","webL","webH"]);
function spawnObs(g,type,lane,z,ci,dir,by){by=by||0;const m=OB[type]();if(STATIC_OB.has(type))mergeStatic(m);m.position.set(LX[lane],by,z);g.add(m);const d=OD[type];
  const o={m,type,x:LX[lane],half:d.half,hx:d.hx,ymin:d.ymin+by,ymax:d.ymax+by,top:d.top===undefined?undefined:d.top+by,soft:!!d.soft,chunk:ci,dead:false,vy:0,spin:0,by,move:dir?{dir,x0:LX[lane],go:false}:null};
  obstacles.push(o);return o}
const coinGeo=new THREE.CylinderGeometry(.3,.3,.07,20),coinMat=new THREE.MeshToonMaterial({color:"#ffc531",emissive:"#6b4000",gradientMap:grad});
const gemGeo=new THREE.OctahedronGeometry(.32),gemMat=new THREE.MeshToonMaterial({color:"#19c6e6",emissive:"#06505f",gradientMap:grad});
function addCoin(g,ci,x,y,z){const m=new THREE.Mesh(coinGeo,coinMat);m.position.set(x,y,z);m.rotation.x=Math.PI/2;g.add(m);coins.push({m,chunk:ci,taken:false})}
function pickupMesh(kind){const g=new THREE.Group();
  if(kind==="mystery"){g.add(mesh(GEO.box,"#8a4fff",.56,.46,.56,0,-.04,0));g.add(mesh(GEO.box,"#a77bff",.62,.12,.62,0,.22,0));
    g.add(mesh(GEO.box,"#ffc531",.12,.6,.6,0,0,0));g.add(mesh(GEO.box,"#ffc531",.6,.6,.12,0,0,0));
    [-1,1].forEach(s=>{const b=mesh(GEO.cone,"#ffc531",.12,.2,.08,s*.1,.36,0);b.rotation.z=s*-Math.PI/2.2;g.add(b)});g.add(mesh(GEO.sph,"#ffd75e",.06,.06,.06,0,.36,0))}
  if(kind==="coffee"){g.add(mesh(GEO.cyl,"#ffffff",.22,.42,.22,0,0,0));g.add(mesh(GEO.cyl,"#6b3e22",.235,.08,.235,0,.22,0));g.add(mesh(GEO.cyl,"#c98b5e",.23,.14,.23,0,-.02,0))}
  else if(kind==="magnet"){const t=new THREE.Mesh(TG(.26,.09,8,20,Math.PI),M("#ff4b3e"));t.rotation.z=Math.PI;g.add(t);[-1,1].forEach(s=>g.add(mesh(GEO.box,"#dfe5ee",.18,.16,.18,s*.26,.06,0)))}
  else if(kind==="bed"){g.add(mesh(GEO.box,"#a0703d",.82,.14,.52,0,-.12,0));g.add(mesh(GEO.box,"#a0703d",.08,.42,.56,-.42,0,0));g.add(mesh(GEO.box,"#ffffff",.76,.1,.48,0,0,0));
    g.add(mesh(GEO.box,"#ffffff",.2,.1,.36,-.27,.09,0));g.add(mesh(GEO.box,"#3d7bff",.48,.06,.5,.13,.07,0));g.scale.setScalar(1.05)}
  else if(kind==="money"){for(let k=0;k<3;k++){const b=mesh(GEO.box,"#3fae5a",.62,.07,.34,0,-.12+k*.08,0);b.rotation.y=(k-1)*.18;g.add(b)}g.add(mesh(GEO.box,"#ffffff",.12,.25,.36,0,-.04,0));
    const c=mesh(GEO.cyl,"#ffc531",.2,.06,.2,0,.14,0);g.add(c);g.add(mesh(GEO.cyl,"#c98600",.1,.065,.1,0,.14,0))}
  else if(kind==="laptop"){const body=M("#eef3fb","#3a4660");g.add(new THREE.Mesh(GEO.box,body));g.children[0].scale.set(.66,.05,.44);g.children[0].position.y=-.16;
    g.add(mesh(GEO.box,"#2a3048",.56,.01,.26,0,-.13,-.04));
    const sc=new THREE.Group();sc.position.set(0,-.14,.21);sc.rotation.x=-.28;g.add(sc);
    const lid=new THREE.Mesh(GEO.box,body);lid.scale.set(.66,.46,.05);lid.position.y=.23;sc.add(lid);
    const scr=new THREE.Mesh(GEO.box,MB("#aaf6ff"));scr.scale.set(.58,.38,.02);scr.position.set(0,.23,-.03);sc.add(scr);
    sc.add(mesh(GEO.box,"#22b066",.34,.06,.02,0,.27,-.045));sc.add(mesh(GEO.box,"#ff4b3e",.2,.05,.02,0,.17,-.045));
    const back=new THREE.Mesh(GEO.box,MB("#ffc531"));back.scale.set(.14,.14,.01);back.position.set(0,.23,.03);sc.add(back);
    g.scale.setScalar(1.35)}
  else if(kind==="gem"){g.add(new THREE.Mesh(gemGeo,gemMat))}
  else if(kind==="gem3"){[[-.3,-.12],[.3,-.12],[0,.3]].forEach(([x,y],k)=>{const m=new THREE.Mesh(gemGeo,gemMat);m.scale.setScalar(k===2?1:.85);m.position.set(x,y,0);g.add(m)});g.add(mesh(GEO.sph,"#ffffff",.06,.06,.06,.12,.45,-.1))}
  else if(kind==="money5"){g.add(mesh(GEO.sph,"#d9b380",.38,.42,.36,0,-.08,0));g.add(mesh(GEO.cyl,"#d9b380",.14,.14,.14,0,.33,0));g.add(mesh(GEO.cyl,"#8a5a34",.16,.05,.16,0,.28,0));
    [-1,1].forEach(q=>{const e=mesh(GEO.cone,"#d9b380",.1,.16,.06,q*.1,.44,0);e.rotation.z=-q*.5;g.add(e)});
    const c=mesh(GEO.cyl,"#ffc531",.17,.03,.17,0,-.05,-.34);c.rotation.x=Math.PI/2;g.add(c);g.add(mesh(GEO.box,"#c98600",.04,.16,.01,0,-.05,-.36));
    [[-.35,-.38],[.32,-.42],[.1,-.45]].forEach(([x,y])=>{const k=mesh(GEO.cyl,"#ffc531",.1,.03,.1,x,y,-.1);k.rotation.x=.4;g.add(k)});g.scale.setScalar(1.05)}
  else if(kind==="money10"){g.add(mesh(GEO.box,"#7a4a2a",.8,.42,.55,0,-.18,0));[-.3,.3].forEach(x=>g.add(mesh(GEO.box,"#ffc531",.06,.44,.57,x,-.18,0)));
    const lid=new THREE.Group();lid.position.set(0,.03,.27);lid.rotation.x=-1.0;g.add(lid);const lb=mesh(GEO.cyl,"#8a5a34",.27,.8,.27,0,0,-.27);lb.rotation.z=Math.PI/2;lid.add(lb);
    for(let k=0;k<9;k++)g.add(mesh(GEO.cyl,"#ffd84a",.1,.04,.1,rand(-.3,.3),.05+rand(0,.08),rand(-.18,.18)));g.add(mesh(GEO.sph,"#ffd84a",.36,.12,.22,0,.04,0));
    g.add(mesh(GEO.sph,"#ff4b3e",.06,.06,.06,0,-.14,-.29));g.scale.setScalar(1.1)}
  return g}
const glowTex=texOf((x)=>{const g=x.createRadialGradient(64,64,6,64,64,62);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(.6,"rgba(255,255,255,0)");g.addColorStop(.78,"rgba(255,255,255,.85)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128)},128,128);
const GLOW={mystery:"#c58bff",coffee:"#ffc531",bed:"#7fb2ff",laptop:"#5ff0ff",money:"#7dff9a",money5:"#ffe066",money10:"#ffb12e",gem:"#5ff0ff",gem3:"#8ffcff",magnet:"#ff7a6e"};
const beamGeo=new THREE.CylinderGeometry(.07,.07,7,8,1,true),ringGeo=new THREE.RingGeometry(.42,.56,28),BEAM={},GLOWM={},RINGM={};
function addPickup(g,ci,kind,x,z,by){by=by||0;const m=pickupMesh(kind);m.scale.multiplyScalar(1.3);m.position.set(x,1.0+by,z);g.add(m);
  const bc=GLOW[kind]||"#ffffff";if(!BEAM[bc])BEAM[bc]=new THREE.MeshBasicMaterial({color:bc,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide});
  const beam=new THREE.Mesh(beamGeo,BEAM[bc]);beam.position.set(x,3.5+by,z);g.add(beam);
  const gl=new THREE.Sprite(GLOWM[bc]||(GLOWM[bc]=new THREE.SpriteMaterial({map:glowTex,color:bc,transparent:true,opacity:.7,depthWrite:false})));gl.scale.setScalar(kind==="laptop"||kind==="money10"||kind==="gem3"?2.1:1.7);gl.position.set(x,1.0+by,z-.7);g.add(gl);
  const ring=new THREE.Mesh(ringGeo,RINGM[bc]||(RINGM[bc]=new THREE.MeshBasicMaterial({color:bc,transparent:true,opacity:.75,depthWrite:false})));ring.rotation.x=-Math.PI/2;ring.position.set(x,.04+by,z);g.add(ring);
  pickups.push({m,kind,chunk:ci,taken:false,gl,ring,beam,by})}

/* v55: перевірка сусідніх рядів перешкод. Ряд — масив L із 3 доріжок: null — вільно, "low"/"over" — стрибок або підкат,
   "low2" — калюжа (пробігається), "tall" — тільки оминути. Для рядів, ближчих за 14 м (довжина стрибка):
   1) два ряди поспіль не можуть бути без жодної вільної доріжки — інакше на середній швидкості треба стрибати двічі з вікном ~0,1 с;
   2) прохідна доріжка нового ряду має бути поруч (не далі однієї доріжки) з прохідною доріжкою попереднього —
      інакше треба перескочити дві доріжки за чверть секунди. Ряд, що не підходить, генерується наново (до 10 спроб). */
let ROWP=null;
const rowFree=L=>[0,1,2].filter(k=>!L[k]||L[k]==="low2"),rowPass=L=>[0,1,2].filter(k=>L[k]!=="tall");
function rowFits(L,z){if(!ROWP||ROWP.z-z>14)return true;const f=rowFree(L),p=rowPass(L);
  if(!ROWP.free.length&&!f.length)return false;
  return p.some(a=>ROWP.pass.some(b=>Math.abs(a-b)<=1))}
function rowMark(L,z,busy){ROWP={z,free:rowFree(L).filter(k=>!(busy&&busy.includes(k))),pass:rowPass(L)}}
function rowPick(gen,z){for(let k=0;k<10;k++){const L=gen();if(rowFits(L,z))return L}return[null,null,null]}
function populate(g,ci,theme,z0){
  if(POP_FN[theme]){POP_FN[theme](g,ci,z0);return}
  if(theme==="cafe"){populateCafe(g,ci,z0);return}
  if(theme==="bridge"){populateBridge(g,ci,z0);return}
  if(theme==="park"){populatePark(g,ci,z0);return}
  const TY=theme==="office"?{low:["bin","papers","printer","boxes","wetfloor","chair","chair","spill","spill","shredder","shredder","copier","copier","cooler","cooler"],tall:["colleague","colleagueP"],over:["hangkpi"]}:{low:["bin","dump","dump"],tall:["taxi","colleague","taxi"],over:["barrier"]};
  /* тротуар (права доріжка вулиці): свої перешкоди */
  const SW={low:["hydrant","bench","planter","bike","hydrant","bench"],tall:["kiosk","dogwalk"],over:["awning"]};
  const Zp=zoneAt(ci),calm=ci===Zp.c0,lOf=rz=>-rz-Zp.c0*CH;
  const rows=[];let z=z0-5;if(z>-START_CLEAR&&z0-CH<-START_CLEAR)z=-START_CLEAR-1;const gap=rowGap(ci);
  while(z>z0-CH+2){rows.push(z);z-=gap+rand(0,2.5)}
  if(rows.length>2&&Math.random()<.3)rows.splice(1+ri(rows.length-1),1);
  let skipNext=false;
  rows.forEach(rz=>{if((calm&&rz>z0-10)||rz>-START_CLEAR)return;if(skipNext){skipNext=false;return}
    if(!calm&&-rz>=evNext){evNext=-rz+rand(300,400);if(theme==="office"&&Math.random()<.5)meeting(g,ci,rz);else courier(g,ci,rz);skipNext=true;ROWP=null;return}
    const sw=theme==="street"&&Zp.pre&&lOf(rz)>=SW0-2;
    if(theme==="street"&&!calm){const q=Math.random();if(q<.16){crosswalk(g,ci,rz);skipNext=true;ROWP=null;return}if(q<.3&&!(Zp.pre&&lOf(rz)>=SW0-15)){crossing(g,ci,rz);skipNext=true;ROWP=null;return}}
    /* бізнес-зустріч на лівій доріжці (після 1 км): тільки оминати */
    if(theme==="office"&&!calm&&-rz>=1000&&Math.random()<.11){bizMeeting(g,ci,rz);const Lb=["tall",null,null];if(Math.random()<.35){const ln=1+ri(2);spawnObs(g,pick(["bin","papers","boxes","wetfloor"]),ln,rz,ci,0);Lb[ln]="low"}rowMark(Lb,rz-2);return}
    const L=rowPick(()=>{const L=[null,null,null],r=Math.random();
      if(r<.33)L[ri(3)]="tall";
      else if(r<.58){const f=ri(3);for(let k=0;k<3;k++)if(k!==f)L[k]="tall";if(Math.random()<.35)L[f]=Math.random()<.5?"low":"over"}
      else if(r<.78){for(let k=0;k<3;k++)L[k]=Math.random()<.55?"low":"over"}
      else L[ri(3)]=Math.random()<.5?"low":"over";
      return L},rz),busy=[];
    L.forEach((c,lane)=>{if(!c)return;const type=pick(sw&&lane===2?SW[c]:TY[c]);let dir=0;
      if(type==="chair"){const opts=[lane-1,lane+1].filter(k=>k>=0&&k<3&&!L[k]);if(opts.length){dir=pick(opts)-lane;busy.push(lane+dir)}}
      const o=spawnObs(g,type,lane,rz,ci,dir);if(type==="dogwalk"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z:rz,f:t=>{if(o.dead)return;u.d.tail.rotation.y=Math.sin(t*9+ph)*.7;u.d.head.rotation.z=Math.sin(t*1.5+ph)*.15;u.w.head.rotation.x=.35+Math.sin(t*.8+ph)*.05}})}});
    rowMark(L,rz,busy);
    if(sw&&!L[2]&&Math.random()<.3)pigeons(g,ci,LX[2],rz)});
  for(let k=0;k<rows.length;k++){const a=rows[k]-2.2,b=(k+1<rows.length?rows[k+1]:z0-CH-3)+2.2;const len=a-b;if(len<3)continue;
    const lane=ri(3),x=LX[lane],r=Math.random();
    if(r<.03&&!calm&&boostTake(ci))addPickup(g,ci,pick(["coffee","coffee","bed","bed","laptop"]),x,(a+b)/2);
    else{const fit=[3,5,10].filter(n=>(n-1)*1.4<=len);if(!fit.length)continue;const n=fit.length>1&&Math.random()<.35?fit[fit.length-2]:fit[fit.length-1];
      const st0=a-(len-(n-1)*1.4)/2;for(let q=0;q<n;q++)addCoin(g,ci,x,.8,st0-q*1.4)}}
}

/* v55: бустів (кава, ліжко, ноутбук, магніт) — не більше одного на локацію. Гроші й кристали не обмежуються.
   boostTake викликається лише тоді, коли буст справді збираються поставити, і «займає» локацію. */
const BOOSTED=new Set();
function boostTake(ci){const id=zoneAt(ci).id;if(BOOSTED.has(id))return false;BOOSTED.add(id);return true}
/* timed spawns: gem, money, magnet + 3x5 coin block, once a minute each */
function findChunk(z){return chunks.find(c=>c.z0>=z&&z>c.z0-CH)}
function clearArea(z1,z2,lanes,by){
  const inL=x=>!lanes||lanes.some(l=>Math.abs(LX[l]-x)<1.2);
  for(const o of obstacles){if(o.dead||o.raft)continue;if(by!==undefined&&Math.abs((o.by||0)-by)>1.5)continue;const oz=o.m.position.z;if(oz-o.half>z1||oz+o.half<z2)continue;
    const xs=(o.lat||o.car)?LX.slice():o.move?[o.move.x0,o.move.x0+o.move.dir*2.2]:[o.x];if(xs.some(inL)){o.dead=true;o.m.visible=false}}
  for(const c of coins.concat(pickups)){if(c.taken)continue;const p=c.m.position;if(p.z>z1||p.z<z2)continue;if(by!==undefined&&Math.abs(p.y-by-1)>2.5)continue;if(!lanes||lanes.some(l=>Math.abs(LX[l]-p.x)<.6)){c.taken=true;c.m.visible=false;if(c.gl){c.gl.visible=false;c.ring.visible=false;c.beam.visible=false}}}}
function spawnTimed(kind){const zt=st.z-115,c=findChunk(zt);if(!c)return false;
  const P=planAt(zt),by=P&&st.lvl>H2-1&&zt<P.zU1-1&&zt-18>P.zD0?H2:0;
  /* v55: не ставити баф і монети на кавову річку (столів на ній більше немає, тож туди не дістатися без опіку) */
  const hot=(l,z1,z2)=>by===0&&P&&P.rivers.some(R=>R.lane===l&&z1>=R.zF-1&&z2<=R.zN+1);
  if(kind==="block"){clearArea(zt+3,zt-14,undefined,by);
    /* магніт ставиться лише якщо в цій локації ще не було бусту; монети — завжди */
    const ml=[1,0,2].find(l=>!hot(l,zt+1,zt-1));if(ml!==undefined&&boostTake(c.i))addPickup(c.g,c.i,"magnet",LX[ml],zt,by);
    for(let l=0;l<3;l++)for(let q=0;q<5;q++){const z=zt-4-q*1.6;if(!hot(l,z+.5,z-.5))addCoin(c.g,c.i,LX[l],.8+by,z)}}
  else{const ok=[0,1,2].filter(l=>!hot(l,zt+2.5,zt-2.5));if(!ok.length)return false;const lane=pick(ok);clearArea(zt+2.5,zt-2.5,[lane],by);addPickup(c.g,c.i,kind==="money"?moneyTier():kind,LX[lane],zt,by)}
  return true}
/* гроші трьох рівнів: 100, 500, 1000. Чим далі забіг, тим частіше великі */
const MONEY={money:100,money5:500,money10:1000};
function moneyTier(){const f=Math.min(1,Math.max(0,st.dist)/2000),p3=lerp(.02,.25,f),p2=lerp(.18,.4,f),r=Math.random();return r<p3?"money10":r<p3+p2?"money5":"money"}
const poofTex=texOf((x)=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.5,"rgba(160,235,255,.8)");g.addColorStop(1,"rgba(160,235,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128)},128,128);
let puffs=[];
function puff(pos){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:poofTex,transparent:true,depthWrite:false}));sp.position.set(pos.x,pos.y+.8,pos.z);sp.scale.setScalar(.5);world.add(sp);puffs.push({sp,t:0})}

/* street rows: zebra crossing with walking people, crossroad with a car */
function crosswalk(g,ci,z){const d=new THREE.Group();
  for(let k=-4;k<=4;k++)d.add(mesh(GEO.box,"#f4f6fb",.55,.02,1.9,k*.95,.015,z));
  [-1,1].forEach(s=>{d.add(mesh(GEO.cyl,"#3a3f52",.06,2.6,.06,s*4.6,1.3,z+1.3));d.add(mesh(GEO.box,"#1c2445",.26,.55,.2,s*4.6,2.7,z+1.3));
    d.add(mesh(GEO.sph,MB("#ff4b3e"),.07,.07,.03,s*4.6,2.85,z+1.41));d.add(mesh(GEO.sph,MB("#3b4254"),.07,.07,.03,s*4.6,2.55,z+1.41))});
  freeze(d);g.add(d);
  const p0=Math.random()*11,dir=pick([-1,1]),sp=rand(1.3,1.8);
  for(let k=0;k<2;k++){const w=walker();w.position.set(0,0,z+(k?.45:-.45));w.rotation.y=dir>0?-Math.PI/2:Math.PI/2;g.add(w);
    /* v55: пішохід іде боком, тож уздовж доріжок він вузький: hx .75 → .55, щоб не чіпати того, хто вже майже пішов */
    obstacles.push({m:w,type:"ped",x:0,half:.4,hx:.55,ymin:0,ymax:2.1,chunk:ci,dead:false,vy:0,spin:0,lat:{p0:p0+k*5.5,v:sp*dir,L:11,c:-5.5}})}}
function crossing(g,ci,z){const d=new THREE.Group();
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#4d566b",3.42,.04,3.6,s*6,.28,z));for(let k=-1;k<=1;k+=2)d.add(mesh(GEO.box,"#f4f6fb",3.3,.02,.12,s*6,.31,z+k*1.4));
    d.add(mesh(GEO.cyl,"#3a3f52",.06,2.6,.06,s*4.55,1.3,z+2.2));d.add(mesh(GEO.box,"#1c2445",.26,.75,.2,s*4.55,2.75,z+2.2));
    [["#ff4b3e",2.98],["#ffc531",2.75],["#22b066",2.52]].forEach(([c,y],i)=>d.add(mesh(GEO.sph,MB(i===1?c:"#3b4254"),.07,.07,.03,s*4.55,y,z+2.31)))});
  d.add(mesh(GEO.box,"#f4f6fb",8.4,.02,.25,0,.012,z+2.1));d.add(mesh(GEO.box,"#f4f6fb",8.4,.02,.25,0,.012,z-2.1));
  freeze(d);g.add(d);
  const dir=pick([-1,1]),x0=-dir*6.2,m=OB.car();m.rotation.y=dir*Math.PI/2;m.position.set(x0,.26,z);g.add(m);
  obstacles.push({m,type:"car",x:x0,half:.95,hx:2.0,ymin:0,ymax:1.6,top:1.5,chunk:ci,dead:false,vy:0,spin:0,car:{x0,xe:-x0,xa:rand(-2.6,2.6),go:false,v:0}})}


/* ---------- тротуар (права доріжка вулиці), міст, бізнес-зустріч, вітрове сміття ---------- */
Object.assign(OD,{hydrant:{half:.3,ymin:0,ymax:.82,top:.84},bench:{half:.32,ymin:0,ymax:.95,top:.97},planter:{half:.48,ymin:0,ymax:.7,top:.72},bike:{half:.85,ymin:0,ymax:1.05},
  kiosk:{half:.75,ymin:0,ymax:2.6},dogwalk:{half:.55,hx:1.0,ymin:0,ymax:2.1},awning:{half:.2,ymin:1.15,ymax:2.6},
  cones:{half:.3,ymin:0,ymax:.75},fisher:{half:.45,ymin:0,ymax:2.1},tourist:{half:.45,ymin:0,ymax:2.1},cyclist:{half:.9,ymin:0,ymax:2.0},puddle:{half:.8,ymin:0,ymax:.1,soft:true},
  bizmeet:{half:2.0,hx:.95,ymin:0,ymax:2.1},trash:{half:.35,hx:.55,ymin:.2,ymax:.9}});
function bikeModel(c){const g=new THREE.Group();[-1,1].forEach(q=>{const w=new THREE.Mesh(TG(.33,.04,6,18),M("#1d1d24"));w.rotation.y=Math.PI/2;w.position.set(0,.35,q*.55);g.add(w);
    g.add(mesh(GEO.cyl,"#9aa3b5",.02,.6,.02,0,.35,q*.55))});
  const f=(y1,z1,y2,z2)=>{const l=Math.hypot(y2-y1,z2-z1),m=mesh(GEO.cyl,c,.035,l,.035,0,(y1+y2)/2,(z1+z2)/2);m.rotation.x=Math.atan2(z2-z1,y2-y1);g.add(m)};
  f(.35,-.55,.75,-.05);f(.35,.55,.75,-.05);f(.75,-.05,.78,.42);f(.35,-.55,.72,-.42);f(.72,-.42,.78,.42);
  g.add(mesh(GEO.box,"#1c1c24",.12,.05,.25,0,.82,.42));g.add(mesh(GEO.cyl,"#1c1c24",.025,.5,.025,0,.95,-.45));const hb=mesh(GEO.cyl,"#1c1c24",.025,.5,.025,0,1.2,-.45);hb.rotation.z=Math.PI/2;g.add(hb);return g}
Object.assign(OB,{
  hydrant(){const g=new THREE.Group();g.add(mesh(GEO.cyl,"#d4231a",.22,.62,.22,0,.31,0));g.add(mesh(GEO.sph,"#e53935",.22,.18,.22,0,.62,0));g.add(mesh(GEO.cyl,"#b01c14",.26,.06,.26,0,.06,0));
    g.add(mesh(GEO.cyl,"#ffc531",.06,.08,.06,0,.82,0));[-1,1].forEach(q=>{const n=mesh(GEO.cyl,"#b01c14",.08,.16,.08,q*.26,.42,0);n.rotation.z=Math.PI/2;g.add(n)});
    const fr=mesh(GEO.cyl,"#b01c14",.09,.12,.09,0,.42,-.26);fr.rotation.x=Math.PI/2;g.add(fr);return g},
  bench(){const g=new THREE.Group(),w="#a0703d";[0,1,2].forEach(k=>g.add(mesh(GEO.box,w,1.7,.05,.14,0,.48,-.17+k*.17)));[0,1].forEach(k=>g.add(mesh(GEO.box,w,1.7,.12,.05,0,.72+k*.18,.24)));
    [-1,1].forEach(q=>{g.add(mesh(GEO.box,"#2a3048",.06,.48,.5,q*.75,.24,0));g.add(mesh(GEO.box,"#2a3048",.06,.55,.06,q*.75,.75,.25))});return g},
  planter(){const g=new THREE.Group();g.add(mesh(GEO.box,"#b9b2a6",.95,.55,.95,0,.28,0));g.add(mesh(GEO.box,"#a39b8e",1.0,.06,1.0,0,.56,0));g.add(mesh(GEO.box,"#5a3a26",.85,.04,.85,0,.58,0));
    for(let k=0;k<7;k++){const x=rand(-.3,.3),z=rand(-.3,.3);g.add(mesh(GEO.cyl,"#3fae5a",.015,.25,.015,x,.7,z));g.add(mesh(GEO.sph,pick(["#ff7fae","#ffd166","#ff4b3e","#b18cff","#ffffff"]),.07,.06,.07,x,.83,z))}return g},
  bike(){return bikeModel(pick(["#2f6fed","#e53935","#22b066","#ffc531"]))},
  kiosk(){const g=new THREE.Group(),c=pick(["#2f7d5b","#2e5fd6","#c0392b"]);g.add(mesh(GEO.box,c,1.7,2.2,1.3,0,1.1,0));g.add(mesh(GEO.box,"#f4f6fb",1.75,.12,1.35,0,2.26,0));
    const aw=new THREE.Mesh(GEO.box,awningMat);aw.scale.set(1.9,.08,.7);aw.position.set(0,2.0,.85);aw.rotation.x=.35;g.add(aw);
    g.add(mesh(GEO.box,"#e9eef7",1.5,.9,.04,0,1.4,.66));for(let k=0;k<6;k++)g.add(mesh(GEO.box,pick(["#ff4b3e","#ffc531","#3d7bff","#22b066","#ff7fae"]),.2,.28,.02,-.6+k*.24,1.45+(k%2)*.12,.69));
    g.add(mesh(GEO.box,"#c4cdda",1.5,.08,.4,0,.95,.75));return g},
  dogwalk(){const g=new THREE.Group(),w=walker(true);g.add(w);const d=dogModel(true);d.scale.setScalar(.7);d.position.set(.55,0,-.9);d.rotation.y=Math.PI/2;g.add(d);
    const lsh=mesh(GEO.cyl,"#e53935",.012,1.05,.012,.5,.95,-.5);lsh.rotation.x=.9;g.add(lsh);const ua=w.userData.arm;ua.rotation.x=-1.4;ua.add(mesh(GEO.box,"#1c1c24",.07,.2,.12,0,-.62,-.1));g.rotation.y=Math.PI;g.userData={w:w.userData,d:d.userData};return g},
  awning(){const g=new THREE.Group();[-1,1].forEach(q=>g.add(mesh(GEO.cyl,"#3a3f52",.05,2.7,.05,q*1.05,1.35,0)));g.add(mesh(GEO.box,"#3a3f52",2.2,.06,.06,0,2.62,0));
    const b=new THREE.Mesh(GEO.box,[M("#3a3f52"),M("#3a3f52"),M("#3a3f52"),M("#3a3f52"),saleMat,saleMat]);b.scale.set(1.9,.95,.08);b.position.y=1.85;g.add(b);
    [-1,1].forEach(q=>g.add(mesh(GEO.cyl,"#9aa3b5",.01,.3,.01,q*.8,2.45,0)));return g},
  cones(){const g=new THREE.Group();[-.62,0,.62].forEach(x=>{g.add(mesh(GEO.box,"#ff6a1f",.42,.05,.42,x,.025,0));g.add(mesh(GEO.cone,"#ff6a1f",.2,.66,.2,x,.38,0));
    [.28,.48].forEach(y=>g.add(mesh(GEO.cyl,"#ffffff",.2-y*.22,.06,.2-y*.22,x,y,0)))});return g},
  fisher(){const g=new THREE.Group(),w=walker(true);g.add(w);const u=w.userData;u.arm.rotation.x=-1.2;
    const rod=new THREE.Group();rod.position.set(-.44,1.05,-.45);rod.rotation.x=-.95;g.add(rod);rod.add(mesh(GEO.cyl,"#5a3a26",.025,2.8,.025,0,1.4,0));rod.add(mesh(GEO.cyl,"#1c1c24",.05,.12,.05,0,.3,.05));
    g.add(mesh(GEO.cyl,"#3d7bff",.2,.36,.17,.45,.18,.1));g.add(mesh(GEO.cyl,"#6aa0ff",.18,.02,.15,.45,.37,.1));
    g.add(mesh(GEO.sph,"#3a5a3a",.3,.12,.3,0,2.15,0));g.add(mesh(GEO.cyl,"#3a5a3a",.36,.03,.36,0,2.08,0));g.userData={rod};return g},
  tourist(){const g=new THREE.Group(),w=walker(true);g.add(w);const u=w.userData;u.arm.rotation.set(-1.6,0,-.5);
    g.add(mesh(GEO.box,"#1c1c24",.3,.2,.12,-.05,1.92,-.48));g.add(mesh(GEO.cyl,"#3a3f52",.07,.12,.07,-.05,1.92,-.58));g.children[g.children.length-1].rotation.x=Math.PI/2;
    g.add(mesh(GEO.box,"#ff7fae",.55,.5,.3,0,1.35,.32));g.add(mesh(GEO.cyl,"#ffd166",.36,.04,.36,0,2.25,0));g.add(mesh(GEO.sph,"#ffd166",.22,.14,.22,0,2.3,0));g.userData={u};return g},
  cyclist(){const g=new THREE.Group(),b=bikeModel(pick(["#2f6fed","#e53935","#22b066"]));g.add(b);const w=walker(true);w.scale.setScalar(.92);w.position.set(0,.05,.05);g.add(w);
    const u=w.userData;u.legL.position.y=.95;u.legR.position.y=.95;u.arm.rotation.x=-1.0;g.add(mesh(GEO.sph,"#ffc531",.3,.2,.32,0,2.0,.02));g.rotation.y=Math.PI;g.userData={u};return g},
  puddle(){const g=new THREE.Group();const a=new THREE.Mesh(GEO.cyl,puddleMat);a.scale.set(.85,.01,.6);a.position.y=.012;g.add(a);const b=new THREE.Mesh(GEO.cyl,puddleMat);b.scale.set(.45,.01,.4);b.position.set(.5,.012,.4);g.add(b);
    g.add(mesh(GEO.sph,"#ffffff",.12,.005,.05,-.2,.02,-.1));g.rotation.y=rand(0,6);return g},
  bizmeet(){const g=new THREE.Group(),ppl=[];g.add(mesh(GEO.box,"#5a3a26",.95,.08,2.5,0,.76,0));g.add(mesh(GEO.box,"#3a2418",.97,.03,2.52,0,.71,0));[-1,1].forEach(q=>g.add(mesh(GEO.box,"#3a2418",.7,.72,.08,0,.36,q*.9)));
    g.add(mesh(GEO.box,"#a7b1c2",.42,.03,.3,.05,.82,-.3));const sc=mesh(GEO.box,"#a7b1c2",.42,.3,.03,.05,.97,-.45);g.add(sc);g.add(mesh(GEO.box,"#7fd3ff",.36,.24,.01,.05,.97,-.43));
    [[-.2,.45],[.25,.6],[-.25,-.8]].forEach(([x,z])=>{g.add(mesh(GEO.cyl,"#ffffff",.06,.1,.06,x,.85,z));g.add(mesh(GEO.box,"#ffffff",.25,.01,.32,x+.15,.81,z-.15))});
    [[-1.05,.6,-Math.PI/2],[-1.05,-.6,-Math.PI/2],[0,1.75,0],[0,-1.75,Math.PI]].forEach(([x,z,r])=>{const w=seatedWorker(true);w.position.set(x,0,z);w.rotation.y=r;g.add(w);ppl.push(w)});
    const fc=new THREE.Group();fc.position.set(-.95,0,0);g.add(fc);[-1,1].forEach(q=>{const l=mesh(GEO.cyl,"#3a3f52",.025,1.8,.025,0,.9,q*.3);fc.add(l)});const bd=new THREE.Mesh(GEO.box,faced(boardMat,"#c6ccd8",0));bd.scale.set(.04,.7,.95);bd.position.set(0,1.5,0);fc.add(bd);
    const tb=new THREE.Sprite(ownMat(new THREE.SpriteMaterial({map:talkTex,transparent:true,depthWrite:false})));tb.scale.setScalar(.85);tb.position.set(0,2.75,0);g.add(tb);g.userData={ppl,tb};return g},
  trash(){const g=new THREE.Group(),k=ri(4);
    if(k===0){const a=new THREE.Mesh(GEO.box,paperMat);a.scale.set(.7,.012,.5);g.add(a);const b=new THREE.Mesh(GEO.box,paperMat);b.scale.set(.7,.012,.5);b.position.set(.05,.04,.04);b.rotation.z=.4;g.add(b)}
    else if(k===1){const c=pick(["#ffffff","#7fd3ff","#ff7fae","#ffd166"]);g.add(mesh(GEO.sph,c,.32,.26,.28));[-1,1].forEach(q=>{const h=new THREE.Mesh(TG(.1,.025,6,12),M(c));h.position.set(q*.12,.27,0);g.add(h)})}
    else if(k===2){g.add(mesh(GEO.box,"#c9935a",.5,.4,.45));g.add(mesh(GEO.box,"#e8c48a",.52,.05,.12,0,.2,0))}
    else{g.add(mesh(GEO.cyl,"#ffffff",.13,.34,.11));g.add(mesh(GEO.cyl,"#e53935",.135,.1,.115,0,.05,0));g.add(mesh(GEO.cyl,"#6b3e22",.14,.03,.14,0,.17,0))}
    return g}});
/* як падає збите: люди падають, важкі речі перекидаються, легкі злітають і падають, машини лише здригаються */
const KN_FALL=new Set(["colleague","colleagueP","ped","courier","dogR","dogL","fisher","tourist","cyclist","dogwalk","meet","bizmeet"]),
  KN_TIP=new Set(["copier","cooler","printer","shredder","trunk","bags","kiosk","bench","planter","hydrant","rail","oldbox","bike"]),KN_BUMP=new Set(["taxi","car"]);
/* ---------- events after 1 km: hallway meeting, courier with boxes ---------- */
function meeting(g,ci,z){const ln=pick([[1,2],[0,1]]),cx=(LX[ln[0]]+LX[ln[1]])/2,groups=ln.map(l=>{const gr=new THREE.Group();gr.position.set(LX[l],0,z);g.add(gr);return gr}),ppl=[];
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3,px=cx+Math.cos(a)*1.55,pz=z+Math.sin(a)*1.05,gr=groups[px<cx?0:1],w=walker();
    w.position.set(px-gr.position.x,0,pz-z);w.rotation.y=Math.atan2(-(cx-px),-(z-pz));gr.add(w);ppl.push(w)}
  const fc=new THREE.Group();fc.position.set(cx-groups[0].position.x,0,0);groups[0].add(fc);
  [-1,1].forEach(s=>{const l=mesh(GEO.cyl,"#3a3f52",.03,1.9,.03,s*.35,.95,0);l.rotation.z=s*.12;fc.add(l)});
  const bd=new THREE.Mesh(GEO.box,faced(boardMat,"#c6ccd8",4));bd.scale.set(1.0,.75,.04);bd.position.set(0,1.65,.04);fc.add(bd);
  const tb=new THREE.Sprite(ownMat(new THREE.SpriteMaterial({map:talkTex,transparent:true,depthWrite:false})));tb.scale.setScalar(.9);tb.position.set(0,2.9,0);fc.add(tb);
  groups.forEach(gr=>{gr.userData.ppl=gr.children.filter(c=>c.userData&&c.userData.legL)});
  groups.forEach((gr,k)=>obstacles.push({m:gr,type:"meet",x:gr.position.x,half:1.45,ymin:0,ymax:2.1,chunk:ci,dead:false,vy:0,spin:0,by:0,warn:k===0?"meeting":null}));
  anims.push({chunk:ci,z,f:t=>{ppl.forEach((w,k)=>{w.userData.head.rotation.y=Math.sin(t*1.5+k)*.4;w.userData.arm.rotation.x=-1.0+Math.sin(t*3+k*1.7)*.45});tb.position.y=2.9+Math.sin(t*3)*.08}})}
function bizMeeting(g,ci,z){const o=spawnObs(g,"bizmeet",0,z,ci,0),u=o.m.userData,ph=rand(0,6);
  anims.push({chunk:ci,z,f:t=>{u.ppl.forEach((w,k)=>{const h=w.userData.head,[aL,aR]=w.userData.arms;if(o.dead)return;h.rotation.y=Math.sin(t*1.1+k*2+ph)*.5;
    const talk=Math.floor(t*.4+ph)%4===k;aR.rotation.x=talk?-1.2+Math.sin(t*6+k)*.5:.5;aL.rotation.x=talk?-.6+Math.sin(t*5+k)*.4:.5});u.tb.position.y=2.75+Math.sin(t*3)*.08}})}
function courier(g,ci,z){const lane=ri(3);clearArea(z+30,z-3);const o=spawnObs(g,"courier",lane,z,ci,0);o.cour={go:false,v:5.5,tt:.45,n:0,lane,side:Math.random()<.5?-1:1};o.warn="courier"}



/* ---------- вітер на мосту: кидає сміття поперек доріжок (повноцінне зіткнення) ---------- */
function bridgeL(z){const i=Math.floor(-z/CH);if(i<0)return -1;const Z=zoneAt(i);return Z.kind==="bridge"?-z-Z.c0*CH:-1}
let streaks=[];const streakMat=new THREE.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:.6,depthWrite:false});
function windGust(dir){let D=rand(32,38);const n=2+ri(2),used=[];
  /* сміття не прилітає туди, де вже стоїть перешкода (±3 м): інакше можна отримати ряд, який не пройти */
  const busy=z=>obstacles.some(o=>!o.dead&&!o.wind&&Math.abs(o.m.position.z-z)<3+(o.half||0));
  for(let j=0;j<n;j++,D+=rand(9,13)){let z=st.z-D;for(let k=0;k<6&&busy(z);k++){z-=2;D+=2}if(busy(z))continue;const c=findChunk(z),bl=bridgeL(z);if(!c||bl<14||bl>404)continue;
    let lane=ri(3);if(used.length&&lane===used[used.length-1])lane=(lane+1+ri(2))%3;used.push(lane);
    const xa=LX[lane],x0=-dir*6.6,tA=D/Math.max(st.speed,10);let v=(xa-x0)/tA;if(Math.abs(v)<2.6)v=dir*2.6;
    const hi=Math.random()<.35,y0=hi?rand(1.38,1.5):rand(.45,.6),m=mergeStatic(OB.trash());m.position.set(x0,y0,z);c.g.add(m);
    obstacles.push({m,type:"trash",x:x0,half:.35,hx:.55,ymin:y0-.3,ymax:y0+.3,chunk:c.i,dead:false,vy:0,spin:0,by:0,wind:{v,y0,ph:rand(0,6)}})}
  for(let k=0;k<16;k++){const m=new THREE.Mesh(GEO.box,streakMat);m.scale.set(rand(1.5,3.2),.04,.04);
    m.position.set(-dir*rand(4,14),rand(.4,4.2),st.z-rand(-2,30));world.add(m);streaks.push({m,v:dir*rand(18,28),t:-rand(0,1.2)})}}
function streakAnim(dt){streaks.forEach(q=>{q.t+=dt;q.m.visible=q.t>0;if(q.t>0){q.m.position.x+=q.v*dt;q.m.position.z+=st.speed*.15*dt}});
  streaks=streaks.filter(q=>{if(q.t>1.4){world.remove(q.m);return false}return true})}
/* ---------- night: every 1000 m day and night swap ---------- */
const ENVN={park:{bg:new THREE.Color("#101f31"),fog:new THREE.Color("#1b3640")},office:{bg:new THREE.Color("#232b4a"),fog:new THREE.Color("#232b4a")},street:{bg:new THREE.Color("#0b1230"),fog:new THREE.Color("#18214a")},bridge:{bg:new THREE.Color("#0b1230"),fog:new THREE.Color("#18214a")},cafe:{bg:new THREE.Color("#2b2030"),fog:new THREE.Color("#2b2030")}};
const tmpA=new THREE.Color(),tmpB=new THREE.Color(),NIGHTB=new THREE.Color("#3b4670");
const winNightTex=texOf((x)=>{x.fillStyle="#000";x.fillRect(0,0,64,128);for(let r=0;r<8;r++)for(let q=0;q<4;q++)if(Math.random()<.45){x.fillStyle=pick(["#ffe9a0","#fff4c9","#ffd27a"]);x.fillRect(4+q*15,6+r*15,10,10)}},64,128);
winNightTex.wrapS=winNightTex.wrapT=THREE.RepeatWrapping;winNightTex.repeat.set(2,3);
BLD.forEach(m=>{m.emissiveMap=winNightTex;m.emissive.set("#000000");m.needsUpdate=true;m.userData.base=m.color.clone()});
const cityNightTex=texOf((x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#070c24");g.addColorStop(1,"#26306a");x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle="#fff";for(let i=0;i<30;i++)x.fillRect(Math.random()*w,Math.random()*h*.4,1.5,1.5);
  for(let i=0;i<16;i++){const bw=rand(14,30),bh=rand(30,105),bx=i*17-8;x.fillStyle=pick(["#1b2550","#222d5e","#161f45"]);x.fillRect(bx,h-bh,bw,bh);
    for(let yy=h-bh+5;yy<h-4;yy+=8)for(let xx=bx+3;xx<bx+bw-3;xx+=6)if(Math.random()<.4){x.fillStyle=pick(["#ffe9a0","#ffd27a","#fff4c9"]);x.fillRect(xx,yy,3,4)}}},256,128);
const lampTex=texOf((x)=>{const g=x.createRadialGradient(64,64,2,64,64,62);g.addColorStop(0,"rgba(255,244,190,1)");g.addColorStop(.35,"rgba(255,226,140,.55)");g.addColorStop(1,"rgba(255,226,140,0)");x.fillStyle=g;x.fillRect(0,0,128,128)},128,128);
const lampGlowMat=new THREE.SpriteMaterial({map:lampTex,transparent:true,opacity:0,depthWrite:false});
const lampPoolMat=new THREE.MeshBasicMaterial({color:"#ffe28c",transparent:true,opacity:0,depthWrite:false});
const poolGeo=new THREE.CircleGeometry(1.6,24);
function streetLamp(d,g,s,z){d.add(mesh(GEO.cyl,"#3a3f52",.07,3.6,.07,s*4.7,1.98,z));d.add(mesh(GEO.box,"#3a3f52",.9,.07,.07,s*4.3,3.75,z));d.add(mesh(GEO.box,MB("#fff3b0"),.4,.1,.22,s*3.9,3.68,z));
  const sp=new THREE.Sprite(lampGlowMat);sp.scale.setScalar(2.4);sp.position.set(s*3.9,3.6,z);g.add(sp);
  const pool=new THREE.Mesh(poolGeo,lampPoolMat);pool.rotation.x=-Math.PI/2;pool.position.set(s*3.4,.03,z);g.add(pool)}
const starGeo=new THREE.BufferGeometry();{const p=[];for(let i=0;i<280;i++){const a=Math.random()*Math.PI*2,e=rand(.1,1.35);p.push(Math.cos(a)*Math.cos(e)*130,Math.sin(e)*130,Math.sin(a)*Math.cos(e)*130)}starGeo.setAttribute("position",new THREE.Float32BufferAttribute(p,3))}
const starMat=new THREE.PointsMaterial({color:"#ffffff",size:2,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false});starMat.fog=false;noBend(starMat);
const stars=new THREE.Points(starGeo,starMat);stars.frustumCulled=false;gameScene.add(stars);
const moonTex=texOf((x)=>{const g=x.createRadialGradient(64,64,30,64,64,62);g.addColorStop(0,"rgba(255,248,220,.5)");g.addColorStop(1,"rgba(255,248,220,0)");x.fillStyle=g;x.fillRect(0,0,128,128);
  x.fillStyle="#fff6d8";x.beginPath();x.arc(64,64,30,0,7);x.fill();x.fillStyle="#e8ddb8";[[54,56,6],[74,70,8],[68,48,4]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()})},128,128);
const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex,transparent:true,opacity:0,depthWrite:false}));moon.material.fog=false;noBend(moon.material);moon.scale.setScalar(16);gameScene.add(moon);
function applyNight(zone,E,k,dt){
  parkMountains.visible=zone==="park";
  if(parkMountains.visible){parkMountains.position.copy(gameCam.position);parkMountains.position.y=0;}
  const ph=Math.floor(Math.max(0,st.dist)/1000)%2;
  if(ph!==st.nPhase){st.nPhase=ph;if(st.state==="run")toast(t(ph?"nightOn":"dayOn"))}
  st.night+=(ph-st.night)*Math.min(1,dt*.5);const n=st.night,N=ENVN[zone],off=!OUTDOOR.has(zone);
  waterMat.color.copy(waterMat.userData.base).lerp(NIGHTB,n*.75);
  tmpA.copy(E.bg).lerp(N.bg,n);tmpB.copy(E.fog).lerp(N.fog,n);gameScene.background.lerp(tmpA,k);gameScene.fog.color.lerp(tmpB,k);
  gHemi.intensity+=((off?lerp(.78,.62,n):lerp(.78,.42,n))-gHemi.intensity)*k;sun.intensity+=((off?lerp(.65,.42,n):lerp(.65,.16,n))-sun.intensity)*k;
  BLD.forEach(m=>{m.color.copy(m.userData.base).lerp(NIGHTB,n*.7);m.emissive.setRGB(n*.95,n*.85,n*.55)});
  cityMat.map=n>.5?cityNightTex:cityTex;
  lampGlowMat.opacity=n*.9;lampPoolMat.opacity=n*.28;starMat.opacity=n;moon.material.opacity=n;
  stars.position.copy(gameCam.position);moon.position.set(gameCam.position.x+16,gameCam.position.y+27,gameCam.position.z-110)}

/* start desk: the cat's own workplace */
function buildStart(){
  const g=new THREE.Group(),d=new THREE.Group();
  d.add(mesh(GEO.box,"#e8b878",1.6,.08,.95,0,.8,-1.1));
  [-1,1].forEach(s=>d.add(mesh(GEO.box,"#7b8094",.06,.78,.9,s*.76,.39,-1.1)));
  d.add(mesh(GEO.box,"#7b8094",1.5,.5,.04,0,.5,-1.52));
  d.add(mesh(GEO.box,"#2a3048",.1,.3,.1,0,.98,-1.42));d.add(mesh(GEO.box,"#2a3048",1.0,.62,.07,0,1.4,-1.44));d.add(mesh(GEO.box,"#7fd3ff",.92,.54,.02,0,1.4,-1.4));
  d.add(mesh(GEO.cyl,"#ff4b3e",.07,.13,.07,.6,.9,-.95));d.add(mesh(GEO.box,"#ffc531",.34,.09,.05,-.55,.88,-.75));
  d.add(mesh(GEO.cyl,"#d4774a",.12,.2,.12,-.62,.94,-1.35));d.add(mesh(GEO.sph,"#3fae5a",.16,.2,.16,-.62,1.13,-1.35));
  [-1,1].forEach(s=>{const x=s*2.2;d.add(mesh(GEO.box,"#e8b878",1.6,.08,.95,x,.8,-1.1));[-1,1].forEach(k=>d.add(mesh(GEO.box,"#7b8094",.06,.78,.9,x+k*.76,.39,-1.1)));
    d.add(mesh(GEO.box,"#2a3048",1.0,.62,.07,x,1.4,-1.44));d.add(mesh(GEO.box,"#7fd3ff",.92,.54,.02,x,1.4,-1.4));
    const w=seatedWorker();w.position.set(x,0,.25);d.add(w);lookers.push({head:w.userData.head,x,z:.25,r:0,chunk:-1})});
  freeze(d);g.add(d);
  const lap=new THREE.Group();lap.position.set(0,.85,-.95);lap.add(mesh(GEO.box,"#a7b1c2",.56,.03,.38));
  const scr=mesh(GEO.box,"#a7b1c2",.56,.36,.03,0,.18,-.19);scr.rotation.x=-.25;lap.add(scr);const sc=mesh(GEO.box,"#7fd3ff",.5,.3,.01,0,.18,-.17);sc.rotation.x=-.25;lap.add(sc);g.add(lap);
  const chair=officeChair();chair.position.set(0,0,.3);g.add(chair);
  g.userData={lap,chair,chairV:0};return g}
