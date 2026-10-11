
import type { SimulationState, SimulationOutput, SimulationConfig } from '../types';

/**
 * Leaky Integrate-and-Fire (LIF) Neuron Model
 * Mimics biological neural behavior with membrane potentials and spikes.
 */
class SpikingNeuron {
    voltage: number = 0;
    threshold: number = 1.0;
    decay: number = 0.9; // Leakage rate
    refractory: number = 0;
    
    tick(input: number): boolean {
        if (this.refractory > 0) {
            this.refractory--;
            this.voltage = 0;
            return false;
        }
        
        this.voltage = (this.voltage * this.decay) + input;
        
        if (this.voltage >= this.threshold) {
            this.voltage = 0;
            this.refractory = 2; // Time steps until next spike possible
            return true; // Spike!
        }
        return false;
    }
}

class ModularIntelligence {
    input_size: number;
    hidden_size: number;
    weights1: number[][];
    weights2: number[][];
    learning_rate: number;
    
    // Spiking State
    hidden_neurons: SpikingNeuron[];
    output_neurons: SpikingNeuron[];
    spike_history: number[][] = [];

    constructor(input_size = 6, hidden_size = 12) {
        this.input_size = input_size;
        this.hidden_size = hidden_size;
        this.learning_rate = 0.01;
        
        this.weights1 = Array.from({ length: input_size }, () =>
            Array.from({ length: hidden_size }, () => Math.random() * 0.5 - 0.25)
        );
        this.weights2 = Array.from({ length: hidden_size }, () =>
            Array.from({ length: 2 }, () => Math.random() * 0.5 - 0.25)
        );

        this.hidden_neurons = Array.from({ length: hidden_size }, () => new SpikingNeuron());
        this.output_neurons = Array.from({ length: 2 }, () => new SpikingNeuron());
    }

    /**
     * SNN Forward Pass
     * Returns the spiking activity (0 or 1) of the output neurons.
     */
    forward(inputs: number[]): number[] {
        const hidden_spikes = this.hidden_neurons.map((neuron, i) => {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {
                sum += inputs[j] * this.weights1[j][i];
            }
            return neuron.tick(sum) ? 1 : 0;
        });

        const output_spikes = this.output_neurons.map((neuron, i) => {
            let sum = 0;
            for (let j = 0; j < hidden_spikes.length; j++) {
                sum += hidden_spikes[j] * this.weights2[j][i];
            }
            return neuron.tick(sum) ? 1 : 0;
        });

        return output_spikes;
    }

    /**
     * STDP-inspired (Spike-Timing Dependent Plasticity) training.
     * Adjusts weights based on the correlation between inputs and firing success.
     */
    train(inputs: number[], targets: number[]): number {
        const spikes = this.forward(inputs);
        
        // Simple error calculation for the metrics display
        const error = (targets[0] - spikes[0]) ** 2 + (targets[1] - spikes[1]) ** 2;

        // Apply synaptic weight updates
        for (let i = 0; i < this.input_size; i++) {
            for (let j = 0; j < this.hidden_size; j++) {
                if (inputs[i] > 0.5) {
                    this.weights1[i][j] += this.learning_rate * (targets[0] - spikes[0]);
                }
            }
        }
        
        return error;
    }
}

class ParticleField {
    name: string;
    width: number;
    height: number;
    level: number;
    mass: number;
    coupling: number;
    gauge_field: number[][];
    matter_field: number[][];
    resonance_field: number[][];
    dt: number = 0.002;
    dx: number = 0.5;
    hbar: number = 1.0;
    c: number = 1.0;
    g: number = 0.1;
    gamma: number = 0.5;
    alpha: number = 0.1;
    beta: number = 0.1;
    syntropy_target: number;

