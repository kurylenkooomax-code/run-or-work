/* Локація park — перенесено з world.js без змін логіки. */
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
