import { Badge, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Без срока';
  }

  return new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  });
};

const progressVariant = (progress) => {
  if (progress >= 80) {
    return 'success';
  }

  if (progress >= 40) {
    return 'warning';
  }

  return 'danger';
};

const ProjectProgressWidget = ({ projects = [] }) => (
  <Card className="h-100 border-0 shadow-sm">
    <Card.Header className="bg-transparent border-bottom">
      <Card.Title className="h5 mb-0">Последние проекты</Card.Title>
    </Card.Header>
    <Card.Body className="p-0">
      {projects.length === 0 ? (
        <EmptyState title="Активных проектов пока нет." framed={false} />
      ) : (
        <ListGroup variant="flush">
          {projects.map((project) => (
            <ListGroup.Item key={project.id} className="py-3">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                <div>
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="fw-semibold text-decoration-none"
                  >
                    {project.name}
                  </Link>
                  <div className="small text-muted">
                    Срок: {formatDate(project.due_date)}
                  </div>
                </div>
                <Badge bg="secondary">{project.progress}%</Badge>
              </div>
              <ProgressBar
                now={project.progress}
                variant={progressVariant(project.progress)}
                style={{ height: '6px' }}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card.Body>
  </Card>
);

export default ProjectProgressWidget;
