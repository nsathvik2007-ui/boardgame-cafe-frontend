const STEPS = [
  { label: 'Check in', x: 40, y: 60 },
  { label: 'Pick a game', x: 220, y: 28 },
  { label: 'Order food', x: 400, y: 60 },
  { label: 'Pay', x: 580, y: 24 },
];

export default function JourneyPath({ currentStep = 0 }) {
  return (
    <div className="mb-12">
      <svg width="100%" height="130" viewBox="0 0 620 130" aria-hidden="true">
        <path
          d="M40 60 Q130 12 220 28 T400 60 T580 24"
          stroke="#FFF8ED"
          strokeWidth="3"
          fill="none"
          strokeDasharray="1 14"
          strokeLinecap="round"
        />
        {STEPS.map((step, i) =>
          i === currentStep ? (
            <g key={step.label}>
              <g transform={`translate(${step.x}, ${step.y})`}>
                <path
                  d="M-7 14 Q-7 2 0 2 Q7 2 7 14 L7 19 Q7 22 0 22 Q-7 22 -7 19 Z"
                  fill="#FFF8ED"
                  stroke="#3D2817"
                  strokeWidth="1.6"
                />
                <circle cx="0" cy="-5" r="7" fill="#FFF8ED" stroke="#3D2817" strokeWidth="1.6" />
              </g>
              <text
                x={step.x}
                y={step.y + 46}
                textAnchor="middle"
                fontSize="16"
                fill="#F4A340"
                fontWeight="500"
                fontFamily="'Baloo 2', sans-serif"
              >
                {step.label}
              </text>
            </g>
          ) : (
            <g key={step.label}>
              <circle cx={step.x} cy={step.y} r="14" fill="#F4A340" />
              <text x={step.x} y={step.y + 5} textAnchor="middle" fontSize="15" fill="#3D2817" fontFamily="Georgia, serif">
                {i + 1}
              </text>
              <text
                x={step.x}
                y={step.y + 38}
                textAnchor="middle"
                fontSize="16"
                fill="#F4A340"
                fontWeight="500"
                fontFamily="'Baloo 2', sans-serif"
              >
                {step.label}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
}
