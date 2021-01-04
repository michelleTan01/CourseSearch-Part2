import React from 'react';
import './App.css';
import Form from 'react-bootstrap/Form';
class Rate extends React.Component {
    constructor(props) {
        super(props);
        this.rating = React.createRef();
    }

    setRating() {
        if (this.rating.current != null) {
            let course = this.props.data;
            let r = this.rating.current.value;
            this.props.setRatings(course, r)
        }
    }
    getRating() {
        let ratings = []
        let temp = "";
        ratings.push(<option key={0}>{"No Rating"}</option>)
        for (let i = 1; i <= 5; i++) {
            temp = temp.concat("★") ;
            ratings.push(<option key={i}>{temp}</option>);
        }
        return ratings;
    }

    render() {
        return (
            <Form.Group controlId="rating">
                <Form.Label>Rate the Course: </Form.Label>
                <Form.Control as="select" ref={this.rating} onChange={() => this.setRating()}>
                    {this.getRating()}
                </Form.Control>
            </Form.Group>
        )
    }
}
export default Rate;