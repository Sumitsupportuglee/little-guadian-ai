import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MapPin, Briefcase, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  location: string;
  consultation_fee: number | null;
  profiles: {
    name: string;
  };
}

interface Availability {
  id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface Child {
  id: string;
  name: string;
}

interface FindDoctorsProps {
  children: Child[];
}

const FindDoctors = ({ children }: FindDoctorsProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [bookingForSelf, setBookingForSelf] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;
    
    if (locationFilter.trim() !== "") {
      filtered = filtered.filter((doc) =>
        doc.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    if (specializationFilter !== "") {
      filtered = filtered.filter((doc) =>
        doc.specialization === specializationFilter
      );
    }
    
    setFilteredDoctors(filtered);
  }, [locationFilter, specializationFilter, doctors]);

  const fetchDoctors = async () => {
    const { data: doctorsData, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!doctorsData) return;

    // Fetch profile names for each doctor
    const doctorsWithProfiles = await Promise.all(
      doctorsData.map(async (doctor) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", doctor.user_id)
          .single();

        return {
          ...doctor,
          profiles: { name: profile?.name || "Unknown" }
        };
      })
    );

    setDoctors(doctorsWithProfiles);
    setFilteredDoctors(doctorsWithProfiles);
  };

  const fetchDoctorAvailability = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("is_booked", false)
      .gte("available_date", format(new Date(), "yyyy-MM-dd"))
      .order("available_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAvailabilities(data || []);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorAvailability(doctor.id);
    setSelectedChild("");
    setBookingForSelf(false);
    setSelectedSlot("");
  };

  const handleBookAppointment = async () => {
    if ((!bookingForSelf && !selectedChild) || !selectedSlot || !selectedDoctor) {
      toast({
        title: "Missing Information",
        description: bookingForSelf 
          ? "Please select an appointment slot." 
          : "Please select a child and an appointment slot.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const slot = availabilities.find((a) => a.id === selectedSlot);
    if (!slot) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        doctor_id: selectedDoctor.id,
        parent_id: user.id,
        child_id: bookingForSelf ? null : selectedChild,
        availability_id: slot.id,
        appointment_date: slot.available_date,
        appointment_time: slot.start_time,
        status: "pending",
        is_self_booking: bookingForSelf,
      });

    if (appointmentError) {
      toast({
        title: "Error",
        description: appointmentError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("doctor_availability")
      .update({ is_booked: true })
      .eq("id", slot.id);

    if (updateError) {
      toast({
        title: "Error",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
      setSelectedDoctor(null);
      setSelectedChild("");
      setBookingForSelf(false);
      setSelectedSlot("");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Doctors & Specialists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={specializationFilter || undefined}
                onValueChange={(value) => setSpecializationFilter(value)}
              >
                <SelectTrigger id="specialization">
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                  <SelectItem value="Psychologist">Psychologist</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter city or state..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{doctor.profiles.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.specialization}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {doctor.qualification}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.location}</span>
              </div>
              <div className="text-sm">
                Experience: {doctor.experience_years} years
              </div>
              {doctor.consultation_fee && (
                <div className="text-sm font-medium">
                  Fee: ₹{doctor.consultation_fee}
                </div>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Book Appointment with {doctor.profiles.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Booking For</Label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setBookingForSelf(true)}
                          className={`flex-1 p-3 border rounded-lg text-left transition-all ${
                            bookingForSelf
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium">Myself</p>
                          <p className="text-sm text-muted-foreground">Book for self</p>
                        </button>
                        {children.length > 0 && (
                          <button
                            onClick={() => setBookingForSelf(false)}
                            className={`flex-1 p-3 border rounded-lg text-left transition-all ${
                              !bookingForSelf
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <p className="font-medium">My Child</p>
                            <p className="text-sm text-muted-foreground">Book for child</p>
                          </button>
                        )}
                      </div>
                    </div>

                    {!bookingForSelf && children.length > 0 && (
                      <div className="space-y-2">
                        <Label>Select Child</Label>
                        <Select
                          value={selectedChild}
                          onValueChange={setSelectedChild}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a child" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>
                                {child.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                        <div className="space-y-2">
                          <Label>Available Slots</Label>
                          {availabilities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No available slots at the moment
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {availabilities.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                                    selectedSlot === slot.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">
                                        {format(
                                          new Date(slot.available_date),
                                          "PPP"
                                        )}
                                      </p>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                          {slot.start_time} - {slot.end_time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                    {availabilities.length > 0 && (
                      <Button
                        onClick={handleBookAppointment}
                        disabled={loading || (!bookingForSelf && !selectedChild) || !selectedSlot}
                        className="w-full"
                      >
                        Confirm Booking
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {locationFilter
              ? "No doctors found in this location"
              : "No doctors available"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FindDoctors;
