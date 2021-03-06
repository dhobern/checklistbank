import React from "react";
import config from "../../../config";
import _ from "lodash";
import { SearchOutlined } from '@ant-design/icons';
import { Select } from "antd";
// import DatasetAutocomplete from "../catalogue/Assembly/DatasetAutocomplete";

import axios from "axios";
const {Option} = Select;

class RealeaseSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      releases: [],
      selectedRelease: null,
      loading: false
    };
  }

  componentDidMount = () => {
    this.getReleases();
    const {defaultReleaseKey} = this.props;
    if(defaultReleaseKey){
        this.setState({selectedRelease: defaultReleaseKey})
    }
  };

  componentDidUpdate = (prevProps) => {
      if(_.get(prevProps, 'catalogueKey') !== _.get(this.props, 'catalogueKey')){
          this.getReleases()
      }
  }
  getReleases = () => {
    const {
      catalogueKey
      } = this.props;
      this.setState({loading: true})
    axios(`${config.dataApi}dataset?releasedFrom=${catalogueKey}&limit=1000`)
    .then((res)=> this.setState({releases: _.get(res, 'data.result') ?_.get(res, 'data.result') : [], loading: false }))
  }


  handleVisibleChange = visible => {
    this.setState({ visible });
  };
  
  onReleaseChange = releaseKey => {
    const { onReleaseChange} = this.props;  
    onReleaseChange(releaseKey)
    this.setState({selectedRelease: releaseKey})     
  };
  render = () => {
    
      const {releases, selectedRelease, loading} = this.state;
    return (
         <Select
                  showSearch
                  allowClear
                  loading={loading}
                  style={{ width: "100%" }}
                  value={selectedRelease}
                  placeholder="Select release"
                  optionFilterProp="children"
                  onChange={this.onReleaseChange}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  
                >
                  {releases.map(c => (
                    <Option
                      
                      value={c.key}
                      key={c.key}
                    >{`${c.alias ? c.alias+' ' : ''}[${c.key}]`}</Option>
                  ))}
                </Select>
                    );
  }
}

export default RealeaseSelect;