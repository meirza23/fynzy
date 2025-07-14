import Topbar from '../components/Topbar.jsx';
import VerticalSlider from '../components/VerticalSlider.jsx';
import '../styles/Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <Topbar />
      <VerticalSlider />
    </div>
  );
};

export default Welcome;