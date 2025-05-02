
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';

// Define types for our component props
interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface DeliveryMapProps {
  driverLocation?: MapLocation;
  restaurantLocation?: MapLocation;
  customerLocation?: MapLocation;
  additionalMarkers?: MapLocation[];
  showRoute?: boolean;
  className?: string;
  zoom?: number;
  autoCenter?: boolean;
  onMapClick?: (location: { longitude: number, latitude: number }) => void;
  isInteractive?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  additionalMarkers = [],
  showRoute = false,
  className = 'h-[400px]',
  zoom = 13,
  autoCenter = true,
  onMapClick,
  isInteractive = true
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeSource = useRef<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Setup Mapbox token
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is required. Please set VITE_MAPBOX_TOKEN in your environment.');
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxgl.accessToken) return;

    const initialLocation = driverLocation || restaurantLocation || customerLocation || 
                           (additionalMarkers.length > 0 ? additionalMarkers[0] : null);

    if (!initialLocation) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialLocation.longitude, initialLocation.latitude],
      zoom: zoom,
      interactive: isInteractive
    });

    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: false
    }), 'top-right');

    // Add event listener for map click if callback provided
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
      });
    }

    map.current.on('load', () => {
      // Setup for route display if needed
      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      setMapLoaded(true);
      routeSource.current = 'route';
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxgl.accessToken]);

  // Helper to create and update markers
  const createOrUpdateMarker = (location: MapLocation, id: string) => {
    if (!map.current || !mapLoaded) return;

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    
    // Style based on marker type
    let color = '#3887be'; // Default blue
    let icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    
    switch (location.type) {
      case 'driver':
        color = '#00FF00'; // Green
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
        break;
      case 'restaurant':
        color = '#FF8C00'; // Orange
        break;
      case 'customer':
        color = '#FF0000'; // Red
        break;
    }
    
    markerElement.innerHTML = icon;
    
    // If we already have this marker, update its position
    if (markers.current[id]) {
      markers.current[id].setLngLat([location.longitude, location.latitude]);
    } else {
      // Create new marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);
      
      // Add popup if we have title or description
      if (location.title || location.description) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            ${location.title ? `<h3>${location.title}</h3>` : ''}
            ${location.description ? `<p>${location.description}</p>` : ''}
          `);
        marker.setPopup(popup);
      }
      
      markers.current[id] = marker;
    }
  };

  // Update markers when props change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Create or update markers based on provided locations
    if (driverLocation) {
      createOrUpdateMarker({...driverLocation, type: 'driver'}, 'driver');
    }
    
    if (restaurantLocation) {
      createOrUpdateMarker({...restaurantLocation, type: 'restaurant'}, 'restaurant');
    }
    
    if (customerLocation) {
      createOrUpdateMarker({...customerLocation, type: 'customer'}, 'customer');
    }
    
    // Add all additional markers
    additionalMarkers.forEach((marker, index) => {
      createOrUpdateMarker(marker, `additional-${index}`);
    });
    
    // Auto-center the map if needed
    if (autoCenter) {
      const locations = [
        driverLocation,
        restaurantLocation,
        customerLocation,
        ...additionalMarkers
      ].filter(Boolean) as MapLocation[];
      
      if (locations.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(loc => {
          bounds.extend([loc.longitude, loc.latitude]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      } else if (locations.length === 1) {
        map.current.setCenter([locations[0].longitude, locations[0].latitude]);
        map.current.setZoom(zoom);
      }
    }
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers, mapLoaded, autoCenter]);
  
  // Update route when relevant locations change and route display is enabled
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoute || !routeSource.current) return;
    if (!driverLocation || !(restaurantLocation || customerLocation)) return;
    
    // Determine route points
    const start = driverLocation;
    const end = customerLocation || restaurantLocation;
    if (!end) return;
    
    // Fetch route using Mapbox Directions API (you'll need to implement this)
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
          `?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Update the route on the map
          if (map.current && routeSource.current) {
            const source = map.current.getSource(routeSource.current) as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData({
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route.geometry.coordinates
                }
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };
    
    fetchRoute();
  }, [driverLocation, restaurantLocation, customerLocation, showRoute, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          <p className="text-red-500 font-medium mb-2">Mapbox API token not found!</p>
          <p className="text-sm text-gray-600">Please set VITE_MAPBOX_TOKEN in your environment.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={`${className} rounded-md overflow-hidden`} />;
};

export default DeliveryMap;
