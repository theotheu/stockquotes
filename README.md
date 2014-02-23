Stockquote
=========

&lt;Naam Student&gt;

&lt;Studentnummer&gt;

> __Documentatie van onderstaande concepten is verplicht__.

> Maak gebruik van de verplichte literatuur, zoals boek, reader en websites.

> Geef alternatieven met referentie naar authentieke en gezaghebbende bronnen.

> Tip: gebruik http://dillinger.io/ om je README.md te bewerken.



Ontwerp (voorbeeld)
-------
- __init__
  - lees initële JSON file in object "series"
  - genereer test/fake date met method "generateQuote"
  - haal live data op bij Yahoo met een CORS request
  - teken initële tabel. Gebruik hiervoor de DOM operaties
     - installeer een eventhandler op elke tabelregel (DOM level 2). Deze kun je gebruiken om het koersverloop voor een company te tonen.
- __loop__ (gebruik hiervoor een timer functie van JavaScript)
  - genereer test/fake date met method "generateQuote"
  - haal live data op bij Yahoo met een CORS request
  - teken bijgewerkte tabel (in rood de dalers, in groen de stijgers, in blauw de gelijkblijvende)
- __methods__
  - genereren van waarde. De genereerde waarde is 80% <= input <= 120%. Deze method heet "generateQuote"
  - teken grafiek
  - toon detail info voor een company in de DOM tabel


Concepten
---------
* Events
* Objecten
* this
* Gebruik van &#95;&#95;proto&#95;&#95; en prototype
* Simulatie van associatieve arrays in JavaScript
* JSON
* Gebruikte pattern volgens Addy Osmani
* CORS Request
* Execution context
* Canvas

Events
------
*Toelichten aan de hand van onderstaande code. Documenteer __alle__ events.*
```sh
// Kopieer hier je codefragment
```

Objecten
--------
*Toelichten aan de hand van onderstaande code.*
```sh
// Kopieer hier je codefragment
```

this
--------
*Toelichten aan de hand van onderstaande code. Geef minstens twee voorbeelden waarin je __this__ een verschillende context heeft, of kunt geven.*
```sh
// Kopieer hier je eerste codefragment

// Kopieer hier je tweede codefragment
```

&#95;&#95;proto&#95;&#95; en prototype
--------
*Toelichten aan de hand van onderstaande code.*
```sh
// Kopieer hier je codefragment
```

Simulatie van associatieve arrays in JavaScript
--------
*Toelichten aan de hand van onderstaande code.*
```sh
// Kopieer hier je codefragment
```

JSON
--------
*Toelichten aan de hand van onderstaande code.*
```sh
// Kopieer hier je codefragment
```

Gebruikte pattern volgens Addy Osmani
--------
*Toelichten aan de hand van onderstaande code. Gebruik de literatuur op http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjavascript*
```sh
// Kopieer hier je codefragment
```

CORS Request
------------
*Toelichten aan de hand van onderstaande code.*

```sh
createCORSRequest: function (method, url) {
            var xhr;
            xhr = new XMLHttpRequest();
            if (xhr.withCredentials !== undefined) {
                // XHR for Chrome/Firefox/Opera/Safari.
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest) {
                // XDomainRequest for IE.
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                // CORS not supported.
                xhr = null;
            }
            return xhr;
        }
```

Execution context
------------
*Toelichten aan de hand van onderstaande code. Tip: bekijk een van de video's van JSConference 2013 op http://www.youtube.com/watch?v=iSxNCYcPAFk*

```sh
/* Next two lines will avoid eval, but create a new function */
Fn = Function;
res = new Fn('return ' + xhr.responseText)();

// ...

cbfunc: function (data) {
    return data;
}
```

Canvas
------------
*Toelichten aan de hand van onderstaande code.*

```sh
// Kopieer hier je codefragment
```

Chart library
------------
*Toelichten aan de hand van onderstaande code. Licht de concepten waarop de Chart library gebaseerd is.*
```sh
// Kopieer hier je codefragment
```

