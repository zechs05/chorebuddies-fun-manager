
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      toast.success('Successfully subscribed!');
    }
    // Redirect to home after 3 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Thank you!</h1>
        <p className="text-xl text-gray-600">
          Your subscription has been confirmed. Redirecting you back to the homepage...
        </p>
      </div>
    </div>
  );
}
