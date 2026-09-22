import struct
import json

def analyze_glb(file_path):
    print(f"Analyzing {file_path}...")
    with open(file_path, "rb") as f:
        # Read header
        magic = f.read(4)
        if magic != b"glTF":
            print("Not a valid glTF file.")
            return
        
        version, length = struct.unpack("<II", f.read(8))
        print(f"glTF Version: {version}, File Length: {length} bytes")
        
        # Read JSON chunk
        chunk_len, chunk_type = struct.unpack("<II", f.read(8))
        if chunk_type != 0x4E4F534A:
            print("First chunk is not JSON.")
            return
            
        json_data = json.loads(f.read(chunk_len).decode("utf-8"))
        
        # Analyze meshes
        print("\n--- Meshes in GLB ---")
        meshes = json_data.get("meshes", [])
        print(f"Total Meshes: {len(meshes)}")
        for idx, mesh in enumerate(meshes):
            print(f"\nMesh {idx} Name: {mesh.get('name', 'Unnamed')}")
            for p_idx, prim in enumerate(mesh.get("primitives", [])):
                print(f"  Primitive {p_idx}:")
                print(f"    Mode: {prim.get('mode', 4)}")
                print("    Attributes:")
                for attr, acc_idx in prim.get("attributes", {}).items():
                    accessor = json_data["accessors"][acc_idx]
                    print(f"      {attr}: Accessor {acc_idx} (Type: {accessor.get('type')}, ComponentType: {accessor.get('componentType')}, Count: {accessor.get('count')})")
                    if "min" in accessor or "max" in accessor:
                        print(f"        Bounds: Min={accessor.get('min')}, Max={accessor.get('max')}")

if __name__ == "__main__":
    analyze_glb("C:\\Users\\USER\\Desktop\\Extras\\profileo\\trial-versions\\3-dtry\\ImageToStl.com_1.glb")
