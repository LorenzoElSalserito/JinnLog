# JinnLog 1.0 - Master Product Requirements Document
Versione documento: 1.0
Stato: Specification-grade master draft
Ambito: Desktop-first, local-first, cloud-ready, planning-enabled productivity suite
Lingua: Italiano
Tipo documento: Documento funzionale master, completo, normativo, implementabile
Destinatari: Product owner, architetti software, designer UX, sviluppatori backend/frontend, QA, team delivery


---

# 1. Scopo del documento

Questo documento definisce in modo completo, univoco, tracciabile e implementabile i requisiti funzionali, operativi e architetturali di JinnLog 1.0.

Il documento rifonde e sostituisce integralmente il PRD precedente, integrando:

- il modello originario di task management, note, collaborazione e local-first
- le estensioni suggerite per la pianificazione avanzata
- le nuove viste e funzionalità ispirate ai riferimenti visuali forniti
- una struttura più rigorosa, adatta a roadmap, refinement, design tecnico, testing e delivery

Il documento è concepito per guidare la realizzazione di JinnLog come:

**workspace collaborativo local-first con planning engine integrato, knowledge layer nativo, template system, dashboard esecutive e sincronizzazione semanticamente consapevole**

---

# 2. Convenzioni normative

In questo documento i termini seguenti hanno valore normativo:

- **DEVE**: requisito obbligatorio
- **NON DEVE**: comportamento vietato
- **DOVREBBE**: requisito fortemente raccomandato
- **PUÒ**: comportamento opzionale o estendibile

Quando presente un identificativo requisito, esso è considerato stabile e referenziabile.

Formato identificativi:

- Requisiti funzionali: `PRD-XX-FR-YYY`
- Regole di business: `PRD-XX-BR-YYY`
- Acceptance criteria: `PRD-XX-AC-YYY`
- Rischi: `PRD-XX-RSK-YYY`

---

# 3. Visione di prodotto

## 3.1 Visione

JinnLog è una suite integrata che unisce:

- gestione progetti
- gestione task personali e di team
- note e conoscenza contestuale
- tracciamento del tempo
- pianificazione avanzata
- carico e capacità
- dashboard di tracking
- template di progetto
- sincronizzazione futura cloud-ready

in un’esperienza coerente, locale, robusta e progressivamente scalabile.

## 3.2 Identità del prodotto

JinnLog **non** deve diventare una copia di un project scheduler tradizionale.
JinnLog deve diventare:

**un sistema di produttività e coordinamento che può scalare da task app personale a workspace di pianificazione collaborativa**

## 3.3 Principi fondanti

1. **Local-first**
   - Il prodotto DEVE funzionare offline.
   - Il dato DEVE essere localmente disponibile.
   - La sincronizzazione DEVE essere un’estensione, non una dipendenza.

2. **Desktop-first**
   - L’esperienza primaria nasce su desktop.
   - L’architettura DEVE restare riusabile per web/mobile.

3. **Planning progressivo**
   - Il task semplice DEVE restare semplice.
   - Le capacità avanzate DEVONO poter essere attivate progressivamente.

4. **Knowledge embedded**
   - Note, allegati, business case e contesto DEVONO vivere vicino al lavoro.

5. **Collaboration by design**
   - Ruoli, membership, notifiche, assegnazioni e team DEVONO essere nativi.

6. **Specification-safe evolution**
   - Ogni nuova capability DEVE essere compatibile con evoluzione futura senza rompere il core.

7. **Semantic sync**
   - Le politiche di merge DEVONO dipendere dal tipo di entità.
   - Non si deve usare una sola strategia per tutte le strutture.

---

# 4. Obiettivi di prodotto

## 4.1 Obiettivi strategici

- Centralizzare task, progetti, note, tempo, pianificazione e collaborazione.
- Consentire uso individuale e di team senza cambiare strumento.
- Supportare percorsi semplici e avanzati con la stessa base dati.
- Introdurre un layer di pianificazione avanzata ispirato ai software di scheduling.
- Offrire viste professionali di tracking, timeline, Gantt e dashboard.
- Rendere il prodotto pronto per cloud sync, export/import e interoperabilità futura.

## 4.2 Obiettivi operativi

- Ridurre il numero di strumenti esterni usati dall’utente.
- Migliorare qualità delle stime e della pianificazione.
- Migliorare il controllo dell’avanzamento.
- Rendere visibili colli di bottiglia, rischi, scostamenti e sovraccarichi.
- Abilitare template di progetto riusabili per casi d’uso ricorrenti.

---

# 5. Non-obiettivi

JinnLog, in questa fase, NON DEVE:

- diventare un ERP
- diventare una BI suite general purpose
- diventare da subito un clone di Microsoft Project
- sacrificare usabilità per introdurre complessità enterprise prematura
- dipendere da un backend cloud per funzionare
- imporre pianificazione avanzata a ogni utente
- implementare controllo economico enterprise completo prima del consolidamento del core

---

# 6. Nuove aree introdotte in questa versione

Questa versione del documento aggiunge in modo esplicito e normato le seguenti aree:

1. **Template Gallery di progetto**
2. **Project Timeline Template**
3. **Project Tracking Template**
4. **Gantt Template**
5. **Event Marketing Timeline Template**
6. **Chart Tab / Executive Dashboard**
7. **Team overview panel**
8. **Goals / Problem Statement**
9. **Business Case**
10. **Key Success Metrics con Target vs Achieved**
11. **Risk register visuale**
12. **Key Deliverables**
13. **OKRs collegati al progetto**
14. **Phase timeline per fasi progettuali**

Queste capacità sono integrate nei PRD aggiornati e in due PRD nuovi dedicati:
- **PRD-16 - Project Templates, Guided Setup and Reusable Blueprints**
- **PRD-17 - Executive Dashboard, Project Tracking, Charter and Chart Tab**

---

# 7. Mappa dei PRD

Il documento è composto da 17 PRD:

1. PRD-01 - Core Work Management
2. PRD-02 - Contextual Notes, Knowledge and Tagging
3. PRD-03 - Time Tracking, Estimation and Productivity Analytics
4. PRD-04 - Team Collaboration, Roles, Notifications and Ghost Users
5. PRD-05 - Identity, Local Profiles and Authentication
6. PRD-06 - Local-First Data Platform, Persistence, Migration and Health
7. PRD-07 - Asset Management, Attachments and File Storage
8. PRD-08 - Advanced Planning Model
9. PRD-09 - Work Calendars and Capacity Engine
10. PRD-10 - Views, Timeline, Gantt, Board, Workload and Cross-View Experience
11. PRD-11 - Baseline, Variance, Forecasting and Execution Control
12. PRD-12 - Resource Planning and Allocation
13. PRD-13 - Planning-Aware Sync and Conflict Resolution
14. PRD-14 - Integrations, Import/Export, Calendar Feeds and Interoperability
15. PRD-15 - Onboarding, Preferences, Workspace and Operational Configuration
16. PRD-16 - Project Templates, Guided Setup and Reusable Blueprints
17. PRD-17 - Executive Dashboard, Project Tracking, Charter and Chart Tab

---

# 8. Glossario operativo

## 8.1 Task
Unità di lavoro elementare o pianificabile.

## 8.2 Summary task
Task contenitore che aggrega child task.

## 8.3 Milestone
Evento a durata zero o equivalente convenzionale.

## 8.4 WBS
Work Breakdown Structure, gerarchia del lavoro.

## 8.5 Baseline
Snapshot immutabile del piano in un dato momento.

## 8.6 Deliverable
Output concreto, misurabile e verificabile associato al progetto o a una fase.

## 8.7 OKR
Objective and Key Results associabili a progetto, fase o template.

## 8.8 Business case
Sintesi strutturata del valore, del problema e dei benefici attesi del progetto.

## 8.9 Project charter
Scheda sintetica del progetto con team, sponsor, obiettivi, metriche, rischi, deliverable, timeline di alto livello.

## 8.10 Template blueprint
Definizione strutturata riusabile di progetto, viste, campi, fasi, deliverable, metriche e layout.

## 8.11 Chart Tab
Vista sintetica ad alto contenuto informativo che mostra charter, KPI, rischi, deliverable, OKR e timeline.

---

# 9. Regole globali di dominio

1. Ogni entità principale DEVE avere identificatore stabile.
2. Ogni entità sincronizzabile DEVE avere metadati temporali minimi.
3. Ogni eliminazione di entità sincronizzabile DEVE essere semanticamente tracciabile.
4. Le baseline DEVONO essere immutabili.
5. Le dipendenze NON DEVONO generare cicli non ammessi.
6. Le viste DEVONO essere proiezioni coerenti dello stesso dominio.
7. Il task semplice DEVE funzionare anche senza layer planning attivo.
8. Le politiche di merge DEVONO essere differenziate per tipo di dato.
9. Template, dashboard e chart tab NON DEVONO duplicare in modo divergente i dati già esistenti nel dominio.
10. Deliverable, OKR, metriche e rischi DEVONO essere entità o strutture first-class, non testo libero nascosto in note non interrogabili.

---

# PRD-01 - Core Work Management

