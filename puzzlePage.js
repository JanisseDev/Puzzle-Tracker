var jsonData = null;

function loadPage() {
    jsonData = null;
    let puzzleId = new URLSearchParams(window.location.search).get('id');
    jsonData = JSON.parse(window.localStorage.getItem(puzzleId));
    reloadData();
}

function reloadData() {
    document.getElementById('puzzleTitle').innerText = jsonData.name;
    document.getElementById('puzzleJson').innerText = JSON.stringify(jsonData, null, "\t");
    let sessionsGrid = document.getElementById('sessionGrid');
    let sessionCellTemplate = document.getElementById('sessionCellTemplate');
    while (sessionsGrid.lastElementChild) {
        sessionsGrid.removeChild(sessionsGrid.lastElementChild);
    }
    if (jsonData.sessions != null) {
        jsonData.sessions.forEach(sessionData => {
            let sessionCell = sessionCellTemplate.cloneNode(true);
            console.log(sessionCell);
            sessionCell.id = sessionData.id;
            sessionCell.querySelector(".sessionCellDuration").innerText = `Session duration: ${sessionData.duration}`;
            sessionCell.querySelector(".sessionCellAddedPieces").innerText = `Pieces added: ${sessionData.addedPieces}`;
            sessionCell.hidden = false;
            sessionsGrid.appendChild(sessionCell);
        });
    }
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