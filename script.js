let commands = [];
let currentIndex = 0;
let currentCommand = null;
let nextCommand = null;
let previousCommand = null;
let currentInput = '';
let score = 0;
let startTime;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let isPlaying = false;
let timeUpdateInterval;

const previousCommandDisplay = document.getElementById('previous-command-display');
const previousOutputDisplay = document.getElementById('previous-output-display');
const wordDisplay = document.getElementById('word-display');
const nextWordDisplay = document.getElementById('next-word-display');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const finalTime = document.getElementById('final-time');

async function loadCommands() {
    try {
        const response = await fetch('commands.csv');
        const text = await response.text();
        const lines = text.split('\n');
        
        commands = lines.slice(1).map(line => {
            const [command, output] = line.split(',');
            return { command, output };
        }).filter(cmd => cmd.command && cmd.command.trim() !== '');
    } catch (error) {
        console.error('Error loading commands:', error);
        commands = [
            { command: 'echo hello', output: 'hello' },
            { command: 'ls', output: 'file1.txt file2.txt' }
        ];
    }
}

function getNextCommand() {
    if (currentIndex >= commands.length) {
        return null;
    }
    return commands[currentIndex++];
}

function showCommands() {
    currentIndex = 0;
    currentCommand = getNextCommand();
    nextCommand = getNextCommand();
    previousCommand = null;
    updateCommandDisplay();
    nextWordDisplay.textContent = nextCommand ? nextCommand.command : '';
    previousCommandDisplay.textContent = '';
    previousOutputDisplay.textContent = '';
    currentInput = '';
}

function updateCommandDisplay() {
    let displayHTML = '';
    for (let i = 0; i < currentCommand.command.length; i++) {
        if (i < currentInput.length) {
            const char = currentCommand.command[i];
            const inputChar = currentInput[i];
            if (char === inputChar) {
                displayHTML += `<span class="correct">${char}</span>`;
            } else {
                displayHTML += `<span class="incorrect">${char}</span>`;
            }
        } else if (i === currentInput.length) {
            displayHTML += `<span class="current">${currentCommand.command[i]}</span>`;
        } else {
            displayHTML += currentCommand.command[i];
        }
    }
    wordDisplay.innerHTML = displayHTML;
}

function handleKeyPress(e) {
    if (!isPlaying) return;

    if (e.key === 'Escape') {
        endGame();
        return;
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        skipCommand();
        return;
    }

    const key = e.key;
    if (key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        totalKeystrokes++;
    } else if (key === 'Enter') {
        if (currentInput === currentCommand.command) {
            score++;
        }
        previousCommandDisplay.textContent = currentCommand.command;
        previousOutputDisplay.textContent = currentCommand.output;
        previousCommand = currentCommand;
        currentCommand = nextCommand;
        nextCommand = getNextCommand();
        
        if (!currentCommand) {
            endGame();
            return;
        }
        
        nextWordDisplay.textContent = nextCommand ? nextCommand.command : '';
        currentInput = '';
        updateCommandDisplay();
    } else if (key.length === 1) {
        if (currentInput.length < currentCommand.command.length) {
            currentInput += key;
            totalKeystrokes++;
            if (key === currentCommand.command[currentInput.length - 1]) {
                correctKeystrokes++;
            }
        }
    }

    updateCommandDisplay();
    updateStats();
}

function skipCommand() {
    previousCommandDisplay.textContent = currentCommand.command;
    previousOutputDisplay.textContent = currentCommand.output;
    previousCommand = currentCommand;
    currentCommand = nextCommand;
    nextCommand = getNextCommand();
    
    if (!currentCommand) {
        endGame();
        return;
    }
    
    nextWordDisplay.textContent = nextCommand ? nextCommand.command : '';
    currentInput = '';
    updateCommandDisplay();
}

function updateStats() {
    const elapsedTime = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wpm = Math.round((correctKeystrokes / 5) / elapsedTime);
    const accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
    
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = `${accuracy}%`;
}

function updateTime() {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startGame() {
    if (!isPlaying) {
        isPlaying = true;
        score = 0;
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        startTime = Date.now();
        
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100%';
        timeDisplay.textContent = '0:00';
        startScreen.style.display = 'none';

        // 経過時間を更新する間隔を設定
        timeUpdateInterval = setInterval(updateTime, 1000);
    }
}

function endGame() {
    isPlaying = false;
    clearInterval(timeUpdateInterval);
    
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    finalWpm.textContent = wpmDisplay.textContent;
    finalAccuracy.textContent = accuracyDisplay.textContent;
    finalTime.textContent = timeStr;
    resultScreen.style.display = 'flex';
}

function resetGame() {
    score = 0;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    timeDisplay.textContent = '0:00';
    showCommands();
}

async function init() {
    await loadCommands();
    showCommands();
    startScreen.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    
    resultScreen.addEventListener('click', () => {
        resultScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        resetGame();
    });
}

init(); 