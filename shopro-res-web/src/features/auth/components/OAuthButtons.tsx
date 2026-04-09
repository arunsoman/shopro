import React from 'react';
import { Button } from '@/components/ui/Button';
import { Mail, Github, Chrome } from 'lucide-react';

interface OAuthButtonsProps {
  providers: string[];
  onSuccess: (provider: string, code: string) => void;
  redirectUri: string;
}

const IconMap: Record<string, any> = {
    google: Chrome,
    facebook: Mail, // Simplified mapping as placeholder or real icons
    x: Github,
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ providers, onSuccess, redirectUri }) => {
  return (
    <div className="space-y-3 w-full">
      {providers.map((p) => {
        const Icon = IconMap[p.toLowerCase()] || Mail;
        return (
          <Button
            key={p}
            variant="outline"
            className="w-full h-14 rounded-2xl border-border/40 font-black italic uppercase tracking-tight text-[11px] gap-3 flex items-center justify-center hover:bg-muted/50 transition-all active:scale-95"
            onClick={() => {
                // Mocking OAuth flow: in reality would redirect and get code back
                const mockCode = 'mock-auth-code-123';
                onSuccess(p, mockCode);
                console.log(`Initiating OAuth for ${p} with redirect: ${redirectUri}`);
            }}
          >
            <Icon size={16} strokeWidth={3} />
            Continue With {p}
          </Button>
        );
      })}
    </div>
  );
};
