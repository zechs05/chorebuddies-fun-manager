
import { Button } from "./ui/button";
import { ArrowRight, Award, Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-32">
        <div className="text-center space-y-8 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-bold font-display text-gradient">
            ParentPal: Making Chores Fun
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto">
            Transform household tasks into exciting adventures - where responsibility meets rewards!
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" className="button-gradient text-lg" onClick={() => navigate('/auth')}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              See How It Works
            </Button>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="glass rounded-2xl p-6 animate-scaleIn">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-display mb-2">Easy Task Management</h3>
            <p className="text-neutral-600">Create, assign, and track chores with just a few taps. Simple for parents, fun for kids.</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-scaleIn animation-delay-150">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold font-display mb-2">Reward System</h3>
            <p className="text-neutral-600">Turn completed chores into exciting rewards. Watch your kids get motivated!</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-scaleIn animation-delay-300">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold font-display mb-2">Smart Scheduling</h3>
            <p className="text-neutral-600">Set recurring tasks and get reminders. Never forget a chore again.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
