import { Dropdown } from 'react-bootstrap';
import { Globe2 } from 'react-bootstrap-icons';
import { languageOptions, useLanguage } from '../../context/LanguageContext';

const LanguageSelect = ({ className = '' }) => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  return (
    <Dropdown align="end" className={className}>
      <Dropdown.Toggle
        variant="outline-secondary"
        className="ym-language-toggle d-flex align-items-center gap-2"
        aria-label={t('common.chooseLanguage')}
      >
        <Globe2 size={17} />
        <span>{currentLanguage.shortLabel}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languageOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            active={option.value === currentLanguage.value}
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelect;