## Stato rispetto alla versione precedente
**PRD modificato**
Origine precedente: Epic 1 originaria
Nota: non esisteva prima come PRD formalizzato

## Scopo
Definire il nucleo operativo di JinnLog per la gestione di task e progetti, garantendo semplicità d’uso, tracciabilità e compatibilità con estensioni avanzate.

## In scope
- creazione task
- modifica task
- stato
- priorità
- checklist
- tagging
- progetto di appartenenza
- task detail
- filtri e ricerca
- campi compatibili con il planning

## Out of scope
- baseline
- scheduling avanzato
- dashboard esecutive complesse
- gestione capacità
- merge sync avanzato

## Attori
- utente individuale
- team member
- project lead
- planner
- amministratore workspace

## Use case principali
1. Creare rapidamente un task.
2. Aggiornare stato e priorità.
3. Collegare il task a un progetto.
4. Aggiungere checklist e tag.
5. Filtrare i task per contesto operativo.
6. Preparare un task per una futura pianificazione avanzata.

## Entità dominio
- Project
- Task
- TaskStatus
- TaskPriority
- TaskChecklist
- TaskChecklistItem
- Tag
- TaskTag

## Requisiti funzionali

### PRD-01-FR-001
Il sistema DEVE consentire la creazione di un task con titolo obbligatorio.

### PRD-01-FR-002
Il sistema DEVE consentire di impostare descrizione con supporto Markdown.

### PRD-01-FR-003
Il sistema DEVE supportare priorità almeno nei livelli:
- Bassa
- Media
- Alta
- Critica

### PRD-01-FR-004
Il sistema DEVE supportare stato iniziale configurabile, con default di sistema.

### PRD-01-FR-005
Il sistema DEVE consentire l’associazione del task a un progetto.

### PRD-01-FR-006
Il sistema DEVE supportare checklist annidate al task.

### PRD-01-FR-007
Il sistema DEVE supportare assegnazione di uno o più tag al task.

### PRD-01-FR-008
Il sistema DEVE consentire ricerca, filtro e ordinamento.

### PRD-01-FR-009
Il sistema DEVE supportare campi predisposti per estensioni future:
- plannedStart
- plannedFinish
- estimatedEffort
- actualEffort
- taskType

### PRD-01-FR-010
Il sistema DEVE consentire completamento, riapertura e archiviazione del task.

### PRD-01-FR-011
Il sistema DEVE distinguere task operativi semplici da task con planning attivo.

### PRD-01-FR-012
Il sistema DEVE consentire la visualizzazione task per progetto e per utente.

## Regole di business

### PRD-01-BR-001
Un task DEVE appartenere a un progetto, salvo esistenza esplicita di inbox personale.

### PRD-01-BR-002
La chiusura del task NON DEVE distruggere checklist, storico o tag.

### PRD-01-BR-003
I tag DEVONO essere semanticamente deduplicati nel contesto applicativo.

### PRD-01-BR-004
I campi di planning NON DEVONO essere obbligatori per i task semplici.

## Acceptance criteria

### PRD-01-AC-001
Dato un utente autenticato o un profilo locale valido, quando crea un task con solo titolo, il task viene salvato correttamente.

### PRD-01-AC-002
Dato un task esistente, quando l’utente ne cambia stato, la modifica è persistita e visibile in tutte le viste pertinenti.

### PRD-01-AC-003
Dato un task con checklist, quando il task viene completato e riaperto, la checklist resta intatta.

### PRD-01-AC-004
Dato un task con tag, la ricerca filtrata per tag restituisce il task correttamente.

### PRD-01-AC-005
Dato un task senza campi di planning valorizzati, la UI non deve obbligare l’utente a inserire date o durata pianificata.

## Rischi
- PRD-01-RSK-001: gonfiare il task model con troppi campi obbligatori
- PRD-01-RSK-002: accoppiare troppo il task core al planning
- PRD-01-RSK-003: duplicazione semantica tra task e note

## Spunto implementativo
### Meta-programmazione
1. Modellare `Task` come aggregate root essenziale.
2. Spostare gli aspetti avanzati in moduli adiacenti e non nel cuore monolitico del task.
3. Definire comandi di dominio separati per creazione rapida e modifica completa.
4. Introdurre un dizionario di stati e priorità configurabile ma con default forti.
5. Rendere checklist e tag entità collegate e interrogabili.
6. Progettare i repository e le query in modo indipendente dalle viste.
7. Trattare il task semplice come prima classe, non come caso “depotenziato”.
8. Conservare già nel modello gli hook semantici per planning, analytics e sync.

---

# PRD-02 - Contextual Notes, Knowledge and Tagging

## Stato rispetto alla versione precedente
**PRD modificato**
Origine precedente: Epic 1, note contestuali
Nota: non esisteva prima come PRD formalizzato

## Scopo
Definire il sistema di conoscenza contestuale di JinnLog, basato su note ricche, relazioni, tagging e reperibilità.

## In scope
- note Markdown
- collegamenti tra note e domini
- tagging unificato
- ricerca full-text
- storia di modifica
- visibilità privata/condivisa

## Out of scope
- editor collaborativo real-time
- wiki enterprise full-featured

## Attori
- utente individuale
- team member
- project lead
- reviewer
- stakeholder interno

## Use case principali
1. Creare una nota di progetto.
2. Collegare una nota a un task.
3. Cercare informazione per tag o testo.
4. Mantenere business context accanto al lavoro.
5. Riutilizzare note in più contesti.

## Entità dominio
- Note
- NoteLink
- NoteTag
- NoteRevision
- SearchIndexEntry

## Requisiti funzionali

### PRD-02-FR-001
Il sistema DEVE consentire la creazione di note in Markdown.

### PRD-02-FR-002
Le note DEVONO poter esistere autonomamente.

### PRD-02-FR-003
Le note DEVONO poter essere collegate a:
- progetto
- task
- utente
- team
- deliverable
- OKR
- rischio

### PRD-02-FR-004
Il sistema DEVE supportare tagging delle note.

### PRD-02-FR-005
Il sistema DEVE supportare ricerca full-text sulle note.

### PRD-02-FR-006
Il sistema DEVE consentire relazioni multiple della stessa nota senza duplicazione contenuto.

### PRD-02-FR-007
Il sistema DEVE mantenere almeno una revisione minima delle modifiche.

### PRD-02-FR-008
Il sistema DEVE supportare visibilità privata o condivisa.

### PRD-02-FR-009
Il sistema DEVE supportare backlink o almeno navigazione inversa dagli oggetti collegati.

### PRD-02-FR-010
Il sistema DEVE consentire il rendering leggibile del contenuto.

## Regole di business

### PRD-02-BR-001
Una nota NON DEVE dipendere obbligatoriamente da un task.

### PRD-02-BR-002
Una nota sincronizzabile DEVE rispettare soft delete.

### PRD-02-BR-003
Le relazioni tra note e domini DEVONO essere polimorfe ma referenzialmente valide.

### PRD-02-BR-004
Le note usate come business context NON DEVONO essere ridotte a semplice allegato descrittivo.

## Acceptance criteria

### PRD-02-AC-001
Una nota può essere creata senza collegamento a un task.

### PRD-02-AC-002
Una stessa nota può essere collegata a un progetto e a un deliverable senza duplicazione.

### PRD-02-AC-003
La ricerca full-text su una parola presente nel corpo della nota restituisce la nota.

### PRD-02-AC-004
Un utente senza permesso non può leggere una nota privata condivisa con altri scope.

### PRD-02-AC-005
Da un task collegato a una nota è possibile navigare alla nota e viceversa.

## Rischi
- PRD-02-RSK-001: trasformare le note in blob non interrogabili
- PRD-02-RSK-002: conflitti di sync troppo aggressivi su contenuti testuali
- PRD-02-RSK-003: confusione tra descrizione task e nota contestuale

## Spunto implementativo
### Meta-programmazione
1. Trattare `Note` come aggregate autonomo.
2. Modellare i link tramite un registro di relazioni polimorfe.
3. Separare contenuto, metadati e collegamenti.
4. Introdurre un indice di ricerca dedicato.
5. Rendere il renderer markdown separato dal dominio.
6. Stabilire una policy di merge testuale dedicata.
7. Preparare le note come supporto nativo a charter, business case e decision log.
8. Non usare note come scorciatoia per evitare modellazione strutturata di metriche, deliverable o rischi.

---

# PRD-03 - Time Tracking, Estimation and Productivity Analytics

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Definire il sistema di tracciamento del tempo, stima dell’effort e analytics di produttività e accuratezza.

## In scope
- timer focus
- log manuale del tempo
- stima effort
- confronto stima/effettivo
- aggregazioni per progetto, persona e periodo
- basi dati per forecast

## Out of scope
- timesheet enterprise completo
- payroll
- costing finanziario avanzato di livello enterprise

## Attori
- utente individuale
- team member
- project lead
- resource manager
- analyst

## Entità dominio
- FocusSession
- TimeEntry
- EffortEstimate
- ProductivityMetric
- CapacityProfile

## Requisiti funzionali

