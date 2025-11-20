import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(
      parseFloat(result.lat),
      parseFloat(result.lon),
      result.display_name
    );
    setQuery(result.display_name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50 last:border-none"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
