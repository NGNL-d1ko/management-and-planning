import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Container className="min-vh-100 d-flex align-items-center justify-content-center text-center">
    <div>
      <div className="display-4 fw-bold mb-2">404</div>
      <h1 className="h3 mb-3">Страница не найдена</h1>
      <p className="text-muted mb-4">
        Страница, которую вы ищете, не существует в your MaP.
      </p>
      <Button as={Link} to="/app/dashboard" variant="primary">
        Вернуться на главную
      </Button>
    </div>
  </Container>
);

export default NotFoundPage;
