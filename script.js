// script.js
// Logic for the King&#39;s Cup party game.

// Card assignments and their rules/actions.
// These descriptions use simple language and short sentences for easy understanding.
const cardAssignments = {
  'A': {
    title: 'Ace',
    description: 'Waterfall: Everyone starts drinking. They stop when you stop.',
    // A short story to accompany the rule and enhance the experience
    story: 'A waterfall flows! Start sipping and everyone follows until you stop.'
  },
  '2': {
    title: 'Two',
    description: 'You: Pick another player to drink.',
    story: 'Choose a friend to drink with you. Tap a player and share the moment.'
  },
  '3': {
    title: 'Three',
    description: 'Me: You drink.',
    story: 'It’s all about you! Take a sip and enjoy the game.'
  },
  '4': {
    title: 'Four',
    description: 'Floor: Touch the floor. Last one drinks.',
    story: 'Drop down and touch the floor. The slowest player takes a drink.'
  },
  '5': {
    title: 'Five',
    description: 'Guys: All guys drink.',
    story: 'Gentlemen, raise your glasses! All men take a sip.'
  },
  '6': {
    title: 'Six',
    description: 'Girls: All girls drink.',
    story: 'Ladies, it’s your turn! All women take a sip.'
  },
  '7': {
    title: 'Seven',
    description: 'Heaven: Point up. Last one drinks.',
    story: 'Hands to the sky! The last one pointing upwards drinks.'
  },
  '8': {
    title: 'Eight',
    description: 'Mate: Choose a mate. When you drink, they drink.',
    story: 'Pick a mate. From now on, when you drink, they must drink too.'
  },
  '9': {
    title: 'Nine',
    description: 'Rhyme: Say a word. Next players say words that rhyme. First stuck drinks.',
    story: 'Start a rhyme game! Say a word; the next players rhyme until someone gets stuck.'
  },
  '10': {
    title: 'Ten',
    description: 'Category: Pick a category. Say items. First stuck drinks.',
    story: 'Choose a category like fruits or movies. Each player names something until someone repeats or gets stuck.'
  },
  'J': {
    title: 'Jack',
    description: 'Rule: Make a new rule. Anyone who breaks it drinks.',
    story: 'Become the rule maker! Invent a new rule. Anyone who breaks it must drink.'
  },
  'Q': {
    title: 'Queen',
    description: 'Question master: Ask questions. Anyone who answers drinks.',
    story: 'You are the question master. Ask questions and catch anyone who answers out loud – they drink!'
  },
  'K': {
    title: 'King',
    description: 'King’s Cup: Pour some of your drink into the cup. Fourth king drinks it.',
    story: 'Add some of your drink to the cup. Whoever draws the fourth King drinks the entire cup!'
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
  // Assign custom animation classes to each card type to enhance
  // the storytelling. These classes are defined in the CSS file.
  'A': 'waterfall-animation',
  '2': 'choose-animation',
  '3': 'me-animation',
  '4': 'floor-animation',
  '5': 'guys-animation',
  '6': 'girls-animation',
  '7': 'heaven-animation',
  '8': 'mate-animation',
  '9': 'rhyme-animation',
  '10': 'category-animation',
  'J': 'rule-animation',
  'Q': 'question-animation',
  'K': 'king-animation'
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

// New UI elements for the deck and story display
const deckDiv = document.getElementById('deck');
const storyDisplay = document.getElementById('storyDisplay');

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
  if (storyDisplay) storyDisplay.textContent = '';
  // Show the deck for the first draw and hide the drawn card area
  if (deckDiv) {
    deckDiv.style.display = 'block';
  }
  updateCurrentPlayer();
  setupDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  // Ensure next button is hidden until a card is drawn
  nextBtn.style.display = 'none';
});

// Handle drawing a card. This function encapsulates the logic for
// drawing from the deck, updating the UI and applying animations.
function drawCard() {
  if (deck.length === 0) {
    ruleDisplay.textContent = 'No more cards! The game is over.';
    // Hide the deck because there are no cards left
    if (deckDiv) deckDiv.style.display = 'none';
    nextBtn.style.display = 'none';
    return;
  }
  const value = deck.pop();
  const assignment = cardAssignments[value];
  // Update kings counter if a King is drawn
  if (value === 'K') {
    kingsDrawn++;
  }
  // Hide the deck while showing the drawn card
  if (deckDiv) deckDiv.style.display = 'none';
  // Remove any previous animation class before adding a new one
  if (currentAnimationClass) {
    cardDisplay.classList.remove(currentAnimationClass);
  }
  // Display card front and apply animation for this card
  cardDisplay.className = 'card-front';
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
  // If a King is drawn and it is the fourth one, add extra instruction
  if (value === 'K' && kingsDrawn === 4) {
    description += ' This is the fourth King – you drink the cup.';
  }
  // Show the rule with an icon and the story below. Use innerHTML to include the icon image.
  const iconUrl = assignment.icon;
  ruleDisplay.innerHTML = `<img src="${iconUrl}" alt="" style="width:32px;height:32px;vertical-align:middle;margin-right:0.5rem;"> <strong>${assignment.title}</strong>: ${description}`;
  // Display the story
  if (storyDisplay) {
    storyDisplay.textContent = assignment.story || '';
  }
  // Show Next Turn button
  nextBtn.style.display = 'inline-block';
}

// Remove old draw button listener if it exists (fallback for older versions). We'll
// still keep the draw button hidden in the UI, but ensure no action is bound.
if (drawBtn) {
  drawBtn.style.display = 'none';
  drawBtn.disabled = true;
}

// Move to next player's turn
nextBtn.addEventListener('click', () => {
  // Reset card display to back and remove any animation class
  if (currentAnimationClass) {
    cardDisplay.classList.remove(currentAnimationClass);
    currentAnimationClass = '';
  }
  cardDisplay.className = 'card-back';
  cardDisplay.textContent = '';
  // Clear rule and story
  ruleDisplay.textContent = '';
  if (storyDisplay) storyDisplay.textContent = '';
  // Show the deck again for the next draw
  if (deckDiv) {
    deckDiv.style.display = 'block';
  }
  // Advance player index
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateCurrentPlayer();
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
      // Hide the deck and clear story
      if (deckDiv) {
        deckDiv.style.display = 'none';
      }
      if (storyDisplay) {
        storyDisplay.textContent = '';
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

// Attach click handler to the deck to draw a card
if (deckDiv) {
  deckDiv.addEventListener('click', () => {
    // Only allow drawing a card if the next button is hidden (i.e., current player has not
    // already drawn). This prevents multiple draws in the same turn.
    if (nextBtn.style.display === 'none' || nextBtn.style.display === '') {
      drawCard();
    }
  });
}