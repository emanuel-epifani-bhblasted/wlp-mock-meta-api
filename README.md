# Meta API Mock Server

Questo server mock implementa le API di Meta necessarie per il flusso di approvazione degli Ad Account.

## Come utilizzare

1. **Installare le dipendenze**

```bash
npm install
```

2. **Avviare il server**

```bash
# Avvio normale
npm start

# Avvio con auto-reload per sviluppo
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`.

## Endpoint Mock di Meta API

Questo server mock implementa i seguenti endpoint Meta API necessari per testare il flusso di approvazione degli Ad Account:

### 1. Aggiornare un Ad Account

```
POST /v18.0/:adAccountId
```

Esempio di richiesta:
```json
{
  "name": "Test Account",
  "currency": "EUR",
  "spend_cap": 0.01,
  "timezone_id": 380
}
```

Risposta:
```json
{
  "id": "act_123456789",
  "name": "Test Account",
  "currency": "EUR",
  "spend_cap": 0.01,
  "timezone_id": 380,
  "account_status": 1
}
```

### 2. Ottenere informazioni su un Ad Account

```
GET /v18.0/:adAccountId?fields=currency,name,account_status
```

Risposta (dipende dai campi richiesti):
```json
{
  "id": "act_123456789",
  "currency": "EUR",
  "name": "Test Account",
  "account_status": 1
}
```

### 3. Visualizzare tutti gli Ad Account nel mock (endpoint di debug)

```
GET /debug/accounts
```

## Comportamento del Mock

- **Creazione Automatica**: Se un Ad Account richiesto non esiste nel mock, viene creato automaticamente con valori predefiniti
- **Persistenza In-Memory**: Tutti i dati sono mantenuti in memoria durante l'esecuzione del server
- **Coerenza**: Le modifiche applicate con POST vengono riflesse nelle successive chiamate GET
- **Valuta**: Il mock implementa correttamente l'aggiornamento della valuta come richiesto dal flusso events-consumer

## Utilizzo per Testing

Questo mock server è particolarmente utile per testare il flusso di approvazione degli Ad Account nel sistema WLP, in particolare:

### Flusso di Approvazione degli Ad Account

1. **User crea richiesta** (status: NEW)
2. **Meta-Operations** assegna un account dal pool (status: WORKING)
   - Con system_note: "Assigned READY_TO_USE ad account" o "Assigned BM autoassigned ad account"
3. **Events-Consumer** configura l'account su Meta API (status: IN_PROGRESS)
   - Con system_note: "Ad account request approved"
   - Questo step utilizza questo mock server per simulare le chiamate alle API Meta

### Comportamento per la Gestione della Valuta

È importante notare che la valuta (currency) viene prelevata dall'entità team associata alla richiesta (`adAccountRequest.teams.currency`) e non viene passata dal frontend. Il mock gestisce correttamente questo comportamento.

## Configurazione per i Test

Per utilizzare questo mock nei test:

1. Configura l'URL base delle API Meta in `wlp-events-consumer` da `https://graph.facebook.com` a `http://localhost:3000`
2. Assicurati che gli Ad Account utilizzati nei test non siano già associati a un team (verrebbe generato un errore "Not Found")

## Collezione Postman

La collezione Postman inclusa contiene esempi di tutte le chiamate API supportate. Puoi importarla in Postman per testare facilmente le API.

Per importare la collezione:
1. Apri Postman
2. Clicca su "Import"
3. Seleziona il file `postman_collection.json`
