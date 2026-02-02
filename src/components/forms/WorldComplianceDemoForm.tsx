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

// Allowed countries for WorldCompliance
const allowedCountries = [
  { code: "CY", name: "Cyprus" },
  { code: "GR", name: "Greece" },
  { code: "MT", name: "Malta" },
  { code: "RO", name: "Romania" },
  { code: "TR", name: "Turkey" },
  { code: "HU", name: "Hungary" },
  { code: "AM", name: "Armenia" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
  { code: "AE", name: "United Arab Emirates" },
];

const countryCodes = [
  { code: "+357", country: "Cyprus" },
  { code: "+30", country: "Greece" },
  { code: "+356", country: "Malta" },
  { code: "+40", country: "Romania" },
  { code: "+90", country: "Turkey" },
  { code: "+36", country: "Hungary" },
  { code: "+374", country: "Armenia" },
  { code: "+44", country: "UK" },
  { code: "+353", country: "Ireland" },
  { code: "+1", country: "Canada/USA" },
  { code: "+971", country: "UAE" },
];

const worldComplianceDemoSchema = z.object({
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
  phoneCode: z.string().min(1, "Country code is required"),
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
  country: z.string().min(1, "Please select your country"),
  otherCountry: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  comments: z
    .string()
    .trim()
    .max(500, "Comments must be less than 500 characters")
    .optional(),
}).refine((data) => {
  if (data.country === "OTHER") {
    return data.otherCountry && data.otherCountry.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify your country",
  path: ["otherCountry"],
});

type WorldComplianceDemoFormData = z.infer<typeof worldComplianceDemoSchema>;

export const WorldComplianceDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorldComplianceDemoFormData>({
    resolver: zodResolver(worldComplianceDemoSchema),
    defaultValues: {
      phoneCode: "+357",
    },
  });

  const selectedCountry = watch("country");

  const onSubmit = async (data: WorldComplianceDemoFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const countryName = data.country === "OTHER" 
      ? data.otherCountry 
      : allowedCountries.find(c => c.code === data.country)?.name;
    
    console.log("WorldCompliance demo request submitted:", { 
      ...data, 
      countryName,
      product: "WorldCompliance"
    });
    
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
          Your WorldCompliance® demo request has been submitted. A member of our team will 
          contact you shortly to schedule your personalized demonstration.
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
            Request a WorldCompliance® Demo
          </h3>
          <img 
            src={lexisnexisLogo} 
            alt="LexisNexis Risk Solutions" 
            className="h-8 md:h-10 object-contain"
          />
        </div>
        <p className="text-body-sm text-text-secondary">
          See WorldCompliance® Online Search Tool in action. Complete the form below and 
          our team will schedule a personalized demonstration.
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
              value={watch("phoneCode")}
              onValueChange={(value) => setValue("phoneCode", value)}
            >
              <SelectTrigger className="w-36">
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

        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("country")}
            onValueChange={(value) => setValue("country", value)}
          >
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {allowedCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
              <SelectItem value="OTHER">Other (specify below)</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-body-sm text-destructive">{errors.country.message}</p>
          )}
        </div>

        {/* Other Country Input - shown when "Other" is selected */}
        {selectedCountry === "OTHER" && (
          <div className="space-y-2">
            <Label htmlFor="otherCountry">
              Specify Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="otherCountry"
              placeholder="Enter your country"
              {...register("otherCountry")}
              className={errors.otherCountry ? "border-destructive" : ""}
            />
            {errors.otherCountry && (
              <p className="text-body-sm text-destructive">{errors.otherCountry.message}</p>
            )}
            <p className="text-xs text-text-tertiary">
              For countries outside our standard coverage, a regional assessment will be required.
            </p>
          </div>
        )}

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
            "Request Demo"
          )}
        </Button>
      </form>

      {/* Terms */}
      <p className="text-xs text-text-tertiary mt-4">
        * Demo availability subject to eligibility assessment. Response times may vary by region.
      </p>
    </div>
  );
};

export default WorldComplianceDemoForm;
