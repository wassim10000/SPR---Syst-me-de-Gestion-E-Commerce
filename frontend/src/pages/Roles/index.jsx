import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, FormGroup, FormControlLabel, Checkbox, Grid, Divider } from '@mui/material';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, nom: '', description: '', permissions: [] });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
      setError('Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des permissions:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchRoles();
      await fetchPermissions();
    };
    fetchData();
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
      await axios.post('http://localhost:8080/api/roles', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormSuccess('Rôle ajouté avec succès !');
      fetchRoles();
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du rôle:', err);
      setFormError("Erreur lors de l'ajout du rôle");
    }
  };

  const handleOpenEdit = (role) => {
    // Préparer les permissions du rôle (transformer en array d'IDs)
    const selectedPermissions = (role.permissions || []).map(p => p.id);

    setEditForm({
      id: role.id,
      nom: role.nom,
      description: role.description || '',
      permissions: selectedPermissions
    });
    setEditError('');
    setEditSuccess('');
    setEditOpen(true);
  };

  const handleCloseEdit = () => setEditOpen(false);

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (permissionId) => {
    setEditForm(prev => {
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(permissionId);
      if (index > -1) {
        permissions.splice(index, 1); // Retirer la permission si déjà présente
      } else {
        permissions.push(permissionId); // Ajouter la permission
      }
      return { ...prev, permissions };
    });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      const { id, nom, description } = editForm;

      // Mettre à jour les informations de base du rôle
      await axios.put(`http://localhost:8080/api/roles/${id}`, { nom, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Récupérer les permissions actuelles du rôle
      const roleResponse = await axios.get(`http://localhost:8080/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentPermissions = roleResponse.data.permissions.map(p => p.id);

      // Déterminer les permissions à ajouter et à supprimer
      const permissionsToAdd = editForm.permissions.filter(p => !currentPermissions.includes(p));
      const permissionsToRemove = currentPermissions.filter(p => !editForm.permissions.includes(p));

      // Ajouter les nouvelles permissions
      for (const permId of permissionsToAdd) {
        await axios.post(`http://localhost:8080/api/roles/${id}/permissions/${permId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Supprimer les permissions non sélectionnées
      for (const permId of permissionsToRemove) {
        await axios.delete(`http://localhost:8080/api/roles/${id}/permissions/${permId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setEditSuccess('Rôle modifié avec succès !');
      fetchRoles();
      setTimeout(() => {
        setEditOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la modification du rôle:', err);
      setEditError("Erreur lors de la modification du rôle");
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteError('');
    setDeleteSuccess('');
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/roles/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteSuccess('Rôle supprimé avec succès !');
      fetchRoles();
      setTimeout(() => {
        handleCloseDelete();
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la suppression du rôle:', err);
      setDeleteError("Erreur lors de la suppression du rôle");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des Rôles</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>Ajouter un rôle</Button>
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
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Aucun rôle trouvé</TableCell>
                </TableRow>
              ) : (
                roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.nom}</TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      {role.permissions && Array.isArray(role.permissions)
                        ? role.permissions.map(p => p.nom).join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenEdit(role)}>
                        Éditer
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenDelete(role.id)}>
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un rôle</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
          <form onSubmit={handleSubmit} id="add-role-form">
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
          <Button type="submit" form="add-role-form" variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'édition */}
      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le rôle</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}
          <form onSubmit={handleEditSubmit} id="edit-role-form">
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

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Permissions</Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {permissions.map((permission) => (
                <Grid item xs={12} sm={6} md={4} key={permission.id}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editForm.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                        />
                      }
                      label={`${permission.nom}${permission.description ? ` - ${permission.description}` : ''}`}
                    />
                  </FormGroup>
                </Grid>
              ))}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Annuler</Button>
          <Button type="submit" form="edit-role-form" variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression */}
      <Dialog open={deleteOpen} onClose={handleCloseDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}
          <Typography>Êtes-vous sûr de vouloir supprimer ce rôle ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}