import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const DEFAULT_FROM = [55.9508, -3.3615]; // Edinburgh Airport (EDI)
const DEFAULT_TO = [51.885, 0.235]; // London Stansted Airport (STN)

// Helper component to fit bounds
function MapBounds({ fromCoord, toCoord }) {
  const map = useMap();
  useEffect(() => {
    if (fromCoord && toCoord) {
      const bounds = L.latLngBounds([fromCoord, toCoord]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [fromCoord, toCoord, map]);
  return null;
}

const FlightMapClient = ({ from, to }) => {
  useEffect(() => {
    // Fix default icon issue in Next.js
    if (L && L.Icon && L.Icon.Default) {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    }
  }, []);

  // Use default if not provided or not an array
  const fromCoord = Array.isArray(from) ? from : DEFAULT_FROM;
  const toCoord = Array.isArray(to) ? to : DEFAULT_TO;
  return (
    <div className="w-full">
      {fromCoord && toCoord && (
        <div className="bg-white p-2 rounded-2xl shadow-sm z-10 w-full">
          <MapContainer
            className="h-[320px] w-full rounded-2xl"
            center={[53.9, -1.5]}
            zoom={6}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={fromCoord}>
              <Popup>From</Popup>
            </Marker>
            <Marker position={toCoord}>
              <Popup>To</Popup>
            </Marker>
            <Polyline positions={[fromCoord, toCoord]} color="blue" />
            <MapBounds fromCoord={fromCoord} toCoord={toCoord} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default FlightMapClient;
