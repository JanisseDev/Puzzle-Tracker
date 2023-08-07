var jsonData = null;

function loadPage() {
    jsonData = null;
    let puzzleId = new URLSearchParams(window.location.search).get('id');
    jsonData = JSON.parse(window.localStorage.getItem(puzzleId));
    reloadData();
}

function reloadData() {
    // Sessions
    let sessionsGrid = document.getElementById('sessionGrid');
    let sessionCellTemplate = document.getElementById('sessionCellTemplate');
    var sessionCount = 0;
    var addedPiecesCount = 0;
    var totalTimeInMinutes = 0;
    while (sessionsGrid.lastElementChild) {
        sessionsGrid.removeChild(sessionsGrid.lastElementChild);
    }
    if (jsonData.sessions != null) {
        sessionCount = jsonData.sessions.length;
        jsonData.sessions.forEach(sessionData => {
            addedPiecesCount += sessionData.addedPieces;
            let [hours, minutes] = sessionData.duration.split(":");
            totalTimeInMinutes += Number(hours)*60 + Number(minutes);

            let sessionCell = sessionCellTemplate.cloneNode(true);
            sessionCell.id = sessionData.id;
            sessionCell.querySelector(".sessionCellDuration").innerText = `Session duration: ${sessionData.duration}`;
            sessionCell.querySelector(".sessionCellAddedPieces").innerText = `Pieces added: ${sessionData.addedPieces}`;
            sessionCell.hidden = false;
            sessionsGrid.appendChild(sessionCell);
        });
    }

    // General info
    document.getElementById('puzzleTitle').innerText = jsonData.name;
    let progressValue = Math.floor((addedPiecesCount / jsonData.piecesCount) * 100);
    document.getElementById('progressText').innerText = `${progressValue}%`;
    document.getElementById('progressCircle').style.setProperty('--fillValue', progressValue);
    document.getElementById('totalTime').innerText = toHoursAndMinutes(totalTimeInMinutes);
    var startedDaysAgo = Math.floor((new Date() - jsonData.creationDate) / 86400000);   //86400000 ms in a day
    switch(startedDaysAgo) {
        case 0: document.getElementById('startedAgo').innerText = "Today"; break;
        case 1: document.getElementById('startedAgo').innerText = "Yesterday"; break;
        default: document.getElementById('startedAgo').innerText = `${startedDaysAgo} days ago`; break;
    }
    document.getElementById('sessionCount').innerText = sessionCount;
    document.getElementById('addedPieces').innerText = addedPiecesCount;
    document.getElementById('piecesLeft').innerText = jsonData.piecesCount - addedPiecesCount;
    document.getElementById('piecesPerHour').innerText = Math.floor((addedPiecesCount / (totalTimeInMinutes/60)));

    // Debug spoiler
    document.getElementById('debugJson').innerHTML = `<pre><code>${JSON.stringify(jsonData, null, "\t")}</code></pre>`;
}

function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

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
            duration: form.elements["sessionDuration"].value,
            addedPieces: form.elements["addedPieces"].value,
        }
        if (jsonData.sessions == null) {
            jsonData.sessions = []
        }
        jsonData.sessions.push(newSessionData);
        form.reset();
        window.localStorage.setItem(jsonData.id, JSON.stringify(jsonData));
        window.onstorage();
    }
}

loadPage();

window.onstorage = () => {
    loadPage();
};