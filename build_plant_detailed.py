"""Detailed illustrative leaf mesophyll cell; run in an isolated Blender process."""
from pathlib import Path
base=Path(__file__).with_name('build_cell.py').read_text()
exec(base.split("bowl('membrane',3.22,1.15)")[0])
random.seed(71)
mats.update({
 'wall':mat('Sage cell wall',(.45,.59,.26),.55),
 'wall_edge':mat('Fresh wall cut',(.72,.79,.44),.48),
 'membrane':mat('Olive plasma membrane',(.62,.71,.34),.42),
 'cytoplasm':mat('Warm green cytoplasm',(.68,.74,.44),.55),
 'chloroplast':mat('Chloroplast outer envelope',(.21,.47,.27),.38),
 'stroma':mat('Chloroplast inner cut',(.44,.65,.30),.46),
 'grana':mat('Thylakoid stacks',(.64,.79,.30),.4),
 'vacuole':mat('Central vacuole',(.36,.67,.68),.29),
})
# Rounded rectangular wall: continuous surface and a thick exposed cut edge.
def xy(t,r):
    c=math.cos(t);s=math.sin(t)
    return r*math.copysign(abs(c)**.42,c),r*.80*math.copysign(abs(s)**.42,s)
def wall_shell(key,r,thickness):
    vs=[];fs=[];sides=160;rings=18
    for j in range(rings+1):
        u=j/rings
        scale=.91+.09*math.sin(u*math.pi/2)
        z=-.8+u*1.1
        for i in range(sides):
            t=math.tau*i/sides;x,y=xy(t,r*scale)
            vs.append((x,y,z+.024*math.sin(t*5)*u))
    for j in range(rings):
        for i in range(sides):
            a=j*sides+i;b=j*sides+(i+1)%sides;fs.append((a,b,b+sides,a+sides))
    mesh=bpy.data.meshes.new(key);mesh.from_pydata(vs,[],fs);mesh.update()
    o=bpy.data.objects.new(key,mesh);bpy.context.collection.objects.link(o);keep(o,key)
    mod=o.modifiers.new('Cut thickness','SOLIDIFY');mod.thickness=thickness
    mod=o.modifiers.new('Rounded edges','BEVEL');mod.width=.025;mod.segments=3
wall_shell('wall',2.95,.12)
wall_shell('membrane',2.77,.028)
for z in [-.66,-.39,-.12]:
    tube('wall',[(*xy(t,2.96*(.91+.09*math.sin(((z+.8)/1.1)*math.pi/2))),z+.012*math.sin(t*8)) for t in [i*math.tau/160 for i in range(161)]],.014,'wall_edge')
tube('wall',[(*xy(t,2.95),.3+.024*math.sin(t*5)) for t in [i*math.tau/160 for i in range(161)]],.045,'wall_edge')
# Cytoplasm bed beneath and around the vacuole, shaped to the rectangular cell.
vs=[(0,0,-.64)]+[(*xy(i*math.tau/160,2.7),-.59) for i in range(160)]
fs=[(0,1+i,1+(i+1)%160) for i in range(160)]
mesh=bpy.data.meshes.new('cytoplasm');mesh.from_pydata(vs,[],fs);mesh.update();o=bpy.data.objects.new('cytoplasm',mesh);bpy.context.collection.objects.link(o);keep(o,'cytoplasm')
# Enlarged closed vacuole: soft irregularity avoids a perfect plastic ellipse.
o=ball('vacuole',(-.12,-.28,-.12),(1.83,1.37,.57),segments=64)
for v in o.data.vertices:
    v.co.x*=1+.035*math.sin(v.co.y*5+v.co.z*3)
    v.co.y*=1+.025*math.cos(v.co.x*5)
# Peripheral nucleus and rough ER with visible ribosomes.
nx,ny=.55,1.46
n=bowl('nucleus',.68,.58,center=(nx,ny,.87));mod=n.modifiers.new('Nuclear envelope','SOLIDIFY');mod.thickness=.025
tube('nucleus',[(nx+.68*math.cos(t),ny+.592*math.sin(t),.87) for t in [i*math.tau/80 for i in range(81)]],.035)
ball('nucleolus',(nx,ny,.61),(.23,.20,.21),segments=28)
for k in range(5):
    r=.39+k*.045
    tube('nucleus',[(nx+r*math.cos(t),ny+r*.87*math.sin(t),.87-.58*math.sqrt(max(.01,1-(r/.68)**2))+.02) for t in [i*math.tau/70 for i in range(71)]],.01,'nucleolus')
