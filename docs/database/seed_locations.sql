-- =====================================================================
-- CAMPUSCOINS SEED LOCATIONS (PHASE 3)
-- Seed Buildings, Floors, and Rooms for Campus Location Selection
-- =====================================================================

-- 1. Insert Buildings for Erode Sengunthar Engineering College, Perundurai 638057
INSERT INTO public.buildings (id, name, code, description, latitude, longitude)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Main Academic & Admin Block', 'MB', 'Principal office, administrative departments, conference hall', 11.31345, 77.55015),
    ('b1000000-0000-0000-0000-000000000002', 'CSE, IT & MCA Computing Block', 'CSEB', 'Computer science, IT, AICTE IDEA lab, server rooms', 11.31395, 77.55065),
    ('b1000000-0000-0000-0000-000000000003', 'Science & Humanities Block (First Year)', 'SHB', 'First year engineering classrooms, physics & chemistry labs', 11.31320, 77.55075),
    ('b1000000-0000-0000-0000-000000000004', 'Central Library & Digital Commons', 'LIB', 'Reference stacks, digital journals, reading halls', 11.31365, 77.55095),
    ('b1000000-0000-0000-0000-000000000005', 'ECE & EIE Block', 'ECEB', 'VLSI design, embedded systems, instrumentation labs', 11.31425, 77.55040),
    ('b1000000-0000-0000-0000-000000000006', 'Mechanical & Robotics Engineering Block', 'MECHB', 'CAD/CAM labs, CNC workshop, machine shop', 11.31465, 77.55085),
    ('b1000000-0000-0000-0000-000000000007', 'Civil & Agricultural Engineering Block', 'CIVILB', 'Structural testing, soil mechanics, environmental lab', 11.31445, 77.55135),
    ('b1000000-0000-0000-0000-000000000008', 'EEE & Chemical Engineering Block', 'EEEB', 'Power electronics, electric machines, chemical reaction lab', 11.31405, 77.55125),
    ('b1000000-0000-0000-0000-000000000009', 'Student Canteen & Food Court', 'CAN', 'Multi-cuisine cafeteria, dining hall, coin redemption counter', 11.31385, 77.54980),
    ('b1000000-0000-0000-0000-000000000010', 'Convention Center & Auditorium', 'AUD', '1,500-seat central auditorium for seminars and cultural events', 11.31305, 77.55050),
    ('b1000000-0000-0000-0000-000000000011', 'Sports Arena & Athletic Grounds', 'SPRT', 'Track, basketball court, badminton, fitness center', 11.31505, 77.55015),
    ('b1000000-0000-0000-0000-000000000012', 'Diamond Hostel & Student Residences', 'HSTL', 'Student residential living quarters and recreation mess', 11.31475, 77.54925)
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
