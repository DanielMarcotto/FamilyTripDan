export const getDistance = (coords1: { latitude: number; longitude: number }, coords2: { latitude: number; longitude: number }) => {
    // Validate inputs
    if (!coords1 || !coords2) {
        console.error('[getDistance] Invalid coordinates:', { coords1, coords2 });
        return Infinity;
    }
    
    if (typeof coords1.latitude !== 'number' || typeof coords1.longitude !== 'number' ||
        typeof coords2.latitude !== 'number' || typeof coords2.longitude !== 'number') {
        console.error('[getDistance] Coordinates are not numbers:', { coords1, coords2 });
        return Infinity;
    }
    
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(coords1.latitude);
    const φ2 = toRad(coords2.latitude);
    const Δφ = toRad(coords2.latitude - coords1.latitude);
    const Δλ = toRad(coords2.longitude - coords1.longitude);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // distance in meters
    
    // Validate result
    if (!isFinite(distance) || distance < 0) {
        console.error('[getDistance] Invalid distance calculated:', {
            distance,
            coords1,
            coords2,
            a,
            c
        });
        return Infinity;
    }
    
    return distance;
};