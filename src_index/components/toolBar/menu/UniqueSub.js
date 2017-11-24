import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../_toolBar.css';
import UniqueStyles from './_UniqueSub.css'
import * as CI from '../../../scripts/CongestionIndex';
/*import * as gb from '../../../scripts/mapGetBound';*/
import * as DR from '../../../scripts/drawFeatures';
import * as lmsg from '../../../libs/lmsg';
import * as lmap from '../../../libs/lmap';
import * as Ds from '../../../libs/DataService';
import {
    connect
} from 'react-redux';

import {
    Button,
    Icon,
    Popover,
    Modal,
    message
} from 'antd';

const ButtonGroup = Button.Group;
var taxiInterval = null;
class UniqueSub extends React.Component {
    constructor() {
        super();
        this.state = {
            active: null
        }
    }
    componentWillMount() {
        this.setState({
            active: this.props.isActive.active_Unique
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            active: nextProps.isActive.active_Unique
        });
    }
    mountTrafficConditions() {
        this.setState({
            active: !this.state.active
        });
        if (!document.getElementById('uniqueDetails')) {
            this.setState({
                active: !this.state.active
            });
            ReactDOM.render(
                <UniquePanel/>, document.getElementById("presetBox")
            )
        } else {
            this.setState({
                active: !this.state.active
            });
            ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"))
        }
        this.props.callbackParent({
            status1: !this.state.active,
            status2: !this.state.active,
            status3: this.state.active,
            status4: !this.state.active,
            status5: !this.state.active,
        });
    }
    render() {
        return (

            <div>
        <li ref="startUnipanel" id="trafficConditions" onClick={() => this.mountTrafficConditions() }>
                    <div type="subway">
                        <span className={this.state.active ? styles.subway_active : styles.subway}>专题</span>
                    </div>
                </li>
            </div>
        )
    }
    componentDidMount() {
        let self = this;
        lmsg.subscribe('searchFdc', (data) => {
            console.log('searchFdc', data);
            message.success('启动查询');
            CI.searchFdc(data);


            //else message.warning("追踪参数错误！", 5);
            localStorage.removeItem('searchFdc');
        });


        lmsg.subscribe('locating_start', (data) => {
            if (document.getElementById("presetBox").children.length > 0) {
                ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            }
            ReactDOM.render(
                <UniquePanel/>, document.getElementById("presetBox")
            )
            localStorage.removeItem('locating_start');
        });
        lmsg.subscribe('tracktaxi', (data) => {
            console.log('tracktaxi', data);
            message.success('您已进入追踪浮动车页面');
            if (data.startTracking) {
                if (!data.params.id) {
                    message.warning('没有选中的浮动车', 5);
                } else {
                    var tracktaxi11 = CI.trackingTaxi(data.params);
                    if (tracktaxi11) {
                        taxiInterval = setInterval(() => {
                            CI.trackingTaxi(data.params);
                        }, 60005)
                    } else taxiInterval = null;
                }
            } else if (!data.startTracking) CI.stopTrackingTaxi();
            else message.warning("追踪参数错误！", 5);
            localStorage.removeItem('tracktaxi');
        });
        lmsg.subscribe('cfxydBtnClick_start', (data) => {
            if (document.getElementById("presetBox").children.length > 0) {
                ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            }
            ReactDOM.render(
                <UniquePanel/>, document.getElementById("presetBox")
            )
            localStorage.removeItem('cfxydBtnClick_start');
        });
        lmsg.subscribe('ODClick_start', (data) => {
            if (document.getElementById("presetBox").children.length > 0) {
                ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            }
            ReactDOM.render(
                <UniquePanel/>, document.getElementById("presetBox")
            );
            localStorage.removeItem('ODClick_start')
        });
        lmsg.subscribe('hbjjrToMap_start', (data) => {
            if (document.getElementById("presetBox").children.length > 0) {
                ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"));
            }
            ReactDOM.render(
                <UniquePanel/>, document.getElementById("presetBox")
            );
            localStorage.removeItem('hbjjrToMap_start');
        });

    }
}



