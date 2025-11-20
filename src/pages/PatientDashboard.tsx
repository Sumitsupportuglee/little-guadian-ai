import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Stethoscope, Calendar } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  qualification: string;
  consultation_fee: number;
  contact_phone: string;
}

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("status", "active")
        .order("experience_years", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      setFilteredDoctors(data || []);
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

  const filterDoctors = () => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialization.toLowerCase().includes(term) ||
        doctor.qualification.toLowerCase().includes(term)
    );
    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctorId: string) => {
    toast({
      title: "Appointment Booking",
      description: "This feature will be implemented to book appointments.",
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Doctors</CardTitle>
            <CardDescription>
              Search by name, specialization, or health issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={filterDoctors}>Search</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredDoctors.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-6 text-center text-muted-foreground">
                No doctors found matching your search
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Dr. {doctor.name}
                      </CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                    </div>
                    <Badge>{doctor.experience_years} years exp</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Qualification:</span>{" "}
                      {doctor.qualification}
                    </div>
                    <div>
                      <span className="font-semibold">Consultation Fee:</span> ₹
                      {doctor.consultation_fee}
                    </div>
                    <div>
                      <span className="font-semibold">Contact:</span> {doctor.contact_phone}
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
