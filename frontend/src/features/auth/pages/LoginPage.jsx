import { AuthForm } from '../components/AuthForm.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

function LoginPage() {
  return (
    <AuthLayout
      description="Sign in to manage your links and see how they’re performing."
      eyebrow="LINK PULSE ACCOUNT"
      title="Welcome back."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}

export { LoginPage };