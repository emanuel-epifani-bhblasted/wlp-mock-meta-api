const express = require('express');
const router = express.Router();

// Store per simulare lo stato degli ad accounts
const adAccountsStore = new Map();

// GET /v18.0/:adAccountId - Fetch Ad Account
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
      id: adAccountId,
      currency: 'USD',
      name: `Mock Account ${storageId}`,
      account_status: 1,
      spend_cap: 0.01,
      timezone_id: 380
    };
    adAccountsStore.set(storageId, adAccount);
    console.log(`[MOCK] Created new default account for ${adAccountId}:`, adAccount);
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
    id: adAccountId,
    currency: 'USD',
    name: `Mock Account ${storageId}`,
    account_status: 1,
    spend_cap: 0.01,
    timezone_id: 380
  };

  // Applica gli aggiornamenti
  Object.assign(adAccount, updateData);
  adAccount.id = adAccountId; // Mantieni il formato originale

  // Salva nello store
  adAccountsStore.set(storageId, adAccount);

  console.log(`[MOCK] Updated account:`, adAccount);

  res.json({
    id: adAccount.id,
    name: adAccount.name,
    currency: adAccount.currency,
    spend_cap: adAccount.spend_cap,
    timezone_id: adAccount.timezone_id,
    account_status: adAccount.account_status
  });
});

// Debug endpoint per vedere lo stato
router.get('/debug/accounts', (req, res) => {
  const accounts = Array.from(adAccountsStore.entries()).map(([storageId, data]) => ({
    storageId,
    ...data
  }));
  res.json(accounts);
});

module.exports = router;