### PRD-03-FR-001
Il sistema DEVE consentire avvio di una focus session associata a un task.

### PRD-03-FR-002
Il sistema DEVE supportare pausa, ripresa e chiusura della sessione.

### PRD-03-FR-003
Il sistema DEVE consentire registrazione manuale del tempo.

### PRD-03-FR-004
Il sistema DEVE supportare stima di effort in minuti o ore.

### PRD-03-FR-005
Il sistema DEVE calcolare la deviazione tra effort stimato ed effort reale.

### PRD-03-FR-006
Il sistema DEVE aggregare i dati per task, progetto, utente e periodo.

### PRD-03-FR-007
Il sistema DEVE supportare capacità giornaliera configurabile.

### PRD-03-FR-008
Il sistema DEVE distinguere tra tempo timer e tempo manuale.

### PRD-03-FR-009
Il sistema DEVE esporre dati utilizzabili per workload, baseline e forecast.

### PRD-03-FR-010
Il sistema DEVE mantenere storico delle sessioni.

## Regole di business

### PRD-03-BR-001
Il tempo effettivo NON DEVE andare perso in caso di chiusura imprevista del client.

### PRD-03-BR-002
Una focus session DEVE avere stato esplicito.

### PRD-03-BR-003
La stima originaria e quella aggiornata DOVREBBERO poter coesistere.

### PRD-03-BR-004
Il tempo manuale DEVE essere distinguibile da quello misurato.

## Acceptance criteria

### PRD-03-AC-001
Avviando un timer e chiudendolo, il tempo viene salvato contro il task corretto.

### PRD-03-AC-002
Inserendo una stima e successivamente un consuntivo, la deviazione viene calcolata.

### PRD-03-AC-003
Un report per progetto mostra effort stimato, effort effettivo e scostamento.

### PRD-03-AC-004
La capacità giornaliera impostata dall’utente è riutilizzabile nel workload.

## Rischi
- PRD-03-RSK-001: timer non resilienti a crash o sospensione
- PRD-03-RSK-002: analytics calcolati direttamente sul core write model
- PRD-03-RSK-003: confusione tra stima effort e durata pianificata

## Spunto implementativo
### Meta-programmazione
1. Distinguere `FocusSession` da `TimeEntry`.
2. Consolidare le sessioni grezze in metriche derivate.
3. Separare effort, durata e capacità.
4. Trattare gli analytics come projection layer derivato.
5. Garantire recovery del timer.
6. Conservare la fonte del dato temporale.
7. Prevedere aggregazioni incrementalmente aggiornabili.
8. Collegare il dato temporale al motore di forecast senza accoppiarlo alla UI.

---

# PRD-04 - Team Collaboration, Roles, Notifications and Ghost Users

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Definire il dominio della collaborazione: team, membership, ruoli, assegnazioni, notifiche e utenti placeholder.

## Entità dominio
- Team
- TeamMembership
- ProjectMembership
- Role
- PermissionPolicy
- Assignment
- GhostUser
- Notification
- UserConnection

## Requisiti funzionali

### PRD-04-FR-001
Il sistema DEVE consentire creazione e gestione di team.

### PRD-04-FR-002
Il sistema DEVE supportare ruoli standard:
- Owner
- Admin
- Editor
- Viewer

### PRD-04-FR-003
Il sistema DEVE supportare permessi di progetto distinti dalla membership di team.

### PRD-04-FR-004
Il sistema DEVE consentire assegnazione task a uno o più membri.

### PRD-04-FR-005
Il sistema DEVE supportare ghost user.

### PRD-04-FR-006
Il sistema DEVE supportare notifiche per assegnazioni, cambi di stato, menzioni e aggiornamenti rilevanti.

### PRD-04-FR-007
Il sistema DEVE supportare follower/watcher di task, deliverable, OKR e progetto.

### PRD-04-FR-008
Il sistema DEVE consentire connessioni tra utenti.

### PRD-04-FR-009
Il sistema DEVE consentire ruoli o permessi specifici per funzionalità di planning avanzato.

### PRD-04-FR-010
Il sistema DEVE consentire sostituzione controllata di ghost user con utenti reali.

## Regole di business

### PRD-04-BR-001
Un ghost user NON è un account autenticabile.

### PRD-04-BR-002
Owner e Admin NON sono semanticamente equivalenti.

### PRD-04-BR-003
Le notifiche DEVONO essere configurabili e deduplicabili.

### PRD-04-BR-004
Le permission policy DEVONO seguire default deny salvo concessione esplicita.

## Acceptance criteria

### PRD-04-AC-001
Un owner può creare un team e invitare membri.

### PRD-04-AC-002
Un viewer non può modificare un task se non autorizzato.

### PRD-04-AC-003
Un ghost user può essere assegnato a un task e comparire nella workload view.

### PRD-04-AC-004
Quando un task viene assegnato, il destinatario riceve una notifica coerente.

## Rischi
- PRD-04-RSK-001: sovrapposizione confusa tra team e progetto
- PRD-04-RSK-002: ghost user trattati come account incompleti
- PRD-04-RSK-003: permission model troppo rigido o troppo opaco

## Spunto implementativo
### Meta-programmazione
1. Separare identità, membership, ruolo e policy.
2. Modellare ghost user come tipo di risorsa e collaborazione.
3. Introdurre notification bus disaccoppiato dalla UI.
4. Definire policy di accesso per dominio e non solo per schermata.
5. Consentire permessi dedicati per planning, chart tab, baseline e template management.
6. Gestire i watcher come sottoscrizioni a eventi, non come campi statici.
7. Prevedere flusso esplicito di conversione ghost->real.
8. Tenere separati resource planning e access control.

---

# PRD-05 - Identity, Local Profiles and Authentication

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Definire i profili locali, la selezione all’avvio, il collegamento con identità remote e la readiness per autenticazione cloud.

## Entità dominio
- LocalProfile
- IdentityLink
- AuthSession
- OAuthProvider
- UserPreference

## Requisiti funzionali

### PRD-05-FR-001
Il sistema DEVE consentire creazione di profili locali offline.

### PRD-05-FR-002
Il sistema DEVE consentire selezione profilo all’avvio.

### PRD-05-FR-003
Il sistema DEVE supportare auto-login opzionale all’ultimo profilo.

### PRD-05-FR-004
Il sistema DEVE supportare collegamento futuro a identità remote.

### PRD-05-FR-005
Il sistema DEVE prevedere autenticazione OAuth2 in modalità cloud.

### PRD-05-FR-006
Il sistema DEVE distinguere profilo locale e identità remota.

### PRD-05-FR-007
Il sistema DEVE supportare logout locale e remoto distinti.

### PRD-05-FR-008
Il sistema DEVE consentire transizione controllata da profilo offline a profilo sincronizzato.

## Regole di business

### PRD-05-BR-001
Il profilo locale DEVE poter esistere senza account cloud.

### PRD-05-BR-002
Il binding tra profilo locale e account remoto DEVE essere controllato.

### PRD-05-BR-003
Le credenziali sensibili NON DEVONO essere salvate in chiaro.

## Acceptance criteria

### PRD-05-AC-001
L’app può essere usata con solo profilo locale.

### PRD-05-AC-002
Un utente può scegliere un profilo locale esistente all’avvio.

### PRD-05-AC-003
Un profilo locale può essere collegato in futuro a un identity provider senza perdita dati.

## Rischi
- PRD-05-RSK-001: confondere identità utente con account cloud
- PRD-05-RSK-002: impedire uso offline in assenza di auth remota
- PRD-05-RSK-003: merge dati locale/remoto non governato

## Spunto implementativo
### Meta-programmazione
1. Trattare il profilo locale come identità applicativa primaria.
2. Gestire l’identità remota come link opzionale.
3. Modellare bootstrap attorno alla selezione profilo.
4. Separare sessione locale, sessione remota e preferenze.
5. Preparare adapter OAuth2 per provider multipli.
6. Definire flussi di merge locale/remoto fin dall’inizio.
7. Non far dipendere il dominio locale dai token remoti.
8. Introdurre politiche di rebind e revoca.

---

# PRD-06 - Local-First Data Platform, Persistence, Migration and Health

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Definire persistenza locale, database esterni opzionali, migrazioni, soft delete, health e trasferimento dati.

## Entità dominio
- DataSourceConfig
- MigrationHistory
- SyncMetadata
- HealthStatus
- DatabaseTransferManifest

## Requisiti funzionali

### PRD-06-FR-001
Il sistema DEVE usare SQLite come datastore locale predefinito.

### PRD-06-FR-002
Il sistema DEVE consentire configurazione di database esterni supportati.

### PRD-06-FR-003
Il sistema DEVE usare soft delete per entità sincronizzabili.

### PRD-06-FR-004
Il sistema DEVE supportare un campo versione locale dove appropriato.

### PRD-06-FR-005
Il sistema DEVE avere createdAt, updatedAt e deletedAt o equivalente.

### PRD-06-FR-006
Il sistema DEVE supportare migrazioni schema versionate.

### PRD-06-FR-007
Il sistema DEVE supportare export/import del database.

