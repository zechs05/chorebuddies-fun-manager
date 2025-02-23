import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["1 User", "Basic features", "Limited support"],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious users",
    features: ["5 Users", "Advanced features", "Priority support"],
    cta: "Subscribe",
  },
  {
    name: "Enterprise",
    price: "$49",
    description: "For large teams",
    features: ["Unlimited Users", "Custom features", "Dedicated support"],
    cta: "Contact us",
  },
];

export const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (planName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // We'll implement Stripe integration in the next step
    console.log(`Selected plan: ${planName}`);
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose the plan that's right for you. Upgrade or downgrade at any
            time.
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
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-xl text-gray-500">/month</span>
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
                  <Button className="w-full" onClick={() => handleSubscribe(plan.name)}>
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
