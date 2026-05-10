# Eigene Events im Profil

## Ziel der User-Story

Ein eingeloggter User soll auf der Profilseite seine selbst erstellten Events sehen und direkt damit interagieren koennen.

Im Frontend bedeutet das:

- Anzeige der eigenen Events im Tab `Meine Events`
- gleiche Kartenoptik wie auf der Home-Seite
- Navigation von der Profilseite direkt zur Event-Detailseite
- sauberer Lade-, Fehler- und Leerzustand

## Frontend-Verhalten

Die Profilseite laedt die eigenen Events aktuell separat ueber den `EventService`.

Verwendete Route:

```http
GET /events/host/:hostId
```

Erwartete Antwort:

```json
[
  {
    "id": 12,
    "title": "Rooftop Dinner",
    "description": "...",
    "date": "2026-05-14T18:30:00Z",
    "status": "offen",
    "hostName": "Max Mustermann",
    "locationName": "Heidelberg"
  }
]
```

Die UI verwendet dasselbe `Event`-Modell wie die Home-Seite und die Event-Detailseite. Dadurch bleibt die Darstellung konsistent und der Wechsel zur Detailseite braucht keine zusaetzliche Transformation.

## Backend-Entscheidung

Offen ist noch, woher die Profildaten langfristig kommen sollen:

1. `GET Profil` liefert die eigenen Events direkt mit.
2. Es bleibt bei einer separaten Event-Route.

Fuer den aktuellen Frontend-Stand ist Option 2 bereits angeschlossen und am wenigsten invasiv, weil:

- die Profilseite Events unabhaengig vom User-Profil nachladen kann
- die Event-Liste spaeter auch an anderen Stellen wiederverwendbar bleibt
- Home, Detail und Profil dieselbe Event-Struktur nutzen

Falls das Backend sich spaeter fuer Option 1 entscheidet, muss nur die Datenquelle im Profil angepasst werden. Das UI selbst kann unveraendert bleiben, solange dieselbe `Event[]`-Struktur geliefert wird.

## Interaktion im UI

- Klick auf eine Event-Karte oeffnet `/events/:id`
- die Detailseite erkennt den eingeloggten Host ueber echte Auth-Daten statt ueber einen Demo-Namen
- Host-Events werden bereits aus der Navigation vorbefuellt, damit die Detailseite nicht auf einer endlosen Ladeanzeige haengen bleibt
- `Event bearbeiten` fuehrt zu `/events/:id/edit` und nutzt denselben Formular-Flow wie die Erstellung
- `Neues Event` fuehrt zu `/events/create`
- bei leeren Daten bleibt der bestehende CTA sichtbar
- bei Ladefehlern gibt es eine Retry-Aktion
