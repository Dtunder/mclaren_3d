import json
import sys

def parse_glb(file_path):
    with open(file_path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            print("Not a GLB file")
            return
        version = int.from_bytes(f.read(4), byteorder='little')
        length = int.from_bytes(f.read(4), byteorder='little')

        chunk_length = int.from_bytes(f.read(4), byteorder='little')
        chunk_type = f.read(4)
        if chunk_type != b'JSON':
            print("First chunk is not JSON")
            return

        json_data = f.read(chunk_length)
        gltf = json.loads(json_data.decode('utf-8'))

        for node in gltf.get('nodes', []):
            name = node.get('name', 'unnamed')
            if '005' in name or '006' in name or 'door' in name.lower() or 'bod' in name.lower():
                print(name)

parse_glb('mclaren_p1.glb')
