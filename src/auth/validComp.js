import React from 'react'
import { View, Text } from 'react-native'

const ValidComp = ({ message,inValid }) => {
    return (
        <View style={{ flex: 1,height:"100%",width:'100%', backgroundColor: `${!inValid ? 'green' : 'red'}`, alignContent: 'center', alignItems: 'center' }}>
            {
                !inValid ? (
                    <View style={{flex:1,padding:25}}>
                        <Text style={{
                            textAlign: 'center',
                            color: 'white',
                            marginTop: 300,
                            fontSize: 28,
                            padding:10,
                            fontWeight:'bold',
                            flexWrap: 'wrap'
                        }}>
                            {message}
                        </Text>
                        <Text style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: 24,
                            fontWeight:'bold'
                        }}>
                            Welcome to BAPS
                        </Text>
                    </View>
                ) : (
                    <View style={{flex:1,padding:25}}>
                        <Text style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: 24,
                            marginTop: 350,
                            fontWeight:'bold',
                            flexWrap: 'wrap'
                        }}>
                          Please Check With The Security!
                        </Text>
                        </View>
                )
            }

        </View>
    )
}

export default ValidComp