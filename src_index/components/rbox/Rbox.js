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
        this.crsBtnClick = this.crsBtnClick.bind(this);
        this.renderList = this.renderList.bind(this);
    }
    contractionBtnClick() {
        this.setState({
            contraction: !this.state.contraction
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.search.keyword) {
            this.setState({
                contraction: false,
                initCraResults: true
            });
        }
    }
    renderList() {
        let rboxkey = this.props.search.rboxKey;
        let dataRec = null;
        switch (rboxkey) {
            case 'search':
                dataRec = this.props.search.list;
                return React.createElement(SearchResults, dataRec, rboxkey);
            case 'cross':
                dataRec = this.props.cra.cralist;
                CI.addGracLayer(rboxkey, dataRec);
                return React.createElement(CraResults, dataRec, rboxkey);
            case 'road':
                dataRec = this.props.cra.cralist;
                CI.addGracLayer(rboxkey, dataRec);
                return React.createElement(CraResults, dataRec, rboxkey);
            case 'area':
                dataRec = this.props.cra.cralist;
                CI.addGracLayer(rboxkey, dataRec);
                return React.createElement(CraResults, dataRec, rboxkey);
            default:
                break;
        }
    }
    crsBtnClick(layerName, t) {
        let self = this;
        this.setState({
            initCraResults: true,
            contraction: false
        });
        this.props.fetchCRAList(layerName, t);

        let audio = document.getElementById("mp3Player");
        /* audio.pause();
         audio.currentTime = 0;*/
        //console.log(audio.paused)
        Ds.DataService('/trafficindex_cross/panduanIndex.do', {
            bs: layerName
        }, (resp) => {

            if (resp.aaData == 0) {

                if (audio.paused) {
                    audio.currentTime = 0;
                    audio.play();
                }

            } else if (resp.aaData == 1) {

                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }


            }
        }, (e) => {
            console.log(e);
            message.error('后台传输错误')
        });


    }
    render() {
        let {
            page,
            totalPage,
            dispatch
        } = this.props;
        let searchAvtive = (this.props.searchValue === "");
        const cfydTableContent =
            [{
                title: '排名',
                dataIndex: 'No',
            }, {
                title: '拥堵名称',
                dataIndex: 'Name',
            }, {
                title: '拥堵时间',
                dataIndex: 'ydjls',
            }, {
                title: '缓行时间',
                dataIndex: 'hxjls',
            }, {
                title: '畅通时间',
                dataIndex: 'ctjls',
            }];

        const sectionPanel = this.state.initCraResults ? [
            <section key={"rboxPanels1"} id="rboxPanels" className={styles.rboxPanels}>
                        <ul id='nav' className={styles.nav}>
                            <li id='cross' ref='cross' className={styles.craLi} onClick={() => {this.crsBtnClick('cross')} }>
                                <span className={styles.navTxt}>路口</span>
                            </li>
                            <li id='road' ref='road' className={styles.craLi} onClick={() => this.crsBtnClick('road') }>
                                <span className={styles.navTxt}>路段</span>
                            </li>
                            <li id='area' ref='area' className={styles.craLi} onClick={() => this.crsBtnClick('area') }>
                                <span className={styles.navTxt}>区域</span>
                            </li>
                        </ul>
                        <div id='resultPanel' className={styles.resultPanel}>
                            {this.renderList()}  
                        </div>
                    </section>
        ] : this.state.isCFYDpanel ? [
            <section key={'rboxPanels2'} id="rboxPanels2" className={styles.rboxPanel2}>
                <Table columns={cfydTableContent} dataSource={this.state.cfydTabledata} size='middle' pagination={false}/>
            </section>
        ] : [<section key={"rboxPanels3"} id="rboxPanels" className={styles.rboxPanels}></section>];
        return (<div id="rbox" className={ styles.rbox }>
  <div><audio id='mp3Player'><source src={_imagePath +'/sweet.mp3'} type="audio/mp3"/></audio></div>
  <div
       id="navBody"
       className={ this.state.contraction ? styles.navBody_none : styles.navBody_display }>
    { sectionPanel }
    </div>
      <div
            id="contractionBtn"
            className={ styles.rboxPanCtrl }
            onClick={ () => this.contractionBtnClick() }>
        <i
           className={ styles.fa + ' ' + styles.faChevronUp }
           id="contractionInsideBtnUp"></i>
        </div>
          </div>)
    }

    componentDidMount() {
        //self的是代表整个component的this，如果是lmsg的，就错了
        let self = this;
        lmsg.subscribe('crsBtnClick', (data) => {
            ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            console.log('crsBtnClick', data);
            self.setState({
                contraction: false,
                initCraResults: true
            });
            self.crsBtnClick(data.params, data.time);

            localStorage.removeItem('crsBtnClick');
        });

        lmsg.subscribe('jrlzbbSend', (data) => {
            console.log('jrlzbbSend', data);
            ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            Ds.DataService('/trafficindex_map/initMap.do', {
                querytime: data.time
            }, (resp) => {
                CI.initMapLayer(resp.aaData);
                self.setState({
                    contraction: true,
                    initCraResults: false,
                    isCFYDpanel: false
                });
            }, (e) => {
                console.log(e);
                message.error('后台传输错误', 5);
            });

            localStorage.removeItem('jrlzbbSend');
        });

        lmsg.subscribe('cfxydBtnClick', (data) => {
            ReactDOM.unmountComponentAtNode(document.getElementById('presetBox'));
            console.log('cfxydBtnClick', data);
            self.setState({
                cfydTabledata: []
            });
            if (data.isCross == 1) {
                CI.displayUniLayer('yongdu_cross', data.time);
                //路口
                Ds.DataService('/trafficindex_recurrentCongestionCross/listQueryTheRankOfCongestionCrossTopTen.do', data.time, (resp) => {
                    var cfydTabledata = [];
                    if (!resp.aaData) message.warning('没有相应信息', 3);
                    else {

                        for (var i = 0; i < resp.aaData.length; i++) {
                            cfydTabledata.push({
                                No: i + 1,
                                Name: resp.aaData[i].crossName,
                                ctjls: resp.aaData[i].ctjls,
                                hxjls: resp.aaData[i].hxjls,
                                ydjls: resp.aaData[i].ydjls
                            });
                        }
                        self.setState({
                            initCraResults: false,
                            isCFYDpanel: true,
                            contraction: true,
                            cfydTabledata: cfydTabledata
                        });
                    }
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });

            } else if (data.isCross == 2) {
                CI.displayUniLayer('yongdu_road', data.time);
                //路段
                Ds.DataService('/trafficindex_recurrentCongestionRoad/listQueryTheRankOfCongestionRoadTopTen.do', data.time, (resp) => {
                    var cfydTabledata = [];
                    if (!resp.aaData) message.warning('没有相应信息', 3);
                    else {

                        for (var i = 0; i < resp.aaData.length; i++) {
                            cfydTabledata.push({
                                No: i + 1,
                                Name: resp.aaData[i].roadName,
                                ctjls: resp.aaData[i].ctjls,
                                hxjls: resp.aaData[i].hxjls,
                                ydjls: resp.aaData[i].ydjls
                            });
                        }
                        self.setState({
                            initCraResults: false,
                            isCFYDpanel: true,
                            contraction: true,
                            cfydTabledata: cfydTabledata
                        });
                    }
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });
            } else message.error('双屏通讯错误', 5);
            localStorage.removeItem('cfxydBtnClick');
        });

        lmsg.subscribe('locating_start', () => {
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            localStorage.removeItem('locating_start');
        });
        lmsg.subscribe('tracktaxi', () => {
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            localStorage.removeItem('tracktaxi');
        });
        lmsg.subscribe('ODClick_start', (data) => {
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            localStorage.removeItem('ODClick_start');
        });
        lmsg.subscribe('peizhi_start', (data) => {
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            localStorage.removeItem('peizhi_start');
        });
        lmsg.subscribe('hbjjrToMap_start', (data) => {
            self.setState({
                contraction: true,
                initCraResults: false,
                isCFYDpanel: false
            });
            localStorage.removeItem('hbjjrToMap_start');
        });

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