import React, { useState } from 'react';
import { Car, Bike, Zap, ShieldAlert } from 'lucide-react';

const SlotMap = ({ slots = [], selectedSlotId, onSelectSlot, vehicleTypeFilter }) => {
  // Group slots by Floor
  const floors = [...new Set((slots || []).map(s => s.floor))].sort((a, b) => a - b);
  
  const [selectedFloor, setSelectedFloor] = useState(floors[0] || 1);

  // Filter slots for the current selected floor
  const activeFloor = floors.includes(selectedFloor) ? selectedFloor : (floors[0] || 1);
  const floorSlots = (slots || []).filter(s => s.floor === activeFloor);

  // Group floor slots by zone
  const zones = [...new Set(floorSlots.map(s => s.parkingZone))].sort();


  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Bike':
        return <Bike size={18} />;
      case 'EV':
        return <Zap size={18} className="text-yellow-400 animate-pulse-slow" />;
      default:
        return <Car size={18} />;
    }
  };

  const getStatusStyles = (status, isSelected) => {
    if (isSelected) {
      return 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/50 scale-[1.02]';
    }

    switch (status) {
      case 'Available':
        return 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-950/20 cursor-pointer';
      case 'Reserved':
        return 'border-amber-500/20 bg-amber-950/5 text-amber-500/60 cursor-not-allowed';
      case 'Occupied':
        return 'border-rose-500/20 bg-rose-950/5 text-rose-500/60 cursor-not-allowed';
      case 'Disabled':
      default:
        return 'border-slate-800 bg-slate-900/10 text-slate-600 cursor-not-allowed';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Floor Tab Selectors */}
      <div className="flex gap-2 p-1 bg-slate-950/60 border border-slate-900 rounded-xl self-start">
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeFloor === floor
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Floor {floor}
          </button>
        ))}
        {floors.length === 0 && (
          <span className="text-xs text-slate-500 px-3 py-1.5">No Floors Configured</span>
        )}
      </div>

      {/* Legend Indicators */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-t border-b border-slate-900/60 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-emerald-500/30 bg-emerald-950/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-amber-500/20 bg-amber-950/5" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-rose-500/20 bg-rose-950/5" />
          <span>Occupied (Checked-in)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-slate-800 bg-slate-900/10" />
          <span>Disabled</span>
        </div>
      </div>

      {/* Slots grid grouped by Parking Zones */}
      <div className="flex flex-col gap-8">
        {zones.map(zone => {
          const zoneSlots = floorSlots.filter(s => s.parkingZone === zone);
          
          return (
            <div key={zone} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
                Zone {zone}
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {zoneSlots.map(slot => {
                  const isSelected = selectedSlotId === slot._id;
                  const isAvailable = slot.status === 'Available';
                  
                  // Disable selection if vehicle type filter does not match slot
                  const isWrongVehicle = vehicleTypeFilter && slot.vehicleType !== vehicleTypeFilter;
                  const isDisabled = !isAvailable || isWrongVehicle;

                  return (
                    <div
                      key={slot._id}
                      onClick={() => !isDisabled && onSelectSlot(slot)}
                      className={`relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 select-none ${getStatusStyles(
                        slot.status,
                        isSelected
                      )} ${isWrongVehicle && slot.status === 'Available' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      
                      {/* Vehicle category indicator */}
                      <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider opacity-60">
                        {slot.vehicleType}
                      </span>

                      {/* Icon */}
                      <div className="my-2.5">
                        {getVehicleIcon(slot.vehicleType)}
                      </div>

                      {/* Slot Number Label */}
                      <span className="text-sm font-semibold tracking-tight font-display">
                        {slot.slotNumber}
                      </span>

                      {/* Price tooltip */}
                      {slot.status === 'Available' && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          ${slot.price?.toFixed(2)}/hr
                        </span>
                      )}

                      {/* Selection dot */}
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow">
                          ✓
                        </span>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {floorSlots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 glass-card bg-slate-950/20 border-dashed border-slate-800/80">
            <ShieldAlert className="opacity-40 mb-2" size={28} />
            <span className="text-xs">No slots configured for Floor {activeFloor}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default SlotMap;