### PRD-06-FR-008
Il sistema DEVE esporre un health check o equivalente diagnostico.

### PRD-06-FR-009
Il sistema DEVE autodetectare dati validi al collegamento di un nuovo datasource.

### PRD-06-FR-010
Il sistema DEVE essere osservabile nei componenti storage, db e sync.

## Regole di business

### PRD-06-BR-001
La cancellazione logica DEVE essere la modalità standard per le entità sincronizzabili.

### PRD-06-BR-002
Le migrazioni DEVONO essere tracciate.

### PRD-06-BR-003
Il cambio database NON DEVE alterare semanticamente gli identificatori di dominio oltre quanto necessario.

## Acceptance criteria

### PRD-06-AC-001
L’applicazione si avvia correttamente su SQLite senza configurazione esterna.

### PRD-06-AC-002
Un backup completo può essere esportato e reimportato con dati coerenti.

### PRD-06-AC-003
Una migrazione incrementale aggiorna lo schema senza perdita dati.

### PRD-06-AC-004
Lo stato del servizio e del database è consultabile tramite health endpoint o diagnostica equivalente.

## Rischi
- PRD-06-RSK-001: SQL dipendente dal motore
- PRD-06-RSK-002: confondere export funzionale e backup tecnico
- PRD-06-RSK-003: migrazioni non idempotenti o non verificabili

## Spunto implementativo
### Meta-programmazione
1. Separare dominio, repository astratti e provider di persistenza.
2. Trattare la configurazione del datasource come entità di sistema.
3. Fare del soft delete parte del contratto query.
4. Eseguire migrazioni come pipeline di bootstrap verificabile.
5. Distinguere health di storage, db, sync, filesystem.
6. Implementare export/import con manifest.
7. Trattare db esterni come provider alternativi, non come semplice cambio di URL.
8. Integrare logging strutturato e diagnostica sin dall’inizio.

---

# PRD-07 - Asset Management, Attachments and File Storage

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Gestire allegati e asset in modo locale, astratto, referenziabile e compatibile con backup e sync.

## Entità dominio
- Asset
- AssetLink
- StorageProvider
- TransferBundleEntry

## Requisiti funzionali

### PRD-07-FR-001
Il sistema DEVE consentire allegati a task, note, progetti, deliverable e charter.

### PRD-07-FR-002
Ogni asset DEVE avere metadati minimi:
- nome
- tipo
- dimensione
- hash o fingerprint
- reference di storage

### PRD-07-FR-003
Il sistema DEVE usare file system locale come implementazione iniziale.

### PRD-07-FR-004
Il sistema DEVE astrarre il provider di storage.

### PRD-07-FR-005
Gli asset DEVONO essere inclusi in backup ed export completi.

### PRD-07-FR-006
Il sistema DEVE supportare cleanup sicuro e rimozione logica.

### PRD-07-FR-007
Il sistema DEVE consentire preview o apertura ove possibile.

## Regole di business

### PRD-07-BR-001
L’asset è un oggetto di dominio tecnico, non solo un path.

### PRD-07-BR-002
La cancellazione di un link NON DEVE implicare cancellazione immediata del file se altri riferimenti esistono.

### PRD-07-BR-003
L’integrità dell’asset DOVREBBE essere verificabile.

## Acceptance criteria

### PRD-07-AC-001
Un file allegato a un task è recuperabile dal dettaglio task.

### PRD-07-AC-002
Lo stesso asset può essere collegato a task e nota senza duplicazione fisica obbligatoria.

### PRD-07-AC-003
Un export completo include gli asset referenziati.

## Rischi
- PRD-07-RSK-001: esporre dettagli di storage alla UI
- PRD-07-RSK-002: perdita di coerenza tra asset e link
- PRD-07-RSK-003: deduplica non controllata

## Spunto implementativo
### Meta-programmazione
1. Separare file fisico, metadato asset e link relazionale.
2. Introdurre un contratto provider neutrale.
3. Prevedere fingerprinting per integrità e deduplica.
4. Includere gli asset nei manifest di trasferimento.
5. Gestire cleanup come processo separato.
6. Non esporre mai path reali come parte del dominio UI.
7. Preparare compatibilità con storage remoto.
8. Considerare chunking o streaming in evoluzione futura.

---

# PRD-08 - Advanced Planning Model

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Introdurre WBS, milestone, summary task, dipendenze tipizzate e campi pianificatori.

## In scope
- gerarchia task
- task type
- dipendenze
- lead/lag
- scheduling fields
- ricalcolo
- WBS numbering

## Out of scope
- simulazioni probabilistiche
- PMO enterprise cost model completo
- resource leveling automatico avanzato

## Attori
- planner
- project lead
- PM
- resource manager

## Entità dominio
- PlanningTaskState
- TaskHierarchy
- Dependency
- DependencyType
- WbsNode
- SchedulingConstraint

## Requisiti funzionali

### PRD-08-FR-001
Il sistema DEVE supportare task type:
- standard task
- summary task
- milestone

### PRD-08-FR-002
Il sistema DEVE supportare relazioni parent-child.

### PRD-08-FR-003
Il sistema DEVE generare numerazione WBS coerente.

### PRD-08-FR-004
Il sistema DEVE supportare dipendenze:
- FS
- SS
- FF
- SF

### PRD-08-FR-005
Il sistema DEVE supportare lead e lag.

### PRD-08-FR-006
Il sistema DEVE supportare plannedStart, plannedFinish e plannedDuration.

### PRD-08-FR-007
Il sistema DEVE rilevare e impedire dipendenze cicliche non consentite.

### PRD-08-FR-008
Il sistema DEVE supportare ricalcolo del piano su modifica strutturale.

### PRD-08-FR-009
Il sistema DEVE permettere task semplici anche senza planning attivo.

### PRD-08-FR-010
Il sistema DEVE consentire task bloccati da dipendenze aperte.

## Regole di business

### PRD-08-BR-001
Una milestone DEVE avere durata nulla o equivalente.

### PRD-08-BR-002
La gerarchia WBS NON DEVE essere ciclica.

### PRD-08-BR-003
Le date pianificate NON DEVONO sovrascrivere il dato effettivo.

### PRD-08-BR-004
Un summary task NON DEVE essere semanticamente incoerente con i child.

## Acceptance criteria

### PRD-08-AC-001
Un utente può creare milestone in un progetto.

### PRD-08-AC-002
Collegando Task B a Task A con relazione FS, il piano riflette la dipendenza.

### PRD-08-AC-003
Un tentativo di creare una dipendenza ciclica viene respinto o segnalato.

### PRD-08-AC-004
Un task semplice senza planning resta pienamente utilizzabile.

## Rischi
- PRD-08-RSK-001: task core sovraccaricato
- PRD-08-RSK-002: dipendenze gestite come testo e non come grafo
- PRD-08-RSK-003: ricalcolo non deterministico

## Spunto implementativo
### Meta-programmazione
1. Mantenere planning state separato dal task core.
2. Modellare dipendenze come edge di grafo tipizzato.
3. Definire un motore di ricalcolo indipendente dalla vista.
4. Separare date inserite dall’utente da date calcolate.
5. Trattare WBS come proiezione derivata della gerarchia.
6. Garantire validazioni pre-commit e post-merge.
7. Esporre command model per indent/outdent, milestone conversion, link editing.
8. Conservare un livello “light mode” per i progetti non pianificati.

---

# PRD-09 - Work Calendars and Capacity Engine

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Introdurre un dominio di calendari e capacità che renda realistiche date, assegnazioni e carico.

## Entità dominio
- WorkCalendar
- WorkDayRule
- CalendarException
- HolidayRule
- CapacityRule
- AvailabilityWindow

## Requisiti funzionali

### PRD-09-FR-001
Il sistema DEVE supportare calendari per:
- utente
- team
- progetto
- workspace

### PRD-09-FR-002
Il sistema DEVE supportare giorni lavorativi e non lavorativi.

### PRD-09-FR-003
Il sistema DEVE supportare orari di lavoro giornalieri.

### PRD-09-FR-004
Il sistema DEVE supportare eccezioni temporanee.

### PRD-09-FR-005
Il sistema DEVE supportare festività.

### PRD-09-FR-006
Il sistema DEVE supportare capacità giornaliera e settimanale.

### PRD-09-FR-007
Il sistema DEVE consentire associazione calendario a progetto, team, utente e task.

### PRD-09-FR-008
Il sistema DEVE supportare fallback e ereditarietà di calendario.

### PRD-09-FR-009
Il sistema DEVE fornire al dominio finestre temporali interrogabili.

### PRD-09-FR-010
Il sistema DEVE supportare duplicazione e personalizzazione di calendari.

## Regole di business

### PRD-09-BR-001
Deve esistere un calendario di default.

### PRD-09-BR-002
Le eccezioni DEVONO prevalere sui pattern standard.

### PRD-09-BR-003
Capacità teorica e capacità allocabile NON DEVONO essere confuse.

## Acceptance criteria

### PRD-09-AC-001
Un utente può definire una settimana lavorativa personalizzata.

### PRD-09-AC-002
Una festività impostata esclude correttamente il giorno dai calcoli.

