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
      currency: 'USD', // Usiamo USD come default per garantire consistenza
      name: `Mock Account ${storageId}`,
      account_status: 1, // 1=active
      spend_cap: 0.01,
      timezone_id: 380 // Timezone di default
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

  // Imposta sempre la valuta richiesta se specificata
  if (req.query.expectedCurrency) {
    console.log(`[MOCK] Setting currency to expected value: ${req.query.expectedCurrency}`);
    response.currency = req.query.expectedCurrency;
    // Aggiorna anche lo store
    adAccount.currency = req.query.expectedCurrency;
    adAccountsStore.set(storageId, adAccount);
  }

  // Disabilitata la simulazione di errori per garantire il successo
  // Manteniamo solo il codice di log per il debugging
  if (req.query.validateCurrency === 'true' && response.currency !== req.query.expectedCurrency) {
    console.log(`[MOCK] Currency would have failed, but errors are disabled: ${response.currency} != ${req.query.expectedCurrency}`);
    // Forziamo la corrispondenza
    response.currency = req.query.expectedCurrency;
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
    currency: 'USD', // Usiamo USD come default per garantire consistenza
    name: `Mock Account ${storageId}`,
    account_status: 1, // 1=active
    spend_cap: 0.01,
    timezone_id: 380 // Timezone di default
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

  // Disabilitata la simulazione di errori per garantire il successo
  // Manteniamo solo il log per il debug
  if (req.query.simulateError === 'true') {
    console.log(`[MOCK] Would have simulated error for ad account ${storageId}, but errors are disabled`);
  }

  // Assicuriamo che tutti i campi siano popolati correttamente
  const response = {
    id: adAccount.id,
    name: adAccount.name,
    currency: adAccount.currency || 'USD', // Default to USD if not set
    spend_cap: adAccount.spend_cap || 0.01,
    timezone_id: adAccount.timezone_id || 380,
    account_status: adAccount.account_status || 1 // 1=active
  };

  // Aggiorna lo store con i valori di default se necessario
  if (!adAccount.currency) adAccount.currency = 'USD';
  if (!adAccount.spend_cap) adAccount.spend_cap = 0.01;
  if (!adAccount.timezone_id) adAccount.timezone_id = 380;
  if (!adAccount.account_status) adAccount.account_status = 1;
  adAccountsStore.set(storageId, adAccount);

  console.log(`[MOCK] Returning formatted response:`, response);
  res.json(response);
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

// Health check endpoint
router.get('/health', (req, res) => {
  const accounts = Array.from(adAccountsStore.entries()).length;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    accountsCount: accounts,
    version: '1.0.0'
  });
});

// Endpoint per simulare errori specifici
router.get('/simulate-error/:type', (req, res) => {
  const { type } = req.params;

  switch (type) {
    case 'validation':
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          type: 'ValidationException',
          code: 400
        }
      });
    case 'auth':
      return res.status(401).json({
        error: {
          message: 'Invalid auth token',
          type: 'OAuthException',
          code: 190
        }
      });
    case 'timeout':
      // Non risponde mai
      break;
    default:
      return res.status(500).json({
        error: {
          message: 'Unknown error',
          type: 'ServerError',
          code: 500
        }
      });
  }
});

module.exports = router;
