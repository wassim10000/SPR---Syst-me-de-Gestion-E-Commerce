import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, TextField,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' ou 'edit'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  
  // État du formulaire pour la catégorie
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    description: ''
  });
  
  // Charger les catégories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les catégories au chargement du composant
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Ouvrir la boîte de dialogue pour créer une catégorie
  const handleOpenCreateDialog = () => {
    setFormData({
      id: null,
      nom: '',
      description: ''
    });
    setDialogMode('create');
    setOpenDialog(true);
  };
  
  // Ouvrir la boîte de dialogue pour éditer une catégorie
  const handleOpenEditDialog = (categorie) => {
    setFormData({
      id: categorie.id,
      nom: categorie.nom,
      description: categorie.description || ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Ouvrir la confirmation de suppression
  const handleOpenDeleteConfirm = (categorie) => {
    setSelectedCategorie(categorie);
    setDeleteConfirmOpen(true);
  };
  
  // Fermer la boîte de dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Fermer la confirmation de suppression
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedCategorie(null);
  };
  
  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Créer ou mettre à jour la catégorie
      if (dialogMode === 'create') {
        await axios.post('http://localhost:8080/api/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:8080/api/categories/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Fermer la boîte de dialogue et recharger les catégories
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la catégorie:', err);
      setError('Erreur lors de l\'enregistrement de la catégorie');
    }
  };
  
  // Supprimer une catégorie
  const handleDeleteCategorie = async () => {
    if (!selectedCategorie) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/categories/${selectedCategorie.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fermer la confirmation et recharger les catégories
      handleCloseDeleteConfirm();
      fetchCategories();
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Erreur lors de la suppression de la catégorie');
      }
      handleCloseDeleteConfirm();
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Catégories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Ajouter une catégorie
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Aucune catégorie disponible
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Nombre de produits</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((categorie) => (
                <TableRow key={categorie.id}>
                  <TableCell>{categorie.id}</TableCell>
                  <TableCell>{categorie.nom}</TableCell>
                  <TableCell>{categorie.description}</TableCell>
                  <TableCell>{categorie.produits ? categorie.produits.length : 0}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(categorie)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteConfirm(categorie)}
                      disabled={categorie.produits && categorie.produits.length > 0}
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
      
      {/* Boîte de dialogue pour créer/éditer une catégorie */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Ajouter une catégorie' : 'Modifier la catégorie'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                label="Nom de la catégorie"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.nom}
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
            Êtes-vous sûr de vouloir supprimer la catégorie "{selectedCategorie?.nom}" ?
            Cette action est irréversible.
          </Typography>
          {selectedCategorie && selectedCategorie.produits && selectedCategorie.produits.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cette catégorie contient {selectedCategorie.produits.length} produit(s).
              Veuillez d'abord supprimer ou déplacer ces produits.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Annuler</Button>
          <Button 
            onClick={handleDeleteCategorie} 
            variant="contained" 
            color="error"
            disabled={selectedCategorie && selectedCategorie.produits && selectedCategorie.produits.length > 0}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
