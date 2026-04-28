import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <AuthForm
        title="Welcome Back"
        buttonText="Sign In"
        onSubmit={async (email, password) => {
          await login(email, password);
          navigate('/');
        }}
        linkText="Don't have an account? Sign up"
        linkHref="/signup"
        onLinkClick={() => navigate('/signup')}
      />
    </div>
  );
};

export default LoginPage;
