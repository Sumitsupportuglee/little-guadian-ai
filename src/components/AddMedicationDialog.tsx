import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface AddMedicationDialogProps {
  childId: string;
  onMedicationAdded: () => void;
}

const AddMedicationDialog = ({ childId, onMedicationAdded }: AddMedicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    healthIssue: "",
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    doctorName: "",
    doctorContact: "",
    prescribedDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("medications").insert({
        child_id: childId,
        health_issue: formData.healthIssue,
        medicine_name: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        doctor_name: formData.doctorName,
        doctor_contact: formData.doctorContact || null,
        prescribed_date: formData.prescribedDate,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication record added successfully",
      });

      setFormData({
        healthIssue: "",
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        doctorName: "",
        doctorContact: "",
        prescribedDate: "",
        notes: "",
      });
      setOpen(false);
      onMedicationAdded();
    } catch (error: any) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add medication record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medication Record</DialogTitle>
          <DialogDescription>
            Record prescription details from your doctor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="healthIssue">Health Issue *</Label>
              <Input
                id="healthIssue"
                value={formData.healthIssue}
                onChange={(e) => setFormData({ ...formData, healthIssue: e.target.value })}
                required
                placeholder="e.g., Fever, Asthma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicineName">Medicine Name *</Label>
              <Input
                id="medicineName"
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                required
                placeholder="e.g., Paracetamol"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
                placeholder="e.g., 250mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
                placeholder="e.g., Twice daily"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                placeholder="e.g., 7 days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescribedDate">Prescribed Date *</Label>
              <Input
                id="prescribedDate"
                type="date"
                value={formData.prescribedDate}
                onChange={(e) => setFormData({ ...formData, prescribedDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name *</Label>
              <Input
                id="doctorName"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                required
                placeholder="Dr. Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorContact">Doctor Contact</Label>
              <Input
                id="doctorContact"
                value={formData.doctorContact}
                onChange={(e) => setFormData({ ...formData, doctorContact: e.target.value })}
                placeholder="+91-XXXXXXXXXX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or notes..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Medication"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationDialog;
