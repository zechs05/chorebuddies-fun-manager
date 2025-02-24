
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["Basic features", "Single user", "Community support"],
    cta: "Get started",
  },
  {
    name: "ParentPal Pro",
    id: "pro",
    price: "$14.99",
    period: "CAD",
    description: "For growing families",
    features: [
      "All Free features",
      "Up to 5 family members",
      "Priority support",
      "Advanced tracking features"
    ],
    cta: "Subscribe",
  },
  {
    name: "ParentPro Ultimate",
    id: "enterprise",
    price: "$22.99",
    period: "CAD",
    description: "For large families",
    features: [
      "All Pro features",
      "Unlimited family members",
      "24/7 dedicated support",
      "Custom features",
      "Family insights dashboard"
    ],
    cta: "Get Ultimate",
  },
];

export const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, userId: user.id },
      });

      if (error) throw error;

      if (planId === 'free') {
        toast.success('Successfully subscribed to the free plan!');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Select the perfect plan for your family's needs
          </p>
        </div>

        <div className="mt-12 space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="glass rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="ml-1 text-xl text-gray-500">
                      {plan.period}/month
                    </span>
                  )}
                </div>
                <p className="mt-3 text-base text-gray-500">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
