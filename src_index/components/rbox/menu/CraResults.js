import React from 'react';
import styles from './_craResults.css';
import * as lmsg from '../../../libs/lmsg';
import * as Ds from '../../../libs/DataService';
import {
    Pagination,
    InputNumber,
    Col,
    Row,
    message
} from 'antd';
import QueueAnim from 'rc-queue-anim';
var children_rboxkey = null,
    last_Path = null,
    JtzsList = null,
    rboxkey1 = null;

class CraResults extends React.Component {
    constructor() {
        super();
        this.state = {
            tableContent: [],
            t: undefined,
            pageNumber: 1,
            rboxkey12: null
        }
        this.pagination = this.pagination.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    pagination(page) {
        let rboxkey1 = this.state.rboxkey12;
        let self = this;
        var sendParam2 = null;
        this.setState({
            pageNumber: page
        });

        if (this.state.t == undefined) {
            var d = new Date();
            var month = d.getMonth() + 1;
            let myday = d.getFullYear() + "/" + (month < 10 ? ('0' + month) : month) + "/" + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate()) + " " + (d.getHours() < 10 ? ('0' + d.getHours()) : d.getHours()) + ":" + (d.getMinutes() < 10 ? ('0' + d.getMinutes()) : d.getMinutes()) + ":" + (d.getSeconds() < 10 ? ('0' + d.getSeconds()) : d.getSeconds());
            if (rboxkey1 == 'cross') last_Path = '/trafficindex_map/listYdlkMore.do';
            else if (rboxkey1 == 'road') last_Path = '/trafficindex_map/listYdldMore.do';
            else if (rboxkey1 == 'area') last_Path = '/trafficindex_map/listYdqyMore.do';
            sendParam2 = {
                queryTime: myday,
                pageIndex: page,
                pageSize: 10,
                isFirst: false
            };
        } else if (this.state.t && (this.state.t.flags == null)) {
            if (this.state.t.rboxkey == 'cross') last_Path = '/trafficindex_map/listYdlkMore.do';
            else if (this.state.t.rboxkey == 'road') last_Path = '/trafficindex_map/listYdldMore.do';
            else if (this.state.t.rboxkey == 'area') last_Path = '/trafficindex_map/listYdqyMore.do';
            sendParam2 = {
                queryTime: this.state.t.sj,
                pageIndex: page,
                pageSize: 10,
                isFirst: false
            };
        } else {
            let myday = this.state.t.sj;
            let YWD = this.state.t.flags;
            sendParam2 = {
                date: myday,
                flag: YWD,
                pageIndex: page,
                pageSize: 10,
                isFirst: false
            };
            if (rboxkey1 == 'cross') last_Path = '/trafficindex_map/crossJtda.do';
            else if (rboxkey1 == 'road') last_Path = '/trafficindex_map/roadJtda.do';
            else if (rboxkey1 == 'area') last_Path = '/trafficindex_map/zoneJtda.do';
        }

        Ds.DataService(last_Path, sendParam2, (resp) => {
            self.setState({
                tableContent: resp.aaData.jtzsPage.jtzsList
            });
        }, (e) => {
            console.log(e);
        });

    }
    componentDidMount() {
        let self = this;
        this.setState({
            tableContent: JtzsList.jtzsList,
            rboxkey12: this.props.children
        });
        lmsg.subscribe('crsBtnClick', (data) => {
            self.setState({
                t: data.time
            });
            localStorage.removeItem('crsBtnClick');
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            tableContent: nextProps.jtzsPage.jtzsList,
            pageNumber: 1,
            rboxkey12: nextProps.children
        });
    }
    componentWillMount() {
        //this.setState({rboxkey12})
    }
    onKeyDown(e) {
        if (e.keyCode == 13) {
            this.pagination((document.getElementById('inputnn').value) * 1)
        }
        if (((document.getElementById('inputnn').value) * 1) > Math.ceil(JtzsList.total / 10)) {
            message.warning('输入页数过多');
            this.pagination(Math.ceil(JtzsList.total / 10));
        }
    }
    render() {
        children_rboxkey = this.props.children;
        JtzsList = this.props.jtzsPage;
        if (!JtzsList) alert("错误");
        return (
            <div className={styles.traffic_tag}>
                <div>
                    <div>
                        <span className={styles.traffic_level_3}></span>
                        <span className={styles.smooth_jam}>轻度拥堵: </span>
                        <span className={styles.smooth_jam_num2}>{JtzsList.qdyds}</span>
                        <span id="separator" className={styles.separator_LV3}></span>
                        <span className={styles.traffic_level_1}></span>
                        <span className={styles.smooth_jam1}>畅通: </span>
                        <span className={styles.smooth_jam_num3}>{JtzsList.cts}</span>
                        <span id="separator" className={styles.separator_LV1}></span>
                    </div>
                    <div>
                        <span className={styles.traffic_level_4}></span>
                        <span className={styles.smooth_jam}>中度拥堵: </span>
                        <span className={styles.smooth_jam_num2}>{JtzsList.zdyds}</span>
                        <span id="separator" className={styles.separator_LV4}></span>
                        <span className={styles.traffic_level_2}></span>
                        <span className={styles.smooth_jam2}>基本畅通: </span>
                        <span className={styles.smooth_jam_num4}>{JtzsList.jbcts}</span>
                        <span id="separator" className={styles.separator_LV2}></span>
                    </div>
                    <div>
                        <span className={styles.traffic_level_5}></span>
                        <span className={styles.smooth_jam}>严重拥堵: </span>
                        <span className={styles.smooth_jam_num2}>{JtzsList.yzyds}</span>
                        <span id="separator" className={styles.separator_LV5}></span>
                        <span id="separator" className={styles.separator_LV0}></span>
                    </div>
                </div><br/>
                <div id='table' className={styles.table}>
                    <div>
                        <p>拥堵{children_rboxkey == 'cross' ? '路口' : children_rboxkey == 'road' ? '路段': children_rboxkey == 'area' ? '区域':null}排名</p>
                        <span className={styles.smooth_jam_rank}>排名</span>
                        <span className={styles.smooth_jam_num_name}>名称</span>
                        <span className={styles.smooth_jam_num_index}>拥堵指数</span>
                        <span className={styles.smooth_jam_num_hierarchy}>拥堵等级</span>
                    </div>
                    <ul id='table_rows' className={styles.table_rows}>
                        { this.state.tableContent.map(item => {
                            return <QueueAnim key={item.id} delay={300} className="queue-simple"><TableRow key={item.id} item={item}/></QueueAnim>
                        }) }
                    </ul>
                    <div className={styles.pager}>
                    <Row>
                     <Col span={4}>
                </Col>
                    <Col span={12}>
                <Pagination simple current={this.state.pageNumber} total={JtzsList.total} onChange={this.pagination}/>
                </Col>
                <Col span={2}>
               {'跳至:   '}
                </Col>
                <Col span={1}>
                </Col>
                <Col span={2}>
        <InputNumber id='inputnn' style={{width:'50px'}} size="small" min={1} max={JtzsList.total} defaultValue={this.state.pageNumber} value={this.state.pageNumber} onKeyDown={this.onKeyDown} onChange={this.pagination} />
                </Col>
                </Row>
                </div>
                </div>
                
            </div>
        )
    }
}

