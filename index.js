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
    createPuzzle();
    let dialog = document.getElementById('newPuzzleDialog');
    dialog.close();
}

function createPuzzle() {
    let form = document.getElementById('newPuzzleForm');
    let puzzleName = form.elements["puzzleName"].value;
    let piecesCount = parseInt(form.elements["piecesCount"].value);
    let startDate = form.elements["startDate"].value;

    // Data validation
    console.log(piecesCount);
    if (puzzleName == "" || isNaN(piecesCount) || piecesCount <= 0 || startDate == "") {
        return;
    }

    let puzzleData = {
        id: self.crypto.randomUUID(),
        type: "puzzle",
        name: puzzleName,
        piecesCount: piecesCount,
        creationDate: new Date(startDate),
        lastEdition: Date.now()
    }
    window.localStorage.setItem(puzzleData.id, JSON.stringify(puzzleData));
    window.onstorage();
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