let answer = "";
let attempts = 5;
const emojis = ["😩", "😢", "🤢", "💔", "⚰️"];

// Ensure DOM content is loaded before running scripts
window.addEventListener('DOMContentLoaded', () => {
    // Fetch phrases from the JSON file
      // Get the client's timezone
   const clientZoneName = moment.tz.guess();
    //console.log('Client timezone:', clientZoneName);

   // Use the local timezone to get today's date
   const today = moment().tz(clientZoneName).format('YYYY-MM-DD');
    //console.log('Today\'s date in local timezone:', today);

   // Fetch the phrase for today's date
   fetch('phrases.json')
       .then(response => response.json())
       .then(data => {
           const entry = data.find(item => item.date === today);
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
        document.getElementById('feedback').textContent = 'Letter not found in phrase.';
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
        openModal(`Congratulations! You've guessed the correct word in ${5 - attempts + 1} attempt(s). You speak Gibberish fluently!`);
} else {
    attempts--;
    if (attempts > 0) {
        feedbackElement.textContent = `Incorrect guess. You have ${attempts} attempts left.`;
 document.getElementById('remaining-guesses').textContent = `${emojis.slice(0, 5 - attempts).join(' ')}`;
        console.log('Incorrect guess. Attempts left:', attempts);
    } else {
        openModal(" ⚰️ Thanks for playing ⚰️ Would you like to know the correct answer?");
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
