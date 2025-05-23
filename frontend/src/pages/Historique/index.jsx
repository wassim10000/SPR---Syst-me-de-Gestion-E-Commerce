import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, CircularProgress, Box, Chip, Tooltip, IconButton,
  Card, CardContent, Alert
} from '@mui/material';
// Utiliser une solution alternative sans date-fns pour le formatage des dates
const formatDateOptions = { 
  day: '2-digit',
  month: 'long', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
};

export default function Historique() {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({ isAdmin: false, isRH: false });
  
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      // On suppose que cette API retourne les informations de l'utilisateur connecté, y compris ses rôles
      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const roles = response.data.roles || [];
      setUserInfo({
        isAdmin: roles.includes('ADMIN'),
        isRH: roles.includes('RH')
      });
      
    } catch (err) {
      console.error('Erreur lors de la récupération des informations de l\'utilisateur:', err);
    }
  };
  
  const fetchHistoriques = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/historique', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHistoriques(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des historiques:', err);
      setError("Erreur lors de la récupération des historiques");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const initialize = async () => {
      await fetchUserInfo();
      await fetchHistoriques();
    };
    
    initialize();
  }, []);
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', formatDateOptions).format(date);
    } catch (err) {
      console.error('Erreur de formatage de date:', err);
      return dateString;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Historique des actions
      </Typography>
      
      {userInfo.isAdmin || userInfo.isRH ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          En tant qu'administrateur ou RH, vous pouvez voir l'historique de tous les utilisateurs.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Vous ne pouvez voir que votre propre historique d'actions.
        </Alert>
      )}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : historiques.length === 0 ? (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography align="center">Aucun historique trouvé</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historiques.map((historique) => (
                <TableRow key={historique.id}>
                  <TableCell>{historique.id}</TableCell>
                  <TableCell>
                    {historique.utilisateur?.nom || '-'}
                    {historique.utilisateur?.email && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {historique.utilisateur.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{historique.action}</TableCell>
                  <TableCell>{formatDate(historique.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}