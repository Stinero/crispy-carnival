import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div>
      <label className="flex justify-between text-sm font-medium text-gray-300 mb-2">
        <span>{label}</span>
        <span className="font-bold text-accent-cyan">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider focus:outline-none"
      />
    </div>
  );
};

export default Slider;