import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Container, Typography, Paper, Stepper, Step, StepLabel,
  Button, CircularProgress, Alert, Grid, TextField, FormControl,
  InputLabel, Select, MenuItem, Divider, Card, CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Étapes du processus de commande
const steps = ['Informations de livraison', 'Méthode de paiement', 'Récapitulatif'];

export default function Commande() {
  const [activeStep, setActiveStep] = useState(0);
  const [panier, setPanier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commandeId, setCommandeId] = useState(null);
  
  // Informations de livraison
  const [adresseLivraison, setAdresseLivraison] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    telephone: '',
    informationsComplementaires: ''
  });
  
  // Informations de paiement
  const [informationPaiement, setInformationPaiement] = useState({
    methode: 'CARTE_CREDIT',
    referenceTransaction: '',
    datePaiement: null,
    statut: 'EN_ATTENTE'
  });
  
  const navigate = useNavigate();
  
  // Charger le panier
  const fetchPanier = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/panier', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPanier(response.data);
      
      // Rediriger vers la page du panier si le panier est vide
      if (!response.data.lignes || response.data.lignes.length === 0) {
        navigate('/panier');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du panier:', err);
      setError('Impossible de charger le panier');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger le panier au montage du composant
  useEffect(() => {
    fetchPanier();
  }, [navigate]);
  
  // Gestion des changements dans le formulaire d'adresse
  const handleAdresseChange = (e) => {
    const { name, value } = e.target;
    setAdresseLivraison((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gestion des changements dans le formulaire de paiement
  const handlePaiementChange = (e) => {
    const { name, value } = e.target;
    setInformationPaiement((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validation du formulaire d'adresse
  const isAdresseValid = () => {
    const { nom, prenom, adresse, ville, codePostal, pays } = adresseLivraison;
    return nom && prenom && adresse && ville && codePostal && pays;
  };
  
  // Validation du formulaire de paiement
  const isPaiementValid = () => {
    // Pour simplifier, on considère que le paiement est valide dès qu'une méthode est sélectionnée
    return informationPaiement.methode;
  };
  
  // Passer à l'étape suivante
  const handleNext = () => {
    if (activeStep === 0 && !isAdresseValid()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (activeStep === 1 && !isPaiementValid()) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      // Dernière étape, on finalise la commande
      handlePlaceOrder();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    }
  };
  
  // Revenir à l'étape précédente
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };
  
  // Finaliser la commande
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/commandes', {
        adresseLivraison,
        informationPaiement
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCommandeId(response.data.id);
      setActiveStep(steps.length); // Afficher la confirmation
    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      setError('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Retour à la boutique
  const handleReturnToShop = () => {
    navigate('/produits');
  };
  
  // Formater le prix
  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix);
  };
  
  // Afficher le contenu en fonction de l'étape active
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="nom"
                name="nom"
                label="Nom"
                fullWidth
                variant="outlined"
                value={adresseLivraison.nom}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="prenom"
                name="prenom"
                label="Prénom"
                fullWidth
                variant="outlined"
                value={adresseLivraison.prenom}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="adresse"
                name="adresse"
                label="Adresse"
                fullWidth
                variant="outlined"
                value={adresseLivraison.adresse}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="ville"
                name="ville"
                label="Ville"
                fullWidth
                variant="outlined"
                value={adresseLivraison.ville}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="codePostal"
                name="codePostal"
                label="Code postal"
                fullWidth
                variant="outlined"
                value={adresseLivraison.codePostal}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="pays-label">Pays</InputLabel>
                <Select
                  labelId="pays-label"
                  id="pays"
                  name="pays"
                  value={adresseLivraison.pays}
                  label="Pays"
                  onChange={handleAdresseChange}
                >
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Belgique">Belgique</MenuItem>
                  <MenuItem value="Suisse">Suisse</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="telephone"
                name="telephone"
                label="Téléphone"
                fullWidth
                variant="outlined"
                value={adresseLivraison.telephone}
                onChange={handleAdresseChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="informationsComplementaires"
                name="informationsComplementaires"
                label="Informations complémentaires"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={adresseLivraison.informationsComplementaires}
                onChange={handleAdresseChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="methode-paiement-label">Méthode de paiement</InputLabel>
                <Select
                  labelId="methode-paiement-label"
                  id="methode"
                  name="methode"
                  value={informationPaiement.methode}
                  label="Méthode de paiement"
                  onChange={handlePaiementChange}
                >
                  <MenuItem value="CARTE_CREDIT">Carte de crédit</MenuItem>
                  <MenuItem value="PAYPAL">PayPal</MenuItem>
                  <MenuItem value="VIREMENT_BANCAIRE">Virement bancaire</MenuItem>
                  <MenuItem value="PAIEMENT_A_LA_LIVRAISON">Paiement à la livraison</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {informationPaiement.methode === 'CARTE_CREDIT' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    required
                    id="numero-carte"
                    label="Numéro de carte"
                    fullWidth
                    variant="outlined"
                    placeholder="**** **** **** ****"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="date-expiration"
                    label="Date d'expiration"
                    fullWidth
                    variant="outlined"
                    placeholder="MM/AA"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="cvv"
                    label="CVV"
                    fullWidth
                    variant="outlined"
                    placeholder="***"
                  />
                </Grid>
              </>
            )}
            
            {informationPaiement.methode === 'PAYPAL' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Vous serez redirigé vers PayPal pour finaliser votre paiement.
                </Alert>
              </Grid>
            )}
            
            {informationPaiement.methode === 'VIREMENT_BANCAIRE' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Les informations pour le virement bancaire vous seront communiquées après validation de votre commande.
                </Alert>
              </Grid>
            )}
            
            {informationPaiement.methode === 'PAIEMENT_A_LA_LIVRAISON' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Vous paierez le montant total à la livraison de votre commande.
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Récapitulatif de commande
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Adresse de livraison
              </Typography>
              <Typography variant="body2">
                {adresseLivraison.prenom} {adresseLivraison.nom}
              </Typography>
              <Typography variant="body2">
                {adresseLivraison.adresse}
              </Typography>
              <Typography variant="body2">
                {adresseLivraison.codePostal} {adresseLivraison.ville}
              </Typography>
              <Typography variant="body2">
                {adresseLivraison.pays}
              </Typography>
              {adresseLivraison.telephone && (
                <Typography variant="body2">
                  Tél: {adresseLivraison.telephone}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Méthode de paiement
              </Typography>
              <Typography variant="body2">
                {informationPaiement.methode === 'CARTE_CREDIT' && 'Carte de crédit'}
                {informationPaiement.methode === 'PAYPAL' && 'PayPal'}
                {informationPaiement.methode === 'VIREMENT_BANCAIRE' && 'Virement bancaire'}
                {informationPaiement.methode === 'PAIEMENT_A_LA_LIVRAISON' && 'Paiement à la livraison'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Articles
              </Typography>
              
              {panier && panier.lignes && panier.lignes.map((ligne) => (
                <Box key={ligne.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {ligne.produit.nom} x {ligne.quantite}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatPrix(ligne.sousTotal)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {panier && formatPrix(panier.total)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom>
              Merci pour votre commande!
            </Typography>
            <Typography variant="subtitle1">
              Votre commande a été enregistrée avec le numéro #{commandeId}.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Vous recevrez un email de confirmation avec les détails de votre commande.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleReturnToShop}
              sx={{ mt: 3 }}
            >
              Retour à la boutique
            </Button>
          </Box>
        );
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Finaliser ma commande
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading && activeStep !== steps.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box>
            {getStepContent(activeStep)}
            
            {activeStep < steps.length && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Retour
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Confirmer la commande' : 'Suivant'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
}
