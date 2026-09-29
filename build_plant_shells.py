"""Closed Blender shells supplement the detailed plant cutaway."""
from pathlib import Path
exec(Path(__file__).with_name('build_cell.py').read_text().split("bowl('membrane',3.22,1.15)")[0])
for key,r,z0,z1,color in [('wall',3.02,-.94,1.55,(.48,.61,.29)),('membrane',2.86,-.83,1.39,(.65,.73,.40))]:
    material=mat('Whole '+key,color,.53)
    n=160;rings=48;vs=[];faces=[]
    # Rounded rectangular closed body; flat central top and gently rounded corners.
    for j in range(1,rings):
        a=-math.pi/2+math.pi*j/rings
        radial=abs(math.cos(a))**.24
        z=(z0+z1)/2+(z1-z0)/2*math.copysign(abs(math.sin(a))**.5,math.sin(a))
        for i in range(n):
            t=math.tau*i/n;c=math.cos(t);s=math.sin(t)
            vs.append((r*radial*math.copysign(abs(c)**.42,c),r*.8*radial*math.copysign(abs(s)**.42,s),z))
    for j in range(rings-2):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    bottom=len(vs);vs.append((0,0,z0));top=len(vs);vs.append((0,0,z1))
    for i in range(n):
        faces.append((bottom,(i+1)%n,i));a=(rings-2)*n+i;b=(rings-2)*n+(i+1)%n;faces.append((a,b,top))
    mesh=bpy.data.meshes.new('whole_'+key);mesh.from_pydata(vs,[],faces);mesh.update()
    o=bpy.data.objects.new('whole_'+key,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(material);o['organelle']=key;o['wholeShell']=True
    for p in mesh.polygons:p.use_smooth=True
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/plant-shells.glb',export_format='GLB',export_extras=True,use_selection=True)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/plant-shells.blend')
