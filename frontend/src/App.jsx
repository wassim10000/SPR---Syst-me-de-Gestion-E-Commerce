import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Historique from './pages/Historique';
import Produits from './pages/Produits';
import Panier from './pages/Panier';
import Commande from './pages/Commande';
import MesCommandes from './pages/MesCommandes';
import AdminProduits from './pages/Admin/Produits';
import AdminCategories from './pages/Admin/Categories';
import AdminCommandes from './pages/Admin/Commandes';
import Navbar from './components/Navbar';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                {/* Pages administratives */}
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="permissions" element={<Permissions />} />
                <Route path="historique" element={<Historique />} />
                
                {/* Pages e-commerce pour tous les utilisateurs */}
                <Route path="produits" element={<Produits />} />
                <Route path="panier" element={<Panier />} />
                <Route path="commande" element={<Commande />} />
                <Route path="mes-commandes" element={<MesCommandes />} />
                
                {/* Pages d'administration e-commerce */}
                <Route path="admin/produits" element={<AdminProduits />} />
                <Route path="admin/categories" element={<AdminCategories />} />
                <Route path="admin/commandes" element={<AdminCommandes />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
