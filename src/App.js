import './App.css';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

// Requête pour obtenir tous les comptes
const GET_ALL_COMPTES = gql`
  query {
    allComptes {
      id
      solde
      dateCreation
      type
    }
  }
`;

// Mutation pour ajouter un compte
const ADD_COMPTE = gql`
  mutation SaveCompte($solde: Float!, $dateCreation: String!, $type: TypeCompte!) {
    saveCompte(compte: { solde: $solde, dateCreation: $dateCreation, type: $type }) {
      id
      solde
      dateCreation
      type
    }
  }
`;

// Mutation pour ajouter une transaction
const ADD_TRANSACTION = gql`
  mutation AddTransaction($compteId: ID!, $montant: Float!, $type: TypeTransaction!) {
    addTransaction(transactionRequest: { compteId: $compteId, montant: $montant, type: $type }) {
      id
      montant
      date
      type
    }
  }
`;

function App() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_COMPTES);
  const [addCompte] = useMutation(ADD_COMPTE);
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  // États pour le formulaire d'ajout de compte
  const [formData, setFormData] = useState({
    solde: '',
    dateCreation: '',
    type: 'COURANT',
  });

  // États pour la gestion des transactions et la modal
  const [selectedCompteId, setSelectedCompteId] = useState(null);
  const [transactionFormData, setTransactionFormData] = useState({
    montant: '',
    type: 'DEPOT',
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCompteModal, setShowCompteModal] = useState(false); // Modal pour l'ajout de compte

  // Gestion des changements dans le formulaire d'ajout de compte
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion des changements dans le formulaire de transaction
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData({ ...transactionFormData, [name]: value });
  };

  // Soumission du formulaire d'ajout de compte
  const handleSubmitCompte = async (e) => {
    e.preventDefault();
    const formattedDate = formData.dateCreation.replace(/-/g, '/');

    try {
      await addCompte({
        variables: {
          solde: parseFloat(formData.solde),
          dateCreation: formattedDate,
          type: formData.type,
        },
      });
      refetch();
      setFormData({ solde: '', dateCreation: '', type: 'COURANT' });
      setShowCompteModal(false); // Fermer la modal après soumission
    } catch (error) {
      console.error('Erreur lors de l’ajout du compte :', error);
    }
  };

  // Soumission du formulaire de transaction
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addTransaction({
        variables: {
          compteId: selectedCompteId,
          montant: parseFloat(transactionFormData.montant),
          type: transactionFormData.type,
        },
      });
      
      const updatedCompte = data.addTransaction.compte;
      console.log('Compte mis à jour :', updatedCompte);

      refetch(); 
      setShowTransactionModal(false); // Fermer la modal après soumission
      setSelectedCompteId(null); 
      setTransactionFormData({ montant: '', type: 'DEPOT' });
    } catch (error) {
      console.error('Erreur lors de l’ajout de la transaction :', error);
    }
  };

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div>
      <h1>Liste des Comptes</h1>

      {/* Bouton pour ouvrir la modal d'ajout de compte */}
      <button  className ="buttonn" onClick={() => setShowCompteModal(true)}>Ajouter Compte</button>

      {/* Modal pour ajouter un compte */}
      {showCompteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ajouter un Compte</h2>
            <form onSubmit={handleSubmitCompte}>
              <input
                type="number"
                name="solde"
                placeholder="Solde"
                value={formData.solde}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="dateCreation"
                value={formData.dateCreation}
                onChange={handleInputChange}
                required
              />
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="COURANT">COURANT</option>
                <option value="EPARGNE">EPARGNE</option>
              </select>
              <button type="submit">Ajouter Compte</button>
              <button type="button" onClick={() => setShowCompteModal(false)}>Annuler</button>
            </form>
          </div>
        </div>
      )}

      {/* Affichage des comptes sous forme de cartes */}
      <div className="comptes-cards">
        {data.allComptes.map((compte) => (
          <div key={compte.id} className="compte-card">
            <h3>Compte ID: {compte.id}</h3>
            <p><strong>Solde:</strong> {compte.solde.toFixed(2)} €</p>
            <p><strong>Date de création:</strong> {compte.dateCreation}</p>
            <p><strong>Type:</strong> {compte.type}</p>
            <button onClick={() => { 
              setSelectedCompteId(compte.id); 
              setShowTransactionModal(true); // Ouvrir la modal pour transaction
            }}>
              Ajouter Transaction
            </button>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter une transaction */}
      {showTransactionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ajouter une Transaction</h2>
            <form onSubmit={handleTransactionSubmit}>
              <input
                type="number"
                name="montant"
                placeholder="Montant"
                value={transactionFormData.montant}
                onChange={handleTransactionChange}
                required
              />
              <select
                name="type"
                value={transactionFormData.type}
                onChange={handleTransactionChange}
              >
                <option value="DEPOT">DEPOT</option>
                <option value="RETRAIT">RETRAIT</option>
              </select>
              <button type="submit">Ajouter Transaction</button>
              <button type="button" onClick={() => setShowTransactionModal(false)}>Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
