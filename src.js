import './style.css';
import './refinements.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createViewLabels} from './view-labels.js';
import {createFocusView} from './focus-view.js';
import {specimens,extraEntries,structureEntry,membraneHiddenAfterSelection} from './specimens.js';
const assetBase=import.meta.env.BASE_URL;
const entries={
 nucleus:['细胞核','Nucleus','#85519f','细胞的遗传信息中心。核膜包裹着染色质，内部的核仁参与核糖体的形成。','储存 DNA，调控基因表达','双层核膜包围的细胞器','紫色剖面中，深紫色的小球是核仁。'],
 mitochondria:['线粒体','Mitochondrion','#cc6c52','细胞进行有氧呼吸的重要场所。内部膜折叠形成嵴，为能量转换提供更大的表面积。','通过氧化磷酸化合成 ATP','双层膜，内膜折叠形成嵴','珊瑚色外壳内，浅粉色曲线表现内膜的折叠。'],
 er:['内质网','Endoplasmic reticulum','#8b69a6','核周围相互连通的膜性结构。紫色片层表示粗面内质网，粉色分支管道表示光面内质网；粗面内质网上附着核糖体。','合成与加工蛋白质、脂质','相互连通的膜囊和管道','围绕细胞核的层叠紫色膜片上，点缀着浅色核糖体。'],
 golgi:['高尔基体','Golgi apparatus','#c87e96','由层叠的扁平膜囊组成，接收来自内质网的物质，进一步修饰、分类并包装。','修饰、分拣和运输蛋白质','扁平膜囊与周围运输囊泡','粉色层叠膜囊旁的小球，用来表现运输囊泡；邻近的粉色分支管道属于内质网。'],
 membrane:['细胞膜','Cell membrane','#9986ba','细胞与外部环境之间的选择性边界，参与物质运输、细胞识别和信号交流。','选择性控制物质进出','以磷脂双分子层为基础','当前标本以剖面形式展示，点击“隐藏外膜”可查看内部。'],
 fibers:['细胞骨架','Cytoskeleton','#80abba','贯穿细胞质的蛋白质纤维网络，帮助细胞维持形态，并参与运动和胞内运输。','支撑形态，参与运动与运输','由多类蛋白质纤维构成','浅蓝色丝线是一种简化表达，真实细胞骨架包含不同类型的纤维。'],
 centrioles:['中心粒','Centriole','#c39b45','由微管构成的圆筒形结构，通常在动物细胞的中心体中成对出现。','参与微管组织与纺锤体形成','九组微管排列成筒状','金色管束为示意结构；本版仅展示其中一个中心粒。'],
 vesicles:['囊泡','Vesicle','#d4b15d','膜包裹的小型囊状结构，负责运输、储存和处理多种细胞内物质。','胞内物质运输与储存','由膜围成的小囊','金色小球用于表现分布在细胞质中的囊泡。'],
 ribosomes:['核糖体','Ribosome','#b49ac5','由核糖体 RNA 和蛋白质构成，是细胞中合成蛋白质的场所。','根据 mRNA 信息合成蛋白质','无膜包围，由大小亚基构成','浅紫色颗粒分布在内质网表面与细胞质中。']};
