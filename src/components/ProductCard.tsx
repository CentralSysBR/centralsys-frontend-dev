import { Package } from 'lucide-react';
import { formatCurrencyBR } from '@/utils/formatCurrencyBR';
import { normalizeDisplayText } from '@/utils/normalizeDisplayText';

interface ProductCardProps {
    id: string;
    nome: string;
    precoVenda: number;
    quantidadeEstoque: number;
    imagemUrl?: string;
    quantidadeNoCarrinho?: number;

    mode?: 'pdv' | 'estoque';

    disabled?: boolean;
    onClick?: () => void;
    onRemove?: () => void;
}

export function ProductCard({
    nome,
    precoVenda,
    quantidadeEstoque,
    imagemUrl,
    quantidadeNoCarrinho = 0,
    mode = 'pdv',
    disabled = false,
    onClick,
    onRemove,
}: ProductCardProps) {
    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`
        flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${quantidadeNoCarrinho > 0 ? 'border-[#2D6A4F] ring-1 ring-[#2D6A4F]' : 'border-gray-100 shadow-sm'}
      `}
        >
            {/* IMAGEM — tamanho fixo, nunca encolhe */}
            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagemUrl ? (
                    <img
                        src={imagemUrl}
                        alt={nome}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <Package size={22} className="text-gray-400" />
                )}
            </div>

            {/* TEXTO */}
            <div className="flex-1 min-w-0">
                <p
                    className={`
            text-sm font-medium text-[#1A2B3C] leading-tight
            ${mode === 'pdv' ? 'line-clamp-1' : 'line-clamp-2'}
          `}
                >
                    {normalizeDisplayText(nome)}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                    Estoque: {quantidadeEstoque}
                </p>

                {quantidadeNoCarrinho > 0 && (
                    <span className="mt-0.5 inline-block text-[10px] font-black text-[#2D6A4F] uppercase">
                        No carrinho: {quantidadeNoCarrinho}x
                    </span>
                )}
            </div>

            {/* COLUNA DIREITA — preço + estoque */}
            <div className="flex flex-col items-end justify-center gap-1">
                <span className="font-bold text-[#2D6A4F] text-sm">
                    {formatCurrencyBR(precoVenda)}
                </span>

                {mode === 'estoque' && (
                    <span className="text-xs text-gray-400">
                        Disponível
                    </span>
                )}
            </div>
        </div>
    );
}
