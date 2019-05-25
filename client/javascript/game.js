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
var playerSpeedScale = 0.6;
var playerSpeed;
var timeOut = 10;
var playerStrength = 0;
//var controller = new Controller();
var startGame = false;

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
    this.load.image('disk', 'public/images/realdisk.png');
    this.load.image('bat', 'public/images/bat.png');
    this.load.image('border', 'public/images/border.png');
}

function create() {

    // Set field
    field = this.add.image(0, 0, 'field').setOrigin(0, 0);

    // Set Borders
    borders = this.physics.add.staticGroup();
    borders.create(0, 0, 'border').setOrigin(0, 0).refreshBody();
    borders.create(window.innerWidth, window.innerHeight, 'border').setOrigin(1, 1).refreshBody();

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

    // Set controller
    // controller.initiate();

    cursorOne = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
    });

    var self = this;
    this.socket = io();

    this.socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id)=> {
            if (players[id].playerId === self.socket.id) {
                if (players[id].playerNumber === 0) {
                    playerStrength = 500;
                    playerPositionScale = 0.05;
                    enemyPositionScale = 0.95;
                    lastHitTemp = 1; 
                } else {
                    playerStrength = -500;
                    playerPositionScale = 0.95;
                    enemyPositionScale = 0.05;
                    lastHitTemp = -1; 
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
                    self.socket.emit('hit', { velocity: { x: (disk.body.velocity.x / window.innerWidth), y: (disk.body.velocity.y / window.innerHeight) },
                                              position: { x: (disk.body.position.x / window.innerWidth), y: (disk.body.position.y / window.innerHeight) }});
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
    });

    this.socket.on('startGame', () => {
        console.log("started game");
        diskSpeed = window.innerWidth * diskSpeedScale;
        disk.setVelocityX(lastHit * diskSpeed);
        // controller.enable();
        startGame = true;
    })

    this.socket.emit('ready', true);
}

function update() { 
    if (startGame) {
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
    }

    if (isDiskOut()) {
        nextTurn();
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

const nextTurn = () => {
    disk.setPosition((window.innerWidth / 2), (window.innerHeight / 2));
    disk.setVelocity(0);
    // controller.disable();

    if (lastHit == 1) {
        player.score++;
        playerScore.setText(player.score);
    } else {
        enemy.score++;
        enemyScore.setText(enemy.score);
    }

    setTimeout(() => {
        disk.setVelocity((diskSpeed * lastHit), 0); 
    }, 1000);
}

const didResolutionChange = () => {
    return (lastWorldWidth != window.innerWidth) || (lastWorldHeight != window.innerHeight);
};