function reloadPuzzles() {
    let grid = document.getElementById("puzzleGrid");
    while (grid.lastElementChild) {
        grid.removeChild(grid.lastElementChild);
    }
    let cellTemplate = document.getElementById("puzzleCellTemplate");
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
                    progressValue = Math.ceil((addedPiecesCount / jsonData.piecesCount) * 100);
                }
                cell.querySelector(".progressText").innerText = `${progressValue}%`;
                cell.querySelector(".progressCircle").style.setProperty('--fillValue', progressValue);
                cell.href = `puzzlePage.html?id=${jsonData.id}`;
                cell.classList.remove("displayNone");
                grid.appendChild(cell);
            }
        }
    }
}

function newPuzzleClicked() {
    document.getElementById('newPuzzleDialog').showModal();
}

function newPuzzleDialogCancel() {
    document.getElementById('newPuzzleDialog').close();
}

function newPuzzleDialogSubmit() {
    createPuzzle();
    let dialog = document.getElementById('newPuzzleDialog');
    dialog.close();
}

function createPuzzle() {
    let form = document.getElementById('newPuzzleForm');
    let puzzleName = form.elements["puzzleName"].value;
    let piecesCount = parseInt(form.elements["piecesCount"].value);
    if (puzzleName != null && puzzleName != "" && piecesCount > 0) {
        let puzzleData = {
            id: self.crypto.randomUUID(),
            type: "puzzle",
            name: puzzleName,
            piecesCount: piecesCount,
            creationDate: Date.now(),
            lastEdition: Date.now()
        }
        window.localStorage.setItem(puzzleData.id, JSON.stringify(puzzleData));
        window.onstorage();
    }
    form.reset();
}

function onPuzzleSelected(id) {
    window.location.href = `puzzlePage.html?id=${id}`;
}

function deletePuzzleClicked(deleteButton, event) {
    stopEventPropagation(event);
    if (confirm(`Are you sure you want to delete puzzle #${deleteButton.parentNode.id}`)) {
        window.localStorage.removeItem(deleteButton.parentNode.id);
        window.onstorage();
    }
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