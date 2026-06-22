def generate_obj(filename):
    # A simple procedural model of a supercar (wedge shape with a spoiler)
    
    # We define the right half (x >= 0) and then mirror it.
    # [x, y, z]
    # Centerline points (x=0)
    c_nose_top = [0, 0.4, 2.3]
    c_nose_bot = [0, 0.15, 2.3]
    c_hood = [0, 0.65, 1.2]
    c_windshield_base = [0, 0.75, 0.6]
    c_roof_front = [0, 1.15, 0.1]
    c_roof_rear = [0, 1.10, -0.6]
    c_engine_cover = [0, 0.8, -1.5]
    c_tail_top = [0, 0.75, -2.2]
    c_tail_bot = [0, 0.25, -2.2]
    c_floor_front = [0, 0.1, 1.5]
    c_floor_mid = [0, 0.1, 0.0]
    c_floor_rear = [0, 0.1, -1.5]
    
    # Right side points (x > 0)
    # Nose/Front Bumper
    r_nose_top = [0.8, 0.4, 2.1]
    r_nose_bot = [0.8, 0.15, 2.1]
    
    # Front Fender/Wheel arch
    r_fender_front = [0.95, 0.4, 1.6]
    r_fender_top = [0.95, 0.75, 1.2]
    r_fender_rear = [0.95, 0.4, 0.8]
    
    # Side Skirt/Door
    r_door_top_front = [0.95, 0.75, 0.6]
    r_door_top_rear = [1.0, 0.8, -0.6]
    r_door_bot_front = [0.9, 0.15, 0.8]
    r_door_bot_rear = [0.95, 0.15, -0.8]
    r_scoop_in = [0.8, 0.5, -0.7] # McLaren style side scoop
    
    # Rear Fender/Wheel arch
    r_rfender_front = [1.0, 0.4, -0.8]
    r_rfender_top = [1.05, 0.85, -1.4]
    r_rfender_rear = [1.0, 0.4, -1.9]
    
    # Tail
    r_tail_top = [0.85, 0.75, -2.1]
    r_tail_bot = [0.85, 0.25, -2.1]
    
    # Cabin (Greenhouse)
    r_windshield_base = [0.6, 0.75, 0.6]
    r_roof_front = [0.5, 1.1, 0.1]
    r_roof_rear = [0.5, 1.05, -0.6]
    r_window_rear_base = [0.5, 0.8, -1.2]
    
    # Spoiler
    s_mount_base = [0.4, 0.75, -1.9]
    s_mount_top = [0.4, 0.95, -2.0]
    s_wing_center_front = [0, 0.95, -1.9]
    s_wing_center_rear = [0, 0.98, -2.2]
    s_wing_tip_front = [0.9, 0.95, -1.9]
    s_wing_tip_rear = [0.9, 0.98, -2.2]
    s_wing_endplate_bot = [0.9, 0.85, -2.2]

    # Assemble all unique points
    points = [
        c_nose_top, c_nose_bot, c_hood, c_windshield_base, 
        c_roof_front, c_roof_rear, c_engine_cover, c_tail_top, 
        c_tail_bot, c_floor_front, c_floor_mid, c_floor_rear,
        r_nose_top, r_nose_bot, r_fender_front, r_fender_top, 
        r_fender_rear, r_door_top_front, r_door_top_rear, 
        r_door_bot_front, r_door_bot_rear, r_scoop_in,
        r_rfender_front, r_rfender_top, r_rfender_rear,
        r_tail_top, r_tail_bot, r_windshield_base,
        r_roof_front, r_roof_rear, r_window_rear_base,
        s_mount_base, s_mount_top, s_wing_center_front, 
        s_wing_center_rear, s_wing_tip_front, s_wing_tip_rear, 
        s_wing_endplate_bot
    ]
    
    # Define faces by index into 'points' array (0-based)
    # Using triangles or quads
    faces_right = []
    
    # Helper to find index
    def idx(pt):
        return points.index(pt)
        
    # Build faces
    # Hood
    faces_right.append([idx(c_nose_top), idx(r_nose_top), idx(r_fender_top), idx(c_hood)])
    faces_right.append([idx(c_hood), idx(r_fender_top), idx(r_door_top_front), idx(c_windshield_base)])
    # Front Bumper
    faces_right.append([idx(c_nose_bot), idx(r_nose_bot), idx(r_nose_top), idx(c_nose_top)])
    # Front fender
    faces_right.append([idx(r_nose_top), idx(r_fender_front), idx(r_fender_top)])
    faces_right.append([idx(r_nose_bot), idx(r_fender_front), idx(r_nose_top)])
    faces_right.append([idx(r_fender_front), idx(r_door_bot_front), idx(r_fender_rear)])
    faces_right.append([idx(r_fender_front), idx(r_fender_rear), idx(r_fender_top)])
    faces_right.append([idx(r_fender_top), idx(r_fender_rear), idx(r_door_top_front)])
    
    # Windshield
    faces_right.append([idx(c_windshield_base), idx(r_windshield_base), idx(r_roof_front), idx(c_roof_front)])
    
    # Roof
    faces_right.append([idx(c_roof_front), idx(r_roof_front), idx(r_roof_rear), idx(c_roof_rear)])
    
    # Side Window
    faces_right.append([idx(r_windshield_base), idx(r_door_top_front), idx(r_door_top_rear), idx(r_roof_rear)])
    faces_right.append([idx(r_windshield_base), idx(r_roof_rear), idx(r_roof_front)])
    
    # Door
    faces_right.append([idx(r_door_top_front), idx(r_fender_rear), idx(r_door_bot_front)])
    faces_right.append([idx(r_door_top_front), idx(r_door_bot_front), idx(r_door_bot_rear), idx(r_door_top_rear)])
    
    # Scoop
    faces_right.append([idx(r_door_top_rear), idx(r_door_bot_rear), idx(r_scoop_in)])
    faces_right.append([idx(r_scoop_in), idx(r_door_bot_rear), idx(r_rfender_front)])
    faces_right.append([idx(r_door_top_rear), idx(r_scoop_in), idx(r_rfender_top)])
    faces_right.append([idx(r_scoop_in), idx(r_rfender_front), idx(r_rfender_top)])
    
    # Rear Fender
    faces_right.append([idx(r_rfender_front), idx(r_rfender_rear), idx(r_rfender_top)])
    faces_right.append([idx(r_rfender_top), idx(r_rfender_rear), idx(r_tail_top)])
    
    # Engine cover
    faces_right.append([idx(c_roof_rear), idx(r_roof_rear), idx(r_window_rear_base), idx(c_engine_cover)])
    faces_right.append([idx(r_roof_rear), idx(r_door_top_rear), idx(r_rfender_top), idx(r_window_rear_base)])
    faces_right.append([idx(c_engine_cover), idx(r_window_rear_base), idx(r_rfender_top), idx(c_tail_top)])
    faces_right.append([idx(c_tail_top), idx(r_rfender_top), idx(r_tail_top)])
    
    # Tail back
    faces_right.append([idx(c_tail_top), idx(r_tail_top), idx(r_tail_bot), idx(c_tail_bot)])
    faces_right.append([idx(r_tail_top), idx(r_rfender_rear), idx(r_tail_bot)])
    
    # Floor / Underbody (rough)
    faces_right.append([idx(c_nose_bot), idx(c_floor_front), idx(r_door_bot_front), idx(r_nose_bot)])
    faces_right.append([idx(c_floor_front), idx(c_floor_mid), idx(r_door_bot_rear), idx(r_door_bot_front)])
    faces_right.append([idx(c_floor_mid), idx(c_floor_rear), idx(r_tail_bot), idx(r_door_bot_rear)])
    faces_right.append([idx(c_floor_rear), idx(c_tail_bot), idx(r_tail_bot)])
    
    # Spoiler Mount
    faces_right.append([idx(s_mount_base), idx(s_mount_top), idx(s_mount_top), idx(s_mount_base)]) # Simple 2D plane for now
    
    # Spoiler Wing Right Half
    faces_right.append([idx(s_wing_center_front), idx(s_wing_tip_front), idx(s_wing_tip_rear), idx(s_wing_center_rear)])
    
    # Endplate
    faces_right.append([idx(s_wing_tip_front), idx(s_wing_endplate_bot), idx(s_wing_tip_rear)])

    # Mirror points (x < 0)
    all_points = list(points)
    num_right_points = len(points)
    
    # Identify which points are on the centerline
    centerline_indices = [i for i, pt in enumerate(points) if abs(pt[0]) < 0.001]
    
    mirror_map = {} # maps original index to mirrored index
    
    for i, pt in enumerate(points):
        if i in centerline_indices:
            mirror_map[i] = i
        else:
            new_pt = [-pt[0], pt[1], pt[2]]
            all_points.append(new_pt)
            mirror_map[i] = len(all_points) - 1

    all_faces = []
    # Add right faces
    for f in faces_right:
        all_faces.append(f)
        
    # Add left faces (mirrored, reverse winding order)
    for f in faces_right:
        mirrored_f = [mirror_map[idx] for idx in f]
        mirrored_f.reverse() # Reverse winding for normals
        all_faces.append(mirrored_f)
        
    # Write OBJ
    with open(filename, 'w') as f:
        f.write("# Generated McLaren-style 3D Model\n")
        for pt in all_points:
            f.write(f"v {pt[0]:.4f} {pt[1]:.4f} {pt[2]:.4f}\n")
        
        for face in all_faces:
            # 1-based indexing for OBJ
            face_str = " ".join([str(idx + 1) for idx in face])
            f.write(f"f {face_str}\n")

if __name__ == "__main__":
    generate_obj("mclaren.obj")
    print("Generated mclaren.obj successfully.")
