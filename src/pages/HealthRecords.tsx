import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthRecord {
  id: string;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: string;
  notes: string;
  follow_up_date: string | null;
  created_at: string;
}

const HealthRecords = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [dateFrom, dateTo, records]);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get patient profile
      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        setRecords([]);
        setFilteredRecords([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("patient_id", profile.id)
        .order("visit_date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      setFilteredRecords(data || []);
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

  const filterRecords = () => {
    let filtered = [...records];

    if (dateFrom) {
      filtered = filtered.filter(
        (record) => new Date(record.visit_date) >= dateFrom
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (record) => new Date(record.visit_date) <= dateTo
      );
    }

    setFilteredRecords(filtered);
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Health Records</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
            <CardDescription>Filter by date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No health records found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Visit on {format(new Date(record.visit_date), "PPP")}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.created_at), "PP")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.symptoms && (
                    <div>
                      <h4 className="font-semibold mb-1">Symptoms</h4>
                      <p className="text-sm text-muted-foreground">{record.symptoms}</p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div>
                      <h4 className="font-semibold mb-1">Diagnosis</h4>
                      <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.prescriptions && (
                    <div>
                      <h4 className="font-semibold mb-1">Prescriptions</h4>
                      <p className="text-sm text-muted-foreground">{record.prescriptions}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <h4 className="font-semibold mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                  {record.follow_up_date && (
                    <div>
                      <h4 className="font-semibold mb-1">Follow-up Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.follow_up_date), "PPP")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
