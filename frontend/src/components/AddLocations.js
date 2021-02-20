import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AddLocations = ({ filter, selectFunction }) => {
  const [searchResult, setSearchResult] = useState([]);
  const [href, setHref] = useState('/v1/geo/cities?limit=5&offset=0&namePrefix=');

  const URL = 'http://geodb-free-service.wirefreethought.com';

  useEffect(() => {
    setSearchResult([]);
    if (filter !== '') {
      axios.get(`${URL}${'/v1/geo/cities?limit=5&offset=0&namePrefix='}${filter}`).then((res) => setSearchResult(res.data));
    }
  }, [filter]);

  useEffect(() => {
    setSearchResult([]);
    if (filter !== '') {
      axios.get(`${URL}${href}`).then((res) => setSearchResult(res.data));
    }
  }, [href]);

  const getButtons = (res) => {
    if (res && res.links) {
      const next = res.links.find((x) => x.rel === 'next');
      const prev = res.links.find((x) => x.rel === 'prev');

      return (
        <div className="location-result-bottom-buttons">
          {prev && <button className="location-result-prev-button" type="button" onClick={() => setHref(prev.href)}>Prev</button>}
          {next && <button className="location-result-next-button" type="button" onClick={() => setHref(next.href)}>Next</button>}
        </div>
      );
    }
    return null;
  };

  if (filter === '') return null;

  return (
    <>
      {searchResult.data && searchResult.data.length > 0
                && (
                  <div>
                    <table>
                      <tbody>

                        {searchResult.data.map((city) => (
                          <tr key={city.city}>
                            <td>{city.city}</td>
                            <td>{city.country}</td>
                            <td><button className="location-result-select-button" type="button" onClick={() => selectFunction(city)}>Select</button></td>
                          </tr>
                        ))}

                      </tbody>
                    </table>
                    {getButtons(searchResult)}
                  </div>
                )}
      {searchResult.data && searchResult.data.length === 0 && <p>No cities found</p>}
    </>
  );
};

AddLocations.propTypes = {
  filter: PropTypes.string.isRequired,
  selectFunction: PropTypes.func.isRequired,
};

export default AddLocations;
