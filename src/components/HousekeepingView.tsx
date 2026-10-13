import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { HousekeepingTask } from '../types/hotel';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  BedDouble, 
  ChevronRight 
} from 'lucide-react';

export const HousekeepingView: React.FC = () => {
  const { housekeeping, rooms, updateHousekeepingTask } = useHotel();
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = housekeeping.filter((task) => {
    const matchesFloor = filterFloor === 'all' || task.floor === filterFloor;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesFloor && matchesStatus;
  });

  const getStatusDetails = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'dirty':
        return { label: 'Turnover Required', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' };
      case 'in_progress':
        return { label: 'Cleaning In Progress', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/40' };
      case 'inspected':
        return { label: 'Supervisor Inspected', color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/40' };
      case 'ready':
        return { label: 'Cleaned & Ready', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Housekeeping & Room Turnover Management
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>Automated turnover upon guest checkout</span>
            <span aria-hidden="true">·</span>
            <span>Live supervisor inspection workflow</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            {['all', 'dirty', 'in_progress', 'ready'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 font-medium rounded transition-colors capitalize ${
                  filterStatus === st
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {st === 'all' ? 'All Queue' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Floor filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterFloor('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                filterFloor === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Floors
            </button>
            {[4, 3, 2, 1].map((f) => (
              <button
                key={f}
                onClick={() => setFilterFloor(f)}
                className={`px-2 py-1 font-medium rounded transition-colors tabular-nums ${
                  filterFloor === f
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                F{f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Housekeeping Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full p-12 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-lg">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-300">All rooms are currently in order</p>
            <p className="text-xs text-neutral-500 mt-1">
              Rooms will automatically appear in this turnover queue when a guest departs or checks out.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusInfo = getStatusDetails(task.status);
            const matchedRoom = rooms.find((r) => r.id === task.roomId);

            return (
              <div
                key={task.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-sm"
              >
                {/* Top header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        #{task.roomNumber}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Floor {task.floor}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      {matchedRoom?.tier || 'Master Suite'}
                    </div>
                  </div>

                  <div className={`px-2 py-0.5 rounded border text-[11px] font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Notes & Staff */}
                <div className="text-xs space-y-2 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800/80">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-neutral-500" />
                      Assigned: {task.assignedStaff}
                    </span>
                    <span className="font-mono text-neutral-500">{task.updatedAt}</span>
                  </div>

                  <p className="text-neutral-300 italic text-[11px]">
                    "{task.notes}"
                  </p>
                </div>

                {/* Workflow Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                    Turnover Step Progression:
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      onClick={() => updateHousekeepingTask(task.id, 'dirty')}
                      className={`py-1.5 px-2 rounded border text-[11px] transition-colors ${
                        task.status === 'dirty'
                          ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Dirty
                    </button>

                    <button
                      onClick={() => updateHousekeepingTask(task.id, 'in_progress')}
                      className={`py-1.5 px-2 rounded border text-[11px] transition-colors ${
                        task.status === 'in_progress'
                          ? 'bg-yellow-950 border-yellow-500 text-yellow-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => updateHousekeepingTask(task.id, 'ready')}
                      className={`py-1.5 px-2 rounded border text-[11px] transition-colors ${
                        task.status === 'ready'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-emerald-400'
                      }`}
                    >
                      Mark Ready
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
