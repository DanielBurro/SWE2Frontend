# Event Templates

## Ziel

Die Event-Erstellung bietet eine eigene Template-Auswahl mit vier vorgefertigten Vorlagen:

- Geburtstag
- Hochzeit
- Dinner
- Hausparty

Zusaetzlich kann ein User den aktuellen Event-Entwurf als eigenes Template speichern und spaeter wiederverwenden.

## Verhalten

- Templates enthalten nur Struktur und Textinhalte.
- Farben oder Cover-Einstellungen werden durch Templates nicht veraendert.
- Beim Anwenden eines Templates wird immer ein neuer Event-Entwurf vorbereitet.
- Vor dem Anwenden erscheint eine Bestaetigung, dass der aktuelle Entwurf ueberschrieben wird.

## Technische Umsetzung

- System-Templates liegen im Frontend als vordefinierte Template-Daten.
- Das Template-Format basiert auf dem bereits genutzten `eventContent` fuer EditorJS.
- Die Auswahlseite ist unter `/events/templates` erreichbar.
- In der linken Seitenleiste gibt es einen festen Navigationspunkt `Templates`.

## Eigene Templates

Eigene Templates werden aktuell im Frontend direkt im Browser gespeichert:

- Speicherung per `localStorage`
- Wiederverwendbar auf demselben Geraet und im selben Browser
- Kein Backend-Endpunkt notwendig fuer die erste Version

## Backend-Follow-up

Fuer eine spaetere serverseitige Version bietet sich eine eigene Template-Entitaet an, zum Beispiel mit:

- `id`
- `ownerId`
- `name`
- `description`
- `contentJson`
- `createdAt`
- `updatedAt`

Damit koennten eigene Templates konto-uebergreifend und geraeteunabhaengig synchronisiert werden.
