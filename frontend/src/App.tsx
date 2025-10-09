import { Navigate, Route, Routes } from "react-router-dom";

import { PreferencesProvider } from "./context/PreferencesContext";
import Home from "./pages/Home";

const App = () => {
  return (
    <PreferencesProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PreferencesProvider>
  );
};

export default App;
