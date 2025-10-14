import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
}

interface ChildCardProps {
  child: Child;
  isSelected: boolean;
  onClick: () => void;
}

const ChildCard = ({ child, isSelected, onClick }: ChildCardProps) => {
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

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
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
            <Badge variant="outline">{child.gender}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
