import { useState } from 'react';
import { Badge, Button, Form, InputGroup } from 'react-bootstrap';

const normalizeTag = (tag) => tag.trim().toLowerCase();

const TagEditor = ({ task, onAddTag, onRemoveTag }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = async () => {
    const normalizedTag = normalizeTag(tagInput);

    if (!normalizedTag) {
      return;
    }

    await onAddTag(normalizedTag);
    setTagInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAddTag();
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {(task?.tags || []).length === 0 && (
          <span className="text-muted small">Тегов пока нет.</span>
        )}
        {(task?.tags || []).map((tag) => (
          <Badge key={tag.tag} bg="light" text="dark" className="d-flex align-items-center gap-2 px-2 py-2">
            {tag.tag}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 text-danger text-decoration-none lh-1"
              onClick={() => onRemoveTag(tag.tag)}
              aria-label={`Удалить ${tag.tag}`}
            >
              x
            </Button>
          </Badge>
        ))}
      </div>

      <InputGroup>
        <Form.Control
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить тег"
        />
        <Button type="button" variant="outline-primary" onClick={handleAddTag}>
          Добавить
        </Button>
      </InputGroup>
    </div>
  );
};

export default TagEditor;
