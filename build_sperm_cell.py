"""Standalone illustrative human sperm-cell model for the teaching viewer."""
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, rgb, roughness=.38):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    linear = tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb)
    m.diffuse_color = (*linear, 1)
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*linear, 1)
    shader.inputs['Roughness'].default_value = roughness
    return m


def ellipsoid(name, organelle, location, scale, mat, segments=64, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    obj['organelle'] = organelle
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def tube_curve(name, organelle, points, radius, mat):
    curve = bpy.data.curves.new(name, type='CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 3
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    curve.resolution_u = 8
    spline = curve.splines.new('NURBS')
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
        p.radius = 1 - .78 * (points.index(co) / max(1, len(points)-1))
    spline.order_u = min(4, len(points))
    spline.use_endpoint_u = True
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj['organelle'] = organelle
    return obj


nucleus_mat = material('Condensed nucleus', (.43, .30, .58), .34)
acrosome_mat = material('Acrosome cap', (.82, .43, .47), .32)
mito_mat = material('Mitochondrial sheath', (.81, .40, .20), .35)
flagellum_mat = material('Flagellum', (.30, .55, .61), .4)

# Head: a compact nucleus with a visibly distinct anterior acrosomal cap.
ellipsoid('nucleus', 'nucleus', (-3.25, 0, 0), (1.05, .63, .42), nucleus_mat)
# An open hemispherical cap follows the anterior nucleus surface.
vertices=[];faces=[];rings=32;sides=64
for j in range(rings+1):
    theta=.001+(math.acos(.05)-.001)*j/rings
    for i in range(sides):
        phi=math.tau*i/sides
        vertices.append((-1.09*math.cos(theta),.66*math.sin(theta)*math.cos(phi),.45*math.sin(theta)*math.sin(phi)))
for j in range(rings):
    for i in range(sides):
        a=j*sides+i;b=j*sides+(i+1)%sides;faces.append((a,a+sides,b+sides,b))
mesh=bpy.data.meshes.new('Acrosome cap');mesh.from_pydata(vertices,[],faces);mesh.update()
cap=bpy.data.objects.new('acrosome',mesh);bpy.context.collection.objects.link(cap)
cap.location=(-3.25,0,0);cap['organelle']='acrosome';cap.data.materials.append(acrosome_mat)
for face in cap.data.polygons:face.use_smooth=True
bpy.context.view_layer.objects.active=cap
solid=cap.modifiers.new('Cap thickness','SOLIDIFY');solid.thickness=.035
bpy.ops.object.modifier_apply(modifier=solid.name)

# Axial core and principal tail. A gentle wave keeps the tail legible in 3D.
tail_points = []
for i in range(46):
    t = i / 45
    x = -2.32 + 7.75 * t
    amp = .025 + .12 * max(0, t - .18)
    tail_points.append((x, amp * math.sin(t * math.tau * 1.35), amp * .45 * math.cos(t * math.tau * 1.35)))
tube_curve('flagellum', 'flagellum', tail_points, .075, flagellum_mat)

# Midpiece: simplified mitochondrial sheath wrapped around the proximal flagellum.
for i in range(28):
    t = i / 27
    x = -2.05 + 1.45 * t
    a = i * .78
    y = .21 * math.cos(a)
    z = .21 * math.sin(a)
    obj = ellipsoid(f'mitochondria_{i:02d}', 'mitochondria', (x, y, z), (.16, .105, .085), mito_mat, 24, 12)
    obj.rotation_euler.x = a

# Convert curves explicitly: glTF exports mesh geometry, not Blender splines.
for key in ['nucleus','acrosome','mitochondria','flagellum']:
    bpy.ops.object.select_all(action='DESELECT')
    objects=[o for o in bpy.context.scene.objects if o.get('organelle')==key]
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target='MESH')
    if len(objects)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name=key;o['organelle']=key
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/sperm-cell.glb'),export_format='GLB',export_extras=True,use_selection=True)

from mathutils import Vector
# Studio setup is stored in .blend for editing/rendering; it is excluded from GLB.
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.world.color=(.65,.65,.65)
for name,loc,power,size in [('Key',(0,-3,7),900,5),('Fill',(-5,1,4),650,5),('Rim',(3,4,6),1100,4)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector((0,0,-.3))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1,-9,11));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,-.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=12.5;scene.camera=cam
scene.render.resolution_x=1200;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/'sperm-cell-blender.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'sperm-cell.blend'))
bpy.ops.render.render(write_still=True)
print('EXPORTED sperm-cell')
