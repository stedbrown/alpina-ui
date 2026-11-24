# Date, moduli e registri

## Calendario

`Calendar` usa date gregoriane civili in formato `YYYY-MM-DD`. La selezione di un giorno mantiene lo stesso valore a Zurigo, Honolulu e Tokyo. La data odierna di riferimento è quella di Zurigo. `min` e `max` sono inclusivi. `defaultMonth` accetta un mese o una data e determina la vista iniziale. Un valore controllato aggiornato apre il relativo mese. Una data impossibile o un intervallo invertito genera un `RangeError`.

Con Tab entri sul giorno attivo. Le frecce orizzontali spostano di un giorno, le verticali di una settimana. Home ed End raggiungono lunedì e domenica. Pagina su e Pagina giù cambiano mese, con Maiusc cambiano anno. Invio o spazio confermano. Nell’ultimo giorno di gennaio il cambio mese porta all’ultimo giorno disponibile di febbraio. Nome completo del giorno e lingua sono disponibili ai lettori di schermo anche in romancio. Il giorno odierno è sottolineato, la scelta compare in negativo.

`DatePicker` compone `Dialog`, `Calendar` e `SwissDate`. Il pulsante legge la data nella lingua indicata da `locale`. Nel modulo `name` invia la stringa ISO. Esc richiude la finestra, il focus torna al pulsante e il reset del modulo ripristina la data iniziale quando il valore è gestito dal componente.

## Controlli

| Componente | Uso e comportamento |
| --- | --- |
| `InputOTP` | Un input di testo accetta da 1 a 32 cifre con lunghezza configurabile. `autoComplete="one-time-code"` consente l’inserimento assistito sui dispositivi compatibili. L’incolla accetta anche codici con spazi o trattini. Gli zeri iniziali restano nel valore. Collega una `Field` e usa `required` per la validazione del modulo. |
| `NativeSelect` | Le proprietà HTML, il ref, i gruppi di opzioni, le selezioni multiple e il selettore di sistema seguono il contratto di `Select`. `appearance="line"` lascia un filetto di base, `outline` traccia il contorno. |
| `ToggleGroup` | Pulsanti con nome, stato premuto e focus visibile. `multiple` abilita più scelte. `name` serializza una voce per ciascuna selezione. Ripremere un pulsante annulla quella scelta. |
| `Questionnaire` | Ogni domanda raggruppa pulsanti radio nativi. Avanti richiede una risposta. Indietro consente correzioni e il completamento consegna una mappa di ID e valori a `onComplete`. Il consumatore può tradurre le etichette di navigazione. |
| `MessageScroller` | Una regione `log` nominata segue l’ultimo messaggio. Chi risale nel testo conserva la posizione e può tornare in fondo con un pulsante. `--al-log-height` imposta l’altezza massima. |
| `Trace` | Un elenco ordinato conserva la sequenza originale degli eventi. `dateTime` conserva il valore strutturato e `detail` apre una disclosure nativa. |

## Componenti svizzeri aggiornati

`CurrencyCHF` e `SwissDate` dichiarano la lingua del testo, anche quando si inserisce un importo francese in una pagina italiana. I loro elementi HTML conservano valore e data leggibili dalle macchine.

`CantonSelect` e `LocaleSelect` condividono il selettore nativo con contorno. Il selettore dei cantoni propaga la lingua al controllo. Le opzioni della lingua mantengono il proprio endonimo e il rispettivo attributo `lang`. I nomi delle proprietà, i ref e i comportamenti controllati esistenti rimangono disponibili.

`CantonCombobox` distingue la scelta confermata dall’opzione percorsa con le frecce. Il lettore di schermo riceve sia il discendente attivo sia la selezione corrente. Il pulsante di cancellazione usa la primitiva comune.

`SwissPostalCodeInput` accetta `locale`, mantiene la direzione da sinistra a destra e usa un input di testo per conservare gli zeri iniziali. Valida quattro cifre. `SwissAddressForm` compone i ruoli tipografici del sistema, associa l’istruzione al modulo e dichiara lo stato occupato durante il salvataggio.
