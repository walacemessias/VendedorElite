import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Confetti } from "./Confetti";

interface CelebrationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CelebrationPopup({ open, onOpenChange }: CelebrationPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-none bg-transparent shadow-none" data-testid="dialog-celebration">
        {open && <Confetti />}
        <div className="relative z-50 bg-card rounded-2xl p-12 text-center shadow-2xl animate-in zoom-in-50 duration-500">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-primary mb-2">NOVA VENDA!</h2>
          <p className="text-xl mb-2">Venda registrada com sucesso!</p>
          <p className="text-muted-foreground">Parabéns pelo fechamento!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
