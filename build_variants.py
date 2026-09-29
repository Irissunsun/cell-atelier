"""Generate three additional stylized specimens in a separate Blender process."""
from pathlib import Path
base=Path(__file__).with_name('build_cell.py').read_text()
# Reuse only geometry/material helpers; do not execute the animal-cell scene.
exec(base.split("bowl('membrane',3.22,1.15)")[0])

def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False); groups.clear()

def export(name):
    for key,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.convert(target='MESH')
        if len(objects)>1:bpy.ops.object.join()
        o=bpy.context.object;o.name=key;o['organelle']=key
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/'+name+'.blend')
    bpy.ops.export_scene.gltf(filepath=ROOT+'/public/'+name+'.glb',export_format='GLB',export_extras=True)
    print('EXPORTED',name)

def nucleus(loc,size=.65):
    ball('nucleus',loc,(size,size*.9,size),segments=32)
    ball('nucleolus',(loc[0],loc[1]-.35*size,loc[2]+size*.72),(size*.29,)*3)

def mito(x,y,z):
    ball('mitochondria',(x,y,z),(.43,.23,.14))
    tube('mitochondria',[(x-.33+i*.011,y+.13*math.sin(i*.55),z+.13) for i in range(61)],.026,'cristae')

def cut_shell(key,loc,scale,material=None):
    """Lower half ellipsoid: the open rim is an explicit teaching cut plane."""
    o=bowl(key,1,1,material=material)
    o.scale=(scale[0],scale[1]/.87,scale[2]);o.location=loc
    return o

def disc(key,loc,radius,material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=radius,depth=.025,location=loc)
    return keep(bpy.context.object,key,material)

def granules(radius,count,zbase=-.4):
    for k in range(count):
        t=random.random()*math.tau;r=radius*random.uniform(.2,.95);s=random.uniform(.035,.095)
        ball('vesicles',(r*math.cos(t),r*math.sin(t)*.87,zbase+random.uniform(0,.35)),(s,)*3,segments=10)

clear()
mats['wall']=mat('Leaf green cell wall',(.34,.52,.19))
mats['membrane']=mat('Plant membrane',(.59,.71,.29))
mats['cytoplasm']=mat('Plant cytoplasm',(.62,.71,.40))
mats['chloroplast']=mat('Chloroplast',(.20,.45,.17))
mats['grana']=mat('Grana',(.60,.75,.28))
mats['vacuole']=mat('Central vacuole',(.32,.70,.76),.24)
# Rounded rectangular cut-open cell wall, with a raised lip.
def outline(scale,z):
    pts=[]
    for i in range(161):
        t=i*math.tau/160;c=math.cos(t);s=math.sin(t)
        pts.append((scale*math.copysign(abs(c)**.45,c),scale*.81*math.copysign(abs(s)**.45,s),z))
    return pts
for z in [-.65,-.48,-.31,-.14,.03]:tube('wall',outline(2.73,z),.17)
tube('membrane',outline(2.53,.08),.07)
ball('cytoplasm',(0,0,-.62),(2.7,2.18,.18),segments=48)
ball('vacuole',(-.25,-.20,-.13),(1.63,1.25,.48),segments=40)
nucleus((.80,1.15,.3),.68)
for k in range(5):sheet('er',(.8,1.15),.7+k*.08,.16-k*.09,-.2,math.pi*1.7,k,.23)
for x,y,a in [(-1.9,.9,.6),(-1.75,-1.2,-.5),(1.9,-.8,1),(1.9,.6,.3)]:
    o=cut_shell('chloroplast',(x,y,.20),(.56,.32,.38));o.rotation_euler.z=a
    for dx in [-.25,0,.25]:
        for h in range(4):
            disc('chloroplast',(x+dx*math.cos(a),y+dx*math.sin(a),-.06+h*.045),.105,'grana')
    for h in [0,2]:
        tube('chloroplast',[(x-.25*math.cos(a),y-.25*math.sin(a),-.06+h*.045),(x+.25*math.cos(a),y+.25*math.sin(a),-.06+h*.045)],.013,'grana')
mito(-.8,1.6,.05);mito(.7,-1.65,.04)
export('plant-cell')

