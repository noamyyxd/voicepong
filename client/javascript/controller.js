class Controller {
    constructor() {
        this.isUp = false;
        this.isDown = false;
        this.enable = false;
        this.avgHz = undefined;
    }

    initiate() {
        tune();

        while (true) {
            if (getInput() === 1) {
                this.isUp = true;
                this.isDown = false;
            } else if (getInput() === -1) {
                this.isUp = false;
                this.isDown = true;
            } else {
                this.isUp = false;
                this.isDown = false;
            }
        }
    }
    
    getInput() {
        if (this.enable) {

            // Add whatever logic of the input here and put the input in the if condition.
            // return 1 if the bat should go up (high pitch) and -1 if the bar should go down (low pitch)
            if (input() > this.avgHz) {
                return 1;    
            } else if(input() < this.avgHz) {
                return -1;
            } else {
                return 0;
            }
        }
    }

    tune() {
        // Set the average hz of a player
        this.avgHz = null;
    }

    enable() {
        this.enable = true;
    }

    disable() {
        this.enable = false;
    }
}



