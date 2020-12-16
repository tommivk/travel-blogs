import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, TextField } from '@material-ui/core'

const AddLocations = ({ locations, setLocations }) => {
  const [filter, SetFilter] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const URL =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix='

  useEffect(() => {
    if (filter !== '') {
      axios.get(`${URL}${filter}`).then((res) => setSearchResult(res.data))
    }
  }, [filter])

  const handleAddLocation = (city) => {
    console.log(city)
    const newLocation = [
      {
        lat: city.latitude,
        lng: city.longitude,
        city: city.city,
        country: city.country,
      },
    ]
    setLocations(locations.concat(newLocation))
  }
  return (
    <div>
      {/* {Location && (
        <ul>
          {locations.map((l) => (
            <li>
              {l.lat} {l.lng}
            </li>
          ))}
        </ul>
      )} */}
      {/* Add locations */}
      <TextField
        variant='outlined'
        placeholder='search by city'
        onChange={({ target }) => SetFilter(target.value)}
      ></TextField>
      <ul>
        {searchResult &&
          searchResult.data &&
          searchResult.data.map((city) => (
            <div style={{ display: 'flex' }}>
              <li>
                {city.city} {', '} {city.country}
              </li>
              <Button
                onClick={() => handleAddLocation(city)}
                variant='outlined'
                color='secondary'
              >
                Choose
              </Button>
            </div>
          ))}
      </ul>
    </div>
  )
}

export default AddLocations
