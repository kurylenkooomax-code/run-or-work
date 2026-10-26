/* Локація street — перенесено з world.js без змін логіки. */
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
    // v30: тіло птаха — одна злитa сітка, крила залишаються рухомими.
    wl.userData.dyn=true;wr.userData.dyn=true;mergeStatic(p);
    p.position.set(x+rand(-.7,.7),0,z+rand(-.8,.8));p.rotation.y=rand(0,6);g.add(p);ps.push({p,wl,wr,vx:rand(-2,2),vz:rand(-1.5,1.5),ph:rand(0,6)})}
  let fly=0;anims.push({chunk:ci,z,f:(t,dt)=>{if(!fly&&st&&st.z-z<9&&st.z-z>-2)fly=.001;
    ps.forEach(q=>{if(fly){q.p.position.y+=dt*(3+fly*2);q.p.position.x+=q.vx*dt;q.p.position.z+=q.vz*dt;const f=Math.sin(t*40+q.ph)*.9;q.wl.rotation.z=f;q.wr.rotation.z=-f;if(q.p.position.y>9)q.p.visible=false}
      else{q.p.rotation.x=Math.max(0,Math.sin(t*3+q.ph))*.35}});if(fly)fly+=dt}})}
/* перехід між локаціями: тільки табличка під стелею (без рамки і скляних дверей, щоб було видно дорогу далі) */
