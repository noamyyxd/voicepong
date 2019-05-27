var worldWidth = window.screen.width;
var worldHeight = window.screen.height;
var lastWorldWidth;
var lastWorldHeight;
var field;
var disk;
var borders;
var scaleWidth;
var scaleHeight;
var player;
var enemy;
var playerPositionScale = 0;
var enemyPositionScale = 0;
var cursorOne;
var cursorTwo;
var diskSpeedScale = 0.6;
var diskSpeed;
var lastHit = -1;
var isPrimary = false;
var playerSpeedScale = 0.6;
var playerSpeed;
var timeOut = 10;
var playerStrength = 0;
var key;
var goodInput = false;
var goodEnemyInput = false;
//var controller = new Controller();
var isGamePaused = true;
var gameOver = false;
var letters = [
    { letter: 'א', enable: true, code: 116 },
    { letter: 'ב', enable: true, code: 99 },
    { letter: 'ג', enable: true, code: 100 },
    { letter: 'ד', enable: true, code: 115 },
    { letter: 'ה', enable: true, code: 118 },
    { letter: 'ו', enable: true, code: 117 },
    { letter: 'ז', enable: true, code: 122 },
    { letter: 'ח', enable: true, code: 106 },
    { letter: 'ט', enable: true, code: 121 },
    { letter: 'י', enable: true, code: 104 },
    { letter: 'כ', enable: true, code: 102 },
    { letter: 'ל', enable: true, code: 107 },
    { letter: 'מ', enable: true, code: 110 },
    { letter: 'נ', enable: true, code: 98 },
    { letter: 'ס', enable: true, code: 120 },
    { letter: 'ע', enable: true, code: 103 },
    { letter: 'פ', enable: true, code: 112 },
    { letter: 'צ', enable: true, code: 109 },
    { letter: 'ק', enable: true, code: 101 },
    { letter: 'ר', enable: true, code: 114 },
    { letter: 'ש', enable: true, code: 97 },
    { letter: 'ת', enable: true, code: 44 }
];

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var two_line = /\n\n/g;
var one_line = /\n/g;
var first_char = /\S/;
var textSong = '';
var textInteriorSong = '';
var enableSing = false;
var recognition = new webkitSpeechRecognition();

var config = {
    type: Phaser.AUTO,
    width: worldWidth,
    height: worldHeight,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('field', 'public/images/field.png');
    this.load.image('disk', 'public/images/disk.png');
    this.load.image('bat', 'public/images/bat.png');
    this.load.image('border', 'public/images/border.png');
    this.load.image('disabledKey', 'public/images/disabledKey.png');
    this.load.image('enabledKey', 'public/images/enabledKey.png');
}