### PRD-09-AC-003
Un progetto senza calendario esplicito usa il fallback previsto.

### PRD-09-AC-004
Il workload per utente rispetta il calendario personale o di fallback.

## Rischi
- PRD-09-RSK-001: modellazione temporale insufficiente
- PRD-09-RSK-002: calendario trattato come semplice attributo numerico
- PRD-09-RSK-003: mancanza di audit su modifiche impattanti

## Spunto implementativo
### Meta-programmazione
1. Definire il calendario come bounded context.
2. Separare regole ricorrenti, eccezioni e capacità.
3. Definire una chain di resolution deterministica.
4. Fornire API di dominio che restituiscano finestre disponibili.
5. Rendere il motore consumabile da planning, workload, dashboard e analytics.
6. Tracciare eventi di modifica del calendario.
7. Supportare versioning o almeno storicizzazione leggera.
8. Prevedere reprocessing selettivo quando il calendario cambia.

---

# PRD-10 - Views, Timeline, Gantt, Board, Workload and Cross-View Experience

## Stato rispetto alla versione precedente
**PRD modificato in profondità**
La parte Timeline/Gantt e molte viste analitiche non esistevano prima in forma strutturata

## Scopo
Definire tutte le superfici principali di lettura, modifica e analisi: lista, Kanban, timeline, Gantt, workload, chart tab e navigazione cross-view.

## In scope
- lista
- Kanban
- timeline
- Gantt
- workload view
- chart tab come superficie sintetica
- filtri e selection context condivisi

## Out of scope
- dashboard BI general purpose
- whiteboard collaborativa
- editor grafico arbitrario

## Attori
- utente individuale
- team lead
- PM
- planner
- stakeholder

## Entità dominio
- ViewPreset
- ViewLayout
- TimelineRange
- BoardColumn
- GanttViewport
- SelectionContext
- DashboardViewport

## Requisiti funzionali

### PRD-10-FR-001
Il sistema DEVE supportare vista lista.

### PRD-10-FR-002
Il sistema DEVE supportare board Kanban.

### PRD-10-FR-003
Il sistema DEVE supportare timeline view.

### PRD-10-FR-004
Il sistema DEVE supportare Gantt view con:
- barre task
- milestone
- summary task
- dipendenze
- zoom
- drag di date dove consentito

### PRD-10-FR-005
Il sistema DEVE supportare workload view.

### PRD-10-FR-006
Il sistema DEVE supportare chart tab o dashboard sintetica di progetto.

### PRD-10-FR-007
Il sistema DEVE condividere un selection context tra viste.

### PRD-10-FR-008
Il sistema DEVE supportare filtri trasversali per:
- progetto
- utente
- tag
- stato
- fase
- deliverable
- periodo

### PRD-10-FR-009
Le viste DEVONO evidenziare:
- task bloccati
- task in ritardo
- overbooking
- milestone imminenti
- deliverable a rischio

### PRD-10-FR-010
Il sistema DEVE consentire salvataggio di preset di vista.

### PRD-10-FR-011
La chart tab DEVE poter aggregare componenti del PRD-17.

### PRD-10-FR-012
Il sistema DEVE consentire viste template-specifiche precaricate dal PRD-16.

## Regole di business

### PRD-10-BR-001
Le viste NON DEVONO divergere sul dato di verità.

### PRD-10-BR-002
Il drag and drop DEVE rispettare permessi e vincoli di planning.

### PRD-10-BR-003
Le modifiche grafiche in timeline/Gantt DEVONO produrre comandi di dominio reali.

### PRD-10-BR-004
Le viste avanzate DOVREBBERO essere attivabili progressivamente.

## Acceptance criteria

### PRD-10-AC-001
Lo stesso task è navigabile da lista, board e Gantt senza perdita di contesto.

### PRD-10-AC-002
Spostando un task in board, lo stato cambia nel dominio e si riflette altrove.

### PRD-10-AC-003
Modificando una data in Gantt, la timeline e il dettaglio task si aggiornano.

### PRD-10-AC-004
La workload view mostra il carico coerente con assegnazioni e capacità.

### PRD-10-AC-005
La chart tab rende visibili metriche, deliverable, rischi e timeline di alto livello.

## Rischi
- PRD-10-RSK-001: vista come fonte di verità
- PRD-10-RSK-002: incoerenza tra cross-view actions
- PRD-10-RSK-003: overload cognitivo con troppe superfici

## Spunto implementativo
### Meta-programmazione
1. Trattare le viste come projection layer.
2. Introdurre un selection context condiviso.
3. Separare comandi di editing da componenti grafici.
4. Modellare timeline e Gantt come viste derivate del planning state.
5. Trattare la chart tab come composizione di widget dominio-specifici, non come canvas libero.
6. Prevedere preset, filtri salvati e layout per ruolo.
7. Rendere i componenti di vista composabili e template-aware.
8. Far sì che ogni azione visuale invochi un command handler di dominio.

---

# PRD-11 - Baseline, Variance, Forecasting and Execution Control

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Definire il controllo esecutivo del progetto tramite baseline, scostamenti, previsioni, avanzamento, deliverable tracking e metriche di performance.

## In scope
- baseline
- variance
- forecast
- execution alerts
- tracking deliverable
- project progress
- budget/ore/costi leggeri
- percentuali di completamento

## Out of scope
- earned value enterprise completo
- controllo finanziario multi-centro di costo
- procurement

## Attori
- PM
- team lead
- controller leggero
- stakeholder
- project sponsor

## Entità dominio
- Baseline
- BaselineTaskSnapshot
- VarianceMetric
- ForecastModel
- ExecutionAlert
- DeliverableProgress
- BudgetTrackingEntry
- ProjectKpiSnapshot

## Requisiti funzionali

### PRD-11-FR-001
Il sistema DEVE consentire creazione di baseline immutabili di progetto.

### PRD-11-FR-002
Il sistema DEVE confrontare planned vs actual.

### PRD-11-FR-003
Il sistema DEVE calcolare variance su:
- durata
- effort
- avanzamento
- data di fine prevista

### PRD-11-FR-004
Il sistema DEVE fornire forecast di completamento.

### PRD-11-FR-005
Il sistema DEVE supportare snapshot multipli nel tempo.

### PRD-11-FR-006
Il sistema DEVE supportare tracking di deliverable con percentuale di completamento.

### PRD-11-FR-007
Il sistema DEVE supportare tracking leggero di budget, costi o ore, dove abilitato dal template o progetto.

### PRD-11-FR-008
Il sistema DEVE distinguere metriche target vs achieved.

### PRD-11-FR-009
Il sistema DEVE generare alert su slittamento, variance e deliverable a rischio.

### PRD-11-FR-010
Il sistema DEVE esporre KPI sintetici consumabili dalla chart tab.

## Regole di business

### PRD-11-BR-001
Le baseline NON DEVONO essere modificabili.

### PRD-11-BR-002
Il budget tracking leggero NON DEVE essere confuso con contabilità ufficiale.

### PRD-11-BR-003
Le metriche target e achieved DEVONO mantenere origine e timestamp.

### PRD-11-BR-004
Le variance DEVONO distinguere almeno tra schedule variance e effort variance.

## Acceptance criteria

### PRD-11-AC-001
Un PM può congelare una baseline e confrontarla col piano corrente.

### PRD-11-AC-002
Un deliverable può mostrare avanzamento percentuale.

### PRD-11-AC-003
Una dashboard di tracking mostra target vs achieved.

### PRD-11-AC-004
Un alert compare quando la data prevista slitta oltre una soglia configurata.

### PRD-11-AC-005
In un progetto che usa tracking di budget, costi o ore, i dati aggregati sono visibili senza alterare il core task model.

## Rischi
- PRD-11-RSK-001: introdurre controllo economico troppo complesso troppo presto
- PRD-11-RSK-002: sovrapporre KPI, baseline e report manuali
- PRD-11-RSK-003: formule derivate non verificabili

## Spunto implementativo
### Meta-programmazione
1. Trattare baseline come snapshot append-only.
2. Calcolare KPI e variance come projection layer.
3. Separare tracking budget/ore/costi come capability opzionale per template o progetto.
4. Definire deliverable progress come entità aggregata verificabile.
5. Esporre target e achieved come metric records con tempo e fonte.
6. Introdurre motore alert configurabile.
7. Non scrivere direttamente forecast nei task; derivarli da modelli e metriche.
8. Rendere le formule di tracking esplicite, ispezionabili e testabili.

---

# PRD-12 - Resource Planning and Allocation

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Definire la pianificazione delle risorse, distinguendo assegnazione logica, effort, capacità e carico.

## Entità dominio
- Resource
- ResourceAllocation
- TaskAssignment
- WorkloadSlice
- CapacitySnapshot
- OverAllocationAlert

## Requisiti funzionali

### PRD-12-FR-001
Il sistema DEVE supportare assegnazioni multiple per task.

### PRD-12-FR-002
Il sistema DEVE supportare effort per assignee.

### PRD-12-FR-003
Il sistema DEVE supportare capacità per risorsa.

