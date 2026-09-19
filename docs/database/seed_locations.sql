-- =====================================================================
-- CAMPUSCOINS SEED LOCATIONS (PHASE 3)
-- Seed Buildings, Floors, and Rooms for Campus Location Selection
-- =====================================================================

-- 1. Insert Buildings
INSERT INTO public.buildings (id, name, code, description, latitude, longitude)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Main Academic Block', 'MB', 'Primary engineering and lecture halls', 12.9715987, 77.5945627),
    ('b1000000-0000-0000-0000-000000000002', 'Science & Research Block', 'SB', 'Laboratories, physics, chemistry & research centers', 12.9719000, 77.5948000),
    ('b1000000-0000-0000-0000-000000000003', 'Administrative Block', 'AB', 'Dean offices, registrar, finance & student affairs', 12.9712000, 77.5942000),
    ('b1000000-0000-0000-0000-000000000004', 'Central Library & Digital Commons', 'LB', 'Reference stacks, digital commons & study halls', 12.9714000, 77.5951000)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Floors for Main Academic Block
INSERT INTO public.floors (id, building_id, floor_number, floor_name)
VALUES
    ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 0, 'Ground Floor'),
    ('f1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1, 'First Floor'),
    ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 2, 'Second Floor')
ON CONFLICT (building_id, floor_number) DO NOTHING;

-- Floors for Science & Research Block
INSERT INTO public.floors (id, building_id, floor_number, floor_name)
VALUES
    ('f1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 0, 'Ground Floor Labs'),
    ('f1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 1, 'First Floor Labs')
ON CONFLICT (building_id, floor_number) DO NOTHING;

-- Floors for Admin Block
INSERT INTO public.floors (id, building_id, floor_number, floor_name)
VALUES
    ('f1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 0, 'Ground Floor Reception & Accounts'),
    ('f1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 1, 'First Floor Executive Offices')
ON CONFLICT (building_id, floor_number) DO NOTHING;

-- Floors for Central Library
INSERT INTO public.floors (id, building_id, floor_number, floor_name)
VALUES
    ('f1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 0, 'Circulation & Periodicals'),
    ('f1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 1, 'Digital Commons & Silent Study')
ON CONFLICT (building_id, floor_number) DO NOTHING;

-- 3. Insert Rooms
-- Main Academic Block -> Ground Floor
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity)
VALUES
    ('r1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Room 101', 'Lecture Hall 101', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Room 102', 'Lecture Hall 102', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'Cafeteria', 'Central Canteen & Lounge', 'canteen', 150);

-- Main Academic Block -> First Floor
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity)
VALUES
    ('r1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', 'Room 201', 'Interactive Classroom 201', 'classroom', 60),
    ('r1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000002', 'Room 204', 'Seminar Room 204', 'classroom', 65),
    ('r1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000002', 'Restroom 2F', 'Restroom Block 2F', 'restroom', 10);

-- Science Block -> Ground & First Floor
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity)
VALUES
    ('r1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000004', 'CS Lab 1', 'Advanced Software Engineering Lab', 'lab', 50),
    ('r1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000004', 'CS Lab 3', 'Systems & Networks Lab', 'lab', 45),
    ('r1000000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000005', 'Phy Lab', 'Applied Physics & Optics Lab', 'lab', 40);

-- Library -> Reading Hall
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity)
VALUES
    ('r1000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000008', 'Reading Hall', 'Main Reading & Study Hall', 'library', 120);

-- =====================================================================
-- END OF SEED LOCATIONS
-- =====================================================================
