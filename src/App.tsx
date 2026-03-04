import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { ScopePage } from './pages/ScopePage';
import { QuantPage } from './pages/QuantPage';
import { QualPage } from './pages/QualPage';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/scope" element={<ScopePage />} />
          <Route path="/quant" element={<QuantPage />} />
          <Route path="/qual" element={<QualPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;
