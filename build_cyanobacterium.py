"""Blender cutaway of a thylakoid-bearing unicellular cyanobacterium.
Run only in a separate background Blender process; builds one asset.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
random.seed(27)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
groups={}
def mat(name,hexcolor,rough=.46):
    rgb=[int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
    linear=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb]
    m=bpy.data.materials.new(name);m.use_nodes=True
    m.diffuse_color=(*linear,1)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*linear,1);p.inputs['Roughness'].default_value=rough
    return m
mats={k:mat(k,c) for k,c in {'wall':'558d86','membrane':'a5b99b','cytoplasm':'c3d6bd','thylakoids':'3e998a','nucleoid':'c39659','ribosomes':'977aa6','antennae':'81b4a0'}.items()}
def keep(o,key,m=None):
    o.data.materials.append(mats[m or key]);groups.setdefault(key,[]).append(o)
    for p in getattr(o.data,'polygons',[]):p.use_smooth=True
    return o

def shell(key,radius,zcut=0,thickness=.035):
    # Closed rim with visible cut thickness; horizontal section through ellipsoid.
    rings,sides=36,128;vs=[];fs=[]
    start=math.acos(zcut/radius)
    for j in range(rings+1):
        a=start+(math.pi-.015-start)*j/rings
        for i in range(sides):
            t=math.tau*i/sides
            r=radius*math.sin(a)
            vs.append((2.18*r*math.cos(t),r*math.sin(t),radius*math.cos(a)))
    for j in range(rings):
        for i in range(sides):
            a=j*sides+i;b=j*sides+(i+1)%sides;fs.append((a,b,b+sides,a+sides))
    fs.append(tuple(range(rings*sides,(rings+1)*sides)))
    mesh=bpy.data.meshes.new(key);mesh.from_pydata(vs,[],fs);mesh.update()
    o=bpy.data.objects.new(key,mesh);bpy.context.collection.objects.link(o);keep(o,key)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    mod=o.modifiers.new('Cut membrane thickness','SOLIDIFY');mod.thickness=thickness
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bevel=o.modifiers.new('Soft cut edges','BEVEL');bevel.width=.018;bevel.segments=3
    bpy.ops.object.modifier_apply(modifier=bevel.name);o.select_set(False)
    return o

def ball(key,loc,scale,m=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=loc)
    o=keep(bpy.context.object,key,m);o.scale=scale;return o

def tube(key,pts,width):
    curve=bpy.data.curves.new(key,'CURVE');curve.dimensions='3D';curve.bevel_depth=width;curve.bevel_resolution=3
    spline=curve.splines.new('POLY');spline.points.add(len(pts)-1)
    for p,v in zip(spline.points,pts):p.co=(*v,1)
    o=bpy.data.objects.new(key,curve);bpy.context.collection.objects.link(o);keep(o,key);return o

shell('wall',1.62,.08,.075)
shell('membrane',1.49,.08,.035)
shell('cytoplasm',1.4,-.12,.025)
# Three peripheral lamellae; their exposed edges distinguish them from the envelope.
for j,r in enumerate([1.29,1.09,.89]):
    shell('thylakoids',r,-.22-.03*j,.028)
    # Enlarged surface light-harvesting complexes, attached to the cut-facing membrane.
    for i in range(32):
        t=math.tau*i/32
        z=-.28-.03*j;rr=math.sqrt(r*r-z*z)
        ball('thylakoids',(2.18*rr*math.cos(t),rr*math.sin(t),z+.025),(.035,.028,.023),'antennae')
# Irregular folded DNA loops, not a literal chromosome count or molecular scale helix.
pts=[]
for i in range(961):
    t=math.tau*i/960
    x=1.85*math.sin(t)+.27*math.sin(11*t+.2)
    y=.36*math.sin(5*t+.7)+.16*math.sin(13*t)
    z=.03+.21*math.cos(7*t)+.075*math.sin(17*t)
    pts.append((x,y,z))
tube('nucleoid',pts,.026)
# Two differently sized lobes give each ribosome a readable granular silhouette.
for i in range(95):
    while True:
        x=random.uniform(-2.7,2.7);y=random.uniform(-1.02,1.02)
        if (x/2.9)**2+(y/1.14)**2<.88 and (abs(y)>.46 or abs(x)>2.15):break
    z=random.uniform(-.13,.03)
    size=random.uniform(.045,.066)
    ball('ribosomes',(x,y,z),(size,size*.8,size*.7))
    ball('ribosomes',(x+.025,y,z+size*.65),(size*.6,size*.55,size*.45))
# Join by selectable structure, retaining organelle metadata in GLB extras.
outputs=[]
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target='MESH');bpy.ops.object.join()
    o=bpy.context.object;o.name=key;o['organelle']=key
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);outputs.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in outputs:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/cyanobacterium.glb'),export_format='GLB',export_extras=True,use_selection=True)
# Studio setup is stored in .blend for editing/rendering; it is excluded from GLB.
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.world.color=(.65,.65,.65)
for name,loc,power,size in [('Key',(0,-3,7),900,5),('Fill',(-5,1,4),650,5),('Rim',(3,4,6),1100,4)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector((0,0,-.3))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(5,-9,8));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,-.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=9;scene.camera=cam
scene.render.resolution_x=1200;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/'cyanobacterium-blender.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'cyanobacterium.blend'))
bpy.ops.render.render(write_still=True)
print('EXPORTED cyanobacterium')
