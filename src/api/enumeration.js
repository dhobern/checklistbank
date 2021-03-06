// import axiosInstance from './util/axiosInstance';
import axios from "axios";
import config from "../config";

export const getFrequency = () => {
  return axios(`${config.dataApi}vocab/frequency`).then(
    (res) => res.data //.map(e => e.name)
  );
};

export const getDatasetType = () => {
  return axios(`${config.dataApi}vocab/datasettype`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getDataFormat = () => {
  return axios(`${config.dataApi}vocab/dataformat`).then(
    (res) => res.data //.map(e => e.name)
  );
};

export const getDatasetOrigin = () => {
  return axios(`${config.dataApi}vocab/datasetorigin`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getRank = () => {
  return axios(`${config.dataApi}vocab/rank`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getTaxonomicStatus = () => {
  return axios(`${config.dataApi}vocab/taxonomicstatus`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getIssue = () => {
  return axios(`${config.dataApi}vocab/issue`).then((res) => res.data);
};

export const getNameType = () => {
  return axios(`${config.dataApi}vocab/nametype`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getNameField = () => {
  return axios(`${config.dataApi}vocab/namefield`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getNomStatus = () => {
  return axios(`${config.dataApi}vocab/nomstatus`).then(
    (res) => res.data //.map(e => e.name)
  );
};

export const getLicense = () => {
  return axios(`${config.dataApi}vocab/license`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getNomCode = () => {
  return axios(`${config.dataApi}vocab/nomcode`).then((res) => res.data);
};

export const getImportState = () => {
  return axios(`${config.dataApi}vocab/importstate`).then((res) => res.data);
};

export const getEnvironments = () => {
  return axios(`${config.dataApi}vocab/environment`).then((res) => res.data);
};

export const getSectorImportState = () => {
  return axios(`${config.dataApi}vocab/importstate`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getCountries = () => {
  return axios(`${config.dataApi}vocab/country`).then((res) => res.data);
};

export const getEstimateType = () => {
  return axios(`${config.dataApi}vocab/estimatetype`).then((res) =>
    res.data.map((e) => e.name)
  );
};

export const getDatasetSettings = () => {
  return axios(`${config.dataApi}vocab/setting`).then((res) => res.data);
};

export const getGazetteer = () => {
  return axios(`${config.dataApi}vocab/Gazetteer`).then((res) => res.data);
};

export const getEntitytype = () => {
  return axios(`${config.dataApi}vocab/entitytype`).then((res) => res.data);
};
