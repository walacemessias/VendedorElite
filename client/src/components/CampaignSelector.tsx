import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  prizeEmoji?: string;
  prizeDescription?: string;
}

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
}

export function CampaignSelector({
  campaigns,
  selectedCampaignId,
  onCampaignChange,
}: CampaignSelectorProps) {
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <Select value={selectedCampaignId} onValueChange={onCampaignChange}>
      <SelectTrigger className="w-80" data-testid="select-campaign">
        <SelectValue>
          {selectedCampaign ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {selectedCampaign.prizeEmoji || "🏆"}
              </span>
              <span>{selectedCampaign.name}</span>
            </div>
          ) : (
            "Selecione uma campanha"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {campaigns.map((campaign) => (
          <SelectItem 
            key={campaign.id} 
            value={campaign.id}
            data-testid={`option-campaign-${campaign.id}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {campaign.prizeEmoji || "🏆"}
              </span>
              <div>
                <div>{campaign.name}</div>
                {campaign.prizeDescription && (
                  <div className="text-xs text-muted-foreground">
                    {campaign.prizeDescription}
                  </div>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
