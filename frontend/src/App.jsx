import { Route, Routes } from "react-router";

import { AuthProvider } from "./auth/AuthContext.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import AppShell from "./layouts/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import MemberForm from "./pages/MemberForm.jsx";
import MembersList from "./pages/MembersList.jsx";
import NewUser from "./pages/NewUser.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<MembersList />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="members/:id/edit" element={<MemberForm />} />
          <Route path="users/new" element={<NewUser />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
