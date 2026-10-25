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
function freeze(o){mergeStatic(o);o.traverse(n=>{n.updateMatrix();if(!n.userData.dyn)n.matrixAutoUpdate=false})}
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
    items.forEach(c=>{const g=c.geometry,pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,n=pa.count;_mm.multiplyMatrices(inv,c.matrixWorld);_nm.getNormalMatrix(_mm);
      for(let i=0;i<n;i++){_mv.fromBufferAttribute(pa,i).applyMatrix4(_mm);P[(vo+i)*3]=_mv.x;P[(vo+i)*3+1]=_mv.y;P[(vo+i)*3+2]=_mv.z;
        _mv.fromBufferAttribute(na,i).applyMatrix3(_nm).normalize();N[(vo+i)*3]=_mv.x;N[(vo+i)*3+1]=_mv.y;N[(vo+i)*3+2]=_mv.z;
        if(U){U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
        if(C){const cc=c.material.color;C[(vo+i)*3]=cc.r;C[(vo+i)*3+1]=cc.g;C[(vo+i)*3+2]=cc.b}}
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
   Логіка гри (доріжки, зіткнення) лишається прямою. Якщо шейдер не скомпілюється, міст просто буде прямим. */
const BEND={uView:{value:new THREE.Matrix4()},uB:{value:new THREE.Vector4(0,0,0,0)},uT0:{value:new THREE.Vector4(0,1,1,0)},uT1:{value:new THREE.Vector4(0,1,1,0)},uOn:{value:0}};
let BENDOK=true,bendBroken=false,TURNS=[],turnI=0;
const BEND_GLSL=`
uniform mat4 uView;uniform vec4 uB;uniform vec4 uT0;uniform vec4 uT1;uniform float uOn;
float bendH;
vec2 bendF(float h){return vec2(-sin(h),-cos(h));}
vec4 bendW(vec4 w){
  float s=-w.z;vec2 p=uB.xy;float h=uB.z;float sr=uB.w;
  if(uT0.w>0.0&&s>uT0.x){p+=bendF(h)*(uT0.x-sr);float d=min(s-uT0.x,uT0.w);float ph=d/uT0.y;float sg=uT0.z;
    p+=vec2(sg*uT0.y*(cos(h+sg*ph)-cos(h)),-sg*uT0.y*(sin(h+sg*ph)-sin(h)));h+=sg*ph;sr=uT0.x+d;}
  if(uT1.w>0.0&&s>uT1.x){p+=bendF(h)*(uT1.x-sr);float d=min(s-uT1.x,uT1.w);float ph=d/uT1.y;float sg=uT1.z;
    p+=vec2(sg*uT1.y*(cos(h+sg*ph)-cos(h)),-sg*uT1.y*(sin(h+sg*ph)-sin(h)));h+=sg*ph;sr=uT1.x+d;}
  p+=bendF(h)*(s-sr);bendH=h;
  return vec4(p.x+w.x*cos(h),w.y,p.y-w.x*sin(h),w.w);
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
  sh.vertexShader=v.replace("#include <common>","#include <common>\n"+BEND_GLSL);sh.uniforms.uView=BEND.uView;sh.uniforms.uB=BEND.uB;sh.uniforms.uT0=BEND.uT0;sh.uniforms.uT1=BEND.uT1;sh.uniforms.uOn=BEND.uOn};
THREE.Material.prototype.customProgramCacheKey=function(){return(!BENDOK||(this.userData&&this.userData.noBend))?"flat":"bend2"};
const noBend=m=>{m.userData.noBend=true;return m};
{const ce=console.error.bind(console);console.error=function(){try{if(BENDOK&&String(arguments[0]).indexOf("shader error")>=0){BENDOK=false;bendBroken=true}}catch(e){}ce.apply(null,arguments)}}
/* та сама формула в JS: точка прямого світу → точка вигнутого */
const bendF=h=>[-Math.sin(h),-Math.cos(h)];
function bendPt(x,y,z,out){out=out||new THREE.Vector3();if(!BENDOK||!BEND.uOn.value){out.h=0;return out.set(x,y,z)}
  const s=-z,B=BEND.uB.value;let px=B.x,pz=B.y,h=B.z,sr=B.w;
  for(const T of[BEND.uT0.value,BEND.uT1.value]){if(T.w>0&&s>T.x){const f=bendF(h);px+=f[0]*(T.x-sr);pz+=f[1]*(T.x-sr);const d=Math.min(s-T.x,T.w),ph=d/T.y,sg=T.z;
    px+=sg*T.y*(Math.cos(h+sg*ph)-Math.cos(h));pz+=-sg*T.y*(Math.sin(h+sg*ph)-Math.sin(h));h+=sg*ph;sr=T.x+d}}
  const f=bendF(h);px+=f[0]*(s-sr);pz+=f[1]*(s-sr);out.set(px+x*Math.cos(h),y,pz-x*Math.sin(h));out.h=h;return out}
function bendReset(){TURNS=[];turnI=0;BEND.uOn.value=0;BEND.uB.value.set(0,0,0,0);BEND.uT0.value.set(0,1,1,0);BEND.uT1.value.set(0,1,1,0)}
/* пройдений поворот «впікається» в базу, щоб шейдер завжди рахував не більше двох поворотів */
function updateBend(s){if(!BENDOK){BEND.uOn.value=0;BEND.uB.value.set(0,0,0,0);BEND.uT0.value.w=0;BEND.uT1.value.w=0;return}
  /* вигин вмикається за 500 м до першого повороту і після нього вже лишається (світ повернутий) */
  if(!BEND.uOn.value&&TURNS.length&&s>TURNS[0].s0-500)BEND.uOn.value=1;
  while(turnI<TURNS.length&&s>TURNS[turnI].s0+TURNS[turnI].L+80){const T=TURNS[turnI],e=T.s0+T.L,p=bendPt(0,0,-e);BEND.uB.value.set(p.x,p.z,p.h,e);turnI++;BEND.uT0.value.w=0;BEND.uT1.value.w=0}
  [BEND.uT0,BEND.uT1].forEach((u,k)=>{const T=TURNS[turnI+k];if(T)u.value.set(T.s0,T.R,T.sg,T.L);else u.value.set(0,1,1,0)})}
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
    const R=45,nb=ZS.filter(z=>z.kind==="bridge").length-1;TURNS.push({s0:c0*CH+170,R,sg:nb%2===0?-1:1,L:R*Math.PI/2});
    ZS.push({kind:"street",c0:c0+BRN,n:ZONE,id:ZS.length,after:true});bridgeAt=c0*CH+2000;return}
  const kind=zCyc>0&&(!L||L.kind!=="park")&&Math.random()<.22?"park":zCyc<4?ZBASE[zCyc]:ZCYC[(zCyc-4)%3];if(kind!=="park")zCyc++;const Z={kind,c0,n:kind==="park"?PARKN:ZONE,id:ZS.length};
  if(kind==="street"&&(c0+ZONE)*CH>=bridgeAt)Z.pre=true;ZS.push(Z)}
/* тротуар на правій доріжці починається за 100 м до мосту (з 140 м вулиці перед мостом) і йде по мосту */
const SW0=140;
function zoneAt(i){if(i<0)return null;while(!ZS.length||ZS[ZS.length-1].c0+ZS[ZS.length-1].n<=i)nextZone();for(let k=ZS.length-1;k>=0;k--)if(ZS[k].c0<=i)return ZS[k];return ZS[0]}
const zoneOf=i=>i<0?"office":zoneAt(i).kind;

/* office side stations */
function deskStation(d,s,z,ci,g){
  const dx=s*5.0;
  d.add(mesh(GEO.box,"#e8b878",1.3,.08,2.3,dx,.78,z));
  [-1,1].forEach(k=>d.add(mesh(GEO.box,"#7b8094",1.2,.74,.06,dx,.38,z+k*1.1)));
  d.add(mesh(GEO.box,"#2a3048",.07,.55,.95,s*4.55,1.18,z));d.add(mesh(GEO.box,"#2a3048",.1,.25,.1,s*4.6,.92,z));
  d.add(mesh(GEO.box,"#7fd3ff",.02,.47,.85,s*4.6,1.18,z));
  d.add(mesh(GEO.cyl,pick(["#ffffff","#ff4b3e","#ffc531"]),.06,.12,.06,dx+s*.2,.88,z+.7));
  d.add(mesh(GEO.box,"#4fa3a5",1.6,1.25,.08,s*5.5,.63,z+1.55));
  const w=seatedWorker();const r=s*Math.PI/2;w.position.set(s*5.85,0,z);w.rotation.y=r;d.add(w);
  workerAct(w,g,s,z,ci,r,s*5.85);
  if(Math.random()<.12){const k=sleepyCat(pick(["#9aa3ad","#f29a3c","#34343e","#f4f4f6"]));k.position.set(dx-s*.25,.82,z-.6);k.rotation.y=rand(0,6);g.add(k);const b=k.userData.body;anims.push({chunk:ci,z,f:t=>{b.scale.y=.2+Math.sin(t*2.2)*.025}})}
}
/* що робить колега за столом: друкує, говорить по телефону, п'є каву, потягується, крутиться на кріслі, спить */
function workerAct(w,g,s,z,ci,r,wx){const[aL,aR]=w.userData.arms,hd=w.userData.head,ph=Math.random()*6,act=pick(["type","type","phone","coffee","stretch","spin","sleep"]);let wave=0,zz=null;
  if(act!=="sleep")lookers.push({head:hd,x:wx,z,r,chunk:ci});
  if(act==="phone")aR.add(mesh(GEO.box,"#1c1c24",.06,.17,.1,0,-.3,-.5));
  if(act==="coffee"){aR.add(mesh(GEO.cyl,pick(["#ffffff","#ff4b3e","#ffc531","#3d7bff"]),.07,.14,.07,0,-.24,-.5));aR.add(mesh(GEO.cyl,"#6b3e22",.06,.01,.06,0,-.17,-.5))}
  if(act==="spin")w.userData.dyn=true;
  if(act==="sleep"){zz=new THREE.Sprite(ownMat(new THREE.SpriteMaterial({map:zzzTex,transparent:true,depthWrite:false})));zz.scale.setScalar(.7);g.add(zz)}
  anims.push({chunk:ci,z,f:(t,dt)=>{const near=st&&Math.abs(st.z-z)<5&&act!=="sleep";wave=near?1:Math.max(0,wave-dt*1.5);
    let L=.55+Math.sin(t*22+ph)*.12,R=.55+Math.sin(t*22+ph+1.7)*.12,Rz=0;hd.rotation.x=0;hd.rotation.z=0;
    if(act==="phone"){L=.55+Math.sin(t*9+ph)*.06;R=-2.55;Rz=.45;hd.rotation.z=.18+Math.sin(t*1.7+ph)*.06;hd.rotation.x=Math.sin(t*5+ph)*.06}
    else if(act==="coffee"){const k=(t*.2+ph)%1;if(k<.25){const e=Math.sin(k/.25*Math.PI);R=.55-e*2.1;hd.rotation.x=-e*.25}}
    else if(act==="stretch"){const k=(t/7+ph)%1;if(k<.22){const e=Math.sin(k/.22*Math.PI);L=R=.55-e*3.3;hd.rotation.x=-e*.3}}
    else if(act==="spin"){w.rotation.y=r+Math.sin(t*1.3+ph)*.75;L=R=.3}
    else if(act==="sleep"){L=R=1.25;hd.rotation.x=.6;if(zz){const k=(t*.5+ph)%1;zz.position.set(wx,2.0+k*.9,z+.2);zz.material.opacity=Math.sin(k*Math.PI)}}
    aL.rotation.x=L;aR.rotation.x=wave>0?-2.6+Math.sin(t*14)*.35:R;aR.rotation.z=wave>0?-s*.35:Rz}});
}
function sideProp(d,s,z,ci,g){
  const r=Math.random(),x=s*5.4;
  if(r<.25){d.add(mesh(GEO.box,"#f4f6fb",.55,1.0,.55,x,.5,z));d.add(mesh(GEO.cyl,"#7fc8ff",.2,.55,.2,x,1.28,z));d.add(mesh(GEO.box,"#3d7bff",.1,.06,.02,x,.8,z-s*0+.28));
    const bub=mesh(GEO.sph,"#e8f7ff",.05,.05,.05,x,1.05,z);g.add(bub);const ph=Math.random();anims.push({chunk:ci,z,f:t=>{const k=(t*.7+ph)%1;bub.position.y=1.05+k*.45;bub.position.x=x+Math.sin(t*6+ph*9)*.04}});
    if(Math.random()<.6){const c=standingChat();c.position.set(s*4.55,0,z+.9);c.rotation.y=s>0?-2.3:2.3;g.add(c);const h=c.userData.head,a=c.userData.arm,p2=Math.random()*6;anims.push({chunk:ci,z,f:t=>{h.rotation.x=Math.sin(t*3+p2)*.12;h.rotation.y=Math.sin(t*.9+p2)*.4;a.rotation.x=-1.1+Math.sin(t*2.4+p2)*.25}})}}
  else if(r<.5){d.add(mesh(GEO.box,"#8a6a52",1.0,.9,2.2,s*5.6,.45,z));d.add(mesh(GEO.box,"#2a3048",.55,.7,.5,s*5.6,1.25,z-.4));d.add(mesh(GEO.sph,"#ff4b3e",.05,.05,.05,s*5.3,1.4,z-.4));
    const puffs2=[0,1,2].map(k=>{const m=mesh(GEO.sph,"#ffffff",.07,.07,.07,s*5.5,1.1,z+.4);g.add(m);return m});anims.push({chunk:ci,z,f:t=>{puffs2.forEach((m,k)=>{const q=(t*.8+k/3)%1;m.position.y=1.08+q*.55;m.scale.setScalar(.04+q*.09);m.position.x=s*5.5+Math.sin(q*6+k)*.04})}});
    d.add(mesh(GEO.cyl,"#ffffff",.08,.13,.08,s*5.5,.97,z+.4));d.add(mesh(GEO.cyl,"#ffffff",.08,.13,.08,s*5.5,.97,z+.65))}
  else if(r<.62){d.add(mesh(GEO.box,"#9aa3b5",.8,1.35,1.2,s*5.9,.68,z));[.35,.75,1.15].forEach(y=>d.add(mesh(GEO.box,"#c6ccd8",.02,.06,.4,s*5.49,y,z)))}
  else if(r<.75){const cp=OB.copier();cp.position.set(s*5.9,0,z);cp.rotation.y=-s*Math.PI/2;d.add(cp);
    const w=walker(true),u=w.userData;w.position.set(s*4.75,0,z+.15);w.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(w);
    const sheets=[0,1,2,3].map(k=>{const m=mesh(GEO.box,"#ffffff",.3,.01,.4,s*5.6,1.3,z);g.add(m);return m}),ph=Math.random()*5;
    anims.push({chunk:ci,z,f:t=>{const k=(t*.55+ph)%1,hitA=Math.max(0,Math.sin(t*9+ph));u.arm.rotation.x=-1.4-hitA*.8;u.head.rotation.z=Math.sin(t*4)*.1;w.position.y=k<.1?Math.sin(k/.1*Math.PI)*.15:0;
      sheets.forEach((m,q)=>{const e=(t*.7+q/4+ph)%1;m.position.set(s*(5.6-e*1.6),1.3+Math.sin(e*Math.PI)*1.2,z+(q-1.5)*.4*e);m.rotation.set(e*6+q,e*3,e*4)})}})}
  else{d.add(mesh(GEO.cyl,"#d4774a",.32,.6,.32,x,.3,z));d.add(mesh(GEO.sph,"#3fae5a",.55,.75,.55,x,1.15,z));d.add(mesh(GEO.sph,"#4cc56a",.38,.5,.38,x+.15,1.7,z-.1))}
}
function officeChunk(g,i,z0,zc){
  const d=new THREE.Group();
  d.add(mesh(GEO.box,carpetMat,13.4,.2,CH,0,-.1,zc));
  d.add(mesh(GEO.box,"#c9d5e8",7.0,.02,CH,0,.006,zc));
  [-1.1,1.1].forEach(x=>d.add(mesh(GEO.box,"#ffc531",.07,.02,CH,x,.012,zc)));
  [-3.5,3.5].forEach(x=>d.add(mesh(GEO.box,"#8ea3c6",.06,.02,CH,x,.012,zc)));
  d.add(mesh(GEO.box,"#eef2f8",13.4,.2,CH,0,5.2,zc));
  for(let k=0;k<3;k++)LX.forEach(x=>d.add(mesh(GEO.box,lightMat,1.1,.04,3.2,x,5.08,z0-5-k*10)));
  [-1,1].forEach(s=>{
    const dir=s<0?0:1;
    d.add(mesh(GEO.box,"#bcd6ec",.4,5.2,CH,s*6.9,2.6,zc));
    d.add(mesh(GEO.box,"#4a6aa8",.42,.22,CH,s*6.88,.11,zc));
    for(let k=0;k<3;k++){const z=z0-5-k*10;
      d.add(mesh(GEO.box,"#2c3a63",.1,3.0,6.1,s*6.68,2.75,z));
      const gl=new THREE.Mesh(GEO.box,faced(cityMat,"#2c3a63",dir));gl.scale.set(.06,2.7,5.7);gl.position.set(s*6.63,2.75,z);d.add(gl);
      d.add(mesh(GEO.box,"#2c3a63",.14,2.8,.12,s*6.6,2.75,z))}
    for(let k=1;k<=2;k++){const z=z0-k*10,r=Math.random();
      if(r<.4){const b=new THREE.Mesh(GEO.box,faced(boardMat,"#c6ccd8",dir));b.scale.set(.06,1.4,2.2);b.position.set(s*6.66,2.5,z);d.add(b)}
      else if(r<.75){const p=new THREE.Mesh(GEO.box,faced(posterMat,"#1c2445",dir));p.scale.set(.05,1.5,1.05);p.position.set(s*6.66,2.6,z);d.add(p)}
      else{const c=mesh(GEO.cyl,"#ffffff",.42,.07,.42,s*6.64,3.3,z);c.rotation.z=Math.PI/2;d.add(c);const rim=mesh(GEO.cyl,"#1c2445",.46,.05,.46,s*6.67,3.3,z);rim.rotation.z=Math.PI/2;d.add(rim);
        const piv=new THREE.Group();piv.position.set(s*6.59,3.3,z);g.add(piv);const h1=new THREE.Group(),h2=new THREE.Group();piv.add(h1,h2);h1.add(mesh(GEO.box,"#1c2445",.03,.26,.05,0,.12,0));h2.add(mesh(GEO.box,"#ff4b3e",.03,.34,.035,0,.16,0));
        const off=Math.random()*6;anims.push({chunk:i,z,f:t=>{h2.rotation.x=-(t*1.6+off)*s;h1.rotation.x=-(t*.13+off)*s}})}}
    for(let k=0;k<3;k++){const z=z0-5-k*10;if(i<0&&k===2)continue;if(Math.random()<.62)deskStation(d,s,z,i,g);else sideProp(d,s,z,i,g)}
  });
  if(i>=0)for(let k=0;k<2;k++){if(Math.random()<.55){const sd=Math.random()<.5?-1:1,w=walker();const zA=z0-3-rand(0,8),len=rand(8,16),sp=rand(.9,1.5),ph=Math.random()*10;
    w.position.set(sd*3.6,0,zA);g.add(w);const u=w.userData;
    anims.push({chunk:i,z:zA-len/2,f:(t,dt)=>{const q=(t*sp/len+ph)%2,dirn=q<1?1:-1,pz=q<1?q:2-q;w.position.z=zA-pz*len;w.rotation.y=dirn>0?0:Math.PI;
      const w2=t*sp*5.5;u.legL.rotation.x=Math.sin(w2)*.6;u.legR.rotation.x=-Math.sin(w2)*.6;u.arm.rotation.x=-Math.sin(w2)*.5;w.position.y=Math.abs(Math.sin(w2))*.04}})}}
  if(i>=1&&Math.random()<.35){const pl=paperPlane(),zz=z0-rand(6,24),y=rand(3.0,3.9),sp=rand(.12,.2),ph=Math.random();g.add(pl);
    anims.push({chunk:i,z:zz,f:t=>{const q=(t*sp+ph)%1,x=-6+q*12;pl.position.set(x,y+Math.sin(q*Math.PI*4)*.25,zz+Math.sin(q*Math.PI*2)*.8);pl.rotation.set(Math.sin(q*Math.PI*4)*.25,-Math.PI/2,Math.cos(q*Math.PI*4)*.3)}})}
  freeze(d);g.add(d);
}
function walker(plain){const g=new THREE.Group(),shirt=pick(SHIRTS),skin=pick(SKINS),pants=pick(["#3b4254","#5a4a40","#2a3a6e"]);
  const leg=x=>{const p=new THREE.Group();p.position.set(x,.86,0);p.add(mesh(GEO.cyl,pants,.12,.84,.12,0,-.42,0));p.add(mesh(GEO.box,"#1d1d24",.17,.1,.3,0,-.84,-.05));g.add(p);return p};
  const legL=leg(-.15),legR=leg(.15);
  g.add(mesh(GEO.box,shirt,.72,.82,.42,0,1.27,0));const head=new THREE.Group();head.position.y=1.94;g.add(head);
  head.add(mesh(GEO.sph,skin,.27,.29,.27));personLook(head,.27);
  [-1,1].forEach(s=>head.add(mesh(GEO.sph,"#15151c",.04,.05,.03,s*.09,.03,-.25)));
  if(Math.random()<.3){const v=mesh(GEO.cone,"#f4f6fb",.13,.3,.02,0,1.56,-.215);v.rotation.z=Math.PI;g.add(v);g.add(mesh(GEO.box,pick(["#e53935","#2f6fed","#ffc531","#1c2445"]),.08,.4,.03,0,1.42,-.22))}
  const arm=new THREE.Group();arm.position.set(-.44,1.6,0);arm.add(mesh(GEO.cyl,shirt,.09,.6,.09,0,-.3,0));arm.add(mesh(GEO.sph,skin,.09,.09,.09,0,-.62,0));g.add(arm);
  const r=plain?2:Math.random();if(r>=2){const a2=new THREE.Group();a2.position.set(.44,1.6,0);a2.add(mesh(GEO.cyl,shirt,.09,.6,.09,0,-.3,0));a2.add(mesh(GEO.sph,skin,.09,.09,.09,0,-.62,0));a2.rotation.x=-.3;g.add(a2)}
  else if(r>.82){const a2=new THREE.Group();a2.position.set(.44,1.6,0);a2.rotation.set(-2.6,0,.5);a2.add(mesh(GEO.cyl,shirt,.09,.6,.09,0,-.3,0));a2.add(mesh(GEO.sph,skin,.09,.09,.09,0,-.62,0));a2.add(mesh(GEO.box,"#1c1c24",.06,.18,.1,0,-.66,-.06));g.add(a2)}
  else if(r>.66){g.add(mesh(GEO.box,shirt,.13,.55,.13,.42,1.32,0));g.add(mesh(GEO.box,"#a7b1c2",.05,.42,.58,.5,1.12,-.05))}
  else if(r<.33){g.add(mesh(GEO.cyl,shirt,.09,.5,.09,.42,1.3,-.15));g.add(mesh(GEO.cyl,"#ffffff",.1,.22,.1,.42,1.55,-.3));g.add(mesh(GEO.cyl,"#7a4a2a",.105,.03,.105,.42,1.67,-.3))}
  else{g.add(mesh(GEO.box,shirt,.13,.13,.45,.36,1.32,-.25));g.add(mesh(GEO.box,"#ffe7a0",.05,.4,.55,.42,1.38,-.3));g.add(mesh(GEO.box,"#ff9f43",.055,.38,.53,.45,1.38,-.3))}
  g.userData={legL,legR,arm,head};return mergeRig(g,[legL,legR,arm,head])}
function standingChat(){return walker()}
function sleepyCat(c){const g=new THREE.Group();const body=mesh(GEO.sph,c,.3,.2,.24,0,.1,0);g.add(body);g.add(mesh(GEO.sph,c,.15,.13,.14,.25,.14,0));
  [-1,1].forEach(s=>{const e=mesh(GEO.cone,c,.06,.1,.05,.27,.27,s*.07);e.rotation.x=-s*.3;g.add(e)});
  for(let k=0;k<4;k++)g.add(mesh(GEO.sph,c,.06,.06,.06,-.28+Math.sin(k*.5)*.05,.06,.1+k*.06));
  g.add(mesh(GEO.box,"#1c2445",.005,.012,.05,.385,.16,-.04));g.add(mesh(GEO.box,"#1c2445",.005,.012,.05,.385,.16,.04));g.userData.body=body;return g}
function paperPlane(){const g=new THREE.Group();const m=new THREE.MeshToonMaterial({color:"#ffffff",gradientMap:grad});
  [-1,1].forEach(s=>{const w=new THREE.Mesh(GEO.cone,m);w.scale.set(.32,.7,.02);w.rotation.x=-Math.PI/2;w.rotation.y=s*.5;w.position.set(s*.08,0,0);g.add(w)});
  const k=new THREE.Mesh(GEO.cone,M("#dfe5ee"));k.scale.set(.05,.7,.12);k.rotation.x=-Math.PI/2;k.position.y=-.05;g.add(k);return g}
function streetChunk(g,i,z0,zc){
  const d=new THREE.Group();
  const Z=zoneAt(i),l0=(i-Z.c0)*CH,a=Z.pre?Math.min(Math.max(l0,SW0),l0+CH):l0+CH,Lz=l=>-Z.c0*CH-l;
  if(a>l0){const len=a-l0;d.add(mesh(GEO.box,"#4d566b",8.6,.2,len,0,-.1,Lz(l0+len/2)));for(let k=0;k<len;k+=4)[-1.1,1.1].forEach(x=>d.add(mesh(GEO.box,"#f4f6fb",.12,.02,Math.min(1.6,len-k),x,.01,z0-k-.8)))}
  if(a<l0+CH){const len=l0+CH-a,zm=Lz(a+len/2);d.add(mesh(GEO.box,"#4d566b",5.45,.2,len,-1.575,-.1,zm));sidewalkLane(d,zm,GEO.box,len);
    for(let k=a-l0;k<CH;k+=4)d.add(mesh(GEO.box,"#f4f6fb",.12,.02,1.6,-1.1,.01,z0-k-1));
    if(a>l0||a===SW0){d.add(mesh(GEO.box,"#e9edf3",3.2,.12,.22,2.725,.04,Lz(a)));d.add(mesh(GEO.box,"#aab3c4",3.22,.02,.24,2.725,.105,Lz(a)))}}
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#cfd5e0",3.4,.36,CH,s*6,.08,zc));d.add(mesh(GEO.box,"#aab3c4",.2,.38,CH,s*4.35,.09,zc));
    for(let k=0;k<3;k++){const h=rand(8,20);const b=new THREE.Mesh(GEO.box,pick(BLD));b.scale.set(6,h,9);b.position.set(s*11,h/2,z0-5-k*10);d.add(b)}
    for(let k=0;k<3;k++){const x=s*5.6,z=z0-3-k*10;d.add(mesh(GEO.cyl,"#8a5a34",.13,1.4,.13,x,.95,z));d.add(mesh(GEO.sph,"#4cbf63",.85,.85,.85,x,2.2,z))}streetLamp(d,g,s,z0-8);streetLamp(d,g,s,z0-18)});
  freeze(d);g.add(d);
}
/* права доріжка вулиці — тротуар з плиткою і бордюром */
function sidewalkLane(d,zc,geo,len){len=len||CH;d.add(mesh(geo||GEO.box,tileMat,3.15,.2,len,2.725,-.1,zc));d.add(mesh(geo||GEO.box,"#e9edf3",.2,.12,len,1.15,.04,zc));d.add(mesh(geo||GEO.box,"#aab3c4",.22,.02,len,1.15,.105,zc))}
function pigeons(g,ci,x,z){const ps=[];for(let k=0;k<4;k++){const p=new THREE.Group(),c=pick(["#8a8f9c","#9aa3ad","#6d7280"]);p.add(mesh(GEO.sph,c,.13,.11,.17,0,.13,0));p.add(mesh(GEO.sph,c,.07,.07,.07,0,.25,-.12));p.add(mesh(GEO.cone,"#e8a33d",.02,.05,.02,0,.25,-.2));p.children[2].rotation.x=-Math.PI/2;
    const wl=mesh(GEO.sph,shade(c,-.15),.05,.03,.13,-.11,.15,.02),wr=mesh(GEO.sph,shade(c,-.15),.05,.03,.13,.11,.15,.02);p.add(wl,wr);p.add(mesh(GEO.sph,"#5aa58a",.075,.04,.075,0,.21,-.08));
    p.position.set(x+rand(-.7,.7),0,z+rand(-.8,.8));p.rotation.y=rand(0,6);g.add(p);ps.push({p,wl,wr,vx:rand(-2,2),vz:rand(-1.5,1.5),ph:rand(0,6)})}
  let fly=0;anims.push({chunk:ci,z,f:(t,dt)=>{if(!fly&&st&&st.z-z<9&&st.z-z>-2)fly=.001;
    ps.forEach(q=>{if(fly){q.p.position.y+=dt*(3+fly*2);q.p.position.x+=q.vx*dt;q.p.position.z+=q.vz*dt;const f=Math.sin(t*40+q.ph)*.9;q.wl.rotation.z=f;q.wr.rotation.z=-f;if(q.p.position.y>9)q.p.visible=false}
      else{q.p.rotation.x=Math.max(0,Math.sin(t*3+q.ph))*.35}});if(fly)fly+=dt}})}
/* перехід між локаціями: тільки табличка під стелею (без рамки і скляних дверей, щоб було видно дорогу далі) */
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
function addChunk(i){
  const g=new THREE.Group(),z0=-i*CH,zc=z0-CH/2,theme=zoneOf(i);
  if(theme==="office")officeChunk(g,i,z0,zc);else if(theme==="cafe")cafeChunk(g,i,z0,zc);else if(theme==="bridge")bridgeChunk(g,i,z0,zc);else if(theme==="park")parkChunk(g,i,z0,zc);else streetChunk(g,i,z0,zc);
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
const STATIC_OB=new Set(["colleague","colleagueP","bin","papers","printer","boxes","wetfloor","chair","spill","taxi","hangkpi","barrier","copier","cooler","shredder","dump","car","cchair","ctable","bags","oldbox","trunk","rail","hydrant","bench","planter","bike","kiosk","awning","cones","puddle","trash"]);
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

function populate(g,ci,theme,z0){
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
    if(!calm&&-rz>=evNext){evNext=-rz+rand(300,400);if(theme==="office"&&Math.random()<.5)meeting(g,ci,rz);else courier(g,ci,rz);skipNext=true;return}
    const sw=theme==="street"&&Zp.pre&&lOf(rz)>=SW0-2;
    if(theme==="street"&&!calm){const q=Math.random();if(q<.16){crosswalk(g,ci,rz);skipNext=true;return}if(q<.3&&!(Zp.pre&&lOf(rz)>=SW0-15)){crossing(g,ci,rz);skipNext=true;return}}
    /* бізнес-зустріч на лівій доріжці (після 1 км): тільки оминати */
    if(theme==="office"&&!calm&&-rz>=1000&&Math.random()<.11){bizMeeting(g,ci,rz);if(Math.random()<.35)spawnObs(g,pick(["bin","papers","boxes","wetfloor"]),1+ri(2),rz,ci,0);return}
    const L=[null,null,null],r=Math.random();
    if(r<.33)L[ri(3)]="tall";
    else if(r<.58){const f=ri(3);for(let k=0;k<3;k++)if(k!==f)L[k]="tall";if(Math.random()<.35)L[f]=Math.random()<.5?"low":"over"}
    else if(r<.78){for(let k=0;k<3;k++)L[k]=Math.random()<.55?"low":"over"}
    else L[ri(3)]=Math.random()<.5?"low":"over";
    L.forEach((c,lane)=>{if(!c)return;const type=pick(sw&&lane===2?SW[c]:TY[c]);let dir=0;
      if(type==="chair"){const opts=[lane-1,lane+1].filter(k=>k>=0&&k<3&&!L[k]);if(opts.length)dir=pick(opts)-lane}
      const o=spawnObs(g,type,lane,rz,ci,dir);if(type==="dogwalk"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z:rz,f:t=>{if(o.dead)return;u.d.tail.rotation.y=Math.sin(t*9+ph)*.7;u.d.head.rotation.z=Math.sin(t*1.5+ph)*.15;u.w.head.rotation.x=.35+Math.sin(t*.8+ph)*.05}})}});
    if(sw&&!L[2]&&Math.random()<.3)pigeons(g,ci,LX[2],rz)});
  for(let k=0;k<rows.length;k++){const a=rows[k]-2.2,b=(k+1<rows.length?rows[k+1]:z0-CH-3)+2.2;const len=a-b;if(len<3)continue;
    const lane=ri(3),x=LX[lane],r=Math.random();
    if(r<.03&&!calm)addPickup(g,ci,pick(["coffee","coffee","bed","bed","laptop"]),x,(a+b)/2);
    else{const fit=[3,5,10].filter(n=>(n-1)*1.4<=len);if(!fit.length)continue;const n=fit.length>1&&Math.random()<.35?fit[fit.length-2]:fit[fit.length-1];
      const st0=a-(len-(n-1)*1.4)/2;for(let q=0;q<n;q++)addCoin(g,ci,x,.8,st0-q*1.4)}}
}

/* timed spawns: gem, money, magnet + 3x5 coin block, once a minute each */
function findChunk(z){return chunks.find(c=>c.z0>=z&&z>c.z0-CH)}
function clearArea(z1,z2,lanes,by){
  const inL=x=>!lanes||lanes.some(l=>Math.abs(LX[l]-x)<1.2);
  for(const o of obstacles){if(o.dead||o.raft)continue;if(by!==undefined&&Math.abs((o.by||0)-by)>1.5)continue;const oz=o.m.position.z;if(oz-o.half>z1||oz+o.half<z2)continue;
    const xs=(o.lat||o.car)?LX.slice():o.move?[o.move.x0,o.move.x0+o.move.dir*2.2]:[o.x];if(xs.some(inL)){o.dead=true;o.m.visible=false}}
  for(const c of coins.concat(pickups)){if(c.taken)continue;const p=c.m.position;if(p.z>z1||p.z<z2)continue;if(by!==undefined&&Math.abs(p.y-by-1)>2.5)continue;if(!lanes||lanes.some(l=>Math.abs(LX[l]-p.x)<.6)){c.taken=true;c.m.visible=false;if(c.gl){c.gl.visible=false;c.ring.visible=false;c.beam.visible=false}}}}
function spawnTimed(kind){const zt=st.z-115,c=findChunk(zt);if(!c)return false;
  const P=planAt(zt),by=P&&st.lvl>H2-1&&zt<P.zU1-1&&zt-18>P.zD0?H2:0;
  if(kind==="block"){clearArea(zt+3,zt-14,undefined,by);addPickup(c.g,c.i,"magnet",LX[1],zt,by);for(let l=0;l<3;l++)for(let q=0;q<5;q++)addCoin(c.g,c.i,LX[l],.8+by,zt-4-q*1.6)}
  else{const lane=ri(3);clearArea(zt+2.5,zt-2.5,[lane],by);addPickup(c.g,c.i,kind==="money"?moneyTier():kind,LX[lane],zt,by)}
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
    obstacles.push({m:w,type:"ped",x:0,half:.35,hx:.75,ymin:0,ymax:2.1,chunk:ci,dead:false,vy:0,spin:0,lat:{p0:p0+k*5.5,v:sp*dir,L:11,c:-5.5}})}}
function crossing(g,ci,z){const d=new THREE.Group();
  [-1,1].forEach(s=>{d.add(mesh(GEO.box,"#4d566b",3.42,.04,3.6,s*6,.28,z));for(let k=-1;k<=1;k+=2)d.add(mesh(GEO.box,"#f4f6fb",3.3,.02,.12,s*6,.31,z+k*1.4));
    d.add(mesh(GEO.cyl,"#3a3f52",.06,2.6,.06,s*4.55,1.3,z+2.2));d.add(mesh(GEO.box,"#1c2445",.26,.75,.2,s*4.55,2.75,z+2.2));
    [["#ff4b3e",2.98],["#ffc531",2.75],["#22b066",2.52]].forEach(([c,y],i)=>d.add(mesh(GEO.sph,MB(i===1?c:"#3b4254"),.07,.07,.03,s*4.55,y,z+2.31)))});
  d.add(mesh(GEO.box,"#f4f6fb",8.4,.02,.25,0,.012,z+2.1));d.add(mesh(GEO.box,"#f4f6fb",8.4,.02,.25,0,.012,z-2.1));
  freeze(d);g.add(d);
  const dir=pick([-1,1]),x0=-dir*6.2,m=OB.car();m.rotation.y=dir*Math.PI/2;m.position.set(x0,.26,z);g.add(m);
  obstacles.push({m,type:"car",x:x0,half:.95,hx:2.0,ymin:0,ymax:1.6,top:1.5,chunk:ci,dead:false,vy:0,spin:0,car:{x0,xe:-x0,xa:rand(-2.6,2.6),go:false,v:0}})}


/* ================= кав'ярня і події ================= */
/* Кав'ярня з'являється з ~1 км: офіс → вулиця → кав'ярня → офіс…  Зона 240 м (8 відрізків):
   1-й поверх: стільці, столи, собаки, мішки кави, кавова річка з плаваючими перевернутими столами.
   75–89 м: сходи нагору на одній доріжці (за бажанням). 89–182 м: 2-й поверх (горище: павутина, павуки, старі коробки, скрині).
   182–196 м: сходи вниз на одній доріжці. Висоти перешкод абсолютні: база 2-го поверху H2. */
const H2=5.4,SL=14,CAFE={};
let hazards=[],evNext=1e9;
function resetWorldState(){for(const k in CAFE)delete CAFE[k];hazards=[];evNext=rand(1000,1100);ZS=[];zCyc=0;bridgeAt=1900;bendReset();waters=[]}
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
const saleTex=texOf((x,w,h)=>{x.fillStyle="#ffc531";x.fillRect(0,0,w,h);x.fillStyle="#e53935";x.fillRect(0,0,w,14);x.fillRect(0,h-14,w,14);
  x.fillStyle="#1c2445";x.font="900 64px Arial Black, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("−50%",w/2,h/2+4)},256,128);
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
  dogL:{half:.55,ymin:0,ymax:.5},dogR:{half:.45,hx:.75,ymin:0,ymax:2.1},
  webL:{half:.15,ymin:0,ymax:.85,soft:true},webH:{half:.15,ymin:1.12,ymax:2.9,soft:true},
  spiderD:{half:.32,hx:.6,ymin:0,ymax:.7},spiderC:{half:.35,hx:.7,ymin:0,ymax:.45},oldbox:{half:.45,ymin:0,ymax:.98,top:.98},trunk:{half:.4,ymin:0,ymax:.78,top:.8},
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

/* ---------- coffee river with floating upturned tables ---------- */
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
  const sts=[],nS=Math.round(len/1.6);for(let k=0;k<nS;k++){const s=new THREE.Sprite(ownMat(new THREE.SpriteMaterial({map:steamTex,transparent:true,depthWrite:false,opacity:.5})));const zz=R.zF+(k+.5)/nS*len;s.position.set(x+rand(-.7,.7),.3,zz);g.add(s);sts.push({s,ph:Math.random(),x0:s.position.x,sp:rand(.35,.55)})}
  anims.push({chunk:ci,z:zc,far:len/2,f:t=>sts.forEach(q=>{const k=(t*q.sp+q.ph)%1;q.s.position.y=.15+k*2.7;q.s.position.x=q.x0+Math.sin(t*1.3+q.ph*9)*.25*k;q.s.scale.setScalar(.6+k*1.9);q.s.material.opacity=Math.sin(Math.min(1,k*1.3)*Math.PI)*.62})});
  let z=R.zF+1.0;while(z<R.zN-1.0){spawnRaft(g,ci,R,z);z+=rand(2.8,4.4)}
  for(let z2=R.zN-1.2;z2>R.zF+1.2;z2-=1.6)addCoin(g,ci,x,.85,z2)}

/* ---------- cafe rows ---------- */
function coinsBetween(g,ci,rows,zEnd,by,skipX,always){
  for(let k=0;k<rows.length;k++){const a=rows[k]-2.2,b=(k+1<rows.length?rows[k+1]:zEnd)+2.2;const len=a-b;if(len<3)continue;
    let lane=ri(3);if(skipX!==undefined&&LX[lane]===skipX)lane=(lane+1)%3;const x=LX[lane],r=Math.random();
    if(r<.035)addPickup(g,ci,pick(["coffee","coffee","bed","bed","laptop"]),x,(a+b)/2,by);
    else{const fit=[3,5,10].filter(n=>(n-1)*1.4<=len);if(!fit.length)continue;const n=!always&&fit.length>1&&Math.random()<.35?fit[fit.length-2]:fit[fit.length-1];
      const s0=a-(len-(n-1)*1.4)/2;for(let q=0;q<n;q++)addCoin(g,ci,x,.8+by,s0-q*1.4)}}}
function populateCafe(g,ci,z0){
  const Z=zoneAt(ci),P=cafePlan(Z),k=ci-Z.c0,l0=k*CH,Lz=l=>P.Z0-l,gap=rowGap(ci);
  /* floor 1 */
  const rows=[];let l=k===0?l0+12:l0+5;while(l<l0+CH-2){rows.push(l);l+=gap*1.45+rand(0,2.5)}
  const used=[];
  rows.forEach(rl=>{if(rl>174&&rl<202)return;const z=Lz(rl);used.push(z);
    const R=P.rivers.find(R=>rl>R.a-2&&rl<R.b+2),nearUp=rl>56&&rl<91;
    const L=[0,1,2].filter(q=>!(R&&q===R.lane)&&!(nearUp&&q===P.lu)).sort(()=>Math.random()-.5);
    if(!R&&!nearUp&&Math.random()<.13){const o=spawnObs(g,"dogR",1,z,ci,0);o.pp={p0:rand(0,9),v:rand(2.6,3.4),rot:0};return}
    const r=Math.random();let n=r<.6?1:r<.95?2:3;
    if(L.length<3)n=Math.min(n,L.length-(nearUp&&!(R&&R.lane===P.lu)?0:1));
    for(let j=0;j<n;j++){const ty=pick(["cchair","cchair","ctable","ctable","bags","bags","dogL","dogL"]),o=spawnObs(g,ty,L[j],z,ci,0);
      if(ty==="dogL"){const u=o.m.userData,ph=rand(0,6);anims.push({chunk:ci,z,f:t=>{u.tail.rotation.y=Math.sin(t*7+ph)*.7;u.head.rotation.z=Math.sin(t*1.3+ph)*.12}})}}});
  const rv=P.rivers.find(R=>R.ci===ci),rvs=P.rivers.find(R=>R.a<l0+CH+2&&R.b>l0-2);
  coinsBetween(g,ci,used,z0-CH-3,0,rvs?rvs.x:undefined,false);
  if(rv)riverBuild(g,ci,rv);
  /* floor 2 */
  const a=Math.max(l0,96),b=Math.min(l0+CH,175);
  if(a<b){let q=a+rand(2,5);const r2=[];while(q<b){r2.push(Lz(q));q+=Math.max(20,gap*2.6)+rand(.5,3)}
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
  const bm=new THREE.MeshBasicMaterial({color:"#fff1b0"});d.add(mesh(GEO.cyl,"#2a2a30",.012,1.3,.012,s*4.6,9.95,z));const bulb=new THREE.Mesh(GEO.sph,bm);bulb.scale.setScalar(.13);bulb.position.set(s*4.6,9.25,z);d.add(bulb);
  const ph=rand(0,9);anims.push({chunk:ci,z,f:t=>{bm.color.set(Math.sin(t*17+ph)>-.75&&Math.sin(t*2.3+ph*2)>-.65?"#fff1b0":"#4a4a40")}})}
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
      if((k===0&&s===1&&q===1)||(k===7&&s===-1&&q===1))cafeCounter(d,g,s,z,i);
      else if(!((k===0||k===7)&&q!==1&&s===(k===0?1:-1))){const r=Math.random();
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
  if(l0<=75&&75<l1)stairsVis(d,P.lu,Lz(75),true);
  if(l0<=182&&182<l1)stairsVis(d,P.ld,Lz(182),false);
  freeze(d);g.add(d)}


/* ---------- тротуар (права доріжка вулиці), міст, бізнес-зустріч, вітрове сміття ---------- */
Object.assign(OD,{hydrant:{half:.3,ymin:0,ymax:.82,top:.84},bench:{half:.32,ymin:0,ymax:.95,top:.97},planter:{half:.48,ymin:0,ymax:.7,top:.72},bike:{half:.85,ymin:0,ymax:1.05},
  kiosk:{half:.75,ymin:0,ymax:2.6},dogwalk:{half:.55,hx:.8,ymin:0,ymax:2.1},awning:{half:.2,ymin:1.15,ymax:2.6},
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
/* ================= міст ================= */
/* Зона мосту 420 м: 10 м під'їзду, 400 м мосту, 10 м з'їзду. Поворот на 90° між 170 і 241 м (TURNS).
   Усе довге будується з дрібно поділених коробок (boxZ), щоб на повороті рівно вигиналося. */
const waterTex=repT(texOf((x,w,h)=>{x.fillStyle="#3f8fd0";x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=Math.random()<.5?"rgba(255,255,255,.35)":"rgba(20,60,120,.35)";x.lineWidth=2;
  const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0+8,y-4,x0+16,y);x.stroke()}},128,128),40,40);
const waterMat=noBend(new THREE.MeshToonMaterial({map:waterTex,gradientMap:grad}));waterMat.userData.base=waterMat.color.clone();
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
  if(k===0){updateBend(st?-st.z:0);const c=bendPt(0,-9,Lz(210)),w=new THREE.Mesh(ownGeo(new THREE.CircleGeometry(250,48)),waterMat);w.rotation.x=-Math.PI/2;w.position.copy(c);w.frustumCulled=false;world.add(w);waters.push({m:w,end:Z.c0*CH+BR_DECK1+60})}}
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

/* Парк: 27 відрізків по 30 м = 810 м. Окремі перешкоди не впливають на інші зони. */
function parkTree(d,x,z,autumn){
  const h=rand(2.7,4.1),c=autumn?pick(["#f0b744","#e5a03e","#d77c35"]):pick(["#4cbf63","#369e56","#68ba4b"]);
  d.add(mesh(GEO.cyl,"#805333",.24,h,.24,x,h/2,z));
  d.add(mesh(GEO.sph,c,1.3,1.25,1.15,x,h+.5,z));
  d.add(mesh(GEO.sph,c,.95,.9,.9,x+.65,h+.2,z+.25));
}
function parkChunk(g,i,z0,zc){
  const d=new THREE.Group();
  d.add(mesh(GEO.box,"#c6b49b",8.5,.16,CH,0,-.12,zc));
  [-1,1].forEach(s=>{
    d.add(mesh(GEO.box,"#68ad59",10,.13,CH,s*9.2,-.15,zc));
    d.add(mesh(GEO.box,"#e7d8bd",.2,.14,CH,s*4.33,-.04,zc));
    for(let j=0;j<3;j++)parkTree(d,s*rand(5.9,10.8),z0-4-j*10,Math.random()<.45);
    if(i%3===0){const z=z0-14;d.add(mesh(GEO.box,"#986c47",1.7,.16,.55,s*5.0,.65,z));
      [-.65,.65].forEach(q=>d.add(mesh(GEO.box,"#5b473a",.12,.62,.12,s*5+q,.3,z)))}
    if(i%4===0)streetLamp(d,g,s,z0-18);
    parkDetails(d,i,z0,s);
  });
  freeze(d);g.add(d);
}
/* Парк v25: декоративні елементи вздовж доріжки; жодних змін BEND. */
function parkDetails(d,i,z0,s){
  const z=z0-12;
  if(i%2===0){for(let k=0;k<5;k++){
    const x=s*(5.5+k*.43),zz=z-4+k*1.7;
    d.add(mesh(GEO.sph,pick(["#f38eae","#f9d858","#ad8fea","#f9f3e6"]),.16,.19,.16,x,.24,zz));
    d.add(mesh(GEO.cyl,"#3d9b53",.035,.25,.035,x,.1,zz));
  }}
  if(i%7===2){/* дитячий майданчик лише за межами смуг */
    const x=s*8.3;
    d.add(mesh(GEO.box,"#d69a60",3,.14,4,x,.02,z));
    [-.9,.9].forEach(a=>d.add(mesh(GEO.cyl,"#e85d65",.08,2,.08,x+a,1,z-.7)));
    const slide=mesh(GEO.box,"#ffd15e",1.1,.13,2.3,x,.95,z+.4);slide.rotation.x=-.45;d.add(slide);
    d.add(mesh(GEO.box,"#58b5dd",1.3,.15,.9,x,1.85,z-1.1));
  }
  if(i%8===5){/* ставок і невеликий фонтан збоку */
    const x=s*9.1;
    d.add(mesh(GEO.cyl,"#7db8b2",2.1,.1,2.1,x,-.04,z));
    d.add(mesh(GEO.cyl,"#56b7dc",1.85,.11,1.85,x,.015,z));
    d.add(mesh(GEO.cyl,"#d8e7dc",.22,.65,.22,x,.37,z));
    d.add(mesh(GEO.sph,"#b4e8ff",.28,.45,.28,x,.95,z));
    [-.8,.9].forEach(q=>{d.add(mesh(GEO.sph,"#f6f1d4",.25,.18,.34,x+q,.21,z+.5));d.add(mesh(GEO.cone,"#f5aa38",.1,.22,.1,x+q,.24,z+.14))});
  }
  if(i%6===3){const x=s*7.1;
    d.add(mesh(GEO.sph,"#b57c45",.27,.28,.39,x,.35,z));
    d.add(mesh(GEO.sph,"#c58c53",.17,.17,.18,x,.68,z-.13));
    const tail=mesh(GEO.sph,"#a86a3d",.15,.43,.15,x+.3,.56,z+.25);tail.rotation.z=.6;d.add(tail);
  }
}
function parkMiniBridge(d,i,z0,zc){
  /* 30-метровий настил: легкий декоративний вигин без зміни фізики котика */
  if(i%27!==13)return;
  d.add(mesh(GEO.box,"#68b7cb",18,.06,CH,0,-.24,zc));
  for(let k=0;k<10;k++){
    const zz=z0-1.5-k*3,arch=.06+.12*Math.sin(Math.PI*(k+.5)/10);
    d.add(mesh(GEO.box,"#a87c4c",8.5,.13,2.92,0,-.05+arch,zz));
  }
  [-1,1].forEach(side=>{
    for(let k=0;k<=10;k++){
      const zz=z0-k*3,arch=.12*Math.sin(Math.PI*k/10);
      d.add(mesh(GEO.box,"#875d39",.16,1.15,.17,side*4.13,.56+arch,zz));
    }
    d.add(mesh(GEO.box,"#a47544",.2,.15,CH,side*4.13,1.15,zc));
  });
}
Object.assign(OD,{
  parkLog:{half:.48,ymin:0,ymax:.85,top:.85},parkToy:{half:.4,ymin:0,ymax:.46,top:.46},
  parkDog:{half:.7,hx:.85,ymin:0,ymax:2.1},parkCafe:{half:1.05,hx:1.15,ymin:0,ymax:2.9},
  parkTerrace:{half:1.1,hx:1.15,ymin:0,ymax:2.8},
  parkScooter:{half:.55,ymin:0,ymax:.9,top:.9},parkTrash:{half:.65,ymin:0,ymax:1.25},
  parkBike:{half:.85,ymin:0,ymax:1.6},parkBigLog:{half:.55,ymin:0,ymax:1.05,top:1.05}
});
Object.assign(OB,{
  parkLog(){const g=new THREE.Group(),b=mesh(GEO.cyl,"#865a38",.43,1.9,.43,0,.45,0);b.rotation.z=Math.PI/2;g.add(b);
    [-.8,.8].forEach(x=>{const c=mesh(GEO.cyl,"#c59560",.44,.045,.44,x,.45,0);c.rotation.z=Math.PI/2;g.add(c)});
    g.add(mesh(GEO.sph,"#4e9b45",.34,.22,.3,.25,.7,.15));return g},
  parkToy(){const g=new THREE.Group();for(let k=0;k<4;k++){const c=mesh(GEO.box,pick(["#f4b63f","#ee5c66","#4f9ae4","#9b70e8"]),.38,.28,.34,rand(-.52,.52),.16,rand(-.45,.45));c.rotation.y=rand(0,6);g.add(c)}return g},
  parkDog(){const g=OB.dogwalk();return g},
  parkCafe(){const g=new THREE.Group();g.add(mesh(GEO.box,"#b97d4e",1.8,1.8,1.5,0,.9,0));g.add(mesh(GEO.box,"#f6e4b2",2.1,.2,1.9,0,1.92,0));
    g.add(mesh(GEO.box,"#624632",1.25,.72,.07,0,.9,-.79));g.add(mesh(GEO.box,"#fff4e1",1.1,.35,.06,0,1.5,-.8));return g},
  parkScooter(){const g=new THREE.Group();g.add(mesh(GEO.box,"#44a7d6",.9,.1,.25,0,.18,0));
    [-.34,.34].forEach(x=>g.add(mesh(GEO.cyl,"#31343b",.16,.12,.16,x,.16,0)));
    g.add(mesh(GEO.cyl,"#555f6d",.05,1,.05,.35,.67,0));g.add(mesh(GEO.box,"#555f6d",.5,.06,.06,.35,1.17,0));return g},
  parkTrash(){const g=new THREE.Group();g.add(mesh(GEO.cyl,"#39896b",.55,1.1,.55,0,.58,0));g.add(mesh(GEO.cyl,"#234f47",.62,.13,.62,0,1.18,0));return g},
  parkBike(){const g=new THREE.Group();[-.65,.65].forEach(x=>{const w=mesh(GEO.torus||GEO.cyl,"#363e46",.5,.12,.5,x,.55,0);w.rotation.x=Math.PI/2;g.add(w)});
    g.add(mesh(GEO.box,"#edac44",1.2,.08,.1,0,.94,0));g.add(mesh(GEO.box,"#555f68",.12,.75,.12,.42,1.15,0));return g},
  parkBigLog(){const g=new THREE.Group();const m=mesh(GEO.cyl,"#91603b",.55,2.3,.55,0,.56,0);m.rotation.z=Math.PI/2;g.add(m);return g},
  parkTerrace(){const g=new THREE.Group();g.add(mesh(GEO.cyl,"#7b5942",.09,2.25,.09,0,1.12,0));
    const roof=mesh(GEO.cone,"#f1b85d",1.35,.55,1.35,0,2.42,0);g.add(roof);
    [-.62,.62].forEach(x=>g.add(mesh(GEO.cyl,"#946b4c",.38,.75,.38,x,.39,.35)));return g}
});
["parkLog","parkToy","parkCafe","parkTerrace","parkScooter","parkTrash","parkBike","parkBigLog"].forEach(x=>STATIC_OB.add(x));
function populatePark(g,ci,z0){
  const Z=zoneAt(ci),calm=ci===Z.c0,rows=[],gap=rowGap(ci);
  let z=z0-5;while(z>z0-CH+2){rows.push(z);z-=gap+rand(0,2.5)}
  rows.forEach(rz=>{
    if(calm&&rz>z0-10)return;
    const q=Math.random(),L=[null,null,null];
    if(q<.35)L[ri(3)]="tall";
    else if(q<.62){const free=ri(3);for(let k=0;k<3;k++)if(k!==free)L[k]=Math.random()<.5?"low":"tall"}
    else if(q<.82){for(let k=0;k<3;k++)L[k]="low";L[ri(3)]=null}
    else L[ri(3)]="low";
    L.forEach((kind,lane)=>{if(!kind)return;
      const ty=kind==="low"?pick(["parkLog","parkToy","parkToy","parkScooter","parkBigLog"]):pick(["parkDog","parkDog","parkCafe","parkTerrace","parkTrash","parkBike"]);
      const o=spawnObs(g,ty,lane,rz,ci,0);
      if(ty==="parkDog"){
        const u=o.m.userData,ph=rand(0,6);
        if(u&&u.d&&u.w)anims.push({chunk:ci,z:rz,f:t=>{if(o.dead)return;u.d.tail.rotation.y=Math.sin(t*9+ph)*.7;u.d.head.rotation.z=Math.sin(t*1.5+ph)*.15;u.w.head.rotation.x=.35+Math.sin(t*.8+ph)*.05}})
      }
    });
  });
  for(let j=0;j<rows.length;j++){
    const a=rows[j]-2.2,b=(j+1<rows.length?rows[j+1]:z0-CH-3)+2.2,len=a-b;
    if(len<3)continue;
    const lane=ri(3),x=LX[lane];if(Math.random()<.03&&!calm)addPickup(g,ci,pick(["coffee","bed","laptop"]),x,(a+b)/2);
    else{const fit=[3,5,10].filter(n=>(n-1)*1.4<=len);if(!fit.length)continue;const n=fit[fit.length-1],start=a-(len-(n-1)*1.4)/2;for(let q=0;q<n;q++)addCoin(g,ci,x,.8,start-q*1.4)}
  }
}
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
  st.night+=(ph-st.night)*Math.min(1,dt*.5);const n=st.night,N=ENVN[zone],off=zone!=="street"&&zone!=="bridge"&&zone!=="park";
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
