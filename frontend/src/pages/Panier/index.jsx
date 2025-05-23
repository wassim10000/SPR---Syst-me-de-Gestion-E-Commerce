import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Container, Grid, Typography, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useNavigate } from 'react-router-dom';

export default function Panier() {
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
  const [panier, setPanier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  // Charger le panier
  const fetchPanier = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/panier', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPanier(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement du panier:', err);
      setError('Impossible de charger le panier');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger le panier au montage du composant, mais seulement après vérification du rôle
  useEffect(() => {
    if (userChecked) {
      fetchPanier();
    }
  }, [userChecked]);
  
  // Mettre à jour la quantité d'un produit
  const handleQuantityChange = async (produitId, quantite) => {
    try {
      if (quantite <= 0) return;
      
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/panier/produits/${produitId}`, null, {
        params: { quantite },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger le panier
      fetchPanier();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la quantité:', err);
      setError('Erreur lors de la mise à jour de la quantité');
    }
  };
  
  // Supprimer un produit du panier
  const handleRemoveProduct = async (produitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/panier/produits/${produitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger le panier
      fetchPanier();
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      setError('Erreur lors de la suppression du produit');
    }
  };
  
  // Vider complètement le panier
  const handleEmptyCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8080/api/panier', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger le panier
      fetchPanier();
    } catch (err) {
      console.error('Erreur lors du vidage du panier:', err);
      setError('Erreur lors du vidage du panier');
    }
  };
  
  // Continuer vers la page de commande
  const handleCheckout = () => {
    navigate('/commande');
  };
  
  // Formater le prix
  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
  };
  
  // Vérifier si le panier est vide
  const isPanierVide = !panier || !panier.lignes || panier.lignes.length === 0;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mon Panier
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : isPanierVide ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Votre panier est vide
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/produits')}
            sx={{ mt: 2 }}
          >
            Découvrir nos produits
          </Button>
        </Paper>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Sous-total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {panier.lignes.map((ligne) => (
                  <TableRow key={ligne.id}>
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle1">
                        {ligne.produit.nom}
                      </Typography>
                      {ligne.produit.categorie && (
                        <Typography variant="caption" color="text.secondary">
                          {ligne.produit.categorie.nom}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatPrix(ligne.prix)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(ligne.produit.id, ligne.quantite - 1)}
                          disabled={ligne.quantite <= 1}
                        >
                          -
                        </IconButton>
                        <TextField
                          type="number"
                          value={ligne.quantite}
                          onChange={(e) => handleQuantityChange(ligne.produit.id, parseInt(e.target.value, 10))}
                          inputProps={{ min: 1, max: ligne.produit.stock }}
                          sx={{ width: '60px', mx: 1 }}
                          size="small"
                        />
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(ligne.produit.id, ligne.quantite + 1)}
                          disabled={ligne.quantite >= ligne.produit.stock}
                        >
                          +
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrix(ligne.sousTotal)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="error"
                        onClick={() => handleRemoveProduct(ligne.produit.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatPrix(panier.total)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleEmptyCart}
              >
                Vider le panier
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCheckout}
                startIcon={<ShoppingCartCheckoutIcon />}
              >
                Passer la commande
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}
