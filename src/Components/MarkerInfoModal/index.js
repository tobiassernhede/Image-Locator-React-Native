/**--- Node Modules ---**/
import React, { Component } from 'react';
import { StyleSheet, View, Modal, Image, TouchableOpacity, Dimensions, Animated, Easing, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**--- Core ---**/
import { CONSTANTS } from 'App/Core/constants';
import { COLORS } from 'App/Core/colors';

/**--- Translations ---**/
import { translate } from 'App/Translations';

/**--- Components ---**/
import Text from 'App/Components/Text';

/**--- Constants ---**/
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const MAX_ANIM_VALUE = 100;

// https://mindthecode.com/getting-started-with-the-panresponder-in-react-native/

export default class MarkerInfoModal extends Component {

	constructor(props) {
		super(props);
		this.animateModal = new Animated.Value(MAX_ANIM_VALUE);
		this.imageInitialWidth = '100%';
		this.imageInitialHeight = '100%';
		this.state = {
			touching: false,
			infoCardHeight: 0
		}
		this._setState = function(state) {
			this.setState(state);
		}

		this.animateModal.addListener(({value}) => {
			console.log(value);
		});
	}

	componentWillMount() {
		this._panResponder = PanResponder.create({
			// Ask to be the responder:
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
			onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 5,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dy) > 5,
			onPanResponderGrant: (evt, gestureState) => {
				// The gesture has started. Show visual feedback so the user knows
				// what is happening!
				// gestureState.d{x,y} will be set to zero now
				gestureState.dy = this.animateModal._value;
			},
    		onPanResponderMove: (evt, gestureState) => {
    			Animated.event([null, {dy: this.animateModal}])(evt, gestureState);
    		},
			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				if(gestureState.dy > MAX_ANIM_VALUE / 2) {
					this.closeModal();
				} else {
					this.animateModalInitiate(1);
				}
				// The user has released all touches while this view is the
				// responder. This typically means a gesture has succeeded
			},
			onPanResponderTerminate: (evt, gestureState) => {
				// Another component has become the responder, so this gesture
				// should be cancelled
				return true;
			},
			onShouldBlockNativeResponder: (evt, gestureState) => {
				// Returns whether this component should block native components from becoming the JS
				// responder. Returns true by default. Is currently only supported on android.
				return false;
			},
	    });
	}

	componentWillReceiveProps({modalMarker}) {
		if(modalMarker && this.props.modalMarker !== modalMarker) {
			this.imageInitialHeight = this.getPercentDifference(modalMarker.height / modalMarker.width);
			this.imageInitialWidth = this.getPercentDifference(modalMarker.width / modalMarker.height);
			this.animateModalInitiate(1);
		}
		if(!modalMarker) {
			this.animateModal = new Animated.Value(MAX_ANIM_VALUE);
		}
	}

	componentWillUnmount() {
		this._setState = () => {};
	}

	getPercentDifference(diff) {
		if(diff > 1) {
			return `${diff*100}%`
		} else {
			return '100%';
		}
	}
	animateModalInitiate(value, duration = CONSTANTS.MARKER_MODAL_DURATION) {
		Animated.timing(
			this.animateModal,
			{
				toValue: value,
				duration: duration,
				easing: Easing.ease
			}).start();
	}


	closeModal() {
		if(this.animateModal._value > MAX_ANIM_VALUE) {
			this.animateModalInitiate(MAX_ANIM_VALUE, 0);
			this.props.closeModal();
		} else {
			this.animateModalInitiate(MAX_ANIM_VALUE);
			setTimeout(() => {
				this.props.closeModal();
			}, CONSTANTS.MARKER_MODAL_DURATION);
		}
	}

	renderInnerModal() {
		return (
			<Animated.View
				style={{
					flex: 1,
					backgroundColor: this.animateModal.interpolate({
						inputRange: [1, MAX_ANIM_VALUE],
						outputRange: [COLORS.MARKER_MODAL_BACKGROUND, 'transparent'],
						extrapolate: 'clamp'
					})
				}}
			>
				<TouchableOpacity
					style={{position: 'absolute', top: 20, left: 0, zIndex: 200, alignSelf: 'flex-start', height: 44, width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}
					onPress={() => this.closeModal()}
				>
					<View style={{width: 34, height: 34, borderRadius: 34, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingTop: 2}}>
					<Ionicons name="ios-close-outline" size={39} color="#ffffff" />
					</View>
				</TouchableOpacity>
				<Animated.View
					style={{
						position: 'absolute',
						justifyContent: 'center',
						alignItems: 'center',
						overflow: 'hidden',
						width: this.animateModal.interpolate({
							inputRange: [1, MAX_ANIM_VALUE],
							outputRange: [deviceWidth, CONSTANTS.MARKER_CIRCLE_SIZE - CONSTANTS.MARKER_CIRCLE_PADDING],
							extrapolate: 'clamp'
						}),
						height: this.animateModal.interpolate({
							inputRange: [1, MAX_ANIM_VALUE],
							outputRange: [deviceHeight, CONSTANTS.MARKER_CIRCLE_SIZE - CONSTANTS.MARKER_CIRCLE_PADDING],
							extrapolate: 'clamp'
						}),
						borderRadius: this.animateModal.interpolate({
							inputRange: [1, MAX_ANIM_VALUE],
							outputRange: [0, CONSTANTS.MARKER_CIRCLE_SIZE - CONSTANTS.MARKER_CIRCLE_PADDING],
							extrapolate: 'clamp'
						}),
						left: this.animateModal.interpolate({
							inputRange: [1, MAX_ANIM_VALUE],
							outputRange: [0, this.props.modalMarker.measure.px + 5],
							extrapolate: 'clamp'
						}),
						top: this.animateModal.interpolate({
							inputRange: [1, MAX_ANIM_VALUE],
							outputRange: [0, this.props.modalMarker.measure.py + 5],
							extrapolate: 'clamp'
						}),
					}}
				>
					<Animated.Image
						style={
							{
								position: 'absolute',
								width: this.animateModal.interpolate({
									inputRange: [1, MAX_ANIM_VALUE],
									outputRange: ['100%', this.imageInitialWidth],
									extrapolate: 'clamp'
								}),
								height: this.animateModal.interpolate({
									inputRange: [1, MAX_ANIM_VALUE],
									outputRange: ['100%', this.imageInitialHeight],
									extrapolate: 'clamp'
								}),
								resizeMode: 'contain'
							}
						}
						source={{uri: this.props.modalMarker.image}}
					/>
				</Animated.View>
				<Animated.View
					style={[
						styles.modalInfo,
						{
							bottom: this.animateModal.interpolate({
								inputRange: [0, MAX_ANIM_VALUE / 2],
								outputRange: [0, -this.state.infoCardHeight],
								extrapolate: 'clamp'
							})
						}
					]}
				>
					<View
						style={styles.modalInfoInner}
						onLayout={(event) => {
							console.log(event.nativeEvent.layout);
							this._setState({infoCardHeight: event.nativeEvent.layout.height})
							console.log(this.infoCardHeight);
						}}
					>
						<Text style={styles.modalInfoInnerText}>
							<Text style={styles.modalInfInnerTextBold}>{translate('Date')}:</Text> {this.props.modalMarker.exif.DateTimeOriginal}
						</Text>
					</View>
				</Animated.View>
			</Animated.View>
		);
	}

    render() {
        return (
        	<Modal
        		visible={this.props.modalMarker ? true : false}
        		transparent={true}
        	>
        		<View
        			{...this._panResponder.panHandlers}
        			style={{flex: 1}}
        		>
    			{this.props.modalMarker && this.renderInnerModal()}
        		</View>
        	</Modal>
        );
    };
}

const styles = StyleSheet.create({
	modalInfo: {
		position: 'absolute',
		paddingHorizontal: 10,
		width: '100%'
	},
	modalInfoInner: {
		backgroundColor: '#ffffff',
		padding: 20,
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5
	},
	modalInfoInnerText: {
		color: '#222222'
	},
	modalInfInnerTextBold: {
		fontWeight: 'bold',
		color: '#222222'
	}
});