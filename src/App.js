import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/FirstFactor/Login";
import ChooseMethod from "./pages/SecondFactor/ChooseMethod";
import Passkey from "./pages/SecondFactor/Passkey";
import OTP from "./pages/SecondFactor/OTP";
import TOTP from "./pages/SecondFactor/TOTP";
import SecondFactor from "./pages/SecondFactor/SecondFactor";
import Register from "./pages/FirstFactor/Register";
import FillForm from "./pages/SecondFactor/FillForm";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/auth" element={<SecondFactor/>}>
        <Route index element={<ChooseMethod/>}/>
        <Route path="passkey" element={<Passkey/>}/>
        <Route path="otp" element={<OTP/>}/>
        <Route path="totp" element={<TOTP/>}/>
        <Route path="form" element={<FillForm/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;