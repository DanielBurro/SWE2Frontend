# Profildetails bearbeiten

## Ziel der User-Story

Ein eingeloggter User soll seine bereits angelegten Profildaten im Frontend nachträglich ändern können.

Bearbeitbare Felder:

- `firstName`
- `lastName`
- `username`
- `email`
- `bio`

## Frontend-Verhalten

Die Profilseite zeigt einen Button `Profildetails bearbeiten`. Dieser fuehrt auf eine eigene Bearbeitungsseite unter:

```http
GET /profile/edit
```

Dort wird der aktuelle Stand des eingeloggten Users in ein Formular geladen und kann angepasst werden.

Beim Speichern gilt:

- Vorname, Nachname, Username und E-Mail sind Pflichtfelder
- Username braucht mindestens 3 Zeichen
- E-Mail muss ein gültiges Format haben
- Bio ist optional
- Änderungen werden per `PUT` an das Backend gesendet

Nach erfolgreichem Speichern:

- wird der aktualisierte User in der laufenden Session ersetzt
- Profilseite und Header zeigen direkt die neuen Werte an
- die Bearbeitungsseite navigiert zur Profiluebersicht zurueck

## API-Anbindung

Verwendete Route:

```http
PUT /users/:id
```

Beispiel-Request:

```json
{
  "firstName": "Max",
  "lastName": "Muster",
  "username": "maxmuster",
  "email": "max@example.com",
  "bio": "Ich plane gerne Dinner und kleine Kultur-Events."
}
```

Erwartete Antwort:

```json
{
  "id": 7,
  "firstName": "Max",
  "lastName": "Muster",
  "username": "maxmuster",
  "email": "max@example.com",
  "bio": "Ich plane gerne Dinner und kleine Kultur-Events.",
  "createdAt": "2026-05-06T09:00:00.000Z"
}
```

## Technische Entscheidung

Der aktualisierte User wird nicht nur im Formular gehalten, sondern direkt in die gespeicherte Auth-Session zurueckgeschrieben. Dadurch bleiben Profilseite, Header und andere session-basierte UI-Bereiche konsistent, ohne dass ein zusaetzlicher Reload noetig ist.
