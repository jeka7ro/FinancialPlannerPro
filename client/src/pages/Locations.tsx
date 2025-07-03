import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLocationSchema, type InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search, Mail, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

// Lista de orașe din România pentru dropdown
const romanianCities = [
  "București",
  "Cluj-Napoca", 
  "Timișoara",
  "Iași",
  "Constanța",
  "Brașov",
  "Craiova",
  "Galați",
  "Ploiești",
  "Oradea",
  "Brăila",
  "Arad",
  "Pitești",
  "Sibiu",
  "Bacău",
  "Târgu Mureș",
  "Baia Mare",
  "Buzău",
  "Botoșani",
  "Satu Mare",
  "Râmnicu Vâlcea",
  "Drobeta-Turnu Severin",
  "Suceava",
  "Piatra Neamț",
  "Târgoviște",
  "Focșani",
  "Târgu Jiu",
  "Tulcea",
  "Alba Iulia",
  "Giurgiu",
  "Slatina",
  "Vaslui",
  "Bistrița",
  "Reșița",
  "Călărași",
  "Deva",
  "Hunedoara",
  "Zalău",
  "Sfântu Gheorghe",
  "Bârlad",
  "Roman",
  "Turda",
  "Mediaș",
  "Slobozia",
  "Alexandria",
  "Voluntari",
  "Lugoj",
  "Medgidia",
  "Onești",
  "Miercurea Ciuc",
  "Sighetu Marmației",
  "Petroșani",
  "Mangalia",
  "Tecuci",
  "Odorheiu Secuiesc",
  "Râmnicu Sărat",
  "Pașcani",
  "Dej",
  "Reghin",
  "Năvodari",
  "Câmpina",
  "Mioveni",
  "Câmpulung",
  "Caracal",
  "Săcele",
  "Făgăraș",
  "Sighișoara",
  "Borșa",
  "Roșiorii de Vede",
  "Curtea de Argeș",
  "Sebeș",
  "Huși",
  "Fetești",
  "Pantelimon",
  "Oltenița",
  "Turnu Măgurele",
  "Caransebeș",
  "Dorohoi",
  "Vulcan",
  "Rădăuți",
  "Zărnești",
  "Lupeni",
  "Aiud",
  "Petrila",
  "Buftea",
  "Târnăveni",
  "Popești-Leordeni",
  "Câmpia Turzii",
  "Codlea",
  "Moinesti",
  "Gherla",
  "Comănești",
  "Carei",
  "Motru",
  "Orăștie",
  "Băilești",
  "Drăgășani",
  "Băile Herculane",
  "Salonta",
  "Calafat",
  "Fălticeni",
  "Cernavodă",
  "Bocșa",
  "Marghita",
  "Baia Sprie",
  "Luduș",
  "Urziceni",
  "Vișeu de Sus",
  "Bragadiru",
  "Râșnov",
  "Sinaia",
  "Negru Vodă",
  "Târgu Neamț",
  "Moreni",
  "Târgu Secuiesc",
  "Gheorgheni",
  "Orșova",
  "Balș",
  "Covasna",
  "Șimleu Silvaniei",
  "Dărmănești",
  "Toplița",
  "Gura Humorului",
  "Avrig",
  "Băbeni",
  "Vălenii de Munte",
  "Cisnădie",
  "Moldova Nouă",
  "Sânnicolau Mare",
  "Vatra Dornei",
  "Câmpulung Moldovenesc",
  "Predeal",
  "Ocna Mureș",
  "Pucioasa",
  "Băile Olănești",
  "Târgu Lăpuș",
  "Sovata",
  "Iernut",
  "Vânju Mare",
  "Deta",
  "Hârșova",
  "Odobești",
  "Măcin",
  "Anina",
  "Năsăud",
  "Tălmaciu",
  "Oravița",
  "Mărășești",
  "Sângeorz-Băi",
  "Băile Govora",
  "Băile Tușnad",
  "Băile Eforie",
  "Azuga",
  "Băile Felix",
  "Băile 1 Mai",
  "Băile Herculane",
  "Băile Olănești",
  "Băile Sărata Monteoru",
  "Băile Slănic",
  "Băile Ștefănești",
  "Băile Tușnad",
  "Băile Vâlcele",
  "Băile Vișeu",
  "Băile Ștefănești",
  "Băile Govora",
  "Băile Olănești",
  "Băile Tușnad",
  "Băile Eforie",
  "Băile Felix",
  "Băile 1 Mai",
  "Băile Herculane",
  "Băile Olănești",
  "Băile Sărata Monteoru",
  "Băile Slănic",
  "Băile Ștefănești",
  "Băile Tușnad",
  "Băile Vâlcele",
  "Băile Vișeu"
].sort();

