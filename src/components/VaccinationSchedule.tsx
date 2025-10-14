import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Calendar, Syringe, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface VaccinationRecord {
  id: string;
  is_completed: boolean;
  administered_date: string | null;
  schedule_id: string;
  vaccination_schedule: {
    vaccine_name: string;
    vaccine_code: string;
    purpose: string;
    age_weeks: number | null;
    age_months: number | null;
    age_years: number | null;
    is_optional: boolean;
  };
}

interface VaccinationScheduleProps {
  child: Child;
}

const VaccinationSchedule = ({ child }: VaccinationScheduleProps) => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVaccinationRecords();
  }, [child.id]);

  const fetchVaccinationRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("vaccination_records")
        .select(`
          *,
          vaccination_schedule (
            vaccine_name,
            vaccine_code,
            purpose,
            age_weeks,
            age_months,
            age_years,
            is_optional,
            sort_order
          )
        `)
        .eq("child_id", child.id)
        .order("vaccination_schedule(sort_order)");

      if (error) throw error;
      setRecords(data || []);
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

  const toggleVaccination = async (recordId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("vaccination_records")
        .update({
          is_completed: !currentStatus,
          administered_date: !currentStatus ? new Date().toISOString().split("T")[0] : null,
        })
        .eq("id", recordId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Vaccination marked complete" : "Vaccination unmarked",
        description: !currentStatus ? "Great! Keep up with the schedule." : "Status updated.",
      });

      fetchVaccinationRecords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAgeLabel = (record: VaccinationRecord) => {
    const schedule = record.vaccination_schedule;
    if (schedule.age_weeks) return `${schedule.age_weeks} weeks`;
    if (schedule.age_months) return `${schedule.age_months} months`;
    if (schedule.age_years) return `${schedule.age_years} years`;
    return "At birth";
  };

  const isDue = (record: VaccinationRecord) => {
    if (record.is_completed) return false;
    
    const birthDate = new Date(child.date_of_birth);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const schedule = record.vaccination_schedule;
    if (schedule.age_weeks) {
      return ageInDays >= schedule.age_weeks * 7;
    }
    if (schedule.age_months) {
      return ageInDays >= schedule.age_months * 30;
    }
    if (schedule.age_years) {
      return ageInDays >= schedule.age_years * 365;
    }
    return true; // At birth vaccines are immediately due
  };

  const groupByAge = () => {
    const groups: { [key: string]: VaccinationRecord[] } = {};
    records.forEach((record) => {
      const age = getAgeLabel(record);
      if (!groups[age]) groups[age] = [];
      groups[age].push(record);
    });
    return groups;
  };

  const completedCount = records.filter((r) => r.is_completed).length;
  const totalCount = records.length;
  const dueCount = records.filter((r) => isDue(r)).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedRecords = groupByAge();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-6 w-6 text-primary" />
            Vaccination Schedule for {child.name}
          </CardTitle>
          <CardDescription>
            Track all mandatory vaccines as per India's 2025 guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <AlertCircle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{dueCount}</p>
                <p className="text-sm text-muted-foreground">Due Now</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <Calendar className="h-8 w-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{totalCount - completedCount - dueCount}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Vaccines</TabsTrigger>
          <TabsTrigger value="due">Due Now</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {Object.entries(groupedRecords).map(([age, ageRecords]) => (
            <Card key={age}>
              <CardHeader>
                <CardTitle className="text-lg">{age}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ageRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                      record.is_completed ? "bg-success/5 border-success/20" : "bg-card hover:bg-muted/50"
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVaccination(record.id, record.is_completed)}
                      className={cn(
                        "shrink-0",
                        record.is_completed && "text-success"
                      )}
                    >
                      {record.is_completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{record.vaccination_schedule.vaccine_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.vaccination_schedule.purpose}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {record.vaccination_schedule.is_optional && (
                            <Badge variant="outline">Optional</Badge>
                          )}
                          {isDue(record) && !record.is_completed && (
                            <Badge variant="default" className="bg-warning">Due Now</Badge>
                          )}
                          {record.is_completed && (
                            <Badge variant="default" className="bg-success">Done</Badge>
                          )}
                        </div>
                      </div>
                      {record.administered_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Administered on: {new Date(record.administered_date).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="due" className="space-y-3 mt-6">
          {records.filter((r) => isDue(r)).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto text-success mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No vaccinations are due at this time.</p>
              </CardContent>
            </Card>
          ) : (
            records
              .filter((r) => isDue(r))
              .map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVaccination(record.id, record.is_completed)}
                      >
                        <Circle className="h-6 w-6" />
                      </Button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{record.vaccination_schedule.vaccine_name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.vaccination_schedule.purpose}
                            </p>
                            <Badge variant="outline" className="mt-2">{getAgeLabel(record)}</Badge>
                          </div>
                          <Badge variant="default" className="bg-warning">Due Now</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-6">
          {records.filter((r) => r.is_completed).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Syringe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No completed vaccinations yet</h3>
                <p className="text-muted-foreground">Start marking vaccinations as complete to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            records
              .filter((r) => r.is_completed)
              .map((record) => (
                <Card key={record.id} className="bg-success/5 border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVaccination(record.id, record.is_completed)}
                        className="text-success"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                      </Button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{record.vaccination_schedule.vaccine_name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.vaccination_schedule.purpose}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{getAgeLabel(record)}</Badge>
                              {record.administered_date && (
                                <Badge variant="outline">
                                  {new Date(record.administered_date).toLocaleDateString("en-IN")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="default" className="bg-success">Done</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VaccinationSchedule;
