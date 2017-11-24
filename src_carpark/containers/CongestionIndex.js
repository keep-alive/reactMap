import React from 'react';
import ReactDOM from 'react-dom';
import Search from '../components/search/Search';
//import ToolBar from '../components/toolBar/ToolBar';
import Rbox from '../components/rbox/Rbox';
import Map from '../components/map/Map';
import Emap from '../components/map/Emap';
import * as Ds from '../libs/DataService';
import * as lmsg from '../libs/lmsg';

class CongestionIndex extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {}
    render() {

        return (
            <div>
                <Map/>
                <Search/>
        
                <Rbox/>
            </div>
        )
    }
}

export default CongestionIndex