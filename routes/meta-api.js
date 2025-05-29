const express = require('express');
const router = express.Router();

// Store per simulare lo stato degli ad accounts
const adAccountsStore = new Map();

// GET /v18.0/act_{id} - Fetch Ad Account
router.get('/v18.0/:adAccountId', (req, res) => {
  let { adAccountId } = req.params;
  const { fields } = req.query;

    // Rimuoviamo il prefisso act_ per lo storage interno
    const storageId = adAccountId.replace('act_', '');

  console.log(`[MOCK] Fetching ad account: ${adAccountId}, fields: ${fields}`);

  // Recupera dati dallo store o crea default
  let adAccount = adAccountsStore.get(storageId);

  if (!adAccount) {
    // Crea un account di default se non esiste
    adAccount = {
      id: adAccountId, // Conserva il formato originale con act_ nel campo id
      currency: 'EUR', // default currency
      name: `Mock Account ${storageId}`,
      account_status: 1,
      spend_cap: 0.01
    };
    adAccountsStore.set(storageId, adAccount);
  }

  // Se vengono richiesti solo campi specifici, filtra la risposta
  let response = adAccount;
  if (fields) {
    const requestedFields = fields.split(',');
    response = { id: adAccount.id };
    requestedFields.forEach(field => {
      if (adAccount[field] !== undefined) {
        response[field] = adAccount[field];
      }
    });
  }

  console.log(`[MOCK] Returning:`, response);
  res.json(response);
});

// POST /v18.0/:adAccountId - Update Ad Account
router.post('/v18.0/:adAccountId', (req, res) => {
  let { adAccountId } = req.params;
  const updateData = req.body;

  // Rimuoviamo il prefisso act_ per lo storage interno
  const storageId = adAccountId.replace('act_', '');

  console.log(`[MOCK] Updating ad account: ${adAccountId}`, updateData);

  // Recupera o crea l'account nello store
  let adAccount = adAccountsStore.get(storageId) || {
    id: adAccountId, // Manteniamo il formato originale con act_ nel campo id
    currency: 'EUR',
    name: `Mock Account ${storageId}`,
    account_status: 1
  };

  // Applica gli aggiornamenti
  Object.assign(adAccount, updateData);

  // Assicuriamoci che l'id mantenga sempre il formato originale
  adAccount.id = adAccountId;

  // Salva nello store
  adAccountsStore.set(storageId, adAccount);

  // Log per debug
  console.log(`[MOCK] Updated ad account ${storageId}:`, adAccount);

  console.log(`[MOCK] Updated account:`, adAccount);

  // Ritorna l'account aggiornato
  res.json(adAccount);
});

// Debug endpoint per vedere lo stato
router.get('/debug/accounts', (req, res) => {
  const accounts = Array.from(adAccountsStore.entries()).map(([storageId, data]) => ({
    storageId,
    ...data
  }));
  res.json(accounts);
});

// Endpoint per testare il sleep
router.get('/sleep/:ms', (req, res) => {
  const ms = parseInt(req.params.ms) || 1000;
  console.log(`[MOCK] Sleeping for ${ms}ms`);
  setTimeout(() => {
    res.json({ success: true, slept: ms });
  }, ms);
});

module.exports = router;