var _APIpath = null;

var showModalWarning = () => {
    Modal.warning({
        title: '定位已经启动',
        content: '请点击屏幕右侧画图工具定位地图信息',
    });
}

class UniquePanel extends React.Component {
    constructor() {
        super();
        this.onClickButton = this.onClickButton.bind(this);
        this.state = {
            disabled: false,
            cfydData: null
        };

    }
    onClickButton(ref, data) {
        lmap.removeEchartsLayer();
        CI.displayUniLayer(ref, data);
    }
    OD(data) {
        /*var data = {
            qssj: '2016-09-05',
            sd: '00:00-10:00',
            fx: '1'
        }*/
        if (data) {
            let params = {
                qssj: data.qssj,
                sd: data.sd,
                fx: data.flags
            }
            var dataRecv = null;
            Ds.DataService('/trafficindex_bodcollisionflowresult/migrationMap.do', params, (resp) => {
                dataRecv = resp.aaData;
                return dataRecv;
            }, (e) => {
                console.log(e);
                message.error('后台传输错误', 5);
            });

            if (!dataRecv || !dataRecv.dataLine || dataRecv.dataLine.length == 0) {
                message.warning('没有相应地图数据');
                CI.clearLayer();
            } else {
                CI.clearLayer();
                var overlay = new lmap.echartsLayer('ODLayer', echarts);
                var chartsContainer = overlay.getEchartsContainer();
                var myChart = overlay.initECharts(chartsContainer);
                window.onresize = myChart.onresize;

                var option = {
                    color: ['gold', 'aqua', 'lime'],
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}'
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: ['北京 Top10'],
                        selectedMode: 'single',
                        selected: {
                            '上海 Top10': false,
                            '广州 Top10': false
                        },
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    dataRange: {
                        min: 0,
                        max: 100,
                        //calculable: true,
                        color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: [{
                        name: 'OD分析',
                        type: 'map',
                        mapType: 'none',
                        data: [],
                        geoCoord: eval('(' + dataRecv.geoCoord + ')'),
                        markLine: {
                            smooth: true,
                            effect: {
                                show: true,
                                scaleSize: 1,
                                period: 30,
                                color: '#fff',
                                shadowBlur: 10
                            },
                            itemStyle: {
                                normal: {
                                    borderWidth: 1,
                                    lineStyle: {
                                        type: 'solid',
                                        shadowBlur: 10
                                    }
                                }
                            },
                            data: dataRecv.dataLine
                        },
                        markPoint: {
                            symbol: 'emptyCircle',
                            symbolSize: function(v) {
                                return 10 + v / 10
                            },
                            effect: {
                                show: true,
                                shadowBlur: 0
                            },
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        position: 'top'
                                    }
                                }
                            },
                            data: dataRecv.dataPoint
                        }
                    }]
                };
                overlay.setOption(option);
                map.setView(map.getCenter());
            }
        } else return;
    }
    componentDidMount() {
        let self = this;

        lmsg.subscribe('locating', (data) => {
            console.log('locating', data);
            switch (data.params) {
                case 'shigong':
                    message.success('您已进入道路施工页面');
                    DR.drawFeatures.disable();
                    self.onClickButton("shigong");
                    //self.refs.shigong.props.onClick();
                    break;
                case 'shigong_start':
                    //self.refs.shigong.props.onClick();
                    showModalWarning();
                    DR.drawFeatures.activate();
                    break;
                case 'guanzhi':
                    message.success('您已进入交通管制页面');
                    DR.drawFeatures.disable();
                    //self.refs.guanzhi.props.onClick();
                    self.onClickButton("guanzhi");
                    break;
                case 'guanzhi_start':
                    showModalWarning();
                    DR.drawFeatures.activate();
                    break;
                case 'shigu':
                    message.success('您已进入交通事故页面');
                    DR.drawFeatures.disable();
                    self.onClickButton("shigu");
                    //self.refs.shigu.props.onClick();
                    break;
                case 'shigu_start':
                    showModalWarning();
                    DR.drawFeatures.activate();
                    break;
                case 'fdc':
                    message.success('您已进入浮动车页面');
                    self.onClickButton("fudongche");
                    //self.refs.fudongche.props.onClick();
                    break;
                default:
                    return;
            }

            localStorage.removeItem('locating');
        });


        /* lmsg.subscribe('cfxydBtnClick', (data) => {
             console.log('cfxydBtnClick', data);
             //message.success('您已进入常发拥堵界面');
             if (data.isCross == 1) {
                 //路口
                 self.onClickButton('yongdu_cross', data.time);
                 //self.refs.yongduPop.props.content.props.children[1].props.onClick(); //yongdu_cross
             } else if (data.isCross == 2) {
                 //路段
                 self.onClickButton('yongdu_road', data.time);
                 //self.refs.yongduPop.props.content.props.children[0].props.onClick(); //yongdu_road
             } else message.error('双屏通讯错误', 5); //alert('双屏通讯错误');
             localStorage.removeItem('cfxydBtnClick');
         });*/
        lmsg.subscribe('ODClick', (data) => {
            console.log('ODClick', data);
            message.success('您已进入OD分析页面');
            self.OD(data);
            localStorage.removeItem('ODClick');
        });
        lmsg.subscribe('hbjjrToMap', (data) => {
            console.log('hbjjrToMap', data)
            localStorage.removeItem('hbjjrToMap');
            if (data.messageType == '0' || data.messageType == '1' || data.messageType == '2' || data.messageType == '3') {
                message.success('您已进入节假日页面');
                //清空图层
                CI.clearLayer();
            } else if (data.messageType == '4') {
                switch (data.messageData.ztType) {
                    case "1":
                        self.onClickButton('jiari_zone', data.messageData);
                        break;
                    case "2": //路口
                        self.onClickButton('jiari_cross', data.messageData);
                        break;
                    case "3": //路段
                        self.onClickButton('jiari_road', data.messageData);
                        break;
                }


            } else if (data.messageType == '5') {

                //新增区域
                DR.drawFeatures.disable();
                Modal.success({
                    title: '定位已经启动',
                    content: '请点击屏幕右侧画图工具定位区域信息',
                });

                Ds.DataService('/trafficindex_map/listHolidayMap.do', null, (resp) => {
                    CI.displayCommonLayer(resp.aaData);
                    DR.DrawHoliday.drawRegion();
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });

            } else if (data.messageType == '6') {
                //编辑区域
                DR.drawFeatures.disable();
                Modal.success({
                    title: '定位已经启动',
                    content: '请点击屏幕右侧画图工具定位区域信息',
                });
                var params = {
                    id: data.messageData.qybh
                }
                Ds.DataService('/trafficindex_map/gotoHolidayMap.do', params, (resp) => {
                    CI.displayCommonLayer(resp.aaData);
                    DR.DrawHoliday.drawRegion();
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });

            } else if (data.messageType == '7') {
                DR.drawFeatures.disable();
                Modal.success({
                    title: '定位已经启动',
                    content: '请点击屏幕右侧画图工具圈选包含的道路路口',
                });
                //新增路口
                Ds.DataService('/trafficindex_map/listCrossMap.do', null, (resp) => {
                    CI.displayCommonLayer(resp.aaData); //展示路口
                    DR.DrawHoliday.selectCross(resp.aaData);
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });

            } else if (data.messageType == '8') {
                DR.drawFeatures.disable();
                Modal.success({
                    title: '定位已经启动',
                    content: '请点击屏幕右侧画图工具圈选包含的道路',
                });
                //新增路段
                Ds.DataService('/trafficindex_map/roadMap.do', null, (resp) => {
                    CI.displayConfigLayer_road(resp.aaData); //复合路段
                    DR.DrawHoliday.selectRoad(resp.aaData);
                }, (e) => {
                    console.log(e);
                    message.error('后台传输错误', 5);
                });
            }
        });

    }
    componentWillMount() {

    }
    PrintMap() {
        lmap.printMap('#rbox,#search,#toolBar')
    }
    componentWillUnmount() {
        lmap.removeEchartsLayer();
        CI.clearLayer();
        DR.drawFeatures.disable();
        if (taxiInterval) {
            clearInterval(taxiInterval)
        }
        lmsg.unsubscribe('locating');
        lmsg.unsubscribe('ODClick');
        lmsg.unsubscribe('hbjjrToMap');
        //lmsg.unsubscribe('cfxydBtnClick');
    }
    render() {
        const yongduButton = (
            <div>
                    <Button id="yongdu_road" ref="yongdu_road" className={UniqueStyles.button1} disabled={true} type='ghost' size='small' onClick={()=>this.onClickButton('yongdu_road', this.state.cfydData)}>路段</Button>
        <Button id="yongdu_cross" ref="yongdu_cross" className={UniqueStyles.button1} disabled={true} type='ghost' size='small' onClick={()=>this.onClickButton('yongdu_cross', this.state.cfydData)}>路口</Button>
                </div>
        );
        const jiariButton = (
            <div>
                    <Button id="jiari_cross" ref="jiari_cross" className={UniqueStyles.button1} disabled={true} type='ghost' size='small' onClick={()=>this.onClickButton(this.refs.jiari_cross.props.id)}>路口</Button>
                    <Button id="jiari_road" ref="jiari_road" className={UniqueStyles.button1} disabled={true} type='ghost' size='small' onClick={()=>this.onClickButton(this.refs.jiari_road.props.id)}>路段</Button>
                    <Button id="jiari_zone" ref="jiari_zone" className={UniqueStyles.button1} disabled={true} type='ghost' size='small' onClick={()=>this.onClickButton(this.refs.jiari_zone.props.id)}>区域</Button>
                </div>);
        return (
            <div className={UniqueStyles.boxpanel}  id="uniqueDetails">
                <div className={UniqueStyles.panel_header} style={{fontSize:'14px'}}>
                    专题信息
                </div>
                <div className={UniqueStyles.panel_body} id="uniquepanel_body">

                    <Button id="shigong" ref="shigong" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled} onClick={()=>this.onClickButton(this.refs.shigong.props.id)}>道路施工</Button>
                    <Button id="guanzhi" ref="guanzhi" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled} onClick={()=>this.onClickButton(this.refs.guanzhi.props.id)}>交通管制</Button>
                    <Button id="shigu" ref="shigu" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled} onClick={()=>this.onClickButton(this.refs.shigu.props.id)}>交通事故</Button>
                    <Button id="fudongche" ref="fudongche" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled} onClick={()=>this.onClickButton(this.refs.fudongche.props.id)}>浮动车</Button><br/>
                    <Popover content={jiariButton} placement="bottom" title="请选择" trigger="hover" getTooltipContainer={() => document.getElementById('uniqueDetails')}>
                        <Button id="jiari" ref="jiari" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled}>节假专题</Button>
                    </Popover>
                    <Popover ref="yongduPop" content={yongduButton} placement="bottom" title="请选择" trigger="hover" getTooltipContainer={() => document.getElementById('uniqueDetails')}>
                        <Button id="yongdu" ref="yongdu" className={UniqueStyles.button_primary} type="primary" size="small" disabled={this.state.disabled}>常发拥堵</Button>
                    </Popover>
                    <Button id="OD" ref="OD" className={UniqueStyles.button_primary} type="primary" size="small" disabled={!this.state.disabled} onClick={()=>this.OD()}>O/D分析</Button>
        { /*<Button id="print" ref="print" className={UniqueStyles.button_primary} type="ghost" size="small" onClick={()=>this.PrintMap()}>Print!!</Button>*/ }
                 </div>

            </div>
        )

    }


}

export default UniqueSub