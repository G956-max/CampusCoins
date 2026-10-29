-- ========================================================
-- CAMPUSCOINS: FIX LOCATIONS, POLICIES & SEED DATA
-- Platform: Supabase / PostgreSQL 15+
-- ========================================================

-- 1. Enable Public Read on Reference Tables
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaint_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read buildings" ON public.buildings;
CREATE POLICY "Public read buildings" ON public.buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read floors" ON public.floors;
CREATE POLICY "Public read floors" ON public.floors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read sla_configs" ON public.sla_configs;
CREATE POLICY "Public read sla_configs" ON public.sla_configs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read badges" ON public.badges;
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read complaint_updates" ON public.complaint_updates;
CREATE POLICY "Public read complaint_updates" ON public.complaint_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read complaint_evidence" ON public.complaint_evidence;
CREATE POLICY "Public read complaint_evidence" ON public.complaint_evidence FOR SELECT USING (true);

-- 2. Allow Authenticated Insert on Complaints and Updates
DROP POLICY IF EXISTS "Students insert complaints" ON public.complaints;
CREATE POLICY "Students insert complaints" ON public.complaints 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Students insert complaint updates" ON public.complaint_updates;
CREATE POLICY "Students insert complaint updates" ON public.complaint_updates 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Seed Departments (ON CONFLICT DO NOTHING ignores any existing id/code)
INSERT INTO public.departments (id, name, code, description)
VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE', 'Department of Computer Science & Engineering'),
    ('d1000000-0000-0000-0000-000000000002', 'Information Technology', 'IT', 'Department of Information Technology'),
    ('d1000000-0000-0000-0000-000000000003', 'Electronics & Communication', 'ECE', 'Department of Electronics & Communication Engineering'),
    ('d1000000-0000-0000-0000-000000000004', 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
    ('d1000000-0000-0000-0000-000000000005', 'Campus Facilities & Maintenance', 'FAC', 'Estate office and maintenance services')
ON CONFLICT DO NOTHING;

-- 4. Seed Buildings (Erode Sengunthar Engineering College, Perundurai 638057)
INSERT INTO public.buildings (id, name, code, description, facility_type, latitude, longitude)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Main Academic & Admin Block', 'MB', 'Principal office, administrative departments, conference hall', 'administrative', 11.31345, 77.55015),
    ('b1000000-0000-0000-0000-000000000002', 'CSE, IT & MCA Computing Block', 'CSEB', 'Computer science, IT, AICTE IDEA lab, server rooms', 'academic', 11.31395, 77.55065),
    ('b1000000-0000-0000-0000-000000000003', 'Science & Humanities Block (First Year)', 'SHB', 'First year engineering classrooms, physics & chemistry labs', 'academic', 11.31320, 77.55075),
    ('b1000000-0000-0000-0000-000000000004', 'Central Library & Digital Commons', 'LIB', 'Reference stacks, digital journals, reading halls', 'library', 11.31365, 77.55095),
    ('b1000000-0000-0000-0000-000000000005', 'ECE & EIE Block', 'ECEB', 'VLSI design, embedded systems, instrumentation labs', 'academic', 11.31425, 77.55040),
    ('b1000000-0000-0000-0000-000000000006', 'Mechanical & Robotics Engineering Block', 'MECHB', 'CAD/CAM labs, CNC workshop, machine shop', 'laboratory', 11.31465, 77.55085),
    ('b1000000-0000-0000-0000-000000000007', 'Civil & Agricultural Engineering Block', 'CIVILB', 'Structural testing, soil mechanics, environmental lab', 'academic', 11.31445, 77.55135),
    ('b1000000-0000-0000-0000-000000000008', 'EEE & Chemical Engineering Block', 'EEEB', 'Power electronics, electric machines, chemical reaction lab', 'academic', 11.31405, 77.55125),
    ('b1000000-0000-0000-0000-000000000009', 'Student Canteen & Food Court', 'CAN', 'Multi-cuisine cafeteria, dining hall, coin redemption counter', 'cafeteria', 11.31385, 77.54980),
    ('b1000000-0000-0000-0000-000000000010', 'Convention Center & Auditorium', 'AUD', '1,500-seat central auditorium for seminars and cultural events', 'auditorium', 11.31305, 77.55050),
    ('b1000000-0000-0000-0000-000000000011', 'Sports Arena & Athletic Grounds', 'SPRT', 'Track, basketball court, badminton, fitness center', 'sports', 11.31505, 77.55015),
    ('b1000000-0000-0000-0000-000000000012', 'Diamond Hostel & Student Residences', 'HSTL', 'Student residential living quarters and recreation mess', 'residential', 11.31475, 77.54925)
ON CONFLICT DO NOTHING;

-- 5. Seed Floors
INSERT INTO public.floors (id, building_id, floor_number, floor_name)
VALUES
    ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 0, 'Ground Floor'),
    ('f1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1, 'First Floor'),
    ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 2, 'Second Floor'),
    ('f1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 0, 'Ground Floor Labs'),
    ('f1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 1, 'First Floor Computing Center')
ON CONFLICT DO NOTHING;

-- 6. Seed Rooms
INSERT INTO public.rooms (id, floor_id, room_number, room_name, room_type, capacity)
VALUES
    ('r1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Room 101', 'Lecture Hall 101', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Room 102', 'Lecture Hall 102', 'classroom', 80),
    ('r1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', 'Room 201', 'Interactive Classroom 201', 'classroom', 60),
    ('r1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000002', 'Room 204', 'Seminar Room 204', 'classroom', 65),
    ('r1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000004', 'CS Lab 1', 'Advanced Software Engineering Lab', 'lab', 50),
    ('r1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000004', 'CS Lab 3', 'Systems & Networks Lab', 'lab', 45)
ON CONFLICT DO NOTHING;

-- 7. Seed SLA Configs
INSERT INTO public.sla_configs (priority, target_response_hours, target_resolution_hours)
VALUES
    ('critical', 2, 24),
    ('high', 4, 48),
    ('medium', 12, 72),
    ('low', 24, 120)
ON CONFLICT (priority) DO UPDATE 
    SET target_response_hours = EXCLUDED.target_response_hours,
        target_resolution_hours = EXCLUDED.target_resolution_hours;
