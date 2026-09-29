import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/addons/postprocessing/OutlinePass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createFocusView({renderer,scene,camera,controls,mount}) {
 renderer.setClearAlpha(0);
 const composer=new EffectComposer(renderer);
 composer.addPass(new RenderPass(scene,camera));
 const outline=new OutlinePass(new THREE.Vector2(1,1),scene,camera);
 outline.edgeStrength=4;outline.edgeThickness=1.3;outline.edgeGlow=0;outline.pulsePeriod=0;
 outline.visibleEdgeColor.set('#d5a44b');outline.hiddenEdgeColor.set('#705878');
 composer.addPass(outline);composer.addPass(new OutputPass());
 const label=document.createElement('div');label.className='focus-label';label.setAttribute('role','status');label.hidden=true;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('focus-leader');svg.setAttribute('aria-hidden','true');
 svg.innerHTML='<path fill="none" stroke="currentColor" stroke-width="1.5"/><circle r="4" fill="currentColor" stroke="#f8f5ea" stroke-width="2"/>';
 svg.style.display='none';mount.append(svg,label);
 const bounds=new THREE.Box3(),center=new THREE.Vector3(),size=new THREE.Vector3();
 const ray=new THREE.Raycaster(),point=new THREE.Vector3();
 let chosen=[],all=[],anchor=null,dirty=true,tween=null,lastScan=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 controls.addEventListener('change',()=>dirty=true);
 controls.addEventListener('start',()=>{tween=null;});
 function clear(){chosen=[];outline.selectedObjects=[];outline.enabled=false;anchor=null;tween=null;label.hidden=true;svg.style.display='none';}
 function select(objects,meshes,name,english,fit=true){
  chosen=objects.filter(o=>o.visible);all=meshes;outline.selectedObjects=chosen;outline.enabled=chosen.length>0;
  label.replaceChildren();const title=document.createElement('strong');title.textContent=name;const sub=document.createElement('span');sub.textContent=english;label.append(title,sub);
  anchor=null;dirty=true;lastScan=0;
  bounds.makeEmpty();for(const o of chosen)bounds.expandByObject(o);
  if(fit&&!bounds.isEmpty()){
   bounds.getCenter(center);bounds.getSize(size);
   // Keep dispersed groups in context; gently approach compact structures.
   const compact=size.length()<3.2;
   const target=compact?center.clone():new THREE.Vector3(0,.05,0);
   const current=camera.position.clone().sub(controls.target);
   const distance=compact?Math.max(5.5,Math.min(9,size.length()*2.8)):Math.max(12.5,current.length());
   const destination=target.clone().add(current.normalize().multiplyScalar(distance));
   tween={start:performance.now(),from:camera.position.clone(),to:destination,targetFrom:controls.target.clone(),targetTo:target};
   if(reduced.matches){camera.position.copy(destination);controls.target.copy(target);tween=null;controls.update();}
  }
 }
 function findAnchor(){
  // Project real surface vertices, then raycast them. Never anchor in the empty
  // centre of a merged group (e.g. several separated mitochondria).
  const candidates=[];camera.updateMatrixWorld();
  for(const o of chosen){const p=o.geometry.attributes.position;const step=Math.max(1,Math.floor(p.count/100));for(let i=0;i<p.count;i+=step){point.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);const world=point.clone();point.project(camera);if(Math.abs(point.x)>.92||Math.abs(point.y)>.9||Math.abs(point.z)>1)continue;candidates.push({world,x:point.x,y:point.y,score:point.x*point.x+point.y*point.y});}}
  candidates.sort((a,b)=>a.score-b.score);
  const visible=all.filter(o=>o.visible);let obscured=null;
  for(const c of candidates.slice(0,32)){
   ray.setFromCamera(new THREE.Vector2(c.x,c.y),camera);
   const selectedHit=ray.intersectObjects(chosen,false)[0];if(!selectedHit)continue;
   const first=ray.intersectObjects(visible,false)[0];
   if(first&&chosen.includes(first.object)){anchor={point:first.point.clone(),hidden:false};return;}
   obscured??={point:selectedHit.point.clone(),hidden:true};
  }
  anchor=obscured;
 }
 function drawLabel(now){
  if(!chosen.length)return;
  if(dirty&&now-lastScan>100){findAnchor();lastScan=now;dirty=false;}
  if(!anchor){label.hidden=true;svg.style.display='none';return;}
  point.copy(anchor.point).project(camera);
  if(Math.abs(point.x)>1||Math.abs(point.y)>1||Math.abs(point.z)>1){label.hidden=true;svg.style.display='none';return;}
  label.hidden=false;svg.style.display='block';
  const w=mount.clientWidth,h=mount.clientHeight,x=(point.x+1)*w/2,y=(1-point.y)*h/2;
  const lw=label.offsetWidth,lh=label.offsetHeight;
  const left=Math.max(10,Math.min(w-lw-10,x<w/2?x+65:x-lw-65)),top=Math.max(12,Math.min(h-lh-12,y-80));
  label.style.transform=`translate(${left}px,${top}px)`;
  const ex=x<left?left:left+lw,ey=top+lh/2;
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  svg.querySelector('path').setAttribute('d',`M ${x} ${y} L ${(x+ex)/2} ${ey} L ${ex} ${ey}`);
  svg.querySelector('path').setAttribute('stroke-dasharray',anchor.hidden?'4 3':'none');
  svg.querySelector('circle').setAttribute('cx',x);svg.querySelector('circle').setAttribute('cy',y);
  label.querySelector('span').textContent=label.dataset.english+(anchor.hidden?' · 位于遮挡后方':'');
 }
 return {
  select(objects,meshes,name,english,fit){label.dataset.english=english;select(objects,meshes,name,english,fit);},clear,
  resize(w,h){composer.setSize(w,h);dirty=true;},
  render(now=performance.now()){
   if(tween){const t=Math.min(1,(now-tween.start)/420),e=1-Math.pow(1-t,3);camera.position.lerpVectors(tween.from,tween.to,e);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,e);if(t===1)tween=null;dirty=true;}
   controls.update();composer.render();drawLabel(now);
  }
 };
}
