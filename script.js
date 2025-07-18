let answer = "";
let attempts = 5;

// Ensure DOM content is loaded before running scripts
window.addEventListener('DOMContentLoaded', () => {
    // Fetch phrases from the JSON file
    fetch('phrases.json')
        .then(response => response.json())
        .then(data => {
            const today = new Date().toISOString().split('T')[0];
            const entry = data.find(item => item.date === today);
            if (entry) {
                document.getElementById('sentence').textContent = `Phrase: ${entry.phrase}`;
                document.getElementById('clue').textContent = `Clue: ${entry.clue}`;
                answer = entry.answer.toLowerCase();

            } else {
                document.getElementById('feedback').textContent = "No phrase available for today.";
                console.log('No phrase available for today');
            }
        })
        .catch(err => {
            document.getElementById('feedback').textContent = "Error loading phrases.";
            console.error('Error loading phrases:', err);
        });

    // Event listener for input
    document.getElementById('user-input').addEventListener('input', function () {
        highlightLetters(this.value.toLowerCase());
        console.log('User input changed:', this.value);
    });
});

function toggleRules() {
    const rulesContainer = document.getElementById('rules-container');
    if (rulesContainer.style.display === 'none') {
        rulesContainer.style.display = 'block';
    } else {
        rulesContainer.style.display = 'none';
    }
}

function highlightLetters(userInput) {
    const sentenceElem = document.getElementById('sentence');
    const fullSentence = sentenceElem.textContent.split(': ')[1];
    let newSentence = 'Phrase: ';
    let foundLetter = false;

    for (let char of fullSentence) {
        if (userInput.includes(char.toLowerCase())) {
            newSentence += `<span class='highlight'>${char}</span>`;
            foundLetter = true;
        } else {
            newSentence += char;
        }
    }

    if (!foundLetter) {
        document.getElementById('feedback').textContent = 'Letter not found.';
        console.log('No letter found in the phrase for input:', userInput);
    } else {
        document.getElementById('feedback').textContent = '';
    }

    sentenceElem.innerHTML = newSentence;
}

function resetHighlights() {
    const sentence = document.getElementById('sentence').textContent;
    document.getElementById('sentence').innerHTML = sentence.replace(/<span class='highlight'>(.*?)<\/span>/g, '$1');
    console.log('Highlights reset');
}

function submitGuess() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    resetHighlights();
    highlightLetters(userInput.toLowerCase());
    const feedbackElement = document.getElementById('feedback');
    const guessesList = document.getElementById('guesses-list');

    if (!userInput) {
        feedbackElement.textContent = "Please enter a guess.";
        console.log('No input provided for guess');
        return;
    }

    // Add the guessed word to the list if not already guessed
    if (![...guessesList.children].some(li => li.textContent === userInput)) {
        const li = document.createElement('li');
        li.textContent = userInput;
        guessesList.appendChild(li);
        console.log('Guessed word added:', userInput);
    }

    if (userInput === answer) {
        openModal(`Congratulations! You've guessed the correct word in ${5 - attempts} attempt(s). You speak Gibberish fluently!`);
    } else {
        attempts--;
        if (attempts > 0) {
            feedbackElement.textContent = `Incorrect. You have ${attempts} attempts left.`;
            console.log('Incorrect guess. Attempts left:', attempts);
        } else {
            openModal("Better luck next time! Would you like to know the correct answer?");
        }
    }

    document.getElementById('user-input').value = "";
}

function openModal(message) {
    const modal = document.getElementById('resultModal');
    const modalMessage = document.getElementById('modal-message');
    modal.style.display = 'block';
    modalMessage.textContent = message;
    console.log('Modal opened with message: ', message);
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';
    location.reload();
    console.log('Modal closed and page reloaded');
}

function revealAnswer() {
    const modalMessage = document.getElementById('modal-message');
    const revealButton = document.querySelector('button[onclick="revealAnswer()"]');
    modalMessage.textContent += ` The answer was: ${answer}.`;
    console.log('Answer revealed: ', answer);
    
    // Disable the button to prevent multiple clicks
    revealButton.disabled = true;
}
