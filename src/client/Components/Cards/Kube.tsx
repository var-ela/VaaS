import React, { useState, useEffect } from 'react';
import { clusterMetric, nodeMetric } from '../../Queries';
import { ClusterTypes } from '../../Interfaces/ICluster';

import './styles.css';
import { Put } from '../../Services';
import { apiRoute } from '../../utils';
import Visualizer from '../Visualizer/Visualizer';
import ClusterSettings from '../ClusterSettings/ClusterSettings';
import OpenFaaS from './OpenFaaS';
import { Container, Box } from '@mui/system';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const Kube = (props: ClusterTypes) => {
  const [clusterName, setClusterName] = useState<string | undefined>('');
  const [description, setDescription] = useState<string | undefined>('');
  const [favoriteStatus, setFavoriteStatus] = useState<boolean | undefined>(false);
  const [nodeName, setNodeName] = useState('');
  const [cpuUsage, setCpuUsage] = useState<number | undefined>(0);
  const [memoryUsage, setMemoryUsage] = useState('');
  const [totalDeployments, setTotalDeployments] = useState('');
  const [totalPods, setTotalPods] = useState('');
  const [visualizer, setVisualizer] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    const fetchNodes = async () => {
      const nodes = await clusterMetric.allNodes(props._id, 'k8');
      setNodeName(nodes);
    };
    fetchNodes();
    const fetchCpuUsage = async () => {
      const cpuUsage = await nodeMetric.cpuLoad(props._id, 'k8');
      setCpuUsage(cpuUsage);
    };
    fetchCpuUsage();
    const fetchMemoryUsage = async () => {
      const memoryUsage = await clusterMetric.memoryLoad(props._id, 'k8');
      setMemoryUsage(memoryUsage);
    };
    fetchMemoryUsage();
    const fetchTotalDeployments = async () => {
      const totalDeployments = await clusterMetric.totalDeployments(props._id, 'k8');
      setTotalDeployments(totalDeployments.length);
    };
    fetchTotalDeployments();
    setTotalDeployments('');
    const fetchTotalPod = async () => {
      const totalPods = await clusterMetric.totalPods(props._id, 'k8');
      setTotalPods(totalPods);
    };
    fetchTotalPod();
    setClusterName(props.name);
    setDescription(props.description);
  }, []);

  const handleFavorite = async () => {
    try {
      const body = {
        clusterId: props._id,
        favorite: !favoriteStatus
      };
      await Put(apiRoute.getRoute('cluster'), body, { authorization: localStorage.getItem('token') });
      setFavoriteStatus(!favoriteStatus);
      // props.favoriteStatus = !props.favoriteStatus;
      props.setHomeRender(!props.homeRender);
      
    } catch (err) {
      console.log(err);
    }
  };

  const handleVisualizer = async () => {
    try {
      setVisualizer(!visualizer);
      setSettings(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSettings = async () => {
    try {
      setSettings(!settings);
      setVisualizer(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container sx={{
      minWidth: '100%',
      justifyContent: 'center',
      display: 'flex',
      direction: 'column',
      textAlign: 'left',
      backgroundSize: 'contain',
      bgcolor: '#3a4a5b'
    }} id="Kube">
      <div>
        <div className='cluster-title'>
          {props.favoriteStatus && <span className='set-favorite' onClick={handleFavorite}>❤️</span>}
          {!props.favoriteStatus && <span className='set-favorite' onClick={handleFavorite}>🤍</span>}&nbsp;<b>{'' + clusterName}:&nbsp;</b> 
            {'' + description}
        </div>
        <div className='card-controls'>
          <p><div id="card-control" onClick={handleVisualizer}>Visualizer</div></p>
          <p><div id="card-control" onClick={handleSettings}>Settings</div></p>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table aria-label="spanning table" sx={{
          'overflow-y': 'visible'
        }}>
          <TableHead>
            <TableCell align="center">Node</TableCell>
            <TableCell align="center">CPU Usage</TableCell>
            <TableCell align="center">Memory Usage</TableCell>
            <TableCell align="center">Total Deployments</TableCell>
            <TableCell align="center">Total Pods</TableCell>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">{'' + nodeName}</TableCell>
              <TableCell align="center">{'' + cpuUsage + '%'}</TableCell>
              <TableCell align="center">{'' + memoryUsage}</TableCell>
              <TableCell align="center">{'' + totalDeployments}</TableCell>
              <TableCell align="center">{'' + totalPods}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {visualizer && <Visualizer />}
      {settings && <ClusterSettings id={props._id}/>}
      <OpenFaaS setHomeRender={props.setHomeRender} />
    </Container>
  );
};

export default Kube;