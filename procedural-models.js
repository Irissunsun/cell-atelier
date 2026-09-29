import * as THREE from 'three';

function material(color,{roughness=.58,metalness=.02}={}){
 return new THREE.MeshStandardMaterial({color,roughness,metalness});
}

function organelleMesh(geometry,mat,key,name){
 const mesh=new THREE.Mesh(geometry,mat);
 mesh.name=name;
 mesh.userData.organelle=key;
 return mesh;
}

export function createSpermCellModel(){
 const root=new THREE.Group();
 root.name='sperm-cell';

 // Head: a flattened nucleus with an anterior acrosomal cap.
 const nucleus=organelleMesh(
  new THREE.SphereGeometry(1,48,32),
  material('#755894',{roughness:.5}),
  'nucleus','sperm-nucleus'
 );
 nucleus.position.set(-3.25,0,0);
 nucleus.scale.set(1.05,.64,.46);
 root.add(nucleus);

 const acrosome=organelleMesh(
  new THREE.SphereGeometry(1,44,28),
  material('#d9878f',{roughness:.48}),
  'acrosome','sperm-acrosome'
 );
 acrosome.position.set(-4.02,0,.015);
 acrosome.scale.set(.49,.66,.47);
 root.add(acrosome);

 // Tail: keep the wave gentle so the whole flagellum remains easy to read.
 const tailPoints=[];
 for(let i=0;i<=38;i++){
  const t=i/38;
  const x=THREE.MathUtils.lerp(-2.22,5.45,t);
  const envelope=Math.sin(Math.PI*t);
  tailPoints.push(new THREE.Vector3(
   x,
   .13*Math.sin(t*Math.PI*4.2)*envelope,
   .17*Math.sin(t*Math.PI*3.3+.45)*envelope
  ));
 }
 const tailCurve=new THREE.CatmullRomCurve3(tailPoints);
 const flagellum=organelleMesh(
  new THREE.TubeGeometry(tailCurve,110,.085,10,false),
  material('#6f9eaa',{roughness:.46}),
  'flagellum','sperm-flagellum'
 );
 root.add(flagellum);

 // Midpiece: a simplified mitochondrial sheath spirals around the proximal tail.
 const mitoMat=material('#ce7b4e',{roughness:.52});
 const mitoGeo=new THREE.SphereGeometry(1,20,14);
 const mitochondria=new THREE.Group();
 mitochondria.name='mitochondrial-sheath';
 for(let i=0;i<28;i++){
  const t=i/27;
  const x=THREE.MathUtils.lerp(-2.08,-.62,t);
  const angle=t*Math.PI*10;
  const radius=.19;
  const mito=organelleMesh(mitoGeo,mitoMat,'mitochondria',`sperm-mitochondrion-${i+1}`);
  mito.position.set(x,Math.cos(angle)*radius,Math.sin(angle)*radius);
  mito.scale.set(.115,.082,.082);
  mitochondria.add(mito);
 }
 root.add(mitochondria);

 return root;
}

