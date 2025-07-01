import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Building2, Users, Activity, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

// Regular imports for Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  county?: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  companyId: number;
  latitude?: number;
  longitude?: number;
}

// Custom marker icon for all locations (red)
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #dc2626; display: flex; align-items: center; justify-content: center;">
      <svg style="width: 12px; height: 12px; color: white;" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to fit map bounds to markers
function MapBounds({ locations }: { locations: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0 && map) {
      const validLocations = locations.filter((loc: any) => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map((loc: any) => [loc.latitude, loc.longitude])
        );
        
        // Add some padding to the bounds
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 12 // Prevent zooming in too much
        });
      }
    }
  }, [locations, map]);

  return null;
}

export default function LocationsMap() {
  const [mapKey, setMapKey] = useState(0);

  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  const { data: cabinets } = useQuery({
    queryKey: ['/api/cabinets'],
    queryFn: async () => {
      const response = await fetch('/api/cabinets', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  // Debug logging
  console.log('LocationsMap Debug:', {
    locations: locations?.locations,
    cabinets: cabinets?.cabinets,
    companies: companies?.companies,
    isLoading,
    error
  });

  // Calculate stats for each location
  const getLocationStats = (locationId: number) => {
    const locationCabinets = cabinets?.cabinets?.filter((cabinet: any) => 
      cabinet.locationId === locationId && cabinet.isActive
    ) || [];
    
    const activeCabinets = locationCabinets.length;
    const totalRevenue = locationCabinets.reduce((sum: number, cabinet: any) => 
      sum + (cabinet.dailyRevenue || 0), 0
    );

    return { activeCabinets, totalRevenue };
  };

  const getCompanyName = (companyId: number) => {
    return companies?.companies?.find((company: any) => company.id === companyId)?.name || 'Unknown';
  };

  // Generate coordinates for locations based on city or use fallback coordinates
  const getLocationCoordinates = (location: Location) => {
    // If location already has coordinates, use them
    if (location.latitude && location.longitude) {
      return {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      };
    }

    // Romanian cities coordinates mapping
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'București': { lat: 44.4268, lng: 26.1025 },
      'Bucharest': { lat: 44.4268, lng: 26.1025 },
      'Cluj-Napoca': { lat: 46.7712, lng: 23.6236 },
      'Cluj': { lat: 46.7712, lng: 23.6236 },
      'Timișoara': { lat: 45.7477, lng: 21.2257 },
      'Timiș': { lat: 45.7477, lng: 21.2257 },
      'Iași': { lat: 47.1585, lng: 27.6014 },
      'Constanța': { lat: 44.1733, lng: 28.6383 },
      'Craiova': { lat: 44.3194, lng: 23.7967 },
      'Brașov': { lat: 45.6427, lng: 25.5887 },
      'Brasov': { lat: 45.6427, lng: 25.5887 },
      'Galați': { lat: 45.4353, lng: 28.0079 },
      'Ploiești': { lat: 44.9414, lng: 26.0225 },
      'Ploiesti': { lat: 44.9414, lng: 26.0225 },
      'Oradea': { lat: 47.0722, lng: 21.9217 },
      'Brăila': { lat: 45.2652, lng: 27.9595 },
      'Braila': { lat: 45.2652, lng: 27.9595 },
      'Arad': { lat: 46.1866, lng: 21.3123 },
      'Pitești': { lat: 44.8565, lng: 24.8692 },
      'Pitesti': { lat: 44.8565, lng: 24.8692 },
      'Sibiu': { lat: 45.8035, lng: 24.1450 },
      'Bacău': { lat: 46.5717, lng: 26.9250 },
      'Bacau': { lat: 46.5717, lng: 26.9250 },
      'Târgu Mureș': { lat: 46.5386, lng: 24.5514 },
      'Targu Mures': { lat: 46.5386, lng: 24.5514 },
      'Baia Mare': { lat: 47.6567, lng: 23.5847 },
      'Buzău': { lat: 45.1517, lng: 26.8170 },
      'Buzau': { lat: 45.1517, lng: 26.8170 },
      'Botoșani': { lat: 47.7486, lng: 26.6690 },
      'Botosani': { lat: 47.7486, lng: 26.6690 },
      'Sălaj': { lat: 47.1891, lng: 23.0573 },
      'Salaj': { lat: 47.1891, lng: 23.0573 },
      'Vaslui': { lat: 46.6383, lng: 27.7292 },
      'Vâlcea': { lat: 45.1375, lng: 24.3692 },
      'Valcea': { lat: 45.1375, lng: 24.3692 },
      'Vrancea': { lat: 45.6983, lng: 27.0650 },
      'Neamț': { lat: 46.9759, lng: 26.3819 },
      'Neamt': { lat: 46.9759, lng: 26.3819 },
      'Maramureș': { lat: 47.6739, lng: 23.5719 },
      'Maramures': { lat: 47.6739, lng: 23.5719 },
      'Hunedoara': { lat: 45.7676, lng: 22.9072 },
      'Alba': { lat: 46.0669, lng: 23.5703 },
      'Gorj': { lat: 44.9489, lng: 23.2329 },
      'Mehedinți': { lat: 44.6369, lng: 22.6597 },
      'Mehedinti': { lat: 44.6369, lng: 22.6597 },
      'Dolj': { lat: 44.1623, lng: 23.6323 },
      'Călărași': { lat: 44.2058, lng: 27.3136 },
      'Calarasi': { lat: 44.2058, lng: 27.3136 },
      'Ialomița': { lat: 44.6031, lng: 27.3783 },
      'Ialomita': { lat: 44.6031, lng: 27.3783 },
      'Giurgiu': { lat: 43.9037, lng: 25.9699 },
      'Teleorman': { lat: 44.2734, lng: 25.0377 },
      'Dâmbovița': { lat: 44.9289, lng: 25.4250 },
      'Dambovita': { lat: 44.9289, lng: 25.4250 },
      'Prahova': { lat: 45.0899, lng: 26.0829 },
      'Bistrița-Năsăud': { lat: 47.1386, lng: 24.5000 },
      'Bistrita-Nasaud': { lat: 47.1386, lng: 24.5000 },
      'Satu Mare': { lat: 47.8017, lng: 22.8572 },
      'Satu-Mare': { lat: 47.8017, lng: 22.8572 },
      'Harghita': { lat: 46.3609, lng: 25.8026 },
      'Covasna': { lat: 45.8526, lng: 26.1829 },
      'Mureș': { lat: 46.5386, lng: 24.5514 },
      'Mures': { lat: 46.5386, lng: 24.5514 },
    };

    // Try to find coordinates by city name
    const cityKey = location.city?.trim();
    if (cityKey && cityCoordinates[cityKey]) {
      return cityCoordinates[cityKey];
    }

    // Try to find coordinates by county name
    const countyKey = location.county?.trim();
    if (countyKey && cityCoordinates[countyKey]) {
      return cityCoordinates[countyKey];
    }

    // Fallback to Bucharest with slight offset based on location ID
    const baseLat = 44.4268; // Bucharest latitude
    const baseLng = 26.1025; // Bucharest longitude
    
    return {
      latitude: baseLat + (location.id * 0.01) + (Math.random() - 0.5) * 0.02,
      longitude: baseLng + (location.id * 0.01) + (Math.random() - 0.5) * 0.02,
    };
  };

  const locationsWithCoords = locations?.locations?.map((location: Location) => ({
    ...location,
    ...getLocationCoordinates(location)
  })) || [];

  // Debug logging for coordinates
  console.log('LocationsMap Coordinates Debug:', {
    locationsWithCoords,
    validLocations: locationsWithCoords.filter((loc: any) => loc.latitude && loc.longitude)
  });

  // Calculate map center based on available locations
  const getMapCenter = () => {
    if (locationsWithCoords.length === 0) {
      return [44.4268, 26.1025] as [number, number]; // Bucharest default
    }

    const validLocations = locationsWithCoords.filter((loc: any) => loc.latitude && loc.longitude);
    if (validLocations.length === 0) {
      return [44.4268, 26.1025] as [number, number]; // Bucharest default
    }

    const avgLat = validLocations.reduce((sum: number, loc: any) => sum + loc.latitude, 0) / validLocations.length;
    const avgLng = validLocations.reduce((sum: number, loc: any) => sum + loc.longitude, 0) / validLocations.length;
    
    return [avgLat, avgLng] as [number, number];
  };

  const mapCenter = getMapCenter();

  return (
    <Card className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Navigation className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Interactive Map</h3>
            <p className="text-sm text-slate-400">Locations overview on map</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-500 hover:text-blue-400"
          onClick={() => setMapKey(prev => prev + 1)}
        >
          Refresh Map
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-shimmer h-20 rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-slate-400">
          <span className="text-2xl mb-2 block">⚠️</span>
          Failed to load locations
        </div>
      ) : !locations?.locations?.length ? (
        <div className="text-center py-8 text-slate-400">
          <span className="text-2xl mb-2 block">📍</span>
          No locations found
        </div>
      ) : (
        <div className="space-y-4">
          {/* Interactive Map */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700">
            <div className="h-80 w-full">
              {typeof window !== 'undefined' ? (
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={10}
                  className="h-full w-full"
                  style={{ background: '#1e293b' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <MapBounds locations={locationsWithCoords} />
                  
                  {locationsWithCoords.map((location: any) => {
                    const stats = getLocationStats(location.id);
                    const companyName = getCompanyName(location.companyId);
                    
                    // Skip locations without valid coordinates
                    if (!location.latitude || !location.longitude) {
                      console.log('Skipping location without coordinates:', location);
                      return null;
                    }
                    
                    console.log('Adding marker for location:', location.name, 'at:', location.latitude, location.longitude);
                    
                    const icon = createCustomIcon();
                    if (!icon) {
                      console.log('Failed to create icon for location:', location.name);
                      return null;
                    }
                    
                    return (
                      <Marker
                        key={location.id}
                        position={[location.latitude, location.longitude] as [number, number]}
                        icon={icon}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className={`w-4 h-4 ${
                                location.isActive ? 'text-emerald-500' : 'text-slate-500'
                              }`} />
                              <h3 className="font-semibold text-gray-900">{location.name}</h3>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                            <p className="text-xs text-gray-500 mb-3">{companyName}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3 text-blue-500" />
                                <span>{stats.activeCabinets} cabinets</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span>€{stats.totalRevenue.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className={`mt-2 px-2 py-1 rounded text-xs text-center ${
                              location.isActive 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {location.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🗺️</span>
                    <p>Loading map...</p>
                    <p className="text-xs mt-1">Please wait while the map loads</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-700">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                  <span className="text-gray-700">Inactive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fallback: Simple Locations List */}
          {locationsWithCoords.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Locations List (Fallback)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locationsWithCoords.map((location: any) => {
                  const stats = getLocationStats(location.id);
                  const companyName = getCompanyName(location.companyId);
                  
                  return (
                    <div key={location.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <div className="flex items-center space-x-3">
                        <MapPin className={`w-4 h-4 ${
                          location.isActive ? 'text-emerald-500' : 'text-slate-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-white">{location.name}</div>
                          <div className="text-xs text-slate-400">{location.city}, {location.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">{stats.activeCabinets} cabinets</div>
                        <div className="text-xs text-emerald-400">€{stats.totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-400">
                {locations.locations.filter((loc: Location) => loc.isActive).length}
              </div>
              <div className="text-xs text-slate-400">Active Locations</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {cabinets?.cabinets?.filter((cabinet: any) => cabinet.isActive).length || 0}
              </div>
              <div className="text-xs text-slate-400">Active Cabinets</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {companies?.companies?.length || 0}
              </div>
              <div className="text-xs text-slate-400">Companies</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-400">
                {locations.locations.length}
              </div>
              <div className="text-xs text-slate-400">Total Locations</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 