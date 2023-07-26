function reloadPuzzles() {
    let grid = document.getElementById("puzzleGrid");
    while(grid.lastElementChild) {
        grid.removeChild(grid.lastElementChild);
    }
    let cellTemplate = document.getElementById("puzzleCellTemplate");
    for (var key in window.localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let value = JSON.parse(window.localStorage.getItem(key));
            if (value.type == "puzzle") {
                let cell = cellTemplate.cloneNode(true);
                cell.id = value.id;
                cell.innerText = value.name;
                cell.hidden = false;
                grid.appendChild(cell);
            }
        }
    }
}

function newPuzzle() {
    let puzzleName = window.prompt("Please enter a puzzle name","");
    if (puzzleName != null && puzzleName != "") {
        let puzzleData = {
            id: self.crypto.randomUUID(),
            type: "puzzle",
            name: puzzleName,
            creationDate: Date.now(),
            lastEdition: Date.now()
        }
        window.localStorage.setItem(puzzleData.id, JSON.stringify(puzzleData));
        window.onstorage();
    }
}

reloadPuzzles();

window.onstorage = () => {
    reloadPuzzles();
};