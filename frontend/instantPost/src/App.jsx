import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreatePost from "./pages/CreatePost";
import Feed from "./pages/Feed";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 min-h-screen">
        <Routes>
          <Route path="/" element={<CreatePost />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;