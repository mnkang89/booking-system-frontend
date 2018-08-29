import ryanHello from "../ryanHello.gif";
import ryanSad from "../ryanSad.gif";

import React from "react"
import { Component } from "react"
import { ButtonToolbar, Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import {
  NORMAL,
  INVALID_FORM,
  INVALID_RESERVATION,

  ROOM_NAME_ERROR,
  USER_NAME_ERROR,
  START_TIME_ERROR,
  END_TIME_ERROR,
  TIME_RANGE_ERROR,
  REP_COUNT_ERROR
} from '../utils/ErrorEnums';

const format = 'h:mm a';
const now = moment().hour(0).minute(0);

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

class ReservationForm extends Component {
    constructor(props) {
      super(props)
      this.state = {
        shouldRefresh: props.shouldRefresh,
        showRepCnt: false,
        roomName: "RYAN",
        userName: "",
        startTime: "0:00",
        endTime: "0:00",
        repCnt: 0,
        type: "",
        status: NORMAL,
        formStatus: NORMAL
      };

      this.onClickReserve = this.onClickReserve.bind(this);
      this.validateReservationForm = this.validateReservationForm.bind(this);
      this.setFormErrorStatus = this.setFormErrorStatus.bind(this);

      this.onUserNameChange = this.onUserNameChange.bind(this);
      this.onMeetingRoomNameChange = this.onMeetingRoomNameChange.bind(this);
      this.onReservationTypeChange = this.onReservationTypeChange.bind(this);
      this.onRepCntChange = this.onRepCntChange.bind(this);
      this.onStartTimeChange = this.onStartTimeChange.bind(this);
      this.onEndTimeChange = this.onEndTimeChange.bind(this);
    }

    onClickReserve() {
      if (this.validateReservationForm()) {
        this.props.onReserve(this.state);
      }
    }

    validateReservationForm() {
      if (this.state.roomName === null || this.state.roomName === undefined || this.state.roomName === "") {
        console.log("회의실 이름 에러..");
        console.log(this.state.roomName);
        this.setFormErrorStatus(ROOM_NAME_ERROR)
        return false;
      }

      if (this.state.userName === null || this.state.userName === undefined || this.state.userName === "") {
        console.log("이름 에러..");
        console.log(this.state.userName);
        this.setFormErrorStatus(USER_NAME_ERROR)
        return false;
      }
      if (this.state.startTime === null || this.state.startTime === undefined || this.state.startTime === "") {
        console.log("시작 에러..");
        console.log(this.state.startTime);
        this.setFormErrorStatus(START_TIME_ERROR)
        return false;
      }
      if (this.state.endTime === null || this.state.endTime === undefined || this.state.endTime === "") {
        console.log("종료 에러..");
        console.log(this.state.endTime);
        this.setFormErrorStatus(END_TIME_ERROR)
        return false;
      }
      if (moment(this.state.endTime, "H:mm") <= moment(this.state.startTime, "H:mm")) {
        console.log("시간레인지 에러..");
        console.log(this.state.startTime);
        console.log(this.state.endTime);
        this.setFormErrorStatus(TIME_RANGE_ERROR)
        return false;
      }
      if (parseInt(this.state.repCnt) < 0) {
        console.log("렙카운트 에러..");
        console.log(this.state.repCnt);
        this.setFormErrorStatus(REP_COUNT_ERROR)
        return false;
      }
      return true;
    }

    setFormErrorStatus(formStatus) {
      this.setState({
        status: INVALID_FORM,
        formStatus: formStatus
      });
    }

    onMeetingRoomNameChange(event) {
      this.setState({roomName: event.target.value});
    }

    onUserNameChange(event) {
      this.setState({userName: event.target.value});
    }

    onStartTimeChange(value) {
      if (value === null || value === undefined) return;
      this.setState({startTime: value.format('HH:mm:00')});
    }

    onEndTimeChange(value) {
      if (value === null || value === undefined) return;
      this.setState({endTime: value.format('HH:mm:00')});
    }

    onRepCntChange(event) {
      this.setState({repCnt: event.target.value});
    }

    onReservationTypeChange(event) {
      this.setState({type: event.target.value});
      if (event.target.value === "REPEATABLE") {
        this.setState({showRepCnt: true});
      } else {
        this.setState({showRepCnt: false});
      }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.shouldRefresh !== this.state.shouldRefresh) {
        this.setState({
          shouldRefresh: nextProps.shouldRefresh,
          showRepCnt: false,
          roomName: "RYAN",
          userName: "",
          startTime: "0:00",
          endTime: "0:00",
          repCnt: 0,
          type: "",
          status: NORMAL,
          formStatus: NORMAL
        });
      }
      if (nextProps.responseStatus === INVALID_RESERVATION) {
        this.setState({ status: INVALID_RESERVATION })
      }
      console.log("예약신청폼 값 초기화");
    }

    renderRyan() {
      if (this.state.status === INVALID_RESERVATION) {
        return (<img src={ryanSad} className="App-logo" alt="logo" />);
      } else {
        return (<img src={ryanHello} className="App-logo" alt="logo" />);
      }
    }

    renderMessage() {
      if (this.state.status === NORMAL) {
        return (
          <div><p>아래 신청양식을 입력해주세요.</p></div>
        );
      } else if (this.state.status === INVALID_FORM) {
        return this.renderInvalidFormMessage();
      } else if (this.state.status === INVALID_RESERVATION) {
        return (
          <div><p style={{"color": "red"}}>신청이 불가능한 예약이에요 ㅠㅠ</p></div>
        );
      }
    }

    renderInvalidFormMessage() {
      if (this.state.formStatus === ROOM_NAME_ERROR) {
        return (
          <div><p style={{"color": "red"}}>회의실이름이 올바르지 않아요.</p></div>
        );
      } else if (this.state.formStatus === USER_NAME_ERROR) {
        return (
          <div><p style={{"color": "red"}}>이름이 올바르지 않아요.</p></div>
        );
      } else if (this.state.formStatus === START_TIME_ERROR) {
        return (
          <div><p style={{"color": "red"}}>시작시간 입력이 올바르지 않아요.</p></div>
        );
      } else if (this.state.formStatus === END_TIME_ERROR) {
        return (
          <div><p style={{"color": "red"}}>종료시간 입력이 올바르지 않아요..</p></div>
        );
      } else if (this.state.formStatus === TIME_RANGE_ERROR) {
        return (
          <div><p style={{"color": "red"}}>시간범위가 올바르지 않아요.</p></div>
        );
      } else if (this.state.formStatus === REP_COUNT_ERROR) {
        return (
          <div><p style={{"color": "red"}}>반복횟수가 올바르지 않아요.</p></div>
        );
      }
    }

    render() {
      return (
        <div>
          <div style={{"display": "flex", "justify-content": "center", "align-items": "center"}}>
            <div style={{"flex":"1"}}>
              {this.renderRyan()}
            </div>
            <div style={{"flex":"1"}}>
              {this.renderMessage()}
            </div>
          </div>
          <form>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>회의실</ControlLabel>
              <FormControl componentClass="select" placeholder="RYAN" onChange={this.onMeetingRoomNameChange}>
                {this.props.availableRooms.map(availableRoom => <option value={availableRoom}>{availableRoom}</option> )};
              </FormControl>
            </FormGroup>
            <FieldGroup
              id="formControlsText"
              type="text"
              label="이름"
              onChange={this.onUserNameChange}
              placeholder="사용자 이름을 입력해주세요." />
            <div>
              <ControlLabel>시작-종료</ControlLabel>
              <br/>
              <TimePicker
                showSecond={false}
                defaultValue={now}
                className="xxx"
                onChange={this.onStartTimeChange}
                format={format}
                use12Hours
                minuteStep={30}
                inputReadOnly />
              <TimePicker
                showSecond={false}
                defaultValue={now}
                className="xxx"
                onChange={this.onEndTimeChange}
                format={format}
                use12Hours
                minuteStep={30}
                inputReadOnly />
            </div>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>예약종류</ControlLabel>
              <FormControl componentClass="select" placeholder="단일예약" onChange={this.onReservationTypeChange}>
                <option value="ONE_TIME">단일예약</option>
                <option value="REPEATABLE">반복예약</option>
              </FormControl>
            </FormGroup>
            { this.state.showRepCnt ?
              <FieldGroup
                id="formControlsNumber"
                type="number"
                min="1"
                max="10"
                label="반복횟수"
                onChange={this.onRepCntChange}
                placeholder="반복횟수를 입력해주세요." /> : null }
          </form>
          <div style={{"display": "flex", "justify-content": "center", "align-items": "center"}}>
          <ButtonToolbar>
            <Button bsStyle="danger" onClick={this.props.onCancel}>돌아가기</Button>
            <Button onClick={this.onClickReserve}>신청하기</Button>
          </ButtonToolbar>
          </div>
        </div>
      )
    }
}

export default ReservationForm
