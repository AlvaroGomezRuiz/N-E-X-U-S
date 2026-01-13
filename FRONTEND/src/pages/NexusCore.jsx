import React, { useState, useMemo, useRef, useEffect } from "react";

// --- SECCIÓN DE ICONOS ---
// Estos son componentes funcionales simples que devuelven gráficos vectoriales (SVG).
// Se separan aquí para no "ensuciar" el componente principal con código visual largo.
const PaperPlaneIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const PaperClipIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068l.003-.002.002-.002.007-.007.008-.008 10.94-10.94a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
    </svg>
);

// Iconos adicionales para el menú de adjuntos
const FilesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>);
const PhotosIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>);
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.122 2.122 0 00-1.791-.984H7.362a2.122 2.122 0 00-1.791.984l-.822 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>);

export default function LandingPage() {
    // --- ESTADOS (La "Memoria" del componente) ---
    // useState permite que React recuerde valores y re-renderice el componente cuando cambian.
    
    // Controla si el orbe ha "explotado" y estamos viendo el chat.
    const [isExploded, setIsExploded] = useState(false);
    
    // Guarda el texto que el usuario está escribiendo.
    const [inputValue, setInputValue] = useState(""); 
    
    // Controla si se está ejecutando la animación del avión de papel.
    const [isSending, setIsSending] = useState(false); 
    
    // Controla si el mensaje ya se envió (para subir la caja de texto hacia arriba).
    const [hasSubmitted, setHasSubmitted] = useState(false); 
    
    // Controla si el menú del clip (archivos/fotos) está visible.
    const [showAttachMenu, setShowAttachMenu] = useState(false); 
    
    // Controla qué tipo de animación usar al reaparecer la caja de texto:
    // 'normal' (inicio), 'editing' (zoom) o 'continuing' (slide up).
    const [inputMode, setInputMode] = useState('normal'); 

    // --- REFERENCIAS (Acceso directo al DOM y valores que no provocan re-render) ---
    // useRef guarda valores que persisten entre renders pero NO provocan que la pantalla se actualice al cambiar.
    
    const canvasRef = useRef(null); // Referencia al elemento <canvas> HTML.
    const mousePos = useRef({ x: -1000, y: -1000 }); // Posición del mouse para efectos visuales.
    const textareaRef = useRef(null); // Para controlar la altura del área de texto.
    const fileInputRef = useRef(null); // Inputs ocultos para subir archivos.
    const photoInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // --- EFECTO 1: Inyección de Estilos CSS ---
    // useEffect se ejecuta después de que el componente se monta.
    // Aquí creamos una etiqueta <style> dinámicamente para agregar animaciones CSS keyframes.
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Animación del avión volando */
            @keyframes flyAway {
                0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
                15% { transform: translate(-20px, 10px) scale(0.95) rotate(-10deg); opacity: 1; }
                30% { transform: translate(10px, -20px) scale(1) rotate(10deg); opacity: 1; }
                100% { transform: translate(120vw, -80vh) scale(0.6) rotate(25deg); opacity: 0; }
            }
            .plane-flying {
                animation: flyAway 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            
            /* Animación ZOOM (para cuando pulsas 'Editar') */
            @keyframes zoomInMessage {
                0% { transform: scale(0.8) translateY(-50px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
          
            /* Animación SLIDE UP (para cuando pulsas 'Continuar') */
            @keyframes slideUpInput {
                0% { transform: translateY(100px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
          
            /* Clases utilitarias para aplicar las animaciones */
            .animate-zoom-back {
                animation: zoomInMessage 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-slide-up {
                animation: slideUpInput 0.7s ease-out forwards;
            }

            /* Ocultar barra de scroll en el textarea */
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        // Función de limpieza: elimina el estilo cuando el componente se desmonta.
        return () => document.head.removeChild(style);
    }, []);

    // --- CÁLCULO DE PUNTOS DEL ORBE (Matemáticas 3D) ---
    // useMemo memoriza el resultado para no recalcular 550 posiciones en cada render.
    const nodePositions = useMemo(() => {
        const TOTAL_NODOS = 550; 
        // Algoritmo de Fibonacci Sphere para distribuir puntos en una esfera 3D.
        return Array.from({ length: TOTAL_NODOS }).map((_, i) => {
            const phi = Math.acos(-1 + (2 * i) / TOTAL_NODOS);
            const theta = Math.sqrt(TOTAL_NODOS * Math.PI) * phi;
            // Deformación aleatoria para que no sea una esfera perfecta.
            const randomDeformation = 0.8 + Math.random() * 0.4;
            const radius = 135 * randomDeformation;
            return {
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
                size: Math.random() * 1.5 + 0.5, // Tamaño variable de los puntos
            };
        });
    }, []);

    // --- EFECTO 2: El Bucle de Animación (Canvas) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        let animationFrameId; // ID para poder cancelar la animación después.
        let rotationAngle = 0; // Ángulo de rotación global.

        // Función que dibuja cada fotograma (frame)
        const render = () => {
            // 1. Limpiar el lienzo anterior
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            rotationAngle += 0.0025; // Velocidad de giro
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const isDark = document.documentElement.classList.contains('dark'); // Detectar modo oscuro

            // 2. Calcular nuevas posiciones 2D basadas en la rotación 3D
            const projectedNodes = nodePositions.map(node => {
                // Fórmulas de rotación de matriz simple
                const cosY = Math.cos(rotationAngle);
                const sinY = Math.sin(rotationAngle);
                const rotX = node.x * cosY - node.z * sinY;
                const rotZ = node.x * sinY + node.z * cosY;
                
                // Efecto de interacción con el MOUSE
                const dx = (centerX + rotX) - mousePos.current.x;
                const dy = (centerY + node.y) - mousePos.current.y;
                const distSq = dx * dx + dy * dy;
                
                let offsetX = 0, offsetY = 0, hoverExtraGlow = 0;
                // Si el mouse está cerca (< 120px), empujar los puntos y brillar
                if (distSq < 14400) {
                    const dist = Math.sqrt(distSq);
                    const force = (120 - dist) / 120;
                    offsetX = (dx / dist) * force * 18;
                    offsetY = (dy / dist) * force * 18;
                    hoverExtraGlow = force * 55;
                }
                
                // Calcular escala basada en profundidad (Z) para efecto 3D
                const scale = (rotZ + 250) / 450;
                return { x: centerX + rotX + offsetX, y: centerY + node.y + offsetY, opacity: scale, scale, glow: hoverExtraGlow, zDepth: rotZ };
            });

            // 3. Dibujar LÍNEAS entre puntos cercanos
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = isDark ? "rgba(0, 232, 248, 0.2)" : "rgba(0, 150, 200, 0.25)";
            for (let i = 0; i < projectedNodes.length; i++) {
                if (projectedNodes[i].zDepth < -20) continue; // No dibujar líneas de atrás
                // Comparar cada punto con algunos vecinos para crear la red
                for (let j = i + 1; j < projectedNodes.length; j += 6) { 
                    const dx = projectedNodes[i].x - projectedNodes[j].x;
                    const dy = projectedNodes[i].y - projectedNodes[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 2800) { // Solo conectar si están cerca
                        ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
                        ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y);
                    }
                }
            }
            ctx.stroke();

            // 4. Dibujar los PUNTOS (Nodos)
            const baseColor = isDark ? "0, 232, 248" : "0, 150, 200"; // Cian o Azul
            ctx.shadowColor = "#00e8f8";
            projectedNodes.forEach(p => {
                if (p.scale < 0.35) return; // No dibujar puntos muy lejanos
                ctx.shadowBlur = (isDark ? 18 : 10) + p.glow; // Brillo
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.scale * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
                ctx.fill();
            });
            
            // Solicitar el siguiente frame al navegador
            animationFrameId = requestAnimationFrame(render);
        };

        // Manejar redimensionamiento de ventana
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        window.addEventListener("resize", resize);
        resize();
        render(); // Iniciar animación

        // Limpieza al desmontar
        return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", resize); };
    }, [nodePositions]);

    // Actualiza la referencia de la posición del mouse cuando se mueve sobre el orbe
    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // --- LÓGICA DE INTERFAZ Y MANEJO DE ESTADOS ---

    // Maneja el cambio en el input y ajusta la altura automáticamente (caja elástica)
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto'; // Resetear para calcular bien
        e.target.style.height = `${e.target.scrollHeight}px`; // Asignar altura de scroll
    };

    // 1. REINICIO TOTAL (Botón "Reiniciar")
    // Vuelve a la pantalla inicial del Orbe
    const handleDisconnect = (e) => {
        if(e) e.stopPropagation();
        setIsExploded(false); // Cierra la interfaz de chat
        
        // Espera 500ms para limpiar estados (suavidad visual)
        setTimeout(() => {
            setInputValue("");
            setHasSubmitted(false);
            setIsSending(false);
            setShowAttachMenu(false);
            setInputMode('normal');
            if(textareaRef.current) textareaRef.current.style.height = 'auto';
        }, 500);
    };

    // 2. CONTINUAR (Botón "Continuar")
    // Limpia el input para una nueva pregunta y activa animación desde abajo
    const handleContinue = () => {
        setHasSubmitted(false); 
        setInputValue(""); 
        setInputMode('continuing'); // Activa CSS animation: slideUpInput
        
        setTimeout(() => {
            if(textareaRef.current) textareaRef.current.style.height = 'auto';
        }, 50);
    };

    // 3. EDITAR (Botón "Editar")
    // Mantiene el mensaje actual y activa animación de zoom
    const handleEdit = () => {
        setHasSubmitted(false);
        setInputMode('editing'); // Activa CSS animation: zoomInMessage
    };

    // 4. ENVIAR (Botón Avión)
    const handleSubmit = () => {
        if (!inputValue.trim()) return; // No enviar si está vacío
        
        setIsSending(true); // Activa animación del avión
        setHasSubmitted(true); // Sube la caja hacia arriba
        setShowAttachMenu(false); // Cierra menú de adjuntos si está abierto
        
        // Después de 2.1 segundos, el avión ha "volado", resetear estado de envío
        setTimeout(() => {
            setIsSending(false);
        }, 2100);
    };

    // Funciones helper para disparar los inputs de archivo ocultos
    const triggerFile = () => fileInputRef.current.click();
    const triggerPhoto = () => photoInputRef.current.click();
    const triggerCamera = () => cameraInputRef.current.click();

    // --- RENDERIZADO (JSX) ---
    return (
        <div className="w-full h-screen overflow-hidden relative flex flex-col items-center justify-center transition-colors duration-700 bg-slate-50 dark:bg-nexus-dark perspective-1000 font-sans">
            
            {/* Inputs Ocultos (Truco HTML estándar para files) */}
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => alert("Archivo: " + e.target.files[0]?.name)} />
            <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={(e) => alert("Foto: " + e.target.files[0]?.name)} />
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={(e) => alert("Cámara")} />

            {/* Cabecera (NEXUS V.1.0) */}
            {/* Se oculta (opacity-0) cuando isExploded es true */}
            <header className={`absolute top-10 z-20 transition-all duration-700 ${isExploded ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
                <h1 className="text-6xl font-normal tracking-[0.75em] text-slate-900 dark:text-white select-none pointer-events-none">NEXUS</h1>
                <p className="text-center text-s text-nexus-primary tracking-[0.5em] mt-3 font-medium opacity-80 select-none pointer-events-none">V.1.0.0</p>
            </header>

            {/* Contenedor del Orbe (Canvas) */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div
                    onClick={() => setIsExploded(true)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => mousePos.current = { x: -1000, y: -1000 }}
                    // Clases dinámicas: Si explota, escala x80 y se vuelve transparente
                    className={`relative flex items-center justify-center cursor-pointer rounded-full transition-all duration-[1.2s] w-96 h-96 md:w-[750px] md:h-[750px] pointer-events-auto bg-transparent border-none ${isExploded ? 'scale-[80] opacity-0' : 'scale-100'}`}
                >
                    <canvas ref={canvasRef} className="w-full h-full absolute inset-0 bg-transparent" />
                    <span className={`z-20 text-sm tracking-[1em] font-black text-slate-900 dark:text-nexus-primary hover:scale-125 transition-all duration-300 select-none ${isExploded ? 'opacity-0' : 'opacity-100'}`}>ENTRAR</span>
                </div>
            </div>

            {/* --- INTERFAZ POST-EXPLOSIÓN (CHAT) --- */}
            {/* Solo se renderiza si isExploded es true */}
            {isExploded && (
                <div className="absolute inset-0 z-30 w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-500">
                    
                    {/* Texto de fondo decorativo gigante */}
                    <div className="hidden xl:block absolute left-40 opacity-20 dark:opacity-10 text-[8rem] font-thin text-slate-900 dark:text-white select-none pointer-events-none tracking-widest">NEXUS</div>
                    <div className="hidden xl:block absolute right-40 opacity-20 dark:opacity-10 text-[8rem] font-thin text-slate-900 dark:text-white select-none pointer-events-none tracking-widest">NEXUS</div>

                    <div className="w-full max-w-2xl px-6 relative z-40 flex flex-col items-center">
                        
                        {/* CONTENEDOR PRINCIPAL QUE SE MUEVE */}
                        {/* Si hasSubmitted es true, se desplaza hacia arriba (-translate-y-56) */}
                        <div className={`w-full transition-all duration-1000 ease-in-out flex flex-col items-center ${hasSubmitted ? '-translate-y-56' : ''}`}>
                            
                            <h2 className={`text-center text-slate-600 dark:text-nexus-primary text-sm tracking-[0.4em] animate-pulse font-bold select-none pointer-events-none transition-all duration-500 ${hasSubmitted ? 'mb-4 scale-75 opacity-70' : 'mb-8'}`}>
                                SISTEMA EN LINEA
                            </h2>

                            {/* --- BOTONES DE ACCIÓN (Editar/Continuar/Reiniciar) --- */}
                            {/* Solo visibles cuando el mensaje ya se envió (hasSubmitted = true) */}
                            {hasSubmitted && (
                                <div className="flex space-x-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                    <button 
                                        onClick={handleEdit}
                                        className="px-4 py-2 text-xs font-bold tracking-widest text-slate-500 hover:text-nexus-primary border border-transparent hover:border-nexus-primary/30 rounded-lg transition-all"
                                    >
                                        [ EDITAR ]
                                    </button>

                                    <button 
                                        onClick={handleContinue}
                                        className="px-4 py-2 text-xs font-bold tracking-widest text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 hover:bg-nexus-primary hover:text-slate-900 rounded-lg transition-all"
                                    >
                                        CONTINUAR ➜
                                    </button>
                                     <button 
                                        onClick={handleDisconnect}
                                        className="px-4 py-2 text-xs font-bold tracking-widest text-red-400 hover:text-red-500 transition-all"
                                    >
                                        ✕ REINICIAR
                                    </button>
                                </div>
                            )}

                            {/* --- CAJA DE TEXTO (TEXTAREA) --- */}
                            {/* Si hasSubmitted es true, se vuelve semitransparente (opacity-50) y borrosa */}
                            <div className={`w-full relative transition-all duration-1000 ease-in-out ${hasSubmitted ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
                                
                                {/* Aquí aplicamos la animación condicional según inputMode */}
                                <div className={`relative rounded-3xl bg-slate-100 dark:bg-[#1e1e2e] p-2 border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 hover:shadow-xl dark:shadow-nexus-primary/10 
                                    ${!hasSubmitted && inputMode === 'editing' ? 'animate-zoom-back' : ''}
                                    ${!hasSubmitted && inputMode === 'continuing' ? 'animate-slide-up' : ''}
                                `}>
                                    <textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        readOnly={hasSubmitted || isSending} 
                                        rows={1}
                                        placeholder="Pregunta a Nexus..."
                                        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
                                        className="w-full p-4 pr-12 text-lg bg-transparent border-none outline-none resize-none min-h-[56px] max-h-[200px] overflow-y-auto no-scrollbar text-slate-800 dark:text-slate-200 placeholder-slate-400" 
                                    />
                                    
                                    {/* Botones inferiores dentro de la caja (Clip y Enviar) */}
                                    <div className="flex items-center justify-between px-2 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                {/* Botón Clip para adjuntar */}
                                                <button 
                                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                                    className="p-2 text-slate-400 hover:text-nexus-primary hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all"
                                                >
                                                    <PaperClipIcon className="w-5 h-5" />
                                                </button>
                                                
                                                {/* Menú desplegable de adjuntos */}
                                                {showAttachMenu && (
                                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-[#2e2e3e] rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="flex flex-col text-slate-600 dark:text-slate-200">
                                                            <button onClick={triggerFile} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 w-full text-sm"><span>Archivos</span> <FilesIcon /></button>
                                                            <button onClick={triggerPhoto} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 w-full text-sm"><span>Fotos</span> <PhotosIcon /></button>
                                                            <button onClick={triggerCamera} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 w-full text-sm"><span>Cámara</span> <CameraIcon /></button>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Overlay invisible para cerrar el menú si haces clic fuera */}
                                                {showAttachMenu && <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)}></div>}
                                            </div>
                                        </div>

                                        {/* Botón ENVIAR */}
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!inputValue.trim()} // Deshabilitado si no hay texto
                                            className={`p-2 rounded-full transition-all duration-300 ${inputValue.trim() ? 'bg-nexus-primary text-slate-900 hover:bg-white hover:shadow-lg' : 'bg-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                                        >
                                            <PaperPlaneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ANIMACIÓN: AVIÓN VOLANDO */}
                        {/* Se muestra un icono independiente encima de todo que se anima con CSS */}
                        {isSending && (
                            <div className="absolute top-1/2 left-1/2 text-nexus-primary pointer-events-none z-50 plane-flying">
                                <PaperPlaneIcon className="w-12 h-12" />
                            </div>
                        )}

                        {/* Botón desconectar flotante (solo visible si AÚN NO has enviado nada) */}
                        {!hasSubmitted && (
                             <button
                                onClick={handleDisconnect}
                                className={`mt-24 mx-auto block text-xs tracking-widest uppercase font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all duration-1000 select-none`}
                            >
                                [ DESCONECTAR ]
                            </button>
                        )}
                       
                    </div>
                </div>
            )}
        </div>
    );
}