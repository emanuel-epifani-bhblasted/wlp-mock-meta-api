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

## Endpoint disponibili

### 1. Aggiornare un Ad Account

```
POST /v18.0/:adAccountId
```

Esempio di richiesta:
```json
{
  "name": "Test Account",
  "currency": "EUR",
  "spend_cap": 0.01
}
```

### 2. Ottenere informazioni su un Ad Account

```
GET /v18.0/:adAccountId?fields=currency,name,account_status
```

### 3. Visualizzare tutti gli Ad Account nel mock

```
GET /debug/accounts
```

## Configurazione nell'applicazione principale

Per utilizzare questo mock, configura l'URL base delle API Meta nella tua applicazione principale da `https://graph.facebook.com` a `http://localhost:3000`.

## Collezione Postman

Una collezione Postman è disponibile nel file `postman_collection.json`. Puoi importarla in Postman per testare facilmente le API.

Per importare la collezione:
1. Apri Postman
2. Clicca su "Import"
3. Seleziona il file `postman_collection.json`

## Comportamento

- Se un Ad Account non esiste nel mock, viene creato automaticamente
- Tutti i dati sono persistiti in memoria durante l'esecuzione del server
- Gli aggiornamenti applicati vengono riflessi nelle chiamate GET successive
