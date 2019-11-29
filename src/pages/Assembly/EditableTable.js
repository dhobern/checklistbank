import React from "react";
import axios from "axios";
import config from "../../config";
import { Table, Input, Select, InputNumber, Popconfirm, Form } from "antd";
import _ from "lodash";
import withContext from "../../components/hoc/withContext";
const Option = Select.Option
const { MANAGEMENT_CLASSIFICATION } = config;

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    const {record} = this.props;
    if (this.props.dataIndex === "estimate") {
      return <InputNumber />;
    } else if(this.props.dataIndex === "type"){
        return <Select>
            {['described species living', 'described species fossil', 'estimated species'].map(o => <Option key={o} value={o}>{o}</Option>)}
        </Select>
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: ['estimate', 'type'].indexOf(dataIndex) > -1,
                  message: `Please Input ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], editingKey: "" };
    this.columns = [
      {
        title: "estimate",
        dataIndex: "estimate",
        width: "25%",
        editable: true,
        render: (text, record) => text ? text.toLocaleString('en-GB') : ""
      },

      {
        title: "reference",
        dataIndex: "reference",
        width: "50%",
        editable: false
      },
      {
        title: "type",
        dataIndex: "type",
        width: "50%",
        editable: true
      },
      {
        title: "note",
        dataIndex: "note",
        width: "50%",
        editable: true
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    href="javascript:;"
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    Save
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => this.cancel(record.key)}
              >
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <span>
              <a
                disabled={editingKey !== ""}
                onClick={() => this.edit(record.key)}
              >
                Edit
              </a>
              {" | "}
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => this.delete(record.key)}
              >
                <a>Delete</a>
              </Popconfirm>
            </span>
          );
        }
      }
    ];
  }

  componentWillMount = () => {
    const { data } = this.props;

    this.decorateEstimatesWithReference(data);
    
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps;

    this.decorateEstimatesWithReference(data);
    
  };


  decorateEstimatesWithReference = (data) => {
    const {catalogueKey} = this.props;
    if (_.isArray(data)) {
        Promise.all(
          data.filter(a => !_.isUndefined(a.referenceId)).map(d =>
            axios(
              `${config.dataApi}dataset/${
                catalogueKey
              }/reference/${d.referenceId}`
            ).then(res => {
                d.reference = res.data.citation
            }).catch(err => {
                // 
            })
          )
        ).then(() => {
            this.setState({ data })
        });
      } else {
        this.setState({ data: [] });
      }
  }
  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: "" });
  };
  delete = (key) => {

    const newData = [...this.state.data];
    const index = newData.findIndex(item => key === item.key);
      const item = newData[index];
      newData.splice(index, 1);
  


  axios.delete(`${config.dataApi}estimate/${key}`)
  .then(res => {
    this.setState({ data: newData, editingKey: "" });
    if(typeof this.props.onDataUpdate === 'function'){
        this.props.onDataUpdate(newData)
    }
  })
  .catch(err => {
    this.setState({ editingKey: "" });
      alert(err)
  })

  }
  save = (form, key) => {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
        const index = newData.findIndex(item => key === item.key);
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row
          });
      


      axios.put(`${config.dataApi}estimate/${key}`, {...item, ...row})
      .then(res => {
        this.setState({ data: newData, editingKey: "" });
        if(typeof this.props.onDataUpdate === 'function'){
            this.props.onDataUpdate(newData)
        }
      })
      .catch(err => {
        this.setState({ editingKey: "" });
          alert(err)
      })



    });
  };

  edit = key => {
    this.setState({ editingKey: key });
  };

  render = () => {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === "estimate" ? "number" : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={{
            onChange: this.cancel
          }}
        />
      </EditableContext.Provider>
    );
  };
}


const mapContextToProps = ({ catalogueKey }) => ({ catalogueKey });
const WrappedEditableFormTable = Form.create()(
  withContext(mapContextToProps)(WrappedEditableFormTable)
);

export default WrappedEditableFormTable;
