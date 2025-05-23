export function GridOverlay() {
    return (
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,_rgba(32,128,32,0.2)_2%,_transparent_3%),_linear-gradient(90deg,transparent_0%,_rgba(32,128,32,0.2)_2%,_transparent_3%)] bg-[length:50px_50px]" />
        </div>
    );
}
