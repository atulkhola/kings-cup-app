// script.js
// Logic for the King&#39;s Cup party game.

// Card assignments and their rules/actions.
// The descriptions here are adapted from common King&#39;s Cup rules,
// but framed as optional beverages or fun challenges to encourage
// responsible play. You can customise these messages later.
const cardAssignments = {
  'A': {
    title: 'Ace',
    description: 'Waterfall – Everyone starts sipping their beverage at the same time. You decide when to stop; each player may only stop once the person before them does.'
  },
  '2': {
    title: 'Two',
    description: 'You – Pick another player to take a sip or perform a small challenge (e.g., do a dance move).'
  },
  '3': {
    title: 'Three',
    description: 'Me – You take a sip of your beverage or perform a small challenge.'
  },
  '4': {
    title: 'Four',
    description: 'Floor – Everyone must touch the floor. The last person to do so takes a sip or does a fun penalty.'
  },
  '5': {
    title: 'Five',
    description: 'Guys – All players identifying as male take a sip or do a small challenge.'
  },
  '6': {
    title: 'Six',
    description: 'Chicks – All players identifying as female take a sip or do a small challenge.'
  },
  '7': {
    title: 'Seven',
    description: 'Heaven – Raise your hands in the air! The last person to do so takes a sip or does a fun penalty.'
  },
  '8': {
    title: 'Eight',
    description: 'Mate – Choose a buddy. Whenever one of you takes a sip or does a challenge, the other must do the same for the rest of the game.'
  },
  '9': {
    title: 'Nine',
    description: 'Rhyme – Say a word. Going around the circle, each player must say a word that rhymes. The first to falter takes a sip or a penalty.'
  },
  '10': {
    title: 'Ten',
    description: 'Categories – Pick a category (e.g., fruits, movies). Each player names something in that category. Whoever can’t think of something takes a sip or a penalty.'
  },
  'J': {
    title: 'Jack',
    description: 'Make a Rule – Create a house rule to be followed for the rest of the game (e.g., speak with an accent). Anyone who breaks it takes a sip or a penalty.'
  },
  'Q': {
    title: 'Queen',
    description: 'Question Master – You may ask players questions at any time. Anyone who answers must take a sip or a penalty until another Queen is drawn.'
  },
  'K': {
    title: 'King',
    description: 'King’s Cup – The first three Kings drawn must pour some of their beverage into a communal cup. The player who draws the fourth King must finish whatever is in the cup (or take a big sip of their own drink).'
  }
};

// Create a new deck: 52 cards represented only by their value (Ace, 2–10, J, Q, K).
function createDeck() {
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = [];
  for (let suit = 0; suit < 4; suit++) {
    for (const val of values) {
      deck.push(val);
    }
  }
  return deck;
}

// Shuffle an array using Fisher-Yates algorithm.
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Global game state
let deck = [];
let players = [];
let currentPlayerIndex = 0;
let kingsDrawn = 0;

// DOM elements
const setupDiv = document.getElementById('setup');
const gameDiv = document.getElementById('game');
const startBtn = document.getElementById('startBtn');
const drawBtn = document.getElementById('drawBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const cardDisplay = document.getElementById('cardDisplay');
const ruleDisplay = document.getElementById('ruleDisplay');
const currentPlayerP = document.getElementById('currentPlayer');

// Initialize game when clicking Start Game
startBtn.addEventListener('click', () => {
  const countInput = document.getElementById('playerCount');
  let count = parseInt(countInput.value, 10);
  if (isNaN(count) || count < 2) {
    alert('Please enter a valid number of players (minimum 2).');
    return;
  }
  // Generate player names generically: Player 1, Player 2, etc.
  players = [];
  for (let i = 1; i <= count; i++) {
    players.push(`Player ${i}`);
  }
  currentPlayerIndex = 0;
  kingsDrawn = 0;
  deck = shuffle(createDeck());
  ruleDisplay.textContent = '';
  cardDisplay.className = 'card-back';
  cardDisplay.textContent = '';
  updateCurrentPlayer();
  setupDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  drawBtn.disabled = false;
  nextBtn.style.display = 'none';
});

// Draw a card when clicking Draw Card
drawBtn.addEventListener('click', () => {
  if (deck.length === 0) {
    ruleDisplay.textContent = 'No more cards! The game is over.';
    drawBtn.disabled = true;
    nextBtn.style.display = 'none';
    return;
  }
  const value = deck.pop();
  const assignment = cardAssignments[value];
  // Update kings counter if a King is drawn
  if (value === 'K') {
    kingsDrawn++;
  }
  // Display card front with value
  cardDisplay.className = 'card-front';
  cardDisplay.textContent = value;
  // Compose the rule description with dynamic player suggestion if needed
  let description = assignment.description;
  // For cards that require choosing another player (2, 8, etc.), suggest a random other player
  if (value === '2' || value === '8') {
    const otherPlayers = players.filter((_, idx) => idx !== currentPlayerIndex);
    const randomIdx = Math.floor(Math.random() * otherPlayers.length);
    const other = otherPlayers[randomIdx];
    description = description.replace('another player', `${other}`);
    description = description.replace('a buddy', `${other}`);
  }
  if (value === 'A' || value === 'K') {
    description += kingsDrawn === 4 ? ' This is the fourth King – you must finish the communal cup (or take a big sip of your drink).' : '';
  }
  ruleDisplay.textContent = `${assignment.title}: ${description}`;
  // After drawing, disable draw button and show Next Turn
  drawBtn.disabled = true;
  nextBtn.style.display = 'inline-block';
});

// Move to next player's turn
nextBtn.addEventListener('click', () => {
  // Reset card display to back
  cardDisplay.className = 'card-back';
  cardDisplay.textContent = '';
  ruleDisplay.textContent = '';
  // Advance player index
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateCurrentPlayer();
  drawBtn.disabled = false;
  nextBtn.style.display = 'none';
});

// Reset the game back to setup
resetBtn.addEventListener('click', () => {
  setupDiv.style.display = 'block';
  gameDiv.style.display = 'none';
  ruleDisplay.textContent = '';
  cardDisplay.textContent = '';
  cardDisplay.className = 'card-back';
});

// Update the display of whose turn it is
function updateCurrentPlayer() {
  currentPlayerP.textContent = `${players[currentPlayerIndex]}'s turn`;
}