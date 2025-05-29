# Troubleshooting del Mock Server Meta API
# Troubleshooting per Mock Meta API

Questo documento contiene soluzioni per problemi comuni che possono verificarsi durante l'utilizzo del mock server per le API Meta.

## Problemi Comuni

### 1. Errore "Not Found" durante l'approvazione della richiesta

**Sintomo:**
Nei log appare un errore simile a:
```
Ad account with id=19550 already associated with a team.
Error approving request 1099: Not Found
```

**Causa:**
Questo errore si verifica quando si tenta di approvare una richiesta per un Ad Account che è già associato a un team. La funzione `verifyTeamAdAccountsByAccountId` in `approveAdAccountRequest.event.ts` controlla se un account è già associato e genera questo errore in caso positivo.

**Soluzione:**
1. Utilizzare un Ad Account diverso che non sia già associato a un team
2. Oppure, per scopi di test, modificare temporaneamente la funzione `verifyTeamAdAccountsByAccountId` per saltare questa verifica

### 2. Currency Mismatch

**Sintomo:**
Nei log appare un avviso o errore relativo alla mancata corrispondenza della valuta:
```
Currency mismatch: EUR != USD
```

**Causa:**
La valuta (currency) viene ottenuta dall'entità team associata alla richiesta (`adAccountRequest.teams.currency`). Se la valuta restituita dall'API Meta è diversa, si verifica questo errore.

**Soluzione:**
1. Assicurarsi che il mock server restituisca la stessa valuta configurata per il team
2. Il mock gestirà automaticamente questa situazione, ma per evitare errori nei log, è possibile impostare preventivamente la valuta corretta con una richiesta POST

### 3. Problemi di connessione al mock server

**Sintomo:**
Errori di connessione o timeout quando l'applicazione tenta di contattare le API Meta.

**Causa:**
Il mock server potrebbe non essere in esecuzione o potrebbe essere configurato su una porta diversa.

**Soluzione:**
1. Verificare che il mock server sia in esecuzione (`npm start`)
2. Verificare che l'URL del mock server sia configurato correttamente nell'applicazione (`http://localhost:3000` invece di `https://graph.facebook.com`)

## Domande Frequenti

### Da dove viene presa la valuta (currency)?

La valuta utilizzata per configurare l'Ad Account su Meta **non viene inviata dal frontend**, ma viene recuperata dall'entità team associata alla richiesta. In particolare, il codice preleva `adAccountRequest.teams.currency` sia in `wlp-meta-operations-be` che in `wlp-events-consumer`.

### Come simulare il flusso di approvazione completo?

1. Assicurarsi che il mock server sia in esecuzione
2. Utilizzare la collezione Postman inclusa, in particolare la sezione "3.1 Simula intero flusso events-consumer"
3. Eseguire i passaggi nell'ordine indicato per simulare l'intero processo di configurazione dell'Ad Account

### Come posso verificare lo stato degli Ad Account nel mock?

Utilizzare l'endpoint di debug:
```
GET http://localhost:3000/debug/accounts
```

Questo mostrerà tutti gli Ad Account attualmente memorizzati nel mock server con i loro attributi correnti.
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
