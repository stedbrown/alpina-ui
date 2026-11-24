# Costruire un portale con Alpina

Il catalogo importa i moduli da `alpina-ui` e lo stile da `alpina-ui/styles.css`. Una voce del catalogo corrisponde a un modulo installabile. Per copiare un gruppo di sorgenti usa per esempio `npx --no-install alpina add app-shell sidebar navigation-menu` nella tua applicazione.

| Componente | Contratto |
| --- | --- |
| AppShell | Accetta brand, sidebar, toolbar e children. Con open e onOpenChange puoi controllare l’indice mobile. mainId permette di collegare il contenuto alla navigazione del sito. |
| Sidebar | Accetta masthead, tools, footer e children. Il ref punta alla zona di scorrimento, così puoi rendere visibile la voce corrente. |
| NavigationMenu | Accetta label e sections. Ogni sezione contiene links con href, label e current. orientation può essere vertical o horizontal. I collegamenti supportano apertura in un’altra scheda. |
| CodeBlock | Accetta code, label e le etichette di copia. Usa gli appunti quando disponibili e seleziona il codice quando occorre copiarlo manualmente. |
| TextLink | Accetta gli attributi nativi di un collegamento e un ref. La sottolineatura distingue il testo interattivo anche senza colore. |
| Prose | Impagina figli semantici dentro un article. Il portale gli fornisce esclusivamente il Markdown locale compilato durante la build. |

Il portale mantiene la ricerca e il percorso nella propria applicazione. I componenti pubblici si occupano di presentazione, navigazione nativa e controlli responsivi. Negli esempi di ogni voce si possono copiare i file effettivamente distribuiti.