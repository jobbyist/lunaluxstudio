import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save, X, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BirthdayDatePickerProps {
  userId: string;
  currentBirthday: string | null;
  onUpdate?: () => void;
}

export const BirthdayDatePicker = ({ userId, currentBirthday, onUpdate }: BirthdayDatePickerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    currentBirthday ? new Date(currentBirthday) : undefined
  );
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!date) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          birthday: format(date, 'yyyy-MM-dd'),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Check if birthday bonus should be awarded
      await supabase.rpc('award_birthday_bonus_if_eligible', { target_user_id: userId });

      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      setIsEditing(false);
      toast({
        title: "Birthday saved! 🎂",
        description: "You'll receive 100 bonus points on your special day!",
      });
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save birthday",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDate(currentBirthday ? new Date(currentBirthday) : undefined);
    setIsEditing(false);
  };

  if (!isEditing && currentBirthday) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Cake className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Birthday</p>
          <p className="font-medium">{format(new Date(currentBirthday), 'MMMM d')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    );
  }

  if (!isEditing && !currentBirthday) {
    return (
      <div 
        className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <Cake className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground">Set your birthday</p>
          <p className="text-sm text-muted-foreground">Get 100 bonus points on your special day!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
      <div className="flex items-center gap-2">
        <Cake className="h-5 w-5 text-primary" />
        <p className="font-medium">Set Your Birthday</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM d, yyyy") : <span>Pick your birthday</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1920-01-01")
              }
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              captionLayout="dropdown-buttons"
              fromYear={1920}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!date || saving}
            size="sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        You'll receive 100 bonus points automatically on your birthday each year!
      </p>
    </div>
  );
};