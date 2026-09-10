const anniversaryDate = new Date('2022-12-14T00:00:00');

function updateDayCount() {
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((Date.now() - anniversaryDate.getTime()) / msPerDay);
    const years = Math.max(1, Math.round(days / 365.25));
    const counter = document.getElementById('dayCount');
    if (counter) {
        counter.textContent = new Intl.NumberFormat().format(years);
    }
}

function showPanel(panelName) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `panel-${panelName}`);
    });
}

function setWinMessage(element, message) {
    if (!element) return;
    const copy = element.querySelector('.win-copy');
    if (copy) copy.textContent = message;
    element.classList.add('show');
}

const memorySymbols = [
    { icon: 'bi-suit-heart-fill', label: 'Love', tone: 'pink' },
    { icon: 'bi-envelope-heart-fill', label: 'Letter', tone: 'rose' },
    { icon: 'bi-flower1', label: 'Bloom', tone: 'peach' },
    { icon: 'bi-stars', label: 'Spark', tone: 'gold' },
    { icon: 'bi-gift-fill', label: 'Gift', tone: 'purple' },
    { icon: 'bi-diamond-fill', label: 'Promise', tone: 'cyan' },
    { icon: 'bi-hearts', label: 'Us', tone: 'lavender' },
    { icon: 'bi-heart-pulse-fill', label: 'Forever', tone: 'mint' },
];
let memoryState = {
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    moves: 0,
    pairsFound: 0,
};

function shuffle(array) {
    const next = [...array];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
}

function startMemory() {
    const grid = document.getElementById('memoryGrid');
    const movesEl = document.getElementById('memMoves');
    const pairsEl = document.getElementById('memPairs');
    const winEl = document.getElementById('memWin');

    memoryState = {
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        moves: 0,
        pairsFound: 0,
    };

    if (!grid) return;

    grid.innerHTML = '';
    const deck = shuffle([...memorySymbols, ...memorySymbols]);

    deck.forEach((symbol) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mcard';
        card.dataset.symbol = symbol.icon;
        card.dataset.tone = symbol.tone;
        card.setAttribute('aria-label', `Memory card ${symbol.label}`);
        card.innerHTML = `
      <span class="face back-face">?</span>
      <span class="face front-face">
        <span class="memory-art memory-${symbol.tone}">
          <i class="bi ${symbol.icon} memory-icon"></i>
          <span class="memory-label">${symbol.label}</span>
        </span>
      </span>
    `;
        card.addEventListener('click', () => handleMemoryClick(card));
        grid.appendChild(card);
    });

    if (movesEl) movesEl.textContent = '0';
    if (pairsEl) pairsEl.textContent = '0 / 8';
    if (winEl) winEl.classList.remove('show');
}

function handleMemoryClick(card) {
    if (
        memoryState.lockBoard ||
        card === memoryState.firstCard ||
        card.classList.contains('flipped') ||
        card.classList.contains('matched')
    ) {
        return;
    }

    card.classList.add('flipped');

    if (!memoryState.firstCard) {
        memoryState.firstCard = card;
        return;
    }

    memoryState.secondCard = card;
    memoryState.moves += 1;

    const movesEl = document.getElementById('memMoves');
    if (movesEl) movesEl.textContent = String(memoryState.moves);

    const matched = memoryState.firstCard.dataset.symbol === memoryState.secondCard.dataset.symbol;

    if (matched) {
        memoryState.firstCard.classList.add('matched');
        memoryState.secondCard.classList.add('matched');
        memoryState.pairsFound += 1;

        const pairsEl = document.getElementById('memPairs');
        if (pairsEl) pairsEl.textContent = `${memoryState.pairsFound} / 8`;

        if (memoryState.pairsFound === 8) {
            const winEl = document.getElementById('memWin');
            setWinMessage(winEl, 'This moment feels so simple, but it means so much to me. I love how happy and comfortable we are together. Every little memory with you becomes something I want to keep forever. I hope we can have many more moments like this together. ❤️');
        }

        memoryState.firstCard = null;
        memoryState.secondCard = null;
        return;
    }

    memoryState.lockBoard = true;
    setTimeout(() => {
        if (memoryState.firstCard) memoryState.firstCard.classList.remove('flipped');
        if (memoryState.secondCard) memoryState.secondCard.classList.remove('flipped');
        memoryState.firstCard = null;
        memoryState.secondCard = null;
        memoryState.lockBoard = false;
    }, 650);
}

const triviaSet = [
    {
        question: 'Where was our first kiss?',
        options: ['Car', 'Condo', 'Airport'],
        answer: 'Car',
    },
    {
        question: 'Where was our first date?',
        options: ['Mall Of Asia', 'Mega Mall', 'Glorietta Mall'],
        answer: 'Mall Of Asia',
    },
    {
        question: 'When life feels heavy, what do we do best?',
        options: ['Make a plan together', 'Pull away', 'Ignore it', 'Watch scary movies'],
        answer: 'Make a plan together',
    },
    {
        question: 'Which date night feels most like us?',
        options: ['Talking and laughing together', 'Being apart', 'Only going out', 'Skipping plans'],
        answer: 'Talking and laughing together',
    },
    {
        question: 'What vibe matches our bond best?',
        options: ['Steady, warm, and goofy', 'Cold and distant', 'Always rushed', 'Quietly bored'],
        answer: 'Steady, warm, and goofy',
    },
    {
        question: 'What makes our relationship strong?',
        options: ['Trust and patience', 'Winning arguments', 'Keeping secrets', 'Never talking'],
        answer: 'Trust and patience',
    },
];

