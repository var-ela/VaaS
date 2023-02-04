import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '../../Store/hooks';
import { storeClusterDbData, setDarkMode } from '../../Store/actions';
import { ClusterTypes, IReducers } from '../../Interfaces';
import { fetchClusters, fetchUser } from '../../Queries';
import NavBar from './NavBar';
import Kube from '../Cards/Kube';
import HomeSidebar from './HomeSidebar';
import AddClusters from '../Admin/AddCluster';
import './styles.css';

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const uiReducer = useAppSelector((state: IReducers) => state.uiReducer);
  //console.log(uiReducer.clusterUIState, 'uiReducer variable');
  const [noClusterError, setNoClusterError] = useState('');
  const [clustersArray, setClustersArray] = useState<ClusterTypes[]>([]);
  const darkMode = uiReducer.clusterUIState.darkmode;
  const { data, refetch } = useQuery({
    queryKey: ['cluster'],
    cacheTime: 0,
    queryFn: fetchClusters,
  });
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  useEffect(() => {
    if (data?.invalid) return navigate('/');
    if (data?.message) {
      setNoClusterError(
        'Please add cluster information in administrator portal'
      );
      return;
    }
    dispatch(storeClusterDbData(data));
    setClustersArray(data);
  }, [data, dispatch, navigate, refetch]);

  //* Added to load darkmode state when navigating to home, (was just at admin load) -mcm
  useEffect(() => {
    if (userData?.invalid) return navigate('/');
    dispatch(setDarkMode(userData?.darkMode));
    userData?.darkMode
      ? (document.body.style.backgroundColor = '#34363b')
      : (document.body.style.backgroundColor = '#3a4a5b');
  }, [darkMode, dispatch, navigate, userData]);

  const resetClusterArray = () => {
    dispatch(storeClusterDbData(data));
    setClustersArray(data);
  };

  const handleFindCluster = (value: string) => {
    const renderingArr = [];
    //clustersArray, each element for name
    if (value === '') return resetClusterArray();
    //console.log(value, 'handlefindcluster value in home');
    for (let i = 0; i < clustersArray.length; i++) {
      if (clustersArray[i].name?.toLowerCase().includes(value.toLowerCase())) {
        renderingArr.push(clustersArray[i]);
      }
    }
    setClustersArray(renderingArr);
  };

  //console.log('cluster Array', clustersArray);

  return (
    <div id="home-div">
      <header>
        <NavBar refetch={refetch} />
      </header>
      <section className="mainContent">
        <aside>
          <HomeSidebar
            handleFindCluster={handleFindCluster}
            resetClusterArray={resetClusterArray}
          />
        </aside>
        <section className="contentWrapper">
          <div id="cluster-title-modals">
            <div id="Home-Bar-Title">CLUSTERS</div>
            <div className="Kube-container" id="Kube-container">
              {clustersArray?.length
                ? clustersArray?.map((cluster, index) => (
                    <Kube
                      isDark={darkMode} //*adding for darkmode
                      key={`clusterarray${index}`}
                      _id={cluster._id}
                      favorite={cluster.favorite}
                      favoriteStatus={true}
                      refetch={refetch}
                    />
                  ))
                : null}
            </div>
            {noClusterError}
          </div>
        </section>
      </section>
      {/* <AddClusters refetch={'cash'}  handleAddClusters={AddClusters}/> */}
    </div>
  );
};

export default Home;