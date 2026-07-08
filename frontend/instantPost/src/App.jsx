import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreatePost from './pages/CreatePost';
import Feed from './pages/Feed';

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-50 transition-colors duration-500 flex">
      <Sidebar />
      {/* Main content — on mobile no left margin (sidebar overlays), on md+ shift by sidebar width */}
      <main className="flex-1 min-h-screen
        pt-14 md:pt-0
        transition-[margin] duration-500">
        <Routes>
          <Route path="/"     element={<CreatePost />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;