let answer = "";
let attempts = 5;
const emojis = ["😩", "😢", "🤢", "💔", "⚰️"];

// Ensure DOM content is loaded before running scripts
window.addEventListener('DOMContentLoaded', () => {
    const clientZoneName = moment.tz.guess();
    const currentDate = moment().tz(clientZoneName).format('YYYY-MM-DD');
    const lastResetDate = localStorage.getItem('lastResetDate');

    // Reset game state at the start of a new day
    if (!lastResetDate || lastResetDate !== currentDate) {
        localStorage.clear();
        localStorage.setItem('lastResetDate', currentDate);
        attempts = 5;
    } else {
        const savedGuesses = localStorage.getItem('guessedWords');
        const savedAttempts = localStorage.getItem('attempts');

        // Restore guessed words
        if (savedGuesses) {
            const guesses = JSON.parse(savedGuesses);
            const guessesList = document.getElementById('guesses-list');
            guessesList.innerHTML = guesses.map(word => `<li>${word}</li>`).join('');
        }

        // Restore attempts
        if (savedAttempts) {
            attempts = parseInt(savedAttempts);
            document.getElementById('remaining-guesses').textContent = `${emojis.slice(0, 5 - attempts).join(' ')}`;
        }

        // Check if the game is over
        const isGameOver = localStorage.getItem('gameOver') === 'true';
        if (isGameOver) {
            document.getElementById('user-input').disabled = true;
            document.querySelector('button[onclick="submitGuess()"]').disabled = true;
        }
    }

    fetchPhrases(currentDate);

    // Event listener for input
    document.getElementById('user-input').addEventListener('input', function () {
        highlightLetters(this.value.toLowerCase());
    });
});

function fetchPhrases(currentDate) {
    fetch('phrases.json')
        .then(response => response.json())
        .then(data => {
            const entry = data.find(item => item.date === currentDate);
            if (entry) {
                document.getElementById('sentence').textContent = `Phrase: ${entry.phrase}`;
                document.getElementById('clue').textContent = `Clue: ${entry.clue}`;
                answer = entry.answer.toLowerCase();
            } else {
                document.getElementById('feedback').textContent = "No phrase available for today.";
            }
        })
        .catch(err => {
            document.getElementById('feedback').textContent = "Error loading phrases.";
        });
}

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
        document.getElementById('feedback').textContent = 'Letter not found in phrase.';
    } else {
        document.getElementById('feedback').textContent = '';
    }

    sentenceElem.innerHTML = newSentence;
}

function resetHighlights() {
    const sentence = document.getElementById('sentence').textContent;
    document.getElementById('sentence').innerHTML = sentence.replace(/<span class='highlight'>(.*?)<\/span>/g, '$1');
}

function submitGuess() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    resetHighlights();
    highlightLetters(userInput.toLowerCase());
    const feedbackElement = document.getElementById('feedback');
    const guessesList = document.getElementById('guesses-list');

    if (!userInput) {
        feedbackElement.textContent = "Please enter a guess.";
        return;
    }

    // Add the guessed word to the list if not already guessed
    if (![...guessesList.children].some(li => li.textContent === userInput)) {
        const li = document.createElement('li');
        li.textContent = userInput;
        guessesList.appendChild(li);

        // Update local storage for guessed words
        const guesses = [...guessesList.children].map(li => li.textContent);
        localStorage.setItem('guessedWords', JSON.stringify(guesses));
    }

    if (userInput === answer) {
        openModal(`Congratulations! You've guessed the correct word in ${5 - attempts + 1} attempt(s). You speak Gibberish fluently!`);
        localStorage.setItem('gameOver', 'true');
    } else {
        attempts--;
        if (attempts > 0) {
            feedbackElement.textContent = `Incorrect guess. You have ${attempts} attempts left.`;
            document.getElementById('remaining-guesses').textContent = `${emojis.slice(0, 5 - attempts).join(' ')}`;
        } else {
            openModal("⚰️ Thanks for playing ⚰️ Would you like to know the correct answer?");
            localStorage.setItem('gameOver', 'true');
        }
    }

    // Update local storage for attempts
    localStorage.setItem('attempts', attempts.toString());

    document.getElementById('user-input').value = "";
}

function openModal(message) {
    const modal = document.getElementById('resultModal');
    const modalMessage = document.getElementById('modal-message');
    modal.style.display = 'block';
    modalMessage.textContent = message;
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';

    // Disable user input and guess button on game over
    if (localStorage.getItem('gameOver') === 'true') {
        document.getElementById('user-input').disabled = true;
        document.querySelector('button[onclick="submitGuess()"]').disabled = true;
    }
}

function revealAnswer() {
    const modalMessage = document.getElementById('modal-message');
    const revealButton = document.querySelector('button[onclick="revealAnswer()"]');
    modalMessage.textContent += ` The answer was: ${answer}.`;
    revealButton.disabled = true;
    localStorage.setItem('gameOver', 'true');
}
