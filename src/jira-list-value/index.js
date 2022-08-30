function sum(collection, start, end) { return collection.slice(start, end).reduce((a, b) => a + b, 0); }
function getTimeFieldValue(a) { return a.fields.resolutiondate; }
function getTimeField(a) { return new Date(getTimeFieldValue(a)).getTime(); }
function formatFirstDay(date, monthOffset = 1) { return `${date.getYear() + 1900}-${date.getMonth() + monthOffset}-1`; }

const PRICE_FIELD = 'customfield_11241';

function getResolvedByDate() {
    const minDate = prompt('Enter min date. (resolved >= minDate)', formatFirstDay(new Date()));
    const maxDate = prompt('Enter max date. (resolved < maxDate)', formatFirstDay(new Date(minDate), 2));
    const apiUrl = '/rest/api/2/search?filter=-4&jql=assignee in (currentUser()) AND status %3D Resolved AND ' +
                   `resolved >= "${minDate}" AND resolved < "${maxDate}" order by resolutiondate DESC`;
    console.log(apiUrl)

    const multiplier = parseFloat(prompt(
        'Enter a multiplier for currency conversion. (Use this if accounting and invoicing is done in different ' + 
        'currencies. Provide how much invoicing currency you get for one accounting currency, e.g. how much HUF ' +
        'for 1 EUR. Leave it as 1 if you don\' need currency conversion.)', 1) ?? 1);

    fetch(apiUrl)
        .then(response => response.json())
        .then(function (data) {
            const issues = data
                .issues
                .sort((a,b) => a.key > b.key ? 1 : -1); // Keys are unique no equation handling.
            let entries = issues.map(x => `${x.key}: ${x.fields.summary} (${x.fields[PRICE_FIELD]})`);
            
            const total = sum(data.issues.map(x => x.fields[PRICE_FIELD]));
            let totalString = total.toString();
            
            if (!isNaN(multiplier) && multiplier != 1)
            {
                let convertedTotal = Math.round(total * multiplier);
                totalString = `${totalString} (invoice: ${convertedTotal})`;

                let convertedEntries = issues.map(x => Math.floor(x.fields[PRICE_FIELD] * multiplier));

                entries = entries.map(function (entry, i) {
                    const value = (i < entries.length - 1)
                        ? convertedEntries[i]
                        : (convertedTotal - sum(convertedEntries, 0, -1)); 
                    return `${entry} (invoice: ${value})`;
                });
            }
            
            const from = getTimeFieldValue(issues[0]);
            const to = getTimeFieldValue(issues[issues.length - 1]);

            const message = [
                entries.join('\n'),
                `Total: ${totalString}`,
                `Date Range: ${from} - ${to}`,
            ].join('\n\n\n');

            const pre = document.createElement('pre');
            document.body.appendChild(pre);
            pre.innerHTML = message;

            pre.style.display = 'block';
            pre.style.position = 'fixed';
            pre.style.width = '100vw';
            pre.style.height = '100vh';
            pre.style.top = 0;
            pre.style.left = 0;
            pre.style.zIndex = 99999;
            pre.style.background = 'white'

            const closeButton = document.createElement('button');
            closeButton.innerHTML = 'Close';
            closeButton.style.display = 'block';
            closeButton.onclick = () => pre.parentElement.removeChild(pre);
            pre.appendChild(closeButton);
        });
}

getResolvedByDate();