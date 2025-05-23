import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Chip, Stack } from '@mui/material';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [editPermission, setEditPermission] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', description: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchPermissions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des permissions:', err);
      setError('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleOpen = () => {
    setForm({ nom: '', description: '' });
    setFormError('');
    setFormSuccess('');
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/permissions', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormSuccess('Permission ajoutée avec succès !');
      fetchPermissions();
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la permission:', err);
      setFormError("Erreur lors de l'ajout de la permission");
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/permissions/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteSuccess('Permission supprimée avec succès !');
      setDeleteId(null);
      fetchPermissions();
    } catch (err) {
      console.error('Erreur lors de la suppression de la permission:', err);
      setDeleteError("Erreur lors de la suppression de la permission");
    }
  };

  const handleEditOpen = (permission) => {
    setEditPermission(permission);
    setEditForm({ 
      id: permission.id,
      nom: permission.nom, 
      description: permission.description || '',
      roles: permission.roles || []
    });
    setEditError('');
    setEditSuccess('');
  };
  
  const handleEditClose = () => setEditPermission(null);

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/permissions/${editPermission.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditSuccess('Permission modifiée avec succès !');
      fetchPermissions();
      setTimeout(() => {
        setEditPermission(null);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la modification de la permission:', err);
      setEditError("Erreur lors de la modification de la permission");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Permissions
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Ajouter une permission
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Rôles associés</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Aucune permission trouvée</TableCell>
                </TableRow>
              ) : (
                permissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.id}</TableCell>
                    <TableCell>{permission.nom}</TableCell>
                    <TableCell>{permission.description || '-'}</TableCell>
                    <TableCell>
                      {permission.roles && permission.roles.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {permission.roles.map(role => (
                            <Chip 
                              key={role.id} 
                              label={role.nom} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ m: 0.2 }}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Aucun rôle</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        sx={{ mr: 1 }} 
                        onClick={() => handleEditOpen(permission)}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => setDeleteId(permission.id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogue d'ajout */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajouter une permission</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
          <form onSubmit={handleSubmit} id="add-permission-form">
            <TextField
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button type="submit" form="add-permission-form" variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression */}
      {deleteId !== null && (
        <Dialog open={true} onClose={() => setDeleteId(null)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            {deleteSuccess && <Alert severity="success">{deleteSuccess}</Alert>}
            <Typography>Voulez-vous vraiment supprimer cette permission ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialogue de modification */}
      {editPermission && (
        <Dialog open={true} onClose={handleEditClose}>
          <DialogTitle>Modifier la permission</DialogTitle>
          <DialogContent>
            {editError && <Alert severity="error">{editError}</Alert>}
            {editSuccess && <Alert severity="success">{editSuccess}</Alert>}
            <form onSubmit={handleEditSubmit} id="edit-permission-form">
              <TextField
                label="Nom"
                name="nom"
                value={editForm.nom}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Description"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button type="submit" form="edit-permission-form" variant="contained">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}