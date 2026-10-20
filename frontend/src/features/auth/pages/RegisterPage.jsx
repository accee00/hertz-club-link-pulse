import { AuthForm } from '../components/AuthForm.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

function RegisterPage() {
  return (
    <AuthLayout
      description="Create an account to get started."
      title="Create account"
    >
      <AuthForm mode="register" />
    </AuthLayout>
  );
}

export { RegisterPage };