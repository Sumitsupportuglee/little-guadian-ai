import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Baby, Plus, LogOut, User, Stethoscope, Calendar, Shield, Heart, FileText, Pill, UserPlus } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"home" | "children" | "doctors" | "vaccinations" | "health">("home");
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">VacciTrack</h1>
              <p className="text-sm text-muted-foreground">Healthcare Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
              <User className="h-4 w-4 text-cyan-600" />
              <span className="font-medium">{userName}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {activeView === "home" && (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="text-center space-y-2 py-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Welcome back, {userName}!
              </h2>
              <p className="text-muted-foreground text-lg">
                What would you like to do today?
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* My Children Card */}
              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setActiveView("children")}
              >
                <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Baby className="h-12 w-12 md:h-16 md:w-16 text-cyan-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-center text-gray-800">My Children</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center mt-1">Manage profiles</p>
              </Card>

              {/* Find Doctors Card */}
              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setActiveView("doctors")}
              >
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="h-12 w-12 md:h-16 md:w-16 text-blue-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-center text-gray-800">Find Doctors</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center mt-1">Book appointment</p>
              </Card>

              {/* Vaccinations Card */}
              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setActiveView("vaccinations")}
              >
                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 text-indigo-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-center text-gray-800">Vaccinations</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center mt-1">Track schedule</p>
              </Card>

              {/* Health Assistant Card */}
              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setActiveView("health")}
              >
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-12 w-12 md:h-16 md:w-16 text-pink-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-center text-gray-800">Health AI</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center mt-1">Get assistance</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setShowAddChild(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl">
                    <UserPlus className="h-8 w-8 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Add New Child Profile</h3>
                    <p className="text-sm text-muted-foreground">Register your child for vaccination tracking</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => setActiveView("doctors")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Book Appointment</h3>
                    <p className="text-sm text-muted-foreground">Schedule consultation with specialists</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Children View */}
        {activeView === "children" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">Your Children</h2>
                <p className="text-muted-foreground">Manage your children's profiles</p>
              </div>
              <Button 
                onClick={() => setShowAddChild(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </div>

            {children.length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 shadow-lg">
                <Baby className="h-16 w-16 mx-auto text-cyan-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No children added yet</h3>
                <p className="text-muted-foreground mb-4">Add your child's profile to start tracking vaccinations</p>
                <Button 
                  onClick={() => setShowAddChild(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </Button>
              </Card>
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
        )}

        {/* Doctors View */}
        {activeView === "doctors" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Find Doctors</h2>
                <p className="text-muted-foreground">Book appointments with specialists</p>
              </div>
            </div>
            <FindDoctors children={children} />
          </div>
        )}

        {/* Vaccinations View */}
        {activeView === "vaccinations" && selectedChild && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Vaccination Schedule</h2>
                <p className="text-muted-foreground">Track immunization records for {selectedChild.name}</p>
              </div>
            </div>
            <VaccinationSchedule child={selectedChild} />
          </div>
        )}

        {/* Vaccinations View - No Child Selected */}
        {activeView === "vaccinations" && !selectedChild && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Vaccination Schedule</h2>
                <p className="text-muted-foreground">Track immunization records</p>
              </div>
            </div>
            <Card className="p-12 text-center bg-white border-0 shadow-lg">
              <Baby className="h-16 w-16 mx-auto text-cyan-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No child selected</h3>
              <p className="text-muted-foreground mb-4">Please add a child profile first to view vaccination schedules</p>
              <Button 
                onClick={() => setActiveView("children")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Go to Children
              </Button>
            </Card>
          </div>
        )}

        {/* Health Assistant View */}
        {activeView === "health" && selectedChild && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Health Assistant</h2>
                <p className="text-muted-foreground">AI-powered health recommendations for {selectedChild.name}</p>
              </div>
            </div>
            <HealthAssistant child={selectedChild} />
          </div>
        )}

        {/* Health Assistant View - No Child Selected */}
        {activeView === "health" && !selectedChild && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView("home")}
                className="hover:bg-white"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Health Assistant</h2>
                <p className="text-muted-foreground">AI-powered health recommendations</p>
              </div>
            </div>
            <Card className="p-12 text-center bg-white border-0 shadow-lg">
              <Heart className="h-16 w-16 mx-auto text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No child selected</h3>
              <p className="text-muted-foreground mb-4">Please add a child profile first to use the health assistant</p>
              <Button 
                onClick={() => setActiveView("children")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Go to Children
              </Button>
            </Card>
          </div>
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
