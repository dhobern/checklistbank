import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Table, Alert, Row, Col, Form } from "antd";
import config from "../../config";
import qs from "query-string";
import Layout from "../../components/LayoutNew";
import moment from "moment";
import history from "../../history";

import SearchBox from "./SearchBox";
import ColumnFilter from "./ColumnFilter";
import DatasetLogo from "./DatasetLogo";
import ImportButton from "../../pages/Imports/importTabs/ImportButton";
import withContext from "../../components/hoc/withContext";

const FormItem = Form.Item;

const _ = require("lodash");

const PAGE_SIZE = 50;

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

class DatasetList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      excludeColumns:
        JSON.parse(localStorage.getItem("colplus_datasetlist_hide_columns")) ||
        [],
      columns: [],
      defaultColumns: [
        {
          title: "Short name",
          dataIndex: "alias",
          key: "alias",
          render: (text, record) => {
            return (
              <NavLink
                to={{ pathname: `/dataset/${record.key}/names` }}
                exact={true}
              >
                {text}
              </NavLink>
            );
          },
          // sorter: true
        },
        {
          title: "Title",
          dataIndex: "title",
          key: "title",
          render: (text, record) => {
            return (
              <NavLink
                to={{ pathname: `/dataset/${record.key}/names` }}
                exact={true}
              >
                {text}
              </NavLink>
            );
          },
          sorter: true,
        },
        {
          title: "Logo",
          dataIndex: "key",
          key: "logo",
          render: (text, record) => (
            <DatasetLogo datasetKey={record.key} size="SMALL" />
          ),
        },
        {
          title: "Authors",
          dataIndex: "authors",
          key: "authors",
          sorter: true,
          render: (text, record) => {
            return text && _.isArray(text)
              ? text.map((t) => t.name).join(", ")
              : "";
          },
        },
        {
          title: "Editors",
          dataIndex: "editors",
          key: "editors",
          sorter: true,
          render: (text, record) => {
            return text && _.isArray(text)
              ? text.map((t) => t.name).join(", ")
              : "";
          },
        },
        {
          title: "Version",
          dataIndex: "version",
          key: "version",
        },
        {
          title: "Origin",
          dataIndex: "origin",
          key: "origin",
        },
        {
          title: "Contact",
          dataIndex: ["contact", "name"],
          key: "contact",
        },
        {
          title: "Organisations",
          dataIndex: "organisations",
          key: "organisations",
          render: (text, record) => {
            return text && _.isArray(text) ? text.join(", ") : "";
          },
        },
        {
          title: "License",
          dataIndex: "license",
          key: "license",
        },
        {
          title: "Geographic Scope",
          dataIndex: "geographicScope",
          key: "geographicScope",
        },
        {
          title: "Confidence",
          dataIndex: "confidence",
          key: "confidence",
        },
        {
          title: "Completeness",
          dataIndex: "completeness",
          key: "completeness",
        },
        {
          title: "Size",
          dataIndex: "size",
          key: "size",
          sorter: true,
          render: (text) => {
            try {
              return Number(text).toLocaleString("en-GB");
            } catch (err) {
              console.log(err);
              return "";
            }
          },
        },
        {
          title: "Created",
          dataIndex: "created",
          key: "created",
          sorter: true,
          render: (date) => {
            return moment(date).format("MMM Do YYYY");
          },
        },
        {
          title: "Modified",
          dataIndex: "modified",
          key: "modified",
          sorter: true,
          render: (date) => {
            return moment(date).format("MMM Do YYYY");
          },
        },
        {
          title: "Private",
          dataIndex: "private",
          key: "private",
          width: 24,
          render: (text, record) => {
            return text === true ? (
              <LockOutlined style={{ color: "red" }} />
            ) : (
              <UnlockOutlined style={{ color: "green" }} />
            );
          },
        },
      ],
      search: _.get(this.props, "location.search.q") || "",
      params: {},
      pagination: {
        pageSize: PAGE_SIZE,
        current: 1,
        showQuickJumper: true,
      },

      loading: false,
    };
  }

  componentDidMount() {
    let params = qs.parse(_.get(this.props, "location.search"));
    if (_.isEmpty(params)) {
      params = { limit: PAGE_SIZE, offset: 0 };
      history.push({
        pathname: "/dataset",
        search: `?limit=${PAGE_SIZE}&offset=0`,
      });
    }

    this.setState(
      {
        params,
        pagination: {
          pageSize: params.limit || PAGE_SIZE,
          current:
            Number(params.offset || 0) / Number(params.limit || PAGE_SIZE) + 1,
        },
      },
      this.getData
    );
  }

  getData = () => {
    const {
      params,
      pagination: { pageSize: limit, current },
    } = this.state;

    this.setState({ loading: true });
    if (!params.q) {
      delete params.q;
    }
    const newParamsWithPaging = {
      ...params,
      limit,
      offset: (current - 1) * limit,
    };
    history.push({
      pathname: "/dataset",
      search: `?${qs.stringify(newParamsWithPaging)}`,
    });
    axios(`${config.dataApi}dataset?${qs.stringify(newParamsWithPaging)}`)
      .then((res) => {
        this.setState({
          loading: false,
          data: res.data.result,
          err: null,
          pagination: { ...this.state.pagination, total: res.data.total },
        });
      })
      .catch((err) => {
        this.setState({ loading: false, error: err, data: [] });
      });
  };

  updateSearch = (params) => {
    let newParams = { ...this.state.params };
    _.forEach(params, (v, k) => {
      newParams[k] = v;
    });
    this.setState(
      {
        params: newParams,
        pagination: {
          pageSize: PAGE_SIZE,
          current: 1,
        },
      },
      this.getData
    );
  };

  handleTableChange = (pagination, filters, sorter) => {
    let query = {
      ...Object.keys(filters).reduce(
        (acc, cur) => (filters[cur] !== null && (acc[cur] = filters[cur]), acc),
        {}
      ),
    };

    if (sorter && sorter.order === "descend") {
      query.reverse = true;
    } else {
      query.reverse = false;
    }
    this.setState({ params: query, pagination }, this.getData);
  };

  handleColumns = (excludeColumns) => {
    this.setState({ excludeColumns });
  };

  render() {
    const {
      data,
      loading,
      error,
      excludeColumns,
      defaultColumns,
      params,
    } = this.state;
    const { datasetType, datasetOrigin } = this.props;
    defaultColumns[6].filters = datasetOrigin.map((i) => ({
      text: _.startCase(i),
      value: i,
    }));
    if (params.origin) {
      defaultColumns[6].filteredValue = _.isArray(params.origin)
        ? params.origin
        : [params.origin];
    } else {
      defaultColumns[6].filteredValue = null;
    }
    /*     defaultColumns[6].filters = datasetType.map((i) => ({
      text: _.startCase(i),
      value: i,
    }));
    if (params.type) {
      defaultColumns[6].filteredValue = _.isArray(params.type)
        ? params.type
        : [params.type];
    } else {
      defaultColumns[6].filteredValue = null;
    } */
    const filteredColumns =
      this.props.user && _.includes(this.props.user.roles, "admin")
        ? [
            ...defaultColumns,
            {
              title: "Action",
              dataIndex: "",
              width: 60,
              key: "__actions__",
              render: (text, record) =>
                record.origin === "external" ? (
                  <ImportButton
                    key={record.key}
                    record={{ datasetKey: record.key }}
                  />
                ) : (
                  ""
                ),
            },
          ]
        : defaultColumns;

    const columns = _.filter(
      filteredColumns,
      (v) => !_.includes(excludeColumns, v.key)
    );

    return (
      <Layout
        openKeys={["dataset"]}
        selectedKeys={["/dataset"]}
        title="Datasets"
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
                <SearchBox
                  defaultValue={_.get(this.state, "params.q")}
                  style={{ marginBottom: "10px", width: "50%" }}
                  onSearch={(value) => this.updateSearch({ q: value })}
                />
              </Col>
              <Col md={12} sm={24}>
                <FormItem
                  style={{ width: "100%" }}
                  {...formItemLayout}
                  label="Hide columns"
                >
                  <ColumnFilter
                    columns={columns}
                    onChange={this.handleColumns}
                  />
                </FormItem>
              </Col>
            </Row>
            {error && <Alert message={error.message} type="error" />}
          </div>
          {!error && (
            <Table
              size="middle"
              columns={columns}
              dataSource={data}
              loading={loading}
              scroll={{ x: `${columns.length * 120}px` }}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          )}
        </div>
      </Layout>
    );
  }
}

const mapContextToProps = ({
  user,
  datasetType,
  datasetOrigin,
  catalogueKey,
}) => ({ user, datasetType, datasetOrigin, catalogueKey });

export default withContext(mapContextToProps)(DatasetList);
