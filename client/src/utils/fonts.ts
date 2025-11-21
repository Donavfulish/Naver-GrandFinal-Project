import { Inter, Poppins, Nunito, Roboto_Slab, Merriweather, Playfair_Display, Fredoka, Lato } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
export const poppins = Poppins({ subsets: ['latin'], display: 'swap', weight: ['400', '600', '700'], variable: '--font-poppins' })
export const nunito = Nunito({ subsets: ['latin'], display: 'swap', variable: '--font-nunito' })
export const robotoSlab = Roboto_Slab({ subsets: ['latin'], display: 'swap', variable: '--font-roboto-slab' })
export const merriweather = Merriweather({ subsets: ['latin'], display: 'swap', weight: ['400', '700'], variable: '--font-merriweather' })
export const playfairDisplay = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair-display' })
export const fredoka = Fredoka({ subsets: ['latin'], display: 'swap', variable: '--font-fredoka' })
export const lato = Lato({ subsets: ['latin'], display: 'swap', weight: ['400', '700'], variable: '--font-lato' })

export const fontMap: Record<string, string> = {
    'Inter': inter.style.fontFamily,
    'Poppins': poppins.style.fontFamily,
    'Nunito': nunito.style.fontFamily,
    'Roboto_Slab': robotoSlab.style.fontFamily,
    'Merriweather': merriweather.style.fontFamily,
    'Playfair_Display': playfairDisplay.style.fontFamily,
    'Fredoka': fredoka.style.fontFamily,
    'Lato': lato.style.fontFamily,
}

/**
 * Hàm tìm CSS value từ tên font
 * @param fontName Tên font (ví dụ: "Poppins")
 * @returns CSS font-family value (ví dụ: 'var(--font-poppins)')
 */
export function getFontFamily(fontName: string): string {
    return fontMap[fontName] || 'sans-serif'
}

export const appFonts = [
    inter, poppins, nunito, robotoSlab, merriweather, playfairDisplay, fredoka, lato
]