### PRD-12-FR-004
Il sistema DEVE calcolare workload per giorno, settimana e intervallo.

### PRD-12-FR-005
Il sistema DEVE supportare ghost user come risorse pianificabili.

### PRD-12-FR-006
Il sistema DEVE mostrare carico vs capacità.

### PRD-12-FR-007
Il sistema DEVE rilevare overbooking.

### PRD-12-FR-008
Il sistema DEVE supportare riassegnazione o riequilibrio.

### PRD-12-FR-009
Il sistema DEVE distinguere owner del task da assignee esecutivi.

### PRD-12-FR-010
Il sistema DEVE esporre dati per la workload view e la chart tab.

## Regole di business

### PRD-12-BR-001
L’assegnazione non implica automaticamente distribuzione uniforme dell’effort.

### PRD-12-BR-002
Il workload DEVE rispettare calendario e capacità.

### PRD-12-BR-003
L’overbooking DEVE essere calcolato su un periodo esplicito.

## Acceptance criteria

### PRD-12-AC-001
Un task può essere assegnato a più persone con effort distinti.

### PRD-12-AC-002
La workload view mostra sovraccarico quando la capacità è superata.

### PRD-12-AC-003
Un ghost user assegnato compare come risorsa pianificabile.

### PRD-12-AC-004
La riassegnazione si riflette nel carico aggregato.

## Rischi
- PRD-12-RSK-001: confondere membership con capacità
- PRD-12-RSK-002: carico derivato in modo incoerente con il calendario
- PRD-12-RSK-003: allocazione troppo implicita

## Spunto implementativo
### Meta-programmazione
1. Separare `TaskAssignment` da `ResourceAllocation`.
2. Trattare il carico come derivato da task, effort, calendario e capacità.
3. Costruire un motore di slicing temporale.
4. Modellare il sovraccarico come alert derivato.
5. Consentire estensioni future a capacità part-time o periodiche.
6. Mantenere la distinzione tra collaboration layer e resource layer.
7. Rendere le allocazioni interrogabili per periodo.
8. Preparare strutture compatibili con dashboard charter e tracking.

---

# PRD-13 - Planning-Aware Sync and Conflict Resolution

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Definire una strategia di sincronizzazione semanticamente consapevole per note, task, checklist, WBS, dipendenze, calendari, deliverable, metriche e dashboard data.

## Entità dominio
- SyncState
- SyncOperation
- ConflictRecord
- MergePolicy
- AuditEvent
- RecalculationRequest

## Requisiti funzionali

### PRD-13-FR-001
Ogni entità sincronizzabile DEVE avere sync status.

### PRD-13-FR-002
Gli stati minimi DEVONO includere:
- LOCAL_ONLY
- PENDING_SYNC
- SYNCED
- CONFLICT
- SOFT_DELETED

### PRD-13-FR-003
Il sistema DEVE usare policy di merge differenziate per:
- testo
- set/tag
- checklist
- gerarchie
- grafi di dipendenza
- allocazioni
- calendari
- baseline
- KPI records
- deliverable progress

### PRD-13-FR-004
LWW DEVE essere limitato ai casi semanticamente appropriati.

### PRD-13-FR-005
Il sistema DEVE supportare conflict review manuale.

### PRD-13-FR-006
Il sistema DEVE registrare audit log delle modifiche critiche.

### PRD-13-FR-007
Il sistema DEVE innescare ricalcolo del piano dopo merge impattanti.

### PRD-13-FR-008
Le baseline sincronizzate DEVONO restare immutabili.

### PRD-13-FR-009
Il sistema DEVE preservare le cancellazioni logiche in sync.

### PRD-13-FR-010
Il sistema DEVE poter risolvere conflitti anche su metriche target/achieved e deliverable progress.

## Regole di business

### PRD-13-BR-001
Le dipendenze DEVONO essere trattate come edge di grafo.

### PRD-13-BR-002
Le checklist DEVONO avere merge per item e ordering policy.

### PRD-13-BR-003
I tag DEVONO poter essere fusi per unione d’insieme.

### PRD-13-BR-004
Le baseline NON DEVONO essere fuse distruttivamente.

### PRD-13-BR-005
Le metriche di dashboard DEVONO preservare fonte e timestamp.

## Acceptance criteria

### PRD-13-AC-001
Una modifica concorrente a note e tag si risolve senza perdere tag validi.

### PRD-13-AC-002
Un conflitto su gerarchia task produce o merge valido o review manuale.

### PRD-13-AC-003
Dopo merge di dipendenze, il piano viene ricalcolato.

### PRD-13-AC-004
Una baseline sincronizzata non viene modificata da un update concorrente.

## Rischi
- PRD-13-RSK-001: LWW applicato indiscriminatamente
- PRD-13-RSK-002: conflitti invisibili sul grafo di piano
- PRD-13-RSK-003: dashboard con KPI incoerenti dopo sync

## Spunto implementativo
### Meta-programmazione
1. Non modellare la sync come mero CRUD replication.
2. Catalogare ogni aggregate per strategia di merge.
3. Introdurre conflict record first-class.
4. Tenere audit append-only per modifiche planning e dashboard critiche.
5. Eseguire merge e ricalcolo in passi separati.
6. Distinguere merge di testo, set, lista ordinata, grafo, gerarchia e snapshot.
7. Consentire review manuale con contesto.
8. Rendere il pipeline di sync osservabile, testabile e idempotente.

---

# PRD-14 - Integrations, Import/Export, Calendar Feeds and Interoperability

## Stato rispetto alla versione precedente
**PRD modificato ed esteso**

## Scopo
Definire integrazioni e scambi dati con il mondo esterno.

## Entità dominio
- ExportJob
- ImportJob
- CalendarFeedToken
- TransferManifest
- ExternalMappingProfile

## Requisiti funzionali

### PRD-14-FR-001
Il sistema DEVE fornire un link ICS privato per sincronizzazione calendario.

### PRD-14-FR-002
Il sistema DEVE consentire configurazione di quali entità includere nel feed ICS.

### PRD-14-FR-003
Il sistema DEVE supportare export progetto in CSV e JSON.

### PRD-14-FR-004
Il sistema DEVE supportare import CSV per task, progetti, deliverable e metriche leggere, dove mappabili.

### PRD-14-FR-005
Il sistema DEVE supportare export di note e allegati ove consentito.

### PRD-14-FR-006
Il sistema DEVE supportare export PDF o equivalente per charter, chart tab, timeline e Gantt in roadmap evolutiva.

### PRD-14-FR-007
Il sistema DEVE supportare manifest di trasferimento.

### PRD-14-FR-008
Il sistema DOVREBBE poter estendere in futuro import/export verso formati di planning professionale.

### PRD-14-FR-009
Il sistema DEVE gestire import/export come job tracciabili con esito.

## Regole di business

### PRD-14-BR-001
Il token ICS DEVE essere rigenerabile.

### PRD-14-BR-002
L’import DEVE usare validazione e staging logico prima del commit.

### PRD-14-BR-003
L’export NON DEVE alterare i dati sorgente.

## Acceptance criteria

### PRD-14-AC-001
Un feed ICS può essere sottoscritto da un calendario esterno.

### PRD-14-AC-002
Un export CSV di progetto contiene task e campi attesi.

### PRD-14-AC-003
Un import CSV con mapping valido crea entità coerenti.

### PRD-14-AC-004
Un export di chart tab o project charter è producibile in output leggibile.

## Rischi
- PRD-14-RSK-001: import distruttivi senza staging
- PRD-14-RSK-002: esposizione di token ICS non rigenerabili
- PRD-14-RSK-003: proliferazione di serializzazioni incoerenti

## Spunto implementativo
### Meta-programmazione
1. Modellare import/export come job con log.
2. Distinguere backup tecnico da export funzionale.
3. Definire mapping profile versionati.
4. Trattare ICS come proiezione controllata.
5. Costruire pipeline di staging, validation, commit.
6. Centralizzare il layer di serializzazione.
7. Preparare adapter per formati futuri senza contaminare il core.
8. Consentire export di dashboard e charter come projection statiche.

---

# PRD-15 - Onboarding, Preferences, Workspace and Operational Configuration

## Stato rispetto alla versione precedente
**PRD modificato**

## Scopo
Definire primo avvio, bootstrap, modalità operative, preferenze, layout e configurazione del workspace.

## Entità dominio
- Workspace
- WorkspacePreference
- SessionState
- ViewPreset
- SetupProfile
- DiagnosticSnapshot

## Requisiti funzionali

### PRD-15-FR-001
Il sistema DEVE guidare la creazione del primo profilo.

### PRD-15-FR-002
Il sistema DEVE consentire scelta o creazione profilo all’avvio.

### PRD-15-FR-003
Il sistema DEVE supportare preferenze globali e per profilo.

### PRD-15-FR-004
Il sistema DEVE consentire configurazione di:
- default view
- notifiche
- auto-login
- planning mode
- calendario di default
- capacità di default

### PRD-15-FR-005
Il sistema DEVE supportare autodetection dati su nuovo datasource.

### PRD-15-FR-006
Il sistema DEVE ripristinare stato essenziale della sessione.

