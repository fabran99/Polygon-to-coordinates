import React from "react";
import "./css/main.css";
import "./css/bootstrap-grid.min.css";
import GenerarCoordenadas from "./components/GenerarCoordenadas";
import ScrollTop from "./components/ScrollTop";

function App() {
  return (
    <div className="App">
      <ScrollTop />
      <GenerarCoordenadas />
    </div>
  );
}

export default App;
