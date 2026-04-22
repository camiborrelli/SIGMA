import React from "react";
import ListadoGeneral from "../Maquinaria/ListadoGeneral";

const Dashboard = () => {
  return (
    <div className="container">
      <div className="card">
        <h2>Panel de control - Maquinarias</h2>
        <ListadoGeneral />
      </div>
    </div>
  );
};

export default Dashboard;
