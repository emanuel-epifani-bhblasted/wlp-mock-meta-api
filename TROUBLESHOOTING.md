# Troubleshooting del Mock Server Meta API

## Problemi Comuni

### 1. Errore: "Cannot read properties of undefined (reading 'message')"

Questo errore si verifica quando il client si aspetta una risposta di errore formattata in un certo modo, ma il mock server restituisce qualcosa di diverso.

**Soluzione:**
Verifica che le chiamate fallite stiano ottenendo una risposta formattata correttamente con un campo `message`.

### 2. Mancata corrispondenza IDs con/senza prefisso act_

Meta API a volte si riferisce agli ad account con il prefisso "act_" e altre volte senza.

**Soluzione:**
Il mock server ora gestisce entrambi i formati standardizzando internamente le chiavi di storage.

### 3. Problemi con le richieste simultanee

Le richieste simultanee potrebbero causare race conditions nell'aggiornamento degli ad account.

**Soluzione:**
Usa l'endpoint `/debug/accounts` per verificare lo stato corrente degli account nel mock server.

### 4. Errori con la verifica della valuta

Il flusso cerca di verificare che la valuta sia stata aggiornata correttamente dopo un secondo.

**Soluzione:**
Assicurati che le risposte alle GET riflettano gli aggiornamenti effettuati con le POST precedenti.

## Come Verificare il Funzionamento

1. Avvia il server: `npm run dev`
2. Fai una POST per aggiornare un ad account:
   ```
   POST http://localhost:3000/v18.0/act_123456789
   Content-Type: application/json

   {
     "currency": "USD",
     "name": "Test Account"
   }
   ```
3. Verifica con una GET che i dati siano stati aggiornati:
   ```
   GET http://localhost:3000/v18.0/act_123456789?fields=currency,name
   ```
4. Controlla tutti gli account:
   ```
   GET http://localhost:3000/debug/accounts
   ```

## Connessione con l'Applicazione Principale

Per collegare l'applicazione principale al mock server:

1. Modifica l'URL base delle API Meta nell'applicazione da `https://graph.facebook.com` a `http://localhost:3000`
2. Assicurati che i token di accesso configurati nel sistema siano validi (anche se fittizi)
3. Controlla i log del server mock per verificare che le richieste arrivino correttamente
