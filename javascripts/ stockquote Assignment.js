/*jslint browser:true, plusplus:true, devel:true, unparam:true, todo:true */
/*global stockquote, data, Chart, XDomainRequest */

/*
 http://www.jsobfuscate.com/
 */

(function () {
    "use strict";

    var module;

    module = {
        // Data object for all quotes per company
        series: {},

        // Indexed quote (see quote object)
        quoteMapped: {},

        // Symbol of company that is displayed on the chart
        chartSymbol: null,

        // Url parameters
        params: {},

        // Index on change
        orderedQuotes: {},

        // Elements to retrieve
        quote: {
            s: {
                "name": "symbol",
                "type": "string",
                "isActive": true,
                "displayOrder": 0
            },
            l1: {
                "name": "last trade price only",
                "type": "float",
                "isActive": true,
                "displayOrder": 1
            },
            d1: {
                "name": "last trade date",
                "type": "datetime",
                "isActive": true,
                "displayOrder": 2
            },
            t1: {
                "name": "last trade time",
                "type": "datetime",
                "isActive": true,
                "displayOrder": 3
            },
            c1: {
                "name": "change",
                "type": "float",
                "isActive": true,
                "displayOrder": 4
            },
            o: {
                "name": "open",
                "type": "float",
                "isActive": true,
                "displayOrder": 5
            },
            h: {
                "name": "day's high",
                "type": "string",
                "isActive": true,
                "displayOrder": 6
            },
            g: {
                "name": "day's low",
                "type": "string",
                "isActive": true,
                "displayOrder": 7
            },
            v: {
                "name": "volume",
                "type": "string",
                "isActive": true,
                "displayOrder": 8
            }
        },
        init: function () {
            var attributeName, attributeValue, div, i;


            // Map quote to quoteMapped for easy access
            i = 0;
            for (attributeName in this.quote) {
                if (this.quote.hasOwnProperty(attributeName)) {
                    attributeValue = this.quote[attributeName];
                    attributeValue.symbol = attributeName;
                    // name of the result from yahoo is with name "colx" where x is a consecutive number
                    this.quoteMapped["col" + i] = attributeValue;
                    this.quoteMapped["col" + i].sequence = i;

                    i++;
                }
            }

            // Get Url parameters and set default parameters
            stockquote.params = stockquote.getUrlParameters();
            if (!stockquote.params.refresh) {
                stockquote.params.refresh = 4000;
            }
            if (!stockquote.params.live) {
                stockquote.params.live = null;
            }
            if (!stockquote.params.datapoints) {
                stockquote.params.datapoints = 10;
            }


            // Options
            div = document.createElement("div");
            div.innerHTML = "<a href='?live=true&remote=true&datapoints=" + stockquote.params.datapoints + "&refresh=" + stockquote.params.refresh + "'>live (with test fallback)</a>";
            div.innerHTML += " | <a href='?test=true&remote=true&datapoints=" + stockquote.params.datapoints + "&refresh=" + stockquote.params.refresh + "'>test url</a>";
            div.innerHTML += " | <a href='?local=true&remote=false&datapoints=" + stockquote.params.datapoints + "&refresh=" + stockquote.params.refresh + "'>generate testdata</a>";
            document.getElementsByTagName("body")[0].appendChild(div);

            // Initialize series object by reading JSON file
            stockquote.parseJson(data);

            // Initialize DOM table
            stockquote.initDomTable();

            // Initialize DOM message center
            div = document.createElement("div");
            div.id = "msg";
            document.getElementsByTagName("body")[0].appendChild(div);
            stockquote.message("Initializing stockquotes...", "init");

            // Initialize winners and losers container
            stockquote.initWinnersAndLosersContainer();


            // Initialize graph
            stockquote.initializeGraph();

            // Refresh data for the first time.
            stockquote.refreshData();

        },
        loop: function () {
            var refreshRate;
            // Refresh every <n> milliseconds
            refreshRate = parseInt(stockquote.params.refresh, 10);

            setTimeout(function () {
                stockquote.refreshData();
                stockquote.loop();
            }, refreshRate);
        },

        refreshData: function () {
            var res = null;

            if (stockquote.params.remote === "true") {
                res = stockquote.makeCorsRequest();
            }

            if (res === null && stockquote.params.remote === "true") {
                stockquote.message("No valid result for live data. Falling back to local testdata...", "refreshData");
            }

            if (res === null) {
                stockquote.generateTestData(1);
            }


            // Display winners and losers
            stockquote.orderQuotes();
            stockquote.showWinners(5);
            stockquote.showLosers(5);

            stockquote.updateDomTable();

            stockquote.showChart();

        },
        initWinnersAndLosersContainer: function () {
            var div;
            div = document.createElement("div");
            div.id = "winnersAndLosers";
            div.className = "winnersAndLosers";
            document.getElementsByTagName("body")[0].appendChild(div);
            // add winners container
            div = document.createElement("div");
            div.id = "winners";
            div.id = "winners";
            document.getElementById("winnersAndLosers").appendChild(div);
            // add winners container
            div = document.createElement("div");
            div.id = "losers";
            div.id = "losers";
            document.getElementById("winnersAndLosers").appendChild(div);
        },
        parseJson: function (obj) {
            var json, i, symbol, objRenamed;

            json = obj.query.results.row;

            for (i = 0; i < json.length; i++) {
                stockquote.getPropertyNameBySequence(i);
                symbol = json[i].col0;
                json[i].col1 = parseFloat(json[i].col1);
                json[i].col4 = parseFloat(json[i].col4);
                json[i].col8 = 0;

                // Rename attributes to logical name
                objRenamed = stockquote.renameAttributes(json[i]);

                if (!stockquote.series[symbol]) {
                    stockquote.series[symbol] = [];
                }
                stockquote.series[symbol].push(objRenamed);

            }
        },
        renameAttributes: function (obj) {
            var i = 0, attributeName, quoteMappedAttributeName;
            for (attributeName in obj) {
                if (obj.hasOwnProperty(attributeName)) {

                    // Make proper values, according to definition
                    if (stockquote.quoteMapped[attributeName].type === "float") {
                        obj["col" + i] = parseFloat(obj["col" + i]);
                    }

                    quoteMappedAttributeName = stockquote.getPropertyNameBySequence(i);
                    obj[quoteMappedAttributeName] = obj["col" + i];

                    i++;

                }
            }
            console.log(' obj ', obj);

            return obj;
        },
        getPropertyNameBySequence: function (sequence) {
            var attributeName, quoteMappedAttributeName = '';
            for (attributeName in stockquote.quoteMapped) {
                if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {
                    if (sequence === stockquote.quoteMapped[attributeName].sequence) {
                        quoteMappedAttributeName = stockquote.quoteMapped[attributeName].symbol;
                        break;
                    }
                }
            }
            return quoteMappedAttributeName;
        },
        limitQuotes: function (symbol) {
            var maxLength, l;

            maxLength = parseInt(stockquote.params.datapoints, 10);

            // make sure that max 10 (maxLength) quotes are kept for a company
            l = stockquote.series[symbol].length;
            while (l >= maxLength) {
                // Oldest quote is removed from series for company
                stockquote.series[symbol].shift();
                l = stockquote.series[symbol].length;
            }
        },

        generateTestData: function (numberOfQuotes) {
            var i, symbol, newDate, steps, newQuote, myData, proto;

            stockquote.message("Generating test data... ", "generateTestData");

            myData = data.query.results.row;
            proto = '__proto__';

            for (steps = 0; steps < numberOfQuotes; steps++) {
                for (i = 0; i < myData.length; i++) {
                    symbol = myData[i].col0;
                    newQuote = {};
                    newQuote[proto] = myData[i];
                    newQuote.col1 = parseFloat(this.getTestQuote(myData[i].col1));
                    newDate = new Date();
                    newQuote.col2 = (newDate.getMonth() + 1) + "/" + newDate.getUTCDate() + "/" + newDate.getFullYear();
                    //TODO: Is not accurate for 00:00 concerning am/pm
                    newQuote.col3 = ((newDate.getHours() + 11) % 12 + 1) + ":" + newDate.getMinutes() + (newDate.getHours() >= 12 ? "pm" : "am");

                    if (stockquote.series[symbol].length > 1) {
                        newQuote.col4 = parseFloat(newQuote.col1) - parseFloat(stockquote.series[symbol][stockquote.series[symbol].length - 2].col1);
                        newQuote.col4 = newQuote.col4.toFixed(2);
                    }

                    // Keep max <n> datapoints per symbol
                    stockquote.limitQuotes(symbol);

                    // Ad quote to serie for company
                    stockquote.series[symbol].push(newQuote);
                }
            }
        },
        initDomTable: function () {
            var series, table, tr, td, attributeName, attributeValue, serie_s, className, lastQuote, htmlStr;

            attributeValue = "";

            table = document.createElement("table");
            table.id = "stockData";
            table.className = "stockData";

            // Create table header
            tr = document.createElement("tr");
            for (attributeName in stockquote.quoteMapped) {
                if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {
                    td = document.createElement("td");
                    td.innerHTML = stockquote.quoteMapped[attributeName].name;
                    td.className = "header";
                    tr.appendChild(td);
                }
            }
            table.appendChild(tr);


            series = stockquote.series;
            for (attributeName in series) {
                if (series.hasOwnProperty(attributeName)) {

                    // Get first quote for a company
                    serie_s = stockquote.series[attributeName];
                    if (serie_s.length === 0) {
                        stockquote.message("Nog geen data in series object");
                        lastQuote = null;
                    } else {
                        lastQuote = serie_s[serie_s.length - 1];
                    }

                    // Create row
                    tr = document.createElement("tr");

                    // Traverse through data
                    for (attributeName in stockquote.quoteMapped) {
                        if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {
                            attributeValue = stockquote.quoteMapped[attributeName];

                            // Get and create classname
                            className = stockquote.quoteMapped[attributeName].name;
                            className = className.replace(/\W/g, "_").toLowerCase();

                            // Set value of cell
                            htmlStr = lastQuote[attributeName];

                            // Create td
                            td = document.createElement("td");
                            td.innerHTML = htmlStr;
                            td.className = className;
                            tr.appendChild(td);

                        }
                    }
                    // postprocess tr
                    tr.id = lastQuote.col0;
                    tr.addEventListener("click", stockquote.showChart, false);
                    table.appendChild(tr);
                }
            }
            document.body.appendChild(table);
        },
        updateDomTable: function () {
            var series, attributeName, attributeValue, serie_s, symbol, className, lastQuote, penultimate, diffClass, htmlStr, val;

            series = stockquote.series;

            for (attributeName in series) {
                if (series.hasOwnProperty(attributeName)) {

                    // Get last en penultimate quotes for a serie
                    serie_s = stockquote.series[attributeName];
                    if (serie_s.length === 0) {
                        stockquote.message("Nog geen data in series object");
                        lastQuote = null;
                        penultimate = null;
                    } else if (serie_s.length === 1) {
                        lastQuote = serie_s[serie_s.length - 1];
                        penultimate = null;
                    } else {
                        lastQuote = serie_s[serie_s.length - 1];
                        penultimate = serie_s[serie_s.length - 2];
                    }

                    // Traverse through data
                    diffClass = "";
                    /*
                     TODO: col0 is hard coded.
                     */
                    symbol = lastQuote.col0;

                    for (attributeName in stockquote.quoteMapped) {
                        if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {

                            attributeValue = stockquote.quoteMapped[attributeName];
                            // Get and create classname
                            className = stockquote.quoteMapped[attributeName].name;
                            className = className.replace(/\W/g, "_").toLowerCase();


                            // Calculate class for consecutive quotes by using last and penultimate quotes
                            if (penultimate && stockquote.quoteMapped[attributeName].name === "last trade price only") {
                                val = lastQuote[attributeName];
                                if (lastQuote.col4 < 0) {
                                    diffClass = "lower";
                                } else if (lastQuote.col4 > 0) {
                                    diffClass = "higher";
                                } else {
                                    diffClass = "equal";
                                }
                            }

                            htmlStr = "";
                            htmlStr += lastQuote[attributeName];

                            document.getElementById(symbol).getElementsByClassName(className)[0].innerHTML = htmlStr;

                        }
                    }

                    document.getElementById(symbol).className = diffClass;


                }
            }
        },
        initializeGraph: function () {
            var canvas, div;
            // Add div that holds the symbol
            div = document.createElement("div");
            div.id = "company";
            div.innerHTML = "Click on a row to show live feed of a company in a chart...";
            document.getElementsByTagName("body")[0].appendChild(div);

            // Initialize graph
            canvas = document.createElement("canvas");
            canvas.id = "canvas";
            canvas.className = "quoteChart";
            canvas.width = 800;
            canvas.height = 450;
            document.getElementsByTagName("body")[0].appendChild(canvas);
        },
        getTestQuote: function (val) {
            var newVal = val * Math.random() * 0.4;
            val = parseFloat(val);
            val += 0;
            val = val * 0.8 + newVal;
            val = Math.round(val * 100) / 100;
            if (val < 0) {
                val = 0;
            }
            return val;
        },
        showChart: function () {
            var series, series_s, symbol, i, lineChartData, labels, data, dataset, canvas, context;

            // Store the symbol in chartSymbol to follow updates on the quote (live chart)
            if (this.id) {
                stockquote.chartSymbol = this.id;
            }
            symbol = stockquote.chartSymbol;

            // Check that a company is selected to display
            if (!symbol) {
                return;
            }

            // Set title for company
            document.getElementById("company").innerHTML = "Live feed for " + symbol;

            lineChartData = {};
            labels = [];
            data = [];

            // Traverse the series data
            series = stockquote.series[symbol];
            for (i = 0; i < series.length; i++) {
                series_s = series[i];
                labels.push(series_s.col2 + " " + series_s.col3);
                data.push(series_s.col1);
            }

            lineChartData.labels = labels;
            dataset = {};
            dataset.fillColor = "rgba(220,220,220,0.5)";
            dataset.strokeColor = "rgba(66,66,255,1)";
            dataset.pointColor = "rgba(220,220,220,1)";
            dataset.pointStrokeColor = "#fff";
            dataset.data = data;
            lineChartData.datasets = [dataset];
            lineChartData.animationEasing = "easeInQuart";

            // Get canvas
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");

            // Show chart
            new Chart(context).Line(lineChartData);

        },
        createCORSRequest: function (method, url) {
            try {
                var xhr;
                xhr = new XMLHttpRequest();
                xhr.timeout = 0;
                xhr.ontimeout = function () {
                    xhr = null;
                    return null;
                };
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
            } catch (e) {
                return null;
            }
        },
        cbfunc: function (data) {
            return data;
        },
        message: function (htmlStr, method) {
            var date = new Date(), timestamp, lines, limit = 1000;

            timestamp = stockquote.ISODateString(date);

            // Set title to an empty string, if not passed
            if (method === undefined || method === null) {
                method = "";
            }

            htmlStr = timestamp + " <span title='" + method + "'>" + htmlStr + "</span><br>\n";
            lines = document.getElementById("msg").innerHTML.split("\n");

            // Limit the message center to max <limit> lines
            if (lines.length >= limit) {
                lines.splice(limit - 1);
                document.getElementById("msg").innerHTML = htmlStr + lines.join("\n");
            } else {
                document.getElementById("msg").innerHTML = htmlStr + document.getElementById("msg").innerHTML;
            }

        },
        makeCorsRequest: function () {
            var xhr, url, Fn, res, results, i, symbol;

            if (stockquote.params.live === "true") {
                stockquote.message("Retrieving live data...", "makeCorsRequest");
            } else {
                stockquote.message("Retrieving data from test url...", "makeCorsRequest");
            }


            if (stockquote.params.live === "true") {
                url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fdownload.finance.yahoo.com%2Fd%2Fquotes.csv%3Fs%3Dbcs%2Bstt%2Bjpm%2Blgen.l%2Bubs%2Bdb%2Bben%2Bcs%2Bbk%2Bkn.pa%2Bgs%2Blm%2Bms%2Bmtu%2Bntrs%2Bgle.pa%2Bbac%2Bav%2Bsdr.l%2Bdodgx%2Bslf%2Bsl.l%2Bnmr%2Bing%2Bbnp.pa%26f%3Dsl1d1t1c1ohgv%26e%3F%3F%3D.csv'&format=json&diagnostics=true&callback=";
            } else {
                url = "http://cria.tezzt.nl/examples/stockquotes/index.php?cbfunc=&_=" + new Date().getTime();
            }

            xhr = module.createCORSRequest('GET', url);
            if (xhr !== null) {
                xhr.onload = function () {

                    if (xhr.responseText === '') {
                        return null;
                    }

                    // Next two lines will avoid eval, but create a new function
                    Fn = Function;
                    res = new Fn('return ' + xhr.responseText)();

                    // Add quotes to series
                    results = res.query.results.row;

                    // Make sure we have a result from Yahoo (sometimes it won't show results because of too much requests)
                    if (results.length === 0) {
                        return null;
                    }

                    for (i = 0; i < results.length; i++) {
                        symbol = results[i].col0;

                        // Keep max <n> datapoints per symbol
                        stockquote.limitQuotes(symbol);

                        // Add quote to series for company
                        stockquote.series[symbol].push(results[i]);
                    }
                };
                xhr.send();
            } else {
                return null;
            }
        },
        getUrlParameters: function () {
            var params = {}, parts, i, nv;

            if (location.search) {
                parts = location.search.substring(1).split('&');

                for (i = 0; i < parts.length; i++) {
                    nv = parts[i].split('=');
                    // if (!nv[0]) {continue;}
                    params[nv[0]] = nv[1] || true;
                }
            }

            return params;

        },
        orderQuotes: function () {
            var series, attributeName, val, orderedQuotes = [], quotes, quote, i, placed, j;
            series = stockquote.series;
            for (attributeName in series) {
                if (series.hasOwnProperty(attributeName)) {

                    quotes = series[attributeName];
                    quote = {};
                    quote = quotes[quotes.length - 1];
                    val = parseFloat(quote.col4);

                    // Initialize array when it is empty
                    if (orderedQuotes.length === 0) {
                        orderedQuotes.push(quote);
                    } else {
                        placed = false;

                        // Walk through orderedArray with new quote. Put largest at front.
                        i = 0;
                        while (i < orderedQuotes.length) {
                            if (val <= parseFloat(orderedQuotes[i].col4)) {
                                orderedQuotes.splice(i, 0, quote);
                                placed = true;
                                // Finished with the loop when position found.
                                break;
                            }

                            i++;

                        }
                        // If not placed from left to right through the array, then walk back to front.
                        if (!placed) {
                            // Walk through orderedArray with new quote. Put smallest at back.
                            i = orderedQuotes.length - 1;
                            while (i > 0) {
                                if (val >= parseFloat(orderedQuotes[i].col4)) {

                                    // Add quote into position
                                    orderedQuotes.splice(i + 1, 0, quote);

                                    // Finished with the loop when position found.
                                    break;
                                }
                                i--;
                            }
                        }
                    }
                }
            }
            stockquote.orderedQuotes = orderedQuotes;
        },
        showWinners: function (top) {
            var i, htmlStr = "", attributeName, attributeValue, q, start, end;

            start = stockquote.orderedQuotes.length - 1;
            end = stockquote.orderedQuotes.length - 1 - top;
            htmlStr += "<h3>Winners</h3>";


            htmlStr += "<table>";
            for (i = start; i > end; i--) {
                q = stockquote.orderedQuotes[i];
                htmlStr += "<tr>";
                for (attributeName in stockquote.quoteMapped) {
                    if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {
                        attributeValue = stockquote.quoteMapped[attributeName];

                        htmlStr += "<td>" + q[attributeName] + "</td>";

                    }
                }
                htmlStr += "</tr>";


            }
            htmlStr += "</table>";
            document.getElementById("winners").innerHTML = htmlStr;

        },
        showLosers: function (top) {
            var i, htmlStr = "", q, attributeName, attributeValue;

            htmlStr += "<h3>Losers</h3>";

            htmlStr += "<table>";
            for (i = 0; i < top; i++) {
                q = stockquote.orderedQuotes[i];
                htmlStr += "<tr>";
                for (attributeName in stockquote.quoteMapped) {
                    if (stockquote.quoteMapped.hasOwnProperty(attributeName)) {
                        attributeValue = stockquote.quoteMapped[attributeName];

                        htmlStr += "<td>" + q[attributeName] + "</td>";

                    }
                }
                htmlStr += "</tr>";
            }
            htmlStr += "</table>";
            document.getElementById("losers").innerHTML = htmlStr;

        },
        ISODateString: function (d) {
            function pad(n) {
                return n < 10 ? '0' + n : n;
            }

            return d.getUTCFullYear() + '-'
                + pad(d.getUTCMonth() + 1) + '-'
                + pad(d.getUTCDate()) + 'T'
                + pad(d.getUTCHours()) + ':'
                + pad(d.getUTCMinutes()) + ':'
                + pad(d.getUTCSeconds()) + 'Z';
        }

    };

    window.stockquote = module;
    window.stockquote.init();
    window.stockquote.loop();

}());
