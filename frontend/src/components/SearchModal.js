import React, { useState, useEffect } from 'react'
import { Modal, Checkbox } from '@material-ui/core'
import '../styles/searchModal.css'
import { Link } from 'react-router-dom'
const SearchModal = ({
  open,
  searchFilter,
  setSearchFilter,
  closeSearchModal,
  allPictures,
  allUsers,
}) => {
  const [searchCities, setSearchCities] = useState(true)
  const [searchCountries, setSearchCountries] = useState(true)
  const [searchPictures, setSearchPictures] = useState(true)
  const [searchUsers, setSearchUsers] = useState(true)

  useEffect(() => {
    setSearchCities(true)
    setSearchCountries(true)
    setSearchPictures(true)
    setSearchUsers(true)
  }, [open])

  if (!open || !allPictures) return null

  const cities = allPictures.filter((pic) =>
    pic.location.city
      ? pic.location.city.toLowerCase().includes(searchFilter.toLowerCase())
      : null
  )
  const foundCities = [...new Set(cities.map((c) => c.location.city))]
  const countries = allPictures.filter((pic) =>
    pic.location.country
      ? pic.location.country.toLowerCase().includes(searchFilter.toLowerCase())
      : null
  )
  const foundCountries = [...new Set(countries.map((c) => c.location.country))]

  const foundUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const foundPicture = allPictures.filter((pic) =>
    pic.title.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div>
      <Modal open={open} onClose={closeSearchModal}>
        <div className='modal-content'>
          <button style={{ float: 'right' }} onClick={closeSearchModal}>
            close
          </button>
          <input
            autoComplete='off'
            id='search-modal-input'
            autoFocus
            value={searchFilter}
            onChange={({ target }) => setSearchFilter(target.value)}
          ></input>
          <div>
            Cities
            <Checkbox
              checked={searchCities}
              onChange={() => setSearchCities(!searchCities)}
            ></Checkbox>
            Countries
            <Checkbox
              checked={searchCountries}
              onChange={() => setSearchCountries(!searchCountries)}
            ></Checkbox>
            Pictures
            <Checkbox
              checked={searchPictures}
              onChange={() => setSearchPictures(!searchPictures)}
            ></Checkbox>
            Users
            <Checkbox
              checked={searchUsers}
              onChange={() => setSearchUsers(!searchUsers)}
            ></Checkbox>
          </div>
          <div className='search-bottom-container'>
            <div className='search-bottom-section'>
              {searchPictures && (
                <div>
                  <h2>Pictures</h2>
                  {foundPicture.length === 0 ? (
                    'No pictures found'
                  ) : (
                    <div>
                      <ul>
                        <div>
                          {foundPicture.map((pic) => (
                            <li>
                              <Link to={`/gallery/${pic.id}`}>{pic.title}</Link>
                            </li>
                          ))}
                        </div>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='search-bottom-section'>
              {searchCities && (
                <div>
                  <h2>Cities</h2>
                  {foundCities.length === 0 ? (
                    'No cities found'
                  ) : (
                    <div>
                      <ul>
                        {foundCities.map((city) => (
                          <li key={city}>
                            {city}

                            <Link
                              to={{
                                pathname: '/gallery',
                                search: `?city=${city}`,
                              }}
                            >
                              <button>Pictures</button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='search-bottom-section'>
              {searchCountries && (
                <div>
                  <h2>Countries</h2>
                  {foundCountries.length === 0 ? (
                    'No countries found'
                  ) : (
                    <div>
                      <ul>
                        {foundCountries.map((country) => (
                          <li key={country}>
                            {country}{' '}
                            <Link
                              to={{
                                pathname: '/gallery',
                                search: `?country=${country}`,
                              }}
                            >
                              <button>Pictures</button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='search-bottom-section'>
              {searchUsers && (
                <div>
                  <h2>Users</h2>
                  {foundUsers.length === 0 ? (
                    'No users found'
                  ) : (
                    <div>
                      <ul>
                        {foundUsers.map((user) => (
                          <li>
                            <Link to={`/users/${user.id}`}>
                              {user.username}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SearchModal
