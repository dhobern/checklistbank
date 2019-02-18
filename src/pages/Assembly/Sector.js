import React from "react";
import {
  notification,
  Tag,
  Button,
  Tooltip,
  Popover
} from "antd";
import _ from "lodash";
import axios from "axios";
import config from "../../config";
import history from "../../history";
import {stringToColour, titleToAbbrev} from "../../components/util"

const {MANAGEMENT_CLASSIFICATION} = config

class Sector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popOverVisible: false,
      sectorSourceDataset: null
    };
  }

  componentWillMount = () => {
    if (this.props.taxon.sectors && this.props.taxon.sectors.length > 0) {
      axios(
        `${config.dataApi}dataset/${this.props.taxon.sectors[0].datasetKey}`
      )
        .then(res => {
          this.setState({ sectorSourceDataset: res.data });
        })
        .catch(err => {
          this.setState({ sectorSourceDatasetError: err });
        });
    }
  };
  hidePopover = () => {
    this.setState({
      popOverVisible: false
    });
  };
  handleVisibleChange = popOverVisible => {
    this.setState({ popOverVisible });
  };

  syncSector = sector => {
    axios
      .post(`${config.dataApi}assembly/${MANAGEMENT_CLASSIFICATION.key}/sync/sector/${sector.key}`)
      .then(() => {
        this.props.reloadSelfAndSiblings();
        notification.open({
          message: "Sync started",
          description: `Copying taxa from ${
            sector.attachment.name
          } `
        });
      })
      .catch(err => {
        this.setState({ error: err });
      });
  };

  deleteSector = sector => {
    axios
      .delete(`${config.dataApi}sector/${sector.key}`)
      .then(() => {
        this.props.reloadSelfAndSiblings();
        notification.open({
          message: "Sector deleted",
          description: `${
            sector.attachment.name
          } was deleted from the CoL draft`
        });
      })
      .catch(err => {
        this.setState({ error: err });
      });
  };
  render = () => {
    const {
        taxon: { sectors },
        selectedSourceDatasetKey
      } = this.props;
      const sector = _.get(sectors, '[0]') || null
      const { sectorSourceDataset } = this.state;
    return (
    sectorSourceDataset ?  <Popover
        content={
          <div>
            <Button
              style={{ width: "100%" }}
              type="danger"
              onClick={() => {
                this.deleteSector(sector);
              }}
            >
              Delete sector
            </Button>
            <br />
            <Button
              style={{ marginTop: "8px", width: "100%" }}
              type="primary"
              onClick={() => {
                this.syncSector(sector);
              }}
            >
              Sync sector
            </Button>
            <br />
              <Button
              style={{ marginTop: "8px", width: "100%" }}
              type="primary"
              onClick={() =>
                this.props.showSourceTaxon(sector, sectorSourceDataset)
              }
            >
              Show in source tree
            </Button>
            <br /> 
            <Button
              style={{ marginTop: "8px", width: "100%" }}
              type="primary"
              onClick={() => {
                history.push(`dataset/${sectorSourceDataset.key}/meta`);
              }}
            >
              Source Dataset Metadata
            </Button>
          </div>
        }
        title="Sector Options"
        visible={this.state.popOverVisible}
        onVisibleChange={this.handleVisibleChange}
        trigger="click"
        placement="top"
      >
      <Tooltip title={sectorSourceDataset.title} placement="bottom">
         <Tag color={stringToColour(sectorSourceDataset.title)}>{
                        titleToAbbrev(sectorSourceDataset.title)
                      }</Tag>
                      </Tooltip>
      </Popover> : ""
    );
  };
}

export default Sector;