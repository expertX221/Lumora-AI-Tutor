"""Create Lumora's editable Blender source, web GLB, and studio preview.
Run with Blender --background --factory-startup --python this_file.py
"""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

APP = Path(__file__).resolve().parents[1]
OUT = APP.parent / 'lumora-studio'
WEB = APP / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
WEB.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0.0, roughness=0.3, glow=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Emission Color'].default_value = (*color, 1)
    shader.inputs['Emission Strength'].default_value = glow
    return mat

carbon = material('Midnight titanium', (0.055, 0.075, 0.045), 0.85, 0.22)
lime = material('Lime light rails', (0.56, 1.0, 0.15), 0.3, 0.24, 0.65)
pearl = material('Porcelain chrome', (0.8, 0.9, 0.65), 0.6, 0.18)
white = material('White signal light', (0.95, 1.0, 0.87), 0.15, 0.2, 1.0)

root = bpy.data.objects.new('Lumora_Blender_Core', None)
bpy.context.collection.objects.link(root)
root['created_with'] = 'Blender'
root['purpose'] = 'Interactive learning core for Lumora'

def finish(obj, name, mat, parent=root):
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj

def torus(name, radius, thickness, mat, parent):
    bpy.ops.mesh.primitive_torus_add(major_segments=56, minor_segments=8, major_radius=radius, minor_radius=thickness)
    return finish(bpy.context.object, name, mat, parent)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.62)
core = finish(bpy.context.object, 'Faceted_Knowledge_Nucleus', pearl)
for face in core.data.polygons:
    face.use_smooth = False
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.66)
wire = finish(bpy.context.object, 'Nucleus_Lime_Lattice', lime)
mod = wire.modifiers.new('Fine structural lattice', 'WIREFRAME')
mod.thickness = 0.008
mod.use_replace = True
bpy.context.view_layer.objects.active = wire
bpy.ops.object.modifier_apply(modifier=mod.name)

for i in range(3):
    pivot = bpy.data.objects.new(f'Orbit_Gimbal_{i+1}', None)
    bpy.context.collection.objects.link(pivot)
    pivot.parent = root
    radius = 1.06 + i * 0.21
    torus(f'Titanium_Orbit_{i+1}', radius, 0.042, carbon, pivot)
    for offset in (-0.045, 0.045):
        rail = torus(f'Lime_Orbit_Rail_{i+1}_{offset}', radius, 0.012, lime, pivot)
        rail.location.z = offset
    for j in range(12):
        a = j / 12 * 2 * math.pi
        bpy.ops.mesh.primitive_cube_add(size=1, location=(radius*math.cos(a), radius*math.sin(a), 0))
        tick = finish(bpy.context.object, f'Orbit_{i+1}_Index_{j+1:02}', pearl if j % 3 else white, pivot)
        tick.scale = (0.09, 0.025, 0.085)
        tick.rotation_euler.z = a
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.09, location=(radius, 0, 0))
    finish(bpy.context.object, f'Orbit_{i+1}_Signal_Beacon', white, pivot)
    pivot.rotation_euler = (math.radians(25 + i*53), math.radians(15 + i*40), math.radians(i*30))

asset_meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
triangles = sum(len(p.vertices)-2 for o in asset_meshes for p in o.data.polygons)
bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for obj in root.children_recursive:
    obj.select_set(True)
bpy.context.view_layer.objects.active = root
glb = WEB / 'lumora-blender-core.glb'
bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB', use_selection=True, export_animations=False, export_extras=True, export_yup=True)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.render.resolution_x = 1000
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.025, 0.035, 0.022, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4

def area(name, location, energy, color, size):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.color = color
    data.shape = 'DISK'
    data.size = size
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0,0,0)) - obj.location).to_track_quat('-Z', 'Y').to_euler()

area('Studio softbox', (3,-4,5), 600, (0.96,1,0.9), 4)
area('Lime rim softbox', (-3,1,2), 350, (0.65,1,0.35), 3)
area('White separation', (0,4,3), 500, (1,1,1), 2)
cam_data = bpy.data.cameras.new('Product camera')
cam = bpy.data.objects.new('Product camera', cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (3.4,-6.5,3.0)
cam.rotation_euler = (-cam.location).to_track_quat('-Z','Y').to_euler()
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 4.1
scene.camera = cam
scene.render.film_transparent = False
scene.render.filepath = str(OUT / 'lumora-core-preview.png')
scene.view_settings.view_transform = 'AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'Lumora-Knowledge-Core.blend'))
manifest = {'generator': bpy.app.version_string, 'mesh_count':len(asset_meshes), 'triangles':triangles, 'glb_bytes':glb.stat().st_size, 'model':'/assets/lumora-blender-core.glb'}
(OUT/'asset-report.json').write_text(json.dumps(manifest, indent=2))
print('LUMORA_ASSET_REPORT ' + json.dumps(manifest))
bpy.ops.render.render(write_still=True)
