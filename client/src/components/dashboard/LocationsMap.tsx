import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Building2, Users, Activity, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

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
    html: `<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #3b82f6; display: flex; align-items: center; justify-content: center;">
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

  const { data: locationsData, isLoading, error } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/locations');
      return response.json();
    },
  });

  const { data: cabinetsData } = useQuery({
    queryKey: ['/api/cabinets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cabinets');
      return response.json();
    },
  });

  const { data: companiesData } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    },
  });

  // Extract data from new structure
  const locations = locationsData?.locations || [];
  const cabinets = cabinetsData?.cabinets || [];
  const companies = companiesData?.companies || [];

  // Debug logging
  console.log('LocationsMap Debug:', {
    locations,
    cabinets,
    companies,
    isLoading,
    error
  });

  // Calculate stats for each location
  const getLocationStats = (locationId: number) => {
    const locationCabinets = cabinets.filter((cabinet: any) => 
      cabinet.locationId === locationId && cabinet.status === 'active'
    ) || [];
    
    const activeCabinets = locationCabinets.length;
    const totalRevenue = locationCabinets.reduce((sum: number, cabinet: any) => 
      sum + (parseFloat(cabinet.dailyRevenue) || 0), 0
    );

    return { activeCabinets, totalRevenue };
  };

  const getCompanyName = (companyId: number) => {
    return companies.find((company: any) => company.id === companyId)?.name || 'Unknown';
  };

  // Generate coordinates for locations based on city or use fallback coordinates
  const getLocationCoordinates = (location: Location): { lat: number; lng: number } => {
    // If location already has coordinates, use them
    if (location.latitude && location.longitude) {
      return {
        lat: Number(location.latitude),
        lng: Number(location.longitude),
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
    };

    // Try to find coordinates by city name
    const cityKey = Object.keys(cityCoordinates).find(key => 
      location.city.toLowerCase().includes(key.toLowerCase())
    );

    if (cityKey) {
      return cityCoordinates[cityKey];
    }

    // Fallback to Romania center
    return { lat: 45.9432, lng: 24.9668 };
  };

  const getMapCenter = () => {
    if (locations.length === 0) {
      return { lat: 45.9432, lng: 24.9668 }; // Romania center
    }

    const validLocations = locations.filter((loc: Location) => {
      const coords = getLocationCoordinates(loc);
      return coords.lat && coords.lng;
    });

    if (validLocations.length === 0) {
      return { lat: 45.9432, lng: 24.9668 }; // Romania center
    }

    const totalLat = validLocations.reduce((sum: number, loc: Location) => {
      const coords = getLocationCoordinates(loc);
      return sum + coords.lat;
    }, 0);

    const totalLng = validLocations.reduce((sum: number, loc: Location) => {
      const coords = getLocationCoordinates(loc);
      return sum + coords.lng;
    }, 0);

    return {
      lat: totalLat / validLocations.length,
      lng: totalLng / validLocations.length,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <div className="p-8 text-center">
          <div className="loading-shimmer h-64 rounded-lg"></div>
          <p className="text-slate-400 mt-4">Loading locations map...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <div className="p-8 text-center">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Error Loading Map</h3>
          <p className="text-slate-400">Unable to load locations data</p>
        </div>
      </Card>
    );
  }

  const center = getMapCenter();

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <MapContainer
          key={mapKey}
          center={[center.lat, center.lng]}
          zoom={6}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
          className="glass-card"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locations.map((location: Location) => {
            const coords = getLocationCoordinates(location);
            const stats = getLocationStats(location.id);
            const companyName = getCompanyName(location.companyId);

            return (
              <Marker
                key={location.id}
                position={[coords.lat, coords.lng]}
                icon={createCustomIcon()}
              >
                <Popup className="glass-card">
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-white mb-2">{location.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300">
                        <Building2 className="inline h-3 w-3 mr-1" />
                        {companyName}
                      </p>
                      <p className="text-slate-300">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {location.city}, {location.country}
                      </p>
                      <p className="text-slate-300">
                        <Users className="inline h-3 w-3 mr-1" />
                        {stats.activeCabinets} active cabinets
                      </p>
                      <p className="text-slate-300">
                        <Activity className="inline h-3 w-3 mr-1" />
                        {formatCurrency(stats.totalRevenue)} daily revenue
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 action-button w-full"
                      onClick={() => console.log('View location details:', location.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          <MapBounds locations={locations} />
        </MapContainer>
      </div>

      {/* Location Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <div className="p-4 text-center">
            <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">{locations.length}</h3>
            <p className="text-slate-400 text-sm">Total Locations</p>
          </div>
        </Card>
        
        <Card className="glass-card">
          <div className="p-4 text-center">
            <Building2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">{companies.length}</h3>
            <p className="text-slate-400 text-sm">Companies</p>
          </div>
        </Card>
        
        <Card className="glass-card">
          <div className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">{cabinets.filter((c: any) => c.status === 'active').length}</h3>
            <p className="text-slate-400 text-sm">Active Cabinets</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 