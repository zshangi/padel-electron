import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./userProfile/Contact";
import PrivateRoute from "./components/PrivateRoute";

import Header from "./components/Header";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import ReservedPlayground from "./userProfile/ReservedPlayground";
import ReservedPlaygroundCouch from "./userProfile/ReservedPlaygroundCouch";
import HeaderProfile from "./userProfile/components/HeaderProfile";
import Playmate from "./userProfile/Playmate";
import Match from "./userProfile/Match";
import Package from "./userProfile/Packages";
import CreatePackage from "./userProfile/CreatePackage";
import CreatePackageCouch from "./userProfile/CreatePackageCouch";
import Matches from "./userProfile/Matches";
import Match_add_group from "./userProfile/Match_add_Group";
import Couches from "./userProfile/Couches";
import MyReserved from "./userProfile/MyReserved";
import AdminCourts from "./adminProfile/courts/Courts";
import AdminCouches from "./adminProfile/couches/Couches";
import AdminMain from "./adminProfile/MainAdmin";
import AdminMembers from "./adminProfile/Members";
import Setting from "./adminProfile/setting/Page";
import Couch from "./adminProfile/couches/Couch";
import AdminCouch from "./adminProfile/couches/Couch";
import AdminCourtsWailingList from "./adminProfile/courts/Courts-waiting-list";
import AdminPackages from "./adminProfile/package/Packeages";
import AdminAllReservations from "./adminProfile/reserved/Reserved";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<><Header /><Home /></>} /> */}

        <Route
          path="/"
          element={
              <Login />
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Header />
              <SignUp />
            </>
          }
        />

        <Route
          path="/user-home"
          element={
            <PrivateRoute>
              <HeaderProfile />
              <ReservedPlayground />
            </PrivateRoute>
          }
        />
        <Route
          path="/reserved-playgroundCouch"
          element={
            <>
              <HeaderProfile />
              <ReservedPlaygroundCouch />
            </>
          }
        />
        <Route
          path="/palymate"
          element={
            <>
              <HeaderProfile />
              <Playmate />
            </>
          }
        />
        <Route
          path="/reserve-match"
          element={
            <>
              <HeaderProfile />
              <Match />
            </>
          }
        />
        <Route
          path="/packages"
          element={
            <>
              <HeaderProfile />
              <Package />
            </>
          }
        />
        <Route
          path="/create-package"
          element={
            <>
              <HeaderProfile />
              <CreatePackage />
            </>
          }
        />
        <Route
          path="/create-package-couch"
          element={
            <>
              <HeaderProfile />
              <CreatePackageCouch />
            </>
          }
        />
        <Route
          path="/matches"
          element={
            <>
              <HeaderProfile />
              <Matches />
            </>
          }
        />
        <Route
          path="/match-add-group"
          element={
            <>
              <HeaderProfile />
              <Match_add_group />
            </>
          }
        />
        <Route
          path="/couches"
          element={
            <>
              <HeaderProfile />
              <Couches />
            </>
          }
        />

        <Route
          path="/my-reserved"
          element={
            <>
              <HeaderProfile />
              <MyReserved />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <HeaderProfile />
              <Contact />
            </>
          }
        />

        <Route
          path="/admin-courts"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminCourts />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-courts-waiting-list"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminCourtsWailingList />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-packages"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminPackages />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-all-reservations"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminAllReservations />
              </AdminMain>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-members"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminMembers />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-couches"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminCouches />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-setting"
          element={
            <PrivateRoute>
              <AdminMain>
                <Setting />
              </AdminMain>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-couch/:id"
          element={
            <PrivateRoute>
              <AdminMain>
                <AdminCouch />
              </AdminMain>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
