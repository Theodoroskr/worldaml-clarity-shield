import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWebAttribution } from "@/lib/webAttribution";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const usStates = [
  "New York",
  "California",
  "Texas",
  "Florida",
  "Illinois",
  "Massachusetts",
  "Delaware",
  "Nevada",
  "New Jersey",
  "Georgia",
  "Washington",
  "Multiple states",
  "Nationwide / federal charter",
  "Other / not listed",
];

const CONSENT_TEXT =
  "I agree that WorldAML may email me about this demo request and related AML compliance information. I can unsubscribe at any time.";

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name contains invalid characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters"),
  workEmail: z
    .string()
    .trim()
    .min(1, "Work email is required")
    .email("Please enter a valid work email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[0-9+\s()-]+$/, "Phone number contains invalid characters"),
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  jobTitle: z
    .string()
    .trim()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
  segment: z.string().min(1, "Please select an option"),
  jurisdiction: z.string().min(1, "Please select your primary jurisdiction"),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional(),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Please confirm you consent to be contacted by email about your request",
    }),
  }),
});

type FormData = z.infer<typeof schema>;

export interface USIndustryDemoRequestFormProps {
  /** Stored as form_type, e.g. "bank-aml-demo-us" */
  formType: string;
  /** Page path recorded in metadata */
  pagePath: string;
  /** Industry label stored on the lead */
  industry: string;
  /** Label for the segment select, e.g. "Institution type" */
  segmentLabel: string;
  segmentOptions: string[];
  heading?: string;
  intro?: string;
  messagePlaceholder?: string;
}

export const USIndustryDemoRequestForm = ({
  formType,
  pagePath,
  industry,
  segmentLabel,
  segmentOptions,
  heading = "Request a demo",
  intro = "Tell us about your business and we'll tailor the walkthrough to your US regulatory obligations.",
  messagePlaceholder = "e.g. SAR/CTR filing workflow, OFAC screening, transaction monitoring tuning…",
}: USIndustryDemoRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const consent = watch("consent");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            form_type: formType,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.workEmail,
            phone: data.phone,
            company: data.company,
            job_title: data.jobTitle,
            country: "United States",
            industry,
            message: data.message,
            products: ["worldaml-suite"],
            region: "na",
            metadata: {
              page: pagePath,
              segment_label: segmentLabel,
              segment: data.segment,
              jurisdiction: data.jurisdiction,
              email_follow_up_consent: true,
              consent_text: CONSENT_TEXT,
              consent_timestamp: new Date().toISOString(),
              attribution: getWebAttribution(),
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Submission failed");

      setIsSubmitted(true);
      toast.success("Thanks — a US compliance specialist will be in touch.");
    } catch {
      toast.error("Something went wrong. Please try again or email info@worldaml.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-background border border-divider rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-navy mb-2">Request received</h3>
        <p className="text-text-secondary">
          A WorldAML compliance specialist will email you within one US business day to schedule
          your walkthrough.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-divider rounded-lg p-6 md:p-8">
      <h3 className="text-xl font-semibold text-navy mb-2">{heading}</h3>
      <p className="text-body-sm text-text-secondary mb-6">{intro}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ind-firstName">
              First name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ind-firstName"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-body-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-lastName">
              Last name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ind-lastName"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-body-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ind-email">
              Work email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ind-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.workEmail}
              {...register("workEmail")}
              className={errors.workEmail ? "border-destructive" : ""}
            />
            {errors.workEmail && (
              <p className="text-body-sm text-destructive">{errors.workEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ind-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 212 555 0100"
              aria-invalid={!!errors.phone}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-body-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ind-company">
              Company <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ind-company"
              autoComplete="organization"
              aria-invalid={!!errors.company}
              {...register("company")}
              className={errors.company ? "border-destructive" : ""}
            />
            {errors.company && (
              <p className="text-body-sm text-destructive">{errors.company.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-jobTitle">Job title</Label>
            <Input
              id="ind-jobTitle"
              autoComplete="organization-title"
              placeholder="BSA/AML Officer"
              {...register("jobTitle")}
              className={errors.jobTitle ? "border-destructive" : ""}
            />
            {errors.jobTitle && (
              <p className="text-body-sm text-destructive">{errors.jobTitle.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ind-segment">
              {segmentLabel} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("segment")}
              onValueChange={(value) => setValue("segment", value, { shouldValidate: true })}
            >
              <SelectTrigger
                id="ind-segment"
                className={errors.segment ? "border-destructive" : ""}
              >
                <SelectValue placeholder={`Select ${segmentLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {segmentOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.segment && (
              <p className="text-body-sm text-destructive">{errors.segment.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-jurisdiction">
              Primary jurisdiction <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("jurisdiction")}
              onValueChange={(value) => setValue("jurisdiction", value, { shouldValidate: true })}
            >
              <SelectTrigger
                id="ind-jurisdiction"
                className={errors.jurisdiction ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {usStates.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jurisdiction && (
              <p className="text-body-sm text-destructive">{errors.jurisdiction.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ind-message">What would you like to cover?</Label>
          <Textarea
            id="ind-message"
            rows={3}
            placeholder={messagePlaceholder}
            {...register("message")}
            className={errors.message ? "border-destructive" : ""}
          />
          {errors.message && (
            <p className="text-body-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        {/* Explicit email follow-up consent */}
        <div className="space-y-2 rounded-md border border-divider bg-surface-subtle p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="ind-consent"
              checked={!!consent}
              onCheckedChange={(checked) =>
                setValue("consent", (checked === true) as true, { shouldValidate: true })
              }
              aria-invalid={!!errors.consent}
            />
            <Label
              htmlFor="ind-consent"
              className="text-body-sm font-normal leading-relaxed text-text-secondary"
            >
              {CONSENT_TEXT} <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.consent && (
            <p className="text-body-sm text-destructive">{errors.consent.message}</p>
          )}
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending request…
            </>
          ) : (
            "Request my demo"
          )}
        </Button>

        <p className="text-xs text-text-tertiary">
          We use your details only to respond to this request and never sell them. See our{" "}
          <a href="/privacy" className="underline hover:text-accent">
            privacy policy
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default USIndustryDemoRequestForm;
