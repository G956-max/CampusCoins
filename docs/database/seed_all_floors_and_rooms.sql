-- ========================================================
-- CAMPUSCOINS: SEED ALL FLOORS & ROOMS (ALL 12 BUILDINGS)
-- Platform: Supabase / PostgreSQL 15+
-- ========================================================

-- 1. Ensure RLS policies allow public read on floors and rooms
ALTER TABLE IF EXISTS public.floors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read floors" ON public.floors;
CREATE POLICY "Public read floors" ON public.floors FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

-- 2. Seed Floors for all 12 Campus Buildings
INSERT INTO public.floors (id, building_id, floor_number, floor_name) VALUES
    -- Building 1: Main Academic & Admin Block
    ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 0, 'Ground Floor'),
    ('f1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1, 'First Floor'),
    ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 2, 'Second Floor'),

    -- Building 2: CSE, IT & MCA Computing Block
    ('f1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 0, 'Ground Floor Computing Labs'),
    ('f1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 1, 'First Floor AICTE IDEA Lab'),
    ('f1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 2, 'Second Floor Lecture Halls'),

    -- Building 3: Science & Humanities Block
    ('f1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 0, 'Ground Floor Labs'),
    ('f1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 1, 'First Floor First Year Classes'),

    -- Building 4: Central Library & Digital Commons
    ('f1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 0, 'Ground Floor Circulation & Stacks'),
    ('f1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 1, 'First Floor Digital Commons'),

    -- Building 5: ECE & EIE Block
    ('f1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005', 0, 'Ground Floor VLSI Labs'),
    ('f1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005', 1, 'First Floor Embedded Systems'),

    -- Building 6: Mechanical & Robotics Engineering Block
    ('f1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000006', 0, 'Ground Floor Workshop & Machine Shop'),
    ('f1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000006', 1, 'First Floor CAD/CAM Center'),

    -- Building 7: Civil & Agricultural Engineering Block
    ('f1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000007', 0, 'Ground Floor Testing Labs'),
    ('f1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000007', 1, 'First Floor Surveying & Drawing'),

    -- Building 8: EEE & Chemical Engineering Block
    ('f1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000008', 0, 'Ground Floor Power Electronics Lab'),
    ('f1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000008', 1, 'First Floor Chemistry & Reaction Lab'),

    -- Building 9: Student Canteen & Food Court
    ('f1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000009', 0, 'Ground Floor Dining & Counters'),

    -- Building 10: Convention Center & Auditorium
    ('f1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000010', 0, 'Ground Floor Main Hall & Stage'),
    ('f1000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000010', 1, 'First Floor Balcony Seating'),

    -- Building 11: Sports Arena & Athletic Grounds
    ('f1000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000011', 0, 'Ground Level Courts & Gym'),

    -- Building 12: Diamond Hostel & Student Residences
    ('f1000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000012', 0, 'Ground Floor Mess & Recreation'),
    ('f1000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000012', 1, 'First Floor Residential Rooms'),
    ('f1000000-0000-0000-0000-000000000025', 'b1000000-0000-0000-0000-000000000012', 2, 'Second Floor Residential Rooms')
ON CONFLICT DO NOTHING;

-- 3. Seed Sample Rooms
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity) VALUES
    ('r1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Room 101', 'Lecture Hall 101', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Room 102', 'Lecture Hall 102', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000004', 'Lab 1', 'Advanced Software Lab', 'lab', 60),
    ('r1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000005', 'IDEA Lab', 'AICTE IDEA Innovation Lab', 'lab', 75),
    ('r1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000020', 'Auditorium Hall', 'Main Convention Seating', 'auditorium', 1500)
ON CONFLICT DO NOTHING;