function create() {

    // Set field
    field = this.add.image(0, 0, 'field').setOrigin(0, 0);

    // Set Borders
    borders = this.physics.add.staticGroup();
    borders.create(0, 0, 'border').setOrigin(0, 0).refreshBody();
    borders.create(window.innerWidth, window.innerHeight, 'border').setOrigin(1, 1).refreshBody();

    // Set letters
    count = 0;
    amountOfLetters = letters.length;
    lettersHeight = 5;
    lettersWidth = 5;
    for (y = 1; y <= lettersHeight; y++) {
        for (x = 1; x <= lettersWidth; x++) {
            letters[count].key = this.physics.add.sprite((field.displayWidth / (lettersWidth + 1)) * x, (field.displayHeight / (lettersHeight + 1)) * y, 'enabledKey');
            letters[count].text = this.add.text(letters[count].key.x, letters[count].key.y, letters[count].letter,
                { fontSize: `${((field.displayWidth + field.displayHeight) / 2) * 0.05}px`, fill: '#000' }).setOrigin(0.5, 0.5);
            letters[count].key.visible = false;
            letters[count].text.visible = false;
            count++;
            amountOfLetters--;
        }

        if (amountOfLetters < lettersWidth) {
            lettersWidth = amountOfLetters;
        }
    }

    // Set the disk
    disk = this.physics.add.sprite(0, 0, 'disk');
    disk.setPosition((field.displayWidth / 2), (field.displayHeight / 2));
    disk.body.setBounce(1);
    disk.setVelocityX(0);
    this.physics.add.collider(disk, borders);

    // Set first player
    player = this.physics.add.sprite(field.displayWidth * playerPositionScale, (field.displayHeight / 2), 'bat');
    this.physics.add.collider(player, borders);
    player.body.enable = false;
    player.visible = false;
    player.score = 0;
    playerScore = this.add.text(window.innerWidth * 0.28, window.innerHeight * 0.1, player.score,
        { fontSize: `${((window.innerWidth + window.innerHeight) / 2) * 0.1}px`, fill: '#000' });
    playerScore.alpha = 0.6;

    // Set second player
    enemy = this.physics.add.sprite(field.displayWidth * enemyPositionScale, (field.displayHeight / 2), 'bat');
    this.physics.add.collider(enemy, borders);
    enemy.body.enable = false;
    enemy.visible = false;
    enemy.score = 0;
    enemyScore = this.add.text(window.innerWidth * 0.5, window.innerHeight * 0.1, enemy.score,
        { fontSize: `${((window.innerWidth + window.innerHeight) / 2) * 0.1}px`, fill: '#000' });
    enemyScore.alpha = 0.6;

    winnerText = this.add.text(window.innerWidth * 0.5, window.innerHeight * 0.1, 'You Won!!!',
        { fontSize: `${((window.innerWidth + window.innerHeight) / 2) * 0.5}px`, fill: '#000' }).setOrigin(0.5, 0.5);
    winnerText.visible = false;
    loserText = this.add.text(window.innerWidth * 0.5, window.innerHeight * 0.1, 'Take The L!',
        { fontSize: `${((window.innerWidth + window.innerHeight) / 2) * 0.5}px`, fill: '#000' }).setOrigin(0.5, 0.5);
    loserText.visible = false;

    // Set controller
    // controller.initiate();

    cursorOne = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.UP,
        'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
    });

    document.addEventListener("keypress", (event) => {
        key = event.keyCode;
    });

    // set speech to text
    initSpeechTotext();

    var self = this;
    this.socket = io();

    this.socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === self.socket.id) {
                if (players[id].playerNumber === 0) {
                    playerStrength = 500;
                    playerPositionScale = 0.05;
                    enemyPositionScale = 0.95;
                    lastHitTemp = 1;
                    isPrimary = true;
                } else {
                    playerStrength = -500;
                    playerPositionScale = 0.95;
                    enemyPositionScale = 0.05;
                    lastHitTemp = -1;
                    isPrimary = false;
                }
                player.setPosition(window.innerWidth * playerPositionScale, (window.innerHeight / 2));
                enemy.setPosition(window.innerWidth * enemyPositionScale, (window.innerHeight / 2));
                player.body.enable = true;
                player.visible = true;
                this.physics.add.collider(player, disk, () => {
                    player.setVelocityX(0);
                    disk.setVelocityX(lastHitTemp * diskSpeed);
                    disk.setVelocityY(disk.body.velocity.y + player.body.velocity.y);
                    player.x = window.innerWidth * playerPositionScale;
                    lastHit = lastHitTemp;
                    self.socket.emit('hit', {
                        velocity: { x: (disk.body.velocity.x / window.innerWidth), y: (disk.body.velocity.y / window.innerHeight) },
                        position: { x: (disk.body.position.x / window.innerWidth), y: (disk.body.position.y / window.innerHeight) }
                    });
                    isPrimary = true;
                });
            } else {
                enemy.body.enable = true;
                enemy.visible = true;
            }
        });
    });

    this.socket.on('newPlayer', (playerInfo) => {
        enemy.body.enable = true;
        enemy.visible = true;
    });

    this.socket.on('disconnect', (playerId) => {
        enemy.destroy();
    });

    this.socket.on('playerMoved', (playerInfo) => {
        enemy.setVelocityY(playerInfo.y * playerSpeed);
    });

    this.socket.on('playerStopped', (playerInfo) => {
        enemy.setVelocityY(0);
    });

    this.socket.on('playerHit', (diskInfo) => {
        disk.setVelocity(diskInfo.velocity.x * window.innerWidth, diskInfo.velocity.y * window.innerHeight);
        disk.setPosition(diskInfo.position.x * window.innerWidth, diskInfo.position.y * window.innerHeight);
        lastHit = -lastHit;
        isPrimary = false;
    });

    this.socket.on('startGame', () => {
        console.log("started game");
        disk.setPosition((field.displayWidth * 2), (field.displayHeight * 2));
    });

    this.socket.on('keyChosen', (key) => {
        console.log(key);
        isPrimary = false;
        goodEnemyInput = true;
        letters.forEach((letter) => {
            if (letter.code === key) {
                letter.key.setTexture('disabledKey');
                letter.enable = false;
            }
        });
        showChosenKey(key);
    });

    this.socket.emit('ready', true);
}

