import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, LogOut, User, Calendar, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorAvailability from "@/components/DoctorAvailability";

interface Doctor {
  id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number | null;
  location: string;
  bio: string | null;
}

interface Patient {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
}

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has doctor role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "doctor") {
        navigate("/dashboard");
        return;
      }

      await fetchDoctorData(session.user.id);
      await fetchPatients();
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

  const fetchDoctorData = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserName(profile.name);
    }

    const { data: doctor } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (doctor) {
      setDoctorProfile(doctor);
    }
  };

  const fetchPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (doctor) {
      const { data: allocatedPatients } = await supabase
        .from("doctor_patients")
        .select("child_id, children(id, name, date_of_birth, gender)")
        .eq("doctor_id", doctor.id);

      if (allocatedPatients) {
        const patientList = allocatedPatients
          .map((ap: any) => ap.children)
          .filter(Boolean);
        setPatients(patientList);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">VacciTrack</h1>
              <p className="text-sm text-muted-foreground">Doctor Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{userName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {doctorProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{doctorProfile.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium">{doctorProfile.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{doctorProfile.experience_years} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{doctorProfile.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patients">
              <Users className="h-4 w-4 mr-2" />
              My Patients
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="h-4 w-4 mr-2" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Allocated Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No patients allocated yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div key={patient.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Gender: </span>
                            <span className="capitalize">{patient.gender}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">DOB: </span>
                            <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            {doctorProfile && <DoctorAvailability doctorId={doctorProfile.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
