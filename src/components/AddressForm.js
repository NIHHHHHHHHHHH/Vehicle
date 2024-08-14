

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AddressForm = ({ onSearch }) => {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length > 2) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`);
      const data = await response.json();
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  const handleStartAddressChange = async (e) => {
    const query = e.target.value;
    setStartAddress(query);
    fetchSuggestions(query, setStartSuggestions);
  };

  const handleEndAddressChange = async (e) => {
    const query = e.target.value;
    setEndAddress(query);
    fetchSuggestions(query, setEndSuggestions);
  };

  const handleSelectStartSuggestion = (suggestion) => {
    setStartAddress(suggestion.display_name);
    setStartSuggestions([]);
  };

  const handleSelectEndSuggestion = (suggestion) => {
    setEndAddress(suggestion.display_name);
    setEndSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(startAddress, endAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="input-group">
        <FaMapMarkerAlt className="input-icon" />
        <input
          type="text"
          value={startAddress}
          onChange={handleStartAddressChange}
          placeholder="Enter Starting Point"
          required
        />
        {startSuggestions.length > 0 && (
          <ul className="suggestions">
            {startSuggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSelectStartSuggestion(suggestion)}>
                <FaMapMarkerAlt className="suggestion-icon" />
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="input-group">
        <FaSearch className="input-icon" />
        <input
          type="text"
          value={endAddress}
          onChange={handleEndAddressChange}
          placeholder="Choose destination, or click on the map..."
          required
        />
        {endSuggestions.length > 0 && (
          <ul className="suggestions">
            {endSuggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSelectEndSuggestion(suggestion)}>
                <FaMapMarkerAlt className="suggestion-icon" />
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="start-button">
        <FaArrowUp className="arrow-icon" />
        <FaArrowDown className="arrow-icon" />
      </button>
    </form>
  );
};

export default AddressForm;