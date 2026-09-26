const audio = new AudioContext();

/** @type {AudioWorkletNode | null} */
let node = null;

let powerOn = false;

// ---------------------------------------------------------
// DOM
// ---------------------------------------------------------

const powerButton = document.getElementById("power");
const sec4Button = document.getElementById("sec4btn");
const sec8Button = document.getElementById("sec8btn");
const upButton = document.getElementById("up");
const downButton = document.getElementById("down");

const status = document.getElementById("status");


// ---------------------------------------------------------
// AudioWorklet 初期化
// ---------------------------------------------------------

async function createAudioNode() {

    if (node) {
        return;
    }

    await audio.audioWorklet.addModule(
        "siren-processor.js?v=7"
    );

    node = new AudioWorkletNode(
        audio,
        "siren-processor"
    );

    node.connect(audio.destination);
}


// ---------------------------------------------------------
// Workletへモードを送信
// ---------------------------------------------------------

function setMode(mode) {

    if (!node) {
        return;
    }

    node.port.postMessage({
        type: "mode",
        mode
    });
}


// ---------------------------------------------------------
// 電源
// ---------------------------------------------------------

powerButton.onclick = async () => {

    powerOn = !powerOn;

    powerButton.classList.toggle(
        "active",
        powerOn
    );

    powerButton.setAttribute(
        "aria-pressed",
        powerOn
    );


    // -----------------------------------------------------
    // ON
    // -----------------------------------------------------

    if (powerOn) {

        await createAudioNode();

        await audio.resume();

        status.classList.add("active");

        updateStatus();

        return;
    }


    // -----------------------------------------------------
    // OFF
    // -----------------------------------------------------

    if (node) {

        // Worklet側で100Hzへゆっくり下げる
        setMode("off");
    }

    status.textContent = "電源 OFF";

    status.classList.remove("active");

    clearModes();
};


// ---------------------------------------------------------
// モードを全部OFF
// ---------------------------------------------------------

function clearModes() {

    document
        .querySelectorAll(".mode-button, .manual-button")
        .forEach(button => {

            button.classList.remove("active");

            button.setAttribute(
                "aria-pressed",
                "false"
            );
        });
}


// ---------------------------------------------------------
// モード選択
// ---------------------------------------------------------

function selectMode(button) {

    clearModes();

    button.classList.add("active");

    button.setAttribute(
        "aria-pressed",
        "true"
    );
}


// ---------------------------------------------------------
// 自動4秒
// ---------------------------------------------------------

sec4Button.onclick = () => {

    if (!powerOn) {
        return;
    }

    selectMode(sec4Button);

    setMode("sec4");

    updateStatus();
};


// ---------------------------------------------------------
// 自動8秒
// ---------------------------------------------------------

sec8Button.onclick = () => {

    if (!powerOn) {
        return;
    }

    selectMode(sec8Button);

    setMode("sec8");

    updateStatus();
};


// ---------------------------------------------------------
// 手動 上げ
// ---------------------------------------------------------

upButton.onclick = () => {

    if (!powerOn) {
        return;
    }

    selectMode(upButton);

    setMode("up");

    updateStatus();
};


// ---------------------------------------------------------
// 手動 下げ
// ---------------------------------------------------------

downButton.onclick = () => {

    if (!powerOn) {
        return;
    }

    selectMode(downButton);

    setMode("down");

    updateStatus();
};


// ---------------------------------------------------------
// 状態表示
// ---------------------------------------------------------

function updateStatus() {

    if (!powerOn) {

        status.textContent = "電源 OFF";

        return;
    }


    // UI側で現在選択されているボタンを確認
    if (sec4Button.classList.contains("active")) {

        status.textContent = "自動　4秒";

        return;
    }

    if (sec8Button.classList.contains("active")) {

        status.textContent = "自動　8秒";

        return;
    }

    if (upButton.classList.contains("active")) {

        status.textContent = "手動　上げ";

        return;
    }

    if (downButton.classList.contains("active")) {

        status.textContent = "手動　下げ";

        return;
    }

    status.textContent = "モード未選択";
}