import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Minus, Plus, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useRegion } from "@/contexts/RegionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegionPricing {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  basePrice: number;
  disclaimer: string;
}

interface CurrencyOption {
  currency: string;
  symbol: string;
  basePrice: number;
}

const regions: (RegionPricing & { currencies?: CurrencyOption[] })[] = [
  {
    id: "eu-me",
    name: "Europe & Middle East",
    currency: "EUR",
    symbol: "€",
    basePrice: 3000,
    disclaimer: "Access activation subject to verification. Availability may vary by jurisdiction.",
  },
  {
    id: "uk-ie",
    name: "United Kingdom & Ireland",
    currency: "GBP",
    symbol: "£",
    basePrice: 2700,
    currencies: [
      { currency: "GBP", symbol: "£", basePrice: 2700 },
      { currency: "EUR", symbol: "€", basePrice: 3200 },
    ],
    disclaimer: "Access subject to verification and contractual approval.",
  },
  {
    id: "na",
    name: "North America",
    currency: "USD",
    symbol: "$",
    basePrice: 4900,
    disclaimer: "Availability subject to eligibility assessment.",
  },
];

const calculateUserPrice = (basePrice: number, userNumber: number): number => {
  if (userNumber === 1) return basePrice;
  let price = basePrice;
  for (let i = 2; i <= userNumber; i++) {
    price = price * 0.9;
  }
  return Math.round(price);
};

const WorldCompliancePricingCalculator = () => {
  const { region: detectedRegion, isLoading } = useRegion();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("eu-me");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("GBP");
  const [userCount, setUserCount] = useState(1);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Set initial region based on detection
  useEffect(() => {
    if (!isLoading && detectedRegion) {
      setSelectedRegion(detectedRegion);
    }
  }, [detectedRegion, isLoading]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to purchase", {
        description: "You need to be logged in to complete your purchase.",
        action: {
          label: "Sign In",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const currency = currentRegion.currencies 
        ? selectedCurrency 
        : currentRegion.currency;

      const { data, error } = await supabase.functions.invoke('create-worldcompliance-checkout', {
        body: {
          userCount,
          currency,
          region: currentRegion.name,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", {
        description: "There was an error processing your request. Please try again.",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const currentRegion = regions.find((r) => r.id === selectedRegion) || regions[0];
  
  // Get active pricing based on currency selection for UK-IE
  const activePricing = useMemo(() => {
    if (currentRegion.currencies && selectedRegion === "uk-ie") {
      const currencyOption = currentRegion.currencies.find(c => c.currency === selectedCurrency);
      if (currencyOption) {
        return { symbol: currencyOption.symbol, basePrice: currencyOption.basePrice };
      }
    }
    return { symbol: currentRegion.symbol, basePrice: currentRegion.basePrice };
  }, [currentRegion, selectedRegion, selectedCurrency]);

  const userPrices = useMemo(() => {
    const prices: number[] = [];
    for (let i = 1; i <= userCount; i++) {
      prices.push(calculateUserPrice(activePricing.basePrice, i));
    }
    return prices;
  }, [activePricing.basePrice, userCount]);

  const totalPrice = useMemo(() => {
    return userPrices.reduce((sum, price) => sum + price, 0);
  }, [userPrices]);

  const exampleTotals = useMemo(() => {
    const examples = [];
    for (let users = 1; users <= 3; users++) {
      let total = 0;
      for (let i = 1; i <= users; i++) {
        total += calculateUserPrice(activePricing.basePrice, i);
      }
      examples.push({ users, total });
    }
    return examples;
  }, [activePricing.basePrice]);

  const formatPrice = (price: number) => {
    return `${activePricing.symbol}${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedRegion} onValueChange={setSelectedRegion}>
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <TabsList className="grid grid-cols-3 h-auto">
            {regions.map((region) => (
              <TabsTrigger 
                key={region.id} 
                value={region.id} 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
              >
                <span className="hidden sm:inline">{region.name}</span>
                <span className="sm:hidden">
                  {region.id === "eu-me" ? "EU & ME" : region.id === "uk-ie" ? "UK & IE" : "NA"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {selectedRegion === detectedRegion && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin className="h-3 w-3" />
              <span>Detected region</span>
            </div>
          )}
        </div>

        {regions.map((region) => (
          <TabsContent key={region.id} value={region.id} className="mt-0">
            {/* Currency Selector for UK-IE */}
            {region.currencies && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Currency:</span>
                <div className="flex gap-2">
                  {region.currencies.map((curr) => (
                    <Button
                      key={curr.currency}
                      variant={selectedCurrency === curr.currency ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCurrency(curr.currency)}
                    >
                      {curr.symbol} {curr.currency}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pricing Table */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Per-User Pricing</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Base price: {activePricing.symbol}{activePricing.basePrice.toLocaleString()} / year
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">1st user</span>
                      <span className="font-medium">{activePricing.symbol}{activePricing.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">2nd user</span>
                        <span className="text-xs text-muted-foreground">(10% discount)</span>
                      </div>
                      <span className="font-medium">{activePricing.symbol}{calculateUserPrice(activePricing.basePrice, 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">3rd user</span>
                        <span className="text-xs text-muted-foreground">(10% discount)</span>
                      </div>
                      <span className="font-medium">{activePricing.symbol}{calculateUserPrice(activePricing.basePrice, 3).toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Examples</p>
                    {exampleTotals.map(({ users, total }) => (
                      <div key={users} className="flex justify-between text-sm">
                        <span>{users} user{users > 1 ? "s" : ""}</span>
                        <span>{activePricing.symbol}{total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calculator */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Calculate Your Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUserCount(Math.max(1, userCount - 1))}
                      disabled={userCount <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <span className="text-4xl font-bold">{userCount}</span>
                      <p className="text-sm text-muted-foreground">user{userCount > 1 ? "s" : ""}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUserCount(Math.min(10, userCount + 1))}
                      disabled={userCount >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 bg-slate-100 p-4 rounded-lg">
                    {userPrices.map((price, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>User {index + 1}:</span>
                        <span>{formatPrice(price)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(totalPrice)} / year</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="accent"
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Buy WorldCompliance Online
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {region.disclaimer}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WorldCompliancePricingCalculator;
