function getTimeFieldValue(a) { return a.fields.resolutiondate; }
function getTimeField(a) { return new Date(getTimeFieldValue(a)).getTime(); }
function formatFirstDay(date, monthOffset = 1) { return `${date.getYear() + 1900}-${date.getMonth() + monthOffset}-1`; }

function getResolvedByDate() {
    const minDate = prompt('Enter min date. (resolved >= minDate)', formatFirstDay(new Date()));
    const maxDate = prompt('Enter max date. (resolved < maxDate)', formatFirstDay(new Date(minDate), 2));
    const apiUrl = '/rest/api/2/search?filter=-4&jql=assignee in (currentUser()) AND status %3D Resolved AND ' +
                   `resolved >= "${minDate}" AND resolved < "${maxDate}" order by resolutiondate DESC`;

    console.log(apiUrl)

    fetch(apiUrl)
        .then(response => response.json())
        .then(function (data) {
            const issues = data.issues.sort((a, b) => getTimeField(a) - getTimeField(b));
            const entries = issues.map(x => `${x.key}: ${x.fields.summary} (${x.fields.customfield_11241})`);
            const total = data.issues.map(x => x.fields.customfield_11241).reduce((a, b) => a + b, 0);

            const message = [
                entries.join('\n'),
                'Total: ' + total,
                'Date Range: ' + getTimeFieldValue(issues[0]) + ' - ' + getTimeFieldValue(issues[issues.length - 1]),
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