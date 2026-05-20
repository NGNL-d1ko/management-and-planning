import { Navigate, Outlet } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
