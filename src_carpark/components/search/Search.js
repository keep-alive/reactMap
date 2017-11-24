import React from 'react';
import L from 'leaflet';
import LE from 'esri-leaflet';
import styles from './_search.css';
import logoSrc from '../../images/logo.png';
import {
    connect
} from 'react-redux';
import * as action from '../../actions/searchAction';
import {
    message
} from 'antd';

class Search extends React.Component {
    constructor() {
        super();
        this.update = this.update.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    update() {
        let keyword = this.refs.searchVal.value;
        if (keyword && keyword != '')
            this.props.fetchSearchList(keyword, 'search');
        else
            message.warning('请输入有效的搜索内容！')
    }
    onKeyDown(e) {
        if (e.keyCode == 13) {
            this.update();
        }
    }
    render() {
        return (
            <section id="search" className={styles.search}>
                <header className={styles.searchbox}>
                    <img className={styles.logo} src={logoSrc} draggable="false"/>
                    <div className={styles.iptbox}>
                        <input type="text" ref="searchVal" id="searchipt" onKeyDown={this.onKeyDown} placeholder="搜索相关路口，路段，区域指数" className={styles.searchipt}/>
                    </div>
                    <span id="separator" className={styles.separator}></span>
                    <div className={styles.direntry} id="searchbtn" title="搜索" onClick={()=>this.update()}>
                        <i className={styles.fa + ' ' + styles.fa_search + ' ' + styles.searchlogo}></i>
                        <span id="searchloading" className={styles.ring}></span>
                    </div>
                </header>
            </section>
        )
    }
}

function mapStateToProps(state) {
    return {
        search: state.search
    }
}

export default connect(mapStateToProps, action)(Search)