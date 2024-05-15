import { StyleSheet, Text, View, SafeAreaView, TextInput, Alert, TouchableHighlight } from 'react-native'
import { useState, useEffect } from 'react'
import {Picker} from '@react-native-picker/picker';

import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSIONS = {
	USD: {
		EUR: 0.85,
		GBP: 0.73,
		JPY: 110.0,
	},
	EUR: {
		USD: 1.18,
		GBP: 0.86,
		JPY: 129.0,
	},
	GBP: {
		USD: 1.37,
		EUR: 1.16,
		JPY: 150.0,
	},
	JPY: {
		USD: 0.0091,
		EUR: 0.0078,
		GBP: 0.0067,
	},
}

const App = () => {
	const [amount, setAmount] = useState('')
	const [updatedAmount, setUpdatedAmount] = useState('')
	const [fromCurrency, setFromCurrency] = useState('USD')
	const [toCurrency, setToCurrency] = useState('EUR')
	const [loading, setLoading] = useState(true)

	const setStorage = async (value) => {
		try {
			const data = [
				['amount', value],
				['fromCurrency', fromCurrency],
				['toCurrency', toCurrency],
			]

			// console.log('set', data)
			await AsyncStorage.multiSet(data)
		} catch (e) {
			console.log(e)
		}
	}

	const clearStorage = async () => {
		try {
			await AsyncStorage.clear()
		} catch (e) {
			console.log(e)
		}
	}

	const convertCurrency = (value, from, to) => {
		if(from === to){
			setUpdatedAmount(value)
			return
		}
		const convertedAmount = value * CONVERSIONS[from][to]
		setUpdatedAmount(convertedAmount)
	}

	const handleChange = (value) => {
		if(!/^\d*\.?\d*$/.test(value)){
			Alert.alert('Error','Please enter a valid amount');
			setAmount('')
			setUpdatedAmount('')
			return
		}

		setAmount(value)
		convertCurrency(value, fromCurrency, toCurrency)
		setStorage(value)
	}

	useEffect(() => {
		const getStorage = async () => {
			try {
				const data = await AsyncStorage.multiGet(['amount', 'fromCurrency', 'toCurrency'])
				// console.log('get', data)

				if(data[0][1]){ setAmount(data[0][1]) }
				if(data[1][1]){ setFromCurrency(data[1][1]) }
				if(data[2][1]){ setToCurrency(data[2][1]) }

				convertCurrency(data[0][1], data[1][1], data[2][1]);
			} catch (e) {
				console.log(e)
			}
		}

		getStorage()
		setLoading(false)
	}, [])

	useEffect(() => {
		const changeCurrency = async () => {
			try{
				const data = [
					['fromCurrency', fromCurrency],
					['toCurrency', toCurrency],
				]
				// console.log('change', data)
				await AsyncStorage.multiSet(data)
			}
			catch(e){
				console.log(e)
			}
		}
		
		if(!loading){
			changeCurrency()
			convertCurrency(amount, fromCurrency, toCurrency)
		}
	}, [fromCurrency, toCurrency])

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.h1}>Currency Converter</Text>
				<View style={styles.select}>
					<Text style={{fontSize: 20}}>From:</Text>
					<Picker
						selectedValue={fromCurrency}
						onValueChange={(itemValue) => setFromCurrency(itemValue)}
						style={{height: 50, width: 150}}
					>
						{Object.keys(CONVERSIONS).map((currency) => (
							<Picker.Item key={currency} label={currency} value={currency} />
						))}
					</Picker>
				</View>
				<TextInput
					style={styles.input}
					value={amount}
					onChangeText={handleChange}
					keyboardType="numeric"
					placeholder='Enter amount'
				/>
				<View style={styles.select}>
					<Text style={{fontSize: 20}}>To:</Text>
					<Picker
						selectedValue={toCurrency}
						onValueChange={(itemValue) => setToCurrency(itemValue)}
						style={{height: 50, width: 150}}
					>
						{Object.keys(CONVERSIONS).map((currency) => (
							<Picker.Item key={currency} label={currency} value={currency} />
						))}
					</Picker>
				</View>

				<Text style={styles.updatedAmount}>{updatedAmount ? updatedAmount : 'Result'}</Text>
				
				<View style={{flexDirection:'row', justifyContent:'space-around', width: '120%', margin:40}}>
					<TouchableHighlight
						style={styles.button}
						underlayColor='#8fc0c7'
						onPress={() => {
							let temp = fromCurrency
							setFromCurrency(toCurrency)
							setToCurrency(temp)
						}}
					>
						<Text style={{fontSize: 20}}>Swap</Text>
					</TouchableHighlight>
					<TouchableHighlight
						style={styles.button}
						underlayColor='#8fc0c7'
						onPress={() => {
							setAmount('')
							setUpdatedAmount('')
							clearStorage()
						}}
					>
						<Text style={{fontSize: 20}}>Clear</Text>
					</TouchableHighlight>
				</View>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#e1edf0',
		alignItems: 'center',
		justifyContent: 'center',
	},
	h1: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	input: {
		width: '80%',
		borderColor: 'gray',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	updatedAmount: {
		width: '80%',
		borderColor: 'gray',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	select: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '80%',
		marginTop: 30,
	},
	button: {
		width: 100,
		marginTop: 30,
		backgroundColor: 'lightblue',
		padding: 10,
		alignItems: 'center',
	}
})