const nav=document.querySelector('#organelles');
Object.assign(entries,extraEntries);
let activeCell='animal-cell',loadVersion=0;
const entryFor=key=>structureEntry(activeCell,key,entries);
const cellList=document.createElement('div');cellList.className='cell-list';cellList.setAttribute('aria-label','选择细胞类型');document.querySelector('.specimen').replaceWith(cellList);
for(const id of ['animal-cell','plant-cell','cyanobacterium','white-blood-cell','neuron','red-blood-cell','sperm-cell']){const cell=specimens[id];const b=document.createElement('button');b.className='specimen';b.dataset.cell=id;b.innerHTML=`<span class="cell-icon" style="color:${cell.color}"><img src="${assetBase}thumbnails/${id}.png" alt="" width="44" height="44" loading="lazy"></span><span>${cell.en}<small>${cell.zh} · ${cell.sub}</small></span>`;b.onclick=()=>loadCell(id);cellList.append(b)}
function buildNavigation(){nav.replaceChildren();for(const key of specimens[activeCell].keys){const v=entryFor(key);const b=document.createElement('button');b.dataset.key=key;b.innerHTML=`<span class="dot" style="--dot:${v[2]}"></span>${v[0]}<span class="en">${v[1]}</span>`;b.onclick=()=>select(key);nav.append(b)}}
const mount=document.querySelector('#canvas');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.max(1,Math.min(devicePixelRatio,1.7)));renderer.setClearColor(0xf8f5ea,1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;mount.append(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,80);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.85;controls.autoRotateSpeed=.7;controls.target.set(0,0,0);
const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
renderer.toneMappingExposure=1.0;
scene.add(new THREE.HemisphereLight(0xfff9ed,0x8b7495,.65));const key=new THREE.DirectionalLight(0xfff3dc,2);key.position.set(-4,8,5);scene.add(key);const fill=new THREE.DirectionalLight(0xd8d0ff,.6);fill.position.set(5,4,-3);scene.add(fill);
key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.035;key.shadow.bias=-.0001;
// A deterministic microtexture adds a subtle organic grain to the exported surfaces.
const grainSize=128,grain=new Uint8Array(grainSize*grainSize);let seed=492;
for(let i=0;i<grain.length;i++){seed=(seed*1664525+1013904223)>>>0;grain[i]=80+(seed%130)}
const bump=new THREE.DataTexture(grain,grainSize,grainSize,THREE.RedFormat);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(9,9);bump.magFilter=THREE.LinearFilter;bump.minFilter=THREE.LinearMipmapLinearFilter;bump.generateMipmaps=true;bump.needsUpdate=true;
let model,selected='nucleus',isolate=false,hideMembrane=false;
const meshes=[];const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();
let selectionFocus=false;
const focusView=createFocusView({renderer,scene,camera,controls,mount});
const baseColors=new WeakMap();
let viewMode='cutaway',labelsEnabled=false;
const viewLabels=createViewLabels(mount,camera,select);
const modePanel=document.createElement('div');modePanel.className='view-modes';modePanel.hidden=true;
modePanel.innerHTML='<p>VIEW MODE / 观察方式</p><div role="group" aria-label="植物细胞观察方式"><button data-view="whole" aria-pressed="false">整体</button><button data-view="cutaway" aria-pressed="true">剖面</button><button data-view="transparent" aria-pressed="false">透明</button></div><button id="labels" aria-pressed="false">结构标签</button><small id="mode-note" role="status"></small>';
document.querySelector('.viewer').append(modePanel);
function setViewMode(value){viewMode=value;hideMembrane=false;document.querySelector('#membrane').setAttribute('aria-pressed','false');isolate=false;document.querySelector('#isolate').setAttribute('aria-pressed','false');overview();}
modePanel.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setViewMode(b.dataset.view));
modePanel.querySelector('#labels').onclick=e=>{labelsEnabled=!labelsEnabled;e.currentTarget.setAttribute('aria-pressed',labelsEnabled);update();};

