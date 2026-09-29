import bpy, math, random, os
from mathutils import Vector
random.seed(42)
ROOT=os.path.dirname(os.path.abspath(__file__))
os.makedirs(ROOT+'/public',exist_ok=True)
# This script runs in an independent background process.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
def mat(name,color,rough=.42):
    color=tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in color)
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Roughness'].default_value=rough
    return m
mats={
 'membrane':mat('Lavender membrane',(.40,.30,.65)),
 'cytoplasm':mat('Blue cytoplasm',(.20,.36,.49)),
 'nucleus':mat('Violet nucleus',(.43,.11,.62)),
 'nucleolus':mat('Deep violet nucleolus',(.25,.035,.40)),
 'er':mat('Purple endoplasmic reticulum',(.38,.18,.57)),
 'golgi':mat('Rose Golgi apparatus',(.76,.30,.47)),
 'mitochondria':mat('Coral mitochondria',(.71,.19,.15)),
 'cristae':mat('Peach cristae',(.98,.52,.40)),
 'fibers':mat('Powder blue cytoskeleton',(.45,.67,.76)),
 'vesicles':mat('Golden vesicles',(.92,.66,.22)),
 'ribosomes':mat('Pale ribosomes',(.76,.57,.85)),
 'centrioles':mat('Ochre centrioles',(.89,.58,.14))}
groups={}
def keep(o,key,material=None):
    o.name=key; o.data.materials.append(mats[material or key]); groups.setdefault(key,[]).append(o)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o
def ball(key,loc,scale,material=None,segments=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=12,location=loc)
    o=bpy.context.object; o.scale=scale; return keep(o,key,material)
def tube(key,pts,r,material=None):
    c=bpy.data.curves.new(key,'CURVE'); c.dimensions='3D'; c.resolution_u=2; c.bevel_depth=r; c.bevel_resolution=2
    s=c.splines.new('POLY'); s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new(key,c); bpy.context.collection.objects.link(o); return keep(o,key,material)
def bowl(key,r,depth,center=(0,0,0),material=None):
    verts=[]; faces=[]; rings=22; sides=96
    for j in range(rings+1):
        a=(.018+(math.pi/2-.018)*j/rings)
        for i in range(sides):
            t=i*2*math.pi/sides; wave=1+.035*math.sin(5*t)+.022*math.sin(9*t)
            verts.append((center[0]+r*math.sin(a)*math.cos(t)*wave,center[1]+r*.87*math.sin(a)*math.sin(t)*wave,center[2]-depth*math.cos(a)))
    for j in range(rings):
        for i in range(sides):
            a=j*sides+i; b=j*sides+(i+1)%sides; faces.append((a,b,b+sides,a+sides))
    mesh=bpy.data.meshes.new(key); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(key,mesh); bpy.context.collection.objects.link(o); keep(o,key,material)
    return o
def sheet(key,center,radius,height,start,end,phase,width=.26):
    verts=[]; faces=[]; n=100; across=8
    for i in range(n+1):
        t=start+(end-start)*i/n
        for j in range(across+1):
            u=j/across; r=radius+width*(u-.5)+.06*math.sin(t*8+phase)
            z=height+.08*math.sin(t*7+phase)+.04*math.sin(u*math.pi)
            verts.append((center[0]+r*math.cos(t),center[1]+r*.8*math.sin(t),z))
    for i in range(n):
        for j in range(across):
            a=i*(across+1)+j; faces.append((a,a+1,a+across+2,a+across+1))
    mesh=bpy.data.meshes.new(key); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(key,mesh); bpy.context.collection.objects.link(o); keep(o,key)
    mod=o.modifiers.new('Soft membrane thickness','SOLIDIFY'); mod.thickness=.035
    for side in (0,across):tube(key,[verts[i*(across+1)+side] for i in range(n+1)],.024)
