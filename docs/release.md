# Passare dalla 0.4 alla 0.5

Scarica `alpina-ui-0.5.0.tgz` da Installazione. Gli import e i 77 identificatori della 0.4 rimangono disponibili. Il nuovo componente `Stack` aggiunge la composizione su un asse con spaziature modulari, allineamento e ritorno a capo. Il registro comprende ora 78 voci.

## Menu azioni

Le voci esistenti con `value`, `label`, `disabled` e `onSelect` continuano a funzionare. Puoi aggiungere un separatore prima di una voce con `separatorBefore` e dare rilievo a un'azione di rimozione con `tone="danger"`. Le proprietà `align` e `size` del menu permettono di usarlo sul margine di una riga. Il nuovo esempio del portale mostra modifica e rimozione con una conferma esplicita.

## Selezione delle lingue

Quando `locales` è omesso, `LocaleSelect` mostra le quattro lingue nazionali. Per un servizio bilingue passa `locales={['it-CH', 'de-CH']}` e usa le stesse due lingue nello stato dell’applicazione.

## Aggiornare i sorgenti copiati

Installa il pacchetto locale, poi confronta i file con `npx --no-install alpina diff dropdown-menu locale-select`. Se avevi usato una destinazione personalizzata, passa la stessa opzione `--dir`. Puoi aggiungere la nuova primitiva con `npx --no-install alpina add stack`. Prima di integrare un aggiornamento controlla le personalizzazioni locali rilevate dal confronto.