import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Container, Grid, Card, CardMedia, CardContent, CardActions,
  Typography, Button, Chip, CircularProgress, Alert, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

export default function Produits() {
  const navigate = useNavigate();
  const [userChecked, setUserChecked] = useState(false);
  
  // Vérifier si l'utilisateur a le rôle CLIENT
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        const response = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const roles = response.data.user?.roles || [];
        if (!roles.includes('CLIENT')) {
          navigate('/');
        }
        
        setUserChecked(true);
      } catch (err) {
        console.error('Erreur lors de la vérification du rôle:', err);
        navigate('/');
      }
    };
    
    checkUserRole();
  }, [navigate]);
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  
  
  // Fonction pour charger les produits
  const fetchProduits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/produits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduits(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour charger les catégories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };
  
  // Charger les données au chargement du composant, mais seulement après vérification du rôle
  useEffect(() => {
    if (userChecked) {
      const loadData = async () => {
        await fetchCategories();
        await fetchProduits();
      };
      
      loadData();
    }
  }, [userChecked]);
  
  // Fonction de recherche
  const handleSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/produits/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduits(response.data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de filtrage par catégorie
  const handleCategorieFilter = async (categorieId) => {
    setCategorieFilter(categorieId);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8080/api/produits';
      
      if (categorieId) {
        url = `http://localhost:8080/api/produits/categorie/${categorieId}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduits(response.data);
    } catch (err) {
      console.error('Erreur lors du filtrage par catégorie:', err);
      setError('Erreur lors du filtrage');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour ajouter un produit au panier
  const ajouterAuPanier = async (produitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/panier/produits/${produitId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Afficher une confirmation ou rediriger vers le panier
      navigate('/panier');
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier:', err);
      setError('Erreur lors de l\'ajout au panier');
    }
  };
  
  // Formater le prix
  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nos Produits
      </Typography>
      
      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField 
          label="Rechercher un produit"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          Rechercher
        </Button>
        
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={categorieFilter}
            label="Catégorie"
            onChange={(e) => handleCategorieFilter(e.target.value)}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {categories.map((categorie) => (
              <MenuItem key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : produits.length === 0 ? (
        <Alert severity="info">Aucun produit disponible.</Alert>
      ) : (
        <Grid container spacing={4}>
          {produits.map((produit) => (
            <Grid item key={produit.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: 'contain', p: 2 }}
                  image={produit.imageUrl || 'https://via.placeholder.com/300x200?text=Produit'}
                  alt={produit.nom}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {produit.nom}
                  </Typography>
                  
                  {produit.categorie && (
                    <Chip 
                      label={produit.categorie.nom} 
                      size="small" 
                      sx={{ mb: 1 }} 
                    />
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    {produit.description}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {formatPrix(produit.prix)}
                  </Typography>
                  
                  <Typography variant="caption" color={produit.stock > 0 ? "success.main" : "error.main"}>
                    {produit.stock > 0 ? `En stock: ${produit.stock}` : 'Rupture de stock'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<ShoppingCartIcon />}
                    disabled={produit.stock <= 0}
                    onClick={() => ajouterAuPanier(produit.id)}
                    fullWidth
                  >
                    Ajouter au panier
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
