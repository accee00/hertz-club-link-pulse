import { AuthForm } from '../components/AuthForm.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

function LoginPage() {
  return (
    <AuthLayout
      description="Sign in to continue."
      title="Welcome back."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}

export { LoginPage };