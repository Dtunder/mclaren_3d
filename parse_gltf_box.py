import json
import sys

def parse_glb(file_path):
    with open(file_path, 'rb') as f:
        magic = f.read(4)
        version = int.from_bytes(f.read(4), byteorder='little')
        length = int.from_bytes(f.read(4), byteorder='little')
        chunk_length = int.from_bytes(f.read(4), byteorder='little')
        chunk_type = f.read(4)
        json_data = f.read(chunk_length)
        gltf = json.loads(json_data.decode('utf-8'))

        for n in gltf.get('nodes', []):
            name = n.get('name')
            if name in ['object.006', 'object.005']:
                print(name, n.get('matrix', n.get('translation')))
parse_glb('mclaren_p1.glb')
