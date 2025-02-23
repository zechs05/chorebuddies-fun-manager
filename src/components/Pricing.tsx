
import { Button } from "./ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "1 child account",
      "Basic chore tracking",
      "Simple rewards system",
      "Mobile app access",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "9.99",
    description: "Most popular for families",
    features: [
      "Up to 3 children",
      "Advanced chore tracking",
      "Custom rewards system",
      "Priority support",
      "Progress analytics",
      "Photo verification"
    ]
  },
  {
    name: "Ultimate",
    price: "19.99",
    description: "Complete flexibility and features",
    features: [
      "Unlimited children",
      "Everything in Pro",
      "Family leaderboards",
      "Custom chore categories",
      "24/7 Premium support",
      "Advanced analytics",
      "Team challenges"
    ]
  }
];

export const Pricing = () => {
  const handleSubscribe = (planName: string) => {
    // This will be implemented once Stripe is connected
    console.log(`Selected plan: ${planName}`);
  };

  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Select the perfect plan for your family and start making chores fun today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-2xl p-8 flex flex-col ${
                plan.name === "Pro" ? "transform md:-translate-y-4 ring-2 ring-primary" : ""
              }`}
            >
              {plan.name === "Pro" && (
                <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full w-fit mx-auto -mt-11 mb-6">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-display mb-2">{plan.name}</h3>
                <p className="text-neutral-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-neutral-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-neutral-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.name === "Pro" ? "button-gradient" : ""}`}
                variant={plan.name === "Pro" ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.name)}
              >
                {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