function initSpeechTotext() {
    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function () {
            recognizing = true;
        };

        recognition.onerror = function (event) {
            if (event.error == 'no-speech') {
                ignore_onend = true;
            }
            if (event.error == 'audio-capture') {
                ignore_onend = true;
            }
            if (event.error == 'not-allowed') {
                ignore_onend = true;
            }
        };

        recognition.onend = function () {
            recognizing = false;
            if (ignore_onend) {
                return;
            }
            if (!final_transcript) {
                return;
            }
            // if (window.getSelection) {
            //     window.getSelection().removeAllRanges();
            //     var range = document.createRange();
            //     range.selectNode(document.getElementById('final_span'));
            //     window.getSelection().addRange(range);
            // }
        };

        recognition.onresult = function (event) {
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            final_transcript = capitalize(final_transcript);
            textSong = linebreak(final_transcript);
            textInteriorSong = linebreak(interim_transcript);
            if (final_transcript || interim_transcript) {
                // TODO
            }
        };
    }

}

function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}


function capitalize(s) {
    return s.replace(first_char, function (m) { return m.toUpperCase(); });
}

function update() {
    if (gameOver) {
        if (player.score > enemy.score) {
            winnerText.setPosition(winnerText.x * scaleWidth, winnerText.y * scaleHeight);
            winnerText.setFontSize(`${((window.innerWidth + window.innerHeight) / 2) * 0.5}px`);
            winnerText.visible = true;
        } else {
            loserText.setPosition(loserText.x * scaleWidth, loserText.y * scaleHeight);
            loserText.setFontSize(`${((window.innerWidth + window.innerHeight) / 2) * 0.5}px`);
            loserText.visible = true;
        }
    } else {

        if (!isGamePaused) {
            playerSpeed = window.innerHeight * playerSpeedScale;
            diskSpeed = window.innerWidth * diskSpeedScale;
            checkPlayersMovement(this, player, cursorOne);
        }

        // Check if screen resolution changed, and if it did fit 
        // all the objects in the game to the new screen size
        if (didResolutionChange()) {
            lastWorldWidth = window.innerWidth;
            lastWorldHeight = window.innerHeight;
            scaleWidth = window.innerWidth / field.displayWidth;
            scaleHeight = window.innerHeight / field.displayHeight;
            field.displayWidth *= scaleWidth;
            field.displayHeight *= scaleHeight;

            // Fix disk ratio
            disk.displayWidth *= scaleHeight;
            disk.displayHeight *= scaleHeight;
            disk.setPosition(disk.x * scaleWidth, disk.y * scaleHeight);
            disk.setVelocity(disk.body.velocity.x * scaleWidth, disk.body.velocity.y * scaleHeight)

            // Fix player's ratio
            player.displayWidth *= scaleWidth;
            player.displayHeight *= scaleHeight;
            player.setPosition(window.innerWidth * playerPositionScale, player.y * scaleHeight);

            // Fix enemy's ratio
            enemy.displayWidth *= scaleWidth;
            enemy.displayHeight *= scaleHeight;
            enemy.setPosition(window.innerWidth * enemyPositionScale, enemy.y * scaleHeight);

            // Fix player's score ratio
            playerScore.displayWidth *= scaleWidth;
            playerScore.displayHeight *= scaleHeight;
            playerScore.setPosition(playerScore.x * scaleWidth, playerScore.y * scaleHeight);
            playerScore.setFontSize(`${((window.innerWidth + window.innerHeight) / 2) * 0.1}px`);

            // Fix enemy's score ratio
            enemyScore.displayWidth *= scaleWidth;
            enemyScore.displayHeight *= scaleHeight;
            enemyScore.setPosition(enemyScore.x * scaleWidth, enemyScore.y * scaleHeight);
            enemyScore.setFontSize(`${((window.innerWidth + window.innerHeight) / 2) * 0.1}px`);

            // Fix second broder position
            borders.children.entries[1].setPosition(window.innerWidth, window.innerHeight);

            // Fix borders ratio
            borders.children.entries.forEach(border => {
                border.displayWidth *= scaleWidth;
                border.displayHeight *= scaleHeight;
                border.refreshBody();
            });

            letters.forEach((letter) => {
                letter.key.displayWidth *= scaleWidth;
                letter.key.displayHeight *= scaleHeight;
                letter.key.setPosition(letter.key.x * scaleWidth, letter.key.y * scaleHeight);
                letter.text.displayWidth *= scaleWidth;
                letter.text.displayHeight *= scaleHeight;
                letter.text.setPosition(letter.key.x, letter.key.y);
                letter.text.setFontSize(`${((window.innerWidth + window.innerHeight) / 2) * 0.05}px`);
            });
        }

        if (isDiskOut()) {
            nextTurn(this);
        }
    }
}

