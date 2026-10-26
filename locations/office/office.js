/* Локація office — перенесено з world.js без змін логіки. */

/* v28: однотекстурні офісні панелі замість 6-матеріальних кубів.
   Фон і лицева поверхня тепер можуть об’єднуватись freeze(d) за матеріалом.
   Геометрія і розміри лицьової поверхні залишаються незмінними. */
function officePanel(d,face,base,dir,w,h,len,x,y,z){
  d.add(mesh(GEO.box,base,w,h,len,x,y,z));
  const sign=dir===0?1:-1;
  d.add(mesh(GEO.box,face,.002,h,len,x+sign*(w*.5+.001),y,z));
}
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
    // v29: чотири рухомі аркуші малюються одним InstancedMesh (замість чотирьох draw calls).
    const sheets=new THREE.InstancedMesh(GEO.box,M("#ffffff"),4);
    sheets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sheets.frustumCulled=false;
    g.add(sheets);
    const sheetObj=new THREE.Object3D(),ph=Math.random()*5;
    anims.push({chunk:ci,z,f:t=>{const k=(t*.55+ph)%1,hitA=Math.max(0,Math.sin(t*9+ph));u.arm.rotation.x=-1.4-hitA*.8;u.head.rotation.z=Math.sin(t*4)*.1;w.position.y=k<.1?Math.sin(k/.1*Math.PI)*.15:0;
      for(let q=0;q<4;q++){const e=(t*.7+q/4+ph)%1;
        sheetObj.position.set(s*(5.6-e*1.6),1.3+Math.sin(e*Math.PI)*1.2,z+(q-1.5)*.4*e);
        sheetObj.rotation.set(e*6+q,e*3,e*4);
        sheetObj.scale.set(.3,.01,.4);
        sheetObj.updateMatrix();
        sheets.setMatrixAt(q,sheetObj.matrix);
      }
      sheets.instanceMatrix.needsUpdate=true;}})}
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
      officePanel(d,cityMat,"#2c3a63",dir,.06,2.7,5.7,s*6.63,2.75,z);
      d.add(mesh(GEO.box,"#2c3a63",.14,2.8,.12,s*6.6,2.75,z))}
    for(let k=1;k<=2;k++){const z=z0-k*10,r=Math.random();
      if(r<.4){officePanel(d,boardMat,"#c6ccd8",dir,.06,1.4,2.2,s*6.66,2.5,z)}
      else if(r<.75){officePanel(d,posterMat,"#1c2445",dir,.05,1.5,1.05,s*6.66,2.6,z)}
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
  g.add(mesh(GEO.box,"#1c2445",.005,.012,.05,.385,.16,-.04));g.add(mesh(GEO.box,"#1c2445",.005,.012,.05,.385,.16,.04));g.userData.body=body;return mergeRig(g,[body])}
function paperPlane(){const g=new THREE.Group();const m=M("#ffffff");
  [-1,1].forEach(s=>{const w=new THREE.Mesh(GEO.cone,m);w.scale.set(.32,.7,.02);w.rotation.x=-Math.PI/2;w.rotation.y=s*.5;w.position.set(s*.08,0,0);g.add(w)});
  const k=new THREE.Mesh(GEO.cone,M("#dfe5ee"));k.scale.set(.05,.7,.12);k.rotation.x=-Math.PI/2;k.position.y=-.05;g.add(k);return mergeRig(g,[])}
