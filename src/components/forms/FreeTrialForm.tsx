import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import lexisnexisLogo from "@/assets/lexisnexis-logo.png";

const industries = [
  "Financial Services",
  "Insurance",
  "Legal",
  "Real Estate",
  "Gaming & Gambling",
  "Cryptocurrency",
  "Retail",
  "Technology",
  "Professional Services",
  "Healthcare",
  "Government",
  "Other",
];

const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+353", country: "Ireland" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+91", country: "India" },
  { code: "+65", country: "Singapore" },
  { code: "+61", country: "Australia" },
];

const freeTrialSchema = z.object({
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
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  countryCode: z.string().min(1, "Country code is required"),
  workPhone: z
    .string()
    .trim()
    .min(1, "Work phone is required")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[0-9\s()-]+$/, "Phone number contains invalid characters"),
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  industry: z.string().min(1, "Please select an industry"),
  comments: z
    .string()
    .trim()
    .max(500, "Comments must be less than 500 characters")
    .optional(),
});

type FreeTrialFormData = z.infer<typeof freeTrialSchema>;

interface FreeTrialFormProps {
  region?: string;
}

export const FreeTrialForm = ({ region = "eu-me" }: FreeTrialFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FreeTrialFormData>({
    resolver: zodResolver(freeTrialSchema),
    defaultValues: {
      countryCode: "+1",
    },
  });

  const onSubmit = async (data: FreeTrialFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Free trial request submitted:", { ...data, region });
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Thank you! We'll be in touch shortly.");
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-divider rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal/10 text-teal mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-navy mb-2">Thank You!</h3>
        <p className="text-text-secondary mb-4">
          Your free trial request has been submitted. A member of our team will 
          contact you shortly to activate your account.
        </p>
        <p className="text-body-sm text-text-tertiary">
          Please check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-divider rounded-lg p-6 md:p-8">
      {/* Header with LexisNexis Logo */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-navy">
            Sign Up for a FREE Trial
          </h3>
          <img 
            src={lexisnexisLogo} 
            alt="LexisNexis Risk Solutions" 
            className="h-8 md:h-10 object-contain"
          />
        </div>
        <p className="text-body-sm text-text-secondary">
          See our comprehensive database in action. Complete the form below and 
          we'll set up your trial account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              {...register("firstName")}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-body-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              {...register("lastName")}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-body-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="workEmail">
            Work Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="workEmail"
            type="email"
            placeholder="you@company.com"
            {...register("workEmail")}
            className={errors.workEmail ? "border-destructive" : ""}
          />
          {errors.workEmail && (
            <p className="text-body-sm text-destructive">{errors.workEmail.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="workPhone">
            Work Phone <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Select
              value={watch("countryCode")}
              onValueChange={(value) => setValue("countryCode", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((cc) => (
                  <SelectItem key={cc.code} value={cc.code}>
                    {cc.code} {cc.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="workPhone"
              placeholder="Phone number"
              {...register("workPhone")}
              className={`flex-1 ${errors.workPhone ? "border-destructive" : ""}`}
            />
          </div>
          {errors.workPhone && (
            <p className="text-body-sm text-destructive">{errors.workPhone.message}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company">
            Company <span className="text-destructive">*</span>
          </Label>
          <Input
            id="company"
            placeholder="Your company name"
            {...register("company")}
            className={errors.company ? "border-destructive" : ""}
          />
          {errors.company && (
            <p className="text-body-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("industry")}
            onValueChange={(value) => setValue("industry", value)}
          >
            <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-body-sm text-destructive">{errors.industry.message}</p>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments">How Can We Help You?</Label>
          <Textarea
            id="comments"
            placeholder="Tell us about your screening requirements..."
            rows={3}
            {...register("comments")}
            className={errors.comments ? "border-destructive" : ""}
          />
          {errors.comments && (
            <p className="text-body-sm text-destructive">{errors.comments.message}</p>
          )}
        </div>

        {/* Consent Notice */}
        <p className="text-xs text-text-tertiary">
          By submitting this form, you agree to be contacted by Infocredit Group 
          and LexisNexis Risk Solutions regarding WorldCompliance® products and services. 
          You can opt-out at any time.
        </p>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request Free Trial"
          )}
        </Button>
      </form>

      {/* Terms */}
      <p className="text-xs text-text-tertiary mt-4">
        * Free trial available to individuals not currently subscribed to WorldCompliance® 
        Online Search Tool. Eligibility requirements apply. Usernames and passwords are 
        non-transferable.
      </p>
    </div>
  );
};

export default FreeTrialForm;
