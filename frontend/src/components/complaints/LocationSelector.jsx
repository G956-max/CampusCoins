import React, { useState, useEffect } from 'react';
import { Building2, Layers, MapPin, Loader2 } from 'lucide-react';
import complaintApi from '../../services/complaintApi';
import { cn } from '../../utils/cn';

const FALLBACK_BUILDINGS = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Main Academic & Admin Block', code: 'MB' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'CSE, IT & MCA Computing Block', code: 'CSEB' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Science & Humanities Block (First Year)', code: 'SHB' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'Central Library & Digital Commons', code: 'LIB' },
  { id: 'b1000000-0000-0000-0000-000000000005', name: 'ECE & EIE Block', code: 'ECEB' },
  { id: 'b1000000-0000-0000-0000-000000000006', name: 'Mechanical & Robotics Engineering Block', code: 'MECHB' },
  { id: 'b1000000-0000-0000-0000-000000000007', name: 'Civil & Agricultural Engineering Block', code: 'CIVILB' },
  { id: 'b1000000-0000-0000-0000-000000000008', name: 'EEE & Chemical Engineering Block', code: 'EEEB' },
  { id: 'b1000000-0000-0000-0000-000000000009', name: 'Student Canteen & Food Court', code: 'CAN' },
  { id: 'b1000000-0000-0000-0000-000000000010', name: 'Convention Center & Auditorium', code: 'AUD' },
  { id: 'b1000000-0000-0000-0000-000000000011', name: 'Sports Arena & Athletic Grounds', code: 'SPRT' },
  { id: 'b1000000-0000-0000-0000-000000000012', name: 'Diamond Hostel & Student Residences', code: 'HSTL' },
];

const DEFAULT_FLOORS = [
  { id: 'f1000000-0000-0000-0000-000000000001', floor_name: 'Ground Floor', floor_number: 0 },
  { id: 'f1000000-0000-0000-0000-000000000002', floor_name: 'First Floor', floor_number: 1 },
  { id: 'f1000000-0000-0000-0000-000000000003', floor_name: 'Second Floor', floor_number: 2 },
];

const DEFAULT_ROOMS = [
  { id: 'r1000000-0000-0000-0000-000000000001', room_name: 'Room 101 - Lecture Hall' },
  { id: 'r1000000-0000-0000-0000-000000000002', room_name: 'Room 102 - Classroom' },
  { id: 'r1000000-0000-0000-0000-000000000004', room_name: 'Room 201 - Computing Lab' },
  { id: 'r1000000-0000-0000-0000-000000000005', room_name: 'Room 204 - Seminar Room' },
  { id: 'r1000000-0000-0000-0000-000000000007', room_name: 'Lab 1 - Software Engineering' },
];

const LocationSelector = ({
  buildingId,
  floorId,
  roomId,
  onBuildingChange,
  onFloorChange,
  onRoomChange,
  disabled = false,
  className,
}) => {
  const [buildings, setBuildings] = useState(FALLBACK_BUILDINGS);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBuildings = async () => {
      setLoadingBuildings(true);
      try {
        const res = await complaintApi.getBuildings();
        const list = Array.isArray(res) ? res : res?.data || [];
        if (isMounted && list.length > 0) setBuildings(list);
      } catch (err) {
        console.warn('Failed to load buildings from network:', err);
      } finally {
        if (isMounted) setLoadingBuildings(false);
      }
    };
    loadBuildings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!buildingId) {
      setFloors([]);
      setRooms([]);
      return;
    }

    let isMounted = true;
    const loadFloors = async () => {
      setLoadingFloors(true);
      try {
        const res = await complaintApi.getFloors(buildingId);
        const list = Array.isArray(res) ? res : res?.data || [];
        if (isMounted) setFloors(list.length > 0 ? list : DEFAULT_FLOORS);
      } catch (err) {
        if (isMounted) setFloors(DEFAULT_FLOORS);
      } finally {
        if (isMounted) setLoadingFloors(false);
      }
    };
    loadFloors();
    return () => {
      isMounted = false;
    };
  }, [buildingId]);

  useEffect(() => {
    if (!floorId) {
      setRooms([]);
      return;
    }

    let isMounted = true;
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await complaintApi.getRooms(floorId);
        const list = Array.isArray(res) ? res : res?.data || [];
        if (isMounted) setRooms(list.length > 0 ? list : DEFAULT_ROOMS);
      } catch (err) {
        if (isMounted) setRooms(DEFAULT_ROOMS);
      } finally {
        if (isMounted) setLoadingRooms(false);
      }
    };
    loadRooms();
    return () => {
      isMounted = false;
    };
  }, [floorId]);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {/* 1. Building Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide text-[#17211B] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 size={14} className="text-[#647168]" /> Building
          </span>
          {loadingBuildings && <Loader2 size={12} className="animate-spin text-[#647168]" />}
        </label>
        <select
          value={buildingId || ''}
          disabled={disabled || loadingBuildings}
          onChange={(e) => {
            onBuildingChange(e.target.value);
            onFloorChange('');
            onRoomChange('');
          }}
          className="w-full bg-white border border-[#E1E9E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] disabled:opacity-50 focus:outline-none focus:border-[#168451] focus:ring-2 focus:ring-[#168451]/20 transition-colors shadow-sm"
        >
          <option value="">Select Building</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id} className="bg-white">
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Floor Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide text-[#17211B] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-[#647168]" /> Floor
          </span>
          {loadingFloors && <Loader2 size={12} className="animate-spin text-[#647168]" />}
        </label>
        <select
          value={floorId || ''}
          disabled={disabled || !buildingId || loadingFloors}
          onChange={(e) => {
            onFloorChange(e.target.value);
            onRoomChange('');
          }}
          className="w-full bg-white border border-[#E1E9E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] disabled:opacity-50 focus:outline-none focus:border-[#168451] focus:ring-2 focus:ring-[#168451]/20 transition-colors shadow-sm"
        >
          <option value="">
            {!buildingId ? 'Choose building first' : 'Select Floor'}
          </option>
          {floors.map((f) => (
            <option key={f.id} value={f.id} className="bg-white">
              {f.floor_name || `Floor ${f.floor_number}`}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Room / Area Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wide text-[#17211B] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#647168]" /> Room / Specific Area
          </span>
          {loadingRooms && <Loader2 size={12} className="animate-spin text-[#647168]" />}
        </label>
        <select
          value={roomId || ''}
          disabled={disabled || !floorId || loadingRooms}
          onChange={(e) => onRoomChange(e.target.value)}
          className="w-full bg-white border border-[#E1E9E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] disabled:opacity-50 focus:outline-none focus:border-[#168451] focus:ring-2 focus:ring-[#168451]/20 transition-colors shadow-sm"
        >
          <option value="">
            {!floorId ? 'Choose floor first' : 'General Floor Location (No Room)'}
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id} className="bg-white">
              {r.room_number} {r.room_name ? `- ${r.room_name}` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
