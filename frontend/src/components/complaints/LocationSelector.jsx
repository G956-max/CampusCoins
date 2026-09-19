import React, { useState, useEffect } from 'react';
import { Building2, Layers, MapPin, Loader2 } from 'lucide-react';
import complaintApi from '../../services/complaintApi';
import { cn } from '../../utils/cn';

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
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // 1. Fetch Buildings on Mount
  useEffect(() => {
    let isMounted = true;
    const loadBuildings = async () => {
      setLoadingBuildings(true);
      try {
        const data = await complaintApi.getBuildings();
        if (isMounted) setBuildings(data || []);
      } catch (err) {
        console.warn('Failed to load buildings:', err);
      } finally {
        if (isMounted) setLoadingBuildings(false);
      }
    };
    loadBuildings();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Floors when Building changes
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
        const data = await complaintApi.getFloors(buildingId);
        if (isMounted) setFloors(data || []);
      } catch (err) {
        console.warn('Failed to load floors:', err);
      } finally {
        if (isMounted) setLoadingFloors(false);
      }
    };
    loadFloors();
    return () => {
      isMounted = false;
    };
  }, [buildingId]);

  // 3. Fetch Rooms when Floor changes
  useEffect(() => {
    if (!floorId) {
      setRooms([]);
      return;
    }

    let isMounted = true;
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await complaintApi.getRooms(floorId);
        if (isMounted) setRooms(data || []);
      } catch (err) {
        console.warn('Failed to load rooms:', err);
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
        <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 size={14} className="text-slate-400" /> Building
          </span>
          {loadingBuildings && <Loader2 size={12} className="animate-spin text-slate-400" />}
        </label>
        <select
          value={buildingId || ''}
          disabled={disabled || loadingBuildings}
          onChange={(e) => {
            onBuildingChange(e.target.value);
            onFloorChange('');
            onRoomChange('');
          }}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 disabled:opacity-50 focus:outline-none focus:border-campus-500 transition-colors"
        >
          <option value="">Select Building</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id} className="bg-slate-900">
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Floor Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-slate-400" /> Floor
          </span>
          {loadingFloors && <Loader2 size={12} className="animate-spin text-slate-400" />}
        </label>
        <select
          value={floorId || ''}
          disabled={disabled || !buildingId || loadingFloors}
          onChange={(e) => {
            onFloorChange(e.target.value);
            onRoomChange('');
          }}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 disabled:opacity-50 focus:outline-none focus:border-campus-500 transition-colors"
        >
          <option value="">
            {!buildingId ? 'Choose building first' : 'Select Floor'}
          </option>
          {floors.map((f) => (
            <option key={f.id} value={f.id} className="bg-slate-900">
              {f.floor_name || `Floor ${f.floor_number}`}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Room / Specific Location Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" /> Room / Area
          </span>
          {loadingRooms && <Loader2 size={12} className="animate-spin text-slate-400" />}
        </label>
        <select
          value={roomId || ''}
          disabled={disabled || !floorId || loadingRooms}
          onChange={(e) => onRoomChange(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 disabled:opacity-50 focus:outline-none focus:border-campus-500 transition-colors"
        >
          <option value="">
            {!floorId ? 'Choose floor first' : 'General Floor Location (No Room)'}
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id} className="bg-slate-900">
              {r.room_number} {r.room_name ? `- ${r.room_name}` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