outer=bowl('membrane',3.22,1.15)
solid=outer.modifiers.new('Visible cut thickness','SOLIDIFY');solid.thickness=.065
bowl('cytoplasm',3.10,1.04,center=(0,0,.04))
rim=[(3.22*math.cos(t)*(1+.035*math.sin(5*t)+.022*math.sin(9*t)),3.22*.87*math.sin(t)*(1+.035*math.sin(5*t)+.022*math.sin(9*t)),0) for t in [i*math.tau/160 for i in range(161)]]
tube('membrane',rim,.075)
# A cut-open nucleus with visible inner nucleolus, towards the back.
nuclear=bowl('nucleus',.96,.90,center=(.25,.80,.95))
solid=nuclear.modifiers.new('Nuclear envelope thickness','SOLIDIFY');solid.thickness=.035
tube('nucleus',[(.25+.96*math.cos(t),.8+.835*math.sin(t),.95) for t in [i*math.tau/96 for i in range(97)]],.055)
ball('nucleolus',(.25,.8,.62),(.37,.34,.34))
# Chromatin threads follow the inner nuclear bowl; small pores sit on its rim.
for k in range(12):
    pts=[]
    for i in range(55):
        t=i/54*math.tau; r=.48+k*.031+.03*math.sin(t*5+k)
        pts.append((.25+r*math.cos(t),.8+.87*r*math.sin(t),.95-.90*math.sqrt(max(.01,1-(r/.96)**2))+.025))
    tube('nucleus',pts,.012,'nucleolus')
for k in range(26):
    t=k*math.tau/26
    tube('nucleus',[(.25+(.93+.04*math.cos(a))*math.cos(t),.8+(.80+.04*math.cos(a))*math.sin(t),.95+.04*math.sin(a)) for a in [j*math.tau/12 for j in range(13)]],.014,'nucleolus')
# Folded rough ER sheets wrap around the nucleus.
for k in range(9):
    pts=[]
    for i in range(101):
        t=-.15+i/100*math.pi*1.68; rr=1.0+k*.065+.05*math.sin(t*9+k)
        pts.append((.25+rr*math.cos(t),.8+rr*.79*math.sin(t),.62-k*.115+.06*math.sin(t*6)))
    sheet('er',(.25,.8),1.0+k*.065,.62-k*.115,-.15,math.pi*1.68-.15,k,width=.32)
    for i in range(0,len(pts),6):
        p=pts[i]; ball('ribosomes',(p[0],p[1],p[2]+.085),(.044,.044,.044),segments=10)
# Pink curved cisternae, each with a rolled lip.
for k in range(7):
    pts=[]
    for i in range(44):
        t=-1.3+i/43*2.6; pts.append((-1.35+.55*math.cos(t),-.55+.7*math.sin(t),.18+k*.095+.10*math.cos(t*2)))
    sheet('golgi',(-1.35,-.55),.55,.18+k*.095,-1.3,1.3,k*.15,width=.42)
for i in range(15):
    ball('golgi',(-1.5+random.uniform(-.5,.3),-.65+random.uniform(-.7,.8),random.uniform(-.1,.55)),(.08,.08,.09))
# Open mitochondrial envelopes and folded internal cristae.
for x,y,z,ang in [(-1.85,1.05,.03,.4),(1.98,.45,.03,1.1),(1.45,-1.32,.01,-.5),(-.1,-1.9,-.12,.2)]:
    def tr(a,b,c):return (x+a*math.cos(ang)-b*math.sin(ang),y+a*math.sin(ang)+b*math.cos(ang),z+c)
    o=bowl('mitochondria',1,.28)
    o.scale=(.66,.38/.87,1);o.location=(x,y,z+.18);o.rotation_euler.z=ang
    mod=o.modifiers.new('Mitochondrial envelope','SOLIDIFY');mod.thickness=.035
    tube('mitochondria',[tr(.66*math.cos(t),.38*math.sin(t),.18) for t in [i*math.tau/96 for i in range(97)]],.035,'cristae')
    for fold in range(7):
        xx=-.48+fold*.16;extent=.27*math.sqrt(max(.1,1-(xx/.64)**2))
        pts=[]
        for i in range(41):
            u=i/40; yy=-extent+2*extent*u
            pts.append(tr(xx+.035*math.sin(u*math.pi*2),yy,-.04+.18*math.sin(u*math.pi)))
        tube('mitochondria',pts,.026,'cristae')
