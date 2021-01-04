import React from 'react';
import './App.css';
import PrevCourse from './PrevCourse';

class PrevCourseArea extends React.Component {
    getCourses() {
        let courses = [];
        for (let i = 0; i < this.props.data.length; i++) {
            courses.push(
                <PrevCourse key={i} data={this.props.data[i]} courseKey={this.props.data[i].number} ratings = {this.props.ratings} setRatings={this.props.setRatings} />
            )
        }
        return courses;
    }
    
    shouldComponentUpdate(nextProps) {
        return true;
    }

    render() {
        return (
            <div style={{ margin: 5, marginTop: -5 }}>
                {this.getCourses()}
            </div>
        )
    }
}

export default PrevCourseArea;
