"""Standalone illustrative mature human erythrocyte; no other assets are rebuilt."""
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, rgb):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    linear = tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb)
    m.diffuse_color = (*linear, 1)
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*linear, 1)
    shader.inputs['Roughness'].default_value = .36
    return m

def biconcave(name, scale, mat):
    # Closed surface of revolution with one vertex at each pole: no center hole.
    # Illustrative profile, not a fitted specimen or a literal membrane thickness.
    rings, sides = 64, 128
    vertices = [(0, 0, .32 * .81 * scale)]
    for j in range(1, rings):
        a = math.pi * j / rings
        r = math.sin(a)
        z = .32 * math.cos(a) * (.81 + 7.83*r*r - 4.39*r**4)
        for i in range(sides):
            t = math.tau * i / sides
            vertices.append((2.8*r*math.cos(t)*scale, 2.8*r*math.sin(t)*scale, z*scale))
    bottom = len(vertices)
    vertices.append((0, 0, -.32 * .81 * scale))
    faces = [(0, 1+i, 1+(i+1)%sides) for i in range(sides)]
    for j in range(rings-2):
        for i in range(sides):
            a = 1+j*sides+i
            b = 1+j*sides+(i+1)%sides
            faces.append((a, a+sides, b+sides, b))
    for i in range(sides):
        a = 1+(rings-2)*sides+i
        b = 1+(rings-2)*sides+(i+1)%sides
        faces.append((a, bottom, b))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj['organelle'] = name
    for face in mesh.polygons:
        face.use_smooth = True
    # Consistent outward normals for the closed shell.
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)

biconcave('membrane', 1, material('Erythrocyte surface', (.72, .25, .25)))
biconcave('rbc_cytoplasm', .985, material('Hemoglobin-rich cytoplasm volume', (.86, .50, .44)))
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'red-blood-cell.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'public/red-blood-cell.glb'), export_format='GLB', export_extras=True)
print('EXPORTED red-blood-cell')
