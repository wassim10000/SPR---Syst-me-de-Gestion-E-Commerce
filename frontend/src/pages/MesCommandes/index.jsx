import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, 
  Alert, Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';

export default function MesCommandes() {
  const navigate = useNavigate();
  const [userChecked, setUserChecked] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
  
  // Charger les commandes de l'utilisateur, mais seulement après vérification du rôle
  useEffect(() => {
    if (userChecked) {
      const fetchCommandes = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          // Utilise l'endpoint qui retourne uniquement les commandes de l'utilisateur connecté
          const response = await axios.get('http://localhost:8080/api/commandes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCommandes(response.data);
        } catch (err) {
          console.error('Erreur lors du chargement des commandes:', err);
          setError('Impossible de charger vos commandes');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCommandes();
    }
  }, [userChecked]);
  
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
  
  // Obtenir la couleur du statut
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'warning';
      case 'CONFIRMEE':
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
  
  // Traduire le statut
  const translateStatus = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'CONFIRMEE':
        return 'Confirmée';
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ReceiptIcon sx={{ mr: 2, fontSize: 30 }} />
        <Typography variant="h4" component="h1">
          Mes Commandes
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : commandes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Vous n'avez pas encore passé de commande
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
          {commandes.map((commande) => (
            <Accordion key={commande.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Commande #{commande.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(commande.dateCommande)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={translateStatus(commande.statut)} 
                      color={getStatusColor(commande.statut)}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatPrix(commande.total)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Détails de la commande
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Produit</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commande.lignes.map((ligne) => (
                        <TableRow key={ligne.id}>
                          <TableCell component="th" scope="row">
                            {ligne.produit?.nom || 'Produit indisponible'}
                          </TableCell>
                          <TableCell align="right">{formatPrix(ligne.prix)}</TableCell>
                          <TableCell align="right">{ligne.quantite}</TableCell>
                          <TableCell align="right">{formatPrix(ligne.prix * ligne.quantite)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatPrix(commande.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Adresse de livraison
                  </Typography>
                  <Typography variant="body2">
                    {typeof commande.adresseLivraison === 'object' && commande.adresseLivraison !== null
                      ? (
                          <>
                            {commande.adresseLivraison.nom} {commande.adresseLivraison.prenom}<br />
                            {commande.adresseLivraison.adresse}<br />
                            {commande.adresseLivraison.codePostal} {commande.adresseLivraison.ville}<br />
                            {commande.adresseLivraison.pays}
                            {commande.adresseLivraison.telephone && (<><br />Tél: {commande.adresseLivraison.telephone}</>)}
                            {commande.adresseLivraison.informationsComplementaires && (
                              <>
                                <br />
                                <em>Info: {commande.adresseLivraison.informationsComplementaires}</em>
                              </>
                            )}
                          </>
                        )
                      : (commande.adresseLivraison || 'Non spécifiée')
                    }
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Suivi de commande
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Statut actuel: <Chip 
                      label={translateStatus(commande.statut)} 
                      color={getStatusColor(commande.statut)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  {commande.dateExpedition && (
                    <Typography variant="body2" color="text.secondary">
                      Date d'expédition: {formatDate(commande.dateExpedition)}
                    </Typography>
                  )}
                  {commande.dateLivraison && (
                    <Typography variant="body2" color="text.secondary">
                      Date de livraison: {formatDate(commande.dateLivraison)}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}
