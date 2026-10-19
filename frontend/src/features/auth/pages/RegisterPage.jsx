import { AuthForm } from '../components/AuthForm.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

function RegisterPage() {
  return (
    <AuthLayout
      description="Create an account to shorten, organize, and track your links."
      eyebrow="GET STARTED"
      title="Your links, in better shape."
    >
      <AuthForm mode="register" />
    </AuthLayout>
  );
}

export { RegisterPage };