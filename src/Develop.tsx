import { useNavigate } from 'react-router-dom';
import './Develop.css';

const Develop = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="develop-page">
        <h1>Develop Yourself</h1>
        <p>Choose your path:</p>
        <div className="develop-buttons">
          <button
            onClick={() => navigate('/develop/mind')}
            className="develop-button mind"
          >
            Mind
          </button>
          <button
            onClick={() => navigate('/develop/body')}
            className="develop-button body"
          >
            Body
          </button>
          <button
            onClick={() => navigate('/develop/spirit')}
            className="develop-button spirit"
          >
            Spirit
          </button>
          <button
            onClick={() => navigate('/develop/Practical')}
            className="develop-button Practical"
          >
            Practical
          </button>
        </div>
      </div>
    </div>
  );
};

export default Develop;
