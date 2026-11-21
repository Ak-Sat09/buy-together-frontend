import { Route, Routes } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { BrowsePage } from './pages/BrowsePage'
import { GroupPage } from './pages/GroupPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyGroupsPage } from './pages/MyGroupsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { StartGroupPage } from './pages/StartGroupPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="groups" element={<BrowsePage />} />
        <Route
          path="groups/new"
          element={
            <RequireAuth>
              <StartGroupPage />
            </RequireAuth>
          }
        />
        <Route path="groups/:groupId" element={<GroupPage />} />
        <Route
          path="me/groups"
          element={
            <RequireAuth>
              <MyGroupsPage />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