for k in range(6):
    radius=.73+k*.045;height=.55-k*.105
    sheet('er',(nx,ny),radius,height,-.4,math.pi*1.15,k*.4,width=.22)
    for j in range(12):
        t=-.4+j/11*(math.pi*1.15+.4);r=radius+.04*math.sin(t*8+k*.4)
        ball('ribosomes',(nx+r*math.cos(t),ny+r*.8*math.sin(t),height+.08*math.sin(t*7+k*.4)+.065),(.03,)*3,segments=8)
# A dictyosome (Golgi stack) in the peripheral cytoplasm.
for k in range(5):sheet('golgi',(-1.14,1.55),.43,.1+k*.10,-1.35,1.35,k*.2,width=.28)
for k in range(10):ball('golgi',(-1.43+random.uniform(-.25,.35),1.5+random.uniform(-.48,.44),random.uniform(-.12,.45)),(.055,)*3,segments=12)
# Chloroplast cutaways: double envelope, grana and intergranal lamellae.
for x,y,ang in [(-2.13,.65,.55),(-2.05,-1.28,-.4),(2.05,-.95,.8),(2.02,.75,1.1),(-.66,-1.86,.1)]:
    def tr(a,b,c):return(x+a*math.cos(ang)-b*math.sin(ang),y+a*math.sin(ang)+b*math.cos(ang),c)
    for radius,depth,z,material in [(1,.31,.25,'chloroplast'),(.92,.27,.26,'stroma')]:
        o=bowl('chloroplast',radius,depth,material=material);o.scale=(.62,.35/.87,1);o.location=(x,y,z);o.rotation_euler.z=ang
        mod=o.modifiers.new('Envelope thickness','SOLIDIFY');mod.thickness=.018
    for dx,dy in [(-.34,0),(0,.13),(.32,0),(0,-.13)]:
        for h in range(5):
            bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.105,depth=.018,location=tr(dx,dy,.015+h*.037))
            o=keep(bpy.context.object,'chloroplast','grana');bevel=o.modifiers.new('Thylakoid edge','BEVEL');bevel.width=.007;bevel.segments=2
    for z in [.065,.14]:
        tube('chloroplast',[tr(-.34,0,z),tr(0,.13,z),tr(.32,0,z)],.014,'grana')
        tube('chloroplast',[tr(-.34,0,z),tr(0,-.13,z),tr(.32,0,z)],.014,'grana')
# Small open mitochondria in the peripheral cytoplasm.
for x,y,ang in [(1.2,-1.95,-.2),(-1.98,1.71,.45)]:
    def tr(a,b,c):return(x+a*math.cos(ang)-b*math.sin(ang),y+a*math.sin(ang)+b*math.cos(ang),c)
    o=bowl('mitochondria',1,.19);o.scale=(.43,.23/.87,1);o.location=(x,y,.19);o.rotation_euler.z=ang
    mod=o.modifiers.new('Mitochondrial envelope','SOLIDIFY');mod.thickness=.025
    tube('mitochondria',[tr(.43*math.cos(t),.23*math.sin(t),.19) for t in [i*math.tau/60 for i in range(61)]],.025,'cristae')
    for k in range(5):tube('mitochondria',[tr(-.28+k*.14,.14*math.sin(t),.025+.11*math.cos(t)) for t in [-math.pi/2+j*math.pi/30 for j in range(31)]],.02,'cristae')
for k in range(65):
    while True:
        x=random.uniform(-2.55,2.55);y=random.uniform(-2.04,2.04)
        if (x/1.97)**2+((y+.28)/1.5)**2>1:break
    ball('ribosomes',(x,y,-.37+random.random()*.1),(.025,)*3,segments=8)
# Mesh groups preserve the viewer's semantic selection.
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.convert(target='MESH')
    if len(objects)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name=key;o['organelle']=key;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/plant-cell.glb',export_format='GLB',export_extras=True,use_selection=True)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True;scene.world.color=(.65,.65,.65)
for loc,power,size in [((-3,-4,7),1000,5),((4,2,5),750,4),((-2,4,6),900,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(4,-8,10));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=8.7;scene.camera=cam
scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=ROOT+'/plant-cell-detailed.png'
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/plant-cell.blend');bpy.ops.render.render(write_still=True)
print('DETAILED_PLANT_EXPORTED')
