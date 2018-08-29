import ryan from "./meeting.gif";
import "./App.css";
import 'react-datepicker/dist/react-datepicker.css';

import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { ButtonToolbar, Button } from 'react-bootstrap';

import DayTimeTable from "./components/DayTimeTable";
import ReservationForm from "./components/ReservationForm";
import CancelForm from "./components/CancelForm";
import {
  interval,
  min,
  max,
  displayCell,
  calcHeight,
  displayHeader,
  isActive,
  showTime,
  key
} from "./utils/DayTimeTableUtils";
import {
  NORMAL,
  INVALID_RESERVATION,
  INVALID_DELETE
} from './utils/ErrorEnums';

const colors = ['red', 'yellow', 'pink', 'green', 'yellow', 'orange', 'blue'];
const endPoint = 'http://localhost:8081/api/booking-system/';
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      startDate: moment('2018-08-22'),
      dataArr: [],
      availableRooms: [],
      postModalIsOpen: false,
      deleteModalIsOpen: false,
      postResponseStatus: NORMAL
    };

    this.onDateChange = this.onDateChange.bind(this);

    this.openPostModal = this.openPostModal.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.closePostModal = this.closePostModal.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);

    this.requestGetReservationApi = this.requestGetReservationApi.bind(this);
    this.requestPostReservationApi = this.requestPostReservationApi.bind(this);
    this.requestDeleteReservationApi = this.requestDeleteReservationApi.bind(this);
  }

  componentDidMount() {
    const currentDate = this.state.startDate.format('YYYY-MM-DD');
    this.requestGetReservationApi(currentDate);
  }

  requestGetReservationApi(date) {
    axios
      .get(`${endPoint}reservation`, {
        params: {
          date: date
        }
      })
      .then(response => {
        const roomsObj = response.data;
        const dataArr = [];
        const availableRooms = [];

        Object.keys(roomsObj).forEach(roomName => {
            availableRooms.push(roomName);
            let data = {name: roomName, info: []}
            const resrvationsObj = roomsObj[roomName]
            for (let i in resrvationsObj) {
              const schedule = {};
              const randomColor = colors[Math.floor(Math.random()*colors.length)];

              schedule['text'] = this.getScheduleHtml(resrvationsObj[i]);
              schedule['start'] = moment(resrvationsObj[i].startAt, 'HH:mm').format("h:mma");
              schedule['end'] = moment(resrvationsObj[i].endAt, 'HH:mm').format("h:mma");
              schedule['props'] = {
                style: {
                  backgroundColor: randomColor,
                  textAlign: "center"
                }
              }
              data.info.push(schedule);
            }
            dataArr.push(data);
        });
        this.setState({
          dataArr: dataArr,
          availableRooms: availableRooms
        });
      })
      .catch(error => {
        console.log(error);
        const dataArr = [];
        const availableRooms = [];

        axios
          .get(`${endPoint}room`, {})
          .then(response => {
            response.data.forEach(roomName => {
              availableRooms.push(roomName);
              let data = {name: roomName, info: []}
              dataArr.push(data);
            })
            this.setState({
              dataArr: dataArr,
              availableRooms: availableRooms
            });
          })
          .catch(error => { console.log(error); });
      });
  }

  requestPostReservationApi(data) {
    const selectedDate = this.state.startDate.format('YYYY-MM-DD');
    const bodyFormData = new FormData();
    bodyFormData.set('roomName', data.roomName);
    bodyFormData.set('userName', data.userName);
    bodyFormData.set('date', selectedDate);
    bodyFormData.set('startAt', data.startTime);
    bodyFormData.set('endAt', data.endTime);
    bodyFormData.set('repCnt', data.repCnt);

    axios({
      method: 'post',
      url: `${endPoint}reservation`,
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(response => {
      this.requestGetReservationApi(selectedDate);
      this.closePostModal();
      this.setState({ postResponseStatus: NORMAL })
    })
    .catch(error => {
      console.log(error);
      this.setState({ postResponseStatus: INVALID_RESERVATION })
    });
  }

  requestDeleteReservationApi(reservationId) {
    const selectedDate = this.state.startDate.format('YYYY-MM-DD');

    axios.delete(`${endPoint}reservation`, {
      params: { reservationId: reservationId }
    })
    .then(response => {
      this.requestGetReservationApi(selectedDate);
      this.closeDeleteModal()
      this.setState({ deleteResponseStatus: NORMAL })
    })
    .catch(error => {
      console.log(error);
      this.setState({ deleteResponseStatus: INVALID_DELETE })
    });
  }


  getScheduleHtml(scheduleObj) {
    return (
      <div style={{color:"#222"}}>
        <p>예약번호: {scheduleObj.id}</p>
        <p>사용자: {scheduleObj.user}</p>
        <p>반복횟수: {scheduleObj.repCnt}</p>
      </div>
    )
  }

  onDateChange(date) {
    this.setState({
      startDate: date,
      dataArr: []
    });
    const requestDate = date.format('YYYY-MM-DD');
    this.requestGetReservationApi(requestDate);
  }

  openPostModal() {
   this.setState({postModalIsOpen: true});
  }

  closePostModal() {
    this.setState({postModalIsOpen: false});
  }

  openDeleteModal() {
    this.setState({deleteModalIsOpen: true});
  }

  closeDeleteModal() {
    this.setState({deleteModalIsOpen: false});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div style={{"flex":"1", "justifyContent":"center"}}>
            <img src={ryan} className="App-logo-meeting" alt="logo" />
          </div>
          <h1 className="App-title"></h1>
        </header>
        {this.renderSubTitle()}
        {this.renderPostModal()}
        {this.renderDeleteModal()}
        {this.renderDayTimeTable()}
      </div>
    );
  }

  renderSubTitle() {
    return (
      <div className="App-datepicker">
        <div className="leftContainer">
          <DatePicker
            className="form-control datepicker"
            selected={this.state.startDate}
            onChange={this.onDateChange} />
        </div>
        <div className="centerContainer">
          <h1 className="App-title">회의실 예약 시스템</h1>
        </div>
        <div className="rightContainer">
          <ButtonToolbar>
            <Button className="btn-outline-white" onClick={this.openPostModal} bsStyle="primary">회의실 예약</Button>
            <Button className="btn-outline-white" onClick={this.openDeleteModal} bsStyle="danger">예약취소</Button>
          </ButtonToolbar>
        </div>
      </div>
    )
  }

  renderPostModal() {
    return (
      <Modal
        isOpen={this.state.postModalIsOpen}
        onRequestClose={this.closePostModal}
        style={customStyles} >
        <ReservationForm
          responseStatus={this.state.postResponseStatus}
          availableRooms={this.state.availableRooms}
          shouldRefresh={this.state.postModalIsOpen}
          onReserve={this.requestPostReservationApi}
          onCancel={this.closePostModal} />
      </Modal>
    );
  }

  renderDeleteModal() {
    return (
      <Modal
        isOpen={this.state.deleteModalIsOpen}
        onRequestClose={this.closeDeleteModal}
        style={customStyles} >
        <CancelForm
          responseStatus={this.state.deleteResponseStatus}
          shouldRefresh={this.state.deleteModalIsOpen}
          onDelete={this.requestDeleteReservationApi}
          onCancel={this.closeDeleteModal} />
      </Modal>
    );
  }

  renderDayTimeTable() {
    return (
      <DayTimeTable
        cellKey={key}
        calcCellHeight={calcHeight}
        showHeader={displayHeader}
        showCell={displayCell}
        showTime={showTime}
        isActive={isActive}
        max={max}
        min={min}
        data={this.state.dataArr}
        rowNum={(max - min) / interval}
        valueKey="info">
      </DayTimeTable>
    )
  }
}


export default App;
