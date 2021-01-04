import React from 'react';
import './App.css';
import Card from 'react-bootstrap/Card';
import Rate from './Rate'
import Button from 'react-bootstrap/Button';

class PrevCourse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        }
    }
    getRating(courseNum){
        let ratings = this.props.ratings
        for(const i in ratings){
            if(ratings[i].courseNum === courseNum){
                return ratings[i].rating;
            }
        }
    }
    render() {
        return (
            <Card style={{ width: '33%', marginTop: '5px', marginBottom: '5px' }}>
                <Card.Body>
                    <Card.Title>
                        <div style={{ maxWidth: 250 }}>
                            {this.props.data.name}
                        </div>
                        {this.getExpansionButton()}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{this.props.data.number} - {this.getCredits()}</Card.Subtitle>
                    {this.getDescription()}
                    <p style={{fontWeight:"bold"}}>Current Rating: {this.getRating(this.props.data.number)}</p>
                    <Rate data={this.props.data} setRatings={this.props.setRatings}/>
                </Card.Body>
            </Card>
        )
    }

    setExpanded(value) {
        this.setState({ expanded: value });
    }

    getExpansionButton() {
        let buttonText = '▼';
        let buttonOnClick = () => this.setExpanded(true);

        if (this.state.expanded) {
            buttonText = '▲';
            buttonOnClick = () => this.setExpanded(false)
        }

        return (
            <Button variant='outline-dark' style={{ width: 25, height: 25, fontSize: 12, padding: 0, position: 'absolute', right: 20, top: 20 }} onClick={buttonOnClick}>{buttonText}</Button>
        )
    }

    getDescription() {
        if (this.state.expanded) {
            return (
                <div>
                    {this.props.data.description}
                </div>
            )
        }
    }

    getCredits() {
        if (this.props.data.credits === 1)
            return '1 credit';
        else
            return this.props.data.credits + ' credits';
    }
}

export default PrevCourse;
