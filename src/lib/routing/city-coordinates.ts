/**
 * FleetMind AI — Canonical City & State Geocoding Registry
 * Precision coordinates for major South Indian freight corridors & hubs.
 */

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; state?: string }> = {
  // Tamil Nadu Freight Hubs
  Karur: { lat: 10.9601, lng: 78.0766, state: 'Tamil Nadu' },
  Chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  Coimbatore: { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  Salem: { lat: 11.6643, lng: 78.146, state: 'Tamil Nadu' },
  Hosur: { lat: 12.8399, lng: 77.677, state: 'Tamil Nadu' },
  Tirupur: { lat: 11.1085, lng: 77.3411, state: 'Tamil Nadu' },
  Madurai: { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  Trichy: { lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  Erode: { lat: 11.341, lng: 77.7172, state: 'Tamil Nadu' },
  Vellore: { lat: 12.9165, lng: 79.1325, state: 'Tamil Nadu' },
  Dindigul: { lat: 10.3673, lng: 77.9803, state: 'Tamil Nadu' },
  Namakkal: { lat: 11.2189, lng: 78.1674, state: 'Tamil Nadu' },
  Thoothukudi: { lat: 8.7642, lng: 78.1348, state: 'Tamil Nadu' },
  Tuticorin: { lat: 8.7642, lng: 78.1348, state: 'Tamil Nadu' },
  Tirunelveli: { lat: 8.7139, lng: 77.7567, state: 'Tamil Nadu' },
  Nagercoil: { lat: 8.1833, lng: 77.4119, state: 'Tamil Nadu' },
  Kanyakumari: { lat: 8.0883, lng: 77.5385, state: 'Tamil Nadu' },

  // Kerala Corridors & Depots
  Kerala: { lat: 9.9312, lng: 76.2673, state: 'Kerala' }, // Defaults to central Kochi Freight Corridor
  Kochi: { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  Cochin: { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  Ernakulam: { lat: 9.9816, lng: 76.2999, state: 'Kerala' },
  Palakkad: { lat: 10.7867, lng: 76.6548, state: 'Kerala' },
  Trivandrum: { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  Kozhikode: { lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  Calicut: { lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  Thrissur: { lat: 10.5276, lng: 76.2144, state: 'Kerala' },
  Kannur: { lat: 11.8745, lng: 75.3704, state: 'Kerala' },
  Alappuzha: { lat: 9.4981, lng: 76.3388, state: 'Kerala' },
  Alleppey: { lat: 9.4981, lng: 76.3388, state: 'Kerala' },
  Kollam: { lat: 8.8932, lng: 76.6141, state: 'Kerala' },
  Kottayam: { lat: 9.5916, lng: 76.5222, state: 'Kerala' },
  Malappuram: { lat: 11.051, lng: 76.0711, state: 'Kerala' },
  Wayanad: { lat: 11.6854, lng: 76.132, state: 'Kerala' },

  // Karnataka & Andhra / Telangana / Pan-India
  Bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  Bangalore: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  Mysuru: { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  Mysore: { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  Mangaluru: { lat: 12.9141, lng: 74.856, state: 'Karnataka' },
  Mangalore: { lat: 12.9141, lng: 74.856, state: 'Karnataka' },
  Hubli: { lat: 15.3647, lng: 75.124, state: 'Karnataka' },
  Hyderabad: { lat: 17.385, lng: 78.4867, state: 'Telangana' },
  Vijayawada: { lat: 16.5062, lng: 80.648, state: 'Andhra Pradesh' },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  Puducherry: { lat: 11.9416, lng: 79.8083, state: 'Puducherry' },
  Pondicherry: { lat: 11.9416, lng: 79.8083, state: 'Puducherry' },
  Mumbai: { lat: 19.076, lng: 72.8777, state: 'Maharashtra' },
  Pune: { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  Goa: { lat: 15.4909, lng: 73.8278, state: 'Goa' },
};

/**
 * Resolves a city name (or state) to exact latitude and longitude.
 * Performs intelligent fuzzy matching and case-insensitive lookup.
 */
export function resolveCityCoordinates(
  cityName?: string,
  fallback: { lat: number; lng: number } = { lat: 13.0827, lng: 80.2707 }
): { lat: number; lng: number; cityName: string } {
  if (!cityName || !cityName.trim()) {
    return { ...fallback, cityName: 'Chennai' };
  }

  const query = cityName.trim().toLowerCase();

  // 1. Exact match
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (name.toLowerCase() === query) {
      return { lat: coords.lat, lng: coords.lng, cityName: name };
    }
  }

  // 2. Substring match (e.g. "Cochin CFS", "Karur Industrial Area", "Kerala Depot", "Kochi Port")
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (query.includes(name.toLowerCase()) || name.toLowerCase().includes(query)) {
      return { lat: coords.lat, lng: coords.lng, cityName: name };
    }
  }

  // 3. Special aliases
  if (query.includes('kerala') || query.includes('malabar') || query.includes('gods own country')) {
    return { lat: 9.9312, lng: 76.2673, cityName: 'Kochi (Kerala)' };
  }
  if (query.includes('karur') || query.includes('textile hub')) {
    return { lat: 10.9601, lng: 78.0766, cityName: 'Karur' };
  }

  return { ...fallback, cityName: cityName.trim() };
}
