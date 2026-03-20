import { LiquidButton, MetalButton } from "../components/ui/liquid-glass-button";
import CinematicThemeSwitcher from "../components/ui/cinematic-theme-switcher";

export default function DemoPage() {
  return (
    <div className="flex flex-col gap-12 items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-8">Cinematic Theme Switcher</h2>
        <div className="flex items-center justify-center p-8 rounded-2xl bg-slate-100 dark:bg-slate-900 transition-colors">
          <CinematicThemeSwitcher />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Liquid Glass Effects</h2>
        <div className="relative h-[150px] w-[300px] flex items-center justify-center"> 
          <LiquidButton>
            Liquid Glass
          </LiquidButton> 
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Metal Variants</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <MetalButton variant="default">Default Steel</MetalButton>
          <MetalButton variant="primary">Primary Blue</MetalButton>
          <MetalButton variant="gold">Gold Leaf</MetalButton>
          <MetalButton variant="bronze">Raw Bronze</MetalButton>
          <MetalButton variant="success">Emerald</MetalButton>
          <MetalButton variant="error">Ruby</MetalButton>
        </div>
      </div>
    </div>
  )
}