class TableRow extends React.Component {
    constructor() {
        super();
        this.onClickRow = this.onClickRow.bind(this);
    }
    onClickRow(ref) {
        var ID2screen1 = this.props.item.id;
        var Name2screen1 = this.props.item.name;
        var iscra = null;
        var children_rboxkey_key = null;
        switch (children_rboxkey) {
            case 'cross':
                children_rboxkey_key = 'lksszs';
                break;
            case 'road':
                children_rboxkey_key = 'ldsszs';
                break;
            case 'area':
                children_rboxkey_key = 'qysszs';
                break;
        };
        lmsg.send(children_rboxkey_key, {
            'params': children_rboxkey,
            'isTime': 1,
            'ID': ID2screen1,
            'name': Name2screen1
        });
        console.log('lmsg.send-->success', 'name', Name2screen1);
    }
    componentDidMount() {}
    render() {
        var hierarchyStyle = null;
        switch (this.props.item.yddj) {
            case '畅通':
                hierarchyStyle = {
                    color: '#277b04',
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
            case '基本畅通':
                hierarchyStyle = {
                    color: '#34b100',
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
            case '轻度拥堵':
                hierarchyStyle = {
                    color: '#ffcb00',
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
            case '中度拥堵':
                hierarchyStyle = {
                    color: '#ff8800',
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
            case '严重拥堵':
                hierarchyStyle = {
                    color: '#df0000',
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
            default:
                hierarchyStyle = {
                    float: 'left',
                    width: '60px',
                    height: '20px',
                    textAlign: 'center'
                };
                break;
        }
        return (
            <li id='row' className={styles.row}>
                <ul>
                    <li key={'li223'} ref='IndexRank' id='rank' className={styles.rank}>{this.props.item.xh}</li>
                    <li key={'li222'} ref='IndexName' id='name' className={styles.name} title={this.props.item.name} onClick={this.onClickRow}>{this.props.item.name}</li>
                    <li key={'li221'} ref='IndexIndex' id='index' className={styles.index}>{this.props.item.jtzs}</li>
                    <li key={'li224'} ref='IndexLevel' id='level' style={hierarchyStyle}>{this.props.item.yddj}</li>
                </ul>
            </li>

        )
    }
}

export default CraResults