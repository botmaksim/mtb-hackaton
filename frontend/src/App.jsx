import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EntryScreen from './ui/screens/EntryScreen';
import ProfileScreen from './ui/screens/ProfileScreen';
import MainGameScreen from './ui/screens/MainGameScreen';
import DevScreen from './ui/screens/DevScreen';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-full min-h-screen bg-gray-900 overflow-hidden font-sans select-none pb-safe-bottom">
        <Routes>
          <Route path="/" element={<EntryScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/game/*" element={<MainGameScreen />} />
          <Route path="/dev" element={<DevScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