const checkPlayersMovement = (self, player, cursor) => {
    if (cursor.up.isDown) {
        player.setVelocityY(-playerSpeed);
        self.socket.emit('playerMovement', { y: -1 });
    } else if (cursor.down.isDown) {
        player.setVelocityY(playerSpeed);
        self.socket.emit('playerMovement', { y: 1 });
    } else {
        player.setVelocityY(0);
        self.socket.emit('playerStopped');
    }
}

// const checkPlayersMovement = (self, player) => {
//     if (controller.isUp) {
//         player.setVelocityY(-playerSpeed);
//         self.socket.emit('playerMovement', { y: -1 });
//     } else if (controller.isDown) {
//         player.setVelocityY(playerSpeed);
//         self.socket.emit('playerMovement', { y: 1 });
//     } else {
//         player.setVelocityY(0);
//         self.socket.emit('playerStopped');
//     }
// }

const isDiskOut = () => {
    return ((disk.x >= field.displayWidth) || (disk.x <= 0));
}

const nextTurn = (self) => {
    pauseGame();

    if (!isPrimary) {
        chooseLetter(self);
        showKeys();
    }

    if (goodInput || goodEnemyInput) {
        goodInput = false;
        goodEnemyInput = false;
        sing();
        enableSing = true;
        setTimeout(() => {
            enableSing = false;
        }, 10000);
        setTimeout(() => {
            hideKeys();
            updateScore();
            resetGame();
            continueGame();
        }, 2000);
    }

    if ((player.score + enemy.score) === letters.length) {
        gameOver = true;
    }
}

const sing = () => {
    if (recognizing && !enableSing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = 'he';
    recognition.start();
    ignore_onend = false;
    textSong = '';
};

const didResolutionChange = () => {
    return (lastWorldWidth != window.innerWidth) || (lastWorldHeight != window.innerHeight);
};

const chooseLetter = (self) => {
    letters.forEach((letter) => {
        if ((letter.code === key) && letter.enable) {
            goodInput = true;
            isPrimary = true;
            letter.key.setTexture('disabledKey');
            letter.enable = false;
        }
    });

    if (goodInput) {
        console.log('sent key: ' + key)
        self.socket.emit('chooseKey', key);
    }
};

const pauseGame = () => {
    isGamePaused = true;
    // controller.disable();

    disk.setVelocity(0);
    disk.body.enable = false;
    disk.visible = false;

    player.body.enable = false;
    player.visible = false;
    playerScore.visible = false;

    enemy.body.enable = false;
    enemy.visible = false;
    enemyScore.visible = false;

    borders.children.entries.forEach((border) => {
        border.body.enable = false;
        border.visible = false;
    });

    field.aplha = 0.7;
}

const continueGame = () => {
    isGamePaused = false;
    // controller.enable();

    diskSpeed = window.innerWidth * diskSpeedScale;
    disk.setVelocityX(lastHit * diskSpeed);
    disk.body.enable = true;
    disk.visible = true;

    player.body.enable = true;
    player.visible = true;
    playerScore.visible = true;

    enemy.body.enable = true;
    enemy.visible = true;
    enemyScore.visible = true;

    borders.children.entries.forEach((border) => {
        border.body.enable = true;
        border.visible = true;
    });

    field.aplha = 1;
}

const resetGame = () => {
    disk.setPosition((window.innerWidth / 2), (window.innerHeight / 2));
    player.setPosition(window.innerWidth * playerPositionScale, (window.innerHeight / 2));
    enemy.setPosition(window.innerWidth * enemyPositionScale, (window.innerHeight / 2));
}
const updateScore = () => {
    if (lastHit == 1) {
        player.score++;
        playerScore.setText(player.score);
    } else {
        enemy.score++;
        enemyScore.setText(enemy.score);
    }

    lastHit = -lastHit;
}

const showKeys = () => {
    letters.forEach((letter) => {
        letter.key.visible = true;
        letter.text.visible = true;
    });
}

const showChosenKey = (key) => {
    letters.forEach((letter) => {

        if (letter.code === key) {
            letter.key.setTexture('disabledKey');
        } else {
            letter.key.setTexture('enabledKey');
        }

        letter.key.visible = true;
        letter.text.visible = true;
    });
}

const hideKeys = () => {
    // TODO - send text to server
    letters.forEach((letter) => {

        if (letter.enable) {
            letter.key.setTexture('enabledKey');
        } else {
            letter.key.setTexture('disabledKey');
        }

        letter.key.visible = false;
        letter.text.visible = false;
    });
}