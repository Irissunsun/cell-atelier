import * as THREE from 'three';
// Labels use actual surface vertices, not the empty centre of dispersed groups.
export function createViewLabels(mount,camera,onSelect){
 const layer=document.createElement('div');layer.className='structure-labels';layer.hidden=true;mount.append(layer);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');layer.append(svg);
 let items=[],enabled=false;
 function setItems(groups){
  for(const item of items)item.button.remove();svg.replaceChildren();
  items=groups.map(({key,name,objects})=>{
   const object=objects.find(o=>o.geometry.attributes.position.count>0);if(!object)return null;
   object.updateWorldMatrix(true,false);
   const box=new THREE.Box3().setFromObject(object),center=box.getCenter(new THREE.Vector3());
   const p=object.geometry.attributes.position,point=new THREE.Vector3(),anchor=new THREE.Vector3();let distance=Infinity;
   for(let i=0;i<p.count;i+=Math.max(1,Math.floor(p.count/400))){point.fromBufferAttribute(p,i).applyMatrix4(object.matrixWorld);const d=point.distanceToSquared(center);if(d<distance){distance=d;anchor.copy(point);}}
   const button=document.createElement('button');button.textContent=name;button.onclick=()=>onSelect(key);layer.append(button);
   const path=document.createElementNS(svg.namespaceURI,'path');svg.append(path);
   return {key,objects,anchor,button,path};
  }).filter(Boolean);
 }
 return {setItems,setEnabled(value){enabled=value;layer.hidden=!value;},render(){
  if(!enabled)return;const w=mount.clientWidth,h=mount.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const sides=[[],[]];
  for(const item of items){const p=item.anchor.clone().project(camera);const visible=item.objects.some(o=>o.visible)&&Math.abs(p.z)<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1;item.button.hidden=!visible;item.path.style.display=visible?'':'none';if(visible)sides[p.x<0?0:1].push({...item,x:(p.x+1)*w/2,y:(1-p.y)*h/2});}
  sides.forEach((side,index)=>{side.sort((a,b)=>a.y-b.y);const step=Math.min(48,(h-230)/Math.max(1,side.length));side.forEach((item,i)=>{const y=Math.max(135,(h-side.length*step)/2)+i*step;const x=index?w-100:12;item.button.style.transform=`translate(${x}px,${y}px)`;item.path.setAttribute('d',`M ${item.x} ${item.y} L ${index?x:x+86} ${y+15}`);});});
 }};
}
