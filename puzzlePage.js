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
    var addedPiecesCount = 0;
    var totalTimeInMinutes = 0;
    while (sessionsGrid.lastElementChild) {
        sessionsGrid.removeChild(sessionsGrid.lastElementChild);
    }
    if (jsonData.sessions != null) {
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
    let progression = (addedPiecesCount / jsonData.piecesCount) * 100;
    document.getElementById('progressBar').value = progression;
    document.getElementById('progressLabel').innerText = `${addedPiecesCount}/${jsonData.piecesCount}`;
    console.log(totalTimeInMinutes);
    document.getElementById('totalTimeLabel').innerText = `Total time: ${toHoursAndMinutes(totalTimeInMinutes)}`;

    // Debug spoiler
    document.getElementById('puzzleJson').innerText = JSON.stringify(jsonData, null, "\t");
}

function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

function newSessionClicked() {
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
        let newSessionData = {
            id: self.crypto.randomUUID(),
            creationDate: Date.now(),
            duration: form.elements["sessionDuration"].value,
            addedPieces: parseInt(form.elements["addedPieces"].value),
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