import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSelectLocation: (lat: number, lng: number, name: string) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function SearchInput({ onSelectLocation }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle live search with simple debounce
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching places', error);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: NominatimResult) => {
    const latNum = parseFloat(item.lat);
    const lngNum = parseFloat(item.lon);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onSelectLocation(latNum, lngNum, item.display_name.split(',')[0]);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full z-30">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อแลนด์มาร์ค, ห้างสรรพสินค้า, เมือง, หรือ พิกัด ทั่วโลก..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-slate-800 font-sans transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute w-full mt-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xl ring-1 ring-slate-900/5 max-h-60 overflow-y-auto z-40">
          <div className="py-1">
            <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 border-b border-slate-100">
              ผลลัพธ์การค้นหาพิกัดแผนที่
            </div>
            {results.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-start px-3.5 py-2.5 text-left hover:bg-blue-50/40 text-xs border-b border-slate-50 last:border-0 transition-colors"
              >
                <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500 mr-2.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.display_name}
                  </p>
                  <span className="inline-block mt-1 font-mono text-[9px] text-blue-600 bg-blue-50 rounded px-2.5 py-0.5 font-semibold">
                    {parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lon).toFixed(4)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
