export function CircuitPattern() {
    return (
        <div
            className="fixed inset-0 z-0 opacity-5"
            style={{ pointerEvents: 'none' }}
        >
            <svg width="100%" height="100%" className="absolute inset-0">
                <pattern
                    id="circuit"
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M10 10h80M10 50h80M10 90h80M10 10v80M50 10v80M90 10v80"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                    />
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                    <circle cx="50" cy="10" r="2" fill="currentColor" />
                    <circle cx="90" cy="10" r="2" fill="currentColor" />
                    <circle cx="10" cy="50" r="2" fill="currentColor" />
                    <circle cx="50" cy="50" r="2" fill="currentColor" />
                    <circle cx="90" cy="50" r="2" fill="currentColor" />
                    <circle cx="10" cy="90" r="2" fill="currentColor" />
                    <circle cx="50" cy="90" r="2" fill="currentColor" />
                    <circle cx="90" cy="90" r="2" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#circuit)" />
            </svg>
        </div>
    );
}
