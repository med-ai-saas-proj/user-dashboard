// AudioWorklet that resamples mic input from the device sample rate down to
// 16 kHz int16 mono and posts 30 ms (480-sample) frames to the main thread.
//
// Resampling is naive linear interpolation — adequate for ASR, and avoids
// pulling in a DSP library. Mic streams are highly correlated, so a low-pass
// pre-filter would only marginally improve quality.

class PcmWorklet extends AudioWorkletProcessor {
    constructor(options) {
        super();
        const opts = options.processorOptions || {};
        this.targetRate = opts.targetRate || 16000;
        this.frameSamples = Math.round(this.targetRate * 0.03); // 30 ms
        this.outBuf = new Int16Array(this.frameSamples);
        this.outIndex = 0;
        this.srcPos = 0; // fractional position in input stream
    }

    process(inputs) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;
        const channel = input[0];
        if (!channel || channel.length === 0) return true;

        const ratio = sampleRate / this.targetRate;
        // Generate output samples by walking srcPos forward in `ratio` steps.
        // We may produce 0..many output samples per process() call.
        let i = 0;
        while (this.srcPos < channel.length) {
            const idx = Math.floor(this.srcPos);
            const frac = this.srcPos - idx;
            const a = channel[idx];
            const b = idx + 1 < channel.length ? channel[idx + 1] : a;
            const sample = a + (b - a) * frac;
            // float32 [-1,1] -> int16
            let s = Math.max(-1, Math.min(1, sample));
            this.outBuf[this.outIndex++] = (s * 0x7fff) | 0;
            if (this.outIndex >= this.frameSamples) {
                // Post a copy so the underlying buffer can be reused.
                this.port.postMessage(this.outBuf.slice(0).buffer, [
                    this.outBuf.slice(0).buffer,
                ]);
                this.outIndex = 0;
            }
            this.srcPos += ratio;
            i++;
        }
        // Carry over the fractional remainder.
        this.srcPos -= channel.length;
        return true;
    }
}

registerProcessor("pcm-worklet", PcmWorklet);
