import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Baby, Shield, Calendar, Heart, Bell, Activity, Users, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-xl shadow-lg">
                <Baby className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VacciTrack
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Complete Child Healthcare &<br />
              <span className="text-primary">Vaccination Management</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track vaccinations, monitor health milestones, and ensure your child's wellness with India's most comprehensive child healthcare platform
            </p>

            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
                Sign In
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-primary mb-2">31</div>
              <p className="text-muted-foreground">Mandatory Vaccines</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-secondary mb-2">100%</div>
              <p className="text-muted-foreground">India 2025 Compliant</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-accent mb-2">24/7</div>
              <p className="text-muted-foreground">Health Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Everything You Need for Your Child's Health</h3>
            <p className="text-xl text-muted-foreground">
              Comprehensive tools designed for modern Indian parents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Complete Vaccine Schedule</h4>
              <p className="text-muted-foreground">
                Track all 31 mandatory vaccines from birth to 5 years as per India's 2025 guidelines
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                <Bell className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Smart Reminders</h4>
              <p className="text-muted-foreground">
                Never miss a vaccination with automated SMS, email, and push notifications
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <Activity className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Health Monitoring</h4>
              <p className="text-muted-foreground">
                Track growth milestones, symptoms, and overall health progress
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Digital Records</h4>
              <p className="text-muted-foreground">
                Maintain complete vaccination history and download certificates anytime
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Expert Network</h4>
              <p className="text-muted-foreground">
                Connect with verified pediatricians and healthcare specialists
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI Health Assistant</h4>
              <p className="text-muted-foreground">
                Get personalized health advice and symptom analysis powered by AI
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Milestone Tracking</h4>
              <p className="text-muted-foreground">
                Monitor developmental milestones with WHO-standard guidelines
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Emergency SOS</h4>
              <p className="text-muted-foreground">
                Quick access to emergency contacts and instant health alerts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-2xl p-12 text-center text-primary-foreground">
          <h3 className="text-3xl font-bold mb-4">
            Start Your Child's Health Journey Today
          </h3>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of parents who trust VacciTrack for their child's healthcare
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Baby className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">VacciTrack</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 VacciTrack. Ensuring healthy futures for India's children.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <button className="hover:text-primary">Privacy</button>
              <button className="hover:text-primary">Terms</button>
              <button className="hover:text-primary">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
