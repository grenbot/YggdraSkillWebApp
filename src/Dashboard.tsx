import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { TreeProgress, SkillTree, SkillNode } from './types/sharedTypes';

const Dashboard = () => {
  const navigate = useNavigate();
  const trees = useSelector((state: RootState) => state.progress);
  const user = useSelector((state: RootState) => state.auth.user);
  const authChecked = useSelector((state: RootState) => state.auth.authChecked);
  const metadata = useSelector((state: RootState) => state.auth.metadata);

  useEffect(() => {
    if (authChecked && !user) {
      navigate('/login');
    }
  }, [authChecked, user, navigate]);

  if (!authChecked || !user) {
    return <div>Loading...</div>;
  }

  const renderNode = (node: SkillNode, treeProgress: TreeProgress) => {
    const completedSubskills = treeProgress[node.id]?.subskills || [];
    const totalSubskills = node.subskills?.length || 0;
    const completionPercentage = totalSubskills > 0
      ? (completedSubskills.length / totalSubskills) * 100
      : 0;

  console.log("🔍 Dashboard metadata:", metadata);
  console.log("🌲 Dashboard progress keys:", Object.keys(trees));
  console.log("🧩 Dashboard node:", node);      

    return (
      <div key={node.id} className="node">
        <h4>{node.label}</h4>
        <p>{completedSubskills.length} / {totalSubskills} subskills completed</p>
        <progress value={completionPercentage} max={100}></progress>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <h2>Welcome to your Dashboard, {user.displayName || user.email}</h2>
      {Object.entries(trees).map(([treeId, progress]) => {
        if (treeId === 'error') return null;
        const tree = metadata?.[treeId] as SkillTree | undefined;
        if (!tree || typeof progress !== 'object' || progress === null) return null;

        const normalizedProgress: TreeProgress = Object.entries(progress).reduce((acc, [nodeId, value]) => {
          if (Array.isArray(value)) {
            acc[nodeId] = { subskills: value };
          } else if (typeof value === 'object' && value !== null && 'subskills' in value) {
            acc[nodeId] = value as any;
          }
          return acc;
        }, {} as TreeProgress);

        return (
          <div key={treeId} className="tree">
            <h3>{tree.title}</h3>
            {tree.nodes.map((node) => renderNode(node, normalizedProgress))}
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
