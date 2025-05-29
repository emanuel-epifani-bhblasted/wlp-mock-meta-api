/**
 * Rotta di test per verificare che tutti gli account siano consistenti
 */

const express = require('express');
const router = express.Router();

// Riferimento condiviso allo store degli account
const adAccountsStore = new Map();

// Endpoint per garantire la consistenza di tutti gli account
router.get('/test/fix-all-accounts', (req, res) => {
  const accounts = Array.from(adAccountsStore.entries());
  const fixed = [];

  accounts.forEach(([storageId, account]) => {
    // Assicuriamoci che tutti gli account abbiano i campi richiesti
    if (!account.currency) {
      account.currency = 'USD';
      fixed.push({ id: storageId, field: 'currency' });
    }

    if (!account.spend_cap) {
      account.spend_cap = 0.01;
      fixed.push({ id: storageId, field: 'spend_cap' });
    }

    if (!account.timezone_id) {
      account.timezone_id = 380;
      fixed.push({ id: storageId, field: 'timezone_id' });
    }

    if (!account.account_status) {
      account.account_status = 1; // 1=active
      fixed.push({ id: storageId, field: 'account_status' });
    }

    // Assicuriamoci che l'ID sia nel formato corretto
    if (!account.id.startsWith('act_')) {
      account.id = `act_${storageId}`;
      fixed.push({ id: storageId, field: 'id' });
    }

    // Aggiorna lo store
    adAccountsStore.set(storageId, account);
  });

  res.json({
    success: true,
    accountsCount: accounts.length,
    fixedFields: fixed,
    allAccounts: Array.from(adAccountsStore.entries()).map(([id, data]) => ({
      id,
      ...data
    }))
  });
});

module.exports = router;
