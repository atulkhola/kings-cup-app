// script.js
// Logic for the King&#39;s Cup party game.

// Card assignments and their rules/actions.
// These descriptions use simple language and short sentences for easy understanding.
const cardAssignments = {
  'A': {
    title: 'Ace',
    description: 'Waterfall: Everyone starts drinking. They stop when you stop.'
  },
  '2': {
    title: 'Two',
    description: 'You: Pick another player to drink.'
  },
  '3': {
    title: 'Three',
    description: 'Me: You drink.'
  },
  '4': {
    title: 'Four',
    description: 'Floor: Touch the floor. Last one drinks.'
  },
  '5': {
    title: 'Five',
    description: 'Guys: All guys drink.'
  },
  '6': {
    title: 'Six',
    description: 'Girls: All girls drink.'
  },
  '7': {
    title: 'Seven',
    description: 'Heaven: Point up. Last one drinks.'
  },
  '8': {
    title: 'Eight',
    description: 'Mate: Choose a mate. When you drink, they drink.'
  },
  '9': {
    title: 'Nine',
    description: 'Rhyme: Say a word. Next players say words that rhyme. First stuck drinks.'
  },
  '10': {
    title: 'Ten',
    description: 'Category: Pick a category. Say items. First stuck drinks.'
  },
  'J': {
    title: 'Jack',
    description: 'Rule: Make a new rule. Anyone who breaks it drinks.'
  },
  'Q': {
    title: 'Queen',
    description: 'Question master: Ask questions. Anyone who answers drinks.'
  },
  'K': {
    title: 'King',
    description: 'King’s Cup: Pour some of your drink into the cup. Fourth king drinks it.'
  }
};

// Define icons and animations for each card value. These mappings use the DiceBear
// "icons" avatar style to retrieve simple pictograms based on a seed. Each
// card value is also assigned an animation class defined in the CSS to bring
// variety to the drawing experience. Feel free to tweak these seeds and
// animation names to change the look and feel of each card.
const iconMap = {
  'A': 'water',        // wave icon for Waterfall
  '2': 'person-plus', // choose another player
  '3': 'person',      // you drink
  '4': 'arrow-down',  // touch the floor
  '5': 'male',        // guys drink
  '6': 'female',      // girls drink
  '7': 'arrow-up',    // heaven (point up)
  '8': 'people',      // mate / choose someone
  '9': 'mic',         // rhyme (microphone)
  '10': 'list',       // categories
  'J': 'hammer',      // make a rule
  'Q': 'question',    // question master
  'K': 'crown'        // king’s cup
};
const animationMap = {
  'A': 'flip-animation',
  '2': 'slide-animation',
  '3': 'bounce-animation',
  '4': 'fade-animation',
  '5': 'zoom-animation',
  '6': 'zoom-animation',
  '7': 'slide-animation',
  '8': 'bounce-animation',
  '9': 'zoom-animation',
  '10': 'rotate-animation',
  'J': 'flip-animation',
  'Q': 'slide-animation',
  'K': 'rotate-animation'
};

// Attach icon and animation to each card assignment based on the maps above.
for (const key in iconMap) {
  if (cardAssignments[key]) {
    cardAssignments[key].icon = `https://api.dicebear.com/9.x/icons/png?seed=${iconMap[key]}&size=64`;
    cardAssignments[key].animation = animationMap[key];
  }
}

// Track the current animation class so that it can be removed when drawing
// subsequent cards. This avoids stacking multiple animation classes on the
// card display element.
let currentAnimationClass = '';

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
let playerAvatars = [];
let namesCollected = false;

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
const avatarImg = document.getElementById('avatarImg');
const nameInputsDiv = document.getElementById('nameInputs');

