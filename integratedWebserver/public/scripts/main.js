var rhit = rhit || {};
const adminApiUrl = "http://localhost:3000/api/admin/";
//Reference (Note: the Admin api tells you words.  You are an admin.):
// POST   /api/admin/add      with body {"word": "..."} - Add a word to the word list
// GET    /api/admin/words    													- Get all words
// GET    /api/admin/word/:id 													- Get a single word at index
// PUT    /api/admin/word/:id with body {"word": "..."} - Update a word at index
// DELETE /api/admin/word/:id 													- Delete a word at index

const playerApiUrl = "http://localhost:3000/api/player/";
//Reference (The player api never shares the word. It is a secret.):
// GET    /api/player/numwords    											- Get the number of words
// GET    /api/player/wordlength/:id								 		- Get the length of a single word at index
// GET    /api/player/guess/:id/:letter								  - Guess a letter in a word

rhit.AdminController = class {
	constructor() {
		document.querySelector("#addButton").onclick = (event) => {
			const createWordInput = document.querySelector("#createWordInput");
			this.add(createWordInput.value);
			createWordInput.value = "";
		};
		document.querySelector("#readAllButton").onclick = (event) => {
			this.readAll();
		};
		document.querySelector("#readSingleButton").onclick = (event) => {
			const readIndexInput = document.querySelector("#readIndexInput");
			this.readSingle(parseInt(readIndexInput.value));
			readIndexInput.value = "";
		};
		document.querySelector("#updateButton").onclick = (event) => {
			const updateIndexInput = document.querySelector("#updateIndexInput");
			const updateWordInput = document.querySelector("#updateWordInput");
			this.update(parseInt(updateIndexInput.value), updateWordInput.value);
			updateIndexInput.value = "";
			updateWordInput.value = "";
		};
		document.querySelector("#deleteButton").onclick = (event) => {
			const deleteIndexInput = document.querySelector("#deleteIndexInput");
			this.delete(parseInt(deleteIndexInput.value));
			deleteIndexInput.value = "";
		};
	}

	add(word) {
		if (!word) {
			console.log("No word provided.  Ignoring request.");
			return;
		}
		console.log(`TODO: Add the word ${word} to the backend`);
		fetch(adminApiUrl + "add", {
			method: "POST",
			headers: {"Content-Type": 'application/json'},
			body: JSON.stringify({"word": word}),
		})
		.then(response => response.json())
		.then(data => {
			document.querySelector("#createWordInput").innerHTML = data.words;
		})
	}

	readAll() {
		fetch(adminApiUrl + "words")
		.then(response => response.json())
		.then(data => {
			document.querySelector("#readAllOutput").innerHTML = data.words;
		})
	}

	readSingle(index) {
		if (Number.isNaN(index)) {
			console.log("No index provided.  Ignoring request.");
			return;
		}

		fetch(adminApiUrl + "word/" + index)
		.then(response => response.json())
		.then(data => {
			document.querySelector("#readSingleOutput").innerHTML = data.word;
		})
	}

	update(index, word) {
		if (Number.isNaN(index)) {
			console.log("No index provided.  Ignoring request.");
			return;
		}
		if (!word) {
			console.log("No word provided.  Ignoring request.");
			return;
		}
		console.log(`TODO: Update the word ${word} at index ${index} on the backend.`);
		const data = {"word": word};
		console.log(data);

		fetch(adminApiUrl + "word/" + index, {
			method: "PUT",
			headers: {"Content-Type": 'application/json'},
			body: JSON.stringify(data),
		}).then(data => {
			document.querySelector("#updateWordInput").value = "";
			document.querySelector("#updateIndexInput").value = "";
		})

	}

	delete(index) {
		if (Number.isNaN(index)) {
			console.log("No index provided.  Ignoring request.");
			return;
		}
		// console.log(`TODO: Delete the word at index ${index} from the backend.`);

		// TODO: Add your code here.
		
		fetch(adminApiUrl + "word/" + index, {
			method: "DELETE"
		})
		.then(data => {
			document.querySelector("#deleteIndexInput").value = "";
		})
	}
}

rhit.PlayerController = class {
	constructor() {
		this.guessed = [];
		this.wordlen;
		this.numwords;
		this.id;
		this.corrString = [];
		this.displaystring = "";

		// Connect the Keyboard inputs
		const keyboardKeys = document.querySelectorAll(".key");
		for (const keyboardKey of keyboardKeys) {
			keyboardKey.onclick = (event) => {
				this.handleKeyPress(keyboardKey.dataset.key);
			};
		}

		fetch(playerApiUrl + "numwords")
		.then(response => response.json())
		.then(data => {
			this.numwords = data.length;
			this.handleNewGame(); // Start with a new game.
		})


		// Connect the new game button
		document.querySelector("#newGameButton").onclick = (event) => {
			this.corrString = [];
			this.guessed = [];
			this.handleNewGame();
		}
	}

	handleNewGame() {
		this.id = Math.floor(Math.random() * (this.numwords));
		fetch(playerApiUrl + "wordlength/" + this.id, {
			method: "GET",
			headers: {"Content-Type": 'application/json'},
		})
		.then(response => response.json())
		.then(data => {
			this.wordlen = data.length;
			for (let x = 0; x < this.wordlen; x++) {
				this.corrString.push("_");
			}
			this.updateView();
		});

	}

	handleKeyPress(keyValue) {
		fetch(playerApiUrl + "guess/" + this.id + "/" + keyValue)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			this.guessed.push(data.letter);
			console.log("data.pushed: " + data.letter);
			console.log("word: " + data.word);
			for (let x = 0; x < data.locations.length; x++) {
				this.corrString[data.locations[x]] = data.letter;
			}
			this.updateView();
		})

	}

	updateView() {
		document.querySelector("#displayWord").innerHTML = this.corrString.join("");
		document.querySelector("#incorrectLetters").innerHTML = this.guessed;

		const keyboardKeys = document.querySelectorAll(".key");
		for (const keyboardKey of keyboardKeys) {
			if (this.guessed.includes(keyboardKey.dataset.key)) {
				keyboardKey.style.visibility = "hidden";
			} else {
				keyboardKey.style.visibility = "initial";
			}
		}
	}
}

/* Main */
rhit.main = function () {
	console.log("Ready");
	if (document.querySelector("#adminPage")) {
		console.log("On the admin page");
		new rhit.AdminController();
	}
	if (document.querySelector("#playerPage")) {
		console.log("On the player page");
		new rhit.PlayerController();
	}
};

rhit.main();