import React, { useState, useEffect, ChangeEvent } from "react";
import { Modules } from "../../Interfaces/ICluster";
import { Delete, Get, Post } from "../../Services";
import { DeployedFunctionTypes, FunctionTypes } from "../../Interfaces/IFunction";
import { apiRoute } from "../../utils";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { IReducers } from "../../Interfaces/IReducers";
import { customFuncBody } from "../../utils";
import { SET_DeployedOFFunc, GET_OFFunc, GET_DeployedOFFunc, SET_OFFunc, DEL_DeployedOFFunc} from '../../Store/actions';

import { 
  Container,
  Box,
  TextField, 
  Button, 
  FormControl, 
  NativeSelect 
} from '@mui/material';

// need to convert to redux for selected/ deployed function
const OpenFaaS = (props: Modules) => {
  const dispatch = useAppDispatch();
  // const apiReducer = useAppSelector((state: IReducers) => state.apiReducer);
  const OFReducer = useAppSelector((state: IReducers) => state.OFReducer);
  // const [dbData] = useState(apiReducer.clusterDbData.find(element => element._id === props.id));
  const { state }: any = useLocation();
  const [id] = useState(props.id || state[0]);
  const [deployedFunctions, setDeployedFunctions] = useState<DeployedFunctionTypes[]>([]);
  // const openFaaSDeployed = OFReducer.clusterOpenFaaSData[id].deployedFunctions || null;
  // const deployedFunctions = openFaaSDeployed || []; 
  // OFReducer.clusterOpenFaaSData[id].deployedFunctions
  const [openFaaSFunctions, setOpenFaaSFunctions] = useState<FunctionTypes[]>([]);
  // we might need to turn these into global state
  
  const [selectedOpenFaaSFunction, setSelectedOpenFaaSFunction] = useState('');
  const [selectedDeployedFunction, setSelectedDeployedFunction] = useState('');
  const [invokedOutput, setInvokedOutput] = useState("");
  const [renderFunctions, setRenderFunctions] = useState(false);
  const [reqBody, setRegBody] = useState(""); 

  const [dropdownStyle] = useState({
    background: 'white',
    borderRadius: '5px',
    padding: '0.5rem',
    marginBottom: '0px',
    width: '100%',
    fontSize: '10px'
  });
  const [inputStyle] = useState({
    width: '45%'
  });

  const [textAreaRows, setTextAreaRows] = useState(4);
  const [textAreaStyle, setTextAreaStyle] = useState({
    color: '#F0F0F0',
    height: '140px'
  });

  useEffect(() => {
    if (!props.nested) {
      setTextAreaStyle({
        ...textAreaStyle,
        color: '#F0F0F0',
        height: '42.5vw'
      });
      setTextAreaRows(8);
    }
    const openFaaSFunctions = async () => {
      try {
        const funcs = await Get(
          apiRoute.getRoute("faas?OpenFaaSStore=true"), 
          {
            authorization: localStorage.getItem("token"),
          }
        );
        setOpenFaaSFunctions(funcs.functions);
      } catch (error) {
        console.log("Error in fetching OpenFaaS Functions", error);
      }
    };
    const fetchFunctions = async () => {
      console.log(id);
      try {
         
          console.log('id is', id);
          const funcs = await Get(
            apiRoute.getRoute(`faas`),
            {
              authorization: localStorage.getItem("token"),
              id: id,
            });
          if (funcs.message) {
            // setDeployedFunctions([]);
            console.log('HITTING and setting state to empty array');
            console.log('ERROR IS ', funcs.message);
            dispatch(GET_DeployedOFFunc([]));
          } else {
            console.log('funcs is: ', funcs);
            //  setDeployedFunctions(funcs);
            // console.log('ID IS: ', id, ' ||', 'deployedFuncs is', deployedFunctions);
            dispatch(GET_DeployedOFFunc(funcs));
            // setDeployedFunctions(funcs); 
            console.log('REDUX STATE' , OFReducer.deployedFunctions);
          }
        
      } catch (error) {
        console.log("Error in fetching deployed OpenFaaS Functions", error);
      }
    };
    openFaaSFunctions();
    fetchFunctions();
  }, [renderFunctions]);

  const handleDeployOpenFaaS = async () => {
    try {
      const getFunc = openFaaSFunctions.find(
        (element) => element.name === selectedOpenFaaSFunction
      );

      const body = {
        clusterId: id,
        service: selectedOpenFaaSFunction,
        image: getFunc?.images.x86_64,
      };
      const response = await Post(
        apiRoute.getRoute("faas"), 
        body, 
        {
          authorization: localStorage.getItem("token"),
        }
      );
      if (response.success) {
        setRenderFunctions(!renderFunctions);
      }
    } catch (error) {
      console.log("Error in handleDeployOpenFaaS", error);
    }
  };

  const handleOpenFaaSFunctionsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOpenFaaSFunction(e.target.value);
  };

  const handleInvoke = async () => {
    try {
      const functionName = selectedDeployedFunction;
      if (functionName in customFuncBody) {
        const body = {
          clusterId: id,
          functionName: functionName,
        };
        const res = await Post(
          apiRoute.getRoute("faas/invoke"),
          body,
          {
            authorization: localStorage.getItem("token"),
          }
        );
        setInvokedOutput(res);
      }
     else {
        console.log('requestBody', reqBody);
        const body = {
          clusterId: id,
          functionName: functionName,
          data: reqBody
        };
        const res = await Post(
          apiRoute.getRoute("faas/invoke"),
          body,
          {
            authorization: localStorage.getItem("token"),
          }
        );
        setInvokedOutput(res);
      }
    } catch (error) {
      console.log("Error in handleInvoke", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("DeployedFunc is: ", deployedFunctions);

      const body = {
        clusterId: id,
        functionName: selectedDeployedFunction,
      };
      const response = await Delete(
        apiRoute.getRoute("faas"), 
        body, 
        {
          authorization: localStorage.getItem("token"),
        }
      );
      if (response.success) {
        // setDeployedFunctions(
        //   deployedFunctions.filter(
        //     (element) => element.name !== body.functionName
        //   )
        // );
        dispatch(DEL_DeployedOFFunc(id, deployedFunctions.filter(el => el.name !== body.functionName)));
        setInvokedOutput("Deployed function deleted");
      }
    } catch (error) {
      console.log("Error in handleInvoke", error);
    }
  };

  const handleDeployedFunctionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeployedFunction(e.target.value);
  };

  const displayFunctionData = (name: string) => {
    return deployedFunctions.find((element) => element.name === name);
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          gap: '1.5rem',
          marginLeft: '-1rem',
          marginTop: '8px',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={inputStyle}
        >
          <FormControl fullWidth
            sx={dropdownStyle}
          >
            <NativeSelect
              onChange={handleOpenFaaSFunctionsChange} 
              inputProps={{
                name: 'OpenFaaS Functions Store',
                id: 'uncontrolled-native',
              }}
            >
              {openFaaSFunctions.map((element, idx) => {
                return (
                  <option 
                    key={idx} 
                    value={element.name}
                  >
                    {element.name}
                  </option>
                );
              })}
            </NativeSelect>
          </FormControl>
          <Button 
              variant="contained" 
              className="btn" 
              type="button" 
              onClick = {handleDeployOpenFaaS}
              sx={{
                background: '#3a4a5b',
                borderRadius: '5px',
                marginBottom: '20px',
                width: '100%',
                fontSize: '10px',
                marginLeft: '0.5rem'
              }}
            >
              Deploy from store
            </Button>
          </Box>
          <Box
            sx={inputStyle}
          >
            <FormControl fullWidth
              sx={dropdownStyle}
            >
              <NativeSelect
                placeholder="Select Function to Invoke"
                inputProps={{
                  name: 'Deployed Functions',
                  id: 'uncontrolled-native',
                }}
                onChange={handleDeployedFunctionChange} 
              ><option value=''>--Select Function to Invoke--</option>
              {OFReducer.deployedFunctions.map((element, idx) => {
                  return (
                    <option 
                      key={idx} 
                      value={element.name}
                    >
                      {element.name}
                    </option>
                  );
                })}
              </NativeSelect>
            </FormControl>
            <Box
              sx={{
                width: '100%',
                marginLeft: '0.6rem'
              }}
            >
              <Button 
                  disabled={selectedDeployedFunction === ''}
                  variant="contained" 
                  className="btn" 
                  type="button" 
                  onClick = {handleInvoke}
                  sx={{
                    background: '#3a4a5b',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    width: '49%',
                    fontSize: '10px'
                  }}
                >
                  Invoke
                </Button>
                <Button 
                  variant="contained" 
                  className="btn" 
                  type="button" 
                  onClick = {handleDelete}
                  sx={{
                    background: '#3a4a5b',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    width: '49%',
                    fontSize: '10px',
                    marginLeft: '1px'
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Box>
        <Box
          sx={{
            background: textAreaStyle.color,
            color: 'black',
            width: '100%',
            height: '70px',
            overflow: 'scroll',
            borderRadius: '15px',
            textAlign: 'left',
            fontSize: '16px'
          }}
        >
          <Box
            sx={{
              margin: '4px',
              marginLeft: '10px',
              height: "30px"
            }}
          >
            <b>Function Information</b>
          {selectedDeployedFunction && (
            <div>
              <span>
                {`
                Function Name: ${selectedDeployedFunction}
                Invocation count: ${displayFunctionData(selectedDeployedFunction)?.invocationCount || 0}
                `}
              
              </span>  
          
            </div>
            )}
          </Box>
        </Box>
      <div>
      <TextField onChange={(newReqBody) => setRegBody(newReqBody.target.value)}
          type="text"
          label="Request Body"
          variant="filled"
          size='small'
          margin="dense"
          multiline
          rows={textAreaRows}
          sx={{
            background: textAreaStyle.color,
            borderRadius: '5px',
            marginRight: '3px',
            marginBottom: '0px',
            width: '100%',
            fontSize: '10px'
          }}
        />
        <TextField
          value={invokedOutput}
          type="text"
          label="Response Body"
          variant="filled"
          size='small'
          margin="dense"
          multiline
          rows={textAreaRows}
          sx={{
            background: textAreaStyle.color,
            borderRadius: '5px',
            marginRight: '3px',
            marginBottom: '0px',
            width: '100%',
            fontSize: '10px'
          }}
        />
      </div>
    </Container>
  );
};

export default OpenFaaS;
