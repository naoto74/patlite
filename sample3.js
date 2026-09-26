
/**
 * @param {number} start 
 * @param {number} end 
 * @param {number} k 
 * @param {number} t 
 * @returns {number}
 */
const exponentialFrequency = (start, end, k, t) => end + (start - end) * Math.exp(-k * t);
const audio = new AudioContext();
/** @type {AudioWorkletNode | null} */
let node;


let mode = "down";
let startTime = performance.now();
let currentFrequency = 170;
let f = currentFrequency;

function update() {
	if(!node) return;
    const t = (performance.now() - startTime) / 1000;

    if (mode === "up") {
        f = exponentialFrequency(
            currentFrequency,
            850,
            2.5,
            t
        );
    }else if(mode == "down"){
        f = exponentialFrequency(
            currentFrequency,
            170,
            0.24,
            t
        );
    }else if(mode == "off"){
        f = exponentialFrequency(
            currentFrequency,
            100,
            0.24,
            t
        );
    }else if(mode == "sec4"){
		if(t < 2){
			f = exponentialFrequency(
				currentFrequency,
				850,
				5,
				t
			);
		}else{
			mode = "sec4down";
			currentFrequency = f;
			startTime = performance.now();
		}
	}else if(mode == "sec4down"){
		if(t < 2){
			f = exponentialFrequency(
				currentFrequency,
				170,
				0.47,
				t
			);
		}else{
			currentFrequency = f;
			mode = "sec4";
			startTime = performance.now();
		}
	}else if(mode == "sec8"){
		if(t < 4.5){
			f = exponentialFrequency(
				currentFrequency,
				850,
				2.5,
				t
			);
		}else{
			mode = "sec8down";
			currentFrequency = f;
			startTime = performance.now();
		}
	}else if(mode == "sec8down"){
		if(t < 3.5){
			f = exponentialFrequency(
				currentFrequency,
				170,
				0.24,
				t
			);
		}else{
			currentFrequency = f;
			mode = "sec8";
			startTime = performance.now();
		}
	}
	node.port.postMessage({
		f0: f
	});
    requestAnimationFrame(update);
}

const powerButton = document.getElementById("power");
const sec4Button = document.getElementById("sec4btn");
const sec8Button = document.getElementById("sec8btn");
const upButton = document.getElementById("up");
const downButton = document.getElementById("down");

const status = document.getElementById("status");


// ---------------------------------------------------------
// 電源
// ---------------------------------------------------------

let powerOn = false;

powerButton.onclick = async () => {

    powerOn = !powerOn;

    powerButton.classList.toggle("active", powerOn);
    powerButton.setAttribute("aria-pressed", powerOn);

    if (powerOn) {

        // 初回だけAudioWorkletを読み込む
        if (!node) {
            await audio.audioWorklet.addModule("siren-processor.js?v=6");

            node = new AudioWorkletNode(
                audio,
                "siren-processor"
            );

            node.connect(audio.destination);
        }

        await audio.resume();

        status.classList.add("active");

        updateStatus();

        requestAnimationFrame(update);

    } else {

        // 音を止める
        mode = "off";

        status.textContent = "電源 OFF";
        status.classList.remove("active");

        clearModes();
    }
};


// ---------------------------------------------------------
// モードを全部OFF
// ---------------------------------------------------------

function clearModes() {

    document
        .querySelectorAll(".mode-button, .manual-button")
        .forEach(button => {

            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");

        });
}


// ---------------------------------------------------------
// 自動4秒
// ---------------------------------------------------------

sec4Button.onclick = () => {

    if (!powerOn)
        return;

    selectMode(sec4Button);

    currentFrequency = f;

    mode = "sec4";

    startTime = performance.now();

    updateStatus();
};


// ---------------------------------------------------------
// 自動8秒
// ---------------------------------------------------------

sec8Button.onclick = () => {

    if (!powerOn)
        return;

    selectMode(sec8Button);

    currentFrequency = f;

    mode = "sec8";

    startTime = performance.now();

    updateStatus();
};


// ---------------------------------------------------------
// 手動 上げ
// ---------------------------------------------------------

upButton.onclick = () => {

    if (!powerOn)
        return;

    selectMode(upButton);

    currentFrequency = f;

    mode = "up";

    startTime = performance.now();

    updateStatus();
};


// ---------------------------------------------------------
// 手動 下げ
// ---------------------------------------------------------

downButton.onclick = () => {

    if (!powerOn)
        return;

    selectMode(downButton);

    currentFrequency = f;

    mode = "down";

    startTime = performance.now();

    updateStatus();
};


// ---------------------------------------------------------
// モード選択
// ---------------------------------------------------------

function selectMode(button) {

    // 4秒/8秒/上げ/下げを全部OFF
    clearModes();

    // 選択されたものだけON
    button.classList.add("active");

    button.setAttribute(
        "aria-pressed",
        "true"
    );
}


// ---------------------------------------------------------
// 状態表示
// ---------------------------------------------------------

function updateStatus() {

    if (!powerOn) {
        status.textContent = "電源 OFF";
        return;
    }

    switch (mode) {

        case "sec4":
            status.textContent = "自動　4秒";
            break;

        case "sec8":
            status.textContent = "自動　8秒";
            break;

        case "up":
            status.textContent = "手動　上げ";
            break;

        case "down":
            status.textContent = "手動　下げ";
            break;

        default:
            status.textContent = "モード未選択";
            break;
    }
}