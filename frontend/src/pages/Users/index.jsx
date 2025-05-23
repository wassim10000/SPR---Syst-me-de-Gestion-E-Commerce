import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', roleId: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', email: '', motDePasse: '', actif: true, roleId: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editRole, setEditRole] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchRoles();
    };
    fetchData();
  }, []);

  const handleOpen = () => {
    setForm({ nom: '', email: '', motDePasse: '', roleId: '' });
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
      
      // Créer l'utilisateur
      const userResponse = await axios.post('http://localhost:8080/api/auth/signup', {
        nom: form.nom,
        email: form.email,
        motDePasse: form.motDePasse
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Si un rôle est sélectionné, l'associer à l'utilisateur créé
      if (form.roleId) {
        await axios.post(`http://localhost:8080/api/users/${userResponse.data.id}/roles/${form.roleId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setFormSuccess('Utilisateur ajouté avec succès !');
      fetchUsers();
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      setFormError("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteSuccess('Utilisateur supprimé avec succès !');
      setDeleteId(null);
      fetchUsers();
    } catch {
      setDeleteError("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleEditOpen = (user) => {
    // Déterminer le roleId si l'utilisateur a un rôle (prendre le premier s'il en a plusieurs)
    const roleId = user.roles && user.roles.length > 0 ? 
      // Tenter de récupérer l'ID du rôle (si le frontend reçoit des objets rôles complets)
      (typeof user.roles[0] === 'object' && user.roles[0].id ? 
        user.roles[0].id : 
        // Sinon, chercher l'ID du rôle en fonction de son nom
        roles.find(r => r.nom === user.roles[0])?.id || '') :
      '';
    
    setEditUser(user);
    setEditForm({
      nom: user.nom,
      email: user.email,
      motDePasse: '',
      actif: user.actif,
      roleId: roleId
    });
    setEditError('');
    setEditSuccess('');
  };
  const handleEditClose = () => setEditUser(null);

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      
      // Mettre à jour les informations de base de l'utilisateur
      await axios.put(`http://localhost:8080/api/users/${editUser.id}`, {
        nom: editForm.nom,
        email: editForm.email,
        motDePasse: editForm.motDePasse,
        actif: editForm.actif
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Récupérer les informations actuelles de l'utilisateur
      const userResponse = await axios.get(`http://localhost:8080/api/users/${editUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const currentRoles = userResponse.data.roles;
      const currentRoleNames = Array.isArray(currentRoles) ? currentRoles : [];
      
      // Déterminer si on doit ajouter ou supprimer un rôle
      // Pour simplifier, on suppose qu'un utilisateur n'a qu'un seul rôle à la fois
      
      // Si un rôle est sélectionné dans le formulaire d'édition
      if (editForm.roleId) {
        const selectedRoleName = roles.find(r => r.id === Number(editForm.roleId))?.nom;
        
        // Si l'utilisateur n'a pas ce rôle, l'ajouter
        if (!currentRoleNames.includes(selectedRoleName)) {
          // Supprimer d'abord les rôles existants si nécessaire
          if (currentRoleNames.length > 0) {
            for (const roleName of currentRoleNames) {
              const roleToRemove = roles.find(r => r.nom === roleName);
              if (roleToRemove) {
                await axios.delete(`http://localhost:8080/api/users/${editUser.id}/roles/${roleToRemove.id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
            }
          }
          
          // Ajouter le nouveau rôle
          await axios.post(`http://localhost:8080/api/users/${editUser.id}/roles/${editForm.roleId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } else {
        // Si aucun rôle n'est sélectionné mais que l'utilisateur en a, les supprimer
        if (currentRoleNames.length > 0) {
          for (const roleName of currentRoleNames) {
            const roleToRemove = roles.find(r => r.nom === roleName);
            if (roleToRemove) {
              await axios.delete(`http://localhost:8080/api/users/${editUser.id}/roles/${roleToRemove.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          }
        }
      }
      
      setEditSuccess('Utilisateur modifié avec succès !');
      fetchUsers();
      setTimeout(() => {
        setEditUser(null);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la modification de l\'utilisateur:', err);
      setEditError("Erreur lors de la modification de l'utilisateur");
    }
  };

  const handleToggleActif = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/users/${id}/toggle-actif`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch {
      alert("Erreur lors du changement d'état de l'utilisateur");
    }
  };

  const handleEditRoleChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditRoleSubmit = async e => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/roles/${editRole.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditSuccess('Rôle modifié avec succès !');
      fetchUsers();
      setTimeout(() => {
        setEditRole(null);
      }, 1000);
    } catch {
      setEditError("Erreur lors de la modification du rôle");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Utilisateurs</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôles</TableCell>
              <TableCell>Actif</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.nom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles && Array.isArray(user.roles) ? user.roles.join(', ') : ''}</TableCell>
                <TableCell>
                  {user.actif ? 'Oui' : 'Non'}
                  <Button size="small" variant="text" color={user.actif ? 'warning' : 'success'} sx={{ ml: 1 }} onClick={() => handleToggleActif(user.id)}>
                    {user.actif ? 'Désactiver' : 'Activer'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleEditOpen(user)}>Éditer</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => setDeleteId(user.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleOpen}>Ajouter un utilisateur</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajouter un utilisateur</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error">{formError}</Alert>}
          {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
          <form onSubmit={handleSubmit} id="add-user-form">
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
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={form.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Rôle</InputLabel>
              <Select
                labelId="role-select-label"
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                label="Rôle"
              >
                <MenuItem value=""><em>Aucun</em></MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button type="submit" form="add-user-form" variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
      {deleteId !== null && (
        <Dialog open={true} onClose={() => setDeleteId(null)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            {deleteSuccess && <Alert severity="success">{deleteSuccess}</Alert>}
            <Typography>Voulez-vous vraiment supprimer cet utilisateur ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
          </DialogActions>
        </Dialog>
      )}
      {editUser && (
        <Dialog open={true} onClose={handleEditClose}>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogContent>
            {editError && <Alert severity="error">{editError}</Alert>}
            {editSuccess && <Alert severity="success">{editSuccess}</Alert>}
            <form onSubmit={handleEditSubmit} id="edit-user-form">
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
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Mot de passe (laisser vide pour ne pas changer)"
                name="motDePasse"
                type="password"
                value={editForm.motDePasse}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-role-select-label">Rôle</InputLabel>
                <Select
                  labelId="edit-role-select-label"
                  name="roleId"
                  value={editForm.roleId}
                  onChange={handleEditChange}
                  label="Rôle"
                >
                  <MenuItem value=""><em>Aucun</em></MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>{role.nom}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button type="submit" form="edit-user-form" variant="contained">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      )}
      {editRole && (
        <Dialog open={true} onClose={() => setEditRole(null)}>
          <DialogTitle>Modifier le rôle</DialogTitle>
          <DialogContent>
            {editError && <Alert severity="error">{editError}</Alert>}
            {editSuccess && <Alert severity="success">{editSuccess}</Alert>}
            <form onSubmit={handleEditRoleSubmit} id="edit-role-form">
              <TextField
                label="Nom"
                name="nom"
                value={editForm.nom}
                onChange={handleEditRoleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Description"
                name="description"
                value={editForm.description}
                onChange={handleEditRoleChange}
                fullWidth
                margin="normal"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditRole(null)}>Annuler</Button>
            <Button type="submit" form="edit-role-form" variant="contained">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
} 