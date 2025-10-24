import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2, AlertCircle, Stethoscope, Download, Pill, Calendar, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import AddMedicationDialog from "./AddMedicationDialog";
import jsPDF from "jspdf";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  birth_health_issues: string[] | null;
}

interface Medication {
  id: string;
  health_issue: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_name: string;
  doctor_contact: string | null;
  prescribed_date: string;
  notes: string | null;
  created_at: string;
}

interface HealthAssistantProps {
  child: Child;
}

const HealthAssistant = ({ child }: HealthAssistantProps) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const { toast } = useToast();

  const hasHealthIssues = child.birth_health_issues && child.birth_health_issues.length > 0;

  useEffect(() => {
    fetchMedications();
  }, [child.id]);

  const fetchMedications = async () => {
    setLoadingMedications(true);
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("child_id", child.id)
        .order("prescribed_date", { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error("Error fetching medications:", error);
      toast({
        title: "Error",
        description: "Failed to load medication history",
        variant: "destructive",
      });
    } finally {
      setLoadingMedications(false);
    }
  };

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

  const generatePrescriptionPDF = (medication: Medication) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Prescription", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });
    
    // Patient Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 20, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${child.name}`, 20, 55);
    doc.text(`Date of Birth: ${new Date(child.date_of_birth).toLocaleDateString()}`, 20, 62);
    doc.text(`Gender: ${child.gender}`, 20, 69);
    
    const age = calculateAge(child.date_of_birth);
    doc.text(`Age: ${age}`, 20, 76);
    
    // Doctor Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed By", 20, 95);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Doctor: ${medication.doctor_name}`, 20, 105);
    if (medication.doctor_contact) {
      doc.text(`Contact: ${medication.doctor_contact}`, 20, 112);
    }
    doc.text(`Date: ${new Date(medication.prescribed_date).toLocaleDateString()}`, 20, 119);
    
    // Prescription Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prescription Details", 20, 138);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Health Issue: ${medication.health_issue}`, 20, 148);
    doc.text(`Medicine: ${medication.medicine_name}`, 20, 155);
    doc.text(`Dosage: ${medication.dosage}`, 20, 162);
    doc.text(`Frequency: ${medication.frequency}`, 20, 169);
    doc.text(`Duration: ${medication.duration}`, 20, 176);
    
    if (medication.notes) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Additional Notes", 20, 195);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(medication.notes, 170);
      doc.text(splitNotes, 20, 205);
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer-generated prescription record.", 105, 280, { align: "center" });
    doc.text("VacciTrack - Ensuring healthy futures", 105, 285, { align: "center" });
    
    // Save the PDF
    doc.save(`prescription-${child.name}-${medication.prescribed_date}.pdf`);
    
    toast({
      title: "Success",
      description: "Prescription downloaded successfully",
    });
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
          </CardContent>
        </Card>
      )}

      {/* Medication History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Medication History
          </CardTitle>
          <CardDescription>
            Track all prescribed medications and doctor consultations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddMedicationDialog childId={child.id} onMedicationAdded={fetchMedications} />

          {loadingMedications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No medication records yet</p>
              <p className="text-sm">Add your first prescription above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((medication) => (
                <Card key={medication.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{medication.medicine_name}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {medication.health_issue}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePrescriptionPDF(medication)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Pill className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Dosage & Frequency</p>
                            <p className="text-sm text-muted-foreground">
                              {medication.dosage} - {medication.frequency}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{medication.duration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Prescribed By</p>
                            <p className="text-sm text-muted-foreground">{medication.doctor_name}</p>
                            {medication.doctor_contact && (
                              <p className="text-xs text-muted-foreground">{medication.doctor_contact}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Prescribed Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(medication.prescribed_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {medication.notes && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-sm font-medium mb-1">Additional Notes</p>
                          <p className="text-sm text-muted-foreground">{medication.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Coming Soon:</strong> Direct consultation booking with verified pediatricians 
              and e-prescriptions automatically integrated with your child's health profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthAssistant;
