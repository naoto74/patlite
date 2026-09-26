class SirenProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.phase = 0;

        // 現在の基本周波数
        this.f0 = 170;

        // f0の変化率
        this.targetF0 = 170;

        this.port.onmessage = e => {
            if (e.data.f0 !== undefined) {
                this.targetF0 = e.data.f0;
            }
        };
    }

    // ★ここをあなたの関数に置き換える
    getHarmonics(f0) {
        return {
            h2: f0 < 500?0.1:Math.max(
				20/(f0-450),
				2/3*Math.exp(-1/50*(f0-525)**2),
				2/5*Math.exp(-1/100*(f0-570)**2),
				2/5*Math.exp(-1/400*(f0-620)**2),
				2/5*Math.exp(-1/400*(f0-680)**2),
			),
            h3: f0 < 480?0.1:Math.max(
				5/(f0-410),
				1/5*Math.exp(-1/400*(f0-645)**2),
				1/2*Math.exp(-1/300*(f0-765)**2)
			),
            h4: f0 < 450?0.1:Math.max(
				5/(f0-400),
				1/10*Math.exp(-1/700*(f0-640)**2)
			),
            h5: f0 < 400?0.1:Math.max(
				5/(f0-350),
				1/8*Math.exp(-1/700*(f0-480)**2)
			),
        };
    }

    process(inputs, outputs) {
        const output = outputs[0];
        const channel = output[0];

        for (let i = 0; i < channel.length; i++) {

            // f0を滑らかに追従させる
            this.f0 += (this.targetF0 - this.f0) * 0.001;

            const f0 = this.f0;

            // 倍音振幅
            const {
                h2,
                h3,
                h4,
                h5
            } = this.getHarmonics(f0);

            // 現在の位相
            const phase = this.phase;

            // 加算合成
            let sample =
                Math.sin(phase) +
                h2 * Math.sin(phase * 2) +
                h3 * Math.sin(phase * 3) +
                h4 * Math.sin(phase * 4) +
                h5 * Math.sin(phase * 5);

            // 位相を進める
            this.phase += 2 * Math.PI * f0 / sampleRate;

            // 0～2πに収める
            if (this.phase >= 2 * Math.PI) {
                this.phase -= 2 * Math.PI;
            }
			const f0vol = Math.min(Math.max(0,Math.max(f0-450)/100),1)*(1/(1+Math.exp(-1/50*(f0-500))));

            channel[i] = sample*f0vol;
        }

        return true;
    }
}

registerProcessor("siren-processor", SirenProcessor);