let triviaState = {
    currentIndex: 0,
    score: 0,
};

function startTrivia() {
    triviaState = { currentIndex: 0, score: 0 };

    const scoreEl = document.getElementById('triScore');
    const qNumEl = document.getElementById('triQNum');
    const totalEl = document.getElementById('triQTotal');
    const winEl = document.getElementById('triWin');
    const progressEl = document.getElementById('triProgress');
    const body = document.getElementById('triviaBody');

    if (scoreEl) scoreEl.textContent = '0';
    if (qNumEl) qNumEl.textContent = '1';
    if (totalEl) totalEl.textContent = String(triviaSet.length);
    if (winEl) {
        const copy = winEl.querySelector('.win-copy');
        if (copy) copy.textContent = '';
        winEl.classList.remove('show');
    }
    if (progressEl) progressEl.style.width = '0%';
    if (body) renderTriviaQuestion();
}

function renderTriviaQuestion() {
    const body = document.getElementById('triviaBody');
    const qNumEl = document.getElementById('triQNum');
    const scoreEl = document.getElementById('triScore');
    const progressEl = document.getElementById('triProgress');
    const winEl = document.getElementById('triWin');

    if (!body) return;

    if (triviaState.currentIndex >= triviaSet.length) {
        const percent = (triviaState.score / triviaSet.length) * 100;
        if (progressEl) progressEl.style.width = `${percent}%`;
        if (winEl) {
            const message = `You scored ${triviaState.score} / ${triviaSet.length}! ${triviaState.score === triviaSet.length ? 'Perfect match!' : 'Almost too perfect.'}`;
            setWinMessage(winEl, 'Being close to you always makes me feel safe and happy. Even the simplest moments become special when I’m with you. I’ll always treasure the memories we make together. Here’s to more adventures, more laughs, and more love with you. ❤️');
        }
        body.innerHTML = '';
        return;
    }

    if (qNumEl) qNumEl.textContent = String(triviaState.currentIndex + 1);
    if (scoreEl) scoreEl.textContent = String(triviaState.score);
    const progress = (triviaState.currentIndex / triviaSet.length) * 100;
    if (progressEl) progressEl.style.width = `${progress}%`;

    const question = triviaSet[triviaState.currentIndex];
    body.innerHTML = `
    <div class="trivia-q">${question.question}</div>
    <div class="trivia-opts">
      ${question.options
            .map(
                (option) => `<button type="button" class="opt-btn" data-answer="${option}">${option}</button>`,
            )
            .join('')}
    </div>
  `;

    body.querySelectorAll('.opt-btn').forEach((button) => {
        button.addEventListener('click', () => handleTriviaAnswer(button, question.answer));
    });
}

function handleTriviaAnswer(button, correctAnswer) {
    const buttons = button.parentElement.querySelectorAll('.opt-btn');
    const selected = button.dataset.answer;
    const isCorrect = selected === correctAnswer;

    buttons.forEach((btn) => {
        btn.disabled = true;
        if (btn.dataset.answer === correctAnswer) btn.classList.add('correct');
        if (btn.dataset.answer === selected && !isCorrect) btn.classList.add('wrong');
    });

    if (isCorrect) {
        triviaState.score += 1;
        const scoreEl = document.getElementById('triScore');
        if (scoreEl) scoreEl.textContent = String(triviaState.score);
    }

    setTimeout(() => {
        triviaState.currentIndex += 1;
        renderTriviaQuestion();
    }, 850);
}

const wordPuzzleSet = [
    { word: 'LOVE', hint: 'The feeling that keeps us close' },
    { word: 'CHERISH', hint: 'What we do with every small moment' },
    { word: 'TOGETHER', hint: 'The word that defines us' },
    { word: 'SMILE', hint: 'A sign of happiness in your presence' },
    { word: 'FOREVER', hint: 'A promise we carry with our hearts' },
    { word: 'BLOSSOM', hint: 'What our love keeps doing' },
];

let puzzleState = {
    currentIndex: 0,
    score: 0,
};

function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const scrambled = letters.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
}

function startPuzzle() {
    puzzleState = { currentIndex: 0, score: 0 };

    const totalEl = document.getElementById('wpTotal');
    const numEl = document.getElementById('wpNum');
    const scoreEl = document.getElementById('wpScore');
    const winEl = document.getElementById('wpWin');
    const inputEl = document.getElementById('wpInput');
    const feedbackEl = document.getElementById('wpFeedback');

    if (totalEl) totalEl.textContent = String(wordPuzzleSet.length);
    if (numEl) numEl.textContent = '1';
    if (scoreEl) scoreEl.textContent = '0';
    if (winEl) winEl.classList.remove('show');
    if (inputEl) inputEl.value = '';
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }

    renderPuzzle();
}

