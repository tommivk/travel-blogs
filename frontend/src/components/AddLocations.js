import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Button, TextField } from '@material-ui/core';

const AddLocations = ({ locations, setLocations }) => {
  const [filter, SetFilter] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const URL = 'http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix=';

  useEffect(() => {
    if (filter !== '') {
      axios.get(`${URL}${filter}`).then((res) => setSearchResult(res.data));
    }
  }, [filter]);

  const handleAddLocation = (city) => {
    const newLocation = [
      {
        lat: city.latitude,
        lng: city.longitude,
        city: city.city,
        country: city.country,
      },
    ];
    setLocations(locations.concat(newLocation));
  };
  return (
    <div>
      <TextField
        id="location-search-textfield"
        variant="outlined"
        placeholder="search by city"
        onChange={({ target }) => SetFilter(target.value)}
      />
      <ul id="location-list">
        {searchResult
        && searchResult.data
        && searchResult.data.map((city) => (
          <div style={{ display: 'flex' }} key={city.city}>
            <li id="location-list-element">
              {city.city}
              {', '}
              {city.country}
            </li>
            <Button
              id="location-select-button"
              onClick={() => handleAddLocation(city)}
              variant="outlined"
              color="secondary"
            >
              Choose
            </Button>
          </div>
        ))}
      </ul>
    </div>
  );
};

AddLocations.propTypes = {
  locations: PropTypes.instanceOf(Array).isRequired,
  setLocations: PropTypes.func.isRequired,
};

export default AddLocations;
