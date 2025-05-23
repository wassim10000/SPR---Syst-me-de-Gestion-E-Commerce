import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, TextField,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip, Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function AdminProduits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' ou 'edit'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  
  // État du formulaire pour le produit
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    description: '',
    prix: '',
    stock: '',
    imageUrl: '',
    actif: true,
    categorieId: ''
  });
  
  // Charger les produits avec accès administrateur
  const fetchProduits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/produits/admin', {
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
  
  // Charger les catégories
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
  
  // Charger les données au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchProduits();
    };
    
    loadData();
  }, []);
  
  // Ouvrir la boîte de dialogue pour créer un produit
  const handleOpenCreateDialog = () => {
    setFormData({
      id: null,
      nom: '',
      description: '',
      prix: '',
      stock: '',
      imageUrl: '',
      actif: true,
      categorieId: ''
    });
    setDialogMode('create');
    setOpenDialog(true);
  };
  
  // Ouvrir la boîte de dialogue pour éditer un produit
  const handleOpenEditDialog = (produit) => {
    setFormData({
      id: produit.id,
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      stock: produit.stock,
      imageUrl: produit.imageUrl || '',
      actif: produit.actif,
      categorieId: produit.categorie ? produit.categorie.id : ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Ouvrir la confirmation de suppression
  const handleOpenDeleteConfirm = (produit) => {
    setSelectedProduit(produit);
    setDeleteConfirmOpen(true);
  };
  
  // Fermer la boîte de dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Fermer la confirmation de suppression
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedProduit(null);
  };
  
  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Pour les champs numériques, convertir en nombre
    if (name === 'prix') {
      const numValue = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, [name]: numValue });
    } else if (name === 'stock') {
      const intValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: intValue });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Convertir les valeurs numériques
      const produitData = {
        ...formData,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock, 10)
      };
      
      // Créer ou mettre à jour le produit
      if (dialogMode === 'create') {
        await axios.post(`http://localhost:8080/api/produits?categorieId=${produitData.categorieId}`, produitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:8080/api/produits/${produitData.id}?categorieId=${produitData.categorieId}`, produitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Fermer la boîte de dialogue et recharger les produits
      handleCloseDialog();
      fetchProduits();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du produit:', err);
      setError('Erreur lors de l\'enregistrement du produit');
    }
  };
  
  // Supprimer un produit
  const handleDeleteProduit = async () => {
    if (!selectedProduit) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/produits/${selectedProduit.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fermer la confirmation et recharger les produits
      handleCloseDeleteConfirm();
      fetchProduits();
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      setError('Erreur lors de la suppression du produit');
    }
  };
  
  // Activer/désactiver un produit
  const handleToggleActive = async (produit) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/produits/${produit.id}/active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger les produits
      fetchProduits();
    } catch (err) {
      console.error('Erreur lors de la modification du statut du produit:', err);
      setError('Erreur lors de la modification du statut du produit');
    }
  };
  
  // Formater le prix
  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Produits
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Ajouter un produit
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : produits.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Aucun produit disponible
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="right">Prix</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produits.map((produit) => (
                <TableRow key={produit.id}>
                  <TableCell>{produit.id}</TableCell>
                  <TableCell>
                    {produit.nom}
                    {produit.imageUrl && (
                      <Box component="img" 
                        src={produit.imageUrl} 
                        alt={produit.nom}
                        sx={{ width: 50, height: 50, objectFit: 'contain', mt: 1, display: 'block' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {produit.categorie ? (
                      <Chip label={produit.categorie.nom} size="small" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Non catégorisé
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{formatPrix(produit.prix)}</TableCell>
                  <TableCell align="right">
                    <Typography 
                      color={produit.stock > 0 ? "success.main" : "error.main"}
                    >
                      {produit.stock}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color={produit.actif ? "success" : "error"}
                      onClick={() => handleToggleActive(produit)}
                    >
                      {produit.actif ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(produit)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteConfirm(produit)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Boîte de dialogue pour créer/éditer un produit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Ajouter un produit' : 'Modifier le produit'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Nom du produit"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="categorieId"
                  value={formData.categorieId}
                  onChange={handleFormChange}
                  label="Catégorie"
                >
                  <MenuItem value="">Non catégorisé</MenuItem>
                  {categories.map((categorie) => (
                    <MenuItem key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Prix (€)"
                name="prix"
                value={formData.prix}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Stock"
                name="stock"
                value={formData.stock}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                type="number"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL de l'image"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.actif}
                    onChange={handleFormChange}
                    name="actif"
                    color="primary"
                  />
                }
                label="Produit actif (visible pour les clients)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.nom || !formData.prix || !formData.stock}
          >
            {dialogMode === 'create' ? 'Créer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le produit "{selectedProduit?.nom}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Annuler</Button>
          <Button onClick={handleDeleteProduit} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
