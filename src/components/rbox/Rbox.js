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
import * as yd from '../../scripts/youdaomap';
import {
    Table,
    message,
    Icon,
    Button
} from 'antd';

class Rbox extends React.Component {
    constructor() {
        super();
        this.state = {
            contraction: false,
            initPanel: true,
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0,
            count5: 0,
            count6: 0,
        }

        this.renderList = this.renderList.bind(this);
        this.querymap = this.querymap.bind(this);
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
                initPanel: false
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

        }
    }
    querymap(ref) {
        Ds.DataService('/guidance_mapSearch/map_dwsbxxByXh.do', {
            xh: ref
        }, (resp) => {
            yd.clearLayer();
            yd.displayDeviceLayer(resp.aaData.jsonMap);
        }, (e) => {
            message.error('传输错误');
            console.log('传输错误');
        });
    }
    returnthelist() {
        this.setState({
            initPanel: true
        });
    }
    render() {
        let {
            page,
            totalPage,
            dispatch
        } = this.props;
        let searchAvtive = (this.props.searchValue === "");
        console.log(this.props)
        let listContent = this.state.initPanel ? (
            <div>
            <ul className={ this.state.contraction ? styles.listul_none : styles.listul }>
                <li className={styles.oneLi}>设备总数： {this.state.count1} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(1)}/></li>
                <li className={styles.oneLi}>故障总数： {this.state.count2} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(2)}/></li>
                <li className={styles.oneLi}>紧急播报： {this.state.count3} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(3)}/></li>
                <li className={styles.oneLi}>未完成节目单配置： {this.state.count4} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(4)}/></li>
                <li className={styles.oneLi}>未配置路况设备： {this.state.count5} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(5)}/></li>
                <li className={styles.oneLi}>正常运行： {this.state.count6} 台 <Button style={{float:'right'}} size='small' type="primary" shape="circle" icon="right" onClick={()=>this.querymap(6)}/></li>
            </ul>
          </div>
        ) : (
            <div className={this.state.contraction ? styles.results12_none:styles.results12}>
           { React.createElement(SearchResults, this.props.search.list)}
            <Button type="primary" className={styles.returnBtn} onClick={()=>{this.returnthelist()}}><Icon type="menu-fold" />返回列表</Button>
            </div>
        );

        return (<div id="rbox" className={ styles.rbox }>
    <div
       id="navBody"
       className={ this.state.contraction ? styles.navBody_none : styles.navBody_display }>
              {listContent}   
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

        this.setState({
            contraction: false
        });

        Ds.DataService('/guidance_mapSearch/map_dwxxInit.do', null, (resp) => {
            let total = resp.aaData.total;
            let geojson = resp.aaData.jsonMap;
            self.setState({
                count1: total[0].count,
                count2: total[1].count,
                count3: total[2].count,
                count4: total[3].count,
                count5: total[4].count,
                count6: total[5].count
            });
            yd.displayDeviceLayer(geojson);
        }, (e) => {
            message.error('传输错误');
            console.log('传输错误');
        });

        //进多屏监控
        lmsg.subscribe('initMultiPage', (data) => {
            console.log('initMultiPage', data);
            Ds.DataService('/guidance_mapSearch/map_dwxxByUserId.do', null, (resp) => {
                let total = resp.aaData.total,
                    geojson = resp.aaData.jsonMap;
                self.setState({
                    count1: total[0].count,
                    count2: total[1].count,
                    count3: total[2].count,
                    count4: total[3].count,
                    count5: total[4].count,
                    count6: total[5].count
                });
                yd.clearLayer();
                if (geojson.features.length > 0) {
                    yd.displayDeviceLayer(geojson);
                } else {
                    message.error('没有查询到相关诱导屏');
                }

            }, (e) => {
                message.error('传输错误');
                console.log('传输错误');
            });
            localStorage.removeItem('initMultiPage');
        });


        //初始化
        lmsg.subscribe('initPage', (data) => {
            console.log('initPage', data);
            Ds.DataService('/guidance_mapSearch/map_dwxxInit.do', null, (resp) => {
                let total = resp.aaData.total,
                    geojson = resp.aaData.jsonMap;
                self.setState({
                    count1: total[0].count,
                    count2: total[1].count,
                    count3: total[2].count,
                    count4: total[3].count,
                    count5: total[4].count,
                    count6: total[5].count
                });
                yd.displayDeviceLayer(geojson);

            }, (e) => {
                message.error('传输错误');
                console.log('传输错误');
            });
            localStorage.removeItem('initPage');
        });

        //进单屏，选择一个诱导屏
        lmsg.subscribe('selectOneYdp', (data) => {
            console.log('selectOneYdp', data);
            yd.querySingleMonitor(data.id);
            localStorage.removeItem('selectOneYdp');
        });

        lmsg.subscribe('showFhld', (data) => {
            console.log('showFhld', data);
            Ds.DataService('/guidance_mapSearch/map_fhld.do', null, (resp) => {
                yd.showFhld(resp.aaData);
            });
            //yd.showFhld(roadData.aaData)
            localStorage.removeItem('showFhld');
        });

        lmsg.subscribe('locatePoint', (data) => {
            console.log('locatePoint', data);
            yd.locatePoint();
            localStorage.removeItem('locatePoint');
        });
        //地图选择进入多屏
        lmsg.subscribe('queryMultiM', (data) => {
            Ds.DataService('/guidance_mapSearch/map_dwxxInit.do', null, (resp) => {
                let geojson = resp.aaData.jsonMap;
                //yd.clearLayer();
                DR.selectDevice(geojson);
                //yd.displayDeviceLayer(geojson);
            }, (e) => {
                message.error('传输错误');
                console.log('传输错误');
            });

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

/*  setTimeout(function() {
          yd.querySingleMonitor('0967889f639f4678b2aaf4866ca43286');
      }, 3000)*/