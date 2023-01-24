import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modules } from '../../Interfaces/ICluster';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import axiosInstance from '../../Queries/axios';

const Charts = (props: Modules) => {
  const { state }: any = useLocation();
  //hooks for opening modals... two modals will be opened to render grafana graphs
  const [open, setOpen] = useState(false);
  const [openSecond, setOpenSecond] = useState(false);
  const [category, setCategory] = useState('');
  const [dashboardObj, setDashboardObj] = useState({});
  const [dashboard, setDashboard] = useState('');
  const [dashboardIds, setDashboardIds] = useState<Record<string, string>>({});
  const handleClose = () => setOpen(false);
  const handleCloseSecond = () => setOpenSecond(false);

  const getDashboards = async () => {
    const { data } = await axiosInstance.post('/graphs', {
      grafanaUrl: state[0].grafana_url,
    });
    setDashboardIds(data);
  };

  useEffect(() => {
    getDashboards();
  }, []);
 
  const computingDashboard: Record<string, string> = {
    Cluster: dashboardIds.ComputeCluster,
    Nodes: dashboardIds.ComputeNodePods,
    Workloads: dashboardIds.ComputeNamespaceWorkloads,
    Pods: dashboardIds.ComputePod,
  };
  const networkingDashboard = {
    Cluster: dashboardIds.NetworkingCluster,
    Namespaces: dashboardIds.NetworkingNamespacePods,
    Workloads: dashboardIds.NetworkingWorkload,
    Pods: dashboardIds.NetworkingPod,
  };
  const isolatedDashboard = {
    Cluster: import.meta.env.VITE_ISOLATED_CLUSTER,
    Nodes: import.meta.env.VITE_ISOLATED_NODES,
    Workloads: import.meta.env.VITE_ISOLATED_WORKLOADS,
    Pods: import.meta.env.VITE_ISOLATED_PODS,
  };
  const overviewDashboard = {
    kubelet: dashboardIds.Kubelet,
    useNode: dashboardIds.NodeExporterUSEMethodNode,
    useCluster: dashboardIds.NodeExporterUSEMethodCluster,
    nodeExporter: dashboardIds.NodeExporterNodes,
  };
  const coreDashboard = {
    apiServer: dashboardIds.APIserver,
    etcd: dashboardIds.etcd,
    scheduler: dashboardIds.Scheduler,
    controllerManager: dashboardIds.ControllerManager,
  };
  //upon opening up a modal, this function indicates the category and selects which dashboard object we are targeting
  const handleOpen = (e: any) => {
    setCategory(e.target.getAttribute('data-value'));
    switch (e.target.getAttribute('data-value')) {
      case 'computing': {
        setDashboardObj(computingDashboard);
        break;
      }
      case 'networking': {
        setDashboardObj(networkingDashboard);
        break;
      }
      case 'isolated': {
        setDashboardObj(isolatedDashboard);
        break;
      }
      case 'overview': {
        setDashboardObj(overviewDashboard);
        break;
      }
      case 'core': {
        setDashboardObj(coreDashboard);
        break;
      }
    }
    setOpen(true);
  };
  //this handler function specifies which specific dashboard is rendered
  const handleDashboard = (e: any) => {
    setOpenSecond(true);
    setDashboard(e.target.getAttribute('data-value'));
  };
  //styling for modals
  const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#181A1D',
    border: '2px solid #15161d',
    boxShadow: '1px 1px 10px .5px #403e54',
    p: 7,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };
  const style2 = {
    position: 'absolute' as const,
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -20%)',
    bgcolor: '#181A1D', //#2704FF
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };
  return (
    <div className="chartsBackground">
      <div className="categoryList">
        <div className="category" data-value="computing" onClick={handleOpen}>
          Computing
        </div>
        <div className="category" data-value="networking" onClick={handleOpen}>
          Networking
        </div>
        <div className="category" data-value="isolated" onClick={handleOpen}>
          Isolated
        </div>
        <div className="category" data-value="overview" onClick={handleOpen}>
          Overview
        </div>
        <div className="category" data-value="core" onClick={handleOpen}>
          Core
        </div>
        <div className="category" data-value="custom" onClick={handleOpen}>
          Custom
        </div>
        <div className="category" data-value="openfaas" onClick={handleOpen}>
          OpenFaaS
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-" sx={style}>
          <div
            data-value={Object.values(dashboardObj)[0]}
            onClick={handleDashboard}
            className="dashboard"
          >
            {Object.keys(dashboardObj)[0]}
          </div>
          <div
            data-value={Object.values(dashboardObj)[1]}
            onClick={handleDashboard}
            className="dashboard"
          >
            {Object.keys(dashboardObj)[1]}
          </div>
          <div
            data-value={Object.values(dashboardObj)[2]}
            onClick={handleDashboard}
            className="dashboard"
          >
            {Object.keys(dashboardObj)[2]}
          </div>
          <div
            data-value={Object.values(dashboardObj)[3]}
            onClick={handleDashboard}
            className="dashboard"
          >
            {Object.keys(dashboardObj)[3]}
          </div>
        </Box>
      </Modal>
      <Modal
        open={openSecond}
        onClose={handleCloseSecond}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="modal-2"
      >
        <Box className="modal-2-box" sx={style2}>
          <div className="renderDashboard">
            <button id="closeButton" onClick={handleCloseSecond}>
              {'Close Graph'}
            </button>
            <iframe
              src={`${state[0].grafana_url}/d/${dashboard}/?&kiosk=tv`}
              height="900px"
              width="1500px"
              frameBorder="0"
            ></iframe>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Charts;
