import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import qs from "query-string";
import { NavLink } from "react-router-dom";
import { Table, Alert, Row, Col, Form, Select } from "antd";
import config from "../../../config";
import Layout from "../../../components/LayoutNew";
import ReleaseSelect from "./ReleaseSelect";
import history from "../../../history";
import withContext from "../../../components/hoc/withContext";
import TaxonomicCoverage from "./TaxonomicCoverage"
const _ = require("lodash");

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const defaultViewColumnOrder = 'sectorCount usagesCount taxonCount synonymCount bareNameCount nameCount referenceCount vernacularCount distributionCount mediaCount typeMaterialCount treatmentCount'.split(' ');

const getColorForDiff = (current, released) => {
  const pct = released > 0 ? (current / released) * 100 : -1;
  if (pct === -1) {
    return "grey";
  } else if (pct === 100) {
    return "green";
  } else if (pct > 100) {
    return "orange";
  }else if (pct >= 75) {
    return "orange";
  } else {
    return "red";
  }
};

class SourceMetrics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      groups: {},
      selectedGroup: 'default',
      loading: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate = (prevProps) => {
    const {
      match: {
        params: { catalogueKey },
      },
    } = this.props;

    if (_.get(prevProps, "match.params.catalogueKey") !== catalogueKey) {
      this.getData();
    }
  };

  getData = () => {
    this.setState({ loading: true });
    const {
      match: {
        params: { catalogueKey },
      },
      location,
    } = this.props;
    const params = qs.parse(_.get(location, "search"));
    const { releaseKey } = params;
    axios(`${config.dataApi}dataset?limit=1000&contributesTo=${catalogueKey}`)
      .then((res) => {
        let columns = {};
        return Promise.all(
          !res.data.result
            ? []
            : res.data.result.map((r) => {
                return this.getMetrics(catalogueKey, r.key).then((metrics) => {
                  columns = _.merge(columns, metrics);
                  return {
                  ...r,
                  metrics: metrics
                }});
              })
        ).then((res) => {
          this.setState({
            groups : {
              default: Object.keys(columns).filter(c => typeof columns[c] !== 'object' && !['attempt', 'datasetKey'].includes(c)),
              ...Object.keys(columns)
              .filter( c => typeof columns[c] === 'object')
              .reduce((obj, key) => {
                obj[key] = Object.keys(columns[key]);
                return obj;
              }, {})
            },
            selectedGroup: 'default'
          })
          return res;
        });
      })
      .then((res) => {
        if (releaseKey) {
          return Promise.all(
            res.map((r) => {
              return this.getMetrics(releaseKey, r.key).then((metrics) => ({
                ...r,
                selectedReleaseMetrics: metrics,
              }));
            })
          );
        } else {
          return res;
        }
      })
      .then((res) => {
        this.setState({
          loading: false,
          data: res,
          err: null,
        });
      })
      .catch((err) => {
        this.setState({ loading: false, error: err, data: [] });
      });
  };


  getMetrics = (datasetKey, sourceDatasetKey) => {
    return axios(
      `${config.dataApi}dataset/${datasetKey}/source/${sourceDatasetKey}/metrics`
    ).then((res) => res.data);
  };


  refreshReaseMetrics = (releaseKey) => {
    const { location } = this.props;
    const params = qs.parse(_.get(location, "search"));
    history.push({
      pathname: location.path,
      search: `?${qs.stringify({ ...params, releaseKey: releaseKey })}`,
    });
    this.setState({ loading: true });
    if (releaseKey) {
      Promise.all(
        this.state.data.map((r) => {
          return this.getMetrics(releaseKey, r.key).then((metrics) => {
            r.selectedReleaseMetrics = metrics;
          });
        })
      ).then(() =>
        this.setState({ loading: false, data: [...this.state.data] })
      );
    } else {
      this.state.data.forEach((r) => {
        delete r.selectedReleaseMetrics;
      });
      this.setState({ loading: false, data: [...this.state.data] });
    }
  };

  selectGroup = (value) => {
    this.setState({selectedGroup: value})
  }
  render() {
    const { data, loading, error, groups, selectedGroup } = this.state;
    const {
      match: {
        params: { catalogueKey },
      },
      catalogue,
      location,
      rank
    } = this.props;

   

    const columnsSorter = selectedGroup && selectedGroup.indexOf('Rank') > -1 ? 
      (a, b) => rank.indexOf(b) - rank.indexOf(a) : selectedGroup === 'default' ?
      (a, b) => defaultViewColumnOrder.indexOf(a) - defaultViewColumnOrder.indexOf(b) :
      (a, b) => a.localeCompare(b)


    const additionalColumns = !groups[selectedGroup] ? [] : groups[selectedGroup]
    .sort(columnsSorter)
    .map(column => ({
      // nameCount
      title: _.startCase(column).split(' Count')[0],
      dataIndex: selectedGroup === 'default' ? ["metrics", column] : ["metrics", selectedGroup, column],
      key: column,
      render: (text, record) => {
        const selectedRelaseValue = selectedGroup === 'default' ? _.get(record, `selectedReleaseMetrics[${column}]`) : _.get(record, `selectedReleaseMetrics[${selectedGroup}][${column}]`) ;
        return (
          <React.Fragment>
            <NavLink
              to={{
                pathname: `/catalogue/${catalogueKey}/dataset/${record.key}/workbench`,
              }}
              exact={true}
            >
              {text || 0}
            </NavLink>
            {record.selectedReleaseMetrics && (
              <div
                style={{
                  color: getColorForDiff(
                    text || 0,
                    selectedRelaseValue || 0
                  ),
                }}
              >
                {selectedRelaseValue || 0}
              </div>
            )}
          </React.Fragment>
        );
      },
      sorter: (a, b) => {
        const path = selectedGroup === 'default' ? `metrics[${column}]` : `metrics[${selectedGroup}][${column}]`
        return (
          Number(_.get(a, path) || 0) -
          Number(_.get(b, path) || 0)
        );
      },
    }) )

    const columns = [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (text, record) => {
          return (
            <React.Fragment>
              <NavLink
                to={{
                  pathname: `/catalogue/${catalogueKey}/dataset/${record.key}/workbench`,
                }}
                exact={true}
              >
                {record.alias ? `${record.alias} [${record.key}]` : record.key}
              </NavLink>
              {record.selectedReleaseMetrics && <div>Selected release:</div>}
            </React.Fragment>
          );
        },
        sorter: (a, b) => {
          return ("" + a.alias).localeCompare(b.alias);
        },
      },

      ...additionalColumns
    ];
    const scroll = columns.length < 8 ? null : {x: `${800 + (columns.length - 7) * 200}px`}
    return (
      <Layout
        openKeys={["assembly"]}
        selectedKeys={["catalogueSourceMetrics"]}
        title={catalogue ? catalogue.title : ""}
      >
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: 280,
            margin: "16px 0",
          }}
        >
          <div>
            <Row>
              <Col md={12} sm={24}>
              <Form.Item
                  {...formItemLayout}
                  label="Select view"
                  style={{ marginBottom: "8px" }}
                >
                <Select style={{width: '300px'}} 
                  value={selectedGroup}
                  onChange={this.selectGroup}
                  >
                  {Object.keys(groups).map(k => 
                  <Select.Option value={k}>{_.startCase(k)}</Select.Option>
                  )}
                </Select>
                </Form.Item>
              </Col>
              <Col md={12} sm={24}>
                <Form.Item
                  {...formItemLayout}
                  label="Compare with release"
                  style={{ marginBottom: "8px" }}
                >
                  <ReleaseSelect
                    catalogueKey={catalogueKey}
                    defaultReleaseKey={
                      _.get(
                        qs.parse(_.get(location, "search")),
                        "releaseKey"
                      ) || null
                    }
                    onReleaseChange={this.refreshReaseMetrics}
                  />
                </Form.Item>
              </Col>
            </Row>
            {error && <Alert message={error.message} type="error" />}
          </div>
          {!error && (
            <Table
              size="small"
              columns={columns}
              dataSource={data}
              loading={loading}
              scroll={scroll}
              expandable={{ expandedRowRender: row => <div style={{marginLeft: '46px'}}><h4>Taxonomic coverage</h4><TaxonomicCoverage dataset={row} catalogueKey={catalogueKey} /></div> }}
              pagination={{ pageSize: 100 }}
            />
          )}
        </div>
      </Layout>
    );
  }
}

const mapContextToProps = ({ user,rank, catalogue }) => ({
  user,
  rank,
  catalogue,
});

export default withContext(mapContextToProps)(SourceMetrics);