// Maparea între orașe și județe
const cityToCounty: Record<string, string> = {
  "București": "București",
  "Cluj-Napoca": "Cluj",
  "Timișoara": "Timiș",
  "Iași": "Iași",
  "Constanța": "Constanța",
  "Brașov": "Brașov",
  "Craiova": "Dolj",
  "Galați": "Galați",
  "Ploiești": "Prahova",
  "Oradea": "Bihor",
  "Brăila": "Brăila",
  "Arad": "Arad",
  "Pitești": "Argeș",
  "Sibiu": "Sibiu",
  "Bacău": "Bacău",
  "Târgu Mureș": "Mureș",
  "Baia Mare": "Maramureș",
  "Buzău": "Buzău",
  "Botoșani": "Botoșani",
  "Satu Mare": "Satu Mare",
  "Râmnicu Vâlcea": "Vâlcea",
  "Drobeta-Turnu Severin": "Mehedinți",
  "Suceava": "Suceava",
  "Piatra Neamț": "Neamț",
  "Târgoviște": "Dâmbovița",
  "Focșani": "Vrancea",
  "Târgu Jiu": "Gorj",
  "Tulcea": "Tulcea",
  "Alba Iulia": "Alba",
  "Giurgiu": "Giurgiu",
  "Slatina": "Olt",
  "Vaslui": "Vaslui",
  "Bistrița": "Bistrița-Năsăud",
  "Reșița": "Caraș-Severin",
  "Călărași": "Călărași",
  "Deva": "Hunedoara",
  "Hunedoara": "Hunedoara",
  "Zalău": "Sălaj",
  "Sfântu Gheorghe": "Covasna",
  "Bârlad": "Vaslui",
  "Roman": "Neamț",
  "Turda": "Cluj",
  "Mediaș": "Sibiu",
  "Slobozia": "Ialomița",
  "Alexandria": "Teleorman",
  "Voluntari": "Ilfov",
  "Lugoj": "Timiș",
  "Medgidia": "Constanța",
  "Onești": "Bacău",
  "Miercurea Ciuc": "Harghita",
  "Sighetu Marmației": "Maramureș",
  "Petroșani": "Hunedoara",
  "Mangalia": "Constanța",
  "Tecuci": "Galați",
  "Odorheiu Secuiesc": "Harghita",
  "Râmnicu Sărat": "Buzău",
  "Pașcani": "Iași",
  "Dej": "Cluj",
  "Reghin": "Mureș",
  "Năvodari": "Constanța",
  "Câmpina": "Prahova",
  "Mioveni": "Argeș",
  "Câmpulung": "Argeș",
  "Caracal": "Olt",
  "Săcele": "Brașov",
  "Făgăraș": "Brașov",
  "Sighișoara": "Mureș",
  "Borșa": "Maramureș",
  "Roșiorii de Vede": "Teleorman",
  "Curtea de Argeș": "Argeș",
  "Sebeș": "Alba",
  "Huși": "Vaslui",
  "Fetești": "Ialomița",
  "Pantelimon": "Ilfov",
  "Oltenița": "Călărași",
  "Turnu Măgurele": "Teleorman",
  "Caransebeș": "Caraș-Severin",
  "Dorohoi": "Botoșani",
  "Vulcan": "Hunedoara",
  "Rădăuți": "Suceava",
  "Zărnești": "Brașov",
  "Lupeni": "Hunedoara",
  "Aiud": "Alba",
  "Petrila": "Hunedoara",
  "Buftea": "Ilfov",
  "Târnăveni": "Mureș",
  "Popești-Leordeni": "Ilfov",
  "Câmpia Turzii": "Cluj",
  "Codlea": "Brașov",
  "Moinesti": "Bacău",
  "Gherla": "Cluj",
  "Comănești": "Bacău",
  "Carei": "Satu Mare",
  "Motru": "Gorj",
  "Orăștie": "Hunedoara",
  "Băilești": "Dolj",
  "Drăgășani": "Vâlcea",
  "Băile Herculane": "Caraș-Severin",
  "Salonta": "Bihor",
  "Calafat": "Dolj",
  "Fălticeni": "Suceava",
  "Cernavodă": "Constanța",
  "Bocșa": "Caraș-Severin",
  "Marghita": "Bihor",
  "Baia Sprie": "Maramureș",
  "Luduș": "Mureș",
  "Urziceni": "Ialomița",
  "Vișeu de Sus": "Maramureș",
  "Bragadiru": "Ilfov",
  "Râșnov": "Brașov",
  "Sinaia": "Prahova",
  "Negru Vodă": "Constanța",
  "Târgu Neamț": "Neamț",
  "Moreni": "Dâmbovița",
  "Târgu Secuiesc": "Covasna",
  "Gheorgheni": "Harghita",
  "Orșova": "Mehedinți",
  "Balș": "Olt",
  "Covasna": "Covasna",
  "Șimleu Silvaniei": "Sălaj",
  "Dărmănești": "Bacău",
  "Toplița": "Harghita",
  "Gura Humorului": "Suceava",
  "Avrig": "Sibiu",
  "Băbeni": "Vâlcea",
  "Vălenii de Munte": "Prahova",
  "Cisnădie": "Sibiu",
  "Moldova Nouă": "Caraș-Severin",
  "Sânnicolau Mare": "Timiș",
  "Vatra Dornei": "Suceava",
  "Câmpulung Moldovenesc": "Suceava",
  "Predeal": "Brașov",
  "Ocna Mureș": "Alba",
  "Pucioasa": "Dâmbovița",
  "Băile Olănești": "Vâlcea",
  "Târgu Lăpuș": "Maramureș",
  "Sovata": "Mureș",
  "Iernut": "Mureș",
  "Vânju Mare": "Mehedinți",
  "Deta": "Timiș",
  "Hârșova": "Constanța",
  "Odobești": "Vrancea",
  "Măcin": "Tulcea",
  "Anina": "Caraș-Severin",
  "Năsăud": "Bistrița-Năsăud",
  "Tălmaciu": "Sibiu",
  "Oravița": "Caraș-Severin",
  "Mărășești": "Vrancea",
  "Sângeorz-Băi": "Bistrița-Năsăud",
  "Băile Govora": "Vâlcea",
  "Băile Tușnad": "Harghita",
  "Băile Eforie": "Constanța",
  "Azuga": "Prahova",
  "Băile Felix": "Bihor",
  "Băile 1 Mai": "Bihor",
  "Băile Sărata Monteoru": "Buzău",
  "Băile Slănic": "Prahova",
  "Băile Ștefănești": "Argeș",
  "Băile Vâlcele": "Vâlcea",
  "Băile Vișeu": "Maramureș"
};

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/locations', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/locations?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies?page=1&limit=100');
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users?page=1&limit=100');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      return await apiRequest("POST", "/api/locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Location created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLocation> }) => {
      return await apiRequest("PUT", `/api/locations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Location updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      county: "",
      country: "",
      phone: "",
      email: "",
      companyId: undefined,
      managerId: undefined,
      isActive: true,
    },
  });

  const editForm = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      county: "",
      country: "",
      phone: "",
      email: "",
      companyId: undefined,
      managerId: undefined,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertLocation) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertLocation) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    }
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    editForm.reset({
      companyId: location.companyId,
      name: location.name || "",
      address: location.address || "",
      city: location.city || "",
      county: location.county || "",
      country: location.country || "",
      phone: location.phone || "",
      email: location.email || "",
      managerId: location.managerId,
      isActive: location.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === data?.locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(data?.locations.map((l: any) => l.id) || []);
    }
  };

  const handleSelectLocation = (locationId: number) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedLocations.length} locations`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedLocations.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedLocations.length} locations`,
      variant: "destructive",
    });
  };

  const getManagerName = (managerId: number) => {
    if (!managerId) return "No Manager";
    const manager = Array.isArray(users?.users) ? users.users.find((user: any) => user.id === managerId) : undefined;
    return manager ? `${manager.firstName} ${manager.lastName}` : "Unknown Manager";
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedLocations.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedLocations.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedLocations.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Search Bar and Actions */}
      <div className="search-card">
        <div className="flex items-center justify-between w-full">
          <div className="relative" style={{ width: '10cm' }}>
            <Input
              type="text"
              placeholder="Search locations by name, address, or company..."
              value={searchTerm}
              onChange={handleSearch}
              className="enhanced-input pl-12 pr-4 py-2 text-base text-right"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            <ImportExportDialog module="locations" moduleName="Locations">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Locations Table */}
      <div className="search-card">
        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load locations</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.locations?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No locations found</h3>
            <p>Get started by creating your first gaming location.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedLocations.length === data?.locations.length && data?.locations.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16">#</th>
                    <th>Location</th>
                    <th>Address</th>
                    <th>Company</th>
                    <th>Manager</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.locations.map((location: any, index: number) => (
                    <tr key={location.id}>
                      <td>
                        <Checkbox
                          checked={selectedLocations.includes(location.id)}
                          onCheckedChange={() => handleSelectLocation(location.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td>
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="table-cell-primary">{location.name}</div>
                          <div className="table-cell-secondary">
                            {location.city}
                            {location.county ? `, ${location.county}` : ""}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {location.address || 'Not specified'}
                        </div>
                      </td>
                      <td>
                        <span className="table-cell-accent">
                          {companies && Array.isArray(companies.companies) ? companies.companies.find((c: any) => c.id === location.companyId)?.name || 'Unknown Company' : 'Unknown Company'}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {getManagerName(location.managerId)}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {location.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-400" />
                              <span className="table-cell-primary">{location.email}</span>
                            </div>
                          )}
                          {location.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-400" />
                              <span className="table-cell-secondary">{location.phone}</span>
                            </div>
                          )}
                          {!location.email && !location.phone && (
                            <span className="text-slate-500 text-sm">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${location.isActive ? 'status-active' : 'status-inactive'}`}>
                          {location.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(location.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination and entries info - SUB tabel */}
      {data?.locations?.length > 0 && (
        <div className="flex items-center justify-between mt-2 px-2 text-sm text-slate-400">
          <span>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 min-w-[40px] px-3"
            >
              Previous
            </Button>
            <button
              className="h-8 min-w-[40px] px-3 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center"
              disabled
            >
              {currentPage}
            </button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 min-w-[40px] px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Location Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Location</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new gaming location with company assignment and contact details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Location Name *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter location name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Company *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        {companies?.companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="123 Main St" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">City *</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value || undefined} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Set county automatically based on selected city
                            if (value && cityToCounty[value]) {
                              form.setValue('county', cityToCounty[value]);
                              // Auto-fill country as Romania for Romanian cities
                              form.setValue('country', 'România');
                            } else {
                              form.setValue('county', '');
                              form.setValue('country', '');
                            }
                          }}
                        >
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {romanianCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">County</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="form-input bg-slate-700/50" 
                        placeholder="Auto-filled based on city"
                        value={form.watch("city") ? cityToCounty[form.watch("city")] || "" : ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Country</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="form-input bg-slate-700/50" 
                        placeholder="Auto-filled based on city"
                        value={form.watch("city") ? "România" : ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Manager</FormLabel>
                    <Select onValueChange={(value) => {
                      const userId = value ? parseInt(value) : null;
                      field.onChange(userId);
                      
                      // Auto-fill phone and email from selected manager
                      if (userId && Array.isArray(users?.users)) {
                        const selectedUser = users.users.find((user: any) => user.id === userId);
                        if (selectedUser) {
                          form.setValue('phone', selectedUser.telephone || '');
                          form.setValue('email', selectedUser.email || '');
                        }
                      }
                    }} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        {users?.users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName} {user.lastName} ({user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" className="form-input" placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="location@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Location"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Location</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update location information, company assignment, and contact details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Location Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter location name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Company</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="123 Main St" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">City</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value || undefined} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Set county automatically based on selected city
                            if (value && cityToCounty[value]) {
                              editForm.setValue('county', cityToCounty[value]);
                              // Auto-fill country as Romania for Romanian cities
                              editForm.setValue('country', 'România');
                            } else {
                              editForm.setValue('county', '');
                              editForm.setValue('country', '');
                            }
                          }}
                        >
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {romanianCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">County</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="form-input bg-slate-700/50" 
                        placeholder="Auto-filled based on city"
                        value={editForm.watch("city") ? cityToCounty[editForm.watch("city")] || "" : ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Country</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="form-input bg-slate-700/50" 
                        placeholder="Auto-filled based on city"
                        value={editForm.watch("city") ? "România" : ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Manager</FormLabel>
                    <Select onValueChange={(value) => {
                      const userId = value ? parseInt(value) : null;
                      field.onChange(userId);
                      
                      // Auto-fill phone and email from selected manager
                      if (userId && Array.isArray(users?.users)) {
                        const selectedUser = users.users.find((user: any) => user.id === userId);
                        if (selectedUser) {
                          editForm.setValue('phone', selectedUser.telephone || '');
                          editForm.setValue('email', selectedUser.email || '');
                        }
                      }
                    }} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        {users?.users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName} {user.lastName} ({user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" className="form-input" placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="location@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Location"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
