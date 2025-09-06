import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Layout from "./components/Layout";
import Login from "./components/Login";

function App() {
  return (
    <Layout>
      <Calendar />
    </Layout>
  );
}

export default App;
