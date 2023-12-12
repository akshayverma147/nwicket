import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import ValidComp from './src/auth/validComp';
import logo from './assets/logoBAPS.jpeg'
// import axios from 'axios'
// import ImageManipulator from 'expo-image-manipulator';
// import compress from 'react-native-compressor';
import * as ImageManipulator from 'expo-image-manipulator';
import cameraIcon from './assets/diaphragm.png'


export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [inValid, setInvalid] = useState(false);
  const [message, setMessage] = useState("")
  const [isCameraReady, setCameraReady] = useState(null)

  useEffect(() => {
    (async () => {
      await getPermission()
    })();
  }, []);

  const getPermission= async()=>{
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }

  useEffect(()=>{
    if(hasPermission==null){
      getPermission()
   }
  })

  // useEffect(() => {
  //   if (hasPermission && cameraRef.current) {
  //     setTimeout(() => takePicture(), 3000)
  //   }
  // }, [hasPermission, cameraRef.current,inValid,message])



  const APICall = async (image) => {
    console.log("API requested!");
    setLoading(true)
    const local = "http://192.168.1.5:2023"
    const server = "https://nwicket-7a54fd82966f.herokuapp.com"
    const originalImagePath = `data:image/png;base64,${image?.base64}`;
    // Resize the image
    // const resizedPhoto = await ImageManipulator.manipulateAsync(
    //   originalImagePath,
    //   [{ resize: { width: 500 } }],
    //   { compress: 0.8, format: 'jpeg' } // Adjust compression and format as needed
    // );

    const manipResult = await ImageManipulator.manipulateAsync(
      originalImagePath,
      [{ resize: { width: 300, height: 300 } }],{
        compress:0.8,base64:true
      }
  );

    // console.log("image", manipResult?.base64);
    const finalBaseURL = `data:image/png;base64,${manipResult?.base64}`
    console.log("finalBaseURL",finalBaseURL);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({ photoBase64:finalBaseURL})
    };

  return fetch(server + "/api/v1/face_match", requestOptions)
      .then(response => response.json())
      .then(res => {
        console.log("then",res);
        if (res  && res?.errorMessage) {
          // Alert.alert('Face recognized successfully!', res.data.result);
          setMessage(res?.errorMessage)
          setInvalid(true);
          setTimeout(() => { setInvalid(false);setMessage("");setLoading(false)}, 3000)
        } else if(res  && res?.result){
          setMessage(res?.result)
          setInvalid(false);
          setTimeout(() => { setInvalid(false);setMessage("");setLoading(false)}, 3000)
        }else{
          // console.log("Error", res.data.message,res);
          setMessage("Something went wrong")
          setInvalid(true)
          setTimeout(() => { 
            setMessage("")
          setInvalid(false)
            setLoading(false)   
          }, 3000)
        }
      }).catch(e => {
        console.log("catch",e);
        if (e.response?.data && e.response?.data["errorMessage"]) {
          setMessage(e.response?.data["errorMessage"])
          setInvalid(true)
          setTimeout(() => { 
            setMessage("")
            setInvalid(false)
            setLoading(false)   
          }, 3000)
          // Alert.alert('Failed to recognize face', e.response?.data["errorMessage"]);
        } else if(e?.response?.data.message){
          setMessage(e.response.data.message)
          setInvalid(true)
          setTimeout(() => { 
            setMessage("")
            setInvalid(false)
            setLoading(false)   
          }, 3000)
          // Alert.alert('Failed to recognize face', "Unable to call the API");
        }else{
          console.log(e)
          setInvalid("Unable to match face")
        }
        setTimeout(() => {setMessage(""); setInvalid("");setLoading(false)}, 3000)
      });
  }

  const takePicture = async (faces) => {
    if (cameraRef.current && !isLoading) {
      console.log("faces",faces)
      try {
        // const photo = await cameraRef.takePictureAsync({ base64: true, exif: true, quality: 0.1, id: 2 });

        const options = { quality: 0.1, base64: true, scale: 0.1};
        const data = await cameraRef.current.takePictureAsync(options);

        // Process the picture data
        // console.log('Picture data:', data);
        if (data) {
          //call the API
          APICall(data)
        }
      } catch (e) {
        console.log(e)
      }
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignContent: 'center', alignItems: 'center' }}>
      {!message && <View style={{ flex: 0.6,marginBottom:0 }}>
        <Image source={logo} style={{ width: 100,marginBottom:10, height: 100, marginTop: 26, borderRadius: 100 }} />
      </View>}
       {!message && <Text style={{fontSize:20,fontWeight:'bold',marginBottom:'8%',}}>Please Face The Kiosk</Text>}
      {
        message ? <ValidComp inValid={inValid} message={message} /> : <View style={{ height: "60%", width: '80%', borderWidth: 3, borderBlockColor: '#000', borderRadius: 5 }}>
          <Camera
            style={{ flex: 1 }}
            onCameraReady={(e)=>setCameraReady(e)}
            autoFocus={Camera.Constants.AutoFocus.on}
            type={Camera.Constants.Type.front}
            ref={cameraRef}
            focusable
            ratio='1:1'
            shouldRasterizeIOS
            faceDetectorSettings={{
              mode: 1, // or Camera.Constants.FaceDetection.Mode.accurate
              detectLandmarks: 1, // or Camera.Constants.FaceDetection.Landmarks.all
              runClassifications: 1, // or Camera.Constants.FaceDetection.Classifications.all,
              tracking:true
            }}
            faceDetectorEnabled={true}
            onFacesDetected={(e)=>takePicture(e)}
          >
            <View
              style={{
                flex: 1
                , borderRadius: 50,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={takePicture}
              >
                {!isLoading?<Image source={cameraIcon} style={{ marginBottom: 15, paddingLeft: 10, paddingEnd: 10,opacity:1, paddingTop: 5, paddingBottom: 5,borderRadius:5 }}>
                  
                </Image>:<Text style={{color:'#fff',marginBottom:20,fontSize:20,fontWeight:'bold'}}>Scanning...</Text>}
              </TouchableOpacity>
            </View>
          </Camera>

        </View>}

    </View>
  );
}
