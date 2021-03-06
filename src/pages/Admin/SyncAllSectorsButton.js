import React from "react";

import config from "../../config";
import _ from "lodash";
import { Button, Alert, Popconfirm, notification } from "antd";

import axios from "axios";

class SyncAllSectorsButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      allSectorSyncloading: false
    };
  }

  syncAllSectors = () => {
    this.setState({ allSectorSyncloading: true });
    const {onError} = this.props
    const {dataset, catalogueKey} = this.props;
    const body = dataset ? {datasetKey: dataset.key} : {all: true}
    
    axios
      .post(
        `${config.dataApi}dataset/${catalogueKey}/sector/sync`, body
      )
      .then(res => {
        this.setState({ allSectorSyncloading: false}, () => {
          notification.open({
            message: "Action triggered",
            description: `All sectors syncing${dataset ? ' for dataset: '+dataset.title : ''}`
          });
        });
      })
      .catch(err => {
          if (typeof onError === 'function'){
            onError(err)

          }
          this.setState({ allSectorSyncloading: false })
        });
  };

  render = () => {
    const { allSectorSyncloading } = this.state;
    const {text} = this.props
    return (
      <React.Fragment>
        <Popconfirm
          placement="rightTop"
          title="Sync all sectors?"
          onConfirm={this.syncAllSectors}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            loading={allSectorSyncloading}
            style={{ marginRight: "10px", marginBottom: "10px" }}
          >
           { text || 'Sync all sectors'}
          </Button>
        </Popconfirm>
      </React.Fragment>
    );
  };
}

export default SyncAllSectorsButton;
