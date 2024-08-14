
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import vehicleIcon from '../assets/vehicle.png';
import startIconImage from '../assets/start.png';
import endIconImage from '../assets/end.png';
import AddressForm from './AddressForm';
import { getCoordinates, getRoute } from '../api';

const VehicleMap = () => {
  const [route, setRoute] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(20); // Animation duration in seconds
  const [routeInfo, setRouteInfo] = useState(null); // Route information
  const [routeHistory, setRouteHistory] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = async (startAddress, endAddress) => {
    try {
      const startCoords = await getCoordinates(startAddress);
      const endCoords = await getCoordinates(endAddress);
      const routeData = await getRoute(startCoords, endCoords);

      setRoute(routeData.coordinates);
      setCurrentPosition(routeData.coordinates[0]);
      setStartPosition(startCoords);
      setEndPosition(endCoords);
      setProgress(0);
      setRouteInfo(routeData);

      // Save the route to localStorage
      saveRouteToLocalStorage(startAddress, endAddress, routeData);
      loadRouteHistory(); // Update history after saving a new route
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const saveRouteToLocalStorage = (startAddress, endAddress, routeData) => {
    const routeHistory = JSON.parse(localStorage.getItem('routeHistory')) || [];
    const newRoute = {
      startAddress,
      endAddress,
      coordinates: routeData.coordinates,
      routeInfo: routeData
    };
    routeHistory.push(newRoute);
    localStorage.setItem('routeHistory', JSON.stringify(routeHistory));
  };

  const loadRouteHistory = () => {
    const savedRoutes = JSON.parse(localStorage.getItem('routeHistory')) || [];
    setRouteHistory(savedRoutes);
  };

  const handlePreviousRideClick = (route) => {
    setRoute(route.coordinates);
    setCurrentPosition(route.coordinates[0]);
    setStartPosition(route.coordinates[0]);
    setEndPosition(route.coordinates[route.coordinates.length - 1]);
    setProgress(0);
    setRouteInfo(route.routeInfo);
  };

  useEffect(() => {
    loadRouteHistory(); // Load route history on component mount
  }, []);

  useEffect(() => {
    if (route.length > 0) {
      const totalSteps = route.length;
      const intervalTime = (duration * 1000) / totalSteps;

      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          setCurrentPosition(route[newProgress]);

          if (newProgress >= totalSteps - 1) {
            clearInterval(interval);
          }

          return newProgress;
        });
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [route, duration]);

  const vehicleMarkerIcon = new L.Icon({
    iconUrl: vehicleIcon,
    iconSize: [38, 38],
  });

  const startMarkerIcon = new L.Icon({
    iconUrl: startIconImage,
    iconSize: [38, 38],
  });

  const endMarkerIcon = new L.Icon({
    iconUrl: endIconImage,
    iconSize: [38, 38],
  });

  return (
    <div className="map-wrapper">
      <MapContainer center={[20.5937, 78.9629]} zoom={6}  className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {startPosition && <Marker position={startPosition} icon={startMarkerIcon} />}
        {endPosition && <Marker position={endPosition} icon={endMarkerIcon} />}
        {currentPosition && <Marker position={currentPosition} icon={vehicleMarkerIcon} />}
        <Polyline positions={route} color="blue" />
      </MapContainer>

      <div className="overlay">
        <AddressForm onSearch={handleSearch} />

        {routeInfo && (
          <div className="route-info-slider">
            <div className="route-info">
              <h3>Route Information</h3>
              <p><strong>Distance:</strong> {routeInfo.distance} km</p>
              <p><strong>Estimated Time:</strong> {routeInfo.duration} hours</p>
              <ul>
                  {routeInfo.steps.map((step, index) => (
                    <li key={index}>
                      <p>{step.instruction}</p>
                      <p><strong>Distance:</strong> {step.distance} km, <strong>Time:</strong> {step.duration} mins</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Route History Section */}
        <div className="route-history-circle" onClick={() => setShowHistory(!showHistory)}>
  <span className="circle-text">Route History</span>
  <div
    className={`route-history ${showHistory ? 'show' : 'hide'}`}
    onClick={(e) => e.stopPropagation()} // Stop propagation when clicking inside the history div
  >
    <h3>Route History</h3>
    <div className="history-controls">
      <select
        value={selectedRouteIndex}
        onChange={(e) => setSelectedRouteIndex(e.target.value)}
        className="history-select"
      >
        <option value="" disabled>Select Route</option>
        {routeHistory.map((route, index) => (
          <option key={index} value={index}>
            {route.startAddress} to {route.endAddress}
          </option>
        ))}
      </select>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Stop propagation when clicking the button
          handlePreviousRideClick(routeHistory[selectedRouteIndex]);
        }}
        className="history-show-button"
        disabled={selectedRouteIndex === null}
      >
        Show
      </button>
    </div>
  </div>
</div>

        {/* Progress Bar */}
        <div className="container">
  <div className="progress-bar-container">
    <label>Progress: </label>
    <progress value={progress} max={route.length - 1} className="progress-bar"></progress>
  </div>
  <div className="controls">
    <label>Speed </label>
    <input
      type="range"
      min="10"
      max="60"
      value={duration}
      onChange={(e) => setDuration(Number(e.target.value))}
      className="speed-slider"
    />
  </div>
</div>

      </div>
    </div>
  );
};

export default VehicleMap;

