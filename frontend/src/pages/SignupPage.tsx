import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <AuthForm
        title="Start Your Journey"
        buttonText="Create Account"
        onSubmit={async (email, password) => {
          await signup(email, password);
          navigate('/login');
        }}
        linkText="Already have an account? Sign in"
        linkHref="/login"
        onLinkClick={() => navigate('/login')}
      />
    </div>
  );
};

export default SignupPage;
