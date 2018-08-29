import React from "react"
import { Component } from "react"
import { ButtonToolbar, Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import {
  NORMAL,
  INVALID_DELETE
} from '../utils/ErrorEnums';

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

class CancelForm extends Component {
    constructor(props) {
      super(props)
      this.state = {
        shouldRefresh: props.shouldRefresh,
        reservationId: "",
        status: NORMAL
      };
      this.onClickDelete = this.onClickDelete.bind(this);
      this.onReservationIdChange = this.onReservationIdChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.shouldRefresh !== this.state.shouldRefresh) {
        this.setState({
          shouldRefresh: nextProps.shouldRefresh,
          reservationId: "",
          status: NORMAL
        });
      }
      if (nextProps.responseStatus === INVALID_DELETE) {
        this.setState({ status: INVALID_DELETE })
      }
      console.log("예약취소폼 값 초기화")
    }

    onReservationIdChange(event) {
      this.setState({reservationId: event.target.value});
    }

    onClickDelete() {
      if (this.validateDeleteForm()) {
        this.props.onDelete(this.state.reservationId);
      }
    }

    validateDeleteForm() {
      if (this.state.reservationId === null || this.state.reservationId === undefined || this.state.reservationId === "") {
        console.log("예약번호 에러..");
        console.log(this.state.reservationId);
        return false;
      }
      return true;
    }

    renderMessage() {
      if (this.state.status === NORMAL) {
        return (
          <div><p>취소할 예약번호를 입력해주세요.</p></div>
        );
      } else if (this.state.status === INVALID_DELETE) {
        return (
          <div><p style={{"color": "red"}}>없는 예약번호에요 ㅠㅠ</p></div>
        );
      }
    }

    render() {
      return (
        <div>
          <div>
            {this.renderMessage()}
          </div>
          <form>
            <FieldGroup
              id="formControlsText"
              type="number"
              label="예약번호"
              onChange={this.onReservationIdChange}
              placeholder="삭제할 예약번호를 입력하세요." />
          </form>
          <ButtonToolbar>
            <Button bsStyle="danger" onClick={this.props.onCancel}>돌아가기</Button>
            <Button onClick={this.onClickDelete}>취소하기</Button>
          </ButtonToolbar>
        </div>
      )
    }
}

export default CancelForm
