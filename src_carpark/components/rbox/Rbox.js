import React from 'react';
import ReactDOM from 'react-dom';
import {
    connect
} from 'react-redux';
import * as action from '../../actions/searchAction';
import styles from './_rbox.css';
import * as CI from '../../scripts/CongestionIndex';
import SearchResults from './menu/SearchResults';
import CraResults from './menu/CraResults';
import * as lmsg from '../../libs/lmsg';
import * as Ds from '../../libs/DataService';
import * as DR from '../../scripts/drawFeatures';
/*import drawFeature from '../../scripts/lrDraw';*/
import {
    Table,
    message
} from 'antd';

class Rbox extends React.Component {
    constructor() {
        super();
        this.state = {
                contraction: false,
                initCraResults: true,
                isCFYDpanel: false,
                cfydTabledata: []
            }
            /*this.crsBtnClick = this.crsBtnClick.bind(this);
            this.renderList = this.renderList.bind(this);*/
    }
    contractionBtnClick() {
        this.setState({
            contraction: !this.state.contraction
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.search.keyword) {
            this.setState({
                contraction: true,
                initCraResults: true
            });
        }
    }

    render() {
        let {
            page,
            totalPage,
            dispatch
        } = this.props;
        let searchAvtive = (this.props.searchValue === "");

        return (<div id="rbox" className={ styles.rbox }>
                    <div id="navBody" className={ this.state.contraction ? styles.navBody_none : styles.navBody_display }>
                        <section key={"rboxPanels3"} id="rboxPanels" className={styles.rboxPanels}></section>
                    </div>
                    <div id="contractionBtn" className={ styles.rboxPanCtrl } onClick={ () => this.contractionBtnClick() }>
                        <i className={ styles.fa + ' ' + styles.faChevronUp } id="contractionInsideBtnUp"></i>
                    </div>
                </div>)
    }

    componentDidMount() {
        //self的是代表整个component的this，如果是lmsg的，就错了
        let self = this;
        //停车场页面逻辑/监听
        lmsg.subscribe('carpark_init', () => {
            console.log('carpark_init');
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            message.success('停车场页面');
            DR.drawFeatures.disable();
            CI.displayCarParkLayer();
            localStorage.removeItem('carpark_init');
        });
        lmsg.subscribe('carpark_start', () => {
            console.log('carpark_start');
            message.success('请点击右侧工具来进行定位', 10);
            DR.carParkLocating();
            localStorage.removeItem('carpark_start');
        });
        lmsg.subscribe('carpark_tr', (data) => {
            console.log('carpark_tr', data);
            CI.selectCarparkById(data.id);
            localStorage.removeItem('carpark_tr');
        });
    }

}



function mapStateToProps(state) {
    return {
        search: state.search,
        cra: state.cra
    }
}
export default connect(mapStateToProps, action)(Rbox);