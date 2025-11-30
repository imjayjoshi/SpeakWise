import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminUserAPI } from "@/lib/api";
import { exportToExcel, exportToCSV, formatDateForExport } from "@/lib/exportUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Users, Target, Loader2, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await adminUserAPI.getDashboardStats();
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleExportUserActivity = () => {
    if (!statistics) return;
    
    try {
      const data = [
        { Metric: "Total Users", Value: statistics.totalUsers },
        { Metric: "Active Users", Value: statistics.activeUsers },
        { Metric: "New Users (Last 30 Days)", Value: statistics.newUsersLast30Days || 0 },
        { Metric: "Total Practices", Value: statistics.totalPractices },
        { Metric: "Average Practices per User", Value: Math.round(statistics.totalPractices / statistics.totalUsers) },
      ];
      
      exportToExcel(data, `User_Activity_Report_${new Date().toISOString().split('T')[0]}`, 'User Activity');
      toast.success("User activity report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleExportPerformance = () => {
    if (!statistics) return;
    
    try {
      const data = [
        { Metric: "Average Pronunciation Score", Value: `${statistics.avgPronunciationScore}%` },
        { Metric: "Total Phrases", Value: statistics.totalPhrases },
        { Metric: "Total Practice Sessions", Value: statistics.totalPractices },
        { Metric: "Active Learners", Value: statistics.activeUsers },
      ];
      
      exportToExcel(data, `Performance_Analytics_${new Date().toISOString().split('T')[0]}`, 'Performance');
      toast.success("Performance analytics exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleExportLearningProgress = () => {
    if (!statistics || !statistics.phrasesByLevel) return;
    
    try {
      const data = statistics.phrasesByLevel.map((item: any) => ({
        Level: item.level,
        "Total Phrases": item.count,
        "Percentage": `${Math.round((item.count / statistics.totalPhrases) * 100)}%`,
      }));
      
      exportToExcel(data, `Learning_Progress_${new Date().toISOString().split('T')[0]}`, 'Progress');
      toast.success("Learning progress report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const insights = [
    { 
      label: "Total Users", 
      value: statistics?.totalUsers || 0, 
      trend: "+8%" 
    },
    { 
      label: "Active Learners", 
      value: statistics?.activeUsers || 0, 
      trend: "+12%" 
    },
    { 
      label: "Avg Score", 
      value: `${statistics?.avgPronunciationScore || 0}%`, 
      trend: "+5%" 
    },
    { 
      label: "Total Practices", 
      value: statistics?.totalPractices || 0, 
      trend: "+15%" 
    },
  ];

  const reports = [
    {
      title: "User Activity Report",
      description: "Total users, active users, and engagement metrics",
      date: "Real-time data",
      status: "Ready",
      icon: Users,
      exportHandler: handleExportUserActivity,
    },
    {
      title: "Performance Analytics",
      description: "Average pronunciation scores and practice statistics",
      date: "Real-time data",
      status: "Ready",
      icon: TrendingUp,
      exportHandler: handleExportPerformance,
    },
    {
      title: "Learning Progress",
      description: "Phrase distribution by difficulty level",
      date: "Real-time data",
      status: "Ready",
      icon: Target,
      exportHandler: handleExportLearningProgress,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Track performance and user insights with real-time data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStatistics}>
            <Calendar className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, idx) => (
          <Card key={idx} className="shadow-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{insight.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-foreground">
                    {insight.value}
                  </p>
                  <Badge variant="secondary" className="text-success">
                    {insight.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Download detailed analytics and performance reports (Excel format)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, idx) => {
              const Icon = report.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {report.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {report.date}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={report.exportHandler}>
                    <Download className="w-4 h-4" />
                    Export Excel
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Phrase Distribution */}
      {statistics?.phrasesByLevel && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Phrase Distribution by Level</CardTitle>
            <CardDescription>
              Breakdown of phrases across difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.phrasesByLevel.map((item: any) => (
                <div key={item.level} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {item.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {item.count} phrases
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {Math.round((item.count / statistics.totalPhrases) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;
