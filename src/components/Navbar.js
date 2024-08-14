import React from 'react';
import '../styles/VehicleMap.css'; 

const Navbar = () => {
  return (
    <div className="navbar">
      <input
        type="text"
        placeholder="Search Google Maps"
        className="search-input"
      />
      <ul className="nav-list">
        <li>Saved</li>
        <li>Recents</li>
        <li>Pune</li>
        <li>Mumbai</li>
      </ul>
    </div>
  );
};

export default Navbar;