### PRD-15-FR-007
Il sistema DEVE consentire setup iniziale dei moduli visibili:
- task base
- note
- team
- planning
- templates
- dashboard

### PRD-15-FR-008
Il sistema DEVE supportare view preset e layout salvabili.

### PRD-15-FR-009
Il sistema DEVE supportare diagnostica base di bootstrap.

### PRD-15-FR-010
Il sistema DEVE consentire l’adozione di un template progetto durante l’onboarding di un nuovo progetto.

## Regole di business

### PRD-15-BR-001
L’onboarding NON DEVE bloccare il primo uso.

### PRD-15-BR-002
La modalità avanzata DOVREBBE essere attivabile progressivamente.

### PRD-15-BR-003
Le preferenze globali e per profilo NON DEVONO essere confuse.

## Acceptance criteria

### PRD-15-AC-001
Un utente può completare onboarding e creare il primo task o progetto in pochi passaggi.

### PRD-15-AC-002
La riapertura sessione ripristina la vista predefinita e contesto essenziale.

### PRD-15-AC-003
Durante la creazione progetto è possibile selezionare un template.

### PRD-15-AC-004
Le preferenze di planning possono essere disattivate per progetti semplici.

## Rischi
- PRD-15-RSK-001: bootstrap troppo lungo
- PRD-15-RSK-002: confondere setup tecnico e setup funzionale
- PRD-15-RSK-003: eccesso di configurazione iniziale

## Spunto implementativo
### Meta-programmazione
1. Separare onboarding, bootstrap tecnico e setup workspace.
2. Introdurre setup profile orientati a persona, team, planner, marketing.
3. Rendere visibili moduli e viste in modo progressivo.
4. Tracciare stato sessione e layout separatamente dal dominio.
5. Integrare template selection come parte del create-project flow.
6. Offrire default forti ma personalizzabili.
7. Includere diagnostica minima nel bootstrap.
8. Distinguere preferenze utente, workspace e progetto.

---

# PRD-16 - Project Templates, Guided Setup and Reusable Blueprints

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Definire un sistema di template di progetto che consenta la creazione rapida di progetti con struttura, viste, fasi, deliverable, metriche e dashboard preconfigurate.

## Contesto
I riferimenti visuali forniti introducono chiaramente l’esigenza di una **Template Gallery** con esempi come:

- Project Timeline
- Project Tracking
- Gantt Chart
- Event Marketing Timeline

JinnLog DEVE integrare questa capability come sistema nativo.

## In scope
- template gallery
- creazione progetto da template
- blueprint strutturali
- set di viste precaricate
- fasi, deliverable, metriche, charter predefiniti
- template domain-specific

## Out of scope
- marketplace pubblico di template in prima fase
- scripting arbitrario di template
- template engine libero non governato

## Attori
- utente individuale
- PM
- marketing lead
- team lead
- amministratore workspace
- template designer interno

## Entità dominio
- ProjectTemplate
- TemplateBlueprint
- TemplateSection
- TemplatePhase
- TemplateDeliverable
- TemplateMetric
- TemplateViewPreset
- TemplateFieldPreset
- TemplateRiskPreset
- TemplateOkrPreset

## Requisiti funzionali

### PRD-16-FR-001
Il sistema DEVE fornire una Template Gallery navigabile.

### PRD-16-FR-002
La Template Gallery DEVE includere almeno i template di sistema:
- Project Timeline
- Project Tracking
- Gantt Project
- Event Marketing Timeline

### PRD-16-FR-003
Ogni template DEVE poter definire:
- struttura di progetto
- fasi
- viste iniziali
- campi suggeriti
- deliverable
- metriche
- charter/dashboard widgets
- tag iniziali
- regole di tracking

### PRD-16-FR-004
L’utente DEVE poter creare un progetto partendo da un template.

### PRD-16-FR-005
Il sistema DEVE consentire la personalizzazione del progetto creato da template senza modificare il template sorgente.

### PRD-16-FR-006
Il sistema DEVE distinguere tra template di sistema e template utente/workspace.

### PRD-16-FR-007
Il template “Project Timeline” DEVE precaricare una timeline per fasi principali.

### PRD-16-FR-008
Il template “Project Tracking” DEVE precaricare strutture per tracking di budget/ore, deliverable e KPI.

### PRD-16-FR-009
Il template “Gantt Project” DEVE precaricare la vista Gantt e il planning layer attivo.

### PRD-16-FR-010
Il template “Event Marketing Timeline” DEVE precaricare fasi, task e deliverable tipici per attività di marketing/eventi.

### PRD-16-FR-011
Ogni template DEVE avere descrizione, casi d’uso e prerequisiti funzionali.

### PRD-16-FR-012
Il sistema DOVREBBE consentire clonazione di un template esistente per crearne uno derivato.

## Regole di business

### PRD-16-BR-001
Un template NON DEVE essere un progetto vivo; deve essere un blueprint.

### PRD-16-BR-002
La creazione di un progetto da template DEVE istanziare entità nuove e indipendenti.

### PRD-16-BR-003
Un template che richiede planning avanzato DEVE dichiararlo esplicitamente.

### PRD-16-BR-004
Un template NON DEVE imporre moduli che il workspace non supporta, salvo fallback dichiarato.

### PRD-16-BR-005
I template di sistema DEVONO essere versionabili.

## Acceptance criteria

### PRD-16-AC-001
L’utente vede una galleria template con categorie e descrizioni.

### PRD-16-AC-002
Selezionando “Project Timeline”, il progetto creato contiene fasi e vista timeline preconfigurate.

### PRD-16-AC-003
Selezionando “Project Tracking”, il progetto creato espone dashboard e campi di tracking coerenti.

### PRD-16-AC-004
Selezionando “Gantt Project”, la vista Gantt è disponibile e il layer planning è attivo.

### PRD-16-AC-005
Selezionando “Event Marketing Timeline”, sono disponibili fasi e deliverable tipici del caso d’uso.

### PRD-16-AC-006
Modificare il progetto creato da template non altera il template sorgente.

## Rischi

### PRD-16-RSK-001
Template troppo rigidi o troppo generici.

### PRD-16-RSK-002
Template che duplicano logiche già nel dominio.

### PRD-16-RSK-003
Versioning dei template non governato.

### PRD-16-RSK-004
Template che attivano moduli avanzati senza guidare l’utente.

## Spunto implementativo
### Meta-programmazione
1. Modellare il template come blueprint serializzabile e versionabile.
2. Separare i layer del template:
   - struttura progetto
   - dati iniziali
   - view preset
   - widget dashboard
   - metriche e charter
3. Introdurre un template instantiation service che materializzi nuove entità.
4. Definire capability requirements per ciascun template.
5. Rendere la galleria metadata-driven.
6. Consentire template di sistema, workspace e utente.
7. Implementare template-specific defaults senza hardcodare nei form standard.
8. Prevedere migrazione/versioning dei template e compatibilità forward.

---

# PRD-17 - Executive Dashboard, Project Tracking, Charter and Chart Tab

## Stato rispetto alla versione precedente
**PRD nuovo**
**Questo PRD non esisteva prima**

## Scopo
Definire una vista esecutiva e sintetica del progetto che unisca charter, team, obiettivi, business case, metriche, target vs achieved, rischi, deliverable, OKR e timeline di alto livello.

## Contesto
I riferimenti visuali forniti mostrano una vista “chart tab” o “tracking sheet” con componenti come:

- Team
- Goals / Problem statement
- Key success metrics
- Target
- Achieved
- Business case
- Risks
- Key deliverables
- OKRs
- Timeline per fasi

JinnLog DEVE integrare questa capability come dashboard strutturata e non come semplice layout statico.

## In scope
- project charter
- dashboard esecutiva
- chart tab
- tracking sintetico del progetto
- business case
- target vs achieved
- risk register visuale
- deliverable board sintetica
- OKR panel
- phase timeline ad alto livello

## Out of scope
- BI generica
- grafici arbitrari completamente custom in prima fase
- gestione strategica corporate multi-portfolio avanzata

## Attori
- project sponsor
- PM
- team lead
- stakeholder
- dirigente operativo
- PMO light

## Entità dominio
- ProjectCharter
- TeamRoleCard
- ProblemStatement
- BusinessCase
- SuccessMetric
- TargetAchievedRecord
- RiskRegisterEntry
- Deliverable
- Okr
- OkrKeyResult
- PhaseTimeline
- DashboardWidget
- DashboardLayout

## Requisiti funzionali

### PRD-17-FR-001
Il sistema DEVE supportare una Chart Tab o Executive Dashboard per progetto.

### PRD-17-FR-002
La dashboard DEVE includere un pannello Team con almeno:
- sponsor
- project manager
- team core
- ruoli rilevanti

### PRD-17-FR-003
La dashboard DEVE includere una sezione Goals / Problem Statement.

### PRD-17-FR-004
La dashboard DEVE includere una sezione Business Case.

### PRD-17-FR-005
La dashboard DEVE supportare Key Success Metrics con:
- nome metrica
- target
- achieved
- unità di misura
- timestamp o periodo

