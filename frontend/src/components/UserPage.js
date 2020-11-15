const UserPage = ({ userData }) => {
  if (!userData) return null
  return <div>{userData.username}</div>
}

export default UserPage
