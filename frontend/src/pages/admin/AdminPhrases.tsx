import { useState, useEffect } from "react";
import { toast } from "sonner";
import { phraseAPI, Phrase } from "@/lib/api";
import axios from "axios";
import { exportToExcel } from "@/lib/exportUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPhrases = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);

  const [formData, setFormData] = useState({
    text: "",
    meaning: "",
    example: "",
    language: "English" as "English" | "Japanese",
    level: "beginner" as "beginner" | "intermediate" | "expert",
    audioUrl: "",
    audioMeaningUrl: "",
  });

  // Fetch all phrases
  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const response = await phraseAPI.getAllPhrases();
      setPhrases(response.data.phrases || []);
    } catch (error) {
      console.error("Error fetching phrases:", error);
      toast.error("Failed to load phrases");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPhrase = async () => {
    if (!formData.text.trim()) {
      toast.error("Please enter a phrase");
      return;
    }

    if (!formData.level) {
      toast.error("Please select a level");
      return;
    }

    try {
      const response = await phraseAPI.addPhrase(formData);
      setPhrases((prev) => [response.data.phrase, ...prev]);
      toast.success("Phrase added successfully!");
      closeDialog();
    } catch (error) {
      console.error("Error adding phrase:", error);
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || "Failed to add phrase"
        : "Failed to add phrase";
      toast.error(message);
    }
  };

  const handleEditPhrase = async () => {
    if (!editingPhrase || !formData.text.trim()) {
      toast.error("Please enter a phrase");
      return;
    }

    try {
      const response = await phraseAPI.updatePhrase(
        editingPhrase._id,
        formData
      );
      setPhrases((prev) =>
        prev.map((p) =>
          p._id === editingPhrase._id ? response.data.phrase : p
        )
      );
      toast.success("Phrase updated successfully!");
      closeDialog();
    } catch (error) {
      console.error("Error updating phrase:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update phrase"
        : "Failed to update phrase";
      toast.error(message);
    }
  };

  const handleDeletePhrase = async (phraseId: string) => {
    if (!confirm("Are you sure you want to delete this phrase?")) {
      return;
    }

    try {
      await phraseAPI.deletePhrase(phraseId);
      setPhrases((prev) => prev.filter((p) => p._id !== phraseId));
      toast.success("Phrase deleted successfully!");
    } catch (error) {
      console.error("Error deleting phrase:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete phrase"
        : "Failed to delete phrase";
      toast.error(message);
    }
  };

  const openEditDialog = (phrase: Phrase) => {
    setEditingPhrase(phrase);
    setFormData({
      text: phrase.text,
      meaning: phrase.meaning || "",
      example: phrase.example || "",
      language: phrase.language,
      level: phrase.level,
      audioUrl: phrase.audioUrl || "",
      audioMeaningUrl: phrase.audioMeaningUrl || "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPhrase(null);
    setFormData({
      text: "",
      meaning: "",
      example: "",
      language: "English",
      level: "beginner",
      audioUrl: "",
      audioMeaningUrl: "",
    });
  };

  const filteredPhrases = phrases.filter(
    (phrase) =>
      phrase.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.meaning?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success/10 text-success border-success/20";
      case "intermediate":
        return "bg-action/10 text-action border-action/20";
      case "expert":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "";
    }
  };

  const getLanguageFlag = (language: string) => {
    return language === "English" ? "🇬🇧" : "🇯🇵";
  };

  const handleExportPhrases = () => {
    try {
      const exportData = phrases.map(phrase => ({
        "Phrase": phrase.text,
        "Meaning": phrase.meaning || "-",
        "Example": phrase.example || "-",
        "Language": phrase.language,
        "Level": phrase.level,
        "Has Audio": phrase.audioUrl ? "Yes" : "No",
      }));

      exportToExcel(exportData, `Phrases_Library_${new Date().toISOString().split('T')[0]}`, 'Phrases');
      toast.success(`Exported ${phrases.length} phrases successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export phrases");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading phrases...</p>
      </div>
    );
  }

  // Count phrases by language
  const englishCount = phrases.filter((p) => p.language === "English").length;
  const japaneseCount = phrases.filter((p) => p.language === "Japanese").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Phrase Management
          </h2>
          <p className="text-muted-foreground">
            Add, edit, and manage practice phrases (English & Japanese)
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="text-xs">
              en English: {englishCount}
            </Badge>
            <Badge variant="outline" className="text-xs">
              🇯🇵 Japanese: {japaneseCount}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPhrases}>
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="action" onClick={() => setEditingPhrase(null)}>
                <Plus className="w-4 h-4" />
                Add New Phrase
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPhrase ? "Edit Phrase" : "Add New Phrase"}
              </DialogTitle>
              <DialogDescription>
                {editingPhrase
                  ? "Update the phrase details"
                  : "Add a new phrase for users to practice (English or Japanese)"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phrase">Phrase Text *</Label>
                <Input
                  id="phrase"
                  placeholder="Enter the phrase..."
                  value={formData.text}
                  onChange={(e) => handleInputChange("text", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaning">Meaning / Translation</Label>
                <Textarea
                  id="meaning"
                  placeholder="Enter the meaning or translation (optional)"
                  value={formData.meaning}
                  onChange={(e) => handleInputChange("meaning", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example Usage</Label>
                <Textarea
                  id="example"
                  placeholder="Enter an example sentence (optional)"
                  value={formData.example}
                  onChange={(e) => handleInputChange("example", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      handleInputChange("language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">en English</SelectItem>
                      <SelectItem value="Japanese">🇯🇵 Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange("level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL (Optional)</Label>
                <Input
                  id="audioUrl"
                  placeholder="https://example.com/audio.mp3"
                  value={formData.audioUrl}
                  onChange={(e) =>
                    handleInputChange("audioUrl", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  TTS or native speaker audio link for the phrase
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioMeaningUrl">
                  Meaning Audio URL (Optional)
                </Label>
                <Input
                  id="audioMeaningUrl"
                  placeholder="https://example.com/meaning-audio.mp3"
                  value={formData.audioMeaningUrl}
                  onChange={(e) =>
                    handleInputChange("audioMeaningUrl", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Audio for the meaning/translation
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="action"
                onClick={editingPhrase ? handleEditPhrase : handleAddPhrase}
              >
                {editingPhrase ? "Update Phrase" : "Save Phrase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Phrases ({phrases.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {phrases.length === 0
                ? "No phrases found. Add your first phrase to get started!"
                : "No phrases match your search."}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%] font-bold text-color-[#000]">Phrase</TableHead>
                    <TableHead className="w-[25%] font-bold text-color-[#000]">Meaning</TableHead>
                    <TableHead className="font-bold text-color-[#000]">Lang</TableHead>
                    <TableHead className="font-bold text-color-[#000]">Level</TableHead>
                    <TableHead className="text-right font-bold text-color-[#000]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPhrases.map((phrase) => (
                    <TableRow key={phrase._id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <p className="truncate">{phrase.text}</p>
                          {phrase.example && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              Ex: {phrase.example}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="max-w-[200px] truncate" title={phrase.meaning || "-"}>
                          {phrase.meaning || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageFlag(phrase.language)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${getLevelColor(
                            phrase.level
                          )}`}
                        >
                          {phrase.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(phrase)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeletePhrase(phrase._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPhrases;
