import React from "react";

import Layout from "../../components/LayoutNew";
import { NavLink } from "react-router-dom";
import config from "../../config";
import _ from "lodash";
import moment from "moment"
import Helmet from "react-helmet";
import {
  Row,
  Col,
  Statistic,
  Card,
 
} from "antd";
import withContext from "../../components/hoc/withContext";

import axios from "axios";
const { MANAGEMENT_CLASSIFICATION } = config;
const { NAME_INDEX } = config;

const { Meta } = Card;

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      nameUsages: null,
      nameUsagesLoading: false,
      colSpecies: null,
      colSpeciesLoading: false,
      datasets: null,
      datasetsLoading: false
    };
  }
  componentDidMount = () => {
    this.getNameUsages();
    this.getCoLData();
    this.getDatasets();
  };
  getNameUsages = () => {
    this.setState({ nameUsagesLoading: true });
    axios(`${config.dataApi}/nameusage/search?limit=0`)
      .then(res => {
        this.setState({
          error: null,
          nameUsagesLoading: false,
          nameUsages: res.data
        });
      })
      .catch(err => this.setState({ error: err, nameUsagesLoading: false }));
  };

  getCoLData = () => {
    this.setState({ colSpeciesLoading: true });
    axios(`${config.dataApi}dataset/${MANAGEMENT_CLASSIFICATION.key}/nameusage/search?rank=species&status=accepted&status=provisionally_accepted&limit=0`)
      .then(res => {
        this.setState({
          error: null,
          colSpeciesLoading: false,
          colSpecies: res.data
        });
      })
      .catch(err => this.setState({ error: err, colSpeciesLoading: false }));
  };

  getDatasets = () => {
    this.setState({ datasetsLoading: true });
    axios(`${config.dataApi}dataset?limit=3&sortBy=created`)
      .then(res => {
        this.setState({
          datasetsLoading: false,
          datasets: res.data,
          err: null
        });
      })

      .catch(err => {
        this.setState({ datasetsLoading: false, error: err, datasets: null });
      });
  };

  render() {
    const {
      nameUsages,
      nameUsagesLoading,
      colSpecies,
      colSpeciesLoading,
      datasets
    } = this.state;
    const {catalogueKey} = this.props;
    return (
      <Layout openKeys={[]} selectedKeys={[]} title="COL ChecklistBank">
       
          <Helmet
  title="ChecklistBank"
  meta={[
  {
    charSet: "utf-8"
   }
   ]}
   link={[{
     rel:"canonical",
     href: "http://data.catalogue.life"
   }]}
/>

<Card
  style={{ marginTop: 20 }}
  hoverable
  cover={
    <img alt="ChecklistBank"
      src="//api.gbif.org/v1/image/unsafe/1170x422/http%3A%2F%2Fmycoportal.org%2Fimglib%2Fmycology%2FTENN_TENN-F%2FTENN-F-074%2FCoccomyces_triangularis_1_1529521643_lg.jpg"
    />
  }
>
  <Row>
    <Col span={8}>
      {colSpecies && (
        <NavLink to={{pathname: `/dataset/${MANAGEMENT_CLASSIFICATION.key}/names`}} exact={true}>
          <Statistic title="Species in Catalogue of Life" value={colSpecies.total}/>
        </NavLink>
      )}
    </Col>
    <Col span={8}>
      {nameUsages && (
        <NavLink to={{pathname: `/`}} exact={true}>
          <Statistic title="Name Usages in ChecklistBank" value={nameUsages.total} />
        </NavLink>
      )}
    </Col>
    <Col span={8}>
      {datasets && (
        <NavLink to={{ pathname: `/dataset`}} exact={true}>
          <Statistic title="Datasets in ChecklistBank" value={datasets.total}/>
        </NavLink>
      )}
    </Col>
  </Row>



  <Row style={{ marginTop: 20 }}>
    <Col style={{ paddingRight: "30px" }} span={16}>
      <p>
      The <a href="http://www.catalogue.life">Catalogue of Life (COL)</a> aims to support the publication and curation of checklists and to provide a platform for their consistent discovery, use and citation. 
      <a href="https://www.gbif.org/dataset/search?type=CHECKLIST">GBIF</a> has for some time maintained ChecklistBank as a repository for its community to share checklist data. 
      COL and GBIF have united their capabilities to make ChecklistBank a consistent foundation and repository for all COL datasets and any other publicly published species lists.          
      </p>
      <p>
      The taxonomic community can publish a checklist to ChecklistBank either 
      by directly uploading a <a href="https://github.com/CatalogueOfLife/coldp/blob/master/README.md">ColDP</a>, DwC-A or ACEF file along with metadata describing its content 
      or by publishing such a file on the Internet in a form that COL can consume and then registering the dataset with ChecklistBank.
      </p>          
      <p>
      Regardless of the original data format, ChecklistBank generates a standardised interpretation. 
      All datasets can be searched, browsed, downloaded or accessed programmatically via the <a href="https://api.catalogue.life">COL API</a>. 
      </p>
    </Col>
      {datasets &&  <Col span={8}>
        <h3>Latest datasets registered</h3>
                  <ul>
                      {datasets.result.map(d => <li key={d.key}>
                        <NavLink 
                  to={{
                    pathname: `/dataset/${d.key}`
                  }}
                  exact={true}
                >
                    {d.title} ({moment(d.created).format("MMM Do YYYY")})
                </NavLink>
                      </li>)}
                  </ul>
        </Col> }
  </Row>


  </Card>
</Layout>
    );
  }
}


const mapContextToProps = ({ catalogueKey }) => ({catalogueKey});

export default withContext(mapContextToProps)(HomePage);