### PRD-17-FR-006
La dashboard DEVE supportare Risk register sintetico.

### PRD-17-FR-007
La dashboard DEVE supportare Key Deliverables.

### PRD-17-FR-008
La dashboard DEVE supportare OKR del progetto o della fase.

### PRD-17-FR-009
La dashboard DEVE supportare una Timeline di alto livello per fasi.

### PRD-17-FR-010
Il sistema DEVE consentire layout dashboard predefiniti e template-driven.

### PRD-17-FR-011
Le componenti della dashboard DEVONO leggere dal dominio esistente e non duplicare dati divergenti.

### PRD-17-FR-012
Il sistema DEVE supportare tracking sintetico di:
- ore
- costi leggeri
- deliverable completati
- metriche achieved vs target
dove abilitato.

### PRD-17-FR-013
La dashboard DEVE supportare stato sintetico del progetto:
- on track
- at risk
- delayed
- blocked
o equivalente configurabile.

### PRD-17-FR-014
La dashboard DEVE poter essere esportata o condivisa in formato leggibile.

### PRD-17-FR-015
La dashboard DOVREBBE supportare componenti visuali a colori o semafori di stato, pur mantenendo leggibilità testuale.

## Regole di business

### PRD-17-BR-001
Il project charter DEVE essere un oggetto strutturato, non una singola nota non interrogabile.

### PRD-17-BR-002
Ogni metrica target/achieved DEVE avere unità di misura e periodo espliciti.

### PRD-17-BR-003
Rischi, deliverable e OKR DEVONO essere entità interrogabili o strutture dominio-first.

### PRD-17-BR-004
La dashboard NON DEVE contenere dati calcolati in modo non spiegabile o non tracciabile.

### PRD-17-BR-005
La timeline di alto livello della dashboard NON sostituisce la Gantt, ma ne rappresenta una sintesi.

### PRD-17-BR-006
La dashboard DEVE poter esistere anche per progetti non completamente pianificati, con graceful degradation.

## Acceptance criteria

### PRD-17-AC-001
Un project manager può compilare sponsor, PM, core team e ruoli nel pannello Team.

### PRD-17-AC-002
Un progetto può avere Problem Statement e Business Case strutturati e visibili in dashboard.

### PRD-17-AC-003
Una metrica con target e achieved appare correttamente nella chart tab.

### PRD-17-AC-004
Un deliverable a rischio compare nella dashboard sintetica.

### PRD-17-AC-005
Una timeline per fasi mostra almeno definizione, design, implementazione e sustain o fasi equivalenti.

### PRD-17-AC-006
Gli OKR collegati al progetto sono visibili nella chart tab.

### PRD-17-AC-007
L’export della dashboard produce un artefatto leggibile e coerente.

## Rischi

### PRD-17-RSK-001
La dashboard diventa decorativa e non operativa.

### PRD-17-RSK-002
Business case, KPI, deliverable e OKR vengono modellati come testo libero senza struttura.

### PRD-17-RSK-003
Doppia scrittura dei dati tra task/project e chart tab.

### PRD-17-RSK-004
Eccessiva personalizzazione del layout prima di consolidare i widget standard.

## Spunto implementativo
### Meta-programmazione
1. Modellare la chart tab come composizione di widget dominio-specifici.
2. Definire `ProjectCharter` come aggregate o cluster strutturato.
3. Trattare KPI, target/achieved, deliverable, rischi e OKR come first-class records.
4. Distinguere chiaramente:
   - dato sorgente
   - proiezione di dashboard
   - stato sintetico derivato
5. Costruire un dashboard composition engine metadata-driven.
6. Consentire layout predefiniti per template e ruolo.
7. Derivare le timeline di alto livello dalle fasi o da milestones aggregate.
8. Garantire audit e tracciabilità delle metriche.
9. Non duplicare i task nella dashboard; mostrarne aggregati significativi.
10. Preparare export/print della dashboard come projection stabile.

---

# 10. Matrice di continuità rispetto al PRD originario

## Contenuti originari mantenuti e rifusi

### Epic 1 originaria
- task creation
- project association
- task dependencies
- checklists
- tagging
- project views
- contextual notes
- external DB

Confluiti in:
- PRD-01
- PRD-02
- PRD-06
- PRD-08
- PRD-10
- PRD-14

### Epic 2 originaria
- focus sessions
- time estimates
- estimation analytics
- resource view
- daily capacity

Confluiti in:
- PRD-03
- PRD-09
- PRD-11
- PRD-12

### Epic 3 originaria
- team creation
- RBAC
- ghost users
- task assignment
- notifications
- user connections
- OAuth2

Confluiti in:
- PRD-04
- PRD-05
- PRD-12

### Epic 4 originaria
- SQLite local-first
- soft delete
- optimistic locking
- LWW
- asset management
- Flyway
- sync status
- database transfer
- health check

Confluiti in:
- PRD-06
- PRD-07
- PRD-13
- PRD-14

### Epic 5 originaria
- ICS

Confluito in:
- PRD-14

### Epic 6 originaria
- local profiles
- profile selection
- global preferences
- data autodetection

Confluiti in:
- PRD-05
- PRD-15

---

# 11. Nuovi domini e nuove capacità aggiunte

## Nuovi PRD introdotti
- PRD-08 - Advanced Planning Model
- PRD-09 - Work Calendars and Capacity Engine
- PRD-11 - Baseline, Variance, Forecasting and Execution Control
- PRD-12 - Resource Planning and Allocation
- PRD-13 - Planning-Aware Sync and Conflict Resolution
- PRD-16 - Project Templates, Guided Setup and Reusable Blueprints
- PRD-17 - Executive Dashboard, Project Tracking, Charter and Chart Tab

## Capacità nuove introdotte trasversalmente
- timeline view
- Gantt view
- workload view
- chart tab
- project charter
- business case
- risk register sintetico
- key success metrics
- target vs achieved
- OKR panel
- deliverable tracking
- template gallery
- project timeline template
- project tracking template
- gantt project template
- event marketing timeline template

---

# 12. Sequenza raccomandata di implementazione

## Fase 1 - Consolidamento base
- PRD-01
- PRD-02
- PRD-03
- PRD-04
- PRD-05
- PRD-06
- PRD-07
- PRD-15

## Fase 2 - Fondazioni planning
- PRD-08
- PRD-09
- PRD-10

## Fase 3 - Tracking esecutivo
- PRD-11
- PRD-12
- PRD-17

## Fase 4 - Template system
- PRD-16

## Fase 5 - Sync semantica
- PRD-13

## Fase 6 - Integrazioni e export avanzati
- PRD-14

---

# 13. Priorità strategiche

## Priorità massima
- PRD-01
- PRD-03
- PRD-06
- PRD-08
- PRD-09
- PRD-10
- PRD-16
- PRD-17

## Priorità alta
- PRD-02
- PRD-04
- PRD-05
- PRD-11
- PRD-12
- PRD-15

## Priorità media
- PRD-07
- PRD-13
- PRD-14

---

# 14. Decisioni architetturali trasversali

1. Il dominio DEVE essere modulare.
2. Il planning engine DEVE essere separato dal CRUD base.
3. Le viste DEVONO essere projection layer.
4. Template e dashboard DEVONO essere metadata-driven.
5. Il motore calendari/capacità DEVE essere condiviso.
6. Deliverable, OKR, metriche e rischi DEVONO essere strutturati.
7. La sync DEVE essere semanticamente consapevole.
8. Le baseline DEVONO essere immutabili.
9. Le dashboard DEVONO derivare da dati sorgente e non essere una base parallela di verità.
10. La UI DEVE supportare modalità semplice e modalità avanzata.

---

# 15. Criteri globali di accettazione del programma JinnLog 1.0

Il nuovo impianto funzionale si considera correttamente recepito quando:

1. i task semplici restano facili da usare
2. il planning avanzato è attivabile senza rifondare il prodotto
3. lista, board, timeline, Gantt e chart tab leggono lo stesso dominio
4. deliverable, OKR, rischi e metriche sono strutturati e interrogabili
5. il template system crea progetti coerenti e modificabili
6. la chart tab è utile operativamente e non solo decorativa
7. la sync distingue tipi di conflitto
8. il prodotto funziona offline
9. il sistema può scalare verso scenari cloud senza rompere il modello locale
10. la roadmap resta coerente con l’identità di JinnLog come workspace moderno e non come semplice clone legacy

---

# 16. Conclusione

JinnLog 1.0, in questa versione, è formalizzato come:

**piattaforma local-first di produttività, pianificazione e coordinamento, con task management, knowledge layer, resource-aware planning, template gallery, executive dashboard e sincronizzazione semanticamente consapevole**

Questo documento non si limita ad aggiungere feature.
Ridefinisce il prodotto come sistema coerente, progressivo e professionale, in cui:

- il task semplice resta immediato
- la collaborazione resta nativa
- il planning avanzato diventa un layer strutturato
- i template accelerano l’adozione
- la chart tab rende il progetto leggibile anche a livello esecutivo
- il local-first resta un principio architetturale, non uno slogan

---