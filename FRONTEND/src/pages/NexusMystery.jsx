import React, { useMemo, useRef, useEffect } from "react";

export default function NexusMystery() {
    // --- REFERENCIAS ---
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: -1000, y: -1000 });

    // --- CÁLCULO MATEMÁTICO DEL ORBE (GEOMETRÍA) ---
    const nodePositions = useMemo(() => {
        const TOTAL_NODOS = 550; 
        return Array.from({ length: TOTAL_NODOS }).map((_, i) => {
            const phi = Math.acos(-1 + (2 * i) / TOTAL_NODOS);
            const theta = Math.sqrt(TOTAL_NODOS * Math.PI) * phi;
            const randomDeformation = 0.8 + Math.random() * 0.4;
            const radius = 135 * randomDeformation;
            
            return {
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
                size: Math.random() * 1.5 + 0.5,
            };
        });
    }, []);

    // --- MOTOR GRÁFICO (CANVAS LOOP) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d", { alpha: true });
        let animationFrameId;
        let rotationAngle = 0;

        const render = () => {
            // Ajustar canvas al tamaño real de la pantalla
            if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            rotationAngle += 0.0020; 
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Detectar modo oscuro para el color de las partículas
            const isDark = document.documentElement.classList.contains('dark');
            const primaryColor = isDark ? "34, 211, 238" : "71, 85, 105"; // Cian (Dark) vs Gris Slate (Light)

            // Mapeo de nodos 3D a 2D
            const projectedNodes = nodePositions.map(node => {
                const cosY = Math.cos(rotationAngle);
                const sinY = Math.sin(rotationAngle);
                
                const rotX = node.x * cosY - node.z * sinY;
                const rotZ = node.x * sinY + node.z * cosY;
                
                const dx = (centerX + rotX) - mousePos.current.x;
                const dy = (centerY + node.y) - mousePos.current.y;
                const distSq = dx * dx + dy * dy;
                
                let offsetX = 0, offsetY = 0, hoverExtraGlow = 0;
                
                if (distSq < 20000) {
                    const dist = Math.sqrt(distSq);
                    const force = (140 - dist) / 140;
                    offsetX = (dx / dist) * force * 25;
                    offsetY = (dy / dist) * force * 25;
                    hoverExtraGlow = force * 40;
                }
                
                const scale = (rotZ + 250) / 450;
                return { 
                    x: centerX + rotX + offsetX, 
                    y: centerY + node.y + offsetY, 
                    opacity: scale, 
                    scale, 
                    glow: hoverExtraGlow, 
                    zDepth: rotZ 
                };
            });

            // Dibujar CONEXIONES
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            // Líneas: Gris sutil (Light) vs Cian sutil (Dark)
            ctx.strokeStyle = isDark ? "rgba(6, 182, 212, 0.15)" : "rgba(100, 116, 139, 0.15)"; 
            
            for (let i = 0; i < projectedNodes.length; i++) {
                if (projectedNodes[i].zDepth < -20) continue;
                for (let j = i + 1; j < projectedNodes.length; j += 8) { 
                    const dx = projectedNodes[i].x - projectedNodes[j].x;
                    const dy = projectedNodes[i].y - projectedNodes[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 3000) {
                        ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
                        ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y);
                    }
                }
            }
            ctx.stroke();

            // Dibujar NODOS
            ctx.shadowColor = isDark ? "#22d3ee" : "#94a3b8"; 
            projectedNodes.forEach(p => {
                if (p.scale < 0.35) return;
                ctx.shadowBlur = 15 + p.glow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.scale * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${primaryColor}, ${p.opacity})`; 
                ctx.fill();
            });
            
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [nodePositions]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    return (
        <div className="w-full h-screen overflow-hidden relative flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 font-sans select-none transition-colors duration-500">
            
            {/* Header Fijo */}
            <header className="absolute top-10 z-20 flex flex-col items-center animate-pulse">
                {/* TÍTULO: Gris Oscuro -> Blanco */}
                <h1 className="text-4xl md:text-6xl font-light tracking-[0.5em] md:tracking-[0.75em] text-slate-700 dark:text-white/90 transition-colors duration-500">
                    NEXUS
                </h1>
                
                {/* SUBTÍTULO: Gris Medio -> Cian Neón */}
                {/* Aquí está el cambio clave: 'text-slate-500' (Día) vs 'text-cyan-400' (Noche) */}
                <p className="text-[10px] md:text-xl text-slate-500 dark:text-cyan-400 tracking-[0.8em] mt-4 font-medium opacity-80 uppercase transition-colors duration-500">
                    PROXIMAMENTE V.1.0.0
                </p>
            </header>

            {/* Contenedor del Orbe */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => mousePos.current = { x: -1000, y: -1000 }}
                    className="relative w-full h-full"
                >
                    <canvas ref={canvasRef} className="w-full h-full block" />
                </div>
            </div>

            {/* Footer Opcional */}
            {/* FOOTER: Gris Claro -> Cian Apagado */}
            <div className="absolute bottom-10 z-20 opacity-40 text-slate-400 dark:text-cyan-600 text-xs tracking-[0.3em] transition-colors duration-500">
                NEXUSLENS.ES
            </div>
        </div>
    );
}