
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { startOfWeek } from "date-fns";
import type { DateRange } from "react-day-picker";
import { FileText } from "lucide-react";
import { StatsCards } from "@/components/reports/StatsCards";
import { CompletionTrends } from "@/components/reports/CompletionTrends";
import { useReportsData } from "@/hooks/useReportsData";

export default function Reports() {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [date, setDate] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: new Date()
  });

  const { stats, timeRangeData, familyMembers } = useReportsData(user?.id, date, selectedMember);

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Exporting PDF...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reports & Insights</h1>
            <p className="text-muted-foreground">
              Track chore completion and family engagement
            </p>
          </div>
          <Button onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <StatsCards stats={stats} date={date} />
        
        <CompletionTrends
          timeRangeData={timeRangeData}
          date={date}
          setDate={setDate}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          familyMembers={familyMembers}
        />
      </div>
    </DashboardLayout>
  );
}
