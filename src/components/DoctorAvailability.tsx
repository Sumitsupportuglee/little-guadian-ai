import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Availability {
  id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface DoctorAvailabilityProps {
  doctorId: string;
}

const DoctorAvailability = ({ doctorId }: DoctorAvailabilityProps) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailabilities();
  }, [doctorId]);

  const fetchAvailabilities = async () => {
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId)
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

  const handleAddAvailability = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and enter start and end times.",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("doctor_availability").insert({
      doctor_id: doctorId,
      available_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Availability slot added successfully.",
      });
      setSelectedDate(undefined);
      setStartTime("");
      setEndTime("");
      fetchAvailabilities();
    }

    setLoading(false);
  };

  const handleDeleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from("doctor_availability")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Availability slot removed.",
      });
      fetchAvailabilities();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Availability Slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddAvailability}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Availability Slot
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {availabilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No availability slots added yet
            </div>
          ) : (
            <div className="space-y-3">
              {availabilities.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(slot.available_date), "PPP")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {slot.start_time} - {slot.end_time}
                    </p>
                    {slot.is_booked && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                        Booked
                      </span>
                    )}
                  </div>
                  {!slot.is_booked && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAvailability(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAvailability;
