import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const STEP_LABELS = ['Answer', 'Review', 'Process', 'Edit', 'Approve', 'Save / Export'];

export default function Welcome() {
  const navigate = useNavigate();

  const start = async () => {
    const project = await api.createProject();
    navigate(`/workbook/${project.id}`);
  };

  return (
    <div className="hero">
      <div className="eyebrow">FOUNDATION · STAGE 1 OF 6</div>
      <h1>Turn the framework into a workbook you actually finish.</h1>
      <p className="lead">
        Answer a short set of questions about where you're starting from, review your own
        answers, and get back a personalized action summary you can edit, approve, and
        export — not a generic PDF.
      </p>
      <div className="row">
        <button className="btn btn-primary" onClick={start}>Start your workbook</button>
        <button className="btn btn-ghost" onClick={() => navigate('/projects')}>View saved projects →</button>
      </div>
      <div className="flowchart">
        {STEP_LABELS.map((label, i) => (
          <div className="flow-step" key={label}>
            <div className="num">0{i + 1}</div>
            <div className="lbl">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
