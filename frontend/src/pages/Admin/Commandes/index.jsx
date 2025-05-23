import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, 
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [statutFilter, setStatutFilter] = useState('');
  
  const navigate = useNavigate();
  
  // Charger les commandes
  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8080/api/commandes/all';
      
      if (statutFilter) {
        url = `http://localhost:8080/api/commandes/statut/${statutFilter}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommandes(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les commandes au chargement du composant
  useEffect(() => {
    fetchCommandes();
  }, [statutFilter]);
  
  // Ouvrir les détails d'une commande
  const handleOpenDetails = (commande) => {
    setSelectedCommande(commande);
    setDetailsOpen(true);
  };
  
  // Fermer les détails
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Mettre à jour le statut d'une commande
  const handleUpdateStatut = async (commandeId, nouveauStatut) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/commandes/${commandeId}/statut?statut=${nouveauStatut}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger les commandes
      fetchCommandes();
      
      // Si les détails sont ouverts, mettre à jour la commande sélectionnée
      if (detailsOpen && selectedCommande && selectedCommande.id === commandeId) {
        const response = await axios.get(`http://localhost:8080/api/commandes/${commandeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedCommande(response.data);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };
  
  // Formater le prix
  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir la couleur en fonction du statut
  const getStatutColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'warning';
      case 'PAYEE':
        return 'info';
      case 'EN_PREPARATION':
        return 'secondary';
      case 'EXPEDIEE':
        return 'primary';
      case 'LIVREE':
        return 'success';
      case 'ANNULEE':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Obtenir le libellé du statut
  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'PAYEE':
        return 'Payée';
      case 'EN_PREPARATION':
        return 'En préparation';
      case 'EXPEDIEE':
        return 'Expédiée';
      case 'LIVREE':
        return 'Livrée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return statut;
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Commandes
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={statutFilter}
            label="Filtrer par statut"
            onChange={(e) => setStatutFilter(e.target.value)}
          >
            <MenuItem value="">Toutes les commandes</MenuItem>
            <MenuItem value="EN_ATTENTE">En attente</MenuItem>
            <MenuItem value="PAYEE">Payée</MenuItem>
            <MenuItem value="EN_PREPARATION">En préparation</MenuItem>
            <MenuItem value="EXPEDIEE">Expédiée</MenuItem>
            <MenuItem value="LIVREE">Livrée</MenuItem>
            <MenuItem value="ANNULEE">Annulée</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : commandes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Aucune commande disponible
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commandes.map((commande) => (
                <TableRow key={commande.id}>
                  <TableCell>{commande.id}</TableCell>
                  <TableCell>
                    {commande.user.nom}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {commande.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(commande.dateCommande)}</TableCell>
                  <TableCell align="right">{formatPrix(commande.total)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatutLabel(commande.statut)}
                      color={getStatutColor(commande.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDetails(commande)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Boîte de dialogue des détails de la commande */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedCommande && (
          <>
            <DialogTitle>
              Détails de la commande #{selectedCommande.id}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Informations client
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nom:</strong> {selectedCommande.user.nom}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedCommande.user.email}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Adresse de livraison
                  </Typography>
                  <Typography variant="body2">
                    {selectedCommande.adresseLivraison.prenom} {selectedCommande.adresseLivraison.nom}
                  </Typography>
                  <Typography variant="body2">
                    {selectedCommande.adresseLivraison.adresse}
                  </Typography>
                  <Typography variant="body2">
                    {selectedCommande.adresseLivraison.codePostal} {selectedCommande.adresseLivraison.ville}
                  </Typography>
                  <Typography variant="body2">
                    {selectedCommande.adresseLivraison.pays}
                  </Typography>
                  {selectedCommande.adresseLivraison.telephone && (
                    <Typography variant="body2">
                      Tél: {selectedCommande.adresseLivraison.telephone}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Détails de la commande
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDate(selectedCommande.dateCommande)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Statut:</strong>{' '}
                    <Chip
                      label={getStatutLabel(selectedCommande.statut)}
                      color={getStatutColor(selectedCommande.statut)}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Méthode de paiement:</strong>{' '}
                    {selectedCommande.informationPaiement.methode === 'CARTE_CREDIT' && 'Carte de crédit'}
                    {selectedCommande.informationPaiement.methode === 'PAYPAL' && 'PayPal'}
                    {selectedCommande.informationPaiement.methode === 'VIREMENT_BANCAIRE' && 'Virement bancaire'}
                    {selectedCommande.informationPaiement.methode === 'PAIEMENT_A_LA_LIVRAISON' && 'Paiement à la livraison'}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Mettre à jour le statut
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Nouveau statut</InputLabel>
                    <Select
                      value={selectedCommande.statut}
                      label="Nouveau statut"
                      onChange={(e) => handleUpdateStatut(selectedCommande.id, e.target.value)}
                    >
                      <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                      <MenuItem value="PAYEE">Payée</MenuItem>
                      <MenuItem value="EN_PREPARATION">En préparation</MenuItem>
                      <MenuItem value="EXPEDIEE">Expédiée</MenuItem>
                      <MenuItem value="LIVREE">Livrée</MenuItem>
                      <MenuItem value="ANNULEE">Annulée</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Articles commandés
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produit</TableCell>
                          <TableCell align="right">Prix unitaire</TableCell>
                          <TableCell align="right">Quantité</TableCell>
                          <TableCell align="right">Sous-total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCommande.lignes.map((ligne) => (
                          <TableRow key={ligne.id}>
                            <TableCell>{ligne.produit.nom}</TableCell>
                            <TableCell align="right">{formatPrix(ligne.prix)}</TableCell>
                            <TableCell align="right">{ligne.quantite}</TableCell>
                            <TableCell align="right">{formatPrix(ligne.sousTotal)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle2">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {formatPrix(selectedCommande.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