    constructor(name: string, width: number, height: number, syntropy_target: number, mass: number, coupling: number, level = 0) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.level = level;
        this.mass = mass;
        this.coupling = coupling;
        this.syntropy_target = syntropy_target;
        this.resetFields();
    }

    resetFields() {
      this.gauge_field = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => Math.random() * 0.02 - 0.01));
      this.matter_field = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => Math.random() * 0.2 - 0.1));
      this.resonance_field = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => Math.random() * 0.2 - 0.1));
    }

    private safeIndex(coord: number, max: number): number {
        return (coord + max) % max;
    }

    update_matter_field(): number[][] {
        const psi = this.matter_field;
        const psi_new = psi.map(row => [...row]);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const psi_curr = psi[y][x];
                const psi_up = psi[this.safeIndex(y - 1, this.height)][x];
                const psi_down = psi[this.safeIndex(y + 1, this.height)][x];
                const psi_left = psi[y][this.safeIndex(x - 1, this.width)];
                const psi_right = psi[y][this.safeIndex(x + 1, this.width)];
                const laplacian = (psi_up + psi_down + psi_left + psi_right - 4 * psi_curr) / (this.dx ** 2);
                const dpsi_dt = this.gamma * laplacian + this.alpha * psi_curr - this.beta * (psi_curr ** 3);
                psi_new[y][x] = psi_curr + dpsi_dt * this.dt;
            }
        }
        this.matter_field = psi_new;
        return this.matter_field;
    }
    
    update_gauge_field(): number[][] {
        const A = this.gauge_field;
        const A_new = A.map(row => [...row]);
        const J_resonance = this.resonance_field.map(row => row.map(phi => this.coupling * phi));

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const A_curr = A[y][x];
                const A_up = A[this.safeIndex(y - 1, this.height)][x];
                const A_down = A[this.safeIndex(y + 1, this.height)][x];
                const A_left = A[y][this.safeIndex(x - 1, this.width)];
                const A_right = A[y][this.safeIndex(x + 1, this.width)];
                const d2A_d2x = (A_up + A_down + A_left + A_right - 4 * A_curr) / (this.dx ** 2);
                A_new[y][x] = A_curr + this.dt * (this.c ** 2 * d2A_d2x - J_resonance[y][x]);
            }
        }
        this.gauge_field = A_new;
        return this.gauge_field;
    }

    update_resonance_field(inputs: number[]): { phi_new: number[][], stability: number } {
        const phi_A = this.resonance_field;
        const phi_new = phi_A.map(row => [...row]);
        const source = (inputs.length > 0) ? inputs.reduce((a, b) => a + b, 0) / inputs.length : 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const phi_curr = phi_A[y][x];
                const phi_up = phi_A[this.safeIndex(y - 1, this.height)][x];
                const phi_down = phi_A[this.safeIndex(y + 1, this.height)][x];
                const phi_left = phi_A[y][this.safeIndex(x - 1, this.width)];
                const phi_right = phi_A[y][this.safeIndex(x + 1, this.width)];
                const d2phi_dx2 = (phi_up + phi_down + phi_left + phi_right - 4 * phi_curr) / (this.dx ** 2);
                const dV_dphi = this.mass ** 2 * phi_curr;
                const dI_dphi = this.g * this.gauge_field[y][x] ** 2;
                const d2phi_dt2 = this.c ** 2 * d2phi_dx2 - dV_dphi + this.coupling * dI_dphi + source;
                const syntropy_adjustment = (this.syntropy_target - phi_curr) * 0.01;
                phi_new[y][x] = phi_curr + this.dt * d2phi_dt2 + syntropy_adjustment;
            }
        }
        this.resonance_field = phi_new;
        
        const flat_phi = phi_new.flat();
        const mean = flat_phi.reduce((a, b) => a + b, 0) / flat_phi.length;
        const variance = flat_phi.reduce((sum, val) => sum + (val - mean) ** 2, 0) / flat_phi.length;
        const stability = Math.min(1.0, 1.0 / (1.0 + 10 * variance));

        return { phi_new, stability };
    }
}

export class FractalFieldseerFusion {
    field: ParticleField;
    mi: ModularIntelligence;
    time: number;
    patterns: SimulationOutput[];
    substrate: string;

