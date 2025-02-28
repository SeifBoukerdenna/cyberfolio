import React from 'react';
import "./SimulationControls.css";

interface SimulationParams {
    nodeWeight: number;
    connectionStrength: number;
    activationThreshold: number;
    pulseSpeed: number;
}

interface SimulationControlsProps {
    params: SimulationParams;
    setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ params, setParams }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    return (
        <div className="simulation-controls-panel">
            <label>
                Node Weight: {params.nodeWeight.toFixed(2)}
                <input
                    type="range"
                    name="nodeWeight"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.nodeWeight}
                    onChange={handleChange}
                />
            </label>
            <label>
                Connection Strength: {params.connectionStrength.toFixed(2)}
                <input
                    type="range"
                    name="connectionStrength"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.connectionStrength}
                    onChange={handleChange}
                />
            </label>
            <label>
                Activation Threshold: {params.activationThreshold.toFixed(2)}
                <input
                    type="range"
                    name="activationThreshold"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={params.activationThreshold}
                    onChange={handleChange}
                />
            </label>
            <label>
                Pulse Speed: {params.pulseSpeed.toFixed(2)}
                <input
                    type="range"
                    name="pulseSpeed"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.pulseSpeed}
                    onChange={handleChange}
                />
            </label>
        </div>
    );
};

export default SimulationControls;
