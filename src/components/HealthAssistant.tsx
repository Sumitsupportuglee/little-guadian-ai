import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2, AlertCircle, Stethoscope } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  birth_health_issues: string[] | null;
}

interface HealthAssistantProps {
  child: Child;
}

const HealthAssistant = ({ child }: HealthAssistantProps) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>("");
  const { toast } = useToast();

  const hasHealthIssues = child.birth_health_issues && child.birth_health_issues.length > 0;

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} years ${months} months old` : `${years} years old`;
    }
  };

  const fetchRecommendations = async () => {
    if (!hasHealthIssues) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-recommendations", {
        body: {
          healthIssues: child.birth_health_issues,
          childName: child.name,
          age: calculateAge(child.date_of_birth),
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRecommendations(data.recommendations);
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch health recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasHealthIssues) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-success mb-4" />
          <h3 className="text-xl font-semibold mb-2">Healthy Start!</h3>
          <p className="text-muted-foreground">
            No birth health issues recorded for {child.name}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Health Assistant for {child.name}
          </CardTitle>
          <CardDescription>
            AI-powered health recommendations based on birth health issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Recorded Birth Health Issues:</h4>
              <div className="flex flex-wrap gap-2">
                {child.birth_health_issues.map((issue, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>

            {!recommendations && (
              <Button 
                onClick={fetchRecommendations} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Health Issues...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Get AI Health Recommendations
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Personalized Health Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> These are general recommendations. Always consult with your pediatrician 
                for diagnosis and treatment. Future updates will integrate doctor consultations and medication tracking.
              </AlertDescription>
            </Alert>

            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">{recommendations}</div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={fetchRecommendations} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh Recommendations"
                )}
              </Button>
            </div>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Coming Soon:</strong> Direct consultation booking with verified pediatricians, 
                e-prescriptions, and automated medication tracking integrated with your child's health profile.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthAssistant;
