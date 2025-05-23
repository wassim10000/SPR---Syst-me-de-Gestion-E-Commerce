import { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Button, Box, Typography, Menu, MenuItem, IconButton,
  Divider, Badge, Avatar, useTheme, useMediaQuery, Drawer, List, ListItem,
  ListItemIcon, ListItemText
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [userInfo, setUserInfo] = useState({
    isAuthenticated: !!localStorage.getItem('token'),
    isAdmin: false,
    isVendeur: false,
    user: null,
    panierCount: 0
  });
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Récupérer les informations de l'utilisateur et son panier
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!localStorage.getItem('token')) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const roles = response.data.user?.roles || [];
        
        setUserInfo({
          isAuthenticated: true,
          isAdmin: roles.includes('ADMIN'),
          isVendeur: roles.includes('VENDEUR'),
          user: response.data.user,
          panierCount: 0
        });
        
        // Récupérer le panier si l'utilisateur est authentifié
        try {
          const panierResponse = await axios.get('http://localhost:8080/api/panier', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Calculer le nombre total d'articles dans le panier
          const panierCount = panierResponse.data.lignes?.reduce(
            (total, ligne) => total + ligne.quantite, 0
          ) || 0;
          
          setUserInfo(prev => ({
            ...prev,
            panierCount
          }));
        } catch (error) {
          console.log('Erreur lors du chargement du panier:', error);
        }
      } catch (error) {
        console.log('Erreur lors du chargement des infos utilisateur:', error);
        // En cas d'erreur d'authentification, déconnecter l'utilisateur
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };
    
    fetchUserInfo();
  }, [location.pathname]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo({
      isAuthenticated: false,
      isAdmin: false,
      isVendeur: false,
      user: null,
      panierCount: 0
    });
    navigate('/login');
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Menu de navigation pour mobiles
  const mobileMenu = (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List>
          {/* E-commerce (accessible à tous) */}
          <ListItem button component={Link} to="/produits">
            <ListItemIcon><InventoryIcon /></ListItemIcon>
            <ListItemText primary="Produits" />
          </ListItem>
          
          <ListItem button component={Link} to="/panier">
            <ListItemIcon>
              <Badge badgeContent={userInfo.panierCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Panier" />
          </ListItem>
          
          <Divider />
          
          {/* Administration (accessible aux admins) */}
          {(userInfo.isAdmin) && (
            <>
              <ListItem button component={Link} to="/users">
                <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
                <ListItemText primary="Utilisateurs" />
              </ListItem>
              
              <ListItem button component={Link} to="/roles">
                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                <ListItemText primary="Rôles" />
              </ListItem>
              
              <ListItem button component={Link} to="/permissions">
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText primary="Permissions" />
              </ListItem>
              
              <ListItem button component={Link} to="/historique">
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="Historique" />
              </ListItem>
              
              <Divider />
            </>
          )}
          
          {/* Gestion E-commerce (accessible aux admins et vendeurs) */}
          {(userInfo.isAdmin || userInfo.isVendeur) && (
            <>
              <ListItem button component={Link} to="/admin/produits">
                <ListItemIcon><InventoryIcon /></ListItemIcon>
                <ListItemText primary="Gestion Produits" />
              </ListItem>
              
              <ListItem button component={Link} to="/admin/categories">
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText primary="Gestion Catégories" />
              </ListItem>
              
              <ListItem button component={Link} to="/admin/commandes">
                <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                <ListItemText primary="Gestion Commandes" />
              </ListItem>
              
              <Divider />
            </>
          )}
          
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
  
  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            {mobileMenu}
          </>
        ) : null}
        
        <Typography
          variant="h6"
          component={Link}
          to="/produits"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          E-Commerce SPR
        </Typography>
        
        {/* Navigation desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* E-commerce (accessible uniquement au CLIENT) */}
            {userInfo.user?.roles?.includes('CLIENT') && (
              <>
                <Button color="inherit" component={Link} to="/produits">
                  Produits
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/panier"
                  startIcon={
                    <Badge badgeContent={userInfo.panierCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  }
                >
                  Panier
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/mes-commandes"
                  startIcon={<ReceiptIcon />}
                >
                  Mes Commandes
                </Button>
              </>
            )}
            
            {/* Administration (accessible aux admins) */}
            {userInfo.isAdmin && (
              <>
                <Button color="inherit" component={Link} to="/users">Utilisateurs</Button>
                <Button color="inherit" component={Link} to="/roles">Rôles</Button>
                <Button color="inherit" component={Link} to="/permissions">Permissions</Button>
                <Button color="inherit" component={Link} to="/historique">Historique</Button>
              </>
            )}
            
            {/* Gestion E-commerce (accessible aux admins et vendeurs) */}
            {(userInfo.isAdmin || userInfo.isVendeur) && (
              <Box>
                <Button 
                  color="inherit" 
                  aria-controls="admin-menu"
                  aria-haspopup="true"
                  onClick={handleUserMenuOpen}
                >
                  Administration
                </Button>
                <Menu
                  id="admin-menu"
                  anchorEl={userMenuAnchor}
                  keepMounted
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem component={Link} to="/admin/produits" onClick={handleUserMenuClose}>
                    Gestion Produits
                  </MenuItem>
                  <MenuItem component={Link} to="/admin/categories" onClick={handleUserMenuClose}>
                    Gestion Catégories
                  </MenuItem>
                  <MenuItem component={Link} to="/admin/commandes" onClick={handleUserMenuClose}>
                    Gestion Commandes
                  </MenuItem>
                </Menu>
              </Box>
            )}
            
            {/* Menu utilisateur */}
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}