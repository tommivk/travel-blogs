import React, { useState, useRef, useEffect } from 'react'
import { Modal } from '@material-ui/core'
import '../styles/searchModal.css'
const SearchModal = ({
  open,
  searchFilter,
  setSearchFilter,
  closeSearchModal,
  allPictures,
}) => {
  if (!open || !allPictures) return null

  const pictures = allPictures
  console.log(pictures)
  const cities = pictures.filter((pic) =>
    pic.location.city
      ? pic.location.city.toLowerCase().includes(searchFilter.toLowerCase())
      : null
  )
  const foundCities = [...new Set(cities.map((c) => c.location.city))]
  const countries = pictures.filter((pic) =>
    pic.location.country
      ? pic.location.country.toLowerCase().includes(searchFilter.toLowerCase())
      : null
  )
  const foundCountries = [...new Set(countries.map((c) => c.location.country))]

  const users = pictures.filter((pic) =>
    pic.user.username.toLowerCase().includes(searchFilter.toLowerCase())
  )
  const foundUsers = [...new Set(users.map((pic) => pic.user.username))]
  console.log(foundCities)

  const titleMatch = pictures.filter((pic) =>
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

          <div className='search-bottom-container'>
            <div className='search-bottom-section'>
              <h2>Pictures</h2>
              {titleMatch.length > 0 && (
                <ul>
                  <div>
                    {titleMatch.map((pic) => (
                      <li>{pic.title}</li>
                    ))}
                  </div>
                </ul>
              )}
            </div>
            <div className='search-bottom-section'>
              <h2>Cities</h2>
              {foundCities.length > 0 && (
                <div>
                  <ul>
                    {foundCities.map((city) => (
                      <li key={city}>{city}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className='search-bottom-section'>
              <h2>Countries</h2>
              {foundCountries.length > 0 && (
                <div>
                  <ul>
                    {foundCountries.map((country) => (
                      <li key={country}>{country}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className='search-bottom-section'>
              <h2>Users</h2>
              {foundUsers.length > 0 && (
                <div>
                  <ul>
                    {foundUsers.map((user) => (
                      <li>{user}</li>
                    ))}
                  </ul>
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
