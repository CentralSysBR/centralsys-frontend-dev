import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface PDVBarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (codigo: string) => void;
}

export function PDVBarcodeScanner({
    isOpen,
    onClose,
    onScan
}: PDVBarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const lastScannedRef = useRef<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        async function startScanner() {
            try {
                setIsStarting(true);

                const scanner = new Html5Qrcode('pdv-reader');
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        if (decodedText === lastScannedRef.current) return;

                        lastScannedRef.current = decodedText;
                        onScan(decodedText);

                        setTimeout(() => {
                            lastScannedRef.current = null;
                        }, 1200);
                    },
                    () => {
                        // erro de leitura ignorado propositalmente
                    }
                );
            } catch (err) {
                console.error('Erro ao iniciar scanner:', err);
            } finally {
                setIsStarting(false);
            }
        }

        startScanner();

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    async function stopScanner() {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch { }
            scannerRef.current = null;
        }
    }

    function handleClose() {
        stopScanner();
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 space-y-4 animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera size={20} className="text-blue-600" />
                        <h2 className="font-bold text-[#1A2B3C]">Leitor de Código</h2>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 bg-gray-100 rounded-full"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Viewport da câmera */}
                <div className="flex justify-center">
                    <div
                        id="pdv-reader"
                        className="w-[280px] h-[280px] rounded-2xl overflow-hidden bg-black"
                    />
                </div>

                {/* Feedback */}
                <div className="text-center text-xs text-gray-500">
                    Aponte para o código de barras<br />
                    Os itens serão adicionados automaticamente
                </div>

                {isStarting && (
                    <div className="text-center text-xs text-blue-600 font-bold">
                        Iniciando câmera…
                    </div>
                )}

                {/* Ação */}
                <button
                    onClick={handleClose}
                    className="w-full bg-[#1A2B3C] text-white py-3 rounded-2xl font-bold active:scale-95 transition-all"
                >
                    Encerrar leitura
                </button>

            </div>
        </div>
    );
}
