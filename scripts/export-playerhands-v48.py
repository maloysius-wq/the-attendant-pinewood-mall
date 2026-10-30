# Development-time only. Import the original CC0 OpenGameArt Playerhands
# .blend and export the actual skinned forearm/hand, not a procedural substitute.
import bpy
import os
import json
import math
from mathutils import Vector

output=os.environ['PINEWOOD_HAND_OUTPUT']
print("SOURCE_BLEND",bpy.data.filepath,flush=True)
for obj in bpy.data.objects:
    if obj.type in {'MESH','ARMATURE'}:
        print("SOURCE_OBJECT",obj.name,obj.type,
              "verts" if obj.type=='MESH' else "bones",
              len(obj.data.vertices) if obj.type=='MESH' else len(obj.data.bones),flush=True)
meshes=[o for o in bpy.data.objects if o.type=='MESH' and len(o.data.vertices)>=80]
rigs=[o for o in bpy.data.objects if o.type=='ARMATURE' and len(o.data.bones)>=2]
if not meshes or not rigs:
    raise RuntimeError('Expected actual skinned arm/forearm mesh AND joint rig in OGA Playerhands.')
# Require that at least one exported mesh is weighted to the chosen armature,
# rather than accidentally exporting an armature next to an unrelated mesh.
rig=max(rigs,key=lambda o:len(o.data.bones))
weighted=[o for o in meshes if any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers) or o.parent==rig]
if not weighted:
    raise RuntimeError('Original Playerhands arm mesh does not have a matching skinning rig.')
print('RIG_BONES',json.dumps([b.name for b in rig.data.bones]),flush=True)
for obj in weighted:
    dimensions=[round(float(v),4) for v in obj.dimensions]
    print('SKIN_MESH',obj.name,len(obj.data.vertices),dimensions,flush=True)
# The original source includes skin art in hands.png, but the legacy
# Blender material does not export as glTF PBR automatically. Embed the
# original CC0 texture onto the existing UV coordinates, not a new skin mesh.
texture_path=os.path.join(os.path.dirname(bpy.data.filepath),'hands.png')
if not os.path.isfile(texture_path):
    raise RuntimeError('Original CC0 hands.png texture missing alongside hand_rig.blend')
skin_image=bpy.data.images.load(texture_path,check_existing=True)
skin_mat=bpy.data.materials.new(name='OpenGameArt Playerhands source skin')
skin_mat.use_nodes=True
nodes=skin_mat.node_tree.nodes
links=skin_mat.node_tree.links
principled=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
source_texture=nodes.new('ShaderNodeTexImage')
source_texture.name='CC0 original hands.png'
source_texture.image=skin_image
links.new(source_texture.outputs['Color'],principled.inputs['Base Color'])
for obj in weighted:
    obj.data.materials.clear()
    obj.data.materials.append(skin_mat)
print('SOURCE_SKIN_TEXTURE',texture_path,flush=True)
# Export armature and only its attached actual skin meshes.
bpy.ops.object.select_all(action='DESELECT')
for obj in weighted+[rig]:
    obj.hide_set(False)
    obj.hide_render=False
    obj.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',use_selection=True,
                          export_skins=True,export_animations=False,
                          export_materials='EXPORT',export_yup=True)
print('EXPORT_GLB',output,os.path.getsize(output),flush=True)
