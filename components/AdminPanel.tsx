
import React, { useState } from 'react';
import { ShoutReward, AppSettings } from '../types';
import { COLORS } from '../constants';
import { Plus, Trash2, Save, RotateCcw, Clock } from 'lucide-react';

interface AdminPanelProps {
  rewards: ShoutReward[];
  settings: AppSettings;
  onSave: (rewards: ShoutReward[], settings: AppSettings) => void;
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ rewards, settings, onSave, onReset }) => {
  const [localRewards, setLocalRewards] = useState<ShoutReward[]>(rewards);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleAdd = () => {
    const newReward: ShoutReward = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Reward',
      amount: '0',
      icon: '🎁',
      minVolume: 0,
      maxVolume: 10,
      color: localRewards.length % 3 === 0 ? COLORS.MPT_YELLOW : (localRewards.length % 3 === 1 ? COLORS.WHITE : COLORS.MPT_BLUE)
    };
    setLocalRewards([...localRewards, newReward]);
  };

  const handleRemove = (id: string) => {
    setLocalRewards(localRewards.filter(s => s.id !== id));
  };

  const handleChange = (id: string, field: keyof ShoutReward, value: string | number) => {
    setLocalRewards(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSettingsChange = (field: keyof AppSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const inputBaseClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-bold shadow-sm";

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-blue-900 flex items-center gap-3">
            <span>⚙️</span> Shout Configuration
          </h2>
          <p className="text-sm text-gray-400 font-black uppercase tracking-widest mt-2">Manage Reward Tiers & Intensity</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={onReset}
                className="flex items-center gap-2 text-sm font-black bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-2xl transition-all active:scale-95"
            >
                <RotateCcw size={20} /> Reset
            </button>
            <button 
                onClick={() => onSave(localRewards, localSettings)}
                className="flex items-center gap-2 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl transition-all shadow-xl active:scale-95 shadow-blue-200"
            >
                <Save size={20} /> Save Changes
            </button>
        </div>
      </div>



      <div className="space-y-8 overflow-y-auto pr-4 custom-scrollbar flex-1 pb-6">
      {/* Global Settings Section */}
      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mb-6 shrink-0">
        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock size={16} /> Global Game Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase font-black text-gray-500 tracking-widest px-1">Shout Duration (Seconds)</label>
            <input 
              type="number"
              min="1"
              max="10"
              value={localSettings.shoutDuration}
              onChange={(e) => handleSettingsChange('shoutDuration', parseInt(e.target.value) || 1)}
              className={inputBaseClass}
              placeholder="e.g. 3"
            />
          </div>
        </div>
      </div>

        
        {localRewards.map((reward, idx) => (
          <div key={reward.id} className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-lg font-black italic shadow-inner">
                {idx + 1}
              </span>
              <div className="flex-1">
                <input 
                  value={reward.title}
                  onChange={(e) => handleChange(reward.id, 'title', e.target.value)}
                  className={inputBaseClass}
                  placeholder="Reward Title"
                />
              </div>
              <button 
                onClick={() => handleRemove(reward.id)}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                title="Delete Slice"
              >
                <Trash2 size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-xs uppercase font-black text-gray-500 tracking-widest px-1">Value</label>
                <input 
                  type="text"
                  value={reward.amount}
                  onChange={(e) => handleChange(reward.id, 'amount', e.target.value)}
                  className={inputBaseClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase font-black text-gray-500 tracking-widest px-1">Min Volume %</label>
                <input 
                  type="number"
                  value={reward.minVolume}
                  onChange={(e) => handleChange(reward.id, 'minVolume', parseInt(e.target.value) || 0)}
                  className={inputBaseClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase font-black text-gray-500 tracking-widest px-1">Max Volume %</label>
                <input 
                  type="number"
                  value={reward.maxVolume}
                  onChange={(e) => handleChange(reward.id, 'maxVolume', parseInt(e.target.value) || 0)}
                  className={inputBaseClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase font-black text-gray-500 tracking-widest px-1">Icon</label>
                <input 
                  value={reward.icon}
                  onChange={(e) => handleChange(reward.id, 'icon', e.target.value)}
                  className={`${inputBaseClass} text-center text-2xl`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-end shrink-0">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-3 bg-mpt-yellow hover:bg-yellow-400 text-blue-900 px-10 py-4 rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 uppercase tracking-tighter text-lg"
        >
          <Plus size={24} strokeWidth={4} /> Add New Tier
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
