import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildAdded: () => void;
}

const healthIssues = [
  "Low birth weight",
  "Premature birth",
  "Jaundice",
  "Respiratory issues",
  "Heart conditions",
  "Infections at birth",
  "Other complications",
  "None",
];

const AddChildDialog = ({ open, onOpenChange, onChildAdded }: AddChildDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    place_of_birth: "",
    birth_health_issues: [] as string[],
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("children").insert({
        parent_id: user.id,
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        place_of_birth: formData.place_of_birth || null,
        birth_health_issues: formData.birth_health_issues.length > 0 ? formData.birth_health_issues : null,
      });

      if (error) throw error;

      toast({
        title: "Child added successfully!",
        description: "Vaccination records have been created automatically.",
      });

      setFormData({
        name: "",
        date_of_birth: "",
        gender: "",
        place_of_birth: "",
        birth_health_issues: [],
      });

      onChildAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHealthIssue = (issue: string) => {
    setFormData((prev) => {
      const issues = prev.birth_health_issues.includes(issue)
        ? prev.birth_health_issues.filter((i) => i !== issue)
        : [...prev.birth_health_issues, issue];
      return { ...prev, birth_health_issues: issues };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Child Profile</DialogTitle>
          <DialogDescription>
            Enter your child's details to start tracking their vaccination schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Child's Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Place of Birth</Label>
            <Input
              id="place"
              value={formData.place_of_birth}
              onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
              placeholder="City, Hospital"
            />
          </div>

          <div className="space-y-3">
            <Label>Birth Health Issues (if any)</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {healthIssues.map((issue) => (
                <div key={issue} className="flex items-center space-x-2">
                  <Checkbox
                    id={issue}
                    checked={formData.birth_health_issues.includes(issue)}
                    onCheckedChange={() => toggleHealthIssue(issue)}
                  />
                  <label
                    htmlFor={issue}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {issue}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Child"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;
