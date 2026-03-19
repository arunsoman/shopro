import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'prs', name: 'Dari (دری)', flag: '🇦🇫' },
    { code: 'ps', name: 'Pashto (پښتو)', flag: '🇦🇫' },
    { code: 'sw', name: 'Swahili (Kiswahili)', flag: '🇰🇪' },
];

export function LanguageSelector() {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
        // Force LTR/RTL if needed
        document.dir = (value === 'prs' || value === 'ps') ? 'rtl' : 'ltr';
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8 bg-surface border-border text-foreground hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                        <Languages className="h-3.5 w-3.5" />
                        <SelectValue placeholder={t('common.language')} />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-surface border-border text-foreground">
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/10 focus:bg-white/10">
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
