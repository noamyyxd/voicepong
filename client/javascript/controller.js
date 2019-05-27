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
        toggleLiveInput();
        this.avgHz = median;
    }

    enable() {
        this.enable = true;
    }

    disable() {
        this.enable = false;
    }

    input() {
        toggleLiveInput();
        return pitchElem.innerText;
    }
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var median = null;
var pitchArray = [];
var detectorElem, pitchElem;

window.onload = function () {
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000));	// corresponds to a 5kHz signal
	var request = new XMLHttpRequest();
	request.open("GET", "https://raw.githubusercontent.com/ytung/YaleHack/master/docs/whistling3.ogg", true);
	request.responseType = "arraybuffer";
	request.onload = function () {
		audioContext.decodeAudioData(request.response, function (buffer) {
			theBuffer = buffer;
		});
	}
	request.send();

	detectorElem = document.getElementById("detector");
	pitchElem = document.getElementById("pitch");


	detectorElem.ondragenter = function () {
		this.classList.add("droptarget");
		return false;
	};
	detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
	detectorElem.ondrop = function (e) {
		this.classList.remove("droptarget");
		e.preventDefault();
		theBuffer = null;

		var reader = new FileReader();
		reader.onload = function (event) {
			audioContext.decodeAudioData(event.target.result, function (buffer) {
				theBuffer = buffer;
			}, function () { alert("error loading!"); });

		};
		reader.onerror = function (event) {
			alert("Error: " + reader.error);
		};
		reader.readAsArrayBuffer(e.dataTransfer.files[0]);
		return false;
	};
}

function error() {
	alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
	try {
		navigator.getUserMedia =
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		navigator.getUserMedia(dictionary, callback, error);
	} catch (e) {
		alert('getUserMedia threw exception :' + e);
	}
}

function gotStream(stream) {
	// Create an AudioNode from the stream.
	mediaStreamSource = audioContext.createMediaStreamSource(stream);

	// Connect it to the destination.
	analyser = audioContext.createAnalyser();
	analyser.fftSize = 2048;
	mediaStreamSource.connect(analyser);
	updatePitch();
}

function calcMedian(arr) {
	const mid = Math.floor(arr.length / 2);
	const nums = [...arr].sort((a, b) => a - b);
	return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function toggleLiveInput() {
	if (isPlaying) {
		//stop playing and return
		sourceNode = null;
		analyser = null;
		isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
		window.cancelAnimationFrame(rafID);
		if(median){
			pitchElem.innerText = calcMedian(pitchArray);
		} else {
			median = calcMedian(pitchArray);
			pitchArray = [];
		}
	} else {
		isPlaying = true;
		getUserMedia(
			{
				"audio": {
					"mandatory": {
						"googEchoCancellation": "false",
						"googAutoGainControl": "false",
						"googNoiseSuppression": "false",
						"googHighpassFilter": "false"
					},
					"optional": []
				},
			}, gotStream);
	}
}

var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array(buflen);

var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

function autoCorrelate(buf, sampleRate) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE / 2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i = 0; i < SIZE; i++) {
		var val = buf[i];
		rms += val * val;
	}
	rms = Math.sqrt(rms / SIZE);
	if (rms < 0.01) // not enough signal
		return -1;

	var lastCorrelation = 1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i = 0; i < MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i]) - (buf[i + offset]));
		}
		correlation = 1 - (correlation / MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation > GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
			return sampleRate / (best_offset + (8 * shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		return sampleRate / best_offset;
	}
	return -1;
}

function updatePitch(time) {
	var cycles = new Array;
	analyser.getFloatTimeDomainData(buf);
	var ac = autoCorrelate(buf, audioContext.sampleRate);

	if (ac === -1) {
        pitchElem.innerText = "";
    } else {
		pitch = ac;
		pitchElem.innerText = Math.round(pitch);
		pitchArray.push(pitchElem.innerText);
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame(updatePitch);
}



