import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  place_of_birth: string | null;
  birth_health_issues: string[] | null;
}

interface ChildCardProps {
  child: Child;
  isSelected: boolean;
  onClick: () => void;
}

const ChildCard = ({ child, isSelected, onClick }: ChildCardProps) => {
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  const hasHealthIssues = child.birth_health_issues && child.birth_health_issues.length > 0;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4 cursor-pointer" onClick={onClick}>
          <div className={cn(
            "p-3 rounded-full",
            child.gender === "Male" ? "bg-primary/10" : child.gender === "Female" ? "bg-secondary/10" : "bg-accent/10"
          )}>
            <Baby className={cn(
              "h-6 w-6",
              child.gender === "Male" ? "text-primary" : child.gender === "Female" ? "text-secondary" : "text-accent"
            )} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{child.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>{calculateAge(child.date_of_birth)}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{child.gender}</Badge>
              {hasHealthIssues && (
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  Has health notes
                </Badge>
              )}
            </div>
          </div>
        </div>

        {hasHealthIssues && (
          <Collapsible open={isHealthOpen} onOpenChange={setIsHealthOpen} className="mt-4">
            <CollapsibleTrigger 
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-muted/50 rounded-md transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Birth Health Issues</span>
              {isHealthOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-3">
              <div className="flex flex-wrap gap-2">
                {child.birth_health_issues.map((issue, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {issue}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildCard;
