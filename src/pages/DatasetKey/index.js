import React from "react";
import config from "../../config";
import { Redirect } from 'react-router-dom'
import axios from "axios";
import queryString from "query-string";
import { Alert } from "antd";
import DatasetMeta from "./datasetPageTabs/DatasetMeta";
import DatasetImportMetrics from "../DatasetImportMetrics";
import DatasetClassification from "./datasetPageTabs/DatasetClassification";
import DatasetSectors from "./datasetPageTabs/DatasetSectors"
import DatasetReferences from "./datasetPageTabs/DatasetReferences"
import Layout from "../../components/LayoutNew";
import DatasetIssues from "./datasetPageTabs/DatasetIssues"
import DatasetTasks from "./datasetPageTabs/DatasetTasks"
import NameSearch from "../NameSearch"
import WorkBench from "../WorkBench"
import withContext from "../../components/hoc/withContext"
import Exception404 from "../../components/exception/404";

import _ from 'lodash'
import Helmet from 'react-helmet'
import Duplicates from "../Duplicates";
import Taxon from "../Taxon"
import Name from "../Name"

class DatasetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      loading: true,
      importState: null
    };
  }

  componentWillMount() {
    const {
      match: {
        params: { key: datasetKey }
      }
    } = this.props;
    this.getData(datasetKey);
  }
  componentWillReceiveProps = nextProps => {
    
    if(_.get(this.props, 'match.params.key') !== _.get(nextProps, 'match.params.key')){
      this.getData(_.get(nextProps, 'match.params.key'));
    }
  };
  getData = datasetKey => {
    

      axios(`${config.dataApi}dataset/${datasetKey}/import`)
      .then(res => {
        const importState = _.get(res, 'data[0].state') || null
        this.setState({ importState });
      })
      .catch(err => {
        this.setState({ importState: null });
      });
  };



  render() {
  //  const { datasetKey, section, dataset } = this.props;
  const { importState } = this.state;

    const {
      match: {
        params: { key: datasetKey, section, taxonOrNameKey }
      },
      dataset
    } = this.props;
    if (!section ) {
      return <Redirect to={{
        pathname: `/dataset/${datasetKey}/names`
      }} />
    }
   
    const sect = (!section) ? "meta" : section.split('?')[0];
    const params = queryString.parse(this.props.location.search);
    const openKeys = ['datasetKey']
    const selectedKeys = [section]
    return (
      !dataset ? <Exception404 /> :
      <Layout
        selectedMenuItem="datasetKey"
        selectedDataset={{...dataset, importState: importState}}
        section={section}
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        taxonOrNameKey={taxonOrNameKey}
      >
     {_.get(dataset, 'title') && <Helmet 
      title={`${_.get(dataset, 'title')} in CoL+`}
     />}
      
      { importState && importState !== 'finished' && importState !== 'failed'  && importState !== 'unchanged' &&  <Alert style={{marginTop: '16px'}} message="The dataset is currently being imported. Data may be inconsistent." type="warning" />}
      { importState && importState === 'failed' &&  <Alert style={{marginTop: '16px'}} message="Last import of this dataset failed." type="error" />}
        {section === "issues" && <DatasetIssues datasetKey={datasetKey} />}
        {section === "metrics" && <DatasetImportMetrics datasetKey={datasetKey} origin={_.get(dataset, 'origin')} match={this.props.match} updateImportState={() => this.getData(datasetKey)} />}
        {!section || section === "meta" && <DatasetMeta id={datasetKey} />}
        {section === "classification" && (
          <DatasetClassification id={datasetKey} defaultExpandKey={params.taxonKey} />
        )}
        {section === "sectors" && (
          <DatasetSectors dataset={dataset} />
        )}
        
        {sect === "names" && (
          <NameSearch datasetKey={datasetKey} location={this.props.location} />
        )}
        {sect === "workbench" && (
          <WorkBench datasetKey={datasetKey} location={this.props.location} />
        )}
        {sect === "duplicates" && (
          <Duplicates datasetKey={datasetKey} location={this.props.location} />
        )}
        {sect === "reference" && (
          <DatasetReferences datasetKey={datasetKey} location={this.props.location} />
        )}
        {sect === "tasks" && (
          <DatasetTasks datasetKey={datasetKey} location={this.props.location} />
        )}
        {sect === "taxon" && (
          <Taxon datasetKey={datasetKey} location={this.props.location} match={this.props.match}  />
        )}
        {sect === "name" && (
          <Name datasetKey={datasetKey} location={this.props.location} match={this.props.match}  />
        )}
        

      </Layout>
    );
  }
}

const mapContextToProps = ({dataset}) => ({dataset})
export default withContext(mapContextToProps)(DatasetPage);
