var jsonData = null;

function loadPage() {
    jsonData = null;
    let puzzleId = new URLSearchParams(window.location.search).get('id');
    jsonData = JSON.parse(window.localStorage.getItem(puzzleId));
    jsonData.sessions.sort(function (a, b) {
        return new Date(a.sessionDate) - new Date(b.sessionDate);
    })
    reloadData();
}

function reloadData() {
    // Sessions
    let sessionsGrid = document.getElementById('sessionGrid');
    let sessionCellTemplate = document.getElementById('sessionCellTemplate');
    var sessionCount = 0;
    var addedPiecesCount = 0;
    var totalTimeInMinutes = 0;
    sessionCount = jsonData.sessions.length;
    jsonData.sessions.forEach(sessionData => {
        addedPiecesCount += sessionData.addedPieces;
        totalTimeInMinutes += getTotalMinutes(sessionData.duration);
    });

    // General info
    document.getElementById('puzzleTitle').innerText = jsonData.name;
    let progressValue = Math.floor((addedPiecesCount / jsonData.piecesCount) * 100);
    document.getElementById('progressText').innerText = `${progressValue}%`;
    document.getElementById('progressCircle').style.setProperty('--fillValue', progressValue);
    document.getElementById('totalTime').innerText = toHoursAndMinutes(totalTimeInMinutes);
    var startedDaysAgo = Math.floor((new Date() - new Date(jsonData.creationDate)) / 86400000);   //86400000 ms in a day
    switch (startedDaysAgo) {
        case 0: document.getElementById('startedAgo').innerText = "Today"; break;
        case 1: document.getElementById('startedAgo').innerText = "Yesterday"; break;
        default: document.getElementById('startedAgo').innerText = `${startedDaysAgo} days ago`; break;
    }
    document.getElementById('sessionCount').innerText = sessionCount;
    document.getElementById('addedPieces').innerText = addedPiecesCount;
    document.getElementById('piecesLeft').innerText = jsonData.piecesCount - addedPiecesCount;
    document.getElementById('piecesPerHour').innerText = Math.floor((addedPiecesCount / (totalTimeInMinutes / 60)));

    // Graph
    setupGraph(getAddPiecesGraphData());

    // Debug spoiler
    document.getElementById('debugJson').innerHTML = `<pre><code>${JSON.stringify(jsonData, null, "\t")}</code></pre>`;
}

loadPage();

window.onstorage = () => {
    loadPage();
};

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Graph
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function setupGraph(graphData) {
    let sessionGraph = document.getElementById('sessionGraph');
    sessionGraph.setAttribute("title", graphData.title);
    while (sessionGraph.lastElementChild) {
        sessionGraph.removeChild(sessionGraph.lastElementChild);
    }
    var currentSession = 0;
    graphData.values.forEach(value => {
        let sessionGraphCell = document.createElement("div");
        sessionGraphCell.setAttribute("class", "sessionGraphCell");
        sessionGraphCell.style.setProperty('--fillValue', Math.floor((value.value / graphData.maxValue) * 100) + "%");
        let cellLabel = document.createElement("p");
        cellLabel.innerText = value.label;
        sessionGraphCell.appendChild(cellLabel);
        sessionGraph.appendChild(sessionGraphCell);
        currentSession += 1;
    });
}

function getGraphDataStructure() {
    return {
        values: [],
        maxValue: 0,
        title: ""
    }
}

function getAddPiecesGraphData() {
    var graphData = getGraphDataStructure();
    jsonData.sessions.forEach(sessionData => {
        graphData.values.push({
            label: sessionData.addedPieces,
            value: sessionData.addedPieces
        });
    });
    graphData.maxValue = Math.max(...graphData.values.map(v => v.value));
    graphData.title = "Added pieces";
    return graphData;
}

function getTotalPiecesLeftGraphData() {
    var graphData = getGraphDataStructure();
    var totalCount = jsonData.piecesCount;
    jsonData.sessions.forEach(sessionData => {
        totalCount -= sessionData.addedPieces;
        graphData.values.push({
            label: totalCount,
            value: totalCount
        });
    });
    graphData.maxValue = jsonData.piecesCount;
    graphData.title = "Pieces left";
    return graphData;
}

function getDurationGraphData() {
    var graphData = getGraphDataStructure();
    jsonData.sessions.forEach(sessionData => {
        graphData.values.push({
            label: sessionData.duration,
            value: getTotalMinutes(sessionData.duration)
        });
    });
    graphData.maxValue = Math.max(...graphData.values.map(v => v.value));
    graphData.title = "Sessions duration";
    return graphData;
}

function getPiecesPerHourGraphData() {
    var graphData = getGraphDataStructure();
    jsonData.sessions.forEach(sessionData => {
        let piecesPerHour = Math.floor(sessionData.addedPieces / (getTotalMinutes(sessionData.duration) / 60));
        graphData.values.push({
            label: piecesPerHour,
            value: piecesPerHour
        });
    });
    graphData.maxValue = Math.max(...graphData.values.map(v => v.value));
    graphData.title = "Pieces/hour";
    return graphData;
}

function getProgressionGraphData() {
    var graphData = getGraphDataStructure();
    var totalCount = 0;
    jsonData.sessions.forEach(sessionData => {
        totalCount += sessionData.addedPieces;
        let progression = Math.floor((totalCount / jsonData.piecesCount) * 100);
        graphData.values.push({
            label: progression + "%",
            value: progression
        });
    });
    graphData.maxValue = 100;
    graphData.title = "Progression";
    return graphData;
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Session creation
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function newSessionClicked() {
    document.getElementById('sessionDate').value = new Date().toISOString().substring(0, 16);
    document.getElementById('newSessionDialog').showModal();
}

function newSessionDialogCancel() {
    document.getElementById('newSessionDialog').close();
}

function newSessionDialogSubmit() {
    createSession();
    let dialog = document.getElementById('newSessionDialog');
    dialog.close();
}

function createSession() {
    if (jsonData != null) {
        let form = document.getElementById('newSessionForm');
        let duration = form.elements["sessionDuration"].value;
        let addedPieces = parseInt(form.elements["addedPieces"].value);
        let sessionDate = form.elements["sessionDate"].value;

        // Data validation
        if (duration == "" || isNaN(addedPieces) || sessionDate == "") {
            return;
        }

        let newSessionData = {
            id: self.crypto.randomUUID(),
            sessionDate: new Date(sessionDate),
            duration: duration,
            addedPieces: addedPieces,
        }
        jsonData.sessions.push(newSessionData);
        form.reset();
        window.localStorage.setItem(jsonData.id, JSON.stringify(jsonData));
        window.onstorage();
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Json import/export
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function exportJson() {
    if (jsonData == null) {
        return;
    }

    download(JSON.stringify(jsonData), jsonData.name + ".json", "text/plain");
}

function importJson() {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        // Read file
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            // Validate data
            let importedData = JSON.parse(content);
            if (importedData.id == jsonData.id && importedData.type == "puzzle") {
                jsonData = importedData;
                jsonData.sessions.sort(function (a, b) {
                    return new Date(a.sessionDate) - new Date(b.sessionDate);
                })
                window.localStorage.setItem(jsonData.id, JSON.stringify(jsonData));
                reloadData();
            }
        }
    }
    input.click();
}


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Utils
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getTotalMinutes(duration) {
    let [hours, minutes] = duration.split(":");
    return Number(hours) * 60 + Number(minutes);
}