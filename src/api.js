
export async function getCoordinates(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`);
  const data = await response.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  throw new Error('Address not found');
}

export async function getRoute(start, end) {
  const response = await fetch(
    `https://graphhopper.com/api/1/route?key=191f01a2-5fb3-4043-8456-ce4b3b67e3b3&point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&profile=car&locale=en&calc_points=true&points_encoded=false`
  );
  const data = await response.json();
  
  if (data.paths && data.paths.length > 0) {
    const path = data.paths[0];
    return {
      coordinates: path.points.coordinates.map(coord => [coord[1], coord[0]]), // Convert to [lat, lon]
      distance: (path.distance / 1000).toFixed(1), // Distance in km
      duration: (path.time / 3600000).toFixed(1), // Duration in hours
      steps: path.instructions.map(step => ({
        instruction: step.text,
        distance: (step.distance / 1000).toFixed(1),
        duration: (step.time / 60000).toFixed(1) // Duration in minutes
      }))
    };
  }
  
  throw new Error('Route not found');
}
