import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Baby, Shield, Calendar, Heart, User, Stethoscope } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [healthIssue, setHealthIssue] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleData?.role === "admin") {
          navigate("/admin-dashboard");
        } else if (roleData?.role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (roleData?.role === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkAuthAndRedirect();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleData?.role === "admin") {
          navigate("/admin-dashboard");
        } else if (roleData?.role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (roleData?.role === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              location,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            name,
            email,
            phone,
            location,
          });

          if (profileError) throw profileError;

          // Create user role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: role,
          });

          if (roleError) throw roleError;

          // If patient, create patient profile
          if (role === "patient") {
            const { error: patientError } = await supabase.from("patient_profiles").insert({
              user_id: data.user.id,
              name: name.trim(),
              age: parseInt(age),
              sex: sex,
              location: location.trim(),
              health_issue: healthIssue.trim(),
            });

            if (patientError) throw patientError;
          }

          // If doctor, create temporary doctor profile (pending approval)
          if (role === "doctor") {
            const { error: doctorError } = await supabase.from("doctor_profiles_temp").insert({
              user_id: data.user.id,
              name: name.trim(),
              age: parseInt(age),
              sex: sex,
              specialization: specialization.trim(),
              qualification: qualification.trim(),
              experience_years: parseInt(experienceYears),
              consultation_fees: 0,
              contact_phone: phone.trim(),
              status: 'pending',
            });

            if (doctorError) throw doctorError;
          }

          toast({
            title: "Account created!",
            description: role === "doctor" 
              ? "Your application has been submitted for admin approval. You'll be notified once approved."
              : role === "patient"
              ? "Welcome to VacciTrack! You can now search for doctors and book appointments."
              : "Welcome to VacciTrack!",
          });
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl">
              <Baby className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary">VacciTrack</h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your trusted companion for child healthcare and vaccination management in India
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Complete Vaccination Schedule</h3>
                <p className="text-muted-foreground">Track all mandatory vaccines based on India's 2025 guidelines</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Smart Reminders</h3>
                <p className="text-muted-foreground">Never miss a vaccination date with automated alerts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Health Records</h3>
                <p className="text-muted-foreground">Maintain complete health history for your child</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to manage your child's vaccinations"
                : "Start tracking your child's health journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          role === "patient"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-center">
                          <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="font-semibold text-sm">Patient</p>
                          <p className="text-xs text-muted-foreground">Seeking Healthcare</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          role === "doctor"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-center">
                          <Stethoscope className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="font-semibold text-sm">Doctor</p>
                          <p className="text-xs text-muted-foreground">Medical Professional</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required={!isLogin}
                        min="1"
                        max="150"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex</Label>
                      <Select value={sex} onValueChange={(v: any) => setSex(v)} required>
                        <SelectTrigger id="sex">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {role === "patient" && (
                    <div className="space-y-2">
                      <Label htmlFor="healthIssue">Health Issue / Concern</Label>
                      <Input
                        id="healthIssue"
                        type="text"
                        placeholder="Describe your health concern"
                        value={healthIssue}
                        onChange={(e) => setHealthIssue(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {role === "doctor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Select value={specialization} onValueChange={setSpecialization} required>
                          <SelectTrigger id="specialization">
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pediatrician">Pediatrician (Child Specialist)</SelectItem>
                            <SelectItem value="General Medicine">General Medicine</SelectItem>
                            <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                            <SelectItem value="Psychologist">Psychologist</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qualification">Qualification</Label>
                        <Input
                          id="qualification"
                          type="text"
                          placeholder="e.g., MBBS, MD"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience (Years)</Label>
                        <Input
                          id="experience"
                          type="number"
                          placeholder="Years of experience"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          required={!isLogin}
                          min="0"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