function prepareSelectionMaterials(o){if(o.userData.selectionMaterials)return;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of(Array.isArray(o.material)?o.material:[o.material]))baseColors.set(m,m.color.clone());o.userData.selectionMaterials=true;}
function syncFocus(fit=false){if(!selectionFocus){focusView.clear();return;}focusView.select(meshes.filter(o=>o.visible&&(idOf(o)===selected||(selected==='nucleus'&&idOf(o)==='nucleolus'))),meshes,entryFor(selected)[0],entryFor(selected)[1],fit);}
function select(id){if(!entryFor(id))return;if(activeCell==='plant-cell'&&viewMode==='whole'&&id!=='wall')viewMode='cutaway';selected=id;selectionFocus=true;document.getElementById('isolate').disabled=false;controls.autoRotate=false;document.getElementById('rotate').setAttribute('aria-pressed','false');hideMembrane=membraneHiddenAfterSelection(activeCell,id,hideMembrane);document.getElementById('membrane').setAttribute('aria-pressed',hideMembrane);const v=entryFor(id);if(!v)return;document.querySelector('#detail-title').textContent=v[0];document.querySelector('#detail-en').textContent=v[1];document.querySelector('#detail-icon').style.color=v[2];document.querySelector('#detail-description').textContent=v[3];document.querySelector('#detail-function').textContent=v[4];document.querySelector('#detail-structure').textContent=v[5];let note=v[6];if(activeCell==='plant-cell'&&id==='nucleus')note='紫色部分为细胞核，深紫色小球为核仁的示意。';if(activeCell==='white-blood-cell'&&id==='nucleus')note='该标本选择中性粒细胞，紫色部分表现分叶细胞核；白细胞并非都具有此形态。';if(activeCell==='neuron'&&id==='membrane')note='本图单独展示胞体的膜层剖面；真实细胞膜还连续包围树突与轴突。';if(activeCell==='neuron'&&id==='nucleus')note='紫色开放剖面展示胞体内部的细胞核，深紫色小球为核仁；上部结构为观察内部而省略。';document.querySelector('#detail-note').textContent=note;nav.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.key===id);b.setAttribute('aria-pressed',b.dataset.key===id)});document.querySelector('.detail-number').textContent='SELECTED STRUCTURE / 当前结构';document.querySelector('.viewer').dataset.mode='focus';update();syncFocus(true)}
function idOf(o){let p=o;while(p){if(p.userData.organelle)return p.userData.organelle;if(entries[p.name])return p.name;p=p.parent}return o.name}
function update(){
 for(const o of meshes){
  const id=idOf(o),chosen=selectionFocus&&(id===selected||(selected==='nucleus'&&id==='nucleolus'));
  o.visible=isolate?chosen:!(hideMembrane&&specimens[activeCell].hidden.includes(id));
  const shell=o.userData.wholeShell;
  if(activeCell==='plant-cell'){
   if(shell)o.visible=!isolate&&viewMode!=='cutaway'&&!(hideMembrane&&id==='membrane');
   else if(['wall','membrane'].includes(id)&&!isolate&&viewMode!=='cutaway')o.visible=false;
  }
  const transparentShell=shell&&viewMode==='transparent';
  o.castShadow=!transparentShell;o.renderOrder=transparentShell?(id==='wall'?3:2):0;
  for(const m of(Array.isArray(o.material)?o.material:[o.material])){
   m.color.copy(baseColors.get(m));if(selectionFocus&&!chosen&&!isolate)m.color.lerp(new THREE.Color('#a8a296'),.62);
   m.emissive?.set(chosen?entryFor(selected)[2]:0x000000);m.emissiveIntensity=chosen?.08:0;
   if(m.transparent){m.transparent=false;m.needsUpdate=true;}m.opacity=1;m.depthWrite=true;if(transparentShell){m.transparent=true;m.opacity=id==='wall'?.12:.08;m.depthWrite=false;m.side=THREE.FrontSide;m.needsUpdate=true;}else m.side=THREE.DoubleSide;
  }
 }
 modePanel.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===viewMode));
 document.querySelector('.viewer').dataset.viewMode=viewMode;
 document.querySelector('#mode-note').textContent=({whole:'完整外形 · 点选内部结构进入剖面',cutaway:'教学剖面 · 部分外壳省略',transparent:'外壳透明示意 · 便于定位内部结构'})[viewMode];
 viewLabels.setItems(specimens[activeCell].keys.map(key=>({key,name:entryFor(key)[0],objects:meshes.filter(o=>o.visible&&idOf(o)===key&&(viewMode!=='whole'||key==='wall'))})));
 viewLabels.setEnabled(labelsEnabled&&activeCell==='plant-cell');
 mount.classList.toggle('all-labels',labelsEnabled&&activeCell==='plant-cell');
 syncFocus();
}
function overview(){
 selected=null;selectionFocus=false;isolate=false;focusView.clear();
 document.getElementById('isolate').setAttribute('aria-pressed','false');
 nav.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
 const cell=specimens[activeCell];
 document.querySelector('.viewer').dataset.mode='overview';
 document.querySelector('.detail-number').textContent='WHOLE SPECIMEN / 整体浏览';
 document.querySelector('#detail-title').textContent=cell.zh;
 document.querySelector('#detail-en').textContent=cell.en;
 document.querySelector('#detail-description').textContent='点击左侧结构名称或模型，查看对应位置、结构与功能。';
 document.querySelector('#detail-function').textContent='整体观察与结构定位';
 document.querySelector('#detail-structure').textContent=cell.sub;
 document.querySelector('#detail-note').textContent=cell.omitted;
 document.querySelector('#detail-icon').style.color=cell.color;
 document.getElementById('isolate').disabled=true;update();
}
function reset(){viewMode='cutaway';labelsEnabled=false;document.querySelector('#labels').setAttribute('aria-pressed','false');hideMembrane=false;controls.autoRotate=false;camera.position.fromArray(specimens[activeCell].camera||[4.6,8.8,10.4]);controls.target.set(0,.05,0);controls.update();['rotate','isolate','membrane'].forEach(id=>document.getElementById(id).setAttribute('aria-pressed','false'));overview();}
const modelCache=new Map();
async function loadCell(id){
 const version=++loadVersion,loading=document.querySelector('#loading');loading.hidden=false;loading.textContent=`正在准备${specimens[id].zh}…`;document.querySelector('.viewer').setAttribute('aria-busy','true');
 try{
  if(!modelCache.has(id))modelCache.set(id,new GLTFLoader().loadAsync(`${assetBase}${id}.glb?v=7`).catch(e=>{modelCache.delete(id);throw e}));
  const g=await modelCache.get(id);
  if(id==='plant-cell'&&!g.scene.userData.hasShells){
   if(!modelCache.has('plant-shells'))modelCache.set('plant-shells',new GLTFLoader().loadAsync(`${assetBase}plant-shells.glb?v=1`).catch(e=>{modelCache.delete('plant-shells');throw e}));
   const shells=await modelCache.get('plant-shells');g.scene.add(shells.scene);g.scene.userData.hasShells=true;
  }
  if(version!==loadVersion)return;
  modePanel.hidden=id!=='plant-cell';
  if(model)scene.remove(model);meshes.length=0;activeCell=id;model=g.scene;scene.add(model);
  model.traverse(o=>{if(o.isMesh){prepareSelectionMaterials(o);meshes.push(o);o.castShadow=true;o.receiveShadow=true;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.side=THREE.DoubleSide;m.envMapIntensity=['animal-cell','plant-cell'].includes(id)?.32:.45;if(o.geometry.attributes.uv){m.bumpMap=bump;m.bumpScale=.025;m.needsUpdate=true}}}});
  const cell=specimens[id];document.querySelector('.title h1').innerHTML=`${cell.en}<span>${cell.zh}</span>`;document.querySelector('.title>p:last-child').textContent=cell.description;document.querySelector('.index-note').textContent=`${cell.zh} / ${cell.sub}`;document.querySelector('footer>span:last-child').textContent=`${cell.zh} / 可交互模型`;const download=document.querySelector('.download');download.href=`${assetBase}${id}.glb`;download.setAttribute('download','');download.removeAttribute('aria-disabled');download.innerHTML='下载 3D 标本 <span>GLB ↗</span>';document.querySelector('.edition span').textContent=`№ 00${Object.keys(specimens).indexOf(id)+1}`;document.querySelector('.viewer').dataset.specimen=id;
  cellList.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.cell===id);b.setAttribute('aria-pressed',b.dataset.cell===id)});
  const membraneButton=document.querySelector('#membrane');const hasMembraneToggle=cell.hidden.includes('membrane');membraneButton.disabled=!hasMembraneToggle;membraneButton.textContent=hasMembraneToggle?`◌ ${cell.hideLabel}`:'◌ 细胞膜未单独建模';
  document.querySelector('.catalog-foot').textContent=`教学简化示意 · 非真实比例与颜色。${cell.omitted}`;
  buildNavigation();reset();loading.hidden=true;
 }catch(e){if(version===loadVersion){loading.textContent='加载失败，请再次点击左侧标本重试。';console.error(e)}}finally{if(version===loadVersion)document.querySelector('.viewer').setAttribute('aria-busy','false')}
}
let down={x:0,y:0};renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(meshes.filter(o=>o.visible&&!(o.userData.wholeShell&&viewMode==='transparent')),false).find(h=>entryFor(idOf(h.object))||idOf(h.object)==='nucleolus');if(hit){selectionFocus=true;select(idOf(hit.object)==='nucleolus'?'nucleus':idOf(hit.object));}});
document.getElementById('rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',controls.autoRotate)};
document.getElementById('membrane').onclick=e=>{hideMembrane=!hideMembrane;e.currentTarget.setAttribute('aria-pressed',hideMembrane);if(hideMembrane&&selected==='membrane')overview();update()};
document.getElementById('isolate').onclick=e=>{isolate=!isolate;e.currentTarget.setAttribute('aria-pressed',isolate);update()};document.getElementById('reset').onclick=reset;
document.getElementById('capture').onclick=()=>{focusView.render();const a=document.createElement('a');a.download='cell-atelier.png';a.href=renderer.domElement.toDataURL('image/png');a.click()};
new ResizeObserver(()=>{const {width,height}=mount.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(18))/Math.min(1,camera.aspect)));camera.updateProjectionMatrix();focusView.resize(width,height)}).observe(mount);
renderer.setAnimationLoop(()=>{focusView.render();viewLabels.render();});buildNavigation();reset();loadCell('animal-cell');

for(const button of document.querySelectorAll('[data-compare-cell]'))button.addEventListener('click',async()=>{await loadCell(button.dataset.compareCell);document.querySelector('.viewer').scrollIntoView({block:'start',behavior:'auto'});});