clear()
mats['membrane']=mat('Leukocyte membrane',(.77,.75,.83),.65)
mats['cytoplasm']=mat('Leukocyte interior',(.63,.66,.75),.58)
mats['vesicles']=mat('Cytoplasmic granules',(.70,.38,.61))
bowl('membrane',2.65,1.8);bowl('cytoplasm',2.55,1.68,center=(0,0,.04))
tube('membrane',[(2.65*math.cos(t)*(1+.035*math.sin(t*5)+.022*math.sin(t*9)),2.65*.87*math.sin(t)*(1+.035*math.sin(t*5)+.022*math.sin(t*9)),0) for t in [j*math.tau/120 for j in range(121)]],.10)
# Segmented nucleus: this specimen specifically represents a neutrophil.
for x,y,z in [(-.6,.5,-.12),(.45,.65,-.06),(.78,-.36,-.13)]:
    ball('nucleus',(x,y,z),(.67,.58,.53),segments=32)
tube('nucleus',[(-.6,.5,-.12),(.0,.65,-.06),(.45,.65,-.06),(.66,.1,-.10),(.78,-.36,-.13)],.17)
granules(2.35,160,-.7)
groups['granules']=groups.pop('vesicles')
for x,y in [(-1.45,-.5),(.0,-1.65),(1.65,.6)]:mito(x,y,-.35)
for k in range(155):
    t=random.random()*math.tau;z=random.uniform(-1.5,-.12);r=2.65*math.sqrt(1-(z/1.8)**2)
    ball('membrane',(r*math.cos(t),r*.87*math.sin(t),z),(.07,.07,.055),segments=10)
for k in range(8):
    t=k*math.tau/8
    tube('membrane',[(2.3*math.cos(t),2.0*math.sin(t),-.35),(2.75*math.cos(t+.05),2.4*math.sin(t+.05),-.2),(3.05*math.cos(t+.13),2.6*math.sin(t+.13),-.3)],.105)
export('white-blood-cell')

clear()
mats['membrane']=mat('Neuron soma',(.39,.37,.63))
mats['soma']=mat('Soma cytoplasm',(.66,.59,.76))
mats['dendrites']=mat('Dendritic arbors',(.48,.38,.66))
mats['axon']=mat('Axon',(.66,.41,.58))
mats['myelin']=mat('Myelin sheath',(.61,.77,.79),.38)
mats['terminals']=mat('Axon terminals',(.58,.36,.68))
cut_shell('membrane',(-2.15,0,.18),(.78,.7,.64))
cut_shell('soma',(-2.15,0,.18),(.74,.66,.60))
cut_shell('nucleus',(-2.15,0,.10),(.34,.30,.36))
ball('nucleolus',(-2.15,0,-.04),(.085,)*3)
# Branching dendrites lie mostly in the presentation plane, with subtle depth.
def branch(origin,angle,length,depth):
    x,y,z=origin;end=(x+math.cos(angle)*length,y+math.sin(angle)*length,z+random.uniform(-.14,.14))
    mid=((x+end[0])*.5+.07*math.sin(angle),(y+end[1])*.5,z+.04)
    tube('dendrites',[origin,mid,end],.018+depth*.019)
    if depth:
        branch(end,angle-.5,length*.58,depth-1);branch(end,angle+.55,length*.6,depth-1)
for a in [1.0,1.65,2.2,2.8,3.45,4.1,4.8]:branch((-2.15+.55*math.cos(a),.55*math.sin(a),0),a,.62,3)
axonpoints=[(-1.6+i*.068,.07*math.sin(i*.13),0) for i in range(79)]
tube('axon',axonpoints,.07)
for k in range(7):
    x=-.9+k*.62
    tube('myelin',[(x,.07*math.sin((x+1.6)/.068*.13),0),(x+.44,.07*math.sin((x+2.04)/.068*.13),0)],.17)
    for end in [x,x+.44]:
        tube('myelin',[(end,.07*math.sin((end+1.6)/.068*.13)+.17*math.cos(t),.17*math.sin(t)) for t in [j*math.tau/24 for j in range(25)]],.023)
for k in range(5):
    end=(4.15+random.uniform(-.2,.25),(k-2)*.47,random.uniform(-.08,.08))
    tube('terminals',[(3.5,0,0),(3.8,(k-2)*.23,0),end],.045)
    ball('terminals',end,(.12,.10,.10),segments=16)
export('neuron')
