import React, { Component } from 'react'
import ShippingContract from '../../../build/contracts/Shipping.json'
// import OpenShipmentsContainer from '../../ui/openshipments/OpenShipmentsContainer'
import CreateShipmentContainer from '../../ui/createshipment/CreateShipmentContainer'
import store from '../../store'
import { Button, Collapse, Card, CardBody, Container, 
  Row, Col, InputGroup, InputGroupAddon, 
  InputGroupText, Input, Table } from 'reactstrap'

const contract = require('truffle-contract')

class Dashboard extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    this.state = { collapsed: [],
      arr: [11, 22, 33, 45, 52, 61],
      stub: {
        shippingList: [
          {
            shippingCost: 14,
            isTaken: false,
            licensePlate: "",
            pickupAddress: "382 Whitney Ave.",
            deliveryAddress: "56 Victoria St.",
            enRoute: false,
            isShipped: true
          },
          {
            shippingCost: 14,
            isTaken: false,
            licensePlate: "",
            pickupAddress: "31 Kind's College Cir.",
            deliveryAddress: "370 Charles St.",
            enRoute: false,
            isShipped: false
          },
          {
            shippingCost: 14,
            isTaken: false,
            licensePlate: "",
            pickupAddress: "45 Richmond St. W.",
            deliveryAddress: "12 Banff Ave.",
            enRoute: true,
            isShipped: false
          }
        ]
      },
      var: '',
      shipments: [
        ["0x0", "", "0x000000000s0000000000000000000000000000000", 123, "123dsa", "ad1", "ad2", false, false]],
      transporterData: []
    };

    this.toggle = this.toggle.bind(this);
    this.getShipmentColour = this.getShipmentColour.bind(this);
    this.getExpandButton = this.getExpandButton.bind(this);
    this.getShipments = this.getShipments.bind(this);
    this.getShipmentState = this.getShipmentState.bind(this);
  }

  componentDidMount() {
    var temp = [];
    for (var i = 0; i < this.state.stub.shippingList.length; i++) {
      temp.push(true);
    }
    this.setState({ collapsed: temp });
    this.getShipments()
  }

  toggle(i) {
    var temp = this.state.collapsed;
    temp[i] = !temp[i];
    this.setState({ collapsed: temp });
  }

  getShipmentState(i) {
    var s = this.state.shipments[i];
    if (s[2] == "0x0000000000000000000000000000000000000000" && !s[7]) { // CONTRACT FREE, but no transporter
      return 0;
    } else if (s[2] != "0x0000000000000000000000000000000000000000" && !s[7]) { // CONTRACT FREE AND TRANSPORTER OFFER
      return 1;
    } else if (s[7] && !s[8]) { // delivery IN PROGRESS
      return 2;
    } else if (s[8]) { // These are DONE
      return 3
    }
    return 4;
  }

  getShipmentColour(i) {
    var colour = "#000";
    var sState = this.getShipmentState(i);
    if (sState === 0) { // CONTRACT FREE, but no transporter
      colour = "#43A047"; // GREEN
    } else if (sState === 1) { // CONTRACT FREE AND TRANSPORTER OFFER
      colour = "#757575" // GREY
    } else if (sState === 2) { // delivery IN PROGRESS
      colour =  "#F4511E"; // ORANGE
    } else if (sState === 3) { // These are DONE
      colour =  "#ffffff"; // WHITE
    }
    return {background: colour};
    
  }

  getExpandButton(i) {
    if (!this.state.stub.shippingList[i].enRoute && !this.state.stub.shippingList[i].isShipped) {
      return (<Button onClick={(evt) => this.toggle(i)}>{this.state.collapsed[i] ? "signup" : "less"}</Button>);
    } else if (this.state.stub.shippingList[i].enRoute) {
      return (<Button onClick={(evt) => this.toggle(i)}>{this.state.collapsed[i] ? "more info" : "less"}</Button>);
    }
    return (<div></div>);
  }

  getExpandedContent(i) {
    var content = (<div></div>);
    if (!this.state.stub.shippingList[i].enRoute && !this.state.stub.shippingList[i].isShipped) { // New Transporter can signup
      content = (
            <Row>
            <Col xs="3">
            <InputGroup>
              <Input placeholder="shipping cost" type="text" />
            </InputGroup>
            </Col>
            <Col xs="3">
            <InputGroup>
              <Input placeholder="license plate" type="text" />
            </InputGroup>
            </Col>
            <Col><Button onClick={(evt) => console.log("TODO")}>confirm</Button></Col>
            </Row>);
    } else if (!this.state.stub.shippingList[i].isShipped) { // Show more info, the shipping is in progress
      content = (
            <Row>
            <Col xs="3">
            Info goes here
            </Col>
            <Col xs="3">
            Other info goes here
            </Col>
            <Col>SIGN OFF on Package received by Receiver GOES HERE </Col>
            </Row>);
    }
    return content;

  }

  getShipments() {
    let web3 = store.getState().web3.web3Instance

    const shipping = contract(ShippingContract)
    shipping.setProvider(web3.currentProvider)

    // Declaring this for later so we can chain functions on Authentication.
    var shippingInstance

    var _this = this;

    // Get current ethereum wallet.
    web3.eth.getCoinbase((error, coinbase) => {
      // Log errors, if any.
      if (error) {
        console.error(error);
      }

      shipping.deployed().then(function(instance) {
        shippingInstance = instance

        let shipmentCount = 0;

        shippingInstance.getShipmentCount.call()
        .then(function(result) {
          console.log('get shipment count')
          console.log(result)
        })

        for (let i = 0; i < 2; i++) {
          shippingInstance.getShipment.call(i)
          .then(function(result) {
            // If no error, login user.
            console.log('getshipmentcount')
            console.log(result)
            var tempArr = _this.state.shipments;
            let tempShipments = tempArr.concat([result]);
            _this.setState({shipments: tempShipments});
            var arr = [];
            console.log(tempShipments.length);
            for (var j = 0; j < tempShipments.length; j++) {
              arr.push({
                licensePlate: ""
              });
            }
            _this.setState({ transporterData: arr });
            // console.log(tempShipments);
            // console.log('test2');
            // debugger
            // return result;
            // return dispatch(loginUser())
          })
          // Attempt to sign up user.
          .catch(function(result) {
            // If error...
          })
        }
      })
    })
  }

  // {this.state.stub.shippingList.map((el, i) => {
  //         return (
  //           <div key={i}>
  //           <Card body inverse style={this.getShipmentColour(i)}><CardBody>
  //           <Row>
  //             <Col xs="1" className="text-center"><strong>${el.shippingCost}</strong></Col>
  //             <Col xs="4" className="text-center">{el.pickupAddress}</Col>
  //             <Col xs="4" className="text-center">{el.deliveryAddress}</Col>
  //             <Col xs="1" className="text-center"></Col>

  //             <Col xs="1">{this.getExpandButton(i)}</Col>
  //           </Row>
  //           <Collapse isOpen={!this.state.collapsed[i]}>
  //           {this.getExpandedContent(i)}
  //           </Collapse>
  //           </CardBody></Card>
  //           </div>
  //           )
  //         })}

  render() {
    return(
      <div>
        <br/><br/><br/><br/>
        <Container>
        <Row style={{ paddingLeft: '20dp'}}>
          <Col xs="1" className="text-center"><strong>Cost</strong></Col>
          <Col xs="4" className="text-center"><strong>Pickup Address</strong></Col>
          <Col xs="4" className="text-center"><strong>Delivery Address</strong></Col>
        </Row><br/>
        
        {this.state.shipments.map((el, i) => {
          return (
            <div key={i}>
              <Card body inverse style={this.getShipmentColour(i)}><CardBody>
              <Row>
                <Col xs="1" className="text-center"><strong>${el[3].toString()}</strong></Col>
                <Col xs="4" className="text-center">{el[5]}</Col>
                <Col xs="4" className="text-center">{el[6]}</Col>
                <Col xs="1" className="text-center"></Col>

                <Col xs="1">{this.getExpandButton(i)}</Col>
              </Row>
              <Collapse isOpen={!this.state.collapsed[i]}>
              {this.getExpandedContent(i)}
              </Collapse>
              </CardBody></Card>
            </div>
            )
        })}
          <CreateShipmentContainer/>
          {this.state.shipments.map((shipment, i) => {
            return (<div key={i}>{shipment[0]}</div>);
          })}
        </Container>
      </div>
    )
  }
}

export default Dashboard
