import { MobileLayout } from "@/components/MobileLayout";
import { useGyms } from "@/hooks/use-gyms";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

// Custom marker icon hack for Leaflet in React
const iconHTML = renderToString(<MapPin className="text-primary fill-primary w-8 h-8" />);
const customIcon = L.divIcon({
  html: iconHTML,
  className: "custom-leaflet-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function GymsPage() {
  const { data: gyms, isLoading } = useGyms();
  
  // Default center (San Francisco for demo)
  const center = { lat: 37.7749, lng: -122.4194 };

  return (
    <MobileLayout>
      <div className="h-[calc(100vh-80px)] relative flex flex-col">
        <div className="absolute top-4 left-4 right-4 z-[400] bg-card/90 backdrop-blur p-4 rounded-2xl border border-white/10 shadow-xl">
          <h1 className="text-lg font-bold">Partner Gyms</h1>
          <p className="text-xs text-muted-foreground">Find mom-friendly spaces nearby</p>
        </div>

        {isLoading ? (
          <div className="w-full h-full bg-card animate-pulse flex items-center justify-center text-muted-foreground">
            Loading Map...
          </div>
        ) : (
          <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {gyms?.map((gym) => (
              <Marker 
                key={gym.id} 
                position={[Number(gym.lat), Number(gym.lng)]}
                icon={customIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h3 className="font-bold text-foreground">{gym.name}</h3>
                    <p className="text-xs text-muted-foreground">{gym.address}</p>
                    {gym.isPartner && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded mt-1 inline-block">Partner</span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </MobileLayout>
  );
}