    constructor(config: SimulationConfig) {
        this.field = new ParticleField("Root Field", config.width, config.height, config.syntropyTarget, config.initialMass, config.initialCoupling);
        this.mi = new ModularIntelligence();
        this.time = 0;
        this.patterns = [];
        this.substrate = 'Biological-Inspired Spiking Substrate';
    }

    reset(config: SimulationConfig) {
        this.field = new ParticleField("Root Field", config.width, config.height, config.syntropyTarget, config.initialMass, config.initialCoupling);
        this.mi = new ModularIntelligence();
        this.time = 0;
    }

    saveState(): SimulationState {
        return {
            miWeights1: this.mi.weights1,
            miWeights2: this.mi.weights2,
            fieldMass: this.field.mass,
            fieldCoupling: this.field.coupling,
            time: this.time,
            patterns: this.patterns,
        };
    }

    loadState(state: SimulationState) {
        if (!state) return;
        if (state.miWeights1) this.mi.weights1 = state.miWeights1;
        if (state.miWeights2) this.mi.weights2 = state.miWeights2;
        if (state.fieldMass) this.field.mass = state.fieldMass;
        if (state.fieldCoupling) this.field.coupling = state.fieldCoupling;
        if (state.time) this.time = state.time;
        this.patterns = state.patterns || [];
    }

    run_cycle(external_data: number[]): SimulationOutput {
        try {
            const psi = this.field.update_matter_field();
            const A = this.field.update_gauge_field();
            const { phi_new: phi_A, stability } = this.field.update_resonance_field(external_data);

            const patterns = {
                "mean_resonance": phi_A.flat().reduce((a, b) => a + b, 0) / (this.field.width * this.field.height),
                "mean_matter": psi.flat().reduce((a, b) => a + b, 0) / (this.field.width * this.field.height),
                "mean_gauge": A.flat().reduce((a, b) => a + b, 0) / (this.field.width * this.field.height),
                "energy_density": phi_A.flat().reduce((sum, phi) => sum + (0.5 * this.field.mass ** 2 * phi ** 2), 0) / (this.field.width * this.field.height),
                "chaos_metric": Math.sqrt(A.flat().reduce((s, x) => s + x ** 2, 0)) / (this.field.coupling + 1e-6),
            };

            const mi_inputs = [
                stability,
                patterns["mean_resonance"],
                patterns["mean_matter"],
                patterns["mean_gauge"],
                patterns["energy_density"],
                patterns["chaos_metric"]
            ];

            const mi_targets = stability < 0.4 ? [1.0, 1.0] : [0.0, 0.0];
            const mi_loss = this.mi.train(mi_inputs, mi_targets);
            const spikes = this.mi.forward(mi_inputs);

            // Physics adapts based on Spiking Activity
            const mass_adjustment = (spikes[0] - 0.5) * 0.02;
            const coupling_adjustment = (spikes[1] - 0.5) * 0.02;

            this.field.mass = Math.max(0.5, Math.min(2.0, this.field.mass + mass_adjustment));
            this.field.coupling = Math.max(0.05, Math.min(1.0, this.field.coupling + coupling_adjustment));

            this.time += 1;

            const simState: SimulationOutput = {
                substrate: this.substrate,
                time: this.time,
                stability: stability,
                patterns: patterns,
                mi_feedback: {
                    mi_loss: mi_loss,
                    mass_adjustment: mass_adjustment,
                    coupling_adjustment: coupling_adjustment,
                },
                fields: {
                    matter: this.field.matter_field,
                    gauge: this.field.gauge_field,
                    resonance: this.field.resonance_field,
                }
            };
            this.patterns.push(simState);
            if (this.patterns.length > 200) this.patterns.shift();
            return simState;

        } catch (e) {
            console.error("Simulation cycle error:", e);
            return {
                error: "Substrate Desync",
                substrate: this.substrate,
                time: this.time,
                stability: 0,
                patterns: {},
                mi_feedback: { mi_loss: 0, mass_adjustment: 0, coupling_adjustment: 0 },
                fields: { matter: [], gauge: [], resonance: [] }
            };
        }
    }
}
