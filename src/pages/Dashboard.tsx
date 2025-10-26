import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Baby, Plus, LogOut, User } from "lucide-react";
import ChildCard from "@/components/ChildCard";
import AddChildDialog from "@/components/AddChildDialog";
import VaccinationSchedule from "@/components/VaccinationSchedule";
import HealthAssistant from "@/components/HealthAssistant";
import FindDoctors from "@/components/FindDoctors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  place_of_birth: string | null;
  birth_health_issues: string[] | null;
}

const Dashboard = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchUserData();
    fetchChildren();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has parent role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role === "doctor") {
      navigate("/doctor-dashboard");
      return;
    }
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserName(profile.name);
      }
    }
  };

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleChildAdded = () => {
    fetchChildren();
    setShowAddChild(false);
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Baby className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">VacciTrack</h1>
              <p className="text-sm text-muted-foreground">Child Healthcare Management</p>
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
        {/* Children Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Children</h2>
              <p className="text-muted-foreground">Manage vaccination schedules for your children</p>
            </div>
            <Button onClick={() => setShowAddChild(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed">
              <Baby className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No children added yet</h3>
              <p className="text-muted-foreground mb-4">Add your child's profile to start tracking vaccinations</p>
              <Button onClick={() => setShowAddChild(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  isSelected={selectedChild?.id === child.id}
                  onClick={() => setSelectedChild(child)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Child Details Tabs */}
        {selectedChild && (
          <Tabs defaultValue="vaccinations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vaccinations">Vaccination Schedule</TabsTrigger>
              <TabsTrigger value="health">Health Assistant</TabsTrigger>
              <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
            </TabsList>

            <TabsContent value="vaccinations">
              <VaccinationSchedule child={selectedChild} />
            </TabsContent>

            <TabsContent value="health">
              <HealthAssistant child={selectedChild} />
            </TabsContent>

            <TabsContent value="doctors">
              <FindDoctors children={children} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AddChildDialog
        open={showAddChild}
        onOpenChange={setShowAddChild}
        onChildAdded={handleChildAdded}
      />
    </div>
  );
};

export default Dashboard;
