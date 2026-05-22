import React, { useState, useEffect } from 'react';
import { PRESET_LOCATIONS } from '../presets';
import { PresetLocation, SavedPreset } from '../types';
import { 
  Building, 
  MapPin, 
  Users, 
  Compass, 
  ShoppingBag, 
  Sun, 
  Waves, 
  Tv, 
  Clock, 
  Music, 
  Triangle,
  FolderHeart,
  Plus,
  Trash2,
  BookmarkCheck
} from 'lucide-react';

interface PresetButtonsProps {
  currentLat: number;
  currentLng: number;
  onSelectPreset: (lat: number, lng: number, name: string) => void;
}

export function PresetButtons({ currentLat, currentLng, onSelectPreset }: PresetButtonsProps) {
  const [activeTab, setActiveTab] = useState<'thailand' | 'global' | 'custom'>('thailand');
  const [customPresets, setCustomPresets] = useState<SavedPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');

  // Load custom presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fake_gps_presets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing custom presets', e);
      }
    }
  }, []);

  // Save custom preset
  const handleSaveCurrent = () => {
    const name = newPresetName.trim() || `หมุดที่บันทึกไว้ #${customPresets.length + 1}`;
    const newPreset: SavedPreset = {
      id: `custom-${Date.now()}`,
      name,
      lat: Number(currentLat.toFixed(6)),
      lng: Number(currentLng.toFixed(6)),
      createdAt: Date.now(),
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('fake_gps_presets', JSON.stringify(updated));
    setNewPresetName('');
    setActiveTab('custom');
  };

  // Delete custom preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('fake_gps_presets', JSON.stringify(updated));
  };

  // Render icons dynamically
  const renderIcon = (iconName: string) => {
    const iconClass = "w-4 h-4 text-blue-500 animate-pulse-slow";
    switch (iconName) {
      case 'Compass': return <Compass className={iconClass} />;
      case 'ShoppingBag': return <ShoppingBag className={iconClass} />;
      case 'Sun': return <Sun className={iconClass} />;
      case 'MapPin': return <MapPin className={iconClass} />;
      case 'Waves': return <Waves className={iconClass} />;
      case 'Users': return <Users className={iconClass} />;
      case 'Tv': return <Tv className={iconClass} />;
      case 'Building': return <Building className={iconClass} />;
      case 'Music': return <Music className={iconClass} />;
      case 'Clock': return <Clock className={iconClass} />;
      case 'Triangle': return <Triangle className={iconClass} />;
      default: return <MapPin className={iconClass} />;
    }
  };

  const thailandPresets = PRESET_LOCATIONS.filter(p => p.category === 'landmark');
  const globalPresets = PRESET_LOCATIONS.filter(p => p.category === 'city');

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-200/85 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-blue-600 animate-pulse-slow" />
          <h2 className="font-display font-bold text-slate-900 text-lg">
            ปุ่มกดจำลองพิกัดสำเร็จรูป
          </h2>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-mono font-medium">
          {PRESET_LOCATIONS.length + customPresets.length} จุดพิกัด
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100/85 p-1 rounded-xl mb-4 gap-1">
        <button
          onClick={() => setActiveTab('thailand')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'thailand'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ในประเทศ 🇹🇭
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'global'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ต่างประเทศ 🗺️
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'custom'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          พิกัดส่วนตัว ⭐
        </button>
      </div>

      {/* Preset List Container */}
      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2">
        {activeTab === 'thailand' && (
          <div className="grid grid-cols-1 gap-2">
            {thailandPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.lat, preset.lng, preset.nameTh)}
                className="w-full flex items-start gap-4 p-3.5 text-left rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-blue-300 transition-all group"
              >
                <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                  {renderIcon(preset.icon)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 font-sans group-hover:text-blue-600 transition-colors">
                    {preset.nameTh}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-1">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'global' && (
          <div className="grid grid-cols-1 gap-2">
            {globalPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.lat, preset.lng, preset.nameTh)}
                className="w-full flex items-start gap-4 p-3.5 text-left rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-blue-300 transition-all group"
              >
                <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                  {renderIcon(preset.icon)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 font-sans group-hover:text-blue-600 transition-colors">
                    {preset.nameTh} ({preset.nameEn})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-1">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-2">
            {customPresets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FolderHeart className="w-8 h-8 mx-auto stroke-[1.5] mb-2" />
                <p className="text-xs font-sans">ยังไม่มีพิกัดส่วนตัวที่บันทึกไว้</p>
                <p className="text-[10px] text-slate-400 mt-1">ใช้ฟอร์มด้านล่างบันทึกจุดปัจจุบันได้เลย</p>
              </div>
            ) : (
              customPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.lat, preset.lng, preset.name)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50/20 hover:border-rose-100 border border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800">
                        {preset.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeletePreset(preset.id, e)}
                    className="p-1 px-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="ลบพิกัดนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Add Custom Preset */}
      <div className="border-t border-slate-100 mt-4 pt-4">
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
          บันทึกพิกัดแกนปัจจุบัน : {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ชื่อสถานที่พิกัดส่วนตัว..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
          />
          <button
            onClick={handleSaveCurrent}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors flex items-center justify-center font-bold gap-1 text-xs px-4 shadow-lg shadow-blue-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>จำพิกัด</span>
          </button>
        </div>
      </div>
    </div>
  );
}
