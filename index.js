function reloadPuzzles() {
    let grid = document.getElementById("puzzleGrid");
    let gridChildren = [...grid.children];
    gridChildren.forEach(child => {
        if (child.id != "addPuzzleCell") {
            grid.removeChild(child);
        }
    });
    let cellTemplate = document.getElementById("puzzleCellTemplate");
    var curId = 0;
    for (var key in window.localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let jsonData = JSON.parse(window.localStorage.getItem(key));
            if (jsonData.type == "puzzle") {
                let cell = cellTemplate.cloneNode(true);
                cell.id = jsonData.id;
                cell.querySelector(".puzzleTitle").innerText = jsonData.name;
                var progressValue = 0;
                if (jsonData.sessions != null) {
                    var addedPiecesCount = 0;
                    jsonData.sessions.forEach(sessionData => {
                        addedPiecesCount += sessionData.addedPieces;
                    });
                    progressValue = Math.floor((addedPiecesCount / jsonData.piecesCount) * 100);
                }
                cell.querySelector(".progressText").innerText = `${progressValue}%`;
                cell.querySelector(".progressCircle").style.setProperty('--fillValue', progressValue);
                cell.style.setProperty('order', curId);
                cell.href = `puzzlePage.html?id=${jsonData.id}`;
                cell.classList.remove("displayNone");
                grid.appendChild(cell);
                curId += 1;
            }
        }
    }
}

function newPuzzleClicked() {
    document.getElementById('startDate').value = new Date().toISOString().substring(0, 10);
    document.getElementById('newPuzzleDialog').showModal();
}

function newPuzzleDialogCancel() {
    document.getElementById('newPuzzleDialog').close();
}

function newPuzzleDialogSubmit() {
    if (createPuzzle()) {
        let dialog = document.getElementById('newPuzzleDialog');
    dialog.close();
    }
}

function createPuzzle() {
    let form = document.getElementById('newPuzzleForm');
    let puzzleName = form.elements["puzzleName"].value;
    let piecesCount = parseInt(form.elements["piecesCount"].value);
    let startDate = form.elements["startDate"].value;

    // Data validation
    if (puzzleName == "" || isNaN(piecesCount) || piecesCount <= 0 || startDate == "") {
        return false;
    }

    let puzzleData = {
        id: self.crypto.randomUUID(),
        type: "puzzle",
        name: puzzleName,
        piecesCount: piecesCount,
        creationDate: new Date(startDate),
        lastEdition: new Date(),
        sessions: []
    }
    window.localStorage.setItem(puzzleData.id, JSON.stringify(puzzleData));
    window.onstorage();
    form.reset();
    return true;
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
            if (importedData.id != null && importedData.id != "" && importedData.type == "puzzle") {
                jsonData = importedData;
                jsonData.sessions.sort(function (a, b) {
                    return new Date(a.sessionDate) - new Date(b.sessionDate);
                })
                window.localStorage.setItem(jsonData.id, JSON.stringify(jsonData));
                reloadPuzzles();
                document.getElementById('newPuzzleDialog').close();
            }
        }
    }
    input.click();
}

function onPuzzleSelected(id) {
    window.location.href = `puzzlePage.html?id=${id}`;
}

function stopEventPropagation(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }
    else if (window.event) {
        window.event.cancelBubble = true;
    }
}

reloadPuzzles();

window.onstorage = () => {
    reloadPuzzles();
};