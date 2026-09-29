"""Render the exported web assets as transparent collection thumbnails."""
import bpy, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
out=ROOT/'public/thumbnails';out.mkdir(exist_ok=True)
requested=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for name in ['animal-cell','plant-cell','white-blood-cell','neuron','red-blood-cell','sperm-cell','cyanobacterium']:
    if requested and name not in requested:continue
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'public'/f'{name}.glb'))
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
    corners=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
    lo=Vector(tuple(min(v[i] for v in corners) for i in range(3)));hi=Vector(tuple(max(v[i] for v in corners) for i in range(3)));center=(lo+hi)/2
    bpy.ops.object.camera_add(location=center+Vector((4,-8,10)));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=max(hi-lo)*1.12
    scene=bpy.context.scene;scene.camera=cam;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.world.color=(.7,.7,.7)
    for loc,power,size in [((-3,-4,7),1100,5),((4,2,5),800,4)]:
        bpy.ops.object.light_add(type='AREA',location=center+Vector(loc));o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
    scene.render.resolution_x=224;scene.render.resolution_y=224;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/f'{name}.png');bpy.ops.render.render(write_still=True)
print('THUMBNAILS_COMPLETE')
