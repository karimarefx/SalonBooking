/**
 * Calculates the geodetic distance in kilometers between two points
 * using the Haversine formula.
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

/**
 * Uses the free, open Nominatim OpenStreetMap API to geocode an address into coordinates.
 * Rate limit: max 1 request/sec per OSM guidelines.
 */
export const geocodeAddress = async (address) => {
  if (!address || !address.trim()) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          // OSM requires a valid User-Agent to avoid blocking
          'User-Agent': 'Miraia-Beauty-Booking-System/1.0 (maka@miraia-beauty-booking.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OSM Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(0.0 + data[0].lon), // lon is OpenStreetMap's name
      };
    }
    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
};

/**
 * Returns salons sorted by proximity to the user's coordinates.
 * Adds a `.distance` property (in km) to each salon object.
 */
export const sortByDistance = (salons, userLat, userLng) => {
  if (!userLat || !userLng || !salons || salons.length === 0) return salons;

  return salons
    .map((salon) => {
      const distance = haversineDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(salon.latitude),
        parseFloat(salon.longitude)
      );
      return { ...salon, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
};
