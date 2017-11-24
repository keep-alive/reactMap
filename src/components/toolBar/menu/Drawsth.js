import React from 'react';
import ReactDOM from 'react-dom';
import * as DR from '../../../scripts/drawFeatures';
import * as CI from '../../../scripts/CongestionIndex';
import styles from '../_toolBar.css';

class Drawsth extends React.Component {
    constructor() {
        super();
        this.state = {
            active: null
        }

    }
    componentWillMount() {
        this.setState({
            active: this.props.isActive.active_Draw
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            active: nextProps.isActive.active_Draw
        });
        if (!nextProps.isActive.active_Draw) DR.drawFeatures.disable();
    }
    startDrawing() {
        this.setState({
            active: !this.state.active
        });
        if (this.state.active) {
            DR.drawFeatures.disable();
            CI.clearLayer();
        } else DR.drawFeatures.activate();

        this.props.callbackParent({
            status1: !this.state.active,
            status2: !this.state.active,
            status3: !this.state.active,
            status4: this.state.active,
            status5: !this.state.active,
        });
    }
    render() {
        return (
            <div>
        <li id="ranging" onClick={() => this.startDrawing() }>
                    <div type="ranging">
                        <span className={this.state.active ? styles.ranging_active : styles.ranging}>绘图</span>
                    </div>
                </li>
            </div>

        )
    }
    componentDidMount() {

    }

}
export default Drawsth