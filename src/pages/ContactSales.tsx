import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const products = [
  {
    id: "worldaml-suite",
    name: "WorldAML Suite",
    description: "Compliance platform for KYC, KYB, AML screening, and monitoring",
    category: "Platform",
  },
  {
    id: "worldaml-api",
    name: "WorldAML API",
    description: "Programmatic access to screening and monitoring capabilities",
    category: "Platform",
  },
  {
    id: "worldcompliance",
    name: "WorldCompliance®",
    description: "Global screening data from LexisNexis Risk Solutions",
    category: "Data Source",
  },
  {
    id: "bridger-xg",
    name: "Bridger Insight XG®",
    description: "Screening and decisioning engine from LexisNexis",
    category: "Data Source",
  },
];

const ContactSales = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    message: "",
  });

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.company.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your company name.",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Select Products",
        description: "Please select at least one product you're interested in.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Request Submitted",
      description: "Thank you for your interest. Our team will contact you within 1-2 business days.",
    });

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      jobTitle: "",
      message: "",
    });
    setSelectedProducts([]);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-display text-navy mb-4 text-center">
                Contact Sales
              </h1>
              <p className="text-body-lg text-text-secondary text-center mb-12">
                Tell us about your requirements and our team will get back to you 
                with information about the products and services that best fit your needs.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Product Selection */}
                <div className="space-y-4">
                  <Label className="text-body font-semibold text-navy">
                    Products of Interest <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-body-sm text-text-secondary -mt-2">
                    Select all products you'd like to learn more about
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProducts.includes(product.id)
                            ? "border-navy bg-navy/5"
                            : "border-divider hover:border-slate-muted"
                        }`}
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductToggle(product.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-navy">
                              {product.name}
                            </span>
                            <span className="text-caption px-2 py-0.5 rounded-full bg-surface-subtle text-text-tertiary">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-body-sm text-text-secondary mt-1">
                            {product.description}
                          </p>
                        </div>
                        {selectedProducts.includes(product.id) && (
                          <Check className="w-4 h-4 text-teal absolute top-4 right-4" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <Label className="text-body font-semibold text-navy">
                    Contact Information
                  </Label>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Smith"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Work Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      maxLength={255}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Acme Corporation"
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="Compliance Officer"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your compliance requirements or any specific questions..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-caption text-text-tertiary">
                      {formData.message.length}/1000 characters
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Request
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-caption text-text-tertiary text-center">
                  By submitting this form, you agree to our{" "}
                  <Link to="/privacy" className="text-teal hover:underline">
                    Privacy Policy
                  </Link>
                  . We'll use your information to respond to your inquiry and 
                  may contact you about relevant products and services.
                </p>
              </form>

              {/* Additional Info */}
              <div className="mt-12 p-6 rounded-lg bg-surface-subtle border border-divider">
                <h3 className="text-body font-semibold text-navy mb-4">
                  What happens next?
                </h3>
                <ol className="space-y-3">
                  {[
                    "Our team reviews your requirements within 1 business day",
                    "A product specialist contacts you to discuss your needs",
                    "We provide tailored information, pricing, and demo options",
                    "You decide if WorldAML is right for your organisation",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-caption font-semibold text-navy">
                        {index + 1}
                      </div>
                      <span className="text-body-sm text-text-secondary pt-0.5">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactSales;
