import { Component } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container className="py-5 text-center" style={{ maxWidth: 480 }}>
        <div className="mb-3" style={{ fontSize: 48 }}>⚠️</div>
        <h2 className="h4 mb-2">Что-то пошло не так</h2>
        <p className="text-muted mb-4">
          Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <Alert variant="danger" className="text-start mb-4">
            <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error.message}
            </code>
          </Alert>
        )}
        <Button variant="primary" onClick={() => this.handleReload()}>
          Перезагрузить страницу
        </Button>
      </Container>
    );
  }
}

export default ErrorBoundary;
