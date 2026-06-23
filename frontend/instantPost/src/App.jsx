import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreatePost from "./pages/CreatePost";
import Feed from "./pages/Feed";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CreatePost />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
