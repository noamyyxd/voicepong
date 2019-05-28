class Controller {
	constructor() {
		this.isUp = false;
		this.isDown = false;
		this.enableController = false;
		this.avgHz = undefined;
	}

	initiate() {
		startVoice();
        setInterval (()=> {
            if (this.getInput() === 1) {
                this.isUp = true;
                this.isDown = false;
            } else if (this.getInput() === -1) {
                this.isUp = false;
                this.isDown = true;
            } else {
                this.isUp = false;
                this.isDown = false;
            }
        }, 1);
    }
    
	getInput() {
		if (this.enableController) {

			// Add whatever logic of the input here and put the input in the if condition.
			// return 1 if the bat should go up (high pitch) and -1 if the bar should go down (low pitch)
			if (this.input() > this.avgHz) {
				return 1;
			} else if (this.input() < this.avgHz) {
				return -1;
			} else {
				return 0;
			}
		}
	}

	tune(time) {
		togglePlayback();
		togglePlayback();
		startVoice();
		// Show sentence
		setTimeout(() => {
			stopVoice();
			this.avgHz = median;	
		}, time);		
    }

	enable() {
		this.enableController = true;
	}

	disable() {
		this.enableController = false;
	}

	input() {
		return pitchArray[pitchArray.length - 1];
	}
}