function renderPuzzle() {
    const puzzle = wordPuzzleSet[puzzleState.currentIndex];
    const numEl = document.getElementById('wpNum');
    const scoreEl = document.getElementById('wpScore');
    const hintEl = document.getElementById('wpHint');
    const scrambleEl = document.getElementById('wpScramble');
    const inputEl = document.getElementById('wpInput');
    const feedbackEl = document.getElementById('wpFeedback');
    const winEl = document.getElementById('wpWin');

    if (!puzzle) {
        if (winEl) {
            setWinMessage(winEl, 'Sometimes, happiness is just being beside the person who makes you smile. It’s the little teasing, the quiet moments, and the way we naturally enjoy each other’s company. These simple moments mean more than words can say. I’m grateful for every memory we continue to create together. 🥰❤️');
        }
        return;
    }

    if (numEl) numEl.textContent = String(puzzleState.currentIndex + 1);
    if (scoreEl) scoreEl.textContent = String(puzzleState.score);
    if (hintEl) hintEl.textContent = `Hint: ${puzzle.hint}`;
    if (scrambleEl) scrambleEl.textContent = scrambleWord(puzzle.word);
    if (inputEl) inputEl.value = '';
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }
    if (winEl) winEl.classList.remove('show');
}

function checkPuzzle() {
    const current = wordPuzzleSet[puzzleState.currentIndex];
    const inputEl = document.getElementById('wpInput');
    const feedbackEl = document.getElementById('wpFeedback');
    const scoreEl = document.getElementById('wpScore');
    const winEl = document.getElementById('wpWin');

    if (!current || !inputEl) return;

    const guess = inputEl.value.trim();

    if (!guess) {
        if (feedbackEl) {
            feedbackEl.textContent = 'Type an answer first.';
            feedbackEl.className = 'feedback bad';
        }
        return;
    }

    if (guess.toLowerCase() === current.word.toLowerCase()) {
        puzzleState.score += 1;
        if (scoreEl) scoreEl.textContent = String(puzzleState.score);
        if (feedbackEl) {
            feedbackEl.textContent = 'Correct!';
            feedbackEl.className = 'feedback good';
        }

        if (puzzleState.currentIndex === wordPuzzleSet.length - 1) {
            if (winEl) {
                setWinMessage(winEl, 'Sometimes, happiness is just being beside the person who makes you smile. It’s the little teasing, the quiet moments, and the way we naturally enjoy each other’s company. These simple moments mean more than words can say. I’m grateful for every memory we continue to create together. 🥰❤️');
            }
            return;
        }

        setTimeout(() => {
            puzzleState.currentIndex += 1;
            renderPuzzle();
        }, 700);
        return;
    }

    if (feedbackEl) {
        feedbackEl.textContent = 'Not quite — try again.';
        feedbackEl.className = 'feedback bad';
    }
}

let huntState = {
    found: 0,
    seconds: 0,
    timer: null,
};

function startHunt() {
    const field = document.getElementById('huntField');
    const foundEl = document.getElementById('huntFound');
    const timeEl = document.getElementById('huntTime');
    const winEl = document.getElementById('huntWin');

    if (huntState.timer) clearInterval(huntState.timer);

    huntState = { found: 0, seconds: 0, timer: null };

    if (foundEl) foundEl.textContent = '0';
    if (timeEl) timeEl.textContent = '0s';
    if (winEl) winEl.classList.remove('show');

    if (!field) return;
    field.innerHTML = '';

    const totalHearts = 10;

    for (let i = 0; i < totalHearts; i += 1) {
        const heart = document.createElement('button');
        heart.type = 'button';
        heart.className = 'hidden-heart';
        heart.textContent = '❤';
        heart.setAttribute('aria-label', 'Hidden heart');

        const left = 8 + Math.random() * 76;
        const top = 10 + Math.random() * 68;
        heart.style.left = `${left}%`;
        heart.style.top = `${top}%`;

        heart.addEventListener('click', () => {
            if (heart.classList.contains('found')) return;
            heart.classList.add('found');
            huntState.found += 1;

            if (foundEl) foundEl.textContent = String(huntState.found);

            if (huntState.found >= totalHearts) {
                if (huntState.timer) clearInterval(huntState.timer);
                setWinMessage(winEl, 'Some moments are simply unforgettable. Being close to you makes every little adventure feel more meaningful. I love how we can turn even the simplest moments into beautiful memories. Here’s to more places, more laughter, and more moments together. ❤️');
            }
        });

        field.appendChild(heart);
    }

    huntState.timer = setInterval(() => {
        huntState.seconds += 1;
        if (timeEl) timeEl.textContent = `${huntState.seconds}s`;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    updateDayCount();
    showPanel('home');
    startMemory();
    startTrivia();
    startPuzzle();
    startHunt();

    const input = document.getElementById('wpInput');
    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                checkPuzzle();
            }
        });
    }
});
