import React from 'react';
import ReactDOM from 'react-dom';
import TrafficConditions from './menu/Traffic';
import UpdateIndex from './menu/updateIndex';
import Drawsth from './menu/Drawsth';
import UniqueSub from './menu/UniqueSub';
import ConfigSub from './menu/ConfigSub';
import styles from './_toolBar.css';
//import * as DRAW from '../../scripts/drawtest';
import * as lmsg from '../../libs/lmsg';

class ToolBar extends React.Component {
    constructor() {
        super();
        this.state = {
            active_Update: false,
            active_Traffic: false,
            active_Unique: false,
            active_Draw: false,
            active_Config: false,
        }
        this.onChildChanged1 = this.onChildChanged1.bind(this);
        this.onChildChanged2 = this.onChildChanged2.bind(this);
        this.onChildChanged3 = this.onChildChanged3.bind(this);
        this.onChildChanged4 = this.onChildChanged4.bind(this);
        this.onChildChanged5 = this.onChildChanged5.bind(this);

    }
    componentDidMount() {


    }
    onChildChanged2(newState) {

        if (!newState.status2) {
            this.setState({
                active_Update: true,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        } else {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        }

    }
    onChildChanged1(newState) {

        if (!newState.status1) {
            this.setState({
                active_Update: false,
                active_Traffic: true,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        } else {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        }

    }
    onChildChanged3(newState) {

        if (!newState.status3) {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: true,
                active_Draw: false,
                active_Config: false
            });
        } else {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        }

    }
    onChildChanged4(newState) {

        if (!newState.status4) {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: true,
                active_Config: false
            });
            ReactDOM.unmountComponentAtNode(document.getElementById('presetBox'));
        } else {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        }
    }
    onChildChanged5(newState) {
        if (!newState.status5) {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: true
            });
        } else {
            this.setState({
                active_Update: false,
                active_Traffic: false,
                active_Unique: false,
                active_Draw: false,
                active_Config: false
            });
        }

    }

    render() {
        return (
            <div id='toolBar' className={styles.layerbox}>
                <div id="layerbox" className={styles.layerboxIn}>
                    <div id="toolBar">
                        <ul ref="toolbar">
                            <TrafficConditions isActive={this.state} callbackParent={this.onChildChanged1}/>
                            <UpdateIndex isActive={this.state} callbackParent={this.onChildChanged2}/>
                            <UniqueSub isActive={this.state} callbackParent={this.onChildChanged3}/>
                            <Drawsth isActive={this.state} callbackParent={this.onChildChanged4}/>
                            <ConfigSub isActive={this.state} callbackParent={this.onChildChanged5}/>
                        </ul>
                    </div>
                    <div id='presetBox'/>
                    </div> 
                </div>

        )
    }
}

export default ToolBar