# Smooth ER tubules form a branching network to the left of the nucleus.
for branch in range(10):
    pts=[]
    for i in range(61):
        u=i/60
        pts.append((-1.15-.95*u+.09*math.sin(u*math.tau*2+branch),.55-branch*.11+.15*math.sin(u*math.pi*2+branch*.5),.13+.20*u+.045*math.sin(u*math.tau*3+branch)))
    tube('er',pts,.04,'golgi')
# Fine pale-blue filaments laid inside the cell bowl.
for k in range(75):
    a=random.random()*math.tau; b=a+random.uniform(1.0,3.5); pts=[]
    for i in range(49):
        u=i/48; xx=2.87*((1-u)*math.cos(a)+u*math.cos(b)); yy=2.45*((1-u)*math.sin(a)+u*math.sin(b))
        xx+=.1*math.sin(u*math.tau*3+k); yy+=.12*math.sin(u*math.tau*2+k)
        zz=-.90*math.sqrt(max(.01,1-(xx/3.1)**2-(yy/2.75)**2))+.07
        pts.append((xx,yy,zz))
    tube('fibers',pts,.015)
# Membrane proteins and granular surface details, batched into existing groups.
for k in range(190):
    t=random.random()*math.tau; z=random.uniform(-1.05,-.08)
    r=3.22*math.sqrt(max(.01,1-(z/1.15)**2))
    w=1+.035*math.sin(5*t)+.022*math.sin(9*t)
    ball('membrane',(r*math.cos(t)*w,r*.87*math.sin(t)*w,z),(.03,.03,.027),segments=8)
for k in range(80):
    t=random.random()*math.tau; r=random.uniform(1.4,2.85); x=r*math.cos(t); y=r*.83*math.sin(t)
    z=-.77*math.sqrt(max(.02,1-(r/3.1)**2))+.15; rr=random.uniform(.035,.12)
    ball('vesicles' if k%3 else 'ribosomes',(x,y,z),(rr,rr,rr),segments=12)
for k in range(34):
    t=k*math.tau/34; z=random.uniform(-.65,-.10); r=3.22*math.sqrt(1-(z/1.15)**2)
    ball('membrane',(r*math.cos(t),r*.87*math.sin(t),z),(.065,.065,.075))
for k in range(9):
    t=k*math.tau/9
    tube('centrioles',[(.05+.19*math.cos(t),-.83+.19*math.sin(t),-.20),(.05+.19*math.cos(t),-.83+.19*math.sin(t),.45)],.045)
# Low relief folds follow the membrane surface instead of floating particles.
for k in range(22):
    phase=k*math.tau/22;pts=[]
    for i in range(45):
        a=.28+i/44*1.18;t=phase+.06*math.sin(a*8+k)
        wave=1+.035*math.sin(5*t)+.022*math.sin(9*t)
        pts.append((3.23*math.sin(a)*math.cos(t)*wave,3.23*.87*math.sin(a)*math.sin(t)*wave,-1.15*math.cos(a)))
    tube('membrane',pts,.021)
# A second centriole, perpendicular to the first, shows the pair.
for k in range(9):
    t=k*math.tau/9
    tube('centrioles',[(.3,-.95+.16*math.cos(t),-.03+.16*math.sin(t)),(.88,-.95+.16*math.cos(t),-.03+.16*math.sin(t))],.038)
# Convert and join per organelle type for inexpensive browser drawing and picking.
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target='MESH'); bpy.ops.object.join()
    o=bpy.context.object; o.name=key; o['organelle']=key
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/animal-cell.glb',export_format='GLB',export_extras=True,use_selection=True)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.world.color=(.65,.65,.65)
for loc,power,size in [((-3,-4,7),1000,5),((4,2,5),750,4),((-2,4,6),1000,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(4,-8,9));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=8.1;scene.camera=cam
scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.filepath=ROOT+'/animal-cell-detailed.png'
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/animal-cell.blend')
bpy.ops.render.render(write_still=True)
print('DETAILED_CELL_EXPORTED')
