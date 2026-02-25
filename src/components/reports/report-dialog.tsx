"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";
import ptBR from "@/lib/translations/pt-BR";

const reportSchema = z.object({
  reason: z.string().min(5, "O motivo deve ter pelo menos 5 caracteres"),
  description: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportDialogProps {
  type: "PRODUCT" | "USER";
  targetId: string;
  targetName: string;
  trigger?: React.ReactNode;
}

const reportReasons = [
  ptBR.reports.reportReasons.suspectedScam,
  ptBR.reports.reportReasons.misrepresentation,
  ptBR.reports.reportReasons.counterfeit,
  ptBR.reports.reportReasons.harassment,
  ptBR.reports.reportReasons.spam,
  ptBR.reports.reportReasons.prohibitedItem,
  ptBR.reports.reportReasons.other,
];

export function ReportDialog({
  type,
  targetId,
  targetName,
  trigger,
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const handleSubmit = async (data: ReportFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          reason: data.reason,
          description: data.description,
          reportedUserId: type === "USER" ? targetId : undefined,
          reportedProductId: type === "PRODUCT" ? targetId : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao enviar denúncia");
      }

      toast.success(ptBR.reports.reportSubmitted, {
        description: ptBR.reports.reportSubmittedDescription,
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar denúncia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            {ptBR.reports.report}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            {type === "PRODUCT" ? ptBR.reports.reportProduct : ptBR.reports.reportUser}
          </DialogTitle>
          <DialogDescription>
            Denunciar {targetName} por violação de nossas políticas. {ptBR.reports.allReportsConfidential}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{ptBR.reports.reason} *</Label>
            <Select
              onValueChange={(value) => form.setValue("reason", value)}
              defaultValue={form.getValues("reason")}
            >
              <SelectTrigger>
                <SelectValue placeholder={ptBR.reports.selectReason} />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{ptBR.reports.additionalDetails}</Label>
            <Textarea
              id="description"
              placeholder={ptBR.reports.additionalDetailsPlaceholder}
              rows={4}
              {...form.register("description")}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-1">{ptBR.reports.importantNotice}</p>
            <p>
              {ptBR.reports.falseReportsWarning}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {ptBR.common.cancel}
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ptBR.reports.submitReport}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
