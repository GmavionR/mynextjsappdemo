import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, onClose, duration = 2000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
            <div className="bg-black/75 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-fade-up">
                <CheckCircle2 size={20} className="text-green-400" />
                <span className="text-sm whitespace-nowrap">{message}</span>
            </div>
        </div>
    );
} 