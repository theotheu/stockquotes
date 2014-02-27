Stockquotes
===========

&lt;Name Student&gt;

&lt;Student number&gt;

> __Documentation of the concepts below is mandatory__.

> You have to use mandatory literature like the book, reader and websites.

> Use alternatives with reference to authentic en authoritative websites.

> Tip: gebruik http://dillinger.io/ om je README.md te bewerken.



Design (example)
-------
- __init__
  - read initial JSON file in object "series"
  - generate test/fake data with method "generateQuote"
  - retrieve live data from Yahoo with a CORS request
  - draw initial table. Use the DOM operations from the previous assignment
     - bind an event handler to every table row (DOM level 2). You can use this to display detailed information.
- __loop__ (use one of the timer functions van JavaScript)
  - generate test/fake data with method "generateQuote"
  - retrieve live data from Yahoo with a CORS request
  - draw updated table (in rood de losers, in green de winners, in blue de one who don't change)
- __methods__
  - generate stock value. The generated value is 80% <= input <= 120%. This method is called "generateQuote"
  - draw graphics
  - show detail info for a company in de DOM table


Concepten
---------
* Events
* Objects
* this
* Use &#95;&#95;proto&#95;&#95; en prototype
* Simulation of associative arrays in JavaScript
* JSON
* Used pattern according to Addy Osmani
* CORS Request
* Execution context
* Canvas

Events
------
*Explain with your code examples below. Document __all__ events.*
```sh
// Copy here your code fragment from your assignment
```

Objecten
--------
*Explain with your code examples below.*
```sh
// Copy here your code fragment from your assignment
```

this
--------
*Explain with your code examples below. Mention at least two examples where __this__ has a different context, or context can have a different context.*
```sh
// Copy here your first code fragment from your assignment

// Copy here your second fragment from your assignment
```

&#95;&#95;proto&#95;&#95; en prototype
--------
*Explain with your code examples below.*
```sh
// Copy here your code fragment from your assignment
```

Simulation of associative arrays in JavaScript
--------
*Explain with your code examples below.*
```sh
// Copy here your code fragment from your assignment
```

JSON
--------
*Explain with your code examples below.*
```sh
// Copy here your code fragment from your assignment
```

Used pattern according to Addy Osmani
--------
*Explain with your code examples below. Make use of the documentation on http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjavascript*
```sh
// Copy here your code fragment from your assignment
```

CORS Request
------------
*Explain with your code examples below.*

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
*Explain with your code examples below. Tip: view one of the video's from the JSConference 2013 op http://www.youtube.com/watch?v=iSxNCYcPAFk*

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
*Explain with your code examples below.*

```sh
// Copy here your code fragment from your assignment
```

Chart library
------------
*Explain with your code examples below. Explain the concepts that the library is based upon.*
```sh
// Copy here your code fragment from your assignment
```

