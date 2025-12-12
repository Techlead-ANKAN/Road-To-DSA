import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const defaultUser = {
  userId: '',
  name: 'Guest',
  email: ''
}

const UserContext = createContext({
  user: defaultUser,
  setUser: () => {}
})

export const UserProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('road-to-dsa-user', defaultUser)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