// Initialize game when clicking Start Game
startBtn.addEventListener('click', () => {
  const countInput = document.getElementById('playerCount');
  let count = parseInt(countInput.value, 10);
  if (!namesCollected) {
    // First click: validate player count and show name inputs
    if (isNaN(count) || count < 2) {
      alert('Please enter a valid number of players (minimum 2).');
      return;
    }
    // Clear any previous inputs and create new ones
    nameInputsDiv.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Player ${i} name`;
      input.id = `playerName${i}`;
      input.style.margin = '0.25rem';
      nameInputsDiv.appendChild(input);
    }
    nameInputsDiv.style.display = 'block';
    namesCollected = true;
    startBtn.textContent = 'Start Game';
    return;
  }
  // Second click: collect names and start game
  players = [];
  playerAvatars = [];
  for (let i = 1; i <= count; i++) {
    const input = document.getElementById(`playerName${i}`);
    let name = input ? input.value.trim() : '';
    if (!name) {
      name = `Player ${i}`;
    }
    players.push(name);
    // Assign avatar using DiceBear API with the player's name as seed
    const encodedName = encodeURIComponent(name);
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${encodedName}&size=64`;
    playerAvatars.push(avatarUrl);
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
      // Display card front with value and apply animation
      // Remove any previous animation class before adding a new one
      if (currentAnimationClass) {
        cardDisplay.classList.remove(currentAnimationClass);
      }
      cardDisplay.className = 'card-front';
      // Apply the animation class for this card
      currentAnimationClass = assignment.animation || '';
      if (currentAnimationClass) {
        cardDisplay.classList.add(currentAnimationClass);
      }
      cardDisplay.textContent = value;
  // Compose the rule description with dynamic player suggestion if needed
  let description = assignment.description;
  // For cards that require choosing another player (2 and 8), suggest a random other player
  if (value === '2' || value === '8') {
    const otherPlayers = players.filter((_, idx) => idx !== currentPlayerIndex);
    if (otherPlayers.length > 0) {
      const randomIdx = Math.floor(Math.random() * otherPlayers.length);
      const other = otherPlayers[randomIdx];
      description = description.replace('another player', other);
      description = description.replace('a mate', other);
      description = description.replace('mate', other);
    }
  }
  // If an Ace or King is drawn, add extra instruction for the fourth King
  if (value === 'A' || value === 'K') {
    if (value === 'K' && kingsDrawn === 4) {
      description += ' This is the fourth King – you drink the cup.';
    }
  }
      // Show the rule along with an icon. Use innerHTML to include the icon image.
      const iconUrl = assignment.icon;
      ruleDisplay.innerHTML = `<img src="${iconUrl}" alt="" style="width:32px;height:32px;vertical-align:middle;margin-right:0.5rem;"> <strong>${assignment.title}</strong>: ${description}`;
  // After drawing, disable draw button and show Next Turn
  drawBtn.disabled = true;
  nextBtn.style.display = 'inline-block';
});

// Move to next player's turn
nextBtn.addEventListener('click', () => {
      // Reset card display to back and remove any animation class
      if (currentAnimationClass) {
        cardDisplay.classList.remove(currentAnimationClass);
        currentAnimationClass = '';
      }
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
      // Reset names collection state
  namesCollected = false;
  nameInputsDiv.style.display = 'none';
  nameInputsDiv.innerHTML = '';
  startBtn.textContent = 'Next';
  // Hide avatar
  avatarImg.style.display = 'none';

      // Remove any animation class from the card display
      if (currentAnimationClass) {
        cardDisplay.classList.remove(currentAnimationClass);
        currentAnimationClass = '';
      }
});

// Update the display of whose turn it is
function updateCurrentPlayer() {
  if (!players || players.length === 0) return;
  // Update avatar image and name display
  const name = players[currentPlayerIndex];
  const avatar = playerAvatars[currentPlayerIndex];
  if (avatar) {
    avatarImg.src = avatar;
    avatarImg.style.display = 'block';
  }
  currentPlayerP.textContent = `${name}'s turn